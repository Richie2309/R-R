const Userdb = require('../model/userModel/userModel');
const Otpdb = require("../model/userModel/otpModel");
const path = require('path')
const sharp = require('sharp')
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const Mailgen = require("mailgen");
const { default: mongoose } = require("mongoose");
const Categorydb = require('../model/adminModel/categoryModel')
const Cartdb = require('../model/userModel/cartModel')
const Productdb = require('../model/adminModel/productModel');
const { query } = require('express');
const userAddressdb = require('../model/userModel/addressModel')
// const dotenv = config({ path: 'congif.env' })

function capitalizeFirstLetter(str) {
  str = str.toLowerCase();
  return str.charAt(0).toUpperCase() + str.slice(1);
}

exports.productByCategory = async (req, res) => {
  const category = req.query.name
  try {
    if (!category) {
      res.redirect('/')
    }

    const result = await Productdb.find({ category: category, listed: true });

    res.send(result);
  } catch (err) {
    console.log("Error:", err);
    res.status(500).render("errorPages");
  }
}

exports.userProductDetail = async (req, res) => {
  const productId = req.query.productId
  try {
    const result = await Productdb.find({ _id: productId })
    res.send(result)
  } catch (err) {
    console.log(err);
  }
}

//--From admin side--//
exports.adminAddProducts = async (req, res) => {
  const { pName, brand, category, pDescription, price, units } = req.body
  const files = req.files
  try {
    if (!pName) {
      req.session.pName = "This Field is required";
    }
    if (!brand) {
      req.session.brand = "This Field is required";
    }
    if (!pDescription) {
      req.session.pDescription = "This Field is required";
    }
    if (!category) {
      req.session.category = "This filed is requierd"
    }
    if (!price) {
      req.session.price = "This Field is required";
    }
    if (!units) {
      req.session.units = "This Field is required";
    }
    if (!files) {
      req.session.files = "This field is required"
    }
    if (req.files.length === 0) {
      req.session.files = "This Field is required";
    }

    if (
      req.session.pName ||
      req.session.pDescription ||
      req.session.category ||
      req.session.price ||
      req.session.units ||
      req.session.files
    ) {
      req.session.productInfo = req.body;
      return res.status(401).redirect("/adminAddProduct");
    }

    for (const file of files) {
      const inputImagePath = path.join(__dirname, '../../assets', `uploads/${file.filename}`);
      const outputImagePath = path.join(__dirname, '../../assets', `uploads/resizedImg${file.filename}`);

      await sharp(inputImagePath)
        .resize(1117, 1400, {
          fit: 'cover',
          position: 'centre',
        })
        .toFile(outputImagePath);
    }
    // Extract filenames from the uploaded files
    const uploadImg = files.map((value) => { return `/uploads/resizedImg${value.filename}` });

    const newProduct = new Productdb({
      pName: pName,
      brand: brand,
      category: category,
      pDescription: pDescription,
      price: price,
      units: units,
      images: uploadImg,
    })
    const data = await newProduct.save();
    res.redirect("/adminHome");
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal server error");
  }
}

exports.showProduct = async (req, res) => {
  try {
    const page = req.query.page || 1; 
    const limit = 5; //Product per page
    const skip = (page - 1) * limit;
    
    if (Number(req.params.value) === 1) {
      const totalListedProducts = await Productdb.countDocuments({ listed: true });
      const products = await Productdb.find({ listed: true }).skip(skip).limit(limit);
      res.send({ products: products, totalPages: Math.ceil(totalListedProducts / limit) });
    }
    else {
      const products = await Productdb.find({ listed: false })
      res.send(products)
    }

  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).send('Internal server error');
  }
}

exports.singleProduct = async (req, res) => {
  try {
    const id = req.params.value
    const products = await Productdb.find({ _id: id })
    res.send(products);

    // const products = await Productdb.find({ listed: (Number(req.params.value)) ? true : false })
    // res.send(products);
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).send('Internal server error');
  }
}

exports.adminUnlistedProduct = async (req, res) => {
  try {
    await Productdb.updateOne(
      { _id: req.params.id },
      { $set: { listed: false } }
    )
    res.status(200).redirect("/adminProductManage")
  } catch (err) {
    console.error('Error deleting products:', err);
    res.status(500).send('Internal server error');
  }
}

exports.adminRestoreProduct = async (req, res) => {
  try {
    await Productdb.updateOne(
      { _id: req.params.id },
      { $set: { listed: true } }
    )
    res.status(200).redirect("/adminUnlistedProduct")
  } catch (err) {
    console.error('Error deleting products:', err);
    res.status(500).send('Internal server error');
  }
}

exports.adminUpdateProduct = async (req, res) => {
  const { pName, brand, category, pDescription, price, units } = req.body
  const files = req.files

  try {
    if (!pName) {
      req.session.pName = "This Field is required";
    }
    if (!brand) {
      req.session.brand = "This Field is required";
    }
    if (!pDescription) {
      req.session.pDescription = "This Field is required";
    }
    if (!category) {
      req.session.category = "This filed is requierd"
    }
    if (!price) {
      req.session.price = "This Field is required";
    }
    if (!units) {
      req.session.units = "This Field is required";
    }
    // if (req.files.length === 0) {
    //   req.session.files = "This Field is required";
    // }

    if (
      req.session.pName ||
      req.session.pDescription ||
      req.session.category ||
      req.session.price ||
      req.session.units
    ) {
      req.session.updateProductInfo = req.body;
      return res.send(`/adminUpdateProduct/${req.query.id}`);
    }
    const uploadImg = files.map((value) => { return "/uploads/" + value.filename });

    const updateProduct = {
      pName: pName,
      brand: brand,
      category: category,
      pDescription: pDescription,
      price: price,
      units: units,
      // images: uploadImg,
    }

    await Productdb.updateOne({ _id: req.params.id }, { $set: updateProduct });
    if (files.length == 0)
      return res.redirect('/adminProductManage')
    else {
      await Productdb.updateOne({ _id: req.params.id }, { $push: { images: uploadImg } })
      res.redirect("/adminProductManage");
    }

  } catch (err) {
    console.error('Error updating products:', err);
    res.status(500).send('Internal server error');
  }
}

exports.deleteProductImage = async (req, res) => {
  const { productId, imageIndex } = req.params;

  try {
    // Fetch the product by ID
    const product = await Productdb.findById(productId);

    // Ensure the product and image index are valid
    if (!product || imageIndex < 0 || imageIndex >= product.images.length) {
      return res.status(404).json({ error: 'Invalid product or image index' });
    }

    // Remove the image at the specified index
    product.images.splice(imageIndex, 1);

    // Save the updated product
    await product.save();

    res.status(200).json({ success: true, message: 'Image deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};