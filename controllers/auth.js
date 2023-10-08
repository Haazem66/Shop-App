const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require("../models/user");


const formData = require('form-data');
const Mailgun = require('mailgun.js');
const mailgun = new Mailgun(formData);
const mg = mailgun.client({
	username: 'api',
	key: '2ba46e1fde225de97a3929790fed440a-77316142-26219b17',
});


exports.getLogin = (req, res, next) => {
    // const isLoggedIn = req.get('Cookie').split('=')[1];
    let message = req.flash('error');
    if (message.length > 0) {
        message = message[0];
    } else {
        message = null;
    }
    res.render('auth/login', {
        path: '/login',
        pageTitle: 'Login',
        errorMessage: message
    });
};


exports.getSignup = (req, res, next) => {
    let message = req.flash('error');
    if (message.length > 0) {
        message = message[0];
    } else {
        message = null;
    }
    res.render('auth/signup', {
        path: '/signup',
        pageTitle: 'Signup',
        errorMessage: message
    });
};


exports.postLogin = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;

    User.findOne({ email: email }).then(user => {
        if (!user) {
            req.flash('error' , 'Invalid Email or Password');
            console.log(req.flash('error'));
            return res.redirect('/login');
        }
        bcrypt.compare(password, user.password).then(doMatch => {
            if (doMatch) {
                req.session.isLoggedIn = true;
                req.session.user = user;
                return req.session.save((err) => {
                    console.log(err);
                    res.redirect('/');
                })
            }
            req.flash('error', 'Invalid email or password.');
            res.redirect('/login');
        }).catch(err => {
            console.log(err);
            res.redirect('/login');
        })

    }).catch(err => console.log(err));
};


exports.postSignup = (req , res ,next) => {
    const email = req.body.email;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;
    User.findOne({ email: email })
        .then(userDoc => {
            if (userDoc) {
                req.flash('error', 'E-Mail exists already, please pick a different one.');
                return res.redirect('/signup');
            }
            return bcrypt.hash(password, 12).then(hashedPassword => {
                const user = new User({
                    email: email,
                    password: hashedPassword,
                    cart: { items: [] }
                })
               
                return user.save();
            })
                .then(result => {
                    mg.messages
                    .create('sandbox8037167849d44557a1e8cf8342289aaf.mailgun.org', {
                        from: "Hazem User <haazem.hashem@gmail.com>",
                        to: ["hazem_hashem@outlook.com"],
                        subject: "Hello",
                        text: "Testing some Mailgun awesomness!",
                    })
                    .then(msg => console.log(msg)) // logs response data
                    .catch(err => console.log(err)); // logs any error`;
                    console.log(result);
                    res.redirect('/login');
                });

        })
        .catch(err => console.log(err))
}



exports.postLogout = (req , res ,next ) => {
    req.session.destroy((err) => {
        console.log(err);
        res.redirect('/');
    });
};

exports.getReset = (req,res,next) => {
    res.render('auth/reset' , {
        path: '/reset',
        pageTitle: 'Reset Password',
        errorMessage: null
    })
}

exports.postReset = (req ,res ,next) => {
    crypto.randomBytes(32 , (err , buffer) => {
        if (err) {
            return res.redirect('/reset');
        }
        const token = buffer.toString('hex');
        User.findOne({email: req.body.email})
        .then(user=> {
            if(!user){
                req.flash('error' , 'No Account with that Email found');
                console.log('Error');
                return res.redirect('/reset');
            }
            user.resetToken = token;
            user.resetTokenExpiration = Date.now() + 3600000;
            return user.save().then(result => {
                console.log(result);
                res.redirect('/');
                mg.messages
                        .create('sandbox8037167849d44557a1e8cf8342289aaf.mailgun.org', {
                            from: "Hazem User <haazem.hashem@gmail.com>",
                            to: [req.body.email],
                            subject: "Password Reset",
                            text: "Testing some Mailgun awesomness!",
                            html: `
                            <p> You requested A password Reset</p>
                            <p> Click this <a href = "http://localhost:3000/reset/${token}">link</a> To set a new password click the link</p>
                            `
                        })
                        .then(msg => {console.log(msg); }) // logs response data
                        .catch(err => console.log(err)); // logs any error`;;
        })
        }).then(result => {
            console.log(result);
        })
        .catch(err => console.log(err))
    })
}

exports.getNewPassword = (req , res , next) => {
    const token = req.params.token;
    User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } })
        .then(user => {
            let message = req.flash('error');
            if (message.length > 0) {
                message = message[0];
            } else {
                message = null;
            }
            res.render('auth/new-password', {
                path: '/new-password',
                pageTitle: 'New Password',
                errorMessage: message,
                userId: user._id.toString(),
                passwordToken: token
            })
        }).catch(err => console.log(err))
}

exports.postNewPassword = (req , res ,next) => {
    const newPassword = req.body.password;
    const userId = req.body.userId;
    const token = req.body.passwordToken;
    let resetUser;
    User.findOne({resetToken: token , resetTokenExpiration: {$gt: Date.now()} , _id: userId})
    .then(user => {
        //console.log('found user');
        resetUser = user;
        return  bcrypt.hash(newPassword, 12);
    }).then(hashedPassword => {
        //console.log(hashedPassword);
        resetUser.password = hashedPassword;
        resetUser.resetToken = null;
        resetUser.resetTokenExpiration = null;
        return resetUser.save();
    }).then(result => {
        res.redirect('/login');
    })
    .catch(err => console.log(err))
}