import HttpStatusCodes from '@src/declarations/major/HttpStatusCodes';

import userService from '@src/services/user-service';
import { EditableUser, User } from '@src/models/User';
import { IReq, IRes } from './shared/types';
import { validationResult } from 'express-validator';
import httpStatusCodes from '@src/declarations/major/HttpStatusCodes';
import pwdUtil from '@src/util/pwd-util';
import UserF from '@src/models/User';
import { PgError } from '@src/types/pg';

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

// This function handles the addition of a new user to the system.
// It expects an HTTP request (req) containing the user information and
// an HTTP response (res) to send back the result of the operation.

async function add(req: IReq<EditableUser>, res: IRes) {
  // Validate the request data using the express validator validationResult function.
  // If there are validation errors, log them and return a Bad Request response with the errors.
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    return res.status(httpStatusCodes.BAD_REQUEST).json(errors).end();
  }

  // Create a new User object based on the request body data.
  // The password is hashed using the pwdUtil.getHash function, which presumably provides a secure hash.
  const user = UserF.new(
    req.body.username,
    req.body.email,
    undefined,
    undefined,
    await pwdUtil.getHash(req.body.password),
  );

  // Attempt to add the user to the database using the userService.addOne function.
  // The result of the operation is stored in the queryRes variable.
  const queryRes = await userService.addOne(user);

  // If the queryRes is true, it means the user was successfully added.
  // Return a response with the HTTP status code indicating successful creation.
  if (queryRes === true) {
    return res.status(HttpStatusCodes.CREATED).end();
  } else {
    // If there was an error while adding the user, handle it here.

    if (queryRes instanceof Error && 'code' in queryRes) {
      const queryErr = queryRes as PgError;
      // Check if the error is a unique constraint violation (23505 error code).
      // If the unique constraint violation is for the 'username' field, return a Conflict response
      // with a specific error message for the username field.
      if (queryErr.code === '23505' && queryErr.detail.includes('username')) {
        return res
          .status(httpStatusCodes.CONFLICT)
          .json({
            status: 409,
            errors: [
              {
                type: 'field',
                msg: '*This username is unavailable.',
                path: 'username',
                location: 'body',
              },
            ],
          })
          .end();
      } else {
        // If the unique constraint violation is for the 'email' field, return a Conflict response
        // with a specific error message for the email field.
        return res
          .status(httpStatusCodes.CONFLICT)
          .json({
            status: 409,
            errors: [
              {
                type: 'field',
                msg: '*Please use a different email.',
                path: 'email',
                location: 'body',
              },
            ],
          })
          .end();
      }
    }
  }
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
