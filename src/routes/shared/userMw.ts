/**
 * Middleware to verify user logged in.
 */

import { Request, Response, NextFunction } from 'express';
import { JwtPayload } from 'jsonwebtoken';

import HttpStatusCodes from '@src/declarations/major/HttpStatusCodes';
import EnvVars from '@src/declarations/major/EnvVars';
import jwtUtil from '@src/util/jwt-util';
import { User } from '@src/models/User';

// **** Variables **** //
const jwtNotPresentErr = 'JWT not present in signed cookie.';

// **** Types **** //

export interface ISessionUser extends JwtPayload {
  id: number;
  email: string;
  name: string;
  rank: User['rank'];
}

// **** Functions **** //

/**
 * See note at beginning of file.
 */
async function userMw(req: Request, res: Response, next: NextFunction) {
  // Extract the token
  const cookieName = EnvVars.cookieProps.key,
    jwt = req.signedCookies[cookieName];
  if (!jwt) {
    return res
      .status(HttpStatusCodes.UNAUTHORIZED)
      .json({ error: jwtNotPresentErr });
  }
  // Make sure user role is at least 2 (normal user)
  const clientData = await jwtUtil.decode<ISessionUser>(jwt);
  if (typeof clientData === 'object' && clientData.rank >= 2) {
    res.locals.sessionUser = clientData;
    return next();
  }
}

// **** Export Default **** //

export default userMw;
