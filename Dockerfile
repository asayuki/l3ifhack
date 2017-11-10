FROM node:8.2.1-alpine

RUN mkdir /app
WORKDIR /app

COPY ./package.json /app/

RUN apk --no-cache add --virtual native-deps \
  g++ gcc libgcc libstdc++ linux-headers make python && \
  npm install --quiet node-gyp -g &&\
  npm install --quiet && \
  npm rebuild bcrypt --build-from-source && \
  apk del native-deps

COPY ./src /app

CMD ["node", "server.js"]