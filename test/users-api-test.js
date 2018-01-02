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
  const testUsersLength = 2;

  beforeEach(function () {
    tweeterService.createUser(adminUser);
    tweeterService.login(adminUser);
    tweetUser = tweeterService.createUser(newUser);
  });

  afterEach(function () {
    tweeterService.deleteAllUsers();
    tweeterService.logout();
  });

  test('create a user', function () {
    Assert(Lodash.some([tweetUser], newUser),
        'returnedUser must be a superset of newUser');
    Assert.isDefined(tweetUser._id);
  });

  test('get user', function () {
    const response = tweeterService.getOneUser(tweetUser._id);
    Assert(Lodash.some([tweetUser], response.user), 'Read user must be a superset of fixtures user');
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

  test('delete all users', function () {
    for (let tmpUser of users) {
      tweeterService.createUser(tmpUser);
    }
    tweeterService.deleteAllUsers();
    let allUsers = tweeterService.getAllUsers();
    Assert.isNull(allUsers);
  });

  test('get all users', function () {
    for (let tmpUser of users) {
      tweeterService.createUser(tmpUser);
    }

    const allUsers = tweeterService.getAllUsers();
    Assert.lengthOf(allUsers, users.length + testUsersLength);
  });

  test('get users detail', function () {
    for (let tmpUser of users) {
      tweeterService.createUser(tmpUser);
    }

    const allUsers = tweeterService.getAllUsers();
    for (let i = 0; i < users.length; i++) {
      const currentUser = Lodash.find(allUsers, usr => usr.email === users[i].email);
      Assert(Lodash.some([currentUser], users[i]),
          'Every user created must be part of the returned users');
    }
  });

  test('change a user', function () {
    let response = tweeterService.getOneUser(tweetUser._id);
    Assert(Lodash.some([response.user], tweetUser), 'Read user differs from unchanged test user');

    tweetUser.password = '12345';
    tweeterService.changeOneUser(tweetUser._id, tweetUser);

    response = tweeterService.getOneUser(tweetUser._id);
    Assert.equal(response.user.password, tweetUser.password);
  });

  test('add followings entry for user', function () {
    let response = tweeterService.getOneUser(tweetUser._id);
    Assert.isEmpty(response.user.followings);

    let userForFollowings = tweeterService.createUser(Fixtures.newUserFallback);
    Assert(Lodash.some([userForFollowings], Fixtures.newUserFallback),
        'New user for followings was not set up matching the fixtures fallback user');
    tweeterService.addFollowingForUser(tweetUser._id, userForFollowings._id);

    response = tweeterService.getOneUser(tweetUser._id);
    Assert.isNotEmpty(response.user.followings);
  });

  test('get followings for user', function () {
    let response = tweeterService.getOneUser(tweetUser._id);
    Assert.isEmpty(response.user.followings);

    let userForFollowings = tweeterService.createUser(Fixtures.newUserFallback);
    Assert(Lodash.some([userForFollowings], Fixtures.newUserFallback),
        'New user for followings was not set up matching the fixtures fallback user');
    tweeterService.addFollowingForUser(tweetUser._id, userForFollowings._id);

    response = tweeterService.getFollowingsForUser(tweetUser._id);
    Assert.lengthOf(response, 1);
    Assert(Lodash.some([response[0]], Fixtures.newUserFallback),
        'User read from followings does not match fixtures fallback user');
  });

  test('remove following entry for user', function () {
    let response = tweeterService.getOneUser(tweetUser._id);
    Assert.isEmpty(response.user.followings);

    let userForFollowings = tweeterService.createUser(Fixtures.newUserFallback);
    Assert(Lodash.some([userForFollowings], Fixtures.newUserFallback),
        'New user for followings was not set up matching the fixtures fallback user');
    tweeterService.addFollowingForUser(tweetUser._id, userForFollowings._id);

    response = tweeterService.getFollowingsForUser(tweetUser._id);
    Assert.lengthOf(response, 1);

    tweeterService.removeFollowingForUser(tweetUser._id, userForFollowings._id);
    response = tweeterService.getOneUser(tweetUser._id);
    Assert.isEmpty(response.user.followings);
  });

});
