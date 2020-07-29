const express = require("express");
const { check, body } = require("express-validator/check");
const authController = require("../controllers/auth");
const User = require('../models/user')
const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.get("/login", authController.getLogin);

router.get("/signup", authController.getSignup);

router.post("/login",
    body('email').isEmail().withMessage('pleass Inser valid Email').normalizeEmail(),
    body('password').isLength({ min: 5 }).isAlphanumeric().trim(), authController.postLogin);

router.post(
    "/signup",

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
          
            authController.postSignup
);
router.get("/reset", authController.resetPassword);
router.post("/reset", authController.postResetPassword);
router.get("/reset/:token", authController.getnew_password);
router.post("/new_password", authController.postnew_password);
router.get('/change_account',isAuth, authController.getchangeprofile);


router.post('/change_account',isAuth, authController.postchangeprofile);


router.post("/logout", authController.postLogout);

module.exports = router;
