const mongodb = require("mongoose");
const Userdb = require("../model/userModel/userModel");
const Productdb = require('../model/adminModel/productModel')
const orderDb = require('../model/userModel/orderModel')
const fs = require("fs");
const path = require("path");
const Categorydb = require("../model/adminModel/categoryModel");
const session = require("express-session");
const adminHelper = require("../dbHelpers/adminDbHelpers");
const userHelper = require("../dbHelpers/userDbHelpers");
const Orderdb = require("../model/userModel/orderModel");

exports.adminChangeOrderStatus = async (req, res) => {
  try {
    await adminHelper.adminChangeOrderStatus(req.query.orderId, req.query.productId, req.body.orderStatus)
    res.status(200).redirect(`/adminOrderManage`);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server err");
  }

}

exports.userCancelOrder = async (req, res) => {
  try {
    await userHelper.userCancelOrder(req.query.orderId, req.query.productId, req.session.isUserAuth);
    req.session.isCancelled = true;
    return res.status(200).redirect("/userOrderHistory");
  } catch (err) {
    console.log(err)
  }
}

exports.userOrderReturn = async (req, res) => {
  try {
    await userHelper.userReturnOrder(req.query.orderId, req.query.productId, req.session.isUserAuth);
    req.session.isReturned = true;
    return res.status(200).redirect("/userOrderHistory");
   
  } catch (err) {
    res.status(500).send("Internal server error")
  }
}

exports.invoice = async (req, res) => {
  const id = req.query.id
  try {
    const order = await Orderdb.findOne({ _id: id })

    const products = order.orderItems.map((item) => ({
      units: item.units,
      description: item.pName,
      'tax-rate': 0,
      price: item.price * item.units,
      address: item.address
    }));
    const client = {
      address: order.address,
      totalPrice: order.totalPrice
    };

    res.json(
      {
        order,
        products,
        client,
      }
    );
  } catch (error) {
    res.send(error)
  }
}