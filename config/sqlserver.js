require("dotenv").config();
const sql = require("mssql");

const pool = new sql.ConnectionPool({
  user: process.env.USER,
  password: process.env.PASSWORD,
  port: process.env.PORT_DATABASE,
  server: process.env.HOST,
  database: process.env.DATABASE,
  options: {
    encrypt: false,
    enableArithAbort: true
  },
  pool: {
    max: 30,
    min: 0,
    idleTimeoutMillis: 30000
  }
});

module.exports = pool;
