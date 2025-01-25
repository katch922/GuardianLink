const express = require('express')
const bcrypt = require('bcryptjs')
const mysql = require('mysql2')
const path = require('path');
const generateAccessToken = require("./generateAccessToken")  // import function
require('dotenv').config()

// import credentials
const DB_HOST = process.env.DB_HOST
const DB_USER = process.env.DB_USER
const DB_PASSWORD = process.env.DB_PASSWORD
const DB_DATABASE = process.env.DB_DATABASE
const DB_PORT = process.env.DB_PORT
const port = process.env.PORT // port for express

const app = express()
app.use(express.json())  // to read req.body.<params>
app.use(express.urlencoded({extended: true})) // parse data from POST for req.body.
app.use(express.static(path.join(__dirname, '../../'))) // serve files
// start express
app.listen(port, () => console.log(`Server Started on port ${port}...`))

// create pool for mysql connections
const db = mysql.createPool({
  connectionLimit: 100,
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_DATABASE,
  port: DB_PORT
})

// connect to DB
db.getConnection((err, connection) => {
  if (err) throw (err);
  console.log("DB connected successful: " + connection.threadId)
})

// CREATE USER
// Route to createUser
app.post("/createUser", async (req,res) => {
  const user = req.body.username;
  const email = req.body.email;
  const hashedPassword = await bcrypt.hash(req.body.password, 12);
  const type = req.body.user_type;

  db.getConnection(async (err, connection) => {
    if (err) throw (err);

    const dbSearch = 
      "SELECT username,email,password,user_type FROM users WHERE username = ?"
    const query = mysql.format(dbSearch, [user])

    const dbInsert = "INSERT INTO users VALUES(?, ?, ?, ?)"
    const insert = mysql.format(dbInsert, [user, email, hashedPassword, type])

    await connection.query (query, async (err, result) => {
      if (err) throw (err);

      console.log("------> Search Results")
      console.log(result.length)

      if (result.length != 0) {
        connection.release()
        console.log("------> User already exists")
        res.sendStatus(409)
      }
      else {
        await connection.query (insert, (err, result) => {
          connection.release()

          if (err) throw (err);

          console.log("--------> Created new User")
          console.log(result.insertId)
          res.sendStatus(201)
        })
      }
    })  // end of connection.query()
  })    // end of db.getConnection()
})      // end of app.post()

// LOGIN (AUTH USER & RETURN ACCESS TOKEN)
// Create route /login
app.post("/login", (req, res) => {
  const user = req.body.username
  const password = req.body.password

  db.getConnection (async (err, connection) => {
    if (err) throw (err);

    const dbSearch = "SELECT * FROM user WHERE username = ?"
    const query = mysql.format(dbSearch, [user])

    await connection.query(query, async (err, result) => {
      connection.release()

      if (err) throw (err);

      if (result.length == 0) {
        console.log("---------> User does not exist")
        res.sendStatus(404)
      }
      else {
        const hashedPassword = result[0].password
        // get hashed pass from result

        if (await bcrypt.compare(password, hashedPassword)) {
          console.log("---------> Login Successful")
          console.log("---------> Generating accessToken")
          const token = generateAccessToken({user: user})
          console.log(token)
          res.json({accessToken: token})
        }
        else {
          res.send("Password incorrect!")
        } // end of bcrypt.compare()
      }   // end of User exists
    })    // end of connection query()
  })      // end of db.connection()
})        // end of app.post()