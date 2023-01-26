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

pool.connect((err) => {
  if (err) {
    logger.err(`Connection to Postgres ${EnvVars.db.database} database failed`);
  } else {
    logger.info(
      `Connection to Postgres ${EnvVars.db.database} database was successful`
    );
  }
});

export const query = (
  text: string,
  params: [],
  callback: (err: Error, result: QueryResult) => void
) => {
  return pool.query(text, params, callback);
};
