const express = require("express");
const path = require("node:path");
const api = express.Router();

// get absoulte path
const homeDir = path.normalize(path.resolve(__dirname, '../../../'));

// Home Page
api.get("/", function(req, res) {
  res.sendFile(path.join(homeDir, 'index.html'));
});

// About Page
api.get("/about", function(req, res) {
  res.sendFile(path.join(homeDir, '/html/about.html'));
});

// Admin Tools
api.get("/admin", function(req, res) {
  if (req.session.auth && req.session.type === 'admin') {
    res.sendFile(path.join(homeDir, '/html/admin.html'));
  }
  else {
    res.status(403).end();
  }
});

// Contact Page
api.get("/contact", function(req, res) {
  res.sendFile(path.join(homeDir, '/html/contact.html'));
});

// Signin Page
api.get("/login", function(req, res) {
  if (req.session.auth) {
    res.status(302).redirect("/profile");
  }
  else {
    res.sendFile(path.join(homeDir, '/html/login.html'));
  }
});

// Signout Page
api.get("/logout", function(req, res) {
  if (req.session.auth) {
    // destroy session and expire cookie
    res.cookie(req.session.cookieId, {maxAge: 0});
    req.session.destroy();
    res.status(200).redirect('/login');
  }
  else {
    res.status(302).redirect("/login");
  }
});

api.get("/orgList", function(req, res) {
  if (req.session.auth && req.session.type === 'vol') {
    res.sendFile(path.join(homeDir, 'html/org.html'));
  }
  else {
    res.status(403).end();
  }
});

// Forgot Password page
api.get("/passReset", function(req, res) {
  res.sendFile(path.join(homeDir, '/html/pass-reset.html'));
});

// Profile Page
api.get("/profile", function(req, res) {
  // if user logged in
  if (req.session.auth) {
    res.sendFile(path.join(homeDir, '/html/profile.html'));
  }
  else {
    // give error message
    res.status(401).sendFile(path.join(homeDir, '/html/error.html'));
  }
});

// Register Page
api.get("/register", function(req, res) {
  res.sendFile(path.join(homeDir, '/html/register.html'));
});

api.get("/volList", function(req, res) {
  if (req.session.auth && req.session.type === 'org') {
    res.sendFile(path.join(homeDir, 'html/vol.html'));
  }
  else {
    res.status(403).end();
  }
});


module.exports = api;