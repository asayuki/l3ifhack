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
const Project = require('../api/projects/model');

// Clear collections before testing
Project.remove({}).then();

/**
 * Write tests here
 */
experiment('projects', () => {
  let projectId = null;

  test('Create project POST /api/projects', () => {
    return server.inject({
      method: 'POST',
      url: '/api/projects',
      payload: {
        title: 'My project',
        text: 'My project text',
        author: 'testauthor'
      }
    }).then((response) => {
      expect(response.statusCode).to.equal(201);
      expect(response.result.projectCreated).to.be.true();
      expect(response.result.projectId).to.be.an.object();

      projectId = response.result.projectId;
    })
  });

  test('Get project GET /api/projects/{id}', () => {
    return server.inject({
      method: 'GET',
      url: '/api/projects/' + projectId
    }).then((response) => {
      expect(response.statusCode).to.equal(200);
      expect(response.result.project).to.be.an.object();
      expect(response.result.project.title).to.equal('My project');
    });
  });

  test('Upvote project PUT /api/projects/{id}/upvote', () => {
    return server.inject({
      method: 'PUT',
      url: '/api/projects/' + projectId + '/upvote'
    }).then((response) => {
      expect(response.statusCode).to.equal(200);
      expect(response.result.project).to.be.an.object();
      expect(response.result.project.votes).to.equal(1);
    });
  });

  test('Downvote project PUT /api/projects/{id}/downvote', () => {
    return server.inject({
      method: 'PUT',
      url: '/api/projects/' + projectId + '/downvote'
    }).then((response) => {
      expect(response.statusCode).to.equal(200);
      expect(response.result.project).to.be.an.object();
      expect(response.result.project.votes).to.equal(0);
    });
  });

  test('Join project POST /api/projects/{id}/join', () => {
    return server.inject({
      metod: 'POST',
      url: '/api/projects/' + projectId + '/join',
      payload: {
        joinee: 'Testia Testus'
      }
    }).then((response) => {
      expect(response.statusCode).to.equal(201);
      expect(response.result.project).to.be.an.object();
      expect(response.result.project.joinees).to.contain('Testia Testus');
    });
  });

  test('Remove project DELETE /api/projects/{id}', () => {
    fail();
  });
});