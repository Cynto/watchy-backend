import { newDb } from 'pg-mem';
import EnvVars from '@src/declarations/major/EnvVars';
import logger from 'jet-logger';
import { PoolClient, QueryResult } from 'pg';

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const { Pool } = newDb().adapters.createPg();

// eslint-disable-next-line @typescript-eslint/no-unsafe-call
const pool = new Pool({
  database: EnvVars.db.database,
  user: EnvVars.db.user,
  password: EnvVars.db.password,
}) as PoolClient;

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
