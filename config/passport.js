const LocalStrategy = require('passport-local').Strategy;
const passport = require('passport');
const bcrypt = require('bcrypt');
const User = require('../models/user');

passport.serializeUser((user, cb) => {
  cb(null, user.id);
});

passport.deserializeUser((id, cb) => {
  User.findById(id, (err, user) => {
    if (err) { return cb(err); }
    cb(null, user);
  });
});

passport.use('local-signup', new LocalStrategy(
  { passReqToCallback: true },
  (req, username, password, next) => {
    // To avoid race conditions
    process.nextTick(() => {
      User.findOne({
        'username': username
      }, (err, user) => {
        if (err) { return next(err); }

        if (user) {
          return next(null, false);
        } else {
          // Destructure the body
          const { username, email, description, password } = req.body;
          const hashPass = bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
          const newUser = new User({
            username,
            email,
            description,
            password: hashPass
          });

          newUser.save((err) => {
            if (err) { next(err); }
            return next(null, newUser);
          });
        }
      });
    });
  })
);

passport.use('local-login', new LocalStrategy((username, password, next) => {
  User.findOne({ username }, (err, user) => {
    if (err) {
      return next(err);
    } else if (!user) {
      return next(null, false, { message: "Incorrect username" });
    } else  if (!bcrypt.compareSync(password, user.password)) {
      return next(null, false, { message: "Incorrect password" });
    }

    return next(null, user);
  });
}));

module.exports = passport;

