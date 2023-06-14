import { Pool, QueryResult } from 'pg';
import '../pre-start'; // Must be the first import
import logger from 'jet-logger';
import EnvVars from '@src/declarations/major/EnvVars';

const pool = new Pool({
  host: EnvVars.db.host,
  database: EnvVars.db.database,
  user: EnvVars.db.user,
  password: EnvVars.db.password,
});

const connectToDB = async () => {
  try {
    await pool.connect();
    logger.info(
      `Connection to Postgres ${EnvVars.db.database} database was successful`,
    );
  } catch (err) {
    logger.err(`Connection to Postgres ${EnvVars.db.database} database failed`);
  }
};
connectToDB();

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
export { db };
