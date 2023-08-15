import { db } from '@src/config/database';
import logger from 'jet-logger';
import crypto from 'node:crypto';

export const createUsersTable = async () => {
  try {
    await db.query('CREATE EXTENSION IF NOT EXISTS citext;', []);
    await db.query(
      'CREATE TABLE IF NOT EXISTS Users(id SERIAL PRIMARY KEY, user_id uuid UNIQUE, email CITEXT UNIQUE, username CITEXT UNIQUE, pwd_hash VARCHAR(200), rank SMALLINT, dob TIMESTAMP WITH TIME ZONE, verified_email BOOLEAN, privacy_settings jsonb, last_login TIMESTAMP WITH TIME ZONE, created_at TIMESTAMP DEFAULT now() NOT NULL, updated_at TIMESTAMP DEFAULT now() NOT NULL)',
      [],
    );
    logger.info('Users table was created or already exists');
  } catch (err) {
    logger.err('Users table creation was unsuccessful');
    console.log(err);
  }
};

export interface User {
  id: number;
  user_id: string;
  username: string;
  email: string;
  pwd_hash: string;
  rank: number;
  dob: string;
  verified_email: boolean;
  privacy_settings: {
    friends: boolean;
    following: boolean;
  };
  last_login: Date;
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
  pwd_hash?: string,
): User {
  return {
    id: -1,
    user_id: crypto.randomUUID(),
    email,
    username,
    rank: rank ?? 2,
    dob: dob.toISOString(),
    verified_email: false,
    privacy_settings: {
      friends: true,
      following: true,
    },
    last_login: new Date(),
    pwd_hash: pwd_hash ?? '',
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
