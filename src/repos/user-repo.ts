import { User } from '@src/models/User';
import { db } from '@src/config/database';
import logger from 'jet-logger';

// Get one user
async function getOne(user: {
  username: string | null;
  email: string | null;
  user_id: string | null;
}): Promise<{ user: User | null; err: Error | null }> {
  try {
    let queryText = '';
    let params: string[] = [''];

    // Determine the appropriate query based on the provided criteria
    if (user.username) {
      queryText = 'SELECT * FROM USERS WHERE username = $1';
      params = [user.username];
    } else if (user.email) {
      queryText = 'SELECT * FROM USERS WHERE email = $1';
      params = [user.email];
    } else if (user.user_id) {
      queryText = 'SELECT * FROM USERS WHERE user_id = $1';
      params = [user.user_id];
    }

    // Execute the database query
    const result = await db.query(queryText, params);

    if (result.rows[0] !== undefined) {
      // User found in the database
      const userRow = result.rows[0] as User;
      logger.info('User found successfully');
      return { user: userRow, err: null };
    } else {
      // User not found
      logger.err(`Cannot find user.`);
      return { user: null, err: null };
    }
  } catch (err) {
    // Handle and return any errors that occur during the process
    if (err instanceof Error) return { user: null, err };
  }

  // Return null values if no user is found and no errors occurred
  return { user: null, err: null };
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
      'INSERT INTO Users(user_id, email, username,  pwd_hash, rank, dob, verified_email, privacy_settings, last_login, created_at, updated_at) VALUES($1, $2, $3, $4, $5, $6, $7, $8, current_timestamp, current_timestamp, current_timestamp)';
    const res = await db.query(queryText, [
      user.user_id,
      user.email,
      user.username,
      user.pwd_hash,
      user.rank,
      user.dob,
      user.verified_email,
      user.privacy_settings,
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
      user.pwd_hash,
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
