/*  eslint-disable @typescript-eslint/no-unsafe-member-access */

import './setup/index';
import { db as mockDB } from './setup/initialisePostgresDB';
import { db } from '@src/config/database';
import request from 'supertest';
import app from './setup/server';
import httpStatusCodes from '@src/declarations/major/HttpStatusCodes';

jest.spyOn(db, 'query').mockImplementation(mockDB.query);

const userPayload = {
  username: 'test',
  email: 'test@gmail.com',
  password: 'Testtest1;',
  passwordConfirm: 'Testtest1;',
  dob: new Date(2000, 1, 1),
};
const invalidUserPayload = {
  username: '11',
  email: 'test',
  password: 'test',
  confirmPassword: 'test1',
  dob: new Date(1800, 1, 1),
};

const paths = {
  createUser: '/api/users',
  login: '/api/users/login',
};
describe('User Routes', () => {
  beforeAll(async () => {
    await request(app)
      .post(paths.createUser)
      .send({
        ...userPayload,
        username: 'test1',
        email: 'existinguser@gmail.com',
      });
  });

  describe('POST /users', () => {
    it('should return 400 and error array if no body is provided', async () => {
      const res = await request(app).post(paths.createUser);

      expect(res.statusCode).toEqual(httpStatusCodes.BAD_REQUEST);
      expect(res.body.errors.length).toBeGreaterThan(0);
    });

    it('should return 400 and error array if body values are invalid', async () => {
      const res = await request(app)
        .post(paths.createUser)
        .send(invalidUserPayload);

      expect(res.statusCode).toEqual(httpStatusCodes.BAD_REQUEST);
      expect(res.body.errors.length).toBeGreaterThan(0);
    });

    it('should return 409  and error array if email is already taken', async () => {
      const res = await request(app)
        .post(paths.createUser)
        .send({
          ...userPayload,
          username: 'test11',
          email: 'existinguser@gmail.com',
        });

      expect(res.statusCode).toEqual(httpStatusCodes.CONFLICT);
      expect(res.body.errors.length).toBeGreaterThan(0);
    });

    it('should return 409  and error array if username is already taken', async () => {
      const res = await request(app)
        .post(paths.createUser)
        .send({ ...userPayload, username: 'test1', email: 'test11@gmail.com' });

      expect(res.statusCode).toEqual(httpStatusCodes.CONFLICT);
      expect(res.body.errors.length).toBeGreaterThan(0);
    });

    it('should return 201 if body values are valid, and username & email are unique', async () => {
      const res = await request(app).post(paths.createUser).send(userPayload);

      expect(res.statusCode).toEqual(httpStatusCodes.CREATED);
      expect(res.body.errors).toBeUndefined();
    });
  });

  describe('POST /users/login', () => {
    it('should return 400 and error if required fields are missing or incomplete', async () => {
      // Test case 1: No body provided
      let res = await request(app).post(paths.login).send();
      expect(res.statusCode).toEqual(httpStatusCodes.BAD_REQUEST);
      expect(res.body.errors.length).toBeGreaterThan(0);

      // Test case 2: No username or email provided
      res = await request(app).post(paths.login).send({
        password: 'bob',
      });
      expect(res.statusCode).toEqual(httpStatusCodes.BAD_REQUEST);
      expect(res.body.errors.length).toBeGreaterThan(0);

      // Test case 3: No password provided
      res = await request(app).post(paths.login).send({
        email: 'bob@gmail.com',
      });
      expect(res.statusCode).toEqual(httpStatusCodes.BAD_REQUEST);
      expect(res.body.errors.length).toBeGreaterThan(0);
    });

    it('should return 404 and error array if user with the provided email does not exist', async () => {
      const res = await request(app).post(paths.login).send({
        email: 'nonexistent@gmail.com',
        password: userPayload.password,
      });

      expect(res.statusCode).toEqual(httpStatusCodes.NOT_FOUND);
      expect(res.body.errors.length).toBeGreaterThan(0);
    });

    it('should return 404 and error array if user with the provided username does not exist', async () => {
      const res = await request(app)
        .post(paths.login)
        .send({ username: 'nonexistentuser', password: userPayload.password });

      expect(res.statusCode).toEqual(httpStatusCodes.NOT_FOUND);
      expect(res.body.errors.length).toBeGreaterThan(0);
    });

    it('should return 401 and error array if incorrect password is provided', async () => {
      const res = await request(app).post(paths.login).send({
        email: 'existinguser@gmail.com',
        password: userPayload.password,
      });

      expect(res.statusCode).toEqual(httpStatusCodes.UNAUTHORIZED);
      expect(res.body.errors.length).toBeGreaterThan(0);
    });
  });
});
