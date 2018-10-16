FROM node:latest

ENV NPM_CONFIG_LOGLEVEL notice

# Add the remaining project files
ADD . .

RUN npm i

ENV HOST 0.0.0.0
ENV PORT 3000
EXPOSE 3000

# Build distribution
RUN npm run dev

CMD npm run dev
