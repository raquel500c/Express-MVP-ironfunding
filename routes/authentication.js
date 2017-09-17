const express = require('express');
const passport = require('passport');
const router = express.Router();
const { ensureLoggedIn, ensureLoggedOut } = require('connect-ensure-login');
const PATHS = require('./paths');

router.get(PATHS.SIGNUP_PATH, ensureLoggedOut(), (req, res) => {
  res.render('authentication/signup');
});

router.get(PATHS.LOGIN_PATH, ensureLoggedOut(), (req, res) => {
  res.render('authentication/login');
});

router.post(PATHS.SIGNUP_PATH, ensureLoggedOut(), passport.authenticate('local-signup', {
  successRedirect: PATHS.ROOT_PATH,
  failureRedirect: PATHS.SIGNUP_PATH
}));

router.post(PATHS.LOGIN_PATH, ensureLoggedOut(), passport.authenticate('local-login', {
  successRedirect: PATHS.ROOT_PATH,
  failureRedirect: PATHS.LOGIN_PATH
}));

router.post(PATHS.LOGOUT_PATH, ensureLoggedIn(), (req, res) => {
  req.logout();
  res.redirect(PATHS.ROOT_PATH);
});

module.exports = router;
