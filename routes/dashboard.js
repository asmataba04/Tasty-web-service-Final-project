const express = require('express');
const pool = require('../connection');
const router = express.Router();
const ejs = require('ejs');
var fetch = require('node-fetch');
var auth = require('../service/authentication')
var checkRole = require('../service/checkRole')

router.get('/details',checkRole.checkRole,(req, res, next) => {
    var categoryCount;
    var productCount;
    var billCount;
    var query = " select count(id) as categoryCount from category";
    pool.query(query, (err, results) => {
        if (!err) {
            categoryCount = results[0].categoryCount;

        }
        else {
            return res.status(500).json(err);
        }
    })

   
    var query = " select count(id) as productCount from product";
    pool.query(query, (err, results) => {
        if (!err) {
            productCount = results[0].productCount;

        }
        else {
            return res.status(500).json(err);
        }
    })

    var query = " select count(id) as billCount from bill";
    pool.query(query, (err, results) => {
        if (!err) {
            billCount = results[0].billCount;
            var data = {
                categoryCount: categoryCount,
                productCount: productCount,
                billCount: billCount,
              };
            res.render('dashboard', data);
        }
        else {
            return res.status(500).json(err);
        }
    })
});

module.exports = router;
