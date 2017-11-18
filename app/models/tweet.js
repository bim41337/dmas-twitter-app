'use strict';

const mongoose = require('mongoose');
const moment = require('moment-timezone');

const tweetSchema = mongoose.Schema({
  message: {
    type: mongoose.Schema.Types.String,
    maxlength: 140,
    minlength: 1,
  },
  image: {
    data: mongoose.Schema.Types.Buffer,
    contentType: mongoose.Schema.Types.String,
  },
  creation: {
    type: mongoose.Schema.Types.Date,
    min: moment('2017-10-28'),
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
});

const Tweet = mongoose.model('Tweet', tweetSchema);
module.exports = Tweet;
