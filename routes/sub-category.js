const express = require('express');

const router = express.Router()

//import middlewares
const {authCheck, adminCheck} = require('../middlewares/auth')


//import controllers
const {
  create,
  read,
  update,
  remove,
  list,
} = require('../controllers/sub-category');

router.post('/sub-category', authCheck,  adminCheck, create);
router.get('/sub-categories', list);
router.get('/sub-category/:slug', read);
router.put('/sub-category/:slug', authCheck,  adminCheck, update);
router.delete('/sub-category/:slug', authCheck,  adminCheck, remove);

module.exports = router;
