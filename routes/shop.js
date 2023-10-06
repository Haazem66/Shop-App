
const express = require('express');

const shopController = require('../controllers/shop');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.get('/', shopController.getIndex);

router.get('/products', shopController.getProducts);

router.get('/products/:productId', shopController.getProduct);

// // // Order metters! This route delete will neve be reached because the dynamic route above
// // // router.get('/products/delete');

router.get('/cart',isAuth, shopController.getCart);

router.post('/cart',isAuth, shopController.postCart);

router.post('/cart-delete-item',isAuth, shopController.postCartDeleteProduct);

router.post('/create-order',isAuth, shopController.postOrder);

router.get('/orders',isAuth, shopController.getOrders);

module.exports = router;