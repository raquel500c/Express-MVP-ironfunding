
const mongoose = require('mongoose');
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

require('mongoose').Promise = global.Promise; // suprime DeprecationWarning: Mongoose: mpromise --> https://github.com/Automattic/mongoose/issues/4951
mongoose.connect(process.env.MONGO_URI,{useMongoClient:true})
.then( () => console.log("Connected to db!"));

const app = require('express')();
require('./config/express')(app);

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
