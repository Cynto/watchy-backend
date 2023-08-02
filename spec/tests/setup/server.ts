import cookieParser from 'cookie-parser';

import express, { Request, Response, NextFunction } from 'express';

import 'express-async-errors';

import BaseRouter from '@src/routes/api';
import EnvVars from '@src/declarations/major/EnvVars';
import HttpStatusCodes from '@src/declarations/major/HttpStatusCodes';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(EnvVars.cookieProps.secret));

app.use('/api', BaseRouter);

export default app;
