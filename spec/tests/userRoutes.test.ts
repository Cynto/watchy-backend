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

describe('User Routes', () => {
  beforeAll(async () => {});

  describe('POST /users/add', () => {
    beforeAll(async () => {
      await request(app)
        .post('/api/users/add')
        .send({ ...userPayload, username: 'test1', email: 'test1@gmail.com' });
    });

    it('should return 400 and error array if no body is provided', async () => {
      const res = await request(app).post('/api/users/add');

      expect(res.statusCode).toEqual(httpStatusCodes.BAD_REQUEST);
      expect(res.body.errors.length).toBeGreaterThan(0);
    });

    it('should return 400 and error array if body values are invalid', async () => {
      const res = await request(app)
        .post('/api/users/add')
        .send(invalidUserPayload);

      expect(res.statusCode).toEqual(httpStatusCodes.BAD_REQUEST);
      expect(res.body.errors.length).toBeGreaterThan(0);
    });

    it('should return 409  and error array if email is already taken', async () => {
      const res = await request(app)
        .post('/api/users/add')
        .send({ ...userPayload, username: 'test11', email: 'test1@gmail.com' });

      expect(res.statusCode).toEqual(httpStatusCodes.CONFLICT);
      expect(res.body.errors.length).toBeGreaterThan(0);
    });

    it('should return 409  and error array if username is already taken', async () => {
      const res = await request(app)
        .post('/api/users/add')
        .send({ ...userPayload, username: 'test1', email: 'test11@gmail.com' });

      expect(res.statusCode).toEqual(httpStatusCodes.CONFLICT);
      expect(res.body.errors.length).toBeGreaterThan(0);
    });

    it('should return 201 if body values are valid, and username & email are unique', async () => {
      const res = await request(app).post('/api/users/add').send(userPayload);

      expect(res.statusCode).toEqual(httpStatusCodes.CREATED);
      expect(res.body.errors).toBeUndefined();
    });
  });
});
