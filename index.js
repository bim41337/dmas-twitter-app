'use strict';

const Hapi = require('hapi');
const Handlebars = require('handlebars');
require('./app/models/db');

Handlebars.registerHelper('formatDate', datetime => {
  const Moment = require('moment-timezone');
  if (datetime instanceof Date) {
    return Moment(datetime).tz('Europe/Berlin').format('DD.MM.YYYY HH:mm');
  } else {
    return '';
  }
});
Handlebars.registerHelper('formatImage', imageData => {
  if (imageData) {
    return imageData.toString('base64');
  } else {
    return '';
  }
});

let server = new Hapi.Server();

server.connection({ port: process.env.PORT || 4000 });

server.register([require('inert'), require('vision'), require('hapi-auth-cookie')], err => {

  if (err) {
    throw err;
  }

  server.views({
    engines: {
      hbs: require('handlebars'),
    },
    relativeTo: __dirname,
    path: './app/views',
    layoutPath: './app/views/layout',
    partialsPath: './app/views/partials',
    layout: true,
    isCached: false,
  });

  server.auth.strategy('standard', 'cookie', {
    password: 'markus-biersack-Twitter-app_c00kie-p@ssword',
    cookie: 'bim41337-tweeter-cookie',
    isSecure: false,
    ttl: 24 * 60 * 60 * 1000,
    redirectTo: '/login',
  });

  server.auth.default({
    strategy: 'standard',
  });

  server.route(require('./routes'));
  server.route(require('./routes-api'));
  server.start((err) => {
    if (err) {
      throw err;
    }

    console.log('Server listening at:', server.info.uri);
  });

});
