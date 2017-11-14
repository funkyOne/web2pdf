FROM node:8

COPY package.json /
RUN npm install

COPY ./src .

ENTRYPOINT ["node", "server.js"]

EXPOSE 8080