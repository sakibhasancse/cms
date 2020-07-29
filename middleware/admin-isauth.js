const User =require('../models/user')
module.exports = (req, res, next) => {
    if (!req.user.isAdmin) {
        console.log('You are not allowed to access');
        return res.redirect('/');
        
    }
    next();
}