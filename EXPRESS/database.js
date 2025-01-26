const mysql = require('mysql2');
const pool = mysql.createPool({
    host: process.env.HOST,
    database: process.env.DATABASE,
    port: process.env.PORT,
    user: process.env.USER,
    password: process.env.PASSWORD,
    connectionLimit: process.env.CONNECTION_LIMIT
})

module.exports = pool;