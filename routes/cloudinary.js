const express = require('express');

const router = express.Router()

//import middlewares
const {authCheck, adminCheck} = require('../middlewares/auth')


//import controllers
const {upload, remove} = require('../controllers/cloudinary')

router.post('/uploadImages', authCheck, adminCheck, upload);
router.post('/removeImage', authCheck, adminCheck, remove)

module.exports = router;
