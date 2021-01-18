const express = require('express');
const router = express.Router()

//import middlewares
const {authCheck, adminCheck} = require('../middlewares/auth')


//controller
const {
  create,
  remove,
  list
} = require('../controllers/carousel-photo')

//routes
router.get('/carousel-photos', list);
router.post('/carousel-photo', authCheck, adminCheck, create);
router.delete('/carousel-photo/:slug', authCheck, adminCheck, remove);

module.exports = router
