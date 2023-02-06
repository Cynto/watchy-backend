import { db } from '@src/config/database';
import logger from 'jet-logger';
import crypto from 'node:crypto';

const createUsersTable = async () => {
  try {
    await db.query(
      'CREATE TABLE IF NOT EXISTS USERS(id SERIAL PRIMARY KEY, user_id uuid UNIQUE, username VARCHAR(20) UNIQUE, email VARCHAR(40) UNIQUE, pwdHash VARCHAR(200), rank SMALLINT, created_at TIMESTAMP, updated_at TIMESTAMP )',
      [],
    );
    logger.info('Users table creation was successful');
  } catch (err) {
    logger.err('Users table creation was unsuccessful');
  }
};

export interface User {
  id: number;
  user_id: string;
  username: string;
  email: string;
  pwdHash?: string;
  rank: number;
  created_at: Date;
  updated_at: Date;
}

function _new(
  user_id: string,
  username: string,
  email: string,
  rank?: number,
  pwdHash?: string,
): User {
  return {
    id: -1,
    user_id: crypto.randomUUID(),
    email,
    username,
    rank: rank ?? 1,
    pwdHash: pwdHash ?? '',
    created_at: new Date(),
    updated_at: new Date(),
  };
}

export default {
  new: _new,
  createUsersTable,
} as const;
