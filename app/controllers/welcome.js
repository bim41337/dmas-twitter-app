'use strict';

exports.welcome = {

  auth: false,

  handler: function (request, reply) {
    reply.view('welcome', { title: 'Welcome to Tweeter' });
  },

};
