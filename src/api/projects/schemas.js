'use strict';

const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);

const createSchema = Joi.object({
  title: Joi.string().required(),
  text: Joi.string().required(),
  author: Joi.string().required()
});

const updateSchema = Joi.object({
  title: Joi.string().required(),
  text: Joi.string().required(),
  author: Joi.string().required()
});

const getSchema = Joi.object({
  id: Joi.objectId().required()
});

const deleteSchema = Joi.object({
  id: Joi.objectId().required()
});

const joinSchema = Joi.object({
  joinee: Joi.string().required()
})

const deleteJoineeSchema = Joi.object({
  id: Joi.objectId().required(),
  joinee: Joi.objectId().required()
});

module.exports = {
  createSchema,
  updateSchema,
  getSchema,
  deleteSchema,
  joinSchema,
  deleteJoineeSchema
};