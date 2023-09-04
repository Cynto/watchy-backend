import HttpStatusCodes from '@src/declarations/major/HttpStatusCodes';

import EnvVars from '@src/declarations/major/EnvVars';
import { IReq, IRes } from './shared/types';

// **** Variables **** //

// Paths
const paths = {
  basePath: '',
  login: '/login',
  logout: '/logout',
} as const;

// **** Types **** //

interface ILoginReq {
  email: string;
  password: string;
}

// **** Functions **** //

/**
 * Login a user.
 */

/**
 * Logout the user.
 */
function logout(_: IReq, res: IRes) {
  const { key, options } = EnvVars.cookieProps;
  res.clearCookie(key, options);
  return res.status(HttpStatusCodes.OK).end();
}

// **** Export default **** //

export default {
  paths,

  logout,
} as const;
