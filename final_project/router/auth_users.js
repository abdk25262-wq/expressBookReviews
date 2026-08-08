const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

// ============================================
// Helper: Check if username is valid (exists)
// ============================================
const isValid = (username) => {
  return users.some(user => user.username === username);
};

// ============================================
// Helper: Authenticate user by username & password
// ============================================
const authenticatedUser = (username, password) => {
  return users.some(user => user.username === username && user.password === password);
};

// ============================================
// Task 7: Login as a registered user
// ============================================
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  // Check credentials
  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: "Invalid username or password" });
  }

  // Generate JWT token (secret key must match index.js)
  const token = jwt.sign({ username }, "access", { expiresIn: '1h' });

  // Save token in session
  req.session.authorization = { accessToken: token };

  return res.status(200).json({ message: "Login successful", token });
});

// ============================================
// Task 8: Add or modify a book review (authenticated)
// ============================================
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review;   // review text from query parameter
  const username = req.user.username; // set by the auth middleware in index.js

  // Check if book exists
  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  // Initialize reviews object if needed
  if (!books[isbn].reviews) {
    books[isbn].reviews = {};
  }

  // Add or modify the review for this user
  books[isbn].reviews[username] = review;

  return res.status(200).json({
    message: "Review added/modified successfully",
    reviews: books[isbn].reviews
  });
});

// ============================================
// Task 9: Delete a book review (authenticated)
// ============================================
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.user.username;

  // Check if book exists
  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  // Check if reviews exist for this book
  if (!books[isbn].reviews) {
    return res.status(404).json({ message: "No reviews for this book" });
  }

  // Check if the user has a review for this book
  if (!books[isbn].reviews[username]) {
    return res.status(404).json({ message: "You have no review for this book" });
  }

  // Delete the user's review
  delete books[isbn].reviews[username];

  return res.status(200).json({
    message: "Review deleted successfully",
    reviews: books[isbn].reviews
  });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
