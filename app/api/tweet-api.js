'use strict';

const Tweet = require('../models/tweet');
const Joi = require('joi');
const Boom = require('boom');

exports.find = {

  auth: {
    strategy: 'jwt',
  },

  handler: function (request, reply) {
    Tweet.find({}).sort('-creation').populate('user').then(tweets => {
      reply(tweets);
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
    Tweet.findById(request.params.id).then(tweet => {
      if (tweet != null) {
        reply(tweet);
      } else {
        reply(Boom.notFound('id not found'));
      }
    }).catch(err => {
      reply(Boom.notFound('id not found'));
    });
  },

};

exports.findAllForUser = {

  auth: {
    strategy: 'jwt',
  },

  handler: function (request, reply) {
    const User = require('../models/user');
    User.findById(request.params.id).then(user => {
      if (!user) {
        throw Boom.notFound('User not found');
      }

      Tweet.find({ user: user._id }).sort('-creation').populate('user').then(tweets => {
        reply(tweets);
      });
    }).catch(err => {
      reply(Boom.isBoom(err) ? err : Boom.badImplementation('Error fetching tweets for user'));
    });
  },

};

exports.findFollowingsForUser = {

  auth: {
    strategy: 'jwt',
  },

  handler: function (request, reply) {
    const User = require('../models/user');
    User.findById(request.params.id).then(user => {
      if (!user) {
        throw Boom.notFound('User not found');
      }

      Tweet.find({ user: { $in: user.followings } })
          .populate('user')
          .sort('-creation')
          .then(tweets => {

            reply(tweets);

          });
    }).catch(err => {
      reply(Boom.isBoom(err) ? err : Boom.badImplementation('Error fetching followings for user'));
    });
  },

};

exports.create = {

  auth: {
    strategy: 'jwt',
  },

  handler: function (request, reply) {
    const User = require('../models/user');
    User.findById(request.payload.user).then(user => {
      if (!user) {
        throw Boom.notFound('User for new tweet not found');
      }

      let tweetContent = request.payload;
      if (tweetContent.image) {
        tweetContent.image.data = Buffer.from(tweetContent.image.data);
      }
      const tweet = new Tweet(request.payload);
      tweet.save().then(newTweet => {
        reply(newTweet).code(201);
      });
    }).catch(err => {
      reply(Boom.isBoom(err) ? err : Boom.badImplementation('Error creating new tweet'));
    });
  },

};

exports.deleteAll = {

  auth: {
    strategy: 'jwt',
  },

  handler: function (request, reply) {
    Tweet.remove({}).then(err => {
      reply({ message: 'Delete successful' }).code(204);
    }).catch(err => {
      reply(Boom.badImplementation('error removing tweets'));
    });
  },

};

exports.deleteOne = {

  auth: {
    strategy: 'jwt',
  },

  handler: function (request, reply) {
    Tweet.findByIdAndRemove(request.params.id).then(tweet => {
      if (!tweet) {
        throw Boom.notFound('Tweet not found for deletion');
      }
      reply({ message: 'Delete successful' }).code(204);
    }).catch(err => {
      reply(Boom.isBoom(err) ? err : Boom.badImplementation('Error deleting tweet'));
    });
  },

};

exports.deleteAllForUser = {

  auth: {
    strategy: 'jwt',
  },

  handler: function (request, reply) {
    const User = require('../models/user');
    User.findById(request.params.id).then(user => {
      if (!user) {
        throw Boom.notFound('User for deletion of tweets not found');
      }

      Tweet.remove({ user: user._id }).then(tweets => {
        reply({ message: 'Delete successful' }).code(204);
      }).catch(err => {
        reply(Boom.badImplementation('Error deleting tweets for user'));
      });
    }).catch(err => {
      reply(Boom.isBoom(err) ? err : Boom.badImplementation('Error deleting tweets for user'));
    });
  },

};

exports.countTweets = {

  auth: {
    strategy: 'jwt',
  },

  handler: function (request, reply) {
    Tweet.count({}).then(count => {
      reply({ count }).code(200);
    }).catch(err => {
      reply(Boom.internal('Error getting tweet stats'));
    });
  },

};
