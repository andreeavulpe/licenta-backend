const Product = require('../models/product');
const User = require('../models/user')
const slugify = require('slugify');

exports.create = async (req, res) => {
  try {
    console.log(req.body);
    let title = req.body.product.title
    req.body.product.slug = slugify(title);
    const newProduct = await new Product(req.body.product).save();
    res.json(newProduct);
  } catch (error) {
    console.log(error)
    res.status(400).send('Create product failed')
  }
}

exports.list = async (req, res) => {
  let products = await Product.find({})
    .sort({createdAt: -1})
    .populate(['category','subCategory'])
    .exec()
  res.json(products)
}

exports.listProductsByCount = async (req, res) => {
  let products = await Product.find({})
    .limit(parseInt(req.params.count))
    .populate('category')
    .populate('subCategory')
    .sort([['createdAt','desc']])
    .exec()
  res.json(products)
}


exports.read = async (req, res) => {
  let product = await Product.findOne({
    slug: req.params.slug
  }).populate(['category', 'subCategory'])
    .exec();
  res.json(product)
}

exports.update = async (req, res) => {
  const {product} = req.body;
  console.log("Product received - subcategories", product.subCategory);
  try {
    const updated = await Product.findOneAndUpdate({
      slug: req.params.slug
    },
      {
        title: product.title,
        // slug: slugify(product.title),
        description: product.description,
        quantity: product.quantity,
        shipping: product.shipping,
        color: product.color,
        price: product.price,
        category: product.category,
        subCategory: product.subCategory,
        images: product.images,
        brand: product.brand,
      },
      {
        new: true
      })
      .populate('subCategory')
      console.log("Product updated - subcategories ", updated.subCategory)
      res.json(updated)
  } catch (error) {
    res.status(400).send('Product update failed')
  }
}

exports.remove = async (req, res) => {
  try {
    const deleted = await Product.findOneAndDelete({
      slug: req.params.slug
    })
    res.json(deleted);
  } catch (error) {
    res.status(400).send('Product delete failed')
  }
}

exports.listProductWithParameters = async (req, res)  => {
  try {
    const {sort, order, limit} = req.body
    const products = await Product.find({})
      .populate('category')
      .populate('subCategory')
      .sort([[sort, order]])
      .limit(limit)
      .exec()
    res.json(products)
  } catch (error) {
    console.log(error)
  }

}

exports.listProductWithPagination = async (req, res)  => {
  try {
    console.table(req.body)
    const {sort, order, page} = req.body
    const currentPage = page || 1;
    const perPage = 3;
    const products = await Product.find({})
      .skip((currentPage - 1) * perPage)
      .populate('category')
      .populate('subCategory')
      .sort([[sort, order]])
      .limit(perPage)
      .exec()
    console.log('currentPage ', page)
    console.log('products', products)
    res.json(products)
  } catch (error) {
    console.log(error)
  }
}

exports.productsCount = async (req, res) => {
  let total = await Product.find({})
    .estimatedDocumentCount()
    .exec();
  res.json(total)
};

exports.productStar = async (req, res) => {
  const product = await Product.findById(req.params.productId).exec()
  const user = await User.findOne({email: req.body.email}).exec()
  const {star} = req.body
  console.log("Produsul este" ,product)
  console.log("user", user)
  console.log("star", star)

  let existingRatingObject = product.ratings.find((element) => (element.postedBy.toString() === user._id.toString()))
  console.log("existingRatingObject", existingRatingObject)
  if (!existingRatingObject) {
    let ratingAdded = await Product.findByIdAndUpdate(product._id, {
      $push: {
        ratings: {
          star: star,
          postedBy: user._id
        }
      }
    },
      {
        new: true
      })
      .exec()
    console.log('ratingsAdded', ratingAdded)
    res.json(ratingAdded)
  } else {
    // if user have already left rating, update it
    const ratingUpdated = await Product.updateOne(
      {
        ratings: { $elemMatch: existingRatingObject },
      },
      { $set: { "ratings.$.star": star } },
      { new: true }
    ).exec();
    console.log("ratingUpdated", ratingUpdated);
    res.json(ratingUpdated);
  }
}

exports.listRelated = async (req, res) => {
  const product = await Product.findById(req.params.productId).exec();

  const related = await Product.find({
    _id: {
      $ne: product._id
    },
    category: product.category
  })
    .limit(3)
    .populate('category')
    .populate('subCategory')
    .populate('postedBy')
    .exec();
  res.json(related)
}

exports.getColorsAndBrands = async (req, res) => {
  let colors = await Product.aggregate([
    {
      $group: {
        _id: "$color",
      }
    },
  ])
    .exec()

  let brands = await Product.aggregate([
    {
      $group: {
        _id: "$brand",
      }
    },
  ])
    .exec()
  res.json({
    colors: colors,
    brands: brands
})
}

exports.searchFilters = async (req, res) => {
  const {query, price, category, stars, subCategory, shipping, color, brand} = req.body
  console.log('aici',req.body)

  let filter = {
  }
  if (query) {
    filter.$text = {
      $search: query
    }
  }

  if (price && price[0] !== null && price[1] !== null) {
    filter.price = {
      $gte: price[0],
      $lte: price[1]
    }
  }

  if (shipping) {
    filter.shipping = shipping
  }

  if (color && color.length > 0) {
    filter.color = color
  }

  if (brand && brand.length > 0) {
    filter.brand = brand
  }

  if (category && category.length > 0 ) {
    filter.category = category
  }

  if (subCategory && subCategory.length > 0) {
    filter.subCategory = subCategory
  }

  if (stars) {
    let starsAggregate = await Product.aggregate([
      { $unwind : "$ratings"},
      {
        $group: {
          _id: "$slug",
          avgRate: {
            $avg: "$ratings.star"
          }
        }
      },
      {
        $project: {
          document: "$$ROOT",
          floorAverage: {
            $floor: { $avg: "$avgRate" },
          },
        },
      },
      {$match: {
          floorAverage: parseInt(stars)
        }}
    ])
      .exec()
    // console.log(starsAggregate)
    filter.slug = starsAggregate
  }


  console.log('filter' , filter)
  let products = await Product.find({
    ...filter
  })
    .limit(25)
    .populate('category')
    .populate('subCategory')
    .populate('postedBy')
    .exec()
  res.json(products)
}
