'use strict';

const { createSchema, getSchema, deleteSchema } = require('./schema.js');
const { badImplementation, notFound, conflict, joinSchema } = require('boom');

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
    },

    {
      method: 'GET',
      path: '/api/projects/{id}',
      config: {
        validate: {
          params: getSchema
        },
        handler: (request, response) => {
          Project.findById(request.params.id).then((project) => {
            return response({project: project}).code(200);
          }, (error) => {
            return response(notFound('Could not find project'));
          });
        }
      }
    },

    {
      method: 'PUT',
      path: '/api/projects/{id}/upvote',
      config: {
        validate: {
          params: getSchema
        },
        handler: (request, response) => {
          Project.findById(request.params.id).then((project) => {
            Project.update({_id: request.params.id}, {$set: {
              votes: (project.votes + 1)
            }}).then((updatedProject) => {
              return response({
                voted: true
              }).code(200);
            }, (error) => {
              return response(badImplementation('Could not vote on the project'));
            });
          }, (error) => {
            return response(notFound('Could not find project'));
          });
        }
      }
    },

    {
      method: 'PUT',
      path: '/api/projects/{id}/downvote',
      config: {
        validate: {
          params: getSchema
        },
        handler: (request, response) => {
          Project.findById(request.params.id).then((project) => {
            Project.update({_id: request.params.id}, {$set: {
              votes: (project.votes - 1)
            }}).then((updatedProject) => {
              return response({
                voted: true
              }).code(200);
            }, (error) => {
              return response(badImplementation('Could not vote on the project'));
            });
          }, (error) => {
            return response(notFound('Could not find project'));
          });
        }
      }
    },

    {
      method: 'POST',
      path: '/api/projects/{id}/join',
      config: {
        validate: {
          params: joinSchema
        },
        handler: (request, response) => {
          Project.findById(request.params.id).then((project) => {
            Project.update({_id: request.params.id}, {$addToSet: {
              joinees: {
                name: request.payload.joinee
              }
            }}).then((updatedProject) => {
              console.log(updatedProject);
              return response({
                joined: true
              }).code(200);
            }, (error) => {
              return response(badImplementation('Could not join the project'));
            });
          }, (error) => {
            return response(notFound('Could not find project'));
          });
        }
      }
    },

    {
      method: 'DELETE',
      path: '/api/projects/{id}',
      config: {
        validate: {
          params: getSchema
        },
        handler: (request, response) => {
          Project.findByIdAndRemove(request.params.id).then((status) => {
            return response({
              removed: true
            }).code(200);
          }, (error) => {
            return response(notFound('Could not find project'));
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