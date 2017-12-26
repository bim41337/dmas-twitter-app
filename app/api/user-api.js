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
    User.findById(request.params.id).then(user => {
      if (!user) {
        throw Boom.notFound('id not found');
      }

      User.count({ followings: user._id }).then(followersCount => {
        reply({ user, followersCount });
      });
    }).catch(err => {
      reply(Boom.isBoom(err) ? err : Boom.badImplementation('Error fetching user'));
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

exports.findFollowingsForUser = {

  auth: {
    strategy: 'jwt',
  },

  handler: function (request, reply) {
    const User = require('../models/user');
    User.findById(request.params.id).populate('followings').then(user => {
      if (!user) {
        throw Boom.notFound('User not found');
      }

      reply(user.followings);
    }).catch(err => {
      reply(Boom.isBoom(err) ? err : Boom.badImplementation('Error fetching followings for user'));
    });
  },

};

exports.addFollowing = {

  auth: {
    strategy: 'jwt',
  },

  handler: function (request, reply) {
    User.findById(request.params.id).then(foundUser => {
      if (!foundUser) {
        throw new Error('User could not be found in database');
      }

      const followUserId = request.payload.follId;
      if (!Utils.followingsIncludeObjectId(foundUser, followUserId)) {
        foundUser.followings.push(followUserId);
        foundUser.save().then(saveResultUser => {
          if (!saveResultUser) {
            reply(Boom.badImplementation('Error updating user'));
          } else {
            reply(saveResultUser).code(200);
          }
        });
      }
    }).catch(err => {
      reply(Boom.isBoom(err) ? err : Boom.badImplementation('Error adding following for user'));
    });
  },

};

exports.removeFollowing = {

  auth: {
    strategy: 'jwt',
  },

  handler: function (request, reply) {
    const userId = request.params.id;
    User.findById(userId).then(foundUser => {
      if (!foundUser) {
        throw new Error('User could not be found in database');
      }

      const followUserId = request.payload.follId;
      if (Utils.followingsIncludeObjectId(foundUser, followUserId)) {
        User.updateOne({ _id: userId }, { $pullAll: { followings: [followUserId] } })
            .then(result => {
              reply(result).code(200);
            });
      }
    }).catch(err => {
      reply(Boom.isBoom(err) ? err : Boom.badImplementation('Error removing following for user'));
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
