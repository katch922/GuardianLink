const express = require("express");
const path = require("node:path");
const router = express.Router();

const homeDir = path.normalize(path.resolve(__dirname, '../../../'));

// Home Page
router.get("/", function(req, res) {
  res.sendFile(path.join(homeDir, 'index.html'));
});

// About Page
router.get("/about", function(req, res) {
  res.sendFile(path.join(homeDir, '/html/about.html'));
});

// Profile Page
router.get("/profile", function(req, res) {
  // if user logged in
  if (req.session.auth) {
    console.log("WELCOME");
    res.send('Welcome back, ' + req.session.user + '!');
  }
  else {
    // not logged in
    console.log("Not AUTH");
    //res.redirect('/index.html');
    res.send('Please login to view the page!');
  }
  res.end();
});

// Contact Page
router.get("/contact", function(req, res) {
  res.sendFile(path.join(homeDir, '/html/contact.html'));
});

// Signin Page
router.get("/login", function(reg, res) {
  res.sendFile(path.join(homeDir, '/html/login.html'));
});

// Signout Page
router.delete("/logout", function(req, res) {
});

// Register Page
router.get("/register", function(req, res) {
  res.sendFile(path.join(homeDir, '/html/register.html'));
});

module.exports = router;