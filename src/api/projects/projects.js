'use strict';

const { createSchema, updateSchema, getSchema, deleteSchema, joinSchema, deleteJoineeSchema } = require('./schema.js');
const { badImplementation, notFound, conflict } = require('boom');

const Project = require('./model');

exports.register = (server, options, next) => {
  server.route([
    // Create project
    {
      method: 'POST',
      path: '/api/projects',
      config: {
        validate: {
          payload: createSchema
        },
        auth: {
          strategy: 'jwt'
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

    // Get project
    {
      method: 'GET',
      path: '/api/projects/{id}',
      config: {
        validate: {
          params: getSchema
        },
        auth: {
          strategy: 'jwt'
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

    // Get projects
    {
      method: 'GET',
      path: '/api/projects',
      config: {
        auth: {
          strategy: 'jwt'
        },
        handler: (request, response) => {
          Project.find().then((allProjects) => {
            return response({allProjects: allProjects}).code(200);
          }, (error) => {
            return response(notFound('No projects found'));
          });
        }
      }
    },

    // Update project
    {
      method: 'PUT',
      path: '/api/projects/{id}',
      config: {
        validate: {
          params: getSchema,
          payload: updateSchema
        },
        auth: {
          strategy: 'jwt'
        },
        handler: (request, response) => {
          Project.findByIdAndUpdate(request.params.id, {$set: {
            title: request.payload.title,
            text: request.payload.text,
            author: request.payload.author
          }}, {new: true}).then((editedProject) => {
            return response({
              edited: true,
              project: editedProject
            }).code(200);
          }, (error) => {
            return response(notFound('Could not find project'));
          });
        }
      }
    },

    // Delete project
    {
      method: 'DELETE',
      path: '/api/projects/{id}',
      config: {
        validate: {
          params: deleteSchema
        },
        auth: {
          strategy: 'jwt'
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
    },

    // Join project
    {
      method: 'POST',
      path: '/api/projects/{id}/join',
      config: {
        validate: {
          params: getSchema,
          payload: joinSchema
        },
        auth: {
          strategy: 'jwt'
        },
        handler: (request, response) => {
          Project.findByIdAndUpdate(request.params.id, {$addToSet: {
            joinees: {
              name: request.payload.joinee
            }
          }}, {new: true}).then((updatedProject) => {
            return response({
              project: updatedProject
            }).code(200);
          }, (error) => {
            return response(badImplementation('Could not join the project'));
          });
        }
      }
    },

    // Remove joinee from project
    {
      method: 'DELETE',
      path: '/api/projects/{id}/joinee/{joinee}',
      config: {
        validate: {
          params: deleteJoineeSchema
        },
        auth: {
          strategy: 'jwt'
        },
        handler: (request, response) => {
          Project.findByIdAndUpdate(request.params.id, {$pull: {
            joinees: {
              _id: request.params.joinee
            }
          }}, {new: true}).then((updatedProject) => {
            return response({
              joineeRemoved: true
            }).code(200);
          }, (error) => {
            return response(notFound('Could not remove from project'));
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
