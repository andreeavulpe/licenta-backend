const Order = require('../models/order');

exports.orders = async (req, res) => {
  let allOrders = await Order.find({})
    .sort('-createdAt')
    .populate('products.product')
    .populate('orderedBy')
    .exec()

  res.json(allOrders);
}


exports.orderStatus = async (req, res) => {
  const { orderId, orderStatus } = req.body;

  let updated = await Order.findByIdAndUpdate(
    orderId,
    {
      orderStatus: orderStatus
    },
    {
      new: true
    }
  )
    .exec()
  res.json(updated)
}
