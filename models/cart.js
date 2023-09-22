const fs = require('fs');
const path = require('path');

const p = path.join(
    path.dirname(process.mainModule.filename), 
    'data', 
    'cart.json'
);

module.exports = class Cart {
    static addProduct (id , productPrice) {
        fs.readFile(p , (err , fileContent) => {
            // >>fetch the precvious cart<<
            let cart = {products: [] , totalPrice: 0};
            if (!err){
                cart = JSON.parse(fileContent);
            }
            // >>analyse the cart => find existing product<<
            const existingProductIndex = cart.products.findIndex(p => p.id === id);
            const existingProduct = cart.products[existingProductIndex];
            let updatedProduct;
            // >>add new product increase the quantity<<
            if (existingProduct){
                updatedProduct = {...existingProduct};
                console.log(existingProduct.id);
                updatedProduct.qty = updatedProduct.qty + 1;
                cart.products = [...cart.products];
                cart.products[existingProductIndex] = updatedProduct;
            }
            else
            {
                updatedProduct = {id: id , qty: 1};
                cart.products = [...cart.products , updatedProduct];
            }
            cart.totalPrice = cart.totalPrice + productPrice;
            fs.writeFile(p , JSON.stringify(cart) , (err)=> {
                console.log(err);
            });
        })
    }

}








