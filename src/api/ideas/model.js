'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const idea = new Schema({
  title: {
    type: String,
    required: true,
    index: {
      unique: true
    }
  },
  text: {
    type: String,
    required: true
  },
  author: {
    type: String,
    required: true
  },
  votes: {
    type: Number
  }
});

idea.index({
  title: 'text'
});

module.exports = mongoose.model('Idea', idea);