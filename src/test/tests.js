'use strict';

process.env.PORT = 8001;
process.env.LOGGING = false;
process.env.MONGO_DB = 'l3ifhacktest';

const server = require('../server.js');
const { expect, fail } = require('code');
const { experiment, test } = exports.lab = require('lab').script();
const Mongoose = require('mongoose');

Mongoose.Promise = require('bluebird');
const db = Mongoose.connect(process.env.MONGO_URL + process.env.MONGO_DB, {
  useMongoClient: true
});

// Models
const Idea = require('../api/ideas/model');

// Clear collections before testing
Idea.remove({}).then();

/**
 * Write tests here
 */
experiment('ideas', () => {
  let ideaId = null;

  test('Create idea POST /api/ideas', () => {
    return server.inject({
      method: 'POST',
      url: '/api/ideas',
      payload: {
        title: 'My idea',
        text: 'My idea text',
        author: 'testauthor'
      }
    }).then((response) => {
      expect(response.statusCode).to.equal(201);
      expect(response.result.ideaCreated).to.be.true();
      expect(response.result.ideaId).to.be.an.object();

      ideaId = response.result.ideaId;
    })
  });

  test('Get idea GET /api/ideas/{id}', () => {
    return server.inject({
      method: 'GET',
      url: '/api/ideas/' + ideaId
    }).then((response) => {
      expect(response.statusCode).to.equal(200);
      expect(response.result.idea).to.be.an.object();
      expect(response.result.idea.title).to.equal('My idea');
    });
  });

  test('Upvote idea PUT /api/ideas/{id}/upvote', () => {
    fail();
  });

  test('Downvote idea PUT /api/ideas/{id}/downvote', () => {
    fail();
  });

  test('Join idea POST /api/ideas/{id}/join', () => {
    fail();
  });

  test('Remove idea DELETE /api/ideas/{id}', () => {
    fail();
  });
});