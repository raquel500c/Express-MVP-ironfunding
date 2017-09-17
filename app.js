const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const favicon = require('serve-favicon');
const logger = require('morgan');
const mongoose = require('mongoose');
const path = require('path');
const authenticated = require('./middlewares/authenticated');
const errors = require('./middlewares/errors');
const notFound = require('./middlewares/not-found');
const pathsProvider = require('./middlewares/paths-provider');
const session = require('./middlewares/session');
const authentication = require('./routes/authentication');
const rewards = require('./routes/rewards');
const index = require('./routes/index');
const passport = require('./config/passport');
const resolve = require('./utils/resolve');
const campaigns = require('./routes/campaigns');
const users = require('./routes/users');

if (process.env.NODE_ENV === 'development') {
  require('dotenv').config()
}

mongoose.connect(process.env.MONGO_URI);

const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.set('layout', 'layouts/main');
app.use(expressLayouts);
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session(mongoose.connection));
app.use(passport.initialize());
app.use(passport.session());
app.use(authenticated);
app.use(pathsProvider);
app.use(authentication);
app.use(rewards);
app.use(index);
app.use(campaigns);
app.use(users);
app.use(notFound);
app.use(errors);

module.exports = app;
