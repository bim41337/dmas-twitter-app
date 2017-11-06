// Controller includes
const Assets = require('./app/controllers/assets');
const Welcome = require('./app/controllers/welcome');

// Routes
module.exports = [

    // Unregistered routes
  { method: 'GET', path: '/', config: Welcome.welcome },
  { method: 'GET', path: '/signup', config: Welcome.signup },
  { method: 'POST', path: '/register', config: Welcome.register },
  { method: 'GET', path: '/login', config: Welcome.login },
  { method: 'POST', path: '/login', config: Welcome.authenticate },

  {
    method: 'GET',
    path: '/{param*}',
    config: { auth: false },
    handler: Assets.servePublicDirectory,
  },

];
