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

// Check if user with user_id exists in users table
async function persists(user_id: string): Promise<boolean | void> {
  try {
    const res = await db.query('SELECT * FROM Users WHERE user_id = $1', [
      user_id,
    ]);
    if (
      typeof res.rows[0] === 'object' &&
      'id' in res.rows[0] &&
      'user_id' in res.rows[0] &&
      'email' in res.rows[0] &&
      'username' in res.rows[0] &&
      'rank' in res.rows[0]
    ) {
      logger.info(`User with user_id: ${user_id} found successfully`);
      return true;
    } else {
      logger.info(`User with user_id: ${user_id} was not found`);
      return false;
    }
  } catch (e) {
    logger.err(e);
  }
}

// get all users
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

// Add a single user
async function add(user: User): Promise<boolean | Error> {
  try {
    await db.query('BEGIN', []);
    const queryText =
      'INSERT INTO Users(user_id, email, username,  pwdHash, rank, created_at, updated_at) VALUES($1, $2, $3, $4, $5, current_timestamp, current_timestamp)';
    const res = await db.query(queryText, [
      user.user_id,
      user.email,
      user.username,
      user.pwdHash,
      user.rank,
    ]);
    await db.query('COMMIT', []);
    if (res.rowCount > 0) {
      logger.info(
        `User with user_id: ${user.user_id} was successfully created`,
      );
      return true;
    } else return false;
  } catch (e) {
    await db.query('ROLLBACK', []);
    logger.err(e);

    if (e instanceof Error) {
      return e;
    } else return false;
  }
}

// Update a single user
async function update(user: User): Promise<void> {
  try {
    await db.query('BEGIN', []);
    const queryText =
      'UPDATE Users SET username = $1, email = $2, pwdhash = $3, rank = $4, updated_at = $5 WHERE user_id = $6';
    await db.query(queryText, [
      user.username,
      user.email,
      user.pwdHash,
      user.rank,
      new Date(),
      user.user_id,
    ]);
    await db.query('COMMIT', []);
    logger.info(`User with user_id: ${user.user_id} was successfully updated`);
  } catch (e) {
    await db.query('ROLLBACK', []);
    logger.err(e);
  }
}

// Delete a single user
async function _delete(user_id: string): Promise<void> {
  try {
    await db.query('BEGIN', []);
    const queryText = 'DELETE FROM Users WHERE user_id = $1';
    await db.query(queryText, [user_id]);
    await db.query('COMMIT', []);
    logger.info(`User with user_id: ${user_id} was successfully deleted`);
  } catch (e) {
    await db.query('ROLLBACK', []);
    logger.err(e);
  }
}

export default {
  getOne,
  getAll,
  add,
  persists,
  update,
  delete: _delete,
} as const;
