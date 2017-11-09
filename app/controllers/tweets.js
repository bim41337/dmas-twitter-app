'use strict';

const Joi = require('joi');
const User = require('../models/user');
const Tweet = require('../models/tweet');

exports.home = {

  handler: function (request, reply) {
    User.findOne({ email: request.auth.credentials.loggedInUser }).then(foundUser => {
      if (!foundUser) {
        console.log('No user found for home screen');
        reply.redirect('/logout');
      }

      Tweet.find({ user: foundUser._id })
          .sort('-creation')
          .populate('user').then(userTweets => {
        reply.view('home', {
          title: 'Tweeter home',
          user: foundUser,
          tweets: userTweets,
        });
      });
    }).catch(err => {
      reply.redirect('/');
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
