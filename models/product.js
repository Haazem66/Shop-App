const getDb = require('../util/database').getDb;
const mongodb = require('mongodb');


class Product {
  constructor(title , price , description , imageUrl , id , userId){
    this.title = title;
    this.price = price;
    this.description = description;
    this.imageUrl = imageUrl;
    this._id = id ? new mongodb.ObjectId(id) : null ;
    this.userId = userId
  }
  save(){
    const db = getDb();
    let dpOp;
    if (this._id){
      // update the product
      dpOp = db.collection('products').updateOne({_id: this._id} , {$set: this})
    }else{
      dpOp = db.collection('products').insertOne(this);
    }
    return dpOp.then(result => console.log(result)).catch(err => console.log(err));
  }
  static fetchAll(){
    const db = getDb();
    return db.collection('products').find().toArray().then(products => {
      console.log(products);
      return products;
    }).catch(err => console.log(err));
  }
  static findById (id) {
    const db = getDb();
    return db.collection('products').find({_id: new mongodb.ObjectId(id)}).next().then(product => {
      return product;
    }).catch(err => console.log(err))
  }

  static deleteProduct(id) {
    const db = getDb();
    return db.collection('products').findOneAndDelete({_id: new mongodb.ObjectId(id)}).then(result => console.log(result)).catch(err => console.log(err));
  }

};
module.exports = Product;
