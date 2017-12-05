'use strict';

const Assert = require('chai').assert;
const DonationService = require('./donation-service');
const Fixtures = require('./fixtures.json');
const Utils = require('../app/api/utils.js');

suite('Candidate API tests', function () {

  let users = Fixtures.users;
  let newUser = Fixtures.newUser;

  const DonationService = new DonationService(Fixtures.donationService);

  test('login-logout', function () {
    let returnedCandidates = DonationService.getCandidates();
    Assert.isNull(returnedCandidates);

    const response = DonationService.login(users[0]);
    returnedCandidates = DonationService.getCandidates();
    Assert.isNotNull(returnedCandidates);

    DonationService.logout();
    returnedCandidates = DonationService.getCandidates();
    Assert.isNull(returnedCandidates);
  });

});
