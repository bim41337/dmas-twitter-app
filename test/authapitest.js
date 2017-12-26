'use strict';

const HEROKU_MODE = false;
const Assert = require('chai').assert;
const TweeterService = require('./tweeter-service');
const Fixtures = require('./fixtures.json');
const Utils = require('../app/api/utils.js');

suite('Authentication API test', function () {

  const baseUrl = HEROKU_MODE ? Fixtures.tweeterServiceHerokuUrl
      : Fixtures.tweeterServiceLocalhostUrl;
  const service = new TweeterService(baseUrl);

  let users = Fixtures.users;

  test('login-logout', function () {
    let returnedUsers = service.getAllUsers();
    Assert.isNull(returnedUsers);

    service.login(users[0]);
    returnedUsers = service.getAllUsers();
    Assert.isNotNull(returnedUsers);

    service.logout();
    returnedUsers = service.getAllUsers();
    Assert.isNull(returnedUsers);
  });

});
