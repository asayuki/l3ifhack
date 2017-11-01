'use strict';

const Hapi = require('hapi');
const Server = new Hapi.Server({});
const Mongoose = require('mongoose');

Server.connection({
    host: process.env.HOST || '0.0.0.0',
    port: process.env.PORT || '8000'
});

Server.register([
    require('./api/projects/projects')
], (registerError) => {
    if (registerError) {
        throw registerError;
    }

    Server.start((error) => {
        if (error) {
            throw error;
        }
        
        Mongoose.Promise = require('bluebird');
        Mongoose.connect(process.env.MONGO_URL + process.env.MONGO_DB, {
            useMongoClient: true
        }, (mongoError) => {
            if (mongoError) {
                throw mongoError;
            }
        });
    });
});

if (process.env.LOGGING === true) {
    Server.on('response', (request) => {
        console.log(`${request.info.remoteAddress}: ${request.method.toUpperCase()} ${request.url.path} --> ${request.response.statusCode}`);
    });
}

module.exports = Server;