'use strict';

const Hapi = require('hapi');
// require('./app/models/db');

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
    cookie: 'donation-cookie',
    isSecure: false,
    ttl: 24 * 60 * 60 * 1000,
    redirectTo: '/',
  });

  server.auth.default({
    strategy: 'standard',
  });

  server.route(require('./routes'));
  // server.route(require('./routesapi'));
  server.start((err) => {
    if (err) {
      throw err;
    }

    console.log('Server listening at:', server.info.uri);
  });

});
