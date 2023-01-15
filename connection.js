const mysql = require('mysql2');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'umut',
  database: 'wsproject'
});

pool.query('SELECT * FROM user', function (error, results, fields) {
  if (error) {
    console.error(error);
  } else {
    console.log(results);
  }
});

module.exports= pool ; 
