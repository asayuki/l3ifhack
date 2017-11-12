'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const project = new Schema({
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
  joinees: [{
    name: {
      type: String,
      required: true
    } 
  }]
});

project.index({
  title: 'text'
});

module.exports = mongoose.model('Project', project);