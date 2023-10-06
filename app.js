const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const mongoose = require('mongoose');
const User = require('./models/user');

const app = express();
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const flash = require('connect-flash');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');
const errorController = require('./controllers/error');

const store = new MongoDBStore({
    uri: 'mongodb+srv://Hazzem:w7d%405PvY.X_eGgY@cluster0.8xqeba5.mongodb.net/shop?&w=majority',
    collection: 'sessions'
});

const csrfProtection = csrf({})

// const User = require('./models/user');

// app.engine('hbs' , expressHbs.engine());
app.set('view engine' , 'ejs');
app.set('views' , 'views'); // NOTE: >>tells pug where to find templates<<



app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname , 'public')))
app.use(session({secret: 'my secret' , resave: false , saveUninitialized: false ,store: store})); 
app.use(csrfProtection);

app.use((req,res,next) => {
    if(!req.session.user){
        return next();
    }
    User.findById(req.session.user._id).then(user => {
        req.user = user;
        next();
    }).catch(err => console.log(err))
})
app.use(flash());
app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.isLoggedIn;
    res.locals.csrfToken = req.csrfToken();
    next();
  });


// Filter only /admin paths
app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use(errorController.get404);

mongoose.connect('mongodb+srv://Hazzem:w7d%405PvY.X_eGgY@cluster0.8xqeba5.mongodb.net/shop?retryWrites=true&w=majority').then(result => {
    // console.log(result);
    console.log('Connected');
    app.listen(3000);
}).catch(err => console.log(err));