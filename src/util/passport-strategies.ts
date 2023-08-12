import passport from 'passport';
import { Strategy as JWTStrategy, ExtractJwt } from 'passport-jwt';
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcrypt';
import userService from '@src/services/user-service';
import EnvVars from '@src/declarations/major/EnvVars';

// Create a new LocalStrategy based on the given email or username field
const createNewLocalStrategy = (emailOrUsername: string) => {
  return new LocalStrategy(
    {
      usernameField: emailOrUsername,
    },
    async (emailUsername: string, password: string, done) => {
      let queryRes;

      // Determine whether to query by email or username
      if (emailOrUsername === 'email') {
        queryRes = await userService.findOne({
          email: emailUsername,
          username: null,
          user_id: null,
        });
      } else {
        queryRes = await userService.findOne({
          username: emailUsername,
          email: null,
          user_id: null,
        });
      }

      const { user, err } = queryRes;

      if (err) {
        return done(err);
      }

      if (!user) {
        // No user with that email or username
        return done(null, false, { message: 'Incorrect email or username.' });
      }

      // Compare the provided password with the stored password hash
      bcrypt.compare(password, user.pwd_hash, (err, res) => {
        if (err) {
          return done(err);
        }
        if (res) {
          // Passwords match
          return done(null, user);
        } else {
          // Passwords do not match
          return done(null, false, { message: 'Incorrect password.' });
        }
      });
    },
  );
};

// Use the createNewLocalStrategy function to create LocalStrategies for 'email' and 'username'
passport.use('email', createNewLocalStrategy('email'));
passport.use('username', createNewLocalStrategy('username'));

// Create a JWTStrategy for validating JWT tokens
passport.use(
  new JWTStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: EnvVars.jwt.secret,
    },
    async (
      jwtPayload: {
        user_id: string;
        exp: number;
      },
      done,
    ) => {
      const { user, err } = await userService.findOne({
        user_id: jwtPayload.user_id,
        username: null,
        email: null,
      });

      if (err) {
        return done(err, false);
      }

      if (user) {
        // Valid user found based on JWT payload
        return done(null, user);
      } else {
        // User not found for the provided JWT payload
        return done(null, false);
      }
    },
  ),
);
