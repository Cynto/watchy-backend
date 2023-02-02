import { db } from '@src/config/database';
import logger from 'jet-logger';

const createUsersTable = async () => {
  try {
    await db.query(
      'CREATE TABLE IF NOT EXISTS USERS(id SERIAL PRIMARY KEY, user_id uuid UNIQUE, username VARCHAR(20) UNIQUE, email VARCHAR(40) UNIQUE, pwdHash VARCHAR(200), rank SMALLINT, created_at TIMESTAMP, updated_at TIMESTAMP )',
      []
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

export default createUsersTable;
