'use strict';

const { createSchema, getSchema, deleteSchema } = require('./schema.js');
const { badImplementation, notFound, conflict } = require('boom');
const Idea = require('./model');

exports.register = (server, options, next) => {
  server.route([
    {
      method: 'POST',
      path: '/api/ideas',
      config: {
        validate: {
          payload: createSchema
        },
        handler: (request, response) => {
          let idea = new Idea();
          Object.assign(idea, request.payload);
          idea.save().then((newIdea) => {
            return response({
              ideaCreated: true,
              ideaId: newIdea._id
            }).code(201);
          }, (error) => {
            if (error.name === 'MongoError' && error.code == 11000) {
              return response(conflict('There is an idea with that name already.'))
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
  name: 'Ideas',
  version: '1.0.0',
  description: 'Idea plugin for L3ifhack',
  main: 'ideas.js',
  author: 'neme <neme@whispered.se>',
  license: 'MIT'
};