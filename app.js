require('dotenv').config()
const port = process.env.PORT || 4000
const {
  getBook,
  deleteBook,
  addBook,
  updateBook,
  getAuthor,
  deleteAuthor,
  addAuthor,
  updateAuthor
} = require('./dal.js')
const express = require('express')
const app = express()
const HTTPError = require('node-http-error')
const bodyParser = require('body-parser')
const checkRequiredFields = require('./lib/check-required-fields.js')
const {
  not,
  isEmpty,
  join,
  omit,
  merge,
  prop,
  __,
  compose,
  path
} = require('ramda')

app.use(bodyParser.json())

app.get('/', (req, res, next) => res.send('The librarian welcomes you, shhhh.'))

/////////////////
///  AUTHORS
////////////////

app.post('/authors', (req, res, next) => {
  if (isEmpty(prop('body', req))) {
    return next(
      new HTTPError(
        400,
        'Missing request body.  Content-Type header should be application/json.'
      )
    )
  }

  const body = compose(
    omit(['_id', '_rev']),
    merge(__, { type: 'author' }),
    prop('body')
  )(req)

  const missingFields = checkRequiredFields(
    ['name', 'placeOfBirth', 'birthDate'],
    body
  )

  if (not(isEmpty(missingFields))) {
    return next(
      new HTTPError(400, `Missing required fields: ${join(' ', missingFields)}`)
    )
  }

  addAuthor(body)
    .then(result => res.status(201).send(result))
    .catch(err => next(new HTTPError(err.status, err.message)))
})

app.get('/authors/:id', (req, res, next) =>
  getAuthor(path(['params', 'id'], req))
    .then(doc => res.status(200).send(doc))
    .catch(err => next(new HTTPError(err.status, err.message)))
)

app.put('/authors/:id', (req, res, next) => {
  if (isEmpty(prop('body'), req)) {
    return next(
      new HTTPError(
        400,
        'Missing request body.  Content-Type header should be application/json.'
      )
    )
  }
  const missingFields = checkRequiredFields(
    ['_id', '_rev', 'placeOfBirth', 'birthDate', 'name'],
    prop('body', req)
  )
  if (not(isEmpty(missingFields))) {
    return next(
      new HTTPError(401, `Missing required fields: ${join(' ', missingFields)}`)
    )
  }

  updateAuthor(prop('body', req))
    .then(result => res.status(200).send(result))
    .catch(err => next(new HTTPError(err.status, err.message)))
})

app.delete('/authors/:id', (req, res, next) => {
  deleteAuthor(path(['params', 'id'], req))
    .then(result => res.status(200).send(result))
    .catch(err => next(new HTTPError(err.status, err.message)))
})

/////////////////
///  BOOKS
////////////////
app.post('/books', (req, res, next) => {
  if (isEmpty(prop('body', req))) {
    return next(
      new HTTPError(
        400,
        'Missing request body.  Content-Type header should be application/json.'
      )
    )
  }

  const body = compose(
    omit(['_id', '_rev']),
    merge(__, { type: 'book' }),
    prop('body')
  )(req)

  const missingFields = checkRequiredFields(
    ['title', 'author', 'ISBN', 'genre', 'description'],
    body
  )

  if (not(isEmpty(missingFields))) {
    return next(
      new HTTPError(
        400,
        `Missing Required Fields: ${join(', ', missingFields)}`
      )
    )
  }

  addBook(body)
    .then(book => res.status(201).send(book))
    .catch(err => next(new HTTPError(err.status, err.message)))
})

app.get('/books/:id', (req, res, next) =>
  getBook(path(['params', 'id'], req))
    .then(doc => res.status(200).send(doc))
    .catch(err => next(new HTTPError(err.status, err.message)))
)

app.put('/books/:id', (req, res, next) => {
  if (isEmpty(prop('body', req))) {
    return next(
      new HTTPError(
        400,
        'Missing request body.  Content-Type header should be application/json.'
      )
    )
  }

  const missingFields = checkRequiredFields(
    ['_id', '_rev', 'type', 'title', 'author', 'ISBN', 'genre', 'description'],
    prop('body', req)
  )

  if (not(isEmpty(missingFields))) {
    return next(
      new HTTPError(
        400,
        `Missing Required Fields: ${join(', ', missingFields)}`
      )
    )
  }

  updateBook(prop('body', req))
    .then(updateResult => res.status(200).send(updateResult))
    .catch(err => next(new HTTPError(err.status, err.message)))
})

app.delete('/books/:id', (req, res, next) =>
  deleteBook(path(['params', 'id'], req))
    .then(deleteResponse => res.status(200).send(deleteResponse))
    .catch(err => next(new HTTPError(err.status, err.message)))
)

////////////////////////
//  ERROR HANDLER
///////////////////////
app.use((foo, req, res, next) => {
  console.log(req.method, ' ', req.path, ' ', 'error ', foo)
  next(foo)
})
app.use((err, req, res, next) => res.status(err.status || 500).send(err))

if (process.env.NODE_ENV !== 'test') {
  console.log('PORT = ', port)
  app.listen(port, () =>
    console.log(`API is up on port with ${process.env.DAL}`, port)
  )
}

module.exports = app
