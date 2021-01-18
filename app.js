// const path = require("path");
const express = require("express");
const mongoose = require("mongoose");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();

//routes
const coolRoutes = require('./routes/cool')
const authRoutes = require('./routes/auth');
const subCategoryRoutes = require('./routes/sub-category');
const categoryRoutes = require('./routes/category');
const productRoutes = require('./routes/product');
const cloudinaryRoutes = require('./routes/cloudinary');
const carouselPhotoRoutes = require('./routes/carouserl-photo');
const userRoutes = require('./routes/user');
const cuponRoutes = require('./routes/cupon');
const stripeRoutes = require('./routes/stripe');
const adminRoutes = require('./routes/admin')


const app = express();

new mongoose
  .connect(
    process.env.DATABASE,
    {
      useNewUrlParser: true,
      useCreateIndex: true,
      useUnifiedTopology: true,
      useFindAndModify: false
    }
  )
  .then(() => {
    console.log("Connected to database!");
  })
  .catch((error) => {
    console.log(`Connection failed! Error: ${error}`);
  });

//middlewares

app.use(morgan("dev"));
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());


//routes middleware
app.use('/', coolRoutes)
app.use('/api', authRoutes)
app.use('/api', subCategoryRoutes)
app.use('/api', categoryRoutes)
app.use('/api', productRoutes)
app.use('/api', cloudinaryRoutes)
app.use('/api', carouselPhotoRoutes)
app.use('/api', userRoutes)
app.use('/api', cuponRoutes)
app.use('/api', stripeRoutes)
app.use('/api', adminRoutes)

module.exports = app;
