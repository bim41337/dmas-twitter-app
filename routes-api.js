const UsersApi = require('./app/api/user-api');
const TweetsApi = require('./app/api/tweet-api');

module.exports = [

  // Users
  { method: 'GET', path: '/api/users', config: UsersApi.find },
  { method: 'GET', path: '/api/users/{id}', config: UsersApi.findOne },
  { method: 'POST', path: '/api/users', config: UsersApi.create },
  { method: 'DELETE', path: '/api/users/{id}', config: UsersApi.deleteOne },
  { method: 'DELETE', path: '/api/users', config: UsersApi.deleteAll },
  { method: 'POST', path: '/api/users/authenticate', config: UsersApi.authenticate },

  // Tweets
  { method: 'GET', path: '/api/tweets', config: TweetsApi.find },
  { method: 'GET', path: '/api/tweets/{id}', config: TweetsApi.findOne },
  { method: 'GET', path: '/api/tweets/user/{id}', config: TweetsApi.findAllForUser },
  { method: 'POST', path: '/api/tweets', config: TweetsApi.create },
  { method: 'DELETE', path: '/api/tweets/{id}', config: TweetsApi.deleteOne },
  { method: 'DELETE', path: '/api/tweets', config: TweetsApi.deleteAll },
  { method: 'DELETE', path: '/api/tweets/user/{id}', config: TweetsApi.deleteAllForUser },

];
