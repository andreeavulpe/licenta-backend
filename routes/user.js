const express = require('express');

const router = express.Router();

//import middlewares
const {authCheck} = require('../middlewares/auth')

const {
  userCart,
  getUserCart,
  emptyCart,
  saveAddress,
  getAddress,
  applyCuponToUserCart,
  createOrder,
  orders,
  addToWishList,
  wishList,
  removeFromWishList,
  createCashOrder,
  changeName,
  changeTelNum,
  changeEmail
} = require('../controllers/user')

router.post('/user/cart', authCheck, userCart);
router.get('/user/cart', authCheck, getUserCart);
router.put('/user/cart', authCheck, emptyCart);
router.post('/user/address', authCheck, saveAddress);
router.get('/user/address', authCheck, getAddress);

router.post('/user/cart/cupon', authCheck, applyCuponToUserCart)

//userDetails
router.post('/user/change-name', authCheck, changeName)
router.post('/user/change-telnum', authCheck, changeTelNum)
// router.post('/user/change-email', authCheck, changeEmail)

//order
router.post('/user/order', authCheck, createOrder)
router.get('/user/orders', authCheck, orders)
router.post('/user/cash-order', authCheck, createCashOrder)


//wishlist
router.post('/user/wishlist', authCheck, addToWishList)
router.get('/user/wishlist', authCheck, wishList)
router.put('/user/wishlist/:productId', authCheck, removeFromWishList)


module.exports = router;
