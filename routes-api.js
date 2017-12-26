const UsersApi = require('./app/api/user-api');
const TweetsApi = require('./app/api/tweet-api');

module.exports = [

  // Users
  { method: 'GET', path: '/api/users', config: UsersApi.find },
  { method: 'POST', path: '/api/users', config: UsersApi.create },
  { method: 'DELETE', path: '/api/users', config: UsersApi.deleteAll },
  { method: 'GET', path: '/api/users/{id}', config: UsersApi.findOne },
  { method: 'PUT', path: '/api/users/{id}', config: UsersApi.changeUser },
  { method: 'DELETE', path: '/api/users/{id}', config: UsersApi.deleteOne },
  { method: 'GET', path: '/api/users/{id}/followings', config: UsersApi.findFollowingsForUser },
  { method: 'POST', path: '/api/users/{id}/followings', config: UsersApi.addFollowing },
  { method: 'PUT', path: '/api/users/{id}/followings', config: UsersApi.removeFollowing },
  { method: 'POST', path: '/api/users/authenticate', config: UsersApi.authenticate },

  // Tweets
  { method: 'GET', path: '/api/tweets', config: TweetsApi.find },
  { method: 'POST', path: '/api/tweets', config: TweetsApi.create },
  { method: 'DELETE', path: '/api/tweets', config: TweetsApi.deleteAll },
  { method: 'GET', path: '/api/tweets/{id}', config: TweetsApi.findOne },
  { method: 'DELETE', path: '/api/tweets/{id}', config: TweetsApi.deleteOne },
  { method: 'GET', path: '/api/tweets/user/{id}', config: TweetsApi.findAllForUser },
  { method: 'DELETE', path: '/api/tweets/user/{id}', config: TweetsApi.deleteAllForUser },
  { method: 'GET', path: '/api/tweets/user/{id}/followings', config: TweetsApi.findFollowingsForUser },

];
