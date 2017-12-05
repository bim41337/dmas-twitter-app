'use strict';

const HEROKU_MODE = false;
const Assert = require('chai').assert;
const TweeterService = require('./tweeter-service');
const Fixtures = require('./fixtures.json');
const Lodash = require('lodash');

suite('User API tests', function () {

  let users = Fixtures.users;
  let newUser = Fixtures.newUser;
  let tweetUser;

  const baseUrl = HEROKU_MODE ? Fixtures.tweeterServiceHerokuUrl
      : Fixtures.tweeterServiceLocalhostUrl;
  const tweeterService = new TweeterService(baseUrl);
  const adminUser = Fixtures.users[0];

  beforeEach(function () {
    tweeterService.login(adminUser);
    tweetUser = tweeterService.createUser(Fixtures.newUser);
    // tweeterService.deleteAllUsers();
  });

  afterEach(function () {
    // tweeterService.deleteAllUsers();
    tweeterService.deleteOneUser(tweetUser._id);
    tweeterService.logout();
  });

  test('create a user', function () {
    Assert(Lodash.some([tweetUser], newUser),
        'returnedUser must be a superset of newUser');
    Assert.isDefined(tweetUser._id);
  });

  test('get user', function () {
    const readUser = tweeterService.getOneUser(tweetUser._id);
    Assert.deepEqual(tweetUser, readUser);
  });

  test('get invalid user', function () {
    const u1 = tweeterService.getOneUser('1234');
    Assert.isNull(u1);
    const u2 = tweeterService.getOneUser('012345678901234567890123');
    Assert.isNull(u2);
  });

  test('delete a user', function () {
    Assert.isNotNull(tweeterService.getOneUser(tweetUser._id));
    tweeterService.deleteOneUser(tweetUser._id);
    Assert.isNull(tweeterService.getOneUser(tweetUser._id));
  });

  test('delete a user with tweets', function () {
    tweeterService.deleteAllTweets();
    for (let tmpTweet of Fixtures.tweets) {
      tmpTweet.user = tweetUser._id;
      tweeterService.createTweet(tmpTweet);
    }

    Assert.lengthOf(tweeterService.getAllTweetsForUser(tweetUser._id), Fixtures.tweets.length);

    tweeterService.deleteOneUserAndTweets(tweetUser._id);
    Assert.isNull(tweeterService.getOneUser(tweetUser._id));
    Assert.isEmpty(tweeterService.getAllTweets());

    tweeterService.deleteAllTweets();
  });

  /*
  test('delete all users', function () {
    for (let tmpUser of users) {
      tweeterService.createUser(tmpUser);
    }
    Assert.lengthOf(tweeterService.getAllUsers(), users.length);
    tweeterService.deleteAllUsers();
    Assert.isEmpty(tweeterService.getAllUsers());
  });

  /*
  test('get all users', function () {
    for (let tmpUser of users) {
      tweeterService.createUser(tmpUser);
    }

    const allUsers = tweeterService.getAllUsers();
    Assert.lengthOf(allUsers, users.length);
  });

  test('get users detail', function () {
    for (let tmpUser of users) {
      tweeterService.createUser(tmpUser);
    }

    const allUsers = tweeterService.getAllUsers();
    for (let i = 0; i < users.length; i++) {
      Assert(Lodash.some([allUsers[i]], users[i]),
          'Every user created must be a superset of the Fixture-User');
    }
  });

  test('get all users empty', function () {
    const allUsers = tweeterService.getAllUsers();
    Assert.isEmpty(allUsers);
  });
  */

});
