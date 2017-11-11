'use strict';

const Joi = require('joi');
const User = require('../models/user');

const titleWelcome = 'Welcome to Tweeter';
const titleLogin = 'Log in to Tweeter';
const titleSignup = 'Sign up to Tweeter';

exports.welcome = {

  auth: false,

  handler: function (request, reply) {

    reply.view('welcome', { title: titleWelcome });
  },

};

exports.login = {

  auth: false,

  handler: function (request, reply) {
    reply.view('login', { title: titleLogin });
  },

};

exports.signup = {

  auth: false,

  handler: function (request, reply) {
    reply.view('signup', { title: titleSignup });
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
        title: titleLogin,
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
        reply.view('login', {
          title: titleLogin,
          errors: [{ message: 'Authentication failed! Please try again or sign up to Tweeter' }],
        });
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
        title: titleSignup,
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
    User.count({ email: user.email }).then(count => {
      if (count > 0) {
        reply.view('signup', {
          title: titleSignup,
          errors: [{ message: 'User seems to already exists on Tweeter' }],
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
