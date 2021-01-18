const Cupon = require('../models/cupon');

exports.create = async (req, res) => {
  try {
    const {name, expire, discount} = req.body.cupon
    let cupon = await new Cupon({
      name: name,
      expire: expire,
      discount: discount
    }).save()
    res.json({cupon})
  } catch (error) {
    console.log(error)
  }
}


exports.remove = async (req, res) => {
  try {
    let cupons = await Cupon.findByIdAndDelete(req.params.cuponId).exec()
    res.json({cupons})
  } catch (error) {
    console.log(error)
  }
}

exports.list = async (req, res) => {
  try {
    res.json(await Cupon.find({}).sort({createdAt: -1}).exec())
  } catch (error) {
    console.log(error)
  }
}

