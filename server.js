require('dotenv').config();
const http = require('http');
const app =require('./index');
const server = http.createServer();
const port = 7777;                              //an error occurs i changes the port to 8081
const express = require('mysql2');

app.listen(port, () => {
    console.log('API server is listening on port ${port}');
}); 

app.get('/verify', (req, res) => {
    const email = req.query.email;
    const updateStatusQuery = 'UPDATE user SET status = "verified" WHERE email = ?';
    pool.query(updateStatusQuery, [email], (err, result) => {
      if (err) {
        return res.status(500).json({ message: 'Error updating user status' });
      }
      return res.send('Email verified successfully');
    });
  });
  