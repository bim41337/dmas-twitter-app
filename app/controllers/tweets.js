'use strict';

// const Joi = require('joi');
const moment = require('moment-timezone');
const Joi = require('joi');

// const Boom = require('boom');
const User = require('../models/user');
const Tweet = require('../models/tweet');

const titleHome = 'Your tweets - Tweeter';
const titleFollowings = 'Followed tweets - Tweeter';
const titleFirehose = 'Firehose - All tweets - Tweeter';

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

        User.count({ followings: foundUser._id }).then(cnt => {
          reply.view('home', {
            title: titleHome,
            user: foundUser,
            tweets: userTweets,
            followersCount: cnt,
          });
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

exports.firehose = {

  handler: function (request, reply) {
    const currentUserMail = request.auth.credentials.loggedInUser;
    User.findOne({ email: currentUserMail }).then(foundUser => {
      if (!foundUser) {
        throw new Error('User could not be found in database (' + currentUserMail + ')');
      }

      return foundUser;
    }).then(currentUser => {

      Tweet.find({})
          .sort('-creation user.nickname')
          .populate('user')
          .then(allTweets => {

            User.count({}).then(cnt => {
              reply.view('firehose', {
                title: titleFirehose,
                user: currentUser,
                tweets: allTweets,
                usersCount: cnt,
              });
            });

          });

    }).catch(err => {
      console.log(err);
      reply.redirect('/home');
    });
  },

};

exports.makeTweet = {

  payload: {
    output: 'file',
    parse: true,
    allow: 'multipart/form-data',
    maxBytes: 524288,
  },

  validate: {

    payload: {
      message: Joi.string().required(),
      tweetImg: Joi.object({
        filename: Joi.string().allow(''),
        path: Joi.string().optional(),
        bytes: Joi.number().max(524288),
        headers: Joi.object({
          'content-type': Joi.string().valid('application/octet-stream', 'image/jpeg'),
          'content-disposition': Joi.string().optional(),
        }),
      }),
    },

    failAction: function (request, reply, source, error) {
      const loggedInUserEmail = request.auth.credentials.loggedInUser;
      User.findOne({ email: loggedInUserEmail }).then(foundUser => {
        if (!foundUser) {
          throw new Error('User could not be found in database (' + loggedInUserEmail + ')');
        }

        Tweet.find({ user: foundUser._id })
            .sort('-creation')
            .populate('user').then(userTweets => {

          User.count({ followings: foundUser._id }).then(cnt => {
            reply.view('home', {
              title: titleHome,
              errors: error.data.details,
              user: foundUser,
              tweets: userTweets,
              followersCount: cnt,
            }).code(400);
          });

        });

      });
    },

    options: {
      abortEarly: false,
    },

  },

  handler: function (request, reply) {
    const FS = require('fs');
    const message = request.payload.message;
    const tweetImg = request.payload.tweetImg;
    const currentUserMail = request.auth.credentials.loggedInUser;

    let imageContent = null;
    if (tweetImg.bytes > 0) {
      imageContent = {
        data: FS.readFileSync(tweetImg.path),
        contentType: tweetImg.headers['content-type'],
      };
    }

    User.findOne({ email: currentUserMail }).then(foundUser => {
      if (!foundUser) {
        throw new Error('User could not be found in database (' + currentUserMail + ')');
      }

      const tweet = new Tweet({
        message: message.trim(),
        image: imageContent,
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
