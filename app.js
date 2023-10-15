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
const multer = require('multer');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');
const errorController = require('./controllers/error');

const store = new MongoDBStore({
    uri: 'mongodb+srv://Hazzem:w7d%405PvY.X_eGgY@cluster0.8xqeba5.mongodb.net/shop?&w=majority',
    collection: 'sessions'
});

const csrfProtection = csrf({})



const fileStorage = multer.diskStorage({
    destination: (req , file , cb) => {
        cb(null , 'images');
    },
    filename: (req , file , cb) => {
        cb(null , new Date().toISOString() + '-' + file.originalname);
    }
});

const fileFilter = (req , file , cb) => {
    if(file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg'){
        cb(null , true); // >>accepts the file with null errors<<
    }else{
        cb(null , false); // >>rejects the file with null errors<<
    }   
}

// const User = require('./models/user');

// app.engine('hbs' , expressHbs.engine());
app.set('view engine' , 'ejs');
app.set('views' , 'views'); // NOTE: >>tells pug where to find templates<<



app.use(bodyParser.urlencoded({extended: false}));
app.use(multer({dest: 'images' , fileFilter: fileFilter}).single('image'));
app.use(express.static(path.join(__dirname , 'public')))
app.use('/images' , express.static(path.join(__dirname , 'images')))
app.use(session({secret: 'my secret' , resave: false , saveUninitialized: false ,store: store})); 
app.use(csrfProtection);

app.use((req,res,next) => {
    if(!req.session.user){
        return next();
    }
    User.findById(req.session.user._id).then(user => {
        if(!user){
            return next();
        }
        req.user = user;
        next();
    }).catch(err => {
        next(new Error(err));
    })
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
app.get('/500' , errorController.get500);
app.use(errorController.get404);
// app.use((error , req , res , next) => {
//     // res.status(error.httpStatusCode).render(...);
//     // res.redirect('/500');   
//     res.status(500).render('500' , {
//         pageTitle: 'Error!',
//         path: '/500',
//         isAuthenticated: req.session.isLoggedIn
//     });
   
// });
mongoose.connect('mongodb+srv://Hazzem:w7d%405PvY.X_eGgY@cluster0.8xqeba5.mongodb.net/shop?retryWrites=true&w=majority').then(result => {
    // console.log(result);
    console.log('Connected');
    app.listen(3000);
}).catch(err => console.log(err));