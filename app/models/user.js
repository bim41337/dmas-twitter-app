'use strict';

const mongoose = require('mongoose');

const followingsSubSchema = {
  type: mongoose.Schema.types.ObjectId,
  ref: 'User',
};

const userSchema = mongoose.Schema({
  nickname: String,
  email: String,
  password: String,
  followings: [followingsSubSchema], // Array of User to follow
});

const User = mongoose.model('User', userSchema);
module.exports = User;
