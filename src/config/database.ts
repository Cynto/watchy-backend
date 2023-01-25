import { Client } from 'pg';
import '../pre-start'; // Must be the first import
import logger from 'jet-logger';
import EnvVars from '@src/declarations/major/EnvVars';

const client = new Client({
  host: EnvVars.db.host,
  database: EnvVars.db.database,
  user: EnvVars.db.user,
  password: EnvVars.db.password,
});

client.connect((err) => {
  if (err) {
    logger.err(`Connection to Postgres ${EnvVars.db.database} database failed`);
  } else {
    logger.info(
      `Connection to Postgres ${EnvVars.db.database} database was successful`
    );
  }
});
