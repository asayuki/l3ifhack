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

const upvoteSchema = Joi.object({
  upvote: Joi.boolean().required()
});

const downvoteSchema = Joi.object({
  downvote: Joi.boolean().required()
});

module.exports = {
  createSchema,
  getSchema,
  deleteSchema,
  upvoteSchema,
  downvoteSchema
};