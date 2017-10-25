const pkGen = require('./lib/build-pk')
const { prop, assoc } = require('ramda')
const {
  getBookTransformer,
  postBookTransformer
} = require('./lib/dal-mysql-transformers')
const dalHelper =
  process.env.DAL === 'mysql-dal' ? 'dal-mysql-helper' : 'dal-helper'

const {
  add,
  get,
  update,
  deleteDoc,
  addMySQLBook
} = require(`./lib/${dalHelper}`)

const addBook = book => {
  book._id = pkGen('book', '_', book.title)
  if (dalHelper === 'dal-mysql-helper') {
    return addMySQLBook(book, 'book', postBookTransformer)
  } else {
    add(book)
  }
}
const getBook = id => get(id, 'vbookPrices', getBookTransformer)
const updateBook = book => {
  if (dalHelper === 'dal-mysql-helper') {
    return updateMySQLBook(book, 'book', postBookTransformer)
  } else {
    update(book)
  }
}
const deleteBook = id => deleteDoc(id)
const addAuthor = author =>
  add(assoc('_id', pkGen('author', '_', prop('name', author)), author))
const getAuthor = id => get(id)
const updateAuthor = author => update(author)
const deleteAuthor = id => deleteDoc(id)

const dal = {
  addBook,
  getBook,
  updateBook,
  deleteBook,
  addAuthor,
  getAuthor,
  updateAuthor,
  deleteAuthor
}
module.exports = dal
