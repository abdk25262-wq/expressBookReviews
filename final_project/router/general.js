const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// ============================================
// Task 6: Register a new user (public)
// ============================================
public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  // Check if username and password are provided
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  // Check if username already exists
  if (users.some(user => user.username === username)) {
    return res.status(409).json({ message: "Username already exists" });
  }

  // Register new user
  users.push({ username, password });
  return res.status(201).json({ message: "User registered successfully" });
});

// ============================================
// Task 1: Get the book list available in the shop
// ============================================
public_users.get('/', function (req, res) {
  res.send(JSON.stringify(books, null, 4));
});

// ============================================
// Task 2: Get book details based on ISBN
// ============================================
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];
  if (book) {
    res.send(JSON.stringify(book, null, 4));
  } else {
    res.status(404).json({ message: "Book not found" });
  }
});

// ============================================
// Task 3: Get books based on author (case‑insensitive)
// ============================================
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author.toLowerCase();
  const result = [];
  for (let key in books) {
    if (books.hasOwnProperty(key)) {
      const book = books[key];
      if (book.author && book.author.toLowerCase() === author) {
        result.push({ isbn: key, ...book });
      }
    }
  }
  if (result.length > 0) {
    res.send(JSON.stringify(result, null, 4));
  } else {
    res.status(404).json({ message: "No books found for this author" });
  }
});

// ============================================
// Task 4: Get books based on title (case‑insensitive)
// ============================================
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title.toLowerCase();
  const result = [];
  for (let key in books) {
    if (books.hasOwnProperty(key)) {
      const book = books[key];
      if (book.title && book.title.toLowerCase() === title) {
        result.push({ isbn: key, ...book });
      }
    }
  }
  if (result.length > 0) {
    res.send(JSON.stringify(result, null, 4));
  } else {
    res.status(404).json({ message: "No books found with this title" });
  }
});

// ============================================
// Task 5: Get book reviews based on ISBN
// ============================================
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];
  if (book && book.reviews) {
    res.send(JSON.stringify(book.reviews, null, 4));
  } else if (book && !book.reviews) {
    res.json({ message: "No reviews available for this book" });
  } else {
    res.status(404).json({ message: "Book not found" });
  }
});

module.exports.general = public_users;
