'use strict';

const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  nickname: String,
  email: String,
  password: String,
  followings: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }], // Array of User to follow
});

const User = mongoose.model('User', userSchema);
module.exports = User;
