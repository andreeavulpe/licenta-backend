const mongoose = require('mongoose');
const {ObjectId} = mongoose.Schema;

const cartSchema = new mongoose.Schema({
  products: [
    {
      product: {
        type: ObjectId,
        ref: 'Product'
      },
      count: {
        type: Number
      },
      description: {
        type: String
      },
      price: {
        type: Number
      }
    }
  ],
  cartTotal: Number,
  totalAfterDiscount: Number,
  orderedBy: {
    type: ObjectId,
    ref: 'User'
  }
},
  {
    timestamp: true
  });

module.exports = mongoose.model('Cart', cartSchema);
