'use strict';

const Joi = require('joi');
const moment = require('moment-timezone');

// const Boom = require('boom');
const User = require('../models/user');
const Tweet = require('../models/tweet');

const titleHome = 'Your tweets - Tweeter';
const titleSearchUser = 'Search users - Tweeter';
const titleFollowings = 'Followed tweets - Tweeter';
const titleSettings = 'Edit account details - Tweeter';

exports.home = {

  handler: function (request, reply) {
    const currentUserMail = request.auth.credentials.loggedInUser;
    User.findOne({ email: currentUserMail }).then(foundUser => {
      if (!foundUser) {
        throw new Error('User could not be found in database (' + currentUserMail + ')');
      }

      Tweet.find({ user: foundUser._id })
          .sort('-creation user.nickname')
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

exports.searchUser = {

  handler: function (request, reply) {
    const loggedInUserEmail = request.auth.credentials.loggedInUser;
    User.findOne({ email: loggedInUserEmail }).then(foundUser => {
      if (!foundUser) {
        throw new Error('User could not be found in database (' + loggedInUserEmail + ')');
      }

      reply.view('search-user', {
        title: titleSearchUser,
        user: foundUser,
      });
    });
  },

};

exports.browseUsers = {

  validate: {

    payload: {
      nickname: Joi.string().required(),
    },

    failAction: function (request, reply, source, error) {
      const loggedInUserEmail = request.auth.credentials.loggedInUser;
      User.findOne({ email: loggedInUserEmail }).then(foundUser => {
        if (!foundUser) {
          throw new Error('User could not be found in database (' + loggedInUserEmail + ')');
        }

        const formData = request.payload;
        reply.view('search-user', {
          title: titleSearchUser,
          errors: error.data.details,
          user: foundUser,
          formData: formData,
        }).code(400);
      });
    },

    options: {
      abortEarly: false,
    },

  },

  handler: function (request, reply) {
    const loggedInUserEmail = request.auth.credentials.loggedInUser;
    User.findOne({ email: loggedInUserEmail }).then(foundUser => {
      if (!foundUser) {
        throw new Error('User could not be found in database (' + loggedInUserEmail + ')');
      }

      return foundUser;
    }).then(currentUser => {
      const searchString = request.payload.nickname;
      User.find({
        nickname: new RegExp(searchString, 'i'),
        email: { $ne: loggedInUserEmail },
      }).sort('nickname').then(foundUsers => {

        reply.view('browse-users', {
          title: titleSearchUser,
          user: currentUser,
          users: foundUsers,
        });
      });
    }).catch(err => {
      console.log(err);
      reply.redirect('/home');
    });
  },

};

exports.viewUser = {

  handler: function (request, reply) {
    console.log(`Passed User-ID ${request.params.id}`);
    reply.redirect('/home');
  },

};

exports.followings = {

  handler: function (request, reply) {
    const currentUserMail = request.auth.credentials.loggedInUser;
    User.findOne({ email: currentUserMail }).then(foundUser => {
      if (!foundUser) {
        throw new Error('User could not be found in database (' + currentUserMail + ')');
      }

      // Fetch tweets by followed users here
      /* model.find({
      '_id': { $in: [
        mongoose.Types.ObjectId('4ed3ede8844f0f351100000c'),
        mongoose.Types.ObjectId('4ed3f117a844e0471100000d'),
        mongoose.Types.ObjectId('4ed3f18132f50c491100000e')
      ]}
      */
      console.log(foundUser.followings);
      reply.view('followings', {
        title: titleFollowings,
        user: currentUserMail,
      });
    }).catch(err => {
      console.log(err);
      reply.redirect('/home');
    });
  },

};

exports.viewSettings = {

  handler: function (request, reply) {
    const currentUserMail = request.auth.credentials.loggedInUser;
    User.findOne({ email: currentUserMail }).then(foundUser => {
      if (!foundUser) {
        throw new Error('User could not be found in database (' + currentUserMail + ')');
      }

      reply.view('settings', {
        title: titleSettings,
        user: foundUser,
        formData: foundUser,
      });
    }).catch(err => {
      console.log(err);
      reply.redirect('/');
    });
  },

};

exports.updateSettings = {

  validate: {

    payload: {
      nickname: Joi.string().required(),
      email: Joi.string().email().required(),
      password: Joi.string().required(),
    },

    failAction: function (request, reply, source, error) {
      const loggedInUserEmail = request.auth.credentials.loggedInUser;
      User.findOne({ email: loggedInUserEmail }).then(foundUser => {
        if (!foundUser) {
          throw new Error('User could not be found in database (' + loggedInUserEmail + ')');
        }

        const formData = request.payload;
        reply.view('settings', {
          title: titleSettings,
          errors: error.data.details,
          user: foundUser,
          formData: formData,
        }).code(400);
      });
    },

    options: {
      abortEarly: false,
    },

  },

  handler: function (request, reply) {
    const editedUser = request.payload;
    const loggedInUserEmail = request.auth.credentials.loggedInUser;

    User.findOne({ email: loggedInUserEmail }).then(user => {
      if (!user) {
        throw new Error('User could not be found in database (' + loggedInUserEmail + ')');
      }

      user.nickname = editedUser.nickname;
      user.email = editedUser.email;
      user.password = editedUser.password;

      return user.save();
    }).then(saveResultUser => {
      if (saveResultUser && saveResultUser.email !== loggedInUserEmail) {
        request.cookieAuth.set({
          loggedIn: true,
          loggedInUser: editedUser.email,
        });
      }

      reply.redirect('/home');
    }).catch(err => {
      console.log(err);
      reply.redirect('/');
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

exports.logout = {

  auth: false,

  handler: function (request, reply) {
    request.cookieAuth.clear();
    reply.redirect('/');
  },

};
