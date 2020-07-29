const path = require('path');

const express = require('express');

const shopController = require('../controllers/user');
const isAuth = require('../middleware/is-auth');


const router = express.Router();
router.get('/',isAuth, shopController.getIndex);




module.exports = router;
