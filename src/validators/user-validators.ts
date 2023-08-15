import { body } from 'express-validator';

interface UserCreationBody {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  dob: Date;
}

interface UserLoginBody {
  username?: string;
  email?: string;
  password: string;
}

export const validateUserCreation = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 20 })
    .withMessage('*Username must contain between 3 to 20 characters.')
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
      const rBody = req.body as UserCreationBody;
      if (value !== rBody.password) {
        throw new Error(
          '*Password confirmation does not match the original password. Please ensure both passwords are the same.',
        );
      }
      return true;
    })
    .escape(),
  body('dob')
    .toDate()
    .custom((value, { req }) => {
      const rBody = req.body as UserCreationBody;
      function isOverThirteen(birthday: Date) {
        const ageDifMs = Date.now() - birthday.getTime();
        const ageDate = new Date(ageDifMs);
        const age = Math.abs(ageDate.getUTCFullYear() - 1970);
        return age >= 13;
      }
      if (rBody.dob) {
        if (!isOverThirteen(rBody.dob)) {
          throw new Error(
            "*We're sorry, but you need to be at least 13 years old to use this site. Please come back when you're old enough!",
          );
        } else return true;
      } else throw new Error('*Please enter a valid date.');
    })
    .escape(),
];

export const validateLogin = [
  body('email')
    .optional()
    .isEmail()
    .custom((value, { req }) => {
      const rBody = req.body as UserLoginBody;

      if (!rBody.email && !rBody.username) {
        throw new Error('A username or email must be provided.');
      } else return true;
    })
    .escape(),
  body('username')
    .optional()
    .trim()
    .isLength({ min: 3, max: 20 })
    .withMessage(
      "We couldn't verify your credentials. Please ensure that your Username/Email and password are entered correctly and try again",
    )
    .matches(/^(?=.*[a-zA-Z])[a-zA-Z0-9_-]+$/)
    .withMessage(
      "We couldn't verify your credentials. Please ensure that your Username/Email and password are entered correctly and try again",
    ),
  body('password')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&;:])[A-Za-z\d@$!%*?&;:]{8,}$/,
    )
    .withMessage(
      "We couldn't verify your credentials. Please ensure that your Username/Email and password are entered correctly and try again",
    ),
];
