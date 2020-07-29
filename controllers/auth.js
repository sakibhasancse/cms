const bcrypt = require('bcryptjs');

const _ = require('lodash')
const {validationResult} =require('express-validator/check')
const crypto =require('crypto')
const User = require('../models/user');
const { zip } = require('lodash');

const nodemailer = require("nodemailer");


let transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_EMAIL, // generated ethereal user
    pass: process.env.SMTP_PASSWORD, // generated ethereal password
  },
});


exports.getLogin = (req, res, next) => {
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    errorMessage: message,
    oldInput: { email: '', password: '' },
    validationError:[]

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
    errorMessage: message,
    oldInput:{name:'',email:'',password:'',confirmPassword:''},
    validationError:[]

  });
};

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const error = validationResult(req)

  if (!error.isEmpty()) {
    console.log(error.array())
    return res.status(422).render('auth/login', {
      path: '/login',
      pageTitle: 'Login',
      errorMessage: error.array()[0].msg,
      oldInput:{email,password},
      validationError:error.array()
    }
    );
    
  }
  
  User.findOne({ email: email })
    .then(user => {
      if (!user) {
       
        return  res.status(422).render('auth/login', {
          path: '/login',
          pageTitle: 'Login',
          errorMessage:'invalid email and password',
          oldInput:{email,password},
          validationError:[]
        }
        );
      }
      bcrypt
        .compare(password, user.password)
        .then(doMatch => {
          if (doMatch) {
            const token = user.genaretJsonAuth()
            console.log(token);
            
            res.cookie('auth', token, {
              httpOnly: true,
              sameSite: true,
              signed:true,
              maxAge: 4* 60 *60 *1000
            })
            
            req.session.isLoggedIn = true;
            req.session.user = user;
            return req.session.save(err => {
              console.log(err);
              res.redirect('/');
            });
          }
          req.flash('error', 'Invalid email or password.');
          res.redirect('/login');
        })
        .catch(err => {
          console.log(err);
          res.redirect('/login');
        });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatus = 500;
      return next(error)
    });
};

exports.postSignup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const name = req.body.name;
  const phone = req.body.phone;

 
  const error = validationResult(req)
  if (!error.isEmpty()) {
    console.log(error.array())
    return res.status(422).render('auth/signup', {
      path: '/signup',
      pageTitle: 'Signup',
      errorMessage: error.array()[0].msg,
      oldInput:{name,email,password,phone,confirmPassword:req.body.confirmPassword},

      validationError:error.array()
    });
  }
  
   
  
  
    bcrypt
      .hash(password, 12)
      .then(hashedPassword => {
       let newuser= {
        email:email,
         password: hashedPassword,
         name: name,
         phone: phone,
       
      
        
         

      }
        
          const user = new User(_.pick(newuser,['name','phone',,'email','password']));
          return user.save();
        })
        .then(result => {
      // res.status(200).send('ragistation sucssess')

          res.redirect('/login');
        }) .catch((err) => {
          const error = new Error(err);
          error.httpStatus = 500;
          return next(error)
        });
  
    
};

exports.postLogout = (req, res, next) => {
  req.session.destroy(err => {
    console.log(err);
    res.redirect('/');
  });
};

exports.resetPassword = (req, res, next) => {
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render('auth/reset', {
    path: '/reset',
    pageTitle: 'reset',
    errorMessage: message,
    oldInput:{email:''},
    validationError:[]

  });
}

exports.postResetPassword = (req, res, next) => {

  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err)
      return res.redirect('/reset')
    } 
    const token = buffer.toString('hex');
    User.findOne({ email: req.body.email }).then(user => {
      if (!user) {
        req.flash('error','No User Found')
        return res.redirect('/reset')
      }
      user.resetToken = token;
      user.resetTokenExpiration = Date.now() + 3600000;
      return user.save()
    }).then(result => {
      
      res.redirect('/')
      transporter.sendMail( {
        
        
          from: process.env.FROM_EMAIL, 
          to: req.body.email,
          subject: "Reset Password", 
          
          html: `<b>Hello</b> <p>  If You are requested to reset the click on below link <br/><a href='http://localhost:3000/reset/${token}'>Click the link</a></p> `
      
        
      })

    })
      .catch(err => {
      console.log(err)
    })
  })
}
exports.getnew_password = (req, res, next) => {
  const token =req.params.token;
  User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } }).then(user => {
    let message = req.flash('error');
    if (message.length > 0) {
      message = message[0];
    } else {
      message = null;
    }
    res.render('auth/new-password', {
      
      pageTitle: 'new-password',
      errorMessage: message,
      
      validationError:[],
      userId:user._id.toString(),
      passwordToken:token
  
    });
  }).catch((err) => {
    const error = new Error(err);
    error.httpStatus = 500;
    return next(error)
  });


 
}
exports.postnew_password = (req, res, next) => {
  const newPassword = req.body.password;
  const userId = req.body.userId;
  const passwordToken = req.body.passwordToken;
  let resetUser;
  User.findOne({ resetToken: passwordToken, resetTokenExpiration: { $gt: Date.now() }, _id: userId }).then(user => {
    resetUser = user;
        return bcrypt.hash(newPassword,12)
      }).then(hashedPassword => {

        resetUser.password =hashedPassword;
        resetUser.resetToken = undefined;
        resetUser.resetTokenExpiration =undefined;
        return resetUser.save()
    
      }).then(result => {
    res.redirect('/login')
  }).catch(err => {
    const error = new Error(err);
    error.httpStatus = 500;
    return next(error)
  })
  
}

exports.getchangeprofile = (req, res, next) => {
  try{
  res.render('user/change', {
    user: {
      
      name:req.user.name,
      phone:req.user.phone,
      email:req.user.email,
    
    }
  })

} catch (err) {
  const error = new Error(err);
  error.httpStatus = 500;
  return next(error)
}

}
exports.postchangeprofile = (req, res, next) => {
  console.log(req.user._id)

  User.findByIdAndUpdate(req.user, {
    new: true,
    runValidators:true
  })
  .then(user => {
    // console.log(about);
    user.email = req.body.email;
    user.phone = req.body.phone;
    user.name = req.body.name;
     
      return user.save();
      

    }).then(result => {
      console.log('update Succesfully');
      res.redirect('/login')
    }).catch((err) => {
      const error = new Error(err);
      error.httpStatus = 500;
      return next(error)
    });
}