'use strict';

const mongoose = require('mongoose');

const userSubSchema = {
  type: mongoose.Schema.types.ObjectId,
  ref: 'User',
};

const tweetSchema = mongoose.Schema({
  message: {
    type: mongoose.Schema.types.String,
    maxlength: 140,
    minlength: 1,
  },
  user: userSubSchema,
});

const Tweet = mongoose.model('Tweet', tweetSchema);
module.exports = Tweet;
