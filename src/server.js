'use strict';

const Hapi = require('hapi');
const Server = new Hapi.Server({});

Server.connection({
    host: process.env.HOST || '0.0.0.0',
    port: process.env.PORT || '8000'
});

Server.register([], (registerError) => {
    if (registerError)
        throw registerError;
    
    Server.start((error) => {
        if (error)
            throw error;
    });
});

if (process.env.LOGGING) {
    Server.on('response', (request) => {
        console.log(`${request.info.remoteAddress}: ${request.method.toUpperCase()} ${request.url.path} --> ${request.response.statusCode}`);
    });
}

module.exports = Server;