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

export default {
  getOne,
} as const;
