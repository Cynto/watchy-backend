import { body } from 'express-validator';

interface ReqBody {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export const validateUserCreation = [
  body('username')
    .isLength({ min: 3, max: 20 })
    .withMessage('Username must contain between 3 to 20 characters.')
    .trim()
    .escape(),
  body('email').isEmail().withMessage('Email must be valid.').normalizeEmail(),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must include at least 8 characters.')
    .trim()
    .escape(),
  body('confirmPassword')
    .custom((value, { req }) => {
      const body = req.body as ReqBody;
      if (value !== body.password) {
        throw new Error('Passwords do not match.');
      }
      return true;
    })
    .trim()
    .escape(),
];
