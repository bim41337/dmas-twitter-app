'use strict';

const Joi = require('joi');
const User = require('../models/user');

exports.welcome = {

  auth: false,

  handler: function (request, reply) {
    reply.view('welcome', { title: 'Welcome to Tweeter' });
  },

};

exports.login = {

  auth: false,

  handler: function (request, reply) {
    reply.view('login', { title: 'Log in to Tweeter' });
  },

};

exports.signup = {

  auth: false,

  handler: function (request, reply) {
    reply.view('signup', { title: 'Sign up to Tweeter' });
  },

};

exports.authenticate = {

  auth: false,

  validate: {

    payload: {
      email: Joi.string().email().required(),
      password: Joi.string().required(),
    },

    failAction: function (request, reply, source, error) {
      reply.view('login', {
        title: 'ERROR: Log in to Tweeter',
        errors: error.data.details,
        formData: request.payload,
      }).code(400);
    },

    options: {
      abortEarly: false,
    },

  },

  handler: function (request, reply) {
    const user = request.payload;
    User.findOne({ email: user.email }).then(foundUser => {
      if (foundUser && foundUser.password === user.password) {
        request.cookieAuth.set({
          loggedIn: true,
          loggedInUser: user.email,
        });
        reply.redirect('/home');
      } else {
        reply.redirect('/signup');
      }
    }).catch(err => {
      reply.redirect('/');
    });
  },

};

exports.register = {

  auth: false,

  validate: {

    payload: {
      nickname: Joi.string().required().min(3),
      email: Joi.string().email().required(),
      password: Joi.string().required(),
    },

    failAction: function (request, reply, source, error) {
      reply.view('signup', {
        title: 'ERROR: Sign up to Tweeter',
        errors: error.data.details,
        formData: request.payload,
      }).code(400);
    },

    options: {
      abortEarly: false,
    },

  },

  handler: function (request, reply) {
    const userNickname = request.payload.nickname;
    User.count({ nickname: userNickname }).then(count => {
      if (count > 0) {
        reply.view('signup', {
          title: 'ERROR: Sign up to Tweeter',
          errors: [{ message: 'User already exists on Tweeter' }],
          formData: request.payload,
        }).code(400);
        return false;
      }
      return true;
    }).then(success => {
      if (success) {
        const user = new User(request.payload);
        user.save().then(newUser => {
          reply.redirect('/login');
        });
      }
    }).catch(err => {
      reply.redirect('/');
    });
  },

};
