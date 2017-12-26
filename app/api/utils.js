const jwt = require('jsonwebtoken');
const Lodash = require('lodash');
const User = require('../models/user');
const ObjectID = require('mongoose').mongo.ObjectId;

const TweeterPw = 'markus-biersack-Twitter-app_jWt-p@ssword';
const objectIdEquals = function (objId1, objId2) {
  const userId1 = (objId1 instanceof ObjectID) ? objId1 : new ObjectID(objId1);
  const userId2 = (objId2 instanceof ObjectID) ? objId2 : new ObjectID(objId2);
  return userId1.equals(userId2);
};

exports.tweeterPw = TweeterPw;

exports.createToken = function (user) {
  return jwt.sign({ id: user._id, email: user.email }, TweeterPw, {
    algorithm: 'HS256',
    expiresIn: '1h',
  });
};

exports.decodeToken = function (token) {
  let userInfo = {};
  try {
    let decoded = jwt.verify(token, TweeterPw);
    userInfo.userId = decoded.id;
    userInfo.email = decoded.email;
  } catch (e) {
  }

  return userInfo;
};

exports.validate = function (decoded, request, callback) {
  User.findOne({ _id: decoded.id }).then(user => {
    if (user != null) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  }).catch(err => {
    callback(null, false);
  });
};

exports.followingsIncludeObjectId = function (user, objectIdParam) {
  const userId = (objectIdParam instanceof ObjectID) ? objectIdParam : new ObjectID(objectIdParam);
  return Lodash.find(user.followings, objId => objectIdEquals(objId, userId)) !== undefined;
};
