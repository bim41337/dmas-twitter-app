'use strict';

const HEROKU_MODE = false;
const Assert = require('chai').assert;
const TweeterService = require('./tweeter-service');
const Fixtures = require('./fixtures.json');
const Lodash = require('lodash');

suite('Tweet API tests', function () {

  let tweets = Fixtures.tweets;
  let newTweet = Fixtures.newTweet;
  let tweetUser;

  const baseUrl = HEROKU_MODE ? Fixtures.tweeterServiceHerokuUrl
      : Fixtures.tweeterServiceLocalhostUrl;
  const tweeterService = new TweeterService(baseUrl);
  const adminUser = Fixtures.users[0];

  beforeEach(function () {
    tweeterService.login(adminUser);
    tweetUser = tweeterService.createUser(Fixtures.newUser);
    newTweet.user = tweetUser._id;
    tweeterService.deleteAllTweets();
  });

  afterEach(function () {
    tweeterService.deleteOneUser(tweetUser._id);
    tweeterService.deleteAllTweets();
    tweeterService.logout();
  });

  test('create a tweet', function () {
    const returnedTweet = tweeterService.createTweet(newTweet);
    Assert(Lodash.some([returnedTweet], newTweet),
        'returnedTweet must be a superset of newTweet');
    Assert.isDefined(returnedTweet._id);
  });

  test('get tweet', function () {
    const t1 = tweeterService.createTweet(newTweet);
    const t2 = tweeterService.getOneTweet(t1._id);
    Assert.deepEqual(t1, t2);
  });

  test('get invalid tweet', function () {
    const t1 = tweeterService.getOneTweet('1234');
    Assert.isNull(t1);
    const t2 = tweeterService.getOneTweet('012345678901234567890123');
    Assert.isNull(t2);
  });

  test('delete a tweet', function () {
    const t1 = tweeterService.createTweet(newTweet);
    Assert.isNotNull(tweeterService.getOneTweet(t1._id));
    tweeterService.deleteOneTweet(t1._id);
    Assert.isNull(tweeterService.getOneTweet(t1._id));
  });

  test('delete all tweets', function () {
    for (let tmpTweet of tweets) {
      tmpTweet.user = tweetUser._id;
      tweeterService.createTweet(tmpTweet);
    }
    Assert.lengthOf(tweeterService.getAllTweets(), tweets.length);
    tweeterService.deleteAllTweets();
    Assert.isEmpty(tweeterService.getAllTweets());
  });

  test('get all tweets', function () {
    for (let tmpTweet of tweets) {
      tmpTweet.user = tweetUser._id;
      tweeterService.createTweet(tmpTweet);
    }

    const allTweets = tweeterService.getAllTweets();
    Assert.lengthOf(allTweets, tweets.length);
  });

  test('get all tweets for user', function () {
    for (let tmpTweet of tweets) {
      tmpTweet.user = tweetUser._id;
      tweeterService.createTweet(tmpTweet);
    }

    Assert.lengthOf(tweeterService.getAllTweets(), tweets.length);

    const allTweetsForUser = tweeterService.getAllTweetsForUser(tweetUser._id);
    Assert.lengthOf(allTweetsForUser, tweets.length);
    for (let i = 0; i < tweets.length; i++) {
      Assert(Lodash.some([allTweetsForUser[i]], tweets[i]),
          'Every tweet created for the user must be a superset of the Fixture-Tweet');
    }
  });

  test('delete all tweets for user', function () {
    for (let tmpTweet of tweets) {
      tmpTweet.user = tweetUser._id;
      tweeterService.createTweet(tmpTweet);
    }

    Assert.lengthOf(tweeterService.getAllTweets(), tweets.length);

    tweeterService.deleteAllTweetsForUser(tweetUser._id);
    Assert.isEmpty(tweeterService.getAllTweetsForUser(tweetUser._id));
  });

  test('get tweets detail', function () {
    for (let tmpTweet of tweets) {
      tmpTweet.user = tweetUser._id;
      tweeterService.createTweet(tmpTweet);
    }

    const allTweets = tweeterService.getAllTweets();
    for (let i = 0; i < tweets.length; i++) {
      Assert(Lodash.some([allTweets[i]], tweets[i]),
          'Every tweet created must be a superset of the Fixture-Tweet');
    }
  });

  test('get all tweets empty', function () {
    const allTweets = tweeterService.getAllTweets();
    Assert.lengthOf(allTweets, 0);
  });

});
