const express = require("express");
const mysql = require("mysql");
const bcrypt = require("bcryptjs");
const api = express.Router();
const multer = require("multer");
const path = require("node:path");

const homeDir = path.normalize(path.resolve(__dirname, '../../../'));

// Path for file uploads
let dest = path.join(homeDir, "/static/uploads/");
// Multer disk storage
const storage = multer.diskStorage({
  destination: function (req, res, cb) {
    cb(null, dest);
  },
  filename: function (req, file, cb) {
    cb(null, req.body.volEmail + "-" + file.fieldname + ".pdf");
  }
});

// max upload file size (1MB)
const maxSize = 1 * 1000 * 1000;

// Configure Multer
const upload = multer({
  storage: storage,
  dest: dest,
  limits: { filesize: maxSize },
  fileFilter: function (req, file, cb) {
    const filetypes = /pdf|doc|docx|odt/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    }

    cb("Error: File upload only supports the following filetypes - " + filetypes);
  }
});

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
  const password = req.body.pass;

  console.log(`${email} ${password}`);

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
        const id = result[0].id;

        if (await bcrypt.compare(password, hashedPassword)) {
          req.session.auth = true;
          req.session.firstName = firstName;
          req.session.lastName = lastName;
          req.session.email = email;
          req.session.orgName = orgName;
          req.session.type = type;
          req.session.cookieId = id;
          res.cookie(id, { maxAge: 30000, signed: true, httpOnly: true});
          console.log(req.session);
          console.log(req.session.id);
          //res.redirect('/profile');
          res.status(200).send({ message: 'Login Successful' });
        }
        else {
          //res.send("Invalid Login Credentials!");
          res.status(401).send({ message: 'Authenticaton Failure' });
          //res.end();
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
     sname: req.session.lastName, email: req.session.email, type: req.session.type });
  }
});

// QUERY to list users on admin page
api.post("/admin", async (req, res) => {
  db.getConnection(async (err, conn) => {
    if (err) throw (err);

    const email = req.body.email;

    if (email) {
      const dbSearch = "SELECT * FROM users WHERE email = ?";
      const query = mysql.format(dbSearch, [email]);

      await conn.query(query, async (err, result) => {
        conn.release();
        if (err) throw (err);

        res.status(200).send(result);
      });
    }
    else {
      const dbSearch = "SELECT email FROM users";
      const query = mysql.format(dbSearch);

      await conn.query(query, async (err, result) => {
        conn.release();

        if (err) throw (err);

        // array to hold query results
        let users = [];

        // add user emails to array and send to AJAX to popular webpage
        for (let i = 0; i < result.length; i++) {
          users.push(result[i].email);
        }

        res.status(200).send(result);

      }); // end of conn.query()
    }
  });   // end of db.getConnection()
});     // end of api.post()

// CREATE ORG USERS
api.post("/createOrgUser", async (req,res) => {
  const orgName = req.body.orgName.trim();
  const email = req.body.orgEmail;
  const info = req.body.concern.trim();
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
        res.status(409).send({ message: `${email} already registered, please login` });
      }
      else {
        await connection.query (insert, (err, result) => {
          connection.release();

          if (err) throw (err);

          console.log(">>> Created new User");
          console.log(result.insertId);
          res.status(201).send({ message: `Registration Successful` });
        });
      }
    }); // end of connection.query()
  });   // end of db.getConnection()
});     // end of app.post()

// CREATE VOL USERS
api.post("/createVolUser", upload.single("resume"), async (req, res) => {
  // Cap first letter, rest lowercase
  const firstName = req.body.fname.trim().charAt(0).toUpperCase() +
    req.body.fname.slice(1).toLowerCase();
  const lastName = req.body.sname.trim().charAt(0).toUpperCase() +
    req.body.sname.slice(1).toLowerCase();
  const email = req.body.volEmail;
  const hours = req.body.hours;
  const crime = req.body.crime;
  const type = 'vol';
  let resume = "no";

  if (req.file) {
    resume = "yes";
  }

  const hashedPassword = await bcrypt.hash(req.body.volPass1, 12);

  db.getConnection(async (err, connection) => {
    if (err) throw (err);

    const dbSearch =  // search DB
      "SELECT email FROM users WHERE email = ?";
    const query = mysql.format(dbSearch, [email]);

    const dbInsert = "INSERT INTO users VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    const insert = mysql.format(dbInsert, [0, firstName, lastName, email, hashedPassword,
      type, null, hours, crime, resume, null]);

    await connection.query (query, async (err, result) => {
      if (err) throw (err);

      console.log(">>> Search Results");
      console.log(result.length);

      if (result.length !== 0) {
        connection.release();
        console.log(">>> Email already exists");
        res.status(409).send({ message: `${email} already registered, please login` });
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
});     // end of api.post()

// CREATE Basic USERS; admin tool
api.post("/createBasicUser", async (req,res) => {
  const firstName = req.body.fname.trim().charAt(0).toUpperCase() +
    req.body.fname.slice(1).toLowerCase();
  const lastName = req.body.sname.trim().charAt(0).toUpperCase() +
    req.body.sname.slice(1).toLowerCase();
  const email = req.body.email;
  const type = req.body.type;
  let orgName = null;

  // no whitespace in org name
  if (req.body.orgName.length > 0) {
    orgName = req.body.orgName.trim();
  }

  const hashedPassword = await bcrypt.hash(req.body.pass, 12);

  db.getConnection(async (err, connection) => {
    if (err) throw (err);

    const dbSearch =  // search DB
      "SELECT email FROM users WHERE email = ?";
    const query = mysql.format(dbSearch, [email]);

    const dbInsert = "INSERT INTO users VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    const insert = mysql.format(dbInsert,
      [0, firstName, lastName, email, hashedPassword, type, null, null, null, null,
      orgName]);

    await connection.query (query, async (err, result) => {
      if (err) throw (err);

      console.log(">>> Search Results");
      console.log(result.length);

      if (result.length !== 0) {
        connection.release();
        console.log(">>> Email already exists");
        res.status(409).send({ message: `${email} already exists` });
      }
      else {
        await connection.query (insert, (err, result) => {
          connection.release();

          if (err) throw (err);

          console.log(">>> Created new User");
          console.log(result.insertId);
          res.status(201).send({ message: `${email} account created` });
        });
      }
    }); // end of connection.query()
  });   // end of db.getConnection()
});     // end of api.post()

// EDIT users
// In real life environment if user type changes, would force logout the user
// We would also be using session stores instead of memorystore
api.post("/editUser", async (req, res) => {
  const email = req.body.hiddenEmail;

  // set to null if that item is empty
  const orgName = req.body.editName.trim();
  const firstName = req.body.editFname.trim().charAt(0).toUpperCase() +
    req.body.editFname.slice(1).toLowerCase();
  const lastName = req.body.editSname.trim().charAt(0).toUpperCase() +
  req.body.editSname.slice(1).toLowerCase();
  const type = req.body.editType.trim();
  const info = req.body.editInfo.trim();
  const crime = req.body.crime.trim();
  const resume = req.body.resume.trim();
  let hours = null;
  // force logout user if user type changed
  let logoutUser = false;

  // set to null, if not updated
  if (req.body.editHours) {
    hours = req.body.editHours;
  }

  // only update pass if it was edited
  if (req.body.editPass) {
    const hashedPass = await bcrypt.hash(req.body.editPass, 12);

    db.getConnection(async (err, conn) => {
      if (err) throw (err);
  
      const dbSearch = "SELECT email, user_type, id FROM users WHERE email = ?";
      const query = mysql.format(dbSearch, [email]);
      const dbUpdate =
        "UPDATE users SET org_name=?, forename=?, surname=?, password=?, user_type=?, concerns=?, available=?, background_check=?, resume=? WHERE email=?";
      const update = mysql.format(dbUpdate, [orgName, firstName, lastName, hashedPass,
        type, info, hours, crime, resume, email]);
  
      await conn.query(query, async (err, result) => {
        if (err) throw (err);

        // check if user type changed
        if (result[0].user_type !== type) {
          logoutUser = true;
        }
  
        if (result.length === 0) {
          conn.release();
          console.log(`>>>${email} No such account`);
          res.sendStatus(400);
        }
        else {
          await conn.query(update, (err, result) => {
            conn.release();
            if (err) throw (err);
  
            console.log(`>>> ${email} account/password updated`);

            // if user type change force logout user
            if (logoutUser) {
              console.log(`${email} logout ${logoutUser}`);
              res.status(200).redirect("/admin");
            }
            else {
              console.log(`${email} logout ${logoutUser}`);
              res.status(200).redirect("/admin");
            }
          });
        }
      }); // end of conn.query()
    });   // end of db.getConnection()
  }
  // will update user if password is not changed
  else {
    db.getConnection(async (err, conn) => {
      if (err) throw (err);
  
      const dbSearch = "SELECT email, user_type, id FROM users WHERE email = ?";
      const query = mysql.format(dbSearch, [email]);
      const dbUpdate =
        "UPDATE users SET org_name=?, forename=?, surname=?, user_type=?, concerns=?, available=?, background_check=?, resume=? WHERE email=?";
      const update = mysql.format(dbUpdate, [orgName, firstName, lastName, type, info,
        hours, crime, resume, email]);
  
      await conn.query(query, async (err, result) => {
        if (err) throw (err);

        // check if user type changed
        if (result[0].user_type !== type) {
          logoutUser = true;
        }

        if (result.length === 0) {
          conn.release();
          console.log(`>>>${email} No such account`);
          res.sendStatus(400);
        }
        else {
          await conn.query(update, (err, result) => {
            conn.release();
            if (err) throw (err);

            console.log(`>>> ${email} account updated`);

            // if user type change force logout user
            if (logoutUser) {
              console.log(`${email} logout ${logoutUser}`);
              res.status(200).redirect("/admin");
            }
            else {
              console.log(`${email} logout ${logoutUser}`);
              res.status(200).redirect("/admin");
            }
          });
        }
      }); // end of conn.query()
    });   // end of db.getConnection()
  }
});       // end of api.post()

// DELETE user
api.post("/deleteUser", async (req, res) => {
  const email = req.body.users;

  db.getConnection(async (err, conn) => {
    if (err) throw (err);

    const dbSearch = "SELECT email, user_type FROM users WHERE email = ?";
    const query = mysql.format(dbSearch, [email]);

    const dbDelete = "DELETE FROM users WHERE email = ?";
    const delUser = mysql.format(dbDelete, [email]);

    await conn.query(query, async (err, result) => {
      if (err) throw (err);

      if (result.length === 0) {
        conn.release();
        console.log(`>>>${email} No such account`);
        res.sendStatus(400);
      }
      else {
        await conn.query (delUser, (err, result) => {
          conn.release();

          if (err) throw (err);

          console.log(`>>> ${email} account deleted`);
          res.status(200).redirect("/admin");
        });
      }
    }); // end of conn.query()
  });   // end of db.getConnection()
});     // end of api.post()

api.post("/orgList", async(req, res) => {
  const type = 'org';

  // prep mysql conn
  db.getConnection(async (err, conn) => {
    if (err) throw (err);

    const dbSearch = "SELECT email, concerns, org_name FROM users WHERE user_type=?";
    const query = mysql.format(dbSearch, [type]);

    // connect to mysql get results
    await conn.query (query, async (err, result) => {
      if (err) throw (err);

      console.log(">>> Query Success");
      console.log(result.length);

      res.status(200).send(result);
    }); // end of conn.query()
  });   // end of db.getConnection()
});

api.post("/volList", async(req, res) => {
  const type = 'vol';

  // prep mysql conn
  db.getConnection(async (err, conn) => {
    if (err) throw (err);

    const dbSearch =
      "SELECT forename, surname, email, available FROM users WHERE user_type=?";
    const query = mysql.format(dbSearch, [type]);

    // connect to mysql get results
    await conn.query (query, async (err, result) => {
      if (err) throw (err);

      console.log(">>> Query Success");
      console.log(result.length);

      res.status(200).send(result);
    }); // end of conn.query()
  });   // end of db.getConnection()
});

api.post("/delUser", async (req, res) => {
  const email = req.session.email;

  db.getConnection(async (err, conn) => {
    if (err) throw (err);

    const dbSearch = "SELECT email FROM users WHERE email = ?";
    const query = mysql.format(dbSearch, [email]);

    const dbDelete = "DELETE FROM users WHERE email = ?";
    const delUser = mysql.format(dbDelete, [email]);

    await conn.query(query, async (err, result) => {
      if (err) throw (err);

      if (result.length === 0) {
        conn.release();
        console.log(`>>>${email} No such account`);
        res.status(400).send({ message: `${email} does not exist` });
      }
      else {
        await conn.query (delUser, (err, result) => {
          conn.release();

          if (err) throw (err);

          console.log(`>>> ${email} account deleted`);
          res.cookie(req.session.cookieId, {maxAge: 0});
          req.session.destroy();
          res.status(200).redirect('/');
        });
      }
    }); // end of conn.query()
  });   // end of db.getConnection()
});

module.exports = api;