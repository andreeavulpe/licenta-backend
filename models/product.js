const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema;

const productSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    required: true,
    maxlength: 30,
    text: true,
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    index: true,
  },
  description: {
    type: String,
    required: true,
    text: true,
  },
  price: {
    type: Number,
    required: true,
    trim: true,
  },
  category: {
    type: ObjectId,
    ref: "Category",
  },
  subCategory: [{
    type: ObjectId,
    ref: 'SubCategory'
  }],
  quantity: {
    type: Number,
  },
  sold: {
    type: Number,
    default: 0
  },
  images: {
    type: Array
  },
  shipping: {
    type: String,
    // enum: ["Yes", "No"]
  },
  color: {
    type: String,
    //enum: ['red','yellow'],
  },
  brand: {
    type: String,
  },
  ratings: [
    {
      star: Number,
      postedBy: {
        type: ObjectId,
        ref: 'User'
      }
    }
  ]

},
  {
    timestamps: true
  })

module.exports = mongoose.model('Product', productSchema)
