const SubCategory = require('../models/sub-category');
const Product = require('../models/product')
const slugify = require('slugify');

exports.create = async (req, res) => {
  try {
    const {subCategory} = req.body
    const newSubCategory = await new SubCategory({
      name: subCategory.name,
      slug: slugify(subCategory.name),
      parent: subCategory.parent
    })
      .save();
    res.json(newSubCategory);
  } catch (err) {
    res.status(400).send('Create subcategory failed')
  }
}

exports.list = async (req, res) => {
  res.json(await SubCategory.find({}).sort({createdAt: -1}).populate('parent'))
}

exports.read = async (req, res) => {
  let subCategory = await SubCategory.findOne({
    slug: req.params.slug
  }).exec()
  let products = await Product.find({
    subCategory: subCategory
  })
    .populate('category')
    .populate('subcategory')
    .exec()
  res.json({
    subCategory: subCategory,
    products: products
  });
}

exports.update = async (req, res) => {
  const {subCategory} = req.body;
  console.log(subCategory)
  try {
    const updated = await SubCategory.findOneAndUpdate({
        slug: req.params.slug
      },
      {
        // slug: slugify(subCategory.name),
        name: subCategory.name,
        parent: subCategory.parent
      },
      {
        new: true
      })
    res.json(updated)
  } catch (error) {
    res.status(400).send('Subcategory update failed')
  }
}

exports.remove = async (req, res) => {
  try {
    const deleted = await SubCategory.findOneAndDelete({
      slug: req.params.slug
    })
    res.json(deleted);
  } catch (error) {
    res.status(400).send('Subcategory delete failed')
  }
}
