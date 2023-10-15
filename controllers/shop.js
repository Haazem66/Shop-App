const Order = require('../models/order');
const Product = require('../models/product');
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');


const iTEMS_PER_PAGE = 2;

exports.getProducts = (req, res, next) => {
  const page = +req.query.page || 1;
  let totalItems;
  Product.find().countDocuments().then(numProducts => {
    totalItems = numProducts;
    return  Product.find()
    .skip((page - 1) * iTEMS_PER_PAGE)
      .limit(iTEMS_PER_PAGE)
  })
    .then(products => {
      res.render('shop/product-list', {
        prods: products,
        pageTitle: 'Products',
        path: '/products ',
        currentPage: page,
        hasNextPage: iTEMS_PER_PAGE * page < totalItems,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalItems / iTEMS_PER_PAGE)
      });
    })
    .catch(err => {
      console.log(err);
    });
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then(product => {
      res.render('shop/product-detail', {
        product: product,
        pageTitle: product.title,
        path: '/products',
      });
    })
    .catch(err => {const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);});
};

exports.getIndex = (req, res, next) => {
  const page = +req.query.page || 1;
  let totalItems;
  Product.find().countDocuments().then(numProducts => {
    totalItems = numProducts;
    return  Product.find()
    .skip((page - 1) * iTEMS_PER_PAGE)
      .limit(iTEMS_PER_PAGE)
  })
    .then(products => {
      res.render('shop/index', {
        prods: products,
        pageTitle: 'Shop',
        path: '/',
        currentPage: page,
        hasNextPage: iTEMS_PER_PAGE * page < totalItems,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalItems / iTEMS_PER_PAGE)
      });
    })
    .catch(err => {
      console.log(err);
    });
};

exports.getCart = async (req, res, next) => {
  const user =await req.user.populate('cart.items.productId');
  const products =await user.cart.items;
  await res.render('shop/cart', {
    path: '/cart',
    pageTitle: 'Your Cart',
    products: products,
  });
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId).then(product => {
    return req.user.addToCart(product);
  }).then(result => {
    console.log(result);
    res.redirect('/cart');
  })
};

exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  req.user
    .removeFromCart(prodId)
    .then(result => {
      res.redirect('/cart');
    })
    .catch(err => {const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);});
};

exports.postOrder =async (req, res, next) => {
  const user =await req.user.populate('cart.items.productId');
  const products =await user.cart.items.map(i => {
    return {quantity: i.quantity , product: {...i.productId._doc}};
  });
  const order =await new Order({
    user: {
      email: req.user.email,
      userId: req.user._id
    },
    products: products
  })
  await order.save().then(result => {
    req.user.clearCart()
  }).then(result => {
    res.redirect('/orders')
  }).catch(err => {const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);});
};

exports.getOrders = (req, res, next) => {
  Order.find({"user.userId": req.user._id}).then(orders => {
    res.render('shop/orders', {
      path: '/orders',
      pageTitle: 'Your Orders',
      orders: orders,
    });
  }).catch(err =>{const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);});
};


exports.getInvoice = (req, res, next) => {
  const orderId = req.params.orderId;
  Order.findById(orderId).then(order => {
    if (!order) {
      return next(new Error('No order found'));
    }
    if (order.user.userId.toString() !== req.user._id.toString()) {
      return next(new Error('Unauthorized'));
    }
    const invoiceName = 'invoice-' + orderId + '.pdf';
    //console.log(invoiceName);
    const invoicePath = path.join('data', 'invoices', invoiceName);
    const pdfDoc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename="' + invoiceName + '"');
    pdfDoc.pipe(fs.createWriteStream(invoicePath))
    pdfDoc.pipe(res);
    pdfDoc.fontSize(26).text('Invoice' , {
      underline: true
    })
    pdfDoc.text('-------------------------');
    let totalPrice = 0;
    order.products.forEach(prod => {
      totalPrice = totalPrice + prod.quantity * prod.product.price;
      pdfDoc.fontSize(14).text(prod.product.title + '-' + prod.quantity + 'x' + '$' + prod.product.price)
    });
    pdfDoc.text('Total Price: $' + totalPrice);
    pdfDoc.end();
    // fs.readFile(invoicePath, (err, data) => {
    //   if (err) {
    //     return next(err);
    //   }
    // const file = fs.createReadStream(invoicePath);

    // file.pipe(res);
    //res.send(data);
    //}
  }
  ).catch(err => next(err))
}