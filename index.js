const express = require('express')
const session = require('express-session')
const uuid = require('uuid')
const fs = require('fs')

const app = express()
const port = 8080

let messages
try {
  messages = JSON.parse(fs.readFileSync('messages.json', 'utf8'))
} catch(ignored) {
  messages = []
}

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
  response.render('index', { session, messages, message, userID })
})

function validateName(name, request, response, location = '/') {
  if (name.trim() === '') {
    request.session.errorMessage = "Name can't be empty"
    response.redirect(location)
    return false
  }
  return true
}

function validateContent(content, request, response, location = '/') {
  if (content.trim() === '') {
    request.session.errorMessage = "Message content can't be empty"
    response.redirect(location)
    return false
  }
  return true
}

app.post('/create-message', (request, response) => {
  const id = uuid.v4()
  const userID = request.session.id

  const name = request.body.name
  if (!validateName(name, request, response)) return

  const content = request.body.content
  if (!validateContent(content, request, response)) return
  
  messages = [...messages, { id, userID, name, content }]
  fs.writeFileSync('messages.json', JSON.stringify(messages))
  response.redirect('/')
})

app.post('/delete-message/:id', (request, response) => {
  const id = request.params.id
  messages = messages.filter(message => message.id !== id)
  fs.writeFileSync('messages.json', JSON.stringify(messages))
  response.redirect('/')
})

app.get('/edit-message/:id', (request, response) => {
  const id = request.params.id
  const session = request.session
  const message = messages.find(message => message.id === id)
  response.render('edit_message', { message, session })
})

app.post('/edit-message/:id', (request, response) => {
  const id = request.params.id

  const name = request.body.name
  if (!validateName(name, request, response, `/edit-message/${id}`)) return

  const content = request.body.content
  if (!validateContent(content, request, response, `/edit-message/${id}`)) return

  messages = messages.map(message => message.id === id ? { ...message, name, content } : message)
  fs.writeFileSync('messages.json', JSON.stringify(messages))
  response.redirect('/')
})

app.listen(port, () => {
  console.log(`Guestbook is listening at http://auca.space:${port}`)
})
