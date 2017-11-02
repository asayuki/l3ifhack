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
  let joineeId = null;

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

  test('Create project POST with invalid payload /api/projects', () => {
    return server.inject({
      method: 'POST',
      url: '/api/projects',
      payload: {
        title: '',
        text: '',
        author: ''
      }
    }).then((response) => {
      expect(response.statusCode).to.equal(400);
    })
  });

  test('Create project POST with same name (title) /api/projects', () => {
    return server.inject({
      method: 'POST',
      url: '/api/projects',
      payload: {
        title: 'My project',
        text: 'My project text',
        author: 'testauthor'
      }
    }).then((response) => {
      expect(response.statusCode).to.equal(409);
    })
  });

  test('Upvote project PUT /api/projects/{id}/upvote', () => {
    return server.inject({
      method: 'PUT',
      url: '/api/projects/' + projectId + '/upvote'
    }).then((response) => {
      expect(response.statusCode).to.equal(200);
      expect(response.result.voted).to.be.true();
    });
  });

  test('Downvote project PUT /api/projects/{id}/downvote', () => {
    return server.inject({
      method: 'PUT',
      url: '/api/projects/' + projectId + '/downvote'
    }).then((response) => {
      expect(response.statusCode).to.equal(200);
      expect(response.result.voted).to.be.true();
    });
  });

  test('Join project POST /api/projects/{id}/join', () => {
    return server.inject({
      method: 'POST',
      url: '/api/projects/' + projectId + '/join',
      payload: {
        joinee: 'Testia Testus'
      }
    }).then((response) => {
      expect(response.statusCode).to.equal(200);
      expect(response.result.project).to.be.an.object();
      expect(response.result.project.joinees).to.be.an.array();
      expect(response.result.project.joinees[0].name).to.contain('Testia Testus');

      joineeId = response.result.project.joinees[0]._id;
    });
  });

  test('Dejoin a joinee from a project DELETE /api/projects/{id}/joinee/{joinee}', () => {
    return server.inject({
      method: 'DELETE',
      url: '/api/projects/' + projectId + '/joinee/' + joineeId
    }).then((response) => {
      expect(response.statusCode).to.equal(200);
      expect(response.result.joineeRemoved).to.be.true();
    });
  });

  test('Get project GET /api/projects/{id}', () => {
    return server.inject({
      method: 'GET',
      url: '/api/projects/' + projectId
    }).then((response) => {
      expect(response.statusCode).to.equal(200);
      expect(response.result.project).to.be.an.object();
      expect(response.result.project.title).to.equal('My project');
      expect(response.result.project.joinees).to.be.empty();
      expect(response.result.project.votes).to.be.equal(0);
    });
  });

  test('Edit project PUT /api/projects/{id}/edit', () => {
    return server.inject({
      method: 'PUT',
      url: '/api/projects/' + projectId + '/edit',
      payload: {
        title: 'My edited project',
        text: 'My edited project text',
        author: 'Edited testauthor'
      }
    }).then((response) => {
      expect(response.statusCode).to.equal(200);
      expect(response.result.project.title).to.equal('My edited project');
      expect(response.result.project.text).to.equal('My edited project text');
      expect(response.result.project.author).to.equal('Edited testauthor');
      expect(response.result.edited).to.be.true();
    });
  });

  test('Edit a project PUT with invalid title data /api/projects/{id}/edit', () => {
    return server.inject({
      method: 'PUT',
      url: '/api/projects/' + projectId + '/edit',
      payload: {
        title: '',
      }
    }).then((response) => {
      expect(response.statusCode).to.equal(400);
    });
  })

  test('Remove project DELETE /api/projects/{id}', () => {
    return server.inject({
      method: 'DELETE',
      url: '/api/projects/' + projectId
    }).then((response) => {
      expect(response.statusCode).to.equal(200);
      expect(response.result.removed).to.be.true();
    });
  });
});
