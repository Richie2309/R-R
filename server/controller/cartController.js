const Userdb = require('../model/userModel/userModel');
const Otpdb = require("../model/userModel/otpModel");

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

exports.usersAddToCart = async (req, res) => {
    const userId = req.session.isUserAuth
    const productId = req.query.productId
    try {
      //checking if the product already exist in cart
      const isItem = await Cartdb.findOne({ userId: userId, 'products.productId': productId })
      if (isItem) {
        return res.status(200).redirect(`/userProductDetail/${productId}`)
      }
  
      // insert new doc if not exist
      await Cartdb.updateOne(
        { userId: userId },
        { $push: { products: { productId: productId } } },
        { upsert: true }
      )
  
      return res.status(200).redirect(`/userProductDetail?productId=${productId}`);
  
  
    } catch (err) {
      res.status(500).send("Internal server error addtocart")
    }
  }
  
  exports.getCartItems = async (req, res) => {
    const userId = req.query.userId;
    const productId = req.query.productId
    try {
      // if user not login show add to cart button for that send false
      if (userId === "undefined") {
        return res.send(false);
      }
      const isItem = await Cartdb.findOne({ userId: userId, 'products.productId': productId });
      //if product is there send true to show go cart button or false to show add to cart button
      if (isItem) {
        res.send(true);
      } else {
        res.send(false);
      }
    } catch (err) {
      console.log("err");
      res.status(500).send("Interal server error getcart")
    }
  }
  
  exports.updateQuantity = async (req, res) => {
    try {
      const totalQuantity = req.query.qid
      const productId = req.query.productId
      await Cartdb.updateOne({ userId: req.session.isUserAuth, "products.productId": productId }, { $set: { "products.$.units": totalQuantity } })
      // res.redirect('/userCart')
      res.status(200).json({
        status: true
      })
    } catch (err) {
      res.status(500).send("Internal server error update")
    }
  }
  
  exports.userDeleteCart = async (req, res) => {
    try {
      await Cartdb.updateOne(
        { userId: req.session.isUserAuth },
        { $pull: { products: { productId: req.query.productId } } }
      )
      res.status(200).redirect('/userCart')
    } catch (err) {
  
    }
  }
  