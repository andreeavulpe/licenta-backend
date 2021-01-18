const User = require('../models/user')
const Product = require('../models/product')
const Cart = require('../models/cart')
const Cupon = require('../models/cupon')
const Order = require('../models/order')
const crypto = require("crypto");
const admin = require('../firebase');


exports.userCart = async (req, res) => {
  const {cart} = req.body
  console.log('cart', cart)
  let products = []
  console.log('user', req.user)
  const user = await User.findOne({email: req.user.email}).exec()

  let cartExistByThisUser = await Cart.findOne({
    orderedBy: user._id
  })
    .exec()

  if (cartExistByThisUser) {
    cartExistByThisUser.remove()
    console.log('removed old cart');
  }

  for (let i = 0; i < cart.length; i++) {
    let object = {}
    object.product = cart[i].product._id;
    object.count = cart[i].count;
    object.description = cart[i].description;
    let {price} = await Product.findById(cart[i].product._id).select('price').exec()
    object.price = price;
    products.push(object);
  }

  console.log('products', products)

  let cartTotal = 0;

  for (let i = 0; i < cart.length; i++) {
    cartTotal = cartTotal + products[i].price * products[i].count
  }

  console.log('totalPrice', cartTotal)

  let newCart = await new Cart({
    products: products,
    cartTotal: cartTotal,
    orderedBy: user,
  })
    .save()
  console.log('newCart', newCart);

  await User.findOneAndUpdate({
    email: req.user.email
  },
    {
      cart: newCart
    })

  res.json({ok: true})
}


exports.getUserCart = async (req, res) => {
  console.log(req.user)
  const user = await User.findOne({email: req.user.email}).exec()

  let cart = await Cart.findOne({
    orderedBy: user._id
  })
    .populate('products.product')
    .populate('orderedBy')
  if (cart) {
    const {products, cartTotal, totalAfterDiscount} = cart;
    res.json({
      products: products,
      cartTotal: cartTotal,
      totalAfterDiscount: totalAfterDiscount
    })
  } else {
    res.json({
      products: [],
      cartTotal: null,
      totalAfterDiscount: null
    })
  }
}

exports.emptyCart = async (req, res) => {
  console.log('empty cart')
  const user = await User.findOne({email: req.user.email}).exec()
  const cart = await Cart.findOneAndRemove({orderedBy: user._id}).exec()
  const newUser = await User.findOneAndUpdate({email: req.user.email},
    {
      cart: []
    },
    {
      new: true
    })
  res.json(cart)
}

exports.saveAddress = async (req, res) => {
  const userAddress = await User.findOneAndUpdate(
    {email: req.user.email},
    {address: [req.body.address, req.body.addressContent]}
  ).exec()
  res.json({ok: true})
}

exports.getAddress = async (req, res) => {
  let user = await User.findOne({email: req.user.email})
    .exec()
  res.json({
    address: user.address
  })
}

exports.applyCuponToUserCart = async (req, res) => {
  const {cupon} = req.body;
  console.log('CUPONwwW', cupon)
  let validCupon = await Cupon.findOne({
    name: cupon
  })
    .exec();

  if (validCupon === null) {
    return res.json(-1)
  }
  console.log('Valid Cupon', validCupon);

  const user = await User.findOne({
    email: req.user.email
  })
    .exec();

  let cartProducts  = await Cart.findOne({
    orderedBy: user._id
  })
    .populate('products.product')
    .exec();
  if (!cartProducts || !cartProducts.products) {
    return res.json(-1)
  }
  let {products, cartTotal} = cartProducts;

  console.log('Cart total', cartTotal, 'discount', validCupon.discount)

  let totalAfterDiscount = (cartTotal - (cartTotal * validCupon.discount / 100)).toFixed(2);
  console.log(totalAfterDiscount)
  console.log(user._id)
  await Cart.findOneAndUpdate({
      orderedBy: user._id
  },
    {
      totalAfterDiscount: totalAfterDiscount
    },
    {
      new: true
    })
    .exec()
  res.json(totalAfterDiscount)
}

exports.createOrder = async (req, res) => {
  const {paymentIntent} = req.body.stripeResponse;
  const user = await User.findOne({email: req.user.email}).exec();
  let {products} = await Cart.findOne({orderedBy: user._id}).exec();
  let newOrder = await new Order({
    products: products,
    paymentIntent: paymentIntent,
    orderedBy: user._id,
  })
    .save();
  console.log('New order saved', newOrder)

  // decrement quantity, increment sold
  let bulkOption = products.map((item) => {
    return {
      updateOne: {
        filter: { _id: item.product._id }, // IMPORTANT item.product
        update: { $inc: { quantity: -item.count, sold: +item.count } },
      },
    };
  });

  let updated = await Product.bulkWrite(bulkOption, {});
  console.log("PRODUCT QUANTITY-- AND SOLD++", updated);

  console.log("PRODUCT QUANTITY-- AND SOLD++", updated)

  res.json({ok: true})
}


exports.createCashOrder = async (req, res) => {
  const user = await User.findOne({email: req.user.email}).exec();
  let userCart = await Cart.findOne({orderedBy: user._id}).exec();
  console.log(userCart)
  let cryptoId = crypto.randomBytes(16).toString("hex")
  let paymentIntent = {
    client_secret: cryptoId,
    amount: userCart.cartTotal,
    created: Date.now(),
    currency: 'ron',
    payment_method_types: ['cash'],
    status: 'Plată la livrare',
    description: 'amountForCash'
  }

  if (userCart.totalAfterDiscount) {
    paymentIntent.amount = userCart.totalAfterDiscount
  }

  let newOrder = await new Order({
    orderStatus: 'Plată la livrare',
    products: userCart.products,
    paymentIntent: paymentIntent,
    orderedBy: user._id,
  })
    .save();
  console.log('New order saved', newOrder)

  // decrement quantity, increment sold
  let bulkOption = userCart.products.map((item) => {
    return {
      updateOne: {
        filter: { _id: item.product._id }, // IMPORTANT item.product
        update: { $inc: { quantity: -item.count, sold: +item.count } },
      },
    };
  });

  let updated = await Product.bulkWrite(bulkOption, {});
  console.log("PRODUCT QUANTITY-- AND SOLD++", updated);

  console.log("PRODUCT QUANTITY-- AND SOLD++", updated)

  res.json({ok: true})
}

exports.orders = async (req, res) => {
  let user = await User.findOne({email: req.user.email}).exec();

  console.log('User de la orders',user)

  let userOrders = await Order.find({orderedBy: user._id})
    .populate('products.product')
    .populate('orderedBy')
    .exec();

  console.log('orders dde lke User de la orders',userOrders)

  res.json(userOrders);
}

exports.addToWishList = async (req, res) => {
  const { productId } = req.body

  const user = await User.findOneAndUpdate({
    email: req.user.email
  },
    {
      $addToSet: {
        wishlist: productId
      }
    },
    {
      new: true
    })
    .exec()
  res.json({ok: true})
}

exports.wishList = async (req, res) => {
  const list = await User.findOne({
    email: req.user.email
  })
    .select('wishlist')
    .populate('wishlist')
    .exec()
  res.json(list)
}

exports.removeFromWishList = async (req, res) => {
  const {productId} = req.params;

  const user = await User.findOneAndUpdate(
    {
      email: req.user.email
    },
    {
      $pull: {
        wishlist: productId
      }
    },
    {
      new: true
    }
  )
    .exec()

  res.json({
    ok: true
  })
}


exports.changeName = async (req, res) => {
  const updatedUser = await User.findOneAndUpdate(
    {email: req.user.email},
    {name: req.body.name},
    {new: true}
  )
    .exec()
  res.json({updatedUser})
}

exports.changeTelNum = async (req, res) => {
  const updatedUser = await User.findOneAndUpdate(
    {email: req.user.email},
    {telNum: req.body.telNum},
    {new: true}
  )
    .exec()
  res.json({updatedUser})
}

// exports.changeEmail = async (req, res) => {
//   console.log(req.user)
//   console.log(req.body.email)
//   let newUser = await admin.auth().updateUser(req.user.uid, {
//     email: req.body.email
//   })
//   console.log('-------> New USer', newUser)
//   const updatedUser = await User.findOneAndUpdate(
//     {email: req.body.email},
//     {email: newUser.email},
//     {new: true}
//   )
//     .exec()
//   res.json({updatedUser})
// }

