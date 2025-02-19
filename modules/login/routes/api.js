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
    res.cookie(req.session.cookieId, {maxAge: 0});
    req.session.destroy();
    res.status(200).redirect('/login');
  }
  else {
    res.status(302).redirect("/login");
  }
});

// Register Page
api.get("/register", function(req, res) {
  res.sendFile(path.join(homeDir, '/html/register.html'));
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

api.get("/orgList", function(req, res) {
  if (req.session.auth && req.session.type === 'vol') {
    res.sendFile(path.join(homeDir, 'html/org.html'));
  }
  else {
    res.status(403).end();
  }
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