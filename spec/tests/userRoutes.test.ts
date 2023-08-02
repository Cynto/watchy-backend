import './setup/index';
import { db } from './setup/initialisePostgresDB';
import request from 'supertest';
import app from './setup/server';

jest.mock('@src/config/database', () => {
  return {
    db: {
      query: () => db.query,
    },
  };
});

const userPayload = {
  username: 'test',
  email: 'test',
  password: 'testtest1',
  confirmPassword: 'testtest1',
};

describe('User Routes', () => {
  beforeAll(async () => {});

  describe('POST /users/add', () => {});
  describe('GET /users/all', () => {
    it('should return 401 and error message if bearer token not present', async () => {
      const res = await request(app).get('/api/users/all');

      expect(res.statusCode).toEqual(401);
      expect(res.body.error).toEqual('JWT not present in signed cookie.');
    });

    it('should return 401 and error message if token is not valid', async () => {
      const res = await request(app).get('/api/users/all').set({
        Authorization: 'Bearer 1',
      });

      expect(res.statusCode).toEqual(401);
      expect(res.body.error).toEqual('JWT not present in signed cookie.');
    });
  });
});
