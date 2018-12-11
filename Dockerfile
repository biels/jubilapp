FROM node:latest

ENV NPM_CONFIG_LOGLEVEL notice

WORKDIR /usr/src/app

ADD . ./

RUN npm i

ENV HOST 0.0.0.0
ENV PORT 3000
EXPOSE 3000

ENTRYPOINT npm run start:dev
