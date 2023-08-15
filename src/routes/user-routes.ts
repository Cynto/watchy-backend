import HttpStatusCodes from '@src/declarations/major/HttpStatusCodes';

import userService from '@src/services/user-service';
import { EditableUser, User } from '@src/models/User';
import { IReq, IRes } from './shared/types';
import { validationResult } from 'express-validator';
import httpStatusCodes from '@src/declarations/major/HttpStatusCodes';
import pwdUtil from '@src/util/pwd-util';
import UserF from '@src/models/User';
import { PgMemError, PgQueryError } from '@src/types/pg';
import passport from 'passport';
import { NextFunction } from 'express';
import logger from 'jet-logger';
import jwt from 'jsonwebtoken';
import EnvVars from '@src/declarations/major/EnvVars';

// **** Variables **** //

// Paths
const paths = {
  basePath: '/users',
  add: '',
  login: '/login',
  update: '/:id',
  delete: '/:id',
} as const;

// **** Functions **** //

/**
 * Get all users.
 */
async function getAll(_: IReq, res: IRes) {
  const users = await userService.getAll();
  return res.status(HttpStatusCodes.OK).json({ users });
}

// This function handles the login process
function login(
  req: IReq<{
    username: string | null;
    email: string | null;
    password: string;
  }>,
  res: IRes,
  next: NextFunction,
) {
  // Validate the request using express-validator
  const errors = validationResult(req);

  // If there are validation errors, respond with an error message
  if (!errors.isEmpty()) {
    return res
      .status(httpStatusCodes.UNAUTHORIZED)
      .json({
        status: 401,
        errors: [
          {
            type: 'field',
            msg: "We couldn't verify your credentials. Please ensure that your Username/Email and password are entered correctly and try again",
            path: 'username/email/password',
            location: 'body',
          },
        ],
      })
      .end();
  }

  // Authenticate the user using passport
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  passport.authenticate(
    // Determine whether to use 'email' or 'username' strategy based on the request
    req.body.email ? 'email' : 'username',
    { session: false },
    (err: Error, user: User) => {
      if (err) {
        // Pass any authentication error to the error handler middleware
        next(err);
      }
      if (!user) {
        // If authentication was unsuccessful, respond with an error message
        return res
          .status(httpStatusCodes.UNAUTHORIZED)
          .json({
            status: 401,
            errors: [
              {
                type: 'field',
                msg: "We couldn't verify your credentials. Please ensure that your Username/Email and password are entered correctly and try again",
                path: 'username/email/password',
                location: 'body',
              },
            ],
          })
          .end();
      }
      // Log the user in by creating a JWT and responding with user data and the token
      req.login(user, { session: false }, (err) => {
        if (err) {
          return next(err);
        }
        logger.info(
          `Login for user with user_id: ${user.user_id} was successful`,
        );
        const payload = {
          user_id: user.user_id,
          rank: user.rank,
          username: user.username,
        };
        // Generate JWT
        const token = jwt.sign(payload, EnvVars.jwt.secret, {
          expiresIn: '182d',
        });
        return res
          .status(httpStatusCodes.OK)
          .json({
            user: {
              user_id: user.user_id,
              rank: user.rank,
              username: user.username,
              dob: user.dob,
              verified_email: user.verified_email,
              privacy_settings: user.privacy_settings,
            },
            token,
          })
          .end();
      });
    },
  )(req, res, next); // Call the passport.authenticate middleware with the request, response, and next function
}

// This function handles the addition of a new user to the system.
// It expects an HTTP request (req) containing the user information and
// an HTTP response (res) to send back the result of the operation.

async function add(req: IReq<EditableUser>, res: IRes) {
  // Validate the request data using the express validator validationResult function.
  // If there are validation errors, log them and return a Bad Request response with the errors.
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // console.log(errors);
    return res.status(httpStatusCodes.BAD_REQUEST).json(errors).end();
  }

  // Create a new User object based on the request body data.
  // The password is hashed using the pwdUtil.getHash function, which presumably provides a secure hash.
  const user = UserF.new(
    req.body.username,
    req.body.email,
    new Date(req.body.dob),
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
    let queryErr;
    // If there was an error while adding the user, handle it here.
    if (queryRes instanceof Error && 'code' in queryRes) {
      // If it has a data property, then it is a pg-mem error, used for testing
      if ('data' in queryRes) {
        const pgMemError = queryRes as PgMemError;
        queryErr = {
          ...queryRes,
          detail: pgMemError.data.details,
        };
        // Otherwise, it's just a PG query error
      } else queryErr = queryRes as PgQueryError;

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
      } else if (
        queryErr.code === '23505' &&
        queryErr.detail.includes('email')
      ) {
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
  add,
  login,
  update,
  delete: _delete,
} as const;
