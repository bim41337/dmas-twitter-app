// Controller includes
const Assets = require('./app/controllers/assets');
const Welcome = require('./app/controllers/welcome');
const Tweets = require('./app/controllers/tweets');
const Users = require('./app/controllers/users');

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
  { method: 'GET', path: '/followings', config: Tweets.followings },
  { method: 'GET', path: '/settings', config: Users.viewSettings },
  { method: 'POST', path: '/settings', config: Users.updateSettings },
  { method: 'GET', path: '/logout', config: Users.logout },
  { method: 'POST', path: '/makeTweet', config: Tweets.makeTweet },
  { method: 'POST', path: '/removeTweet', config: Tweets.removeTweet },
  { method: 'GET', path: '/searchUser', config: Users.searchUser },
  { method: 'POST', path: '/searchUser', config: Users.browseUsers },
  { method: 'GET', path: '/viewUser', config: Users.viewUser },
  { method: 'POST', path: '/followUser', config: Users.followUser },
  { method: 'POST', path: '/unfollowUser', config: Users.unfollowUser },

    // Assets
  {
    method: 'GET',
    path: '/{param*}',
    config: { auth: false },
    handler: Assets.servePublicDirectory,
  },

];
