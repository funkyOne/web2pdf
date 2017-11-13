FROM node:8

COPY package.json /
RUN npm install

COPY dl.js /
RUN chmod +x /dl.js

COPY server.js /
RUN chmod +x /server.js

COPY pdf-spawn.js /
RUN chmod +x /pdf-spawn.js

ENTRYPOINT ["node", "server.js"]

EXPOSE 8080