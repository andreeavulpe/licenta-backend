const express = require('express');

const router = express.Router()

//import middlewares
const {authCheck, adminCheck} = require('../middlewares/auth')


//import controllers
const {
  create,
  remove,
  list
} = require('../controllers/cupon');

router.post('/cupon', authCheck,  adminCheck, create);
router.get('/cupons', list);
router.delete('/cupon/:cuponId', authCheck,  adminCheck, remove);

module.exports = router;
