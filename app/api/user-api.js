'use strict';

const User = require('../models/user');
const Joi = require('joi');
const Utils = require('./utils');
const Boom = require('boom');

exports.find = {

  auth: {
    strategy: 'jwt',
  },

  handler: function (request, reply) {
    User.find({}).then(users => {
      reply(users);
    }).catch(err => {
      reply(Boom.badImplementation('error accessing db'));
    });
  },

};

exports.findOne = {

  auth: {
    strategy: 'jwt',
  },

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

  auth: {
    strategy: 'jwt',
  },

  handler: function (request, reply) {
    User.remove({}).then(err => {
      reply().code(204);
    }).catch(err => {
      reply(Boom.badImplementation('error removing users'));
    });
  },

};

exports.deleteOne = {

  auth: {
    strategy: 'jwt',
  },

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

exports.changeUser = {

  auth: {
    strategy: 'jwt',
  },

  handler: function (request, reply) {
    const editedUser = request.payload;
    const userId = request.params.id;

    User.findById(userId).then(user => {
      if (!user) {
        throw new Error('User could not be found in database');
      }

      user.nickname = editedUser.nickname;
      user.email = editedUser.email;
      user.password = editedUser.password;

      user.save().then(saveResultUser => {
        if (!saveResultUser) {
          reply(Boom.badImplementation('Error updating user'));
        } else {
          reply(saveResultUser).code(200);
        }
      });
    }).catch(err => {
      console.log(err);
      reply(Boom.notFound('User not found for change'));
    });
  },

};

exports.authenticate = {

  auth: false,

  handler: function (request, reply) {
    const user = request.payload;
    User.findOne({ email: user.email }).then(foundUser => {
      if (foundUser && foundUser.password === user.password) {
        const token = Utils.createToken(foundUser);
        reply({ success: true, token: token, userId: foundUser._id }).code(201);
      } else {
        reply({ success: false, message: 'Authentication failed. User not found.' }).code(201);
      }
    }).catch(err => {
      reply(Boom.notFound('internal db failure'));
    });
  },

};
