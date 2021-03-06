'use strict';

process.env.PORT = 8001;
process.env.LOGGING = false;
process.env.MONGO_URL = 'mongodb://mongo/l3ifhacktest';
process.env.REDIS = 'redis://redis:6379';

const server = require('../server.js');
const { expect, fail } = require('code');
const { experiment, test, before } = exports.lab = require('lab').script();
const Mongoose = require('mongoose');
const Bcrypt = require('bcrypt');

Mongoose.Promise = require('bluebird');
const db = Mongoose.connect(process.env.MONGO_URL, {
  useMongoClient: true
});

// Models
const Project = require('../api/projects/model');
const User = server.plugins['hapi-users-plugin'].Usermodel;

// Clear collections before testing
Project.remove({}).then();
User.remove({}).then();

// Some variables we can ser later
let projectId = null;
let joineeId = null;
let userToken = null;
let commentId = null;

experiment('Users', () => {
  before (() => {
    return new Promise((resolve) => {
      let user = new User();
      user.username = 'testuser';
      user.admin = true;

      Bcrypt.genSalt(10, (error, salt) => {
        Bcrypt.hash('testpassword', salt, (error, hash) => {
          user.password = hash;
          user.save().then(() => {
            resolve();
          });
        });
      });
    });
  });

  test('Login user', () => {
    return server.inject({
        method: 'POST',
        url: '/api/users/authenticate',
        payload: {
            username: 'testuser',
            password: 'testpassword'
        }
    }).then((response) => {
        expect(response.statusCode).to.equal(200);
        expect(response.headers.authorization).to.be.a.string();
        userToken = response.headers.authorization;
    });
  });
});

experiment('Create project(s)', () => {
  test('Create project POST /api/projects', () => {
    return server.inject({
      method: 'POST',
      url: '/api/projects',
      payload: {
        title: 'My project',
        text: 'My project text',
        author: 'testauthor'
      },
      headers: {
        'Authorization': userToken
      }
    }).then((response) => {
      expect(response.statusCode).to.equal(201);
      expect(response.result.projectCreated).to.be.true();
      expect(response.result.projectId).to.be.an.object();

      projectId = response.result.projectId;
    });
  });

  test('Create project with empty title POST /api/projects', () => {
    return server.inject({
      method: 'POST',
      url: '/api/projects',
      payload: {
        title: '',
        text: 'text',
        author: 'author'
      },
      headers: {
        'Authorization': userToken
      }
    }).then((response) => {
      expect(response.statusCode).to.equal(400);
    });
  });

  test('Create project POST with invalid payload /api/projects', () => {
    return server.inject({
      method: 'POST',
      url: '/api/projects',
      payload: {
        title: '',
        text: '',
        author: ''
      },
      headers: {
        'Authorization': userToken
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
      },
      headers: {
        'Authorization': userToken
      }
    }).then((response) => {
      expect(response.statusCode).to.equal(409);
    })
  });
});

experiment('Join / Dejoin from project', () => {
  test('Join project POST /api/projects/{id}/join', () => {
    return server.inject({
      method: 'POST',
      url: '/api/projects/' + projectId + '/join',
      payload: {
        joinee: 'Testia Testus'
      },
      headers: {
        'Authorization': userToken
      }
    }).then((response) => {
      expect(response.statusCode).to.equal(200);
      expect(response.result.project).to.be.an.object();
      expect(response.result.project.joinees).to.be.an.array();
      expect(response.result.project.joinees[0].name).to.contain('Testia Testus');
      joineeId = response.result.project.joinees[0]._id;
    });
  });

  test('Dejoin a joinee from a project DELETE /api/projects/{projectId}/joinee/{joineeId}', () => {
    return server.inject({
      method: 'DELETE',
      url: '/api/projects/' +  projectId + '/joinee/' + joineeId,
      headers: {
        'Authorization': userToken
      }
    }).then((response) => {
      expect(response.statusCode).to.equal(200);
      expect(response.result.joineeRemoved).to.be.true();
    });
  });
})

experiment('Get project(s)', () => {
  test('Get project GET /api/projects/{id}', () => {
    return server.inject({
      method: 'GET',
      url: '/api/projects/' + projectId,
      headers: {
        'Authorization': userToken
      }
    }).then((response) => {
      expect(response.statusCode).to.equal(200);
      expect(response.result.project).to.be.an.object();
      expect(response.result.project.title).to.equal('My project');
      expect(response.result.project.joinees).to.be.empty();
    });
  });

  test('Get all projects GET /api/projects', () => {
    return server.inject({
      method: 'GET',
      url: '/api/projects',
      headers: {
        'Authorization': userToken
      }
    }).then((response) => {
      expect(response.statusCode).to.equal(200);
      expect(response.result.allProjects).to.be.an.array();
    });
  });
});

experiment('Edit project(s)', () => {
  test('Edit project PUT /api/projects', () => {
    return server.inject({
      method: 'PUT',
      url: '/api/projects/' +  projectId,
      payload: {
        title: 'My edited project',
        text: 'My edited project text',
        author: 'Edited testauthor'
      },
      headers: {
        'Authorization': userToken
      }
    }).then((response) => {
      expect(response.statusCode).to.equal(200);
      expect(response.result.project.title).to.equal('My edited project');
      expect(response.result.project.text).to.equal('My edited project text');
      expect(response.result.project.author).to.equal('Edited testauthor');
      expect(response.result.edited).to.be.true();
    });
  });

  test('Edit a project PUT with invalid title data /api/projects', () => {
    return server.inject({
      method: 'PUT',
      url: '/api/projects/' +  projectId,
      payload: {
        title: ''
      },
      headers: {
        'Authorization': userToken
      }
    }).then((response) => {
      expect(response.statusCode).to.equal(400);
    });
  });

  test('Edit a project PUT with invalid id', () => {
    return server.inject({
      method: 'PUT',
      url: '/api/projects/invalidid',
      payload: {
        title: ''
      },
      headers: {
        'Authorization': userToken
      }
    }).then((response) => {
      expect(response.statusCode).to.equal(400);
    });
  });
});

experiment('Update project(s)', () => {
  test('Upvote project POST /api/projects/{id}/upvote', () => {
    return server.inject({
      method: 'POST',
      url: '/api/projects/' + projectId + '/upvote',
      headers: {
        'Authorization': userToken
      }
    }).then((response) => {
      expect(response.statusCode).to.equal(200);
      expect(response.result.upvoted).to.be.true();
    });
  });
});

experiment('Comment on project', () => {
  test('Comment on project with invalid project id', () => {
    return server.inject({
      method: 'POST',
      url: '/api/projects/invalidid/comment',
      headers: {
        'Authorization': userToken
      }
    }).then((response) => {
      expect(response.statusCode).to.equal(400);
    });
  });

  test('Comment on project with empty payload POST /api/projects/{id}/comment', () => {
    return server.inject({
      method: 'POST',
      url: '/api/projects/' + projectId + '/comment',
      headers: {
        'Authorization': userToken
      },
      payload: {
        'name': '',
        'comment': ''
      }
    }).then((response) => {
      expect(response.statusCode).to.equal(400);
    });
  });

  test('Comment on project POST /api/projects/{id}/comment', () => {
    return server.inject({
      method: 'POST',
      url: '/api/projects/' + projectId + '/comment',
      headers: {
        'Authorization': userToken
      },
      payload: {
        'name': 'MyName',
        'comment': 'My comment'
      }
    }).then((response) => {
      expect(response.statusCode).to.equal(200);

      commentId = response.result.project.comments[0]._id;
    });
  });

  test('Listing projects should show 1 comment on 1 project', () => {
    return server.inject({
      method: 'GET',
      url: '/api/projects',
      headers: {
        'Authorization': userToken
      }
    }).then((response) => {
      expect(response.statusCode).to.equal(200);
      expect(response.result.allProjects[0].numComments).to.equal(1);
    });
  });

  test('Fetching project should show 1 comment', () => {
    return server.inject({
      method: 'GET',
      url: '/api/projects/' + projectId,
      headers: {
        'Authorization': userToken
      }
    }).then((response) => {
      expect(response.statusCode).to.equal(200);
      expect(response.result.project.comments).to.be.an.array();
      expect(response.result.project.comments[0].name).to.equal('MyName');
    });
  });

  test('Remove comment on project DELETE /api/projects/{id}/comment/{commentId}', () => {
    return server.inject({
      method: 'DELETE',
      url: '/api/projects/' +  projectId + '/comment/' + commentId,
      headers: {
        'Authorization': userToken
      }
    }).then((response) => {
      expect(response.statusCode).to.equal(200);
      expect(response.result.commentRemoved).to.be.true();
    });
  });

  test('Fetching project should show 0 comments', () => {
    return server.inject({
      method: 'GET',
      url: '/api/projects/' + projectId,
      headers: {
        'Authorization': userToken
      }
    }).then((response) => {
      expect(response.statusCode).to.equal(200);
      expect(response.result.project.comments).to.be.empty()
    });
  });
});

experiment('Remove project(s)', () => {
  test('Remove project DELETE /api/projects/{id}', () => {
    return server.inject({
      method: 'DELETE',
      url: '/api/projects/' +  projectId,
      headers: {
        'Authorization': userToken
      }
    }).then((response) => {
      expect(response.statusCode).to.equal(200);
      expect(response.result.removed).to.be.true();
    });
  });
});
