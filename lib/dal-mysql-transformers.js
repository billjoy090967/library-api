const {
  compose,
  assoc,
  dissoc,
  prop,
  head,
  tap,
  map,
  pick,
  omit,
  isNil
} = require('ramda')

function postBookTransformer(book) {
  const authorID = prop('author', book)

  return compose(
    omit(['prices', 'price', 'type', '_id', 'author', '_rev']),
    assoc('authorID', authorID)
  )(book)
}

function getBookTransformer(arrBooks) {
  const getFirstBook = head(arrBooks)
  const books = compose(isNil, prop('price'), head)(arrBooks)
    ? []
    : map(book => pick(['type', 'price'], book), arrBooks)

  return compose(
    assoc('type', 'book'),
    assoc('prices', books),
    omit(['bookPriceID', 'bookPricebookID', 'type']),
    dissoc('authorID'),
    assoc('author', prop('authorID', getFirstBook)),
    assoc('_rev', null),
    dissoc('ID'),
    assoc('_id', prop('ID', getFirstBook))
  )(getFirstBook)
}

function postAuthorTransformer(author) {
  return omit(['_id', '_rev', 'type'], author)
}

function getAuthorTransformer(arrAuthors) {
  return compose(
    assoc('type', 'author'),
    assoc('_rev', null),
    dissoc('ID'),
    assoc('_id', prop('ID', arrAuthors))
  )(arrAuthors)
}

module.exports = {
  getBookTransformer,
  postBookTransformer,
  postAuthorTransformer,
  getAuthorTransformer
}
