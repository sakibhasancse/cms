
const path = require('path');
const express = require('express');
const feed = require('../controllers/feed');
const isAuth = require('../middleware/is-auth');
const multer = require('multer');
const { check, body } = require("express-validator/check");
const router=express.Router()
const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'images');
    },
    filename: (req, file, cb) => {
      cb(null, new Date().toISOString().replace(/[\/\\:]/g, "_") + file.originalname)
    }
});
const fileFilter = (req, file, cb) => {
    if (
      file.mimetype === 'image/png' ||
      file.mimetype === 'image/jpg' ||
      file.mimetype === 'image/jpeg'
    ) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  };
  const upload = multer({ storage: fileStorage, fileFilter : fileFilter , limits:{fileSize:1024 *1024*5}});


router.get('/upload_post',isAuth, feed.getupload);

router.post('/upload_post', upload.single('uploads'), isAuth, [
  check('title').isLength({ min: 2 }).withMessage('! Type Your Name'),
    check('description').isLength({ min: 5,max:3000 }).withMessage('! Type Your Description'),
  //  check('file', 'You must select an image.').checkFiles() 

   
  

], feed.getuploadpost);
router.get('/getprofile', isAuth, feed.getUseraccount);
router.post('/deletePost',isAuth,feed.deletepost)
router.get('/chat',isAuth,feed.getchat)


module.exports = router;
