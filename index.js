const express = require('express');
const session = require('express-session');
const server = express();
const Sequelize = require('sequelize');
const moment = require('moment');

require('dotenv').config();

const port = process.env.PORT;
const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER, process.env.DB_PASS,
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: process.env.DB_DIALECT
    }
);

const Message = sequelize.define('Message', {
    name: {
      type: Sequelize.STRING,
      allowNull: false
    },
    content: {
      type: Sequelize.STRING(1024),
      allowNull: false
    }
});

server.set('view engine', 'ejs');
server.use(express.static('public'));
server.use(express.urlencoded({ extended: true }));
server.use(session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true
}));
server.locals.moment = moment;

server.get('/', async (request, response) => {
    const messages = await Message.findAll();
    response.render('index', { messages, 'session': request.session });
});

server.post('/message/create', async (request, response) => {
    const name = request.body.name;
    const content = request.body.content;
    if (name && content) {
        await Message.create({ name, content });
    } else {
        request.session.errorMessage = 'Имя или сообщение не могут быть пустыми';
    }

    response.redirect('/');
});

(async () => {
    await sequelize.sync();

    server.listen(port, () => console.log(`Guestbook is listening on port ${port}!`));    
})();
