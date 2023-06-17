import cookieParser from 'cookie-parser';
import request from 'supertest';
import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';

import 'express-async-errors';

import BaseRouter from '@src/routes/api';
import EnvVars from '@src/declarations/major/EnvVars';
import HttpStatusCodes from '@src/declarations/major/HttpStatusCodes';
import { db } from './initialisePostgresDB';
import createAllTables from '@src/models';

jest.mock('@src/config/database', () => {
  return {
    db: {
      query: () => db.query,
    },
  };
});

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(EnvVars.cookieProps.secret));

app.use('/api', BaseRouter);

describe('User Routes', () => {
  beforeAll(async () => {
    await createAllTables();
  });

  describe('GET /users', () => {
    it('should return 401 ', async () => {
      const res = await request(app).get('/api/users/all');
      console.log(res.body);
    });
  });
});
