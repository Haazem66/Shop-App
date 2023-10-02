const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const errorController = require('./controllers/error');
const mongoConnect = require('./util/database').mongoConnect;
const User = require('./models/user');

// app.engine('hbs' , expressHbs.engine());
app.set('view engine' , 'ejs');
app.set('views' , 'views'); // NOTE: >>tells pug where to find templates<<



app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname , 'public')))

app.use((req,res,next) => {
    User.findById('651a0c8639cb2ed6e6cd7f78').then(user => {
        req.user = user;
        next();
    }).catch(err => console.log(err))
})
// Filter only /admin paths
app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

mongoConnect(() => {
    app.listen(3000);
});