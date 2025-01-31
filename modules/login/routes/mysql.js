const express = require("express");
const mysql = require("mysql");
const bcrypt = require("bcryptjs");
const api = express.Router();

// import credentials for MySQL
const DB_HOST = process.env.DB_HOST;
const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_DATABASE = process.env.DB_DATABASE;
const DB_PORT = process.env.DB_PORT;

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

// LOGIN (AUTH USER & create user session)
api.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  db.getConnection (async (err, connection) => {
    if (err) throw (err);

    const dbSearch = "SELECT * FROM users WHERE email = ?";
    const query = mysql.format(dbSearch, [email]);

    await connection.query(query, async (err, result) => {
      connection.release();

      if (err) throw (err);

      if (result.length == 0) {
        res.send("Invalid Login Credentials!");
      }
      else {
        // get hashed pass from result & save some other useful info
        const hashedPassword = result[0].password;
        const firstName = result[0].forename;
        const lastName = result[0].surname;
        const orgName = result[0].org_name;
        const type = result[0].user_type;

        if (await bcrypt.compare(password, hashedPassword)) {
          req.session.auth = true;
          req.session.firstName = firstName;
          req.session.lastName = lastName;
          req.session.email = email;
          req.session.orgName = orgName;
          req.session.type = type;
          res.cookie(firstName, { maxAge: 30000, signed: true });
          console.log(req.session);
          console.log(req.session.id);
          res.redirect('/profile');
        }
        else {
          res.send("Invalid Login Credentials!");
          res.end();
        } // end of bcrypt.compare()
      }   // end of User exists
      res.end();
    });   // end of connection query()
  });     // end of db.connection()
});       // end of app.post()

// XMLHttpRequest req to populate page with user info
api.post("/profile", (req, res) => {
  if (req.session.auth) {
    res.status(200).send({ orgName: req.session.orgName, fname: req.session.firstName,
     sname: req.session.lastName, email: req.session.email });
  }
});

// CREATE ORG USERS
api.post("/createOrgUser", async (req,res) => {
  const orgName = req.body.orgName.trim();
  const email = req.body.orgEmail;
  const info = req.body.concern;
  const type = 'org';

  const hashedPassword = await bcrypt.hash(req.body.orgPass1, 12);

  db.getConnection(async (err, connection) => {
    if (err) throw (err);

    const dbSearch =  // search DB
      "SELECT email FROM users WHERE email = ?";
    const query = mysql.format(dbSearch, [email]);

    const dbInsert = "INSERT INTO users VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    const insert = mysql.format(dbInsert,
      [0, null, null, email, hashedPassword, type, info, null, null, null, orgName]);

    await connection.query (query, async (err, result) => {
      if (err) throw (err);

      console.log(">>> Search Results");
      console.log(result.length);

      if (result.length !== 0) {
        connection.release();
        console.log(">>> Email already exists");
        res.sendStatus(409);
      }
      else {
        await connection.query (insert, (err, result) => {
          connection.release();

          if (err) throw (err);

          console.log(">>> Created new User");
          console.log(result.insertId);
          res.status(201).redirect("/login");
        });
      }
    }); // end of connection.query()
  });   // end of db.getConnection()
});     // end of app.post()

// CREATE VOL USERS
api.post("/createVolUser", async (req,res) => {
  // Cap first letter, rest lowercase
  const firstName = req.body.fname.trim().charAt(0).toUpperCase() +
    req.body.fname.slice(1).toLowerCase();
  const lastName = req.body.sname.trim().charAt(0).toUpperCase() +
    req.body.sname.slice(1).toLowerCase();
  const email = req.body.volEmail;
  const hours = req.body.hours;
  const crime = req.body.crime;
  const type = 'vol';

  const hashedPassword = await bcrypt.hash(req.body.volPass1, 12);

  db.getConnection(async (err, connection) => {
    if (err) throw (err);

    const dbSearch =  // search DB
      "SELECT email FROM users WHERE email = ?";
    const query = mysql.format(dbSearch, [email]);

    const dbInsert = "INSERT INTO users VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    const insert = mysql.format(dbInsert, [0, firstName, lastName, email, hashedPassword,
      type, null, hours, crime, null, null]);

    await connection.query (query, async (err, result) => {
      if (err) throw (err);

      console.log(">>> Search Results");
      console.log(result.length);

      if (result.length !== 0) {
        connection.release();
        console.log(">>> Email already exists");
        res.sendStatus(409);
      }
      else {
        await connection.query (insert, (err, result) => {
          connection.release();

          if (err) throw (err);

          console.log(">>> Created new User");
          console.log(result.insertId);
          res.status(201).redirect("/login");
        });
      }
    }); // end of connection.query()
  });   // end of db.getConnection()
});     // end of app.post()





// QUERY MySQL DB
// app.post("/profile", (req, res) => {
//   const user = req.session.user;

//   db.getConnection(async (err, connection) => {
//     if (err) throw (err);

//     const dbSearch =
//       "SELECT username, forename, surname, email FROM users WHERE username = ?";
//     const query = mysql.format(dbSearch, [user]);

//     await connection.query(query, async (err, result) => {
//       connection.release();

//       if (err) throw (err);

//       if (result.length == 0) {
//         console.log(">>> Invalid Query");
//         res.end();
//       }
//       else {
//         const user = result[0].user;
//         const firstName = result[0].forename;
//         const lastName = result[0].surname;
//         const email = result[0].email;

//         res.send(result);
//       }
//     });
//   });
// });

module.exports = api;