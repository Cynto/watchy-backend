import { body } from 'express-validator';

interface ReqBody {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export const validateUserCreation = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 16 })
    .withMessage('*Username must contain between 3 to 16 characters.')
    .matches(/^(?=.*[a-zA-Z])[a-zA-Z0-9_-]+$/)
    .withMessage(
      '*Usernames must include at least one letter and can contain numbers, hyphens, and underscores.',
    )
    .escape(),
  body('email')
    .isEmail()
    .withMessage('*Please enter a valid email.')
    .normalizeEmail(),
  body('password')
    .trim()
    .isLength({ min: 8 })
    .withMessage('*Password must contain at least 8 characters.')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&;:])[A-Za-z\d@$!%*?&;:]{8,}$/,
    )
    .withMessage(
      '*Password must be at least 8 characters long and contain at least one alphabetic character, one digit, and one special character from the set @$!%*#?&;',
    )
    .escape(),
  body('passwordConfirm')
    .trim()
    .custom((value, { req }) => {
      const rBody = req.body as ReqBody;
      if (value !== rBody.password) {
        throw new Error(
          '*Password confirmation does not match the original password. Please ensure both passwords are the same.',
        );
      }
      return true;
    })

    .escape(),
];
