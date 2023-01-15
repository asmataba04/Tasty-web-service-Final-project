const express = require('express');
const pool = require('../connection');
const router = express.Router();
let ejs = require('ejs');
let pdf = require('html-pdf');
let path = require('path');
var fs = require('fs');
const uuid = require('uuid');
var auth = require('../service/authentication');
const pdfkit = require('pdfkit');

//generate reports
router.post('/generateReport', auth.authenticateToken, (req, res) => {
  const generatedUuid = uuid.v1();
  let orderDetails = req.body;
  var productDetails = JSON.parse(orderDetails.productDetails);

  var query = "insert into bill(name,uuid,email,contactNumber,TASTY,paymentMethod,total,productDetails,createdBy) values (?,?,?,?,?,?,?,?,?)";
  pool.query(query, [orderDetails.name, generatedUuid, orderDetails.email, orderDetails.contactNumber, orderDetails.TASTY, orderDetails.paymentMethod, orderDetails.total, orderDetails.productDetails, res.locals.email], (err, results) => {

    console.log("reesulttt----------", orderDetails);
    console.log("reesuuuuuuults1----------", productDetails);
    if (!err) {
      // Add a console log to see the path to the report.ejs file
      console.log("Path to report2.ejs:", path.join(__dirname, "report2.ejs"));
      console.log('productDetails:', productDetails)
      ejs.renderFile(path.join(__dirname, "report2.ejs"), {productDetails: productDetails, name: orderDetails.name, email: orderDetails.email, contactNumber: orderDetails.contactNumber, TASTY: orderDetails.TASTY, paymentMethod: orderDetails.paymentMethod, total: orderDetails.total}, {}, (err, results1) => {

        if (err) {
          console.error("Error rendering EJS template:", err);
          return res.status(500).json(err);
        } else {
            
        // Create a new PDFKit document
        const html = results1;
        const options = {};
        
        pdf.create(html, options).toFile('./PDFs/' + generatedUuid + '.pdf', function(err, res) {
          if (err) return console.log(err);
          console.log(res); // { filename: '/app/businesscard.pdf' }
        });
        

        }
      });
    } else {
      console.error("Error inserting data into bill table:", err);
      return res.status(500).json(err);
    }
  });
});


module.exports = router;

