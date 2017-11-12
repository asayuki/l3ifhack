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

Create a docker-compose.yml.
For production:
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

For development:
```
version: '3'

services:
  web:
    build:
      context: .
      dockerfile: Dockerfile.dev
    ports:
      - 8000:8000
    volumes:
      - ./src:/app
      - /app/node_modules                 # So we get rid of node_modules locally
      - ./package.json:/app/package.json
    depends_on:
      - mongo
      - redis
    environment:
      - LOGGING=true
      - MONGO_URL=mongodb://mongo/l3ifhack
      - REDIS=redis://redis:6379
      - HASH_SALT=HashForSalt
      - TOKEN_SECRET=TokenHashForJWT
    command: node ./node_modules/.bin/nodemon --legacy-watch --watch server.js --watch api server.js
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