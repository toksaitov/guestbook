const express = require('express');
const session = require('express-session');
const server = express();
const fs = require('fs');
const path = require('path');
const util = require('util');
const writeFile = util.promisify(fs.writeFile);

require('dotenv').config();

const port = 80;
const messagesFilePath = path.join(__dirname, 'data', 'messages.json');

let messages;
try {
    messages = JSON.parse(fs.readFileSync(messagesFilePath, { 'encoding': 'utf8' }));
} catch (error) {
    console.error(error);
    messages = [];
}

server.set('view engine', 'ejs');
server.use(express.static('public'));
server.use(express.urlencoded({ extended: true }));
server.use(session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true
}));

server.get('/', (request, response) => {
    response.render('index', {
        'messages': messages,
        'session': request.session
    });
});

server.post('/message/create', async (request, response) => {
    const name = request.body.name;
    const message = request.body.message;
    if (name && message) {
        messages.push({ name, message });
        try {
            await writeFile(messagesFilePath, JSON.stringify(messages));
        } catch(error) {
            console.error(error);
        }
        response.redirect('/');
    } else {
        request.session.errorMessage = 'Имя или сообщение не могут быть пустыми';
        response.redirect('/');
    }
});

server.listen(port, () => console.log(`Guestbook is listening on port ${port}!`));
