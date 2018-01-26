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

const sortSchema = Joi.object({
  sortBy: Joi.string().valid('title', 'createdAt', 'updatedAt', '_id'),
  order: Joi.string().valid('desc', 'asc').default('desc')
});

const getSchema = Joi.object({
  id: Joi.objectId().required()
});

const deleteSchema = Joi.object({
  id: Joi.objectId().required()
});

const commentSchema = Joi.object({
  name: Joi.string().required(),
  comment: Joi.string().required()
});

const joinSchema = Joi.object({
  joinee: Joi.string().required()
})

const deleteJoineeSchema = Joi.object({
  id: Joi.objectId().required(),
  joinee: Joi.objectId().required()
});

const deleteCommentSchema = Joi.object({
  id: Joi.objectId().required(),
  commentId: Joi.objectId().required()
});

module.exports = {
  createSchema,
  updateSchema,
  getSchema,
  deleteSchema,
  joinSchema,
  deleteJoineeSchema,
  commentSchema,
  deleteCommentSchema,
  sortSchema
};