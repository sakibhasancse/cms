const User = require('../models/user')
const Post = require('../models/post')

exports.getIndex = (req, res, next) => {
  try {
    
      res.render('user/index', {
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


 
exports.getUseraccountchange = (req, res, next) => {
  User.findById(req.user).then(result => {
    res.render('user/getprofile',{user:result})
  }).catch((err) => {
    const error = new Error(err);
    error.httpStatus = 500;
    return next(error)
  });
}


 

 


