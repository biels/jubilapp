FROM node:latest

# The official image has verbose logging; change it to npm's default
ENV NPM_CONFIG_LOGLEVEL notice

# Add the remaining project files
ADD . .

RUN npm i

# Set the default host/port
ENV HOST 0.0.0.0
ENV PORT 3000
EXPOSE 3000

# Build distribution
RUN npm run dev

# Start the server by default
CMD npm run dev
