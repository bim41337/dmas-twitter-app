'use strict';

const HEROKU_MODE = false;
const Assert = require('chai').assert;
const TweeterService = require('./tweeter-service');
const Fixtures = require('./fixtures.json');
const Lodash = require('lodash');

suite('User API tests', function () {

  let users = Fixtures.users;
  let newUser = Fixtures.newUser;

  const baseUrl = HEROKU_MODE ? Fixtures.tweeterServiceHerokuUrl
      : Fixtures.tweeterServiceLocalhostUrl;
  const tweeterService = new TweeterService(baseUrl);

  beforeEach(function () {
    tweeterService.deleteAllUsers();
  });

  afterEach(function () {
    tweeterService.deleteAllUsers();
  });

  test('create a user', function () {
    const returnedUser = tweeterService.createUser(newUser);
    Assert(Lodash.some([returnedUser], newUser),
        'returnedUser must be a superset of newUser');
    Assert.isDefined(returnedUser._id);
  });

  test('get user', function () {
    const u1 = tweeterService.createUser(newUser);
    const u2 = tweeterService.getOneUser(u1._id);
    Assert.deepEqual(u1, u2);
  });

  test('get invalid user', function () {
    const u1 = tweeterService.getOneUser('1234');
    Assert.isNull(u1);
    const u2 = tweeterService.getOneUser('012345678901234567890123');
    Assert.isNull(u2);
  });

  test('delete a user', function () {
    const u1 = tweeterService.createUser(newUser);
    Assert.isNotNull(tweeterService.getOneUser(u1._id));
    tweeterService.deleteOneUser(u1._id);
    Assert.isNull(tweeterService.getOneUser(u1._id));
  });

  test('delete a user with tweets', function () {
    const mainUser = tweeterService.createUser(newUser);
    const secondUser = tweeterService.createUser(Fixtures.newUserFallback);
    tweeterService.deleteAllTweets();
    for (let tmpTweet of Fixtures.tweets) {
      tmpTweet.user = mainUser._id;
      tweeterService.createTweet(tmpTweet);
    }
    let additionalTweet = Fixtures.newTweetFallback;
    additionalTweet.user = secondUser._id;
    additionalTweet = tweeterService.createTweet(additionalTweet);

    Assert.lengthOf(tweeterService.getAllUsers(), 2);
    Assert.lengthOf(tweeterService.getAllTweetsForUser(mainUser._id), Fixtures.tweets.length);
    Assert.lengthOf(tweeterService.getAllTweetsForUser(secondUser._id), 1);
    Assert.lengthOf(tweeterService.getAllTweets(), Fixtures.tweets.length + 1);

    tweeterService.deleteOneUserAndTweets(mainUser._id);
    Assert.isNull(tweeterService.getOneUser(mainUser._id));
    Assert.lengthOf(tweeterService.getAllTweets(), 1);
    Assert(Lodash.some([tweeterService.getAllTweetsForUser(secondUser._id)[0]], additionalTweet),
        'Last remaining tweet must be a superset of the Fixture-Fallback-Tweet');
    tweeterService.deleteAllTweets();
  });

  test('delete all users', function () {
    for (let tmpUser of users) {
      tweeterService.createUser(tmpUser);
    }
    Assert.lengthOf(tweeterService.getAllUsers(), users.length);
    tweeterService.deleteAllUsers();
    Assert.isEmpty(tweeterService.getAllUsers());
  });

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

});
