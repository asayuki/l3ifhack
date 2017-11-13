# L3ifhack

Platform for creating and managing projects towards a Hackathon.

Basic functionality includes creating and listing active projects plus building teams around interesting projects in preparation for the event.

## Requirements
* Docker
* MongoDB-container
* Redis-container

or

* NodeJS
* NPM
* MongoDB
* Redis

## Setup

### Configurations

* `LOGGING` - For logging requests. true/false
* `MONGO_URL` - Url for MongoDB, example: mongo://mongoserver:27017
* `REDIS` - Url for Redis, example: redis://redisserver:6379
* `HASH_SALT` - For hashing passowrd
* `TOKEN_SECRET` - For JWT sign

Example of a docker-compose.yml for production:
```
version: '3'

services:
  web:
    image: l3ifhack
    ports:
      - 8000:8000
    depends_on:
      - mongo
      - redis
    environment:
      - LOGGING=false
      - MONGO_URL=mongodb://mongo/l3ifhack
      - REDIS=redis://redis:6379
      - TOKEN_SECRET=tokensecret
  mongo:
    image: mvertes/alpine-mongo
    volumes:
      - mongodata:/data/db
  redis:
    image: redis:4-alpine
    volumes:
      - redisdata:/data

volumes:
  mongodata:
  redisdata:
```

### Start server

`docker-compose up`

### Run tests

While server is up and running, use the following:

`docker-compose exec web node_modules/.bin/lab`

## Endpoints

All endpoints require that the user is logged in.

For users api, look up [hapi-users-plugin](http://github.com/asayuki/hapi-users-plugin)

* `POST /api/projects`
    * Default payload
        * `title` - Joi.string().required()
        * `text` - Joi.string().required()
        * `author` - Joi.string().required()
* `PUT /api/projects/{id}`
    * Default payload
        * `title` - Joi.string().required()
        * `text` - Joi.string().required()
        * `author` - Joi.string().required()
* `DELETE /api/projects/{id}`
* `GET /api/projects`
    * Default response
        * Array with all projects
* `GET /api/projects/{id}` (might change, or that title may also be supported)
    * Default response
        * Object with project
* `POST /api/projects/{id}/join`
    * Default payload
        * `joinee` - Joi.string().required()
* `DELETE /api/projects/{id}/joinee/{joineeId}`