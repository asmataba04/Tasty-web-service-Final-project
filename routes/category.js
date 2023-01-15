const express = require('express');
const pool = require('../connection');
const router = express.Router();
var auth = require('../service/authentication');
var checkRole = require('../service/checkRole');

router.post('/add', auth.authenticateToken, checkRole.checkRole , (req, res, next) => {
    let category = req.body;
    var query ="insert into category(name) values(?)";
    pool.query(query,[category.name],(err,results) => {
        if(!err) {
            return res.status(200).json({message:"category added successfully"});
        } else {
            return res.status(500).json(err);
        }
    })
}) 

router.get('/get', (req, res, next) => {
    var query = "select * from category order by name"; 
    pool.query(query, (err, results) => {
        if(!err) {
            return res.status(200).json(results);
        } else {
            return res.status(500).json(err);
        }
    })
});
//doing a partial update, they can use HTTP PATCH
router.patch('/update', auth.authenticateToken, checkRole.checkRole, (req, res, next) => {
    let product = req.body; 
    var query ="update category set name = ? where id = ?"; 
    pool.query(query,[product.name, product.id], (err, results) => {
        if(!err) {
            if(results.affectedRows == 0) {
                return res.status(404).json({message: "wrong category ID "});
            }
            return res.status(200).json({message:" category updated correctly"});
        } else {
            return res.status(500).json(err);  
        }
    })
});

module.exports = router
