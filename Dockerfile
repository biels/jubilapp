FROM node:latest

ENV NPM_CONFIG_LOGLEVEL notice

WORKDIR /usr/src/app

ADD . ./

RUN npm i

ENV HOST 0.0.0.0
ENV PORT 4100
EXPOSE 4100

ENTRYPOINT npm run start:dev
