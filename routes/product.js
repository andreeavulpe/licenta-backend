const express  = require('express');

const router = express.Router()

//import middlewares
const {authCheck, adminCheck} = require('../middlewares/auth')

//controller
const {
  create,
  list,
  update,
  remove,
  read,
  listProductsByCount,
  listProductWithParameters,
  listProductWithPagination,
  productsCount,
  productStar,
  listRelated,
  searchFilters,
  getColorsAndBrands
} = require('../controllers/product');

//routes
router.get('/products/total', productsCount)
router.post('/product', authCheck, adminCheck,  create)
router.get('/products', list)
router.get('/products/:count', listProductsByCount)
router.put('/product/:slug', authCheck, adminCheck, update)
router.delete('/product/:slug', authCheck, adminCheck, remove)
router.get('/product/:slug', read)
router.post('/products', listProductWithParameters)
router.post('/products-with-pagination', listProductWithPagination )

//rating
router.put('/product/star/:productId', productStar)

//related
router.get('/product/related/:productId', listRelated)

//search
router.post('/search/filters', searchFilters)
router.get('/search/color-brand', getColorsAndBrands)


module.exports = router;
