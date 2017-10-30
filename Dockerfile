FROM node:8.2.1-alpine

RUN mkdir /app
WORKDIR /app

COPY ./package.json /app/

RUN npm install

COPY ./src /app

CMD ["node", "server.js"]