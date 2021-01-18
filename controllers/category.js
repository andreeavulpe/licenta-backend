const Category = require('../models/category');
const SubCategory = require('../models/sub-category')
const Product = require('../models/product')
const slugify = require('slugify');

exports.create = async (req, res) => {
  try {
    const {name} = req.body.category
    const category = await new Category({
      name: name,
      slug: slugify(name)
    })
      .save();
    res.json(category);
  } catch (err) {
      // console.log(err)
      res.status(400).send('Create category failed')
  }
}

exports.list = async (req, res) => {
  res.json(await Category.find({}).sort({createdAt: -1}).exec())
}

exports.read = async (req, res) => {
  let category = await Category.findOne({
    slug: req.params.slug
  }).exec();
  const products = await Product.find({
    category: category
  })
    .populate('category')
    .populate('postedBy')
    .exec()
  res.json({
    category: category,
    products: products
  });
}


exports.update = async (req, res) => {
  const {category} = req.body;
  console.log(category)
  try {
    const updated = await Category.findOneAndUpdate({
      slug: req.params.slug
    },
      {
        name: category.name
      },
      {
        new: true
      })
    res.json(updated)
  } catch (error) {
    res.status(400).send('Category update failed')
  }
}

exports.remove = async (req, res) => {
  try {
    const deleted = await Category.findOneAndDelete({
      slug: req.params.slug
    })
    res.json(deleted);
  } catch (error) {
    res.status(400).send('Category delete failed')
  }
}

exports.getSubCategories =  (req, res) => {
  SubCategory.find({ parent: req.params._id }).exec((err, subs) => {
    if (err) console.log(err);
    res.json(subs);
  });
}
