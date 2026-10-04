const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
    const { username, password } = req.body;

    // 1. Check if both username and password are provided
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }
  
    // 2. Check if the user already exists using the isValid helper
    if (!isValid(username)) {
      return res.status(409).json({ message: "User already exists!" });
    }
  
    // 3. Register the new user
    users.push({ username, password });
    return res.status(200).json({ message: "User successfully registered. Now you can login" });
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
    try {
        const getBooks = () => {
          return new Promise((resolve, reject) => {
            if (books) {
              resolve(books);
            } else {
              reject(new Error("Unable to fetch books"));
            }
          });
        };
    
        const bookList = await getBooks();
        return res.status(200).json(bookList);
      } catch (error) {
        return res.status(500).json({ message: error.message });
      }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
    try {
        const isbn = req.params.isbn;
    
        const getBookByISBN = (id) => {
          return new Promise((resolve, reject) => {
            const book = books[id];
            if (book) {
              resolve(book);
            } else {
              reject({ status: 404, message: "Book not found" });
            }
          });
        };
    
        const book = await getBookByISBN(isbn);
        return res.status(200).json(book);
      } catch (error) {
        return res.status(error.status || 500).json({ message: error.message });
      }
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
    try {
        const targetAuthor = req.params.author.toLowerCase();
    
        const getBooksByAuthor = (author) => {
          return new Promise((resolve, reject) => {
            const bookKeys = Object.keys(books);
            const matchingBooks = [];
    
            bookKeys.forEach((key) => {
              const currentBook = books[key];
              if (currentBook && currentBook.author && currentBook.author.toLowerCase() === author) {
                matchingBooks.push({
                  isbn: key,
                  ...currentBook
                });
              }
            });
    
            if (matchingBooks.length > 0) {
              resolve(matchingBooks);
            } else {
              reject({ status: 404, message: "No books found for the specified author" });
            }
          });
        };
    
        const matchingBooks = await getBooksByAuthor(targetAuthor);
        return res.status(200).json({ booksbyauthor: matchingBooks });
      } catch (error) {
        return res.status(error.status || 500).json({ message: error.message });
      }
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
    try {
        const targetTitle = req.params.title.toLowerCase();
    
        const getBooksByTitle = (title) => {
          return new Promise((resolve, reject) => {
            const bookKeys = Object.keys(books);
            const matchingBooks = [];
    
            bookKeys.forEach((key) => {
              const currentBook = books[key];
              if (currentBook && currentBook.title && currentBook.title.toLowerCase() === title) {
                matchingBooks.push({
                  isbn: key,
                  ...currentBook
                });
              }
            });
    
            if (matchingBooks.length > 0) {
              resolve(matchingBooks);
            } else {
              reject({ status: 404, message: "No books found for the specified title" });
            }
          });
        };
    
        const matchingBooks = await getBooksByTitle(targetTitle);
        return res.status(200).json({ booksbytitle: matchingBooks });
      } catch (error) {
        return res.status(error.status || 500).json({ message: error.message });
      }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    const isbn = req.params.isbn;
    const book = books[isbn];

    if (book) {
        return res.status(200).json(book.reviews);
    } else {
        return res.status(404).json({ message: "Book not found" });
    }
});

module.exports.general = public_users;
