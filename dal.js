const pkGen = require('./lib/build-pk')
const { prop, assoc } = require('ramda')
const {
  getBookTransformer,
  postBookTransformer,
  postAuthorTransformer,
  getAuthorTransformer
} = require('./lib/dal-mysql-transformers')
const dalHelper =
  process.env.DAL === 'mysql-dal' ? 'dal-mysql-helper' : 'dal-helper'

const {
  add,
  get,
  update,
  deleteDoc,
  addMySQLBook,
  updateMySQLBook,
  addMySQLAuthor,
  updateMySQLAuthor
} = require(`./lib/${dalHelper}`)

//BOOKS
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
    return updateMySQLBook(book, postBookTransformer)
  } else {
    return update(book)
  }
}
//const deleteBook = id => deleteDoc(id)
const deleteBook = id => {
  if (dalHelper === 'dal-mysql-helper') {
    return deleteDoc(id, 'book')
  } else {
    return deleteDoc(id)
  }
}

//AUTHORS
const addAuthor = author => {
  if (dalHelper === 'dal-mysql-helper') {
    return addMySQLAuthor(author, postAuthorTransformer)
  } else {
    author._id = pkGen('author', '_', author.name)
    add(author)
  }
}
const getAuthor = id => get(id, 'author', getAuthorTransformer)
//const updateAuthor = author => update(author)

const updateAuthor = o => {
  if (dalHelper === 'dal-mysql-helper') {
    return updateMySQLAuthor(o, postAuthorTransformer)
  } else {
    update(o)
  }
}
//const deleteAuthor = id => deleteDoc(id)
const deleteAuthor = id => {
  if (dalHelper === 'dal-mysql-helper') {
    return deleteDoc(id, 'author')
  } else {
    return deleteDoc(id)
  }
}

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
