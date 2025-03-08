// db.js
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',             // Your MySQL host
  user: 'root',   // Your MySQL username
  password: 'root', // Your MySQL password
  database: 'email_verifier',      // Your database name
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

module.exports = pool;
