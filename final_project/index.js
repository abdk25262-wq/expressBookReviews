const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const generalRoutes = require('./general.js').general;
const authRoutes = require('./auth_users.js').authenticated;

const app = express();

app.use(express.json());
app.use(session({
  secret: "fingerprint_customer",
  resave: true,
  saveUninitialized: true
}));

// Mount public routes (no authentication required)
app.use("/customer", generalRoutes);

// Mount auth routes (includes login, register, and protected routes)
app.use("/customer", authRoutes);

// ============================================
// Authentication middleware for /customer/auth/*
// (this protects all routes starting with /customer/auth/)
// ============================================
app.use("/customer/auth/*", function auth(req, res, next) {
  if (req.session.authorization) {
    let token = req.session.authorization['accessToken'];
    jwt.verify(token, "access", (err, user) => {
      if (!err) {
        req.user = user;   // attach user info for later use
        next();
      } else {
        return res.status(403).json({ message: "User not authenticated" });
      }
    });
  } else {
    return res.status(403).json({ message: "User not logged in" });
  }
});

// ... (any additional routes or server start)
