const CarouselPhoto = require('../models/carousel-photo');
const slugify = require('slugify')

exports.list = async (req, res) => {
  let photos = await CarouselPhoto.find({})
    .exec();
  res.json(photos)
}

exports.create = async (req, res) => {
  try{
    console.log(req.body)
    let name = req.body.carouselPhoto.name
    req.body.carouselPhoto.slug = slugify(name);
    console.log('req.body.carouselpgoto.sluh',  req.body.carouselPhoto.slug)
    const newCarouselPhoto = await new CarouselPhoto(req.body.carouselPhoto).save()
    res.json(newCarouselPhoto)
  } catch (e) {
    console.log(e)
    res.status(400).send('Create carouselPhoto failed')
  }
}

exports.remove = async (req, res) => {
  try {
    const deleted = await CarouselPhoto.findOneAndDelete({
      slug: req.params.slug
    })
    res.json(deleted)
  } catch (e) {
    res.status(400).send('Carousel Photo delete failed')
  }
}
