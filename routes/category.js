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
  getSubCategories
} = require('../controllers/category');

router.post('/category', authCheck,  adminCheck, create);
router.get('/categories', list);
router.get('/category/:slug', read);
router.put('/category/:slug', authCheck,  adminCheck, update);
router.delete('/category/:slug', authCheck,  adminCheck, remove);
router.get('/category/sub-categories/:_id', getSubCategories);

module.exports = router;
