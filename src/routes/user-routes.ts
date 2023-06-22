import HttpStatusCodes from '@src/declarations/major/HttpStatusCodes';

import userService from '@src/services/user-service';
import { EditableUser, User } from '@src/models/User';
import { IReq, IRes } from './shared/types';
import { validationResult } from 'express-validator';
import httpStatusCodes from '@src/declarations/major/HttpStatusCodes';
import pwdUtil from '@src/util/pwd-util';
import UserF from '@src/models/User';

// **** Variables **** //

// Paths
const paths = {
  basePath: '/users',
  get: '/all',
  add: '/add',
  update: '/update',
  delete: '/delete/:id',
} as const;

// **** Functions **** //

/**
 * Get all users.
 */
async function getAll(_: IReq, res: IRes) {
  const users = await userService.getAll();
  return res.status(HttpStatusCodes.OK).json({ users });
}

/**
 * Add one user.
 */
async function add(req: IReq<EditableUser>, res: IRes) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    return res.status(httpStatusCodes.BAD_REQUEST).end();
  }

  const user = UserF.new(
    req.body.username,
    req.body.email,
    undefined,
    undefined,
    await pwdUtil.getHash(req.body.password),
  );
  await userService.addOne(user);
  return res.status(HttpStatusCodes.CREATED).end();
}

/**
 * Update one user.
 */
async function update(req: IReq<{ user: User }>, res: IRes) {
  const { user } = req.body;
  await userService.updateOne(user);
  return res.status(HttpStatusCodes.OK).end();
}

/**
 * Delete one user.
 */
async function _delete(req: IReq, res: IRes) {
  const id = +req.params.id;
  // await userService.delete(id);
  return res.status(HttpStatusCodes.OK).end();
}

// **** Export default **** //

export default {
  paths,
  getAll,
  add,
  update,
  delete: _delete,
} as const;
