'use strict';

const SyncHttpService = require('./sync-http-service');

class TweeterService {

  constructor(baseUrl) {
    this.httpService = new SyncHttpService(baseUrl);
  }

  // ### USERS ###

  getAllUsers() {
    return this.httpService.get('/api/users');
  }

  getOneUser(id) {
    return this.httpService.get('/api/users/' + id);
  }

  createUser(newUser) {
    return this.httpService.post('/api/users', newUser);
  }

  deleteAllUsers() {
    return this.httpService.delete('/api/users');
  }

  deleteOneUser(id) {
    return this.httpService.delete('/api/users/' + id);
  }

  changeOneUser(id, changedUser) {
    return this.httpService.put('/api/users/' + id, changedUser);
  }

  addFollowingForUser(id, follId) {
    return this.httpService.post(`/api/users/${id}/followings`, { follId });
  }

  getFollowingsForUser(id) {
    return this.httpService.get(`/api/users/${id}/followings`);
  }

  removeFollowingForUser(id, follId) {
    return this.httpService.put(`/api/users/${id}/followings`, { follId });
  }

  login(user) {
    return this.httpService.setAuth('/api/users/authenticate', user);
  }

  logout() {
    this.httpService.clearAuth();
  }

  // ### TWEETS ###

  getAllTweets() {
    return this.httpService.get('/api/tweets');
  }

  getOneTweet(id) {
    return this.httpService.get('/api/tweets/' + id);
  }

  getAllTweetsForUser(userId) {
    return this.httpService.get('/api/tweets/user/' + userId);
  }

  createTweet(newTweet) {
    return this.httpService.post('/api/tweets', newTweet);
  }

  deleteAllTweets() {
    return this.httpService.delete('/api/tweets');
  }

  deleteOneTweet(id) {
    return this.httpService.delete('/api/tweets/' + id);
  }

  deleteAllTweetsForUser(userId) {
    return this.httpService.delete('/api/tweets/user/' + userId);
  }

  // ### COMBINATIONS ###

  deleteOneUserAndTweets(id) {
    return {
      tweetResult: this.deleteAllTweetsForUser(id),
      userResult: this.httpService.delete('/api/users/' + id),
    };
  }

}

module.exports = TweeterService;
