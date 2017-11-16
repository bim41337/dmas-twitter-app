'use strict';

const Joi = require('joi');
const Lodash = require('lodash');

const User = require('../models/user');
const Tweet = require('../models/tweet');
const ObjectID = require('mongoose').mongo.ObjectId;

const titleSearchUser = 'Search users - Tweeter';
const titleViewUser = 'View user - Tweeter';
const titleSettings = 'Edit account details - Tweeter';

// ### HELPER FUNCTIONS ###
const objectIdEquals = function (objId1, objId2) {
  const userId1 = (objId1 instanceof ObjectID) ? objId1 : new ObjectID(objId1);
  const userId2 = (objId2 instanceof ObjectID) ? objId2 : new ObjectID(objId2);
  return userId1.equals(userId2);
}
const followingsIncludeObjectId = function (user, objectIdParam) {
  const userId = (objectIdParam instanceof ObjectID) ? objectIdParam : new ObjectID(objectIdParam);
  return Lodash.find(user.followings, objId => objectIdEquals(objId, userId)) !== undefined;
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
    const currentUserMail = request.auth.credentials.loggedInUser;
    User.findOne({ email: currentUserMail }).then(foundUser => {
      if (!foundUser) {
        throw new Error('User could not be found in database (' + currentUserMail + ')');
      }

      return foundUser;
    }).then(currentUser => {
      const viewedUserId = request.query.userId;
      User.findById(viewedUserId).then(foundUser => {
        if (!foundUser) {
          throw new Error('User could not be found in database (' + viewedUserId + ')');
        }

        return {
          currentUser: currentUser,
          viewedUser: foundUser,
        };
      }).then(result => {
        User.count({ followings: result.viewedUser._id }).then(followersCount => {
          result.viewedUser.followers = followersCount;

          Tweet.find({ user: result.viewedUser }).sort('-creation').then(tweets => {

            reply.view('view-user', {
              title: titleViewUser,
              user: result.currentUser,
              viewedUser: result.viewedUser,
              tweets: tweets,
              isFollowed: followingsIncludeObjectId(result.currentUser, result.viewedUser._id),
            });

          });

        });
      });
    }).catch(err => {
      console.log(err);
      reply.redirect('/home');
    });
  },

};

exports.followUser = {

  handler: function (request, reply) {
    const currentUserMail = request.auth.credentials.loggedInUser;
    User.findOne({ email: currentUserMail }).then(foundUser => {
      if (!foundUser) {
        throw new Error('User could not be found in database (' + currentUserMail + ')');
      }

      const followUserId = request.payload.userId;
      if (!followingsIncludeObjectId(foundUser, followUserId)) {
        foundUser.followings.push(followUserId);
        foundUser.save().then(result => {
          reply.redirect('/followings');
        });
      } else {
        console.log('Ignored duplicate user following request.');
        reply.redirect('/home');
      }
    }).catch(err => {
      console.log(err);
      reply.redirect('/home');
    });
  },

};

exports.unfollowUser = {

  handler: function (request, reply) {
    const currentUserMail = request.auth.credentials.loggedInUser;
    User.findOne({ email: currentUserMail }).then(foundUser => {
      if (!foundUser) {
        throw new Error('User could not be found in database (' + currentUserMail + ')');
      }

      const followUserId = request.payload.userId;
      if (followingsIncludeObjectId(foundUser, followUserId)) {
        User.updateOne({ _id: foundUser._id }, { $pullAll: { followings: [followUserId] } })
            .then(result => {
              reply.redirect('/home');
            });
      } else {
        console.log('Ignored invalid unfollowing request.');
        reply.redirect('/home');
      }
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

exports.logout = {

  auth: false,

  handler: function (request, reply) {
    request.cookieAuth.clear();
    reply.redirect('/');
  },

};
