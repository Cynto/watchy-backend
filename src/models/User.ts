import { db } from '@src/config/database';
import logger from 'jet-logger';
import crypto from 'node:crypto';

export const createUsersTable = async () => {
  try {
    await db.query(
      'CREATE TABLE IF NOT EXISTS Users(id SERIAL PRIMARY KEY, user_id uuid UNIQUE, email VARCHAR(254) UNIQUE, username VARCHAR(20) UNIQUE, pwdHash VARCHAR(200), rank SMALLINT, dob TIMESTAMP WITH TIME ZONE, created_at TIMESTAMP DEFAULT now() NOT NULL, updated_at TIMESTAMP DEFAULT now() NOT NULL)',
      [],
    );
    logger.info('Users table was created or already exists');
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
  dob: string;
  created_at: Date;
  updated_at: Date;
}
export interface EditableUser {
  username: string;
  email: string;
  password: string;
  confirmPassword?: string;
  rank?: number;
  dob: Date;
}

function _new(
  username: string,
  email: string,
  dob: Date,
  user_id?: string,
  rank?: number,
  pwdHash?: string,
): User {
  return {
    id: -1,
    user_id: crypto.randomUUID(),
    email,
    username,
    rank: rank ?? 2,
    dob: dob.toISOString(),
    pwdHash: pwdHash ?? '',
    created_at: new Date(),
    updated_at: new Date(),
  };
}

/**
 * See if an object is an instance of User.
 */
function instanceOf(arg: unknown): boolean {
  return (
    !!arg &&
    typeof arg === 'object' &&
    'id' in arg &&
    'user_id' in arg &&
    'email' in arg &&
    'username' in arg &&
    'rank' in arg
  );
}

export default {
  new: _new,
  instanceOf,
} as const;
