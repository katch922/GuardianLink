const express = require("express");
const bcrypt = require("bcryptjs");
const mysql = require("mysql");
const path = require("node:path");
const session = require("express-session");
const cookieParser = require("cookie-parser");
require("dotenv").config();
// import routes
const routes = require("./routes/routes");

// import credentials for MySQL
const DB_HOST = process.env.DB_HOST;
const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_DATABASE = process.env.DB_DATABASE;
const DB_PORT = process.env.DB_PORT;
const port = process.env.PORT;  // port for express

const app = express();
app.use(cookieParser(process.env.COOKIE_SECRET));
/* Setup session params
For real time environment you want to use sessionStore so session is not just stored
in memory. For this project memory is sufficient.
For real life environment cookie should probably be set to
{ maxAge: 60000 * 60, secure: true, sameSite: true } */
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 60000 * 60 }
}));
app.use(express.json());  // to read req.body.<params>
app.use(express.urlencoded({extended: true}));  // parse data from POST for req.body.
// serve filess /styles
app.use(express.static(path.join(__dirname, '../../static')));
const home = path.join(__dirname, '../../');
// start express server
app.listen(port, () => console.log(`Server Started on port ${port}...`));

// create pool for mysql connections
const db = mysql.createPool({
  connectionLimit: 100,
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_DATABASE,
  port: DB_PORT
});

// connect to DB
db.getConnection((err, connection) => {
  if (err) throw (err);
  console.log("DB connected successful: " + connection.threadId);
})

// ROUTES; Pages
app.use("/", routes);
app.use("/about", routes);
app.use("/profile", routes);
app.use("/contact", routes);
app.use("/login", routes);

// LOGIN (AUTH USER & create user session)
app.post("/login", (req, res) => {
  const user = req.body.username;
  const password = req.body.password;

  db.getConnection (async (err, connection) => {
    if (err) throw (err);

    const dbSearch = "SELECT * FROM users WHERE username = ?";
    const query = mysql.format(dbSearch, [user]);

    await connection.query(query, async (err, result) => {
      connection.release();

      if (err) throw (err);

      if (result.length == 0) {
        res.send("Invalid User/Password!");
      }
      else {
        // get hashed pass from result
        const hashedPassword = result[0].password;
        const userType = result[0].user_type;

        if (await bcrypt.compare(password, hashedPassword)) {
          console.log("---------> Login Successful");
          req.session.auth = true;
          req.session.user = user;
          res.cookie(user, userType, { maxAge: 30000, signed: true });
          res.cookie(201).send({ msg: `Welcome back, ${user}` });
          console.log(req.session);
          console.log(req.session.id);
        }
        else {
          res.send("Invalid User/Password!");
        } // end of bcrypt.compare()
      }   // end of User exists
    });   // end of connection query()
  });     // end of db.connection()
});       // end of app.post()

// Routes continue
app.use("/register", routes);

// CREATE USER
app.post("/createUser", async (req,res) => {
  const user = req.body.username;
  const email = req.body.email;
  const hashedPassword = await bcrypt.hash(req.body.password, 12);
  const type = req.body.user_type;

  db.getConnection(async (err, connection) => {
    if (err) throw (err);

    const dbSearch =  // search DB
      "SELECT username,email,password,user_type FROM users WHERE username = ?";
    const query = mysql.format(dbSearch, [user]);

    const dbInsert = "INSERT INTO users VALUES(?, ?, ?, ?)";
    const insert = mysql.format(dbInsert, [user, email, hashedPassword, type]);

    await connection.query (query, async (err, result) => {
      if (err) throw (err);

      console.log("------> Search Results");
      console.log(result.length);

      if (result.length != 0) {
        connection.release();
        console.log("------> User already exists");
        res.sendStatus(409);
      }
      else {
        await connection.query (insert, (err, result) => {
          connection.release();

          if (err) throw (err);

          console.log("--------> Created new User");
          console.log(result.insertId);
          res.sendStatus(201);
        });
      }
    }); // end of connection.query()
  });   // end of db.getConnection()
});     // end of app.post()