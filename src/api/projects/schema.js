'use strict';

const Joi = require('joi');

const createSchema = Joi.object({
  title: Joi.string().required(),
  text: Joi.string().required(),
  author: Joi.string().required()
});

const getSchema = Joi.object({
  id: Joi.string().required()
});

const deleteSchema = Joi.object({
  id: Joi.string().required()
});

const joinSchema = Joi.object({
  id: Joi.string().required(),
  joinee: Joi.string().required()
})

module.exports = {
  createSchema,
  getSchema,
  deleteSchema,
  joinSchema
};