'use strict';

const User = require('../models/user');
const Joi = require('joi');
const Boom = require('boom');

exports.find = {

  auth: false,

  handler: function (request, reply) {
    User.find({}).then(users => {
      reply(users);
    }).catch(err => {
      reply(Boom.badImplementation('error accessing db'));
    });
  },

};

exports.findOne = {

  auth: false,

  handler: function (request, reply) {
    User.findOne({ _id: request.params.id }).then(user => {
      if (user != null) {
        reply(user);
      } else {
        reply(Boom.notFound('id not found'));
      }
    }).catch(err => {
      reply(Boom.notFound('id not found'));
    });
  },

};

exports.create = {

  auth: false,

  validate: {

    payload: {
      nickname: Joi.string().required(),
      email: Joi.string().email().required(),
      password: Joi.string().required(),
      followings: Joi.array().optional(),
    },

    failAction: function (request, reply, source, error) {
      reply(Boom.badData('User is not well-formatted', error));
    },

    options: {
      abortEarly: false,
    },

  },

  handler: function (request, reply) {
    const user = new User(request.payload);
    user.save().then(newUser => {
      reply(newUser).code(201);
    }).catch(err => {
      reply(Boom.badImplementation('error creating user'));
    });
  },

};

exports.deleteAll = {

  auth: false,

  handler: function (request, reply) {
    User.remove({}).then(err => {
      reply().code(204);
    }).catch(err => {
      reply(Boom.badImplementation('error removing users'));
    });
  },

};

exports.deleteOne = {

  auth: false,

  handler: function (request, reply) {
    User.remove({ _id: request.params.id }).then(user => {
      switch (user.result.n) {
        case 0:
          reply(Boom.notFound('id not found'));
          break;
        case 1:
          reply({ message: 'Delete successful' }).code(204);
          break;
        default:
          reply(Boom.badImplementation('Delete one user endpoint defaulted ...'));
          break;
      }
    }).catch(err => {
      reply(Boom.notFound('id not found'));
    });
  },

};
