const Product = require('../models/product');
const mongoose = require('mongoose'); 
const {validationResult} = require('express-validator');
exports.getAddProduct = (req, res, next) => {
  console.log('getAddProduct');
  if(!req.session.isLoggedIn){
    return res.redirect('/login');
  }
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    hasError: false,
    editing: false,
    errorMessage: null
  });
};

exports.postAddProduct = (req, res, next) => {
  console.log('postAddProduct')
  const title = req.body.title;
  const imageUrl = req.file;
  const price = req.body.price;
  const description = req.body.description;
  const { errors } = validationResult(req);
  console.log(imageUrl.path);
  if (errors.length > 0) {
    return res.status(422).render('admin/edit-product', {
      pageTitle: 'Add Product',
      path: '/admin/add-product',
      editing: false,
      product: { title, price, description },
      hasError: true,
      errorMessage: errors[0].msg,
    });
  }
  const product = new Product({
    title: title,
    price: price,
    description: description,
    imageUrl: imageUrl.path,
    userId: req.user
  });
  product
    .save()
    .then(result => {
      // console.log(result);
      console.log('Created Product');
      res.redirect('/admin/products');
    })
    .catch(err => {
      // return res.status(500).render('admin/edit-product', {
      //   pageTitle: 'Add Product',
      //   path: '/admin/add-product',
      //   editing: false,
      //   product: { title, imageUrl, price, description },
      //   hasError: true,
      //   errorMessage: 'Database operation failed.',
      //   validationErrors: [],
      // });
      res.redirect('/500');
      
    });
};

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect('/');
  }
  const prodId = req.params.productId;
  Product.findById(prodId)
    // Product.findById(prodId)
    .then(product => {
      if (!product) {
        return res.redirect('/');
      }
      res.render('admin/edit-product', {
        pageTitle: 'Edit Product',
        path: '/admin/edit-product',
        editing: editMode,
        product: product,
        hasError: false,
        errorMessage: null
      });
    })
    .catch(err => {
      console.log('Error in getEditProduct');
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postEditProduct = (req, res, next) => {
  console.log('postEditProduct');
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedPrice = req.body.price;
  const image = req.file;
  const updatedDesc = req.body.description;
  const errors = validationResult(req);
  if(!errors.isEmpty()){
    console.log(errors.array())
    return res.status(422).render('admin/edit-product' , {
      path: '/admin/Edit-product',
      pageTitle: 'Edit Product',
      editing: true,
      hasError: true, 
      product: {
        title: updatedTitle,
        price: updatedPrice,
        description: updatedDesc,
        _id: prodId
      },
      errorMessage: errors.array()[0].msg
    });
  } 
  Product.findById(prodId).then(product => {
    if (product.userId.toString() !== req.user._id.toString()){
      return res.redirect('/');
    }
    product.title = updatedTitle;
    product.price = updatedPrice;
    product.description = updatedDesc;
    if(image){
      console.log(image.path);
      product.imageUrl = image.path;
    }
    return product.save().then(result => {
      console.log('UPDATED PRODUCT!');
      res.redirect('/admin/products');
    });
  })
    .catch(err => {const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);});
};

exports.getProducts = (req, res, next) => {
  Product.find({userId: req.user._id})
    .then(products => {
      console.log(products);
      res.render('admin/products', {
        prods: products,
        pageTitle: 'Admin Products',
        path: '/admin/products'
      });
    })
    .catch(err => {const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);});
};

exports.postDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  Product.deleteOne({_id: prodId , userId: req.user._id})
    .then(() => {
      console.log('DESTROYED PRODUCT');
      res.redirect('/admin/products');
    })
    .catch(err => {const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);});
};
