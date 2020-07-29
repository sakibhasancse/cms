
const bcrypt = require('bcryptjs');

const _ = require('lodash')
const {validationResult} =require('express-validator/check')
const crypto =require('crypto')
const User = require('../models/user');
const Post = require('../models/post');
const { zip } = require('lodash');

exports.adminindex = (req, res, next) => {
  res.render('admin/index', { pageTitle: '' });
}



exports.getalluser = (req, res, next) => {
  User.find().then(user => {
    res.render('admin/userTable', { pageTitle: '', user: user });

  }) .catch((err) => {
    const error = new Error(err);
    error.httpStatus = 500;
    return next(error)
  });
}
exports.postdeleteuser = (req, res, next) => {
  const usersid = req.body.users;
  User.findByIdAndRemove(usersid)
    .then(result => {
      if (!result) {
        return res.redirect('/')
      }
      res.redirect('/admin/alluser')
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatus = 500;
      return next(error)
    });
}


exports.getSignup = (req, res, next) => {
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render('admin/addadmin', {
    path: '/signup',
    pageTitle: 'Signup',
    errorMessage: message,
    oldInput:{name:'',phone:'',email:'',password:'',confirmPassword:''},
    validationError:[]

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
    return res.status(422).render('admin/addadmin', {
      path: '/add-admin',
      pageTitle: '/add-admin',
      errorMessage: error.array()[0].msg,
      oldInput:{name,email,password,phone,confirmPassword:req.body.confirmPassword},
      validationError: error.array()
      
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
         isAdmin:true


      }
        
          const user = new User(newuser);
          return user.save();
        })
        .then(result => {
          res.redirect('/admin/index');
        }) .catch((err) => {
          const error = new Error(err);
          error.httpStatus = 500;
          return next(error)
        });
  
    
};

exports.getUseraccount = async(req, res, next) => {

  try {
    const userId =req.params.userId
    console.log(userId)
   await User.findById(userId).then( user=> {
      console.log(user)
     
     Post.find({ userId: user._id }).then(post => {
    console.log(post)

        console.log(post)
        res.render('admin/post', {

          post:post,
          
          user:user
        
         
        })
       })
     

      

    })
    
  
  } catch (err) {
    const error = new Error(err);
    error.httpStatus = 500;
    return next(error)
  }
    
}