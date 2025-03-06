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
  destination: function (req, file, cb) {
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

    console.log(`${file} uploaded`);

    cb("Error: File upload only supports the following filetypes - " + filetypes);
  }
});

// import credentials for MySQL
const DB_HOST = process.env.DB_HOST;
const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_DATABASE = process.env.DB_DATABASE;
const DB_PORT = process.env.DB_PORT;

// Contact Us email
const GEN_EMAIL = process.env.GEN_EMAIL;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

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
db.getConnection((err, conn) => {
  if (err) throw (err);

  console.log(">>> DB connected successful: " + conn.threadId);
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
});     // end of /admin

// CONTACT US api; in real world would add protection against spam as well
api.post('/contact', async (req, res) => {
  // get data from client; make some changes to it if required
  const email = req.body.email.trim();
  const msg = req.body.msg.trim();

  // prep mysql call
  db.getConnection(async (err, conn) => {
    if (err) throw (err);

    // prep search query against mysql injection
    const preInsert =
      "INSERT INTO communication(email_from, email_to, message) VALUES(?, ?, ?)";
    const dbInsert = mysql.format(preInsert, [email, GEN_EMAIL, msg]);

    // save data to DB
    await conn.query(dbInsert, (err) => {
      if (err) throw (err);

      // close connection to MySQL
      conn.release();

      // send feedback to client and console
      console.log(`>>> Inquery email sent to ${GEN_EMAIL}`);
      res.status(200).send({ msg:
        'Thank you for contacting Guardian Link, we will get back to you shortly.' });
    }); // end of conn.query()
  });   // end of db.getConnection()
});     // end of /contact

// CREATE Basic USERS; admin tool
api.post("/createBasicUser", async (req, res) => {
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

  db.getConnection(async (err, conn) => {
    if (err) throw (err);

    const dbSearch =  // search DB
      "SELECT email FROM users WHERE email = ?";
    const query = mysql.format(dbSearch, [email]);

    const dbInsert = "INSERT INTO users VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    const insert = mysql.format(dbInsert,
      [0, firstName, lastName, email, hashedPassword, type, null, null, null, null,
      orgName]);

    await conn.query (query, async (err, result) => {
      if (err) throw (err);

      console.log(">>> Search Results");
      console.log(result.length);

      if (result.length !== 0) {
        conn.release();
        console.log(`>>> ${email} already exists`);
        res.status(409).send({ message: `${email} already exists` });
      }
      else {
        await conn.query (insert, (err, result) => {
          conn.release();

          if (err) throw (err);

          console.log(`>>> Created new User ${email}`);
          console.log(result.insertId);
          res.status(201).send({ message: `${email} account created` });
        });
      }
    }); // end of conn.query()
  });   // end of db.getConnection()
});     // end of /createBasicUser

// CREATE ORG USERS
api.post("/createOrgUser", async (req, res) => {
  const orgName = req.body.orgName.trim();
  const email = req.body.orgEmail.trim();
  const info = req.body.concern.trim();
  const type = 'org';

  // hash password
  const hashedPassword = await bcrypt.hash(req.body.orgPass1, 12);

  // prep connection to db
  db.getConnection(async (err, conn) => {
    if (err) throw (err);

    const dbSearch = "SELECT email FROM users WHERE email = ?";
    const query = mysql.format(dbSearch, [email]);

    const dbInsert = "INSERT INTO users VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    const insert = mysql.format(dbInsert,
      [0, null, null, email, hashedPassword, type, info, null, null, null, orgName]);

    await conn.query (query, async (err, result) => {
      if (err) throw (err);

      console.log(">>> Search Results");

      if (result.length !== 0) {
        conn.release();
        console.log(">>> Email already exists");
        res.status(409).send({ message: `${email} already registered, please login` });
      }
      else {
        await conn.query (insert, (err, result) => {
          if (err) throw (err);
          conn.release(); // close DB connection

          console.log(`>>> Created new User ${email}`);
          console.log(result.insertId); // user id
          res.status(201).send({ message: `Registration Successful` });
        });
      }
    }); // end of conn.query()
  });   // end of db.getConnection()
});     // end of /createOrgUser

// CREATE VOL USERS
api.post("/createVolUser", upload.single("resume"), async (req, res, next) => {
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

  // if file is sent, resume is provided
  if (req.file) {
    resume = "yes";
  }

  // hash pass
  const hashedPassword = await bcrypt.hash(req.body.volPass1, 12);

  // prep connection
  db.getConnection(async (err, conn) => {
    if (err) throw (err);

    const dbSearch = "SELECT email FROM users WHERE email = ?";
    const query = mysql.format(dbSearch, [email]);

    const dbInsert = "INSERT INTO users VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    const insert = mysql.format(dbInsert, [0, firstName, lastName, email, hashedPassword,
      type, null, hours, crime, resume, null]);

    await conn.query (query, async (err, result) => {
      if (err) throw (err);

      console.log(">>> Search Results");

      if (result.length !== 0) {
        conn.release();

        console.log(">>> Email already exists");
        res.status(409).send(`${email} already registered, please login`);
      }
      else {
        await conn.query (insert, (err, result) => {
          if (err) throw (err);

          conn.release();

          console.log(`>>> Created new User ${email}`);
          console.log(result.insertId);
          res.status(201).redirect("/login");
        });
      }
    }); // end of conn.query()
  });   // end of db.getConnection()
});     // end of /createVolUser

// DELETE user via Admin Tools
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
        console.log(`>>> ${email} No such account`);
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
});     // end of /deleteUser

// delete message from users box
api.post('/delMsg', async (req, res) => {
  const msgToDel = req.body.msgToDel;

  // prep mysql connection
  db.getConnection(async (err, conn) => {
    if (err) throw (err);

    const dbSearch = "SELECT id FROM communication WHERE id = ?";
    const query = mysql.format(dbSearch, [msgToDel]);

    const dbDelete = "DELETE FROM communication WHERE id = ?";
    const delMsg = mysql.format(dbDelete, [msgToDel]);

    // connect to DB to del msg
    await conn.query(query, async (err, result) => {
      if (err) throw (err);

      if (result.length === 0) {
        conn.release();
        console.log(`>>> #${msgToDel} message does not exist`);
        res.status(400).send({ message: `Message does not exist` });
      }
      else {
        await conn.query (delMsg, (err) => {
          conn.release();

          if (err) throw (err);

          console.log(`>>> #${msgToDel} message deleted`);
          res.status(200).send({ message: `Message deleted` });
        });
      }
    }); // end of conn.query()
  });   // end of db.getConnection()
});     // end of /delMsg

// delete your own user
api.post("/delUser", async (req, res) => {
  const email = req.session.email;
  const type = req.session.type;

  // prep db conn
  db.getConnection(async (err, conn) => {
    if (err) throw (err);

    const dbSearch = "SELECT email FROM users WHERE user_type = ?";
    const query = mysql.format(dbSearch, [type]);

    const dbDelete = "DELETE FROM users WHERE email = ?";
    const delUser = mysql.format(dbDelete, [email]);

    await conn.query(query, async (err, result) => {
      if (err) throw (err);

      // user does not exist
      if (result.length === 0) {
        conn.release();

        console.log(`>>> ${email} No such account`);
        res.status(400).send({ message: `${email} does not exist` });
      }
      // do not delete if only one admin user
      else if (type === 'admin' && result.length === 1) {
        conn.release();

        console.log(`>>> Must have at least one ${type} user`);
        res.status(400).send({ message: `Must have at least one ${type} user` });
      }
      else {
        await conn.query (delUser, (err) => {
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
});     // end of /delUser

// EDIT users
// In real life environment if user type changes, would force logout the user
// We would also be using session stores instead of memorystore
api.post("/editUser", async (req, res) => {
  const email = req.body.hiddenEmail.trim();

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
          console.log(`>>> ${email} No such account`);
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
});       // end of /editUser

// fetch messages for user
api.post('/fetchMsg', async (req, res) => {
  const email = req.session.email.trim();

  // prep db connection
  db.getConnection(async (err, conn) => {
    if (err) throw (err);

    const dbSearch = "SELECT * FROM communication WHERE email_to = ?";
    const query = mysql.format(dbSearch, [email]);

    // connect to mysql get results
    await conn.query(query, async (err, result) => {
      if (err) throw (err);

      console.log(">>> Query Success");
      conn.release();

      res.status(200).send(result);
    }); // end of conn.query()
  });   // end of db.getConnection()
});     // end of /fetchMsg

// LOGIN (AUTH USER & create user session)
// in real world you would limit the amount of attempts to login
api.post("/login", (req, res) => {
  const email = req.body.email.trim();
  const password = req.body.pass.trim();

  // prep connection to mysql
  db.getConnection (async (err, conn) => {
    if (err) throw (err);

    const dbSearch = "SELECT * FROM users WHERE email = ?";
    const query = mysql.format(dbSearch, [email]);

    // get data from DB
    await conn.query(query, async (err, result) => {
      conn.release(); // close mysql connection

      if (err) throw (err);

      if (result.length === 0) {
        res.status(401).send({ message: 'Authenticaton Failure' });
      }
      else {
        // get hashed pass from result & save some other useful info
        const hashedPassword = result[0].password;
        const firstName = result[0].forename;
        const lastName = result[0].surname;
        const hours = result[0].available;
        const orgName = result[0].org_name;
        const type = result[0].user_type;
        const id = result[0].id;
        const info = result[0].concerns;

        // make sure password hash matches
        if (await bcrypt.compare(password, hashedPassword)) {
          // if it does save session info and auth user
          req.session.auth = true;
          req.session.firstName = firstName;
          req.session.lastName = lastName;
          req.session.email = email;
          req.session.hours = hours;
          req.session.orgName = orgName;
          req.session.info = info;
          req.session.type = type;
          req.session.cookieId = id;  // cookId will be user id
          res.cookie(id, { maxAge: 30000, signed: true, httpOnly: true});

          // feedback to console and user
          console.log(req.session);
          console.log(req.session.id);
          res.status(200);
        }
        else {
          res.status(401).send({ message: 'Authenticaton Failure' });
        } // end of bcrypt.compare()
        res.end();
      }   // end of User exists
    });   // end of conn.query()
  });     // end of db.connection()
});       // end of /login

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
      conn.release();

      res.status(200).send(result);
    }); // end of conn.query()
  });   // end of db.getConnection()
});     // end of /orgList

// XMLHttpRequest req to populate page with user info
api.post("/profile", (req, res) => {
  if (req.session.auth) {
    res.status(200).send({ orgName: req.session.orgName, fname: req.session.firstName,
     sname: req.session.lastName, email: req.session.email, hours: req.session.hours,
     info: req.session.info, type: req.session.type });
  }
  else {
    res.end(400);
  }
}); // end of /profile

/***** WORK IN PROGRESS *****/
// not a great way to setup password reset, not a very secure way.
// real life would want to send a reset email link and let the user reset their password
// while the email token is valid
api.post("/passReset", async (req, res) => {
  const email = req.body.email.trim();
  const msg = `Reset password for ${email}`;

  // prep db call
  db.getConnection(async (err, conn) => {
    if (err) throw (err);

    const dbSearch = "SELECT email, id FROM users WHERE email = ?";
    const query = mysql.format(dbSearch, [email]);

    // connect to DB to get results
    await conn.query(query, async (err, result) => {
      if (err) throw (err);

      if (result.length === 0) {
        conn.release();
        console.log(`>>> ${email} does not exist`);
        res.status(404).send({ message: `Something went wrong.` });
      }
      else {
        // Search email resets already sent, if it has been sent already, we will not
        // send dumplicate msg for admin user
        const msgSearch =
          "SELECT email_from, pass_reset FROM communication WHERE email_from = ? AND pass_reset = ?"
        const msgQuery = mysql.format(msgSearch, [email, 'yes']);

        await conn.query(msgQuery, async (err, result) => {
          if (err) throw (err);

          // reset has not been sent
          if (result.length === 0) {
            conn.release();

            // save message to DB, the admin will reset password
            // prep mySQL connection
            db.getConnection(async (err, conn) => {
              if (err) throw (err);

              const dbMsg =
                "INSERT INTO communication(email_from, email_to, message, pass_reset) VALUES(?, ?, ?, ?)";
              const saveMsg = mysql.format(dbMsg, [email, ADMIN_EMAIL, msg, 'yes']);

              // connect to DB and save message
              await conn.query(saveMsg, async (err, result) => {
                conn.release();
                console.log(`>>> ${email} password reset sent`)
                res.status(200).send({ message: `Password reset sent to admin` });
              });
            }); // end of db.getConnection()
          }
          else {
            conn.release();

            console.log(`>>> ${email} reset already sent`);
            res.status(400).send({ message: `Password reset already sent` });
          }
        });     // end of conn.query()
      }
    }); // end of conn.query()
  });   // end of db.getConnection()
});     // end of /resetPass

// messaging app, will use mysql DB, keeping it simple for this project
api.post("/sendMsg", async (req, res) => {
  const emailFrom = req.session.email.trim();
  const emailTo = req.body.email.trim();
  const msg = req.body.msg.trim();

  // ADD REQ att to html tag
  if (!msg) {
    res.status(400).send({ message: `Message cannot be empty` });
  }
  else {
    // prep connection to DB
    db.getConnection(async (err, conn) => {
      if (err) throw (err);

      const dbInsert =
        "INSERT INTO communication(email_from, email_to, message) VALUES(?, ?, ?)";
      const insert = mysql.format(dbInsert, [emailFrom, emailTo, msg]);

      // connect to mysql and make the changes
      await conn.query(insert, (err, result) => {
        conn.release(); // close mysql connection
        if (err) throw (err);

        console.log(`>>> Message sent to ${emailTo}`);
        res.status(201).send({ message: `Message sent to ${emailTo}` });
      }); // end of conn.query()
    });   // end of db.getConnection()
  }
});     // end of /sendMsg

// Update own user
api.post('/updateUser', async (req, res) => {
  // will be used to query the DB
  const email = req.session.email;
  const type = req.session.type;

  // populate data to be updated; will not be updated if not changed
  let firstName = req.body.fname.trim().charAt(0).toUpperCase() +
    req.body.fname.slice(1).toLowerCase();
  let lastName = req.body.sname.trim().charAt(0).toUpperCase() +
    req.body.sname.slice(1).toLowerCase();
  // will change from null if updated by user
  let hours;
  if (req.body.hours) {
    hours = req.body.hours;
  }
  let orgName = req.body.orgName.trim();
  let info = req.body.info.trim();

  // certain usertypes cannot set certain data; example org user cannot set hours
  if (type === 'org') {
    firstName = null;
    lastName = null;
    hours = null;
  }
  else if (type === 'vol') {
    orgName = null;
    info = null;
  }
  else if (type === 'admin') {
    hours = null;
    orgName = null;
    info = null;
  }

  // only update pass if it was edited
  if (req.body.pass) {
    const hashedPass = await bcrypt.hash(req.body.pass, 12);

    db.getConnection(async (err, conn) => {
      if (err) throw (err);
  
      const dbSearch =
        "SELECT forename, surname, password, concerns, available, org_name FROM users WHERE email = ?";
      const query = mysql.format(dbSearch, [email]);
      const dbUpdate =
        "UPDATE users SET forename=?, surname=?, password=?, concerns=?, available=?, org_name=? WHERE email=?";
      const update = mysql.format(dbUpdate, [firstName, lastName, hashedPass, info,
        hours, orgName, email]);

      await conn.query(query, async (err, result) => {
        if (err) throw (err);

        if (result.length === 0) {
          conn.release();
          console.log(`>>>${email} No such account`);
          res.sendStatus(400);
        }
        else {
          await conn.query(update, (err) => {
            conn.release();
            if (err) throw (err);
  
            console.log(`>>> ${email} account/password updated`);
            // update session values
            req.session.firstName = firstName;
            req.session.lastName = lastName;
            req.session.email = email;
            req.session.hours = hours;
            req.session.orgName = orgName;
            req.session.info = info;
            res.status(200).send({ message: `${email} account/password updated` });
          });
        }
      }); // end of conn.query()
    });   // end of db.getConnection()
  }
  // will update user if password is not changed
  else {
    db.getConnection(async (err, conn) => {
      if (err) throw (err);
  
      const dbSearch =
        "SELECT forename, surname, concerns, available, org_name FROM users WHERE email = ?";
      const query = mysql.format(dbSearch, [email]);
      const dbUpdate =
        "UPDATE users SET forename=?, surname=?, concerns=?, available=?, org_name=? WHERE email=?";
      const update = mysql.format(dbUpdate, [firstName, lastName, info, hours, orgName,
        email]);
  
      await conn.query(query, async (err, result) => {
        if (err) throw (err);

        if (result.length === 0) {
          conn.release();
          console.log(`>>>${email} No such account`);
          res.sendStatus(400);
        }
        else {
          await conn.query(update, (err) => {
            conn.release();
            if (err) throw (err);

            console.log(`>>> ${email} account updated`);
            // update session info
            req.session.firstName = firstName;
            req.session.lastName = lastName;
            req.session.email = email;
            req.session.hours = hours;
            req.session.orgName = orgName;
            req.session.info = info;
            res.status(200).send({ message: `${email} account updated` });
          });
        }
      }); // end of conn.query()
    });   // end of db.getConnection()
  }
});       // end of /updateUser

api.post("/volList", async(req, res) => {
  const type = 'vol';

  // prep mysql conn
  db.getConnection(async (err, conn) => {
    if (err) throw (err);

    const dbSearch =
      "SELECT forename, surname, email, available FROM users WHERE user_type=?";
    const query = mysql.format(dbSearch, [type]);

    // connect to mysql get results
    await conn.query(query, async (err, result) => {
      if (err) throw (err);

      console.log(">>> Query Success");
      conn.release();

      res.status(200).send(result);
    }); // end of conn.query()
  });   // end of db.getConnection()
});     // end of /volList


module.exports = api;