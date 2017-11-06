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

  handler: function (request, reply) {
    console.log('Login post method reached');
    reply.redirect('/');
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
