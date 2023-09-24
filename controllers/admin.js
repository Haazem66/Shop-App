const Product = require('../models/product');


exports.getAddProduct = (req, res, next) => {
    res.render('admin/edit-product', { 
      pageTitle: 'Add Product',
      path: '/admin/add-product',
      editing: false
    });
  };



exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const description = req.body.description;
  const price = req.body.price;
  Product.create({
    title: title,
    price: price,
    imageUrl: imageUrl,
    description: description
  }).then(result => {
    res.redirect('/admin/products')
    console.log(result);
  }).catch(err => console.log(err));
};



exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  if(!editMode) {
    return res.redirect('/');
  }
  const prodId = req.params.productId;
  Product.findAll({where: {id: prodId}}).then(products => {
    res.render('admin/edit-product', { 
      pageTitle: 'Edit Product',
      path: '/admin/edit-product',
      editing: editMode,
      product: products[0]
    });

  }).catch(err => console.log(err)) 
};


exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedPrice = req.body.price;
  const updatedImageUrl = req.body.imageUrl;
  const updatedDesc = req.body.description;

  Product.findAll({where: {id: prodId}}).then(products => {
    products[0].title = updatedTitle;
    products[0].price = updatedPrice;
    products[0].description = updatedDesc;
    products[0].imageUrl = updatedImageUrl;
    return products[0].save();
  }).then(result => {
    res.redirect('/admin/products');
    console.log('updated product') 
  })
  .catch(err => console.log(err))
};



exports.getProducts = (req,res,next) => {
  Product.findAll().then(products => {
    res.render('admin/products', {
      prods: products, 
      pageTitle: 'Admin Products', 
      path: '/admin/products'
    })
  }).catch(err => console.log(err));
}


exports.postDeleteProduct = (req,res,next) => {
  const prodId = req.body.productId;
  Product.findByPk(prodId).then(product => {
    return product.destroy();
  }).then(
    res.redirect('/') 
  )
}