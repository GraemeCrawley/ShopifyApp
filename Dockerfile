# Instructions copied from - https://hub.docker.com/_/python/
FROM node:6

#Create app directory
RUN mkdir -p /shopifyapp
WORKDIR /usr/src/app

# Install app dependencies
RUN npm init --yes
COPY package.json /usr/src/app/
RUN npm install
RUN npm install express --save
RUN npm install graphql express-graphql --save
RUN npm install lodash --save

#Bundle app source
COPY . /usr/src/app

# tell the port number the container should expose
EXPOSE 8081

# run the command
CMD ["node", "server.js"]



