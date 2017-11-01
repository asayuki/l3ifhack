'use strict';

const { createSchema, getSchema, deleteSchema } = require('./schema.js');
const { badImplementation, notFound, conflict } = require('boom');
const Project = require('./model');

exports.register = (server, options, next) => {
  server.route([
    {
      method: 'POST',
      path: '/api/projects',
      config: {
        validate: {
          payload: createSchema
        },
        handler: (request, response) => {
          let project = new Project();
          Object.assign(project, request.payload);
          project.save().then((newProject) => {
            return response({
              projectCreated: true,
              projectId: newProject._id
            }).code(201);
          }, (error) => {
            if (error.name === 'MongoError' && error.code == 11000) {
              return response(conflict('There is a project with that name already.'))
            } else {
              return response(badImplementation('There was an unsuspected error.'))
            }
          });
        }
      }
    }
  ]);

  next();
};

exports.register.attributes = {
  name: 'Projects',
  version: '1.0.0',
  description: 'Project plugin for L3ifhack',
  main: 'projects.js',
  author: 'neme <neme@whispered.se>',
  license: 'MIT'
};