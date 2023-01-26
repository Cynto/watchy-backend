import userRepo from '@src/repos/user-repo';
import { IUser } from '@src/models/User';
import { RouteError } from '@src/declarations/classes';
import HttpStatusCodes from '@src/declarations/major/HttpStatusCodes';

// **** Variables **** //

export const userNotFoundErr = 'User not found';

// **** Functions **** //

/**
 * Get all users.
 */
function getAll(): Promise<IUser[]> {}

/**
 * Add one user.
 */
function addOne(user: IUser): Promise<void> {}

/**
 * Update one user.
 */
async function updateOne(user: IUser): Promise<void> {}

/**
 * Delete a user by their id.
 */
async function _delete(id: number): Promise<void> {}

// **** Export default **** //

export default {
  getAll,
  addOne,
  updateOne,
  delete: _delete,
} as const;
