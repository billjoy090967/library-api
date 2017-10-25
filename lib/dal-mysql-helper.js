require('dotenv').config()
const NodeHTTPError = require('node-http-error')
const mysql = require('mysql')
const { isEmpty, map, assoc } = require('ramda')

function createConnection() {
  return mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
  })
}

//tap(x => console.log('after _id', x)),

// {
//   "title": "A Brave New World",
//   "author": "author_aldous_huxley",
//   "type": "book",
//   "publisher": "Penguin Books",
//   "ISBN": "12947281",
//   "genre": "Fiction",
//   "description": "Brave New World is a novel written in 1931 by Aldous Huxley, and published in 1932. Set in London in the year AD 2540 (632 A.F.—'After Ford'—in the book), the novel anticipates developments in reproductive technology, sleep-learning, psychological manipulation, and classical conditioning that are combined to make a profound change in society.",
//   "rating": 95,
//   "prices": [
//     {"type": "paperback", "price": 9.99},
//     {"type": "hardback", "price": 19.99},
//     {"type": "audio", "price": 19.99},
//     {"type": "kindle", "price": 12.99}
//   ]
// }

const add = (doc, tableName, transformer) => {
  // put the document into mysql database.  1) book 2) bookPrices
  return new Promise((resolve, reject) => {
    const connection = createConnection()
    connection.query(
      `INSERT INTO ${connection.escapeId(tableName)}
      SET ?`,
      transformer(doc),
      function(err, data) {
        if (err) {
          console.log('ERROR dal-mysql-helper.', err)
          return reject(err)
        }
        if (data) {
          return resolve(data)
        }
      }
    )
  })
}

const addMySQLBook = (doc, tableName, transformer) => {
  // put the document into mysql database.  1) book 2) bookPrices
  return new Promise((resolve, reject) => {
    const connection = createConnection()
    connection.query(
      `INSERT INTO ${connection.escapeId(tableName)}
      SET ?`,
      transformer(doc),
      function(err, data) {
        if (err) {
          console.log('ERROR dal-mysql-helper.', err)
          return reject(err)
        }
        if (data) {
          //[[6,"paperback", 19.99],[6, "kindle", 9.99]]
          //map(price => assoc('bookID', data.insertId), doc.prices),
          const newlyCreatedBookID = data.insertId
          connection.query(
            `INSERT INTO bookPrice (bookID, type, price) VALUE ? `,
            [
              map(price => [data.insertId, price.type, price.price], doc.prices)
            ],
            function(err, data) {
              if (err) {
                console.log('ERROR dal-mysql-helper.', err)
                return reject(err)
              }
              if (data) {
                return resolve({ ok: true, id: newlyCreatedBookID })
              }
            }
          )
        }
      }
    )
  })
}

const get = (id, tableName, transformer) => {
  return new Promise((resolve, reject) => {
    const connection = createConnection()

    connection.query(
      `SELECT *
       FROM ${connection.escapeId(tableName)}
       WHERE ID = ?`,
      [id],
      function(err, data) {
        if (err) {
          console.log(err)
          return reject(err)
        }
        if (isEmpty(data)) {
          return reject(
            new NodeHTTPError(404, 'missing', {
              error: 'not_found',
              reason: 'missing',
              name: 'not_found',
              status: 404
            })
          )
        }

        if (data) {
          console.log('THE DATA IS length>>>', data, data.length)
          return resolve(transformer(data))
        }
      }
    )

    connection.end(function(err) {
      if (err) return err
    })
  })
}

const deleteDoc = id => {
  return new Promise((resolve, reject) => {
    const connection = createConnection()

    connection.query(
      `DELETE
       FROM book
       WHERE ID = ?`,
      [id],
      function(err, data) {
        if (err) {
          console.log('err:', err)
          return reject(err)
        }
        console.log('THE DATA IS length>>>', data, data.length)
        if (isEmpty(data)) {
          return reject(
            new NodeHTTPError(404, 'missing', {
              error: 'not_found',
              reason: 'missing',
              name: 'not_found',
              status: 404
            })
          )
        }

        if (data) {
          console.log('THE DATA IS length>>>', data, data.length)
          return resolve({ ok: true, id, _rev: null })
        }
      }
    )

    connection.end(function(err) {
      if (err) return err
    })
  })
}

module.exports = {
  add,
  get,
  addMySQLBook,
  deleteDoc
}
