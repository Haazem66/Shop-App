const getDb = require('../util/database').getDb;
const mongodb = require('mongodb');


class User {
    constructor(username, email){
        this.username = username;
        this.email = email;
    }
    save(){
        const db = getDb();
        return db.collection('users').insertOne(this);
    }
    static findById(id){
        const db = getDb();
        return db.collection('users').findOne({_id: new mongodb.ObjectId(id)}).then(user => {
            return user;
        }).catch(err => console.log())
    }
}

module.exports = User;