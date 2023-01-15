const { query } = require('express');
const express = require('express');
const pool = require('../connection');
const router = express.Router();
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
require('dotenv').config();
const bcrypt = require('bcrypt');
var auth = require('../service/authentication')
var checkRole = require('../service/checkRole')
const crypto = require('crypto');

//login as admin 

router.post('/loginadmin', (req, res) => {
  const { email, password } = req.body;
  var query = "SELECT email, password, role, status FROM user WHERE email = ? AND role = 'admin'";
  pool.query(query, [email], (err, results) => {
    if (!err) {
      if (results.length <= 0) {
        return res.render('error.ejs', { message: "Incorrect email or password" });
      }
      else if (results[0].status === 'false') {
        return res.render('error.ejs', { message: "Wait for admin approval" });
      }
      else {
        const decipher = crypto.createDecipher('aes-256-cbc', process.env.ADMIN_KEY);
        let decrypted = decipher.update('fUdOKDTeOzd4tam3yrfp3iewTr5lABIltVk3SyCQS4Q=', 'base64', 'utf8');
        decrypted += decipher.final('utf8');
        if (password !== decrypted) {
          return res.render('error.ejs', { message: "Incorrect email or password" });
        } const response = { email: results[0].email, role: results[0].role };
        const accessToken = jwt.sign(response, process.env.ADMIN_TOKEN, { expiresIn: '24h' });
        res.render('token', { token: accessToken });
      }
    } else {
      return res.render('error.ejs', { message: 'Error checking email in database' });
    }
  });
});


//signup

router.post('/signup', (req, res) => {
  // extract the user data from the request body
  const user = req.body;

  // check if email is already in use
  var checkEmailQuery = 'SELECT * FROM user WHERE email = ?';
  pool.query(checkEmailQuery, [user.email], (err, result) => {
    if (err) {
      return res.render('error.ejs', { message: "error" });
    }

    if (result.length > 0) {
      // email is already in use
      res.redirect('/user/loginpage');
    }

    // proceed to insert new user
    // generate a salt and hash the user's password
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(user.password, salt);

    // insert the user into the database with a status of 'pending'
    var insertUserQuery = 'INSERT INTO user (name, contactNumber,email,password, status, role) VALUES (?, ?, ?, ?,?,?)';
    pool.query(insertUserQuery, [user.name, user.contactNumber, user.email, hashedPassword, 'pending', 'user'], (err, result) => {
      if (!err) {
        return res.render('loginpage', { message: "user created successfully🧡" })
      }
      return res.render('error', { message: "something went wrong :( " });
    });
  });
});

//////  // create a transporter object using the MailTrap SMTP server
// const transporter = nodemailer.createTransport({
// host: 'smtp.mailtrap.io',
//port: 2525,
//auth: {
/// user: '433135760787-tu6022o3j5js4vsjoccgich1iqvs3tpv.apps.googleusercontent.com',
//pass: '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'
//}
//});

// send the email
//transporter.sendMail({
//from: 'your@email.com',
//to: user.email,
//subject: 'Verify Your Email',
//html: '<p>Please click the following link to verify your email:</p>' +
// '<p><a href="http://localhost:3000/verify?email=' + user.email + '">Verify Email</a></p>'
//}, (error, info) => {
// if (error) {
//   console.log(error);
// } else {
//   console.log(info);
// }
//});


//page
router.get('/signuppage', (req, res) => {
  res.render('signup.ejs');
});

//home page
router.get('/',(req,res)=>{
  res.render('home.ejs') ; 
})

//loginpage
router.get('/loginpage', (req, res) => {
  res.render('login.ejs');
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  var query = "select email,password,role,status from user where email=?";
  pool.query(query, [email], (err, results) => {

    if (!err) {

      ///special case of the admin shorter lifecycle of the token
      if (email == 'asmataba04@gmail.com') {
        const isPasswordValid = bcrypt.compareSync(password, results[0].password);
        if(isPasswordValid){
          const response = { email: results[0].email, role: results[0].role };
          const accessToken = jwt.sign(response, process.env.ACCESS_Token, { expiresIn: '2h' });
          res.render('token', { token: accessToken }); }
        else{res.status(400).json({message:'incorrect password'}) ;}
      }

      else if (results.length <= 0) {
        return res.render('error.ejs', { message: "incorrect Email or password" });
      }
      else if (results[0].status === 'false') {
        return res.render('error.ejs', { message: "wait for admin approval" });
      }

      else {
        // compare provided password with hashed password in database
        const isPasswordValid = bcrypt.compareSync(password, results[0].password);

        if (!isPasswordValid) {
          return res.render('error.ejs', { message: "incorrect Email or password" });
        }

        // generate JWT and redirect to new route
        const response = { email: results[0].email, role: results[0].role };
        const accessToken = jwt.sign(response, process.env.ACCESS_Token, { expiresIn: '24h' });
        res.render('token', { token: accessToken });

        //var updateStatusQuery = "UPDATE user SET status = 'verified' WHERE email = ?";
        //pool.query(updateStatusQuery, [email], (err, result) => {
        //if (!err) {
        //} 
        //else {
        //console.log(err);
        //return res.render('error.ejs', { message: 'Error updating user status' });
        //}
        //});
      }
    }
    else {
      return res.render('error.ejs', { message: 'Error checking email in database' });
    }
  });
});


///testing get on postman needs to put the key in head authorization as in 18:26 session3    
router.get('/get', auth.authenticateToken, (req, res) => {
  var query = "select id,name,email,contactNumber,status from user where role='user'";
  pool.query(query, (err, results) => {
    if (!err) {
      return res.status(200).json(results);
    }
    else {
      return res.status(500).json(err);
    }
  })
})

//update user status (not verified for example)

router.patch('/update', auth.authenticateToken, (req, res) => {
  let user = req.body;
  var query = "update user set status=? where id=?";
  pool.query(query, [user.status, user.id], (err, results) => {
    if (!err) {
      if (results.affetedRows == 0) {
        return res.status(404).json({ message: "user id doesn't exist" });

      }
      return res.status(200).json({ message: "user updated successfully" });
    }
    else {
      return res.status(500).json(err);
    }
  })
})

router.get('/checkToken', auth.authenticateToken, (req, res) => {
  return res.status(200).json({ message: "true" });

})

router.get('/verify', (req, res) => {
  // extract the email from the query string
  const email = req.query.email;

  // update the user's status to 'verified' in the database
  var updateUserQuery = 'UPDATE user SET status = ? WHERE email = ?';
  pool.query(updateUserQuery, ['verified', email], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Error updating user status in database' });
    }
  });

  // render a confirmation page
  res.render('verify.ejs', { message: 'Your email has been verified! You can now log in.' });
});



module.exports = router;

