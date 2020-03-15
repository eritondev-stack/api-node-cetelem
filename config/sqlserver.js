require("dotenv").config();
const sql = require("mssql");

const pool = new sql.ConnectionPool({
  user: "user_dev",
  password: "E21071993",
  port: 5003,
  server: "mssql914.umbler.com",
  database: "banco_projetos",
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
