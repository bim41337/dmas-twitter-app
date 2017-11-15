'use strict';

// const Joi = require('joi');
const moment = require('moment-timezone');

// const Boom = require('boom');
const User = require('../models/user');
const Tweet = require('../models/tweet');

const titleHome = 'Your tweets - Tweeter';
const titleFollowings = 'Followed tweets - Tweeter';

exports.home = {

  handler: function (request, reply) {
    const currentUserMail = request.auth.credentials.loggedInUser;
    User.findOne({ email: currentUserMail }).then(foundUser => {
      if (!foundUser) {
        throw new Error('User could not be found in database (' + currentUserMail + ')');
      }

      Tweet.find({ user: foundUser._id })
          .sort('-creation')
          .populate('user').then(userTweets => {
        reply.view('home', {
          title: titleHome,
          user: foundUser,
          removeOption: true,
          tweets: userTweets,
        });
      });
    }).catch(err => {
      console.log(err);
      reply.redirect('/');
    });
  },

};

exports.followings = {

  handler: function (request, reply) {
    const currentUserMail = request.auth.credentials.loggedInUser;
    User.findOne({ email: currentUserMail })
        .populate('followings')
        .then(foundUser => {
          if (!foundUser) {
            throw new Error('User could not be found in database (' + currentUserMail + ')');
          }

          Tweet.find({ user: { $in: foundUser.followings } })
              .populate('user')
              .sort('-creation')
              .then(tweets => {
                reply.view('followings', {
                  title: titleFollowings,
                  user: foundUser,
                  tweets: tweets,
                });
              });
        }).catch(err => {
          console.log(err);
          reply.redirect('/home');
        });
  },

};

exports.makeTweet = {

  handler: function (request, reply) {
    const message = request.payload.message;
    const currentUserMail = request.auth.credentials.loggedInUser;
    User.findOne({ email: currentUserMail }).then(foundUser => {
      if (!foundUser) {
        throw new Error('User could not be found in database (' + currentUserMail + ')');
      }

      const tweet = new Tweet({
        message: message.trim(),
        creation: moment().tz('Europe/Berlin'),
        user: foundUser,
      });
      tweet.save().then(newTweet => {
        reply.redirect('/home');
      });
    }).catch(err => {
      console.log(err);
      reply.redirect('/');
    });
  },

};

exports.removeTweet = {

  handler: function (request, reply) {
    const tweetId = request.payload.id;
    Tweet.remove({ _id: tweetId }).then(report => {
      if (report.result.n !== 1) {
        throw new Error('Unexpected behaviour during tweet deletion process');
      } else {
        console.log('Removed tweet with ID' + tweetId);
      }
    }).catch(err => {
      console.log(err);
    });
  },

};
