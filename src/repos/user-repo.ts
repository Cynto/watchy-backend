import { User } from '@src/models/User';
import { db } from '@src/config/database';
import logger from 'jet-logger';

// Get one user
async function getOne(email: string): Promise<User | null | void> {
  try {
    const result = await db.query('SELECT * FROM USERS WHERE email = $1', [
      email,
    ]);
    const user = result.rows[0] as User;
    if (user !== undefined) {
      logger.info('User found successfully');
      return user;
    } else {
      logger.err(`Cannot find user with email: ${email}`);

      return null;
    }
  } catch (err) {
    logger.err(err);
  }
}

async function getAll(): Promise<User[] | null | void> {
  try {
    const result = await db.query('SELECT * FROM USERS', []);
    const users = result.rows as User[];
    if (users[0] !== undefined) {
      logger.info('Users found successfully');
      return users;
    } else {
      logger.err('No users were found');
      return null;
    }
  } catch (err) {
    logger.err(err);
  }
}

async function add(user: User): Promise<void> {
  try {
    await db.query('BEGIN', []);
    const queryText =
      'INSERT INTO Users(user_id, username, email, pwdHash, rank, created_at, updated_at) VALUES($1, $2, $3, $4, $5, $6, $7)';
    await db.query(queryText, [
      user.user_id,
      user.username,
      user.email,
      user.pwdHash,
      user.rank.toString(),
      user.created_at.toString(),
      user.updated_at.toString(),
    ]);
    await db.query('COMMIT', []);
  } catch (e) {
    await db.query('ROLLBACK', []);
  }
}

export default {
  getOne,
  getAll,
  add,
} as const;
