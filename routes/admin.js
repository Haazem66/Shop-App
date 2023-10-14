const path = require('path');

const express = require('express');
const {check , body} = require('express-validator');
const adminController = require('../controllers/admin');
const isAuth = require('../middleware/is-auth');
const router = express.Router();

// /admin/add-product => GET
router.get('/add-product',isAuth,adminController.getAddProduct);
router.get('/products' ,isAuth, adminController.getProducts); 

// // /admin/add-product => POST
router.post('/add-product' ,[body('title').isLength({min: 5}).isString().trim(),    
body('price').isFloat(),
body('description').isString().isLength({min: 8 , max: 400}).trim()
] ,isAuth,adminController.postAddProduct);
router.get('/edit-product/:productId',isAuth , adminController.getEditProduct);
router.post('/edit-product',[body('title').isLength({min: 5}).isString().trim(),
body('price').isFloat(),
body('description').isString().isLength({min: 8 , max: 400}).trim()
],isAuth , adminController.postEditProduct);
router.post('/delete-product' ,isAuth , adminController.postDeleteProduct);
module.exports = router;