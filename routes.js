// Controller includes
const Assets = require('./app/controllers/assets');
const Welcome = require('./app/controllers/welcome');

// Routes
module.exports = [

  { method: 'GET', path: '/', config: Welcome.welcome },

  {
    method: 'GET',
    path: '/{param*}',
    config: { auth: false },
    handler: Assets.servePublicDirectory,
  },

];
