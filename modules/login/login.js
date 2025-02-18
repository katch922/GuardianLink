const express = require("express");
const path = require("node:path");
const session = require("express-session");
const cookieParser = require("cookie-parser");
require("dotenv").config();
// import routes
const routes = require("./modules/api");
const dbRoutes = require("./modules/mysql");

// // import some env vars
const port = process.env.PORT;  // port for express

const app = express();
// cookie settings
app.use(cookieParser(process.env.COOKIE_SECRET));
/* Setup session params
For real time environment you want to use sessionStore so session is not just stored
in memory. For this project memory is sufficient. Also, session will have to be secured.
For real life environment cookie should probably be set to
{ maxAge: 60000 * 60, secure: true, sameSite: true } */
// session settings
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 60000 * 60 }
}));
// express settings
app.use(express.json());  // to read req.body.<params>
app.use(express.urlencoded({extended: true}));  // parse data from POST for req.body.
// serve filess /styles /img /src
app.use(express.static(path.join(__dirname, '../../static')));

// start express server
app.listen(port, () => console.log(`Server Started on port:${port}`));

// ROUTES; Pages
app.get("/", routes);
app.get("/about", routes);
app.get("/profile", routes);
app.get("/contact", routes);
app.get("/login", routes);
app.get("/logout", routes);
app.get("/register", routes);
app.get("/admin", routes);
app.get('/orgList', routes);
app.get('/volList', routes);
// dbRoutes (mysql)
app.post("/profile", dbRoutes);
app.post("/login", dbRoutes);
app.post("/createOrgUser", dbRoutes);
app.post("/createVolUser", dbRoutes);
app.post("/createBasicUser", dbRoutes);
app.post("/admin", dbRoutes);
app.post("/deleteUser", dbRoutes);
app.post("/editUser", dbRoutes);
app.post("/orgList", dbRoutes);
app.post('/volList', dbRoutes);
app.post("/delUser", dbRoutes);