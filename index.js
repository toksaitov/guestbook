import express   from 'express'
import session   from 'express-session'
import Sequelize from 'sequelize'
import dotenv    from 'dotenv'

dotenv.config()

const app = express()
const port = 8080

const db = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: process.env.DB_DIALECT
  }
)

const Message = db.define('message', {
  userID: {
    type: Sequelize.DataTypes.STRING(36),
    allowNull: false
  },
  name: {
    type: Sequelize.DataTypes.STRING(256),
    allowNull: false
  },
  content: {
    type: Sequelize.DataTypes.STRING(512),
    allowNull: false
  }
})

app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(express.urlencoded({ extended: false }))
app.use(session({
  secret: 'super mega secret',
  resave: false,
  saveUninitialized: true
}))

app.get('/', async (request, response) => {
  const userID = request.session.id
  const session = request.session
  const message = null
  
  try {
    const messages = await Message.findAll()
    response.render('index', { session, messages, message, userID })
  } catch(error) {
    console.error(error)
    return response.status(503).end()
  }
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
  
  Message.create({ userID, name, content }).then(() => {
    response.redirect('/')
  }).catch(error => {
    console.error(error)
    return response.status(503).end()
  })
})

app.post('/delete-message/:id', (request, response) => {
  const id = request.params.id
  const userID = request.session.id
  
  Message.destroy({ where: {
    id, userID
  }}).then(affectedRows => {
    if (affectedRows === 0) {
      return response.status(403).end()
    }
    response.redirect('/')
  }).catch(error => {
    console.error(error)
    return response.status(503).end()
  })
})

app.get('/edit-message/:id', (request, response) => {
  const id = request.params.id
  const session = request.session
  const userID = request.session.id
  
  Message.findAll({ where: { id, userID }}).then(messages => {
    if (messages.length !== 1) {
      return response.status(403).end()
    }
    const message = messages[0]
    response.render('edit_message', { message, session })
  }).catch(error => {
    console.error(error)
    return response.status(503).end()
  })
})

app.post('/edit-message/:id', (request, response) => {
  const id = request.params.id
  const userID = request.session.id

  const name = request.body.name
  if (!validateName(name, request, response, `/edit-message/${id}`)) return

  const content = request.body.content
  if (!validateContent(content, request, response, `/edit-message/${id}`)) return

  Message.update({ name, content }, { where: { id, userID }}).then(result => {
    const affectedRows = result[0]
    if (affectedRows === 0) {
      return response.status(403).end()
    }
    response.redirect('/')
  }).catch(error => {
    console.error(error)
    return response.status(503).end()
  })
})

await db.sync()
app.listen(port, () => {
  console.log(`Guestbook is listening at http://auca.space:${port}`)
})
