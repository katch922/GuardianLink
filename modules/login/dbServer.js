const express = require('express')
const app = express()

const mysql = require('mysql2')
require('dotenv').config()

const db = mysql.createPool({
  connectionLimit: 100,
  host: DB_HOST,
  user: DB_USER,
  passwordd: DB_PASSWORD,
  database: DB_DATABASE,
  port: DB_PORT
})