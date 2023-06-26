import { Router } from 'express';

import adminMw from './shared/adminMw';
import userMw from '@src/routes/shared/userMw';
import authRoutes from './auth-routes';
import userRoutes from './user-routes';
import { validateUserCreation } from '@src/validators/user-validators';

// **** Init **** //

const apiRouter = Router();

// **** Setup auth routes **** //

const authRouter = Router();

// Login user
authRouter.post(
  authRoutes.paths.login,
  // validation
  authRoutes.login,
);

// Logout user
authRouter.get(authRoutes.paths.logout, authRoutes.logout);

// Add authRouter
apiRouter.use(authRoutes.paths.basePath, authRouter);

// **** Setup user routes **** //

const userRouter = Router();

// Get all users
userRouter.get(userRoutes.paths.get, adminMw, userRoutes.getAll);

// Add one user
userRouter.post(userRoutes.paths.add, validateUserCreation, userRoutes.add);

// Update one user
userRouter.put(
  userRoutes.paths.update,
  userMw,
  // validation
  userRoutes.update,
);

// Delete one user
userRouter.delete(
  userRoutes.paths.delete,
  userMw,
  // validation
  userRoutes.delete,
);

// Add userRouter
apiRouter.use(userRoutes.paths.basePath, userRouter);

// **** Export default **** //

export default apiRouter;
