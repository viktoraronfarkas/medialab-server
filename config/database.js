const mysql = require("mysql");

const pool = mysql.createPool({
  host: "atp.fhstp.ac.at", // Your connection address (localhost).
  port: 8007,
  user: "uasync", // Your database's username.
  password: process.env.DB_PASSWORD,
  database: "uasync",
});
module.exports = pool;
