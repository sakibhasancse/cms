const path = require('path');
const { CustomValidation } = require('express-validator/src/context-items');
const { check, body } = require("express-validator/check");
const authController = require("../controllers/auth");
const express = require('express');
const adminController = require('../controllers/admin');
const isAuth = require('../middleware/is-auth');
const admin = require('../middleware/admin-isauth');
const User = require('../models/user');

const router = express.Router();


router.get('/index', isAuth, admin, adminController.adminindex)
router.get('/alluser', isAuth, admin, adminController.getalluser)
router.post('/delete-user', isAuth, admin, adminController.postdeleteuser)
router.get("/add-admin", isAuth, admin,  adminController.getSignup);

router.post(
  "/add-admin",

  check('name').isLength({ min: 3 }).withMessage('! Type Your Name'),
  check('phone').isLength({ min: 9 }).withMessage('! Type Your Phone Number'),



  check("email").isEmail().withMessage("Pleass Insert Valid Email").custom((value, { req }) => {
     return User.findOne({ email: value })
          .then(userDoc => {
              if (userDoc) {
                  return Promise.reject('E-Mail exists already, please pick a different one.');
              }

          })
      }).normalizeEmail(),
          body('password', 'Please enter a password at least 5 characters').isLength({ min: 5 }).isAlphanumeric().trim(),
          body('confirmPassword').custom((value, { req }) => {
              if (value !== req.body.password) {
                  throw new Error('Passwords have  to match!')
              }
              return true;
          }).trim(),
        
          isAuth, admin, adminController.postSignup
);
router.get('/alluser/:userId', isAuth, admin, adminController.getUseraccount);

module.exports = router;
