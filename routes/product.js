const express = require('express');
const pool = require('../connection');
const router = express.Router();
var auth = require('../service/authentication');
var checkRole = require('../service/checkRole');
let ejs = require('ejs');
let pdf = require('html-pdf');
let path = require('path');
var fs = require('fs');


router.post('/add', auth.authenticateToken, checkRole.checkRole, (req, res) => {
    let product = req.body;
    var query = "insert into product (name,categoryId,description,price,TASTY,status) values(?,?,?,?,,?,'true')";
    pool.query(query, [product.name, product.categoryID, product.description, product.price, product.TASTY], (err, results) => {
        if (!err) {
            return res.status(200).json({ message: "Product added successfuly" });

        }
        else {
            return res.status(500).json(err);
        }


    })
})

router.get('/get',auth.authenticateToken, (res,req, next) => {
    var query = "select p.id, p.name, p.description, p.price, p.status,p.TASTY, c.id as category, c.name as categoryname from product as p INNER join category as c where p.categoryID = c.id ";
    pool.query(query, (err, results) => {
        if (!err) {
            return res.status(200).json(results);
        }
        else {
            return res.status(500).json(err);
        }
    })
})

router.get('/getByCategory/:id',auth.authenticateToken,(req,res,next)=>{
    const id = req.params.id ; 
    var query = "select id,name from product where categoryID= ? and status ='true' "
    pool.query(query,[id],(err,results)=>{
        if(!err){
            return res.status(200).json(results) ; 
         }
        else{ 
            return res.status(500).json(err);

            }
        
    })
})

router.get('/getById/:id',auth.authenticateToken,(req,res,next)=>{
    const id = req.params.id ; 
    var query= "select id,name,description,price,TASTY from product where id=?" ; 
    pool.query(query,[id],(err,results)=>{
        
        if(!err){
            return res.status(200).json(results[0]) ; 
        }
        else {
            return res.status(500).json(err); 
        }
    })
})


router.patch('/update',auth.authenticateToken,checkRole.checkRole, (req,res,next)=>{
    let product = req.body ; 
    var query ="update product set name=?,categoryId=?,description=?,price=? where id=?" ;
    pool.query(query,[product.name,product.categoryId,product.description,product.price,product.id],(err,results)=>{
        if(!err){
            if(results.affectedRows == 0){
                return res.status(404).json({message:"product doesn't found"}) ; 

            }
            return res.status(200).json({message: " product updated successfully"}) ; 
        }
        else {
            return res.status(500).json(err) ; 
        }
    })
})

router.delete('/delete',auth.authenticateToken,checkRole.checkRole,(req,res,next)=>{
   const id = req.params.id ; 
   var query = "delete from product where id=?" ; 
   pool.query(query,[id],(err,results)=>{
    if(!err){
            if (results.affectedRows==0){
                return res.status(404).json({Message:"id doesn't found"}) ; 
            } 
            return res.status(200).json({message:"product deleted"}) ;
    }
    else{
        return res.status(500).json(err) ; 
    }
   }) 
})
  

//update products unvailable 

router.patch('/updatestatus',auth.authenticateToken,checkRole.checkRole, (req,res,next)=>{
    let user = req.body ; 
    var query ="update product set status=? where id=?" ;
    pool.query(query,[user.status, user .id],(err,results)=>{
        if(!err){
            if(results.affectedRows == 0){
                return res.status(404).json({message:"product id doesn't found"}) ; 

            }
            return res.status(200).json({message:" product status updated successfully"}) ; 
        }
        else {
            return res.status(500).json(err) ; 
        }
    })
})



router.get('/getByTasty/:column',(req, res, next) => {
    // Get the column name from the request parameters
    const column = req.params.column;
  
    // Check if the column exists in the table
    if (column !== 'Tasty' && column !== 'Tasty_lounge') {
        return res.send("Invalid column name.");
    }
  
    // Construct the SELECT query
    const query = `SELECT name, description, price FROM product WHERE ${column} = 1`;
  
    // Execute the query
    pool.query(query, (err, results) => {
        console.log("reesulttt----------", results);  
      if (!err) {
        res.render('menu.ejs', { menu: results });
      } else {
        console.log(err);
      }
    });
});

  


  

module.exports = router ; 