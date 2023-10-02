const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;


let _db;

const mongoConnect = (callback) => {

    MongoClient.connect('mongodb+srv://Hazzem:w7d%405PvY.X_eGgY@cluster0.8xqeba5.mongodb.net/shop?retryWrites=true&w=majority')
        .then(client => {
            console.log('Connected!');
            _db = client.db();
            callback();
        })
        .catch(err => console.log(err))
};

const getDb = () => {
    if (_db){
        return _db;
    }
    throw 'No dataBase Found';
};

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;


