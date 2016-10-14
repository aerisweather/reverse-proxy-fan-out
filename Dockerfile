FROM node:6.8.0

WORKDIR /opt/app

# Install npm deps
COPY package.json ./
COPY npm-shrinkwrap.json ./
RUN npm install

COPY ./ ./

ENTRYPOINT ["node", "main.js"]