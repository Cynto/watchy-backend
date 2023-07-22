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
  body('passwordConfirm')
    .custom((value, { req }) => {
      const rBody = req.body as ReqBody;
      if (value !== rBody.password) {
        throw new Error('Passwords do not match.');
      }
      return true;
    })
    .trim()
    .escape(),
];
