const mongoose = require('mongoose');

const carouselPhotoSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: true,
    text: true
  },
  imageUrl: {
    type: String
  },
  imageId: {
    type: String
  },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      index: true,
    },
},
  {
    timestamps: true
  })

module.exports = mongoose.model('CarouselPhoto', carouselPhotoSchema)
