FROM ghcr.io/iron-fish/ironfish:latest

RUN apt-get update
RUN apt-get install sysstat ifstat -y
RUN npm install pm2 typescript ts-node @types/express @types/node -g
RUN pm2 startup

WORKDIR /usr/src/ironfish.metrics

COPY ironfish.metrics/package.* .
RUN npm install

COPY ironfish.metrics .

RUN tsc -b

RUN sed -i 's+!/bin/sh+!/bin/sh\npm2 start /usr/src/ironfish.metrics/dist/index.js+g' /usr/src/app/entrypoint.sh

WORKDIR /usr/src/app

