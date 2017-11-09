'use strict';

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

let dbURI = 'mongodb://localhost/tweeter';

// let dbURI = 'mongodb://donationuser:donationuser@ds027338.mlab.com:27338/donation';
if (process.env.NODE_ENV === 'production') {
  dbURI = process.env.MONGOLAB_URI;
}

mongoose.connect(dbURI);

mongoose.connection.on('connected', function () {
  console.log('Mongoose connected to ' + dbURI);
  if (process.env.NODE_ENV != 'production') {
    let seeder = require('mongoose-seeder');
    const data = require('./seeding-data.json');
    const User = require('./user');
    const Tweet = require('./tweet');
    seeder.seed(data, { dropDatabase: false, dropCollections: true }).then(dbData => {
      console.log('Seeding database ...');
      console.log(dbData);
    }).catch(err => {
      console.log(error);
    });
  }
});

mongoose.connection.on('error', function (err) {
  console.log('Mongoose connection error: ' + err);
});

mongoose.connection.on('disconnected', function () {
  console.log('Mongoose disconnected');
});
