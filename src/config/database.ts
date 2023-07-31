import '../pre-start'; // Must be the first import
import { Pool, QueryResult } from 'pg';
import logger from 'jet-logger';
import EnvVars from '@src/declarations/major/EnvVars';
import createAllTables from '@src/models';

let poolConfig = {
  host: EnvVars.db.host,
  database: 'postgres', // Connect to the 'postgres' database initially
  user: EnvVars.db.user,
  password: EnvVars.db.password,
};

let pool = new Pool(poolConfig);

const db = {
  query: async (text: string, params: unknown[]): Promise<QueryResult> => {
    const start = Date.now();
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    logger.info(
      `executed query ${text} duration: ${duration}, rows: ${res.rowCount}`,
    );
    return res;
  },
};

const createDatabase = async (dbName: string) => {
  try {
    // Connect to the 'postgres' database to issue the CREATE DATABASE command
    const client = await pool.connect();
    const createDbQuery = `CREATE DATABASE ${dbName}`;
    await client.query(createDbQuery);
    client.release();
    logger.info(`Database '${dbName}' created successfully.`);
  } catch (error) {
    logger.err(error);
    throw error;
  }
};

const connectToDB = async () => {
  try {
    const dbName = EnvVars.db.database;

    // Check if the database exists
    const checkDbQuery = `SELECT 1 FROM pg_database WHERE datname = $1`;
    const values = [dbName];
    const result = await pool.query(checkDbQuery, values);
    const exists = result.rowCount > 0;

    if (!exists) {
      // Create the database if it doesn't exist
      await createDatabase(dbName);
    }
    // Update the pool's config to use the newly created database
    poolConfig = {
      ...poolConfig,
      database: dbName,
    };

    // End the old pool before creating the new one
    await pool.end();
    // Reassign the pool with the updated configuration
    pool = new Pool(poolConfig);

    await pool.connect();
    logger.info(`Connection to Postgres '${dbName}' database was successful.`);
  } catch (err) {
    logger.err(
      `Connection to Postgres '${EnvVars.db.database}' database failed.`,
    );
    throw err;
  }
};
const initializeDB = async () => {
  try {
    await connectToDB();
    await createAllTables();
  } catch (e) {
    logger.err(e);
    throw e;
  }
};
initializeDB();

export { db }; // Export the updated db object
