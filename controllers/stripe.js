const User = require('../models/user')
const Cart = require('../models/cart')
const Product = require('../models/product')
const Cupon = require('../models/cupon')
const stripe = require('stripe')(process.env.STRIPE_SECRET)


exports.createPaymentIntent = async (req, res) => {

  const {cuponApplied} = req.body
  console.log('------------>cuppon applier', cuponApplied)

  const user = await User.findOne({
    email: req.user.email
  })
    .exec()

  const {cartTotal, totalAfterDiscount} = await  Cart.findOne({
    orderedBy: user._id
  })
    .exec()
  //
  // console.log('CART TOTAL CHARGED', cartTotal)
  // console.log('CART TOTAL CHARGED after', totalAfterDiscount)

  let finalAmount = 0;
  if (cuponApplied && totalAfterDiscount) {
    finalAmount = Math.round(totalAfterDiscount * 100);
  } else {
    finalAmount = Math.round(cartTotal * 100)
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount: finalAmount,
    currency: 'ron',
  });

  res.send({
    clientSecret: paymentIntent.client_secret,
    cartTotal: cartTotal,
    totalAfterDiscount: totalAfterDiscount,
    payable: finalAmount
  })
}
