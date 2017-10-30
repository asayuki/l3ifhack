'use strict';

process.env.PORT = 8001;
process.env.LOGGING = false;

const Code = require('code');
const Server = require('../server.js');
const { expect, it } = exports.lab = require('lab').script();

/**
 * Write tests here
 */