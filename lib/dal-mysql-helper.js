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

    connection.end(function(err) {
      if (err) return err
    })
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
            `INSERT INTO bookPrice (bookID, type, price) VALUE ?`,
            [
              map(price => [data.insertId, price.type, price.price], doc.prices)
            ],
            function(err, data) {
              if (err) {
                console.log('ERROR dal-mysql-helper.', err)
                return reject(err)
              }
              if (data) {
                return resolve({ ok: true, id: newlyCreatedBookID, rev: null })
              }
            }
          )
        }
      }
    )

    connection.end(function(err) {
      if (err) return err
    })
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

const updateMySQLBook = (doc, transformer) => {
  // put the document into mysql database.  1) book 2) bookPrices
  return new Promise((resolve, reject) => {
    const connection = createConnection()

    console.log('transformedDoc:', transformer(doc))
    // connection.query(
    //   `UPDATE book
    //   SET WHERE ID = `,
    //   transformer(doc),
    //   function(err, data) {
    //     if (err) {
    //       console.log('ERROR dal-mysql-helper.', err)
    //       return reject(err)
    //     }
    //     if (data) {
    //       console.log(data)
    //       //[[6,"paperback", 19.99],[6, "kindle", 9.99]]
    //       //map(price => assoc('bookID', data.insertId), doc.prices),
    //       const newlyCreatedBookID = data.insertId
    //       connection.query(
    //         `UPDATE bookPrice (bookID, type, price) VALUE ?`,
    //         [
    //           map(price => [data.insertId, price.type, price.price], doc.prices)
    //         ],
    //         function(err, data) {
    //           if (err) {
    //             console.log('ERROR dal-mysql-helper.', err)
    //             return reject(err)
    //           }
    //           if (data) {
    //             return resolve({ ok: true, id: newlyCreatedBookID, rev: null })
    //           }
    //         }
    //       )
    //     }
    //   }
    // )
    //
    // connection.end(function(err) {
    //   if (err) return err
    // })
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
          return resolve({ ok: true, id, rev: null })
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
  addMySQLBook,
  get,
  updateMySQLBook,
  deleteDoc
}
