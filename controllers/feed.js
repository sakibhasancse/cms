
const Post = require('../models/post')
const User = require('../models/user');
const {validationResult} =require('express-validator');
const user = require('../models/user');

exports.getupload = (req, res) => {

  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  try {
    
        res.render('user/uploadform',{  errorMessage: message,    oldInput:{title:''},
          validationError: []
        })
       
    
    } catch (err) {
      const error = new Error(err);
      error.httpStatus = 500;
      return next(error)
    }
   
  }

exports.getuploadpost = (req, res) => {

  const error = validationResult(req)
  if (!error.isEmpty()) {
    console.log(error.array())
    return res.status(422).render('user/uploadform', {
     
      errorMessage: error.array()[0].msg,
      oldInput:{title:''},

      validationError:error.array()
    });
  }
  
  
 
  
  User.findById(req.user._id).then(user => {
      const post = new Post({
        title: req.body.title,
        description: req.body.description,
        
        userId:user._id,
          image: req.file.path
       
        
      })
      console.log(user)
      return post.save()
    }).then(result => {
      res.redirect('/getprofile')
    }).catch(err => {
      console.log(err)
    })
   
   
  }
  exports.getUseraccount = (req, res, next) => {

    try {
      User.findById(req.user._id).then( user=> {
        console.log(user._id)
   

        Post.find({ userId: user._id }).then(post => {
          console.log(post)
          res.render('user/profile', {

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
exports.deletepost = (req, res, next) => {
  const usersid = req.body.postId;
  Post.findByIdAndRemove(usersid)
    .then(result => {
      if (!result) {
        return res.redirect('/')
      }
      res.redirect('/getprofile')
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatus = 500;
      return next(error)
    });
    }

exports.getchat = (req, res, next) => {
      res.render('user/chat')
    }