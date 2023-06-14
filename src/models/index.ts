import { createUsersTable } from './User';

const createAllTables = async () => {
  await createUsersTable();
};

export default createAllTables;
