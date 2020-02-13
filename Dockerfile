FROM node:12.15.0-buster

EXPOSE 80
WORKDIR /guestbook

COPY package.json /guestbook
RUN npm install

COPY . /guestbook

CMD ["npm", "start"]