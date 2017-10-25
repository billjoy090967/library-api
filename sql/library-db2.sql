DROP DATABASE IF EXISTS `library`;

CREATE DATABASE library;

USE `library`;

CREATE TABLE `author` (
  `ID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(75) NOT NULL,
  `placeOfBirth` varchar(50) NOT NULL,
  `birthDate` date NOT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=latin1;

INSERT INTO `author` VALUES (1,'Dr. Seuss','Springfield, MA','1020-05-02'),
(2,'Michael Crighton','BOSTON, MA','1940-12-02'),
(3,'Aldous Huxley','London, UK','1920-05-23');

CREATE TABLE `book` (
  `ID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(100) NOT NULL,
  `publisher` varchar(50) NOT NULL,
  `authorID` int(10) unsigned NOT NULL,
  `ISBN` varchar(20) NOT NULL,
  `pages` int(11) NOT NULL,
  `genre` enum('Fiction','Non-Fiction','Historical Fiction','Science Fiction') NOT NULL,
  `description` varchar(200) NOT NULL,
  `rating` int(11) NOT NULL,
  PRIMARY KEY (`ID`),
  KEY `FK_book_authorID_idx` (`authorID`),
  CONSTRAINT `FK_book_authorID` FOREIGN KEY (`authorID`) REFERENCES `author` (`ID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=latin1;

INSERT INTO `book` VALUES (1,'ONE FISH TWO FISH','FUN',1,'1111',54,'Fiction','A fun book',99),
(2,'The Lorax','FUN',1,'2222',60,'Fiction','A fun book about the lorax and trees.',98),
(3,'Green Eggs and Ham','FUN',1,'3333',24,'Fiction','A fun book about Sam I am',97),
(4,'A Brave New World','Crazy Publsiher',3,'4444',324,'Fiction','A fun book about the future',95);

CREATE TABLE `bookPrice` (
  `ID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `bookID` int(10) unsigned NOT NULL,
  `type` enum('paperback','hardback','audio','kindle') NOT NULL,
  `price` decimal(10,2) unsigned NOT NULL,
  PRIMARY KEY (`ID`),
  KEY `FK_bookPrice_bookID_idx` (`bookID`),
  CONSTRAINT `FK_bookPrice_bookID` FOREIGN KEY (`bookID`) REFERENCES `book` (`ID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=latin1;

INSERT INTO `bookPrice` VALUES (1,1,'hardback',9.99),(2,1,'audio',19.99),(3,1,'kindle',19.99),(4,1,'paperback',8.99),(5,4,'paperback',28.99),(6,4,'hardback',8.99),(7,2,'hardback',19.00);

CREATE VIEW vbookPrices AS 
SELECT book.ID as ID
, book.title
, book.publisher
, book.authorID
, book.ISBN
, book.pages
, book.genre
, book.description
, book.rating
, bookPrice.ID as bookPriceID
, bookPrice.bookID as bookPricebookID
, bookPrice.type
, bookPrice.price
FROM book 
INNER JOIN bookPrice ON book.ID = bookPrice.bookID

