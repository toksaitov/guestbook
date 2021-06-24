const express = require('express')
const session = require('express-session')
const mysql = require('mysql2')
require('dotenv').config()

const app = express()
const port = 8080

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
});

app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(express.urlencoded({ extended: false }))
app.use(session({
  secret: 'super mega secret',
  resave: false,
  saveUninitialized: true
}))

app.get('/', (request, response) => {
  const userID = request.session.id
  const session = request.session
  const message = null

  db.query('SELECT * FROM message;', (error, messages) => {
    if (error) {
      console.error(error)
      return response.status(503).end()
    }
    response.render('index', { session, messages, message, userID })
  })
})

function validateName(name, request, response, location = '/') {
  if (name.trim() === '') {
    request.session.errorMessage = "Name can't be empty"
    response.redirect(location)
    return false
  }
  return true
}

// TODO: more checks are required

function validateContent(content, request, response, location = '/') {
  if (content.trim() === '') {
    request.session.errorMessage = "Message content can't be empty"
    response.redirect(location)
    return false
  }
  return true
}

app.post('/create-message', (request, response) => {
  const userID = request.session.id

  const name = request.body.name
  if (!validateName(name, request, response)) return

  const content = request.body.content
  if (!validateContent(content, request, response)) return
  
  const query = 'INSERT INTO message (user_id, name, content) VALUES (?, ?, ?);'
  db.query(query, [userID, name, content], error => {
    if (error) {
      console.error(error)
      return response.status(503).end()
    }
    response.redirect('/')
  })
})

app.post('/delete-message/:id', (request, response) => {
  const id = request.params.id
  const userID = request.session.id
  
  const query = "DELETE FROM message WHERE (message_id = ? and user_id = ?);"
  db.query(query, [id, userID], (error, result) => {
    if (error) {
      console.error(error)
      return response.status(503).end()
    }
    if (result.affectedRows === 0) {
      return response.status(403).end()
    }
    response.redirect('/')
  })
})

app.get('/edit-message/:id', (request, response) => {
  const id = request.params.id
  const session = request.session
  const userID = request.session.id
  
  const query = 'SELECT * FROM message WHERE (message_id = ? AND user_id = ?);'
  db.query(query, [id, userID], (error, messages) => {
    if (error) {
      console.error(error)
      return response.status(503).end()
    }
    if (messages.length !== 1) {
      return response.status(403).end()
    }
    const message = messages[0]
    response.render('edit_message', { message, session })
  })
})

app.post('/edit-message/:id', (request, response) => {
  const id = request.params.id
  const userID = request.session.id

  const name = request.body.name
  if (!validateName(name, request, response, `/edit-message/${id}`)) return

  const content = request.body.content
  if (!validateContent(content, request, response, `/edit-message/${id}`)) return

  const query = 'UPDATE message SET name = ?, content = ? WHERE (message_id = ? AND user_id = ?);'
  db.query(query, [name, content, id, userID], (error, result) => {
    if (error) {
      console.error(error)
      return response.status(503).end()
    }
    if (result.affectedRows === 0) {
      return response.status(403).end()
    }
    response.redirect('/')
  })
})

app.listen(port, () => {
  console.log(`Guestbook is listening at http://auca.space:${port}`)
})
