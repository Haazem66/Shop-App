const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();

const sequelize = require('./util/database');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const errorController = require('./controllers/error');



// app.engine('hbs' , expressHbs.engine());
app.set('view engine' , 'ejs');
app.set('views' , 'views'); // NOTE: >>tells pug where to find templates<<



app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname , 'public')))
// Filter only /admin paths
app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

sequelize.sync().then(result => {
    app.listen(3000);
    //console.log(result)
}).catch(err => console.log(err));

