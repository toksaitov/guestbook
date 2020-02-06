const express = require('express');
const session = require('express-session');
const server = express();
const mysql = require('mysql2');

require('dotenv').config();

const port = process.env.PORT;
const db = mysql.createConnection({
    host     : process.env.DB_HOST,
    port     : process.env.DB_PORT,
    user     : process.env.DB_USER,
    password : process.env.DB_PASS,
    database : process.env.DB_NAME
});

server.set('view engine', 'ejs');
server.use(express.static('public'));
server.use(express.urlencoded({ extended: true }));
server.use(session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true
}));

server.get('/', (request, response) => {
    db.query('SELECT * FROM messages', (error, results) => {
        if (error) {
            console.error(error);
        }

        response.render('index', {
            'messages': results,
            'session': request.session
        });
    });
});

server.post('/message/create', async (request, response) => {
    const name = request.body.name;
    const message = request.body.message;
    if (name && message) {
        db.query('INSERT INTO messages SET name=?, content=?', [name, message], (error) => {
            if (error) {
                console.error(error);
            }
            response.redirect('/');
        });
    } else {
        request.session.errorMessage = 'Имя или сообщение не могут быть пустыми';
        response.redirect('/');
    }
});

server.listen(port, () => console.log(`Guestbook is listening on port ${port}!`));
