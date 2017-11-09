// Controller includes
const Assets = require('./app/controllers/assets');
const Welcome = require('./app/controllers/welcome');
const Tweets = require('./app/controllers/tweets');

// Routes
module.exports = [

    // Unregistered routes
  { method: 'GET', path: '/', config: Welcome.welcome },
  { method: 'GET', path: '/signup', config: Welcome.signup },
  { method: 'POST', path: '/register', config: Welcome.register },
  { method: 'GET', path: '/login', config: Welcome.login },
  { method: 'POST', path: '/login', config: Welcome.authenticate },

    // Registered routes
  { method: 'GET', path: '/home', config: Tweets.home },
  { method: 'GET', path: '/logout', config: Tweets.logout },

    // Assets
  {
    method: 'GET',
    path: '/{param*}',
    config: { auth: false },
    handler: Assets.servePublicDirectory,
  },

];
