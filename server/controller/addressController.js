const Userdb = require('../model/userModel/userModel');
// const Otpdb = require("../../model/userModel/otpModel");

const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const Mailgen = require("mailgen");
const { default: mongoose } = require("mongoose");
const Categorydb = require('../model/adminModel/categoryModel')
const Cartdb = require('../model/userModel/cartModel')
const Productdb = require('../model/adminModel/productModel');
const { query } = require('express');
const userAddressdb = require('../model/userModel/addressModel')

function capitalizeFirstLetter(str) {
  str = str.toLowerCase();
  return str.charAt(0).toUpperCase() + str.slice(1);
}

exports.addressInfo = async (req, res) => {
  const userId = req.query.userId;
  const addressId = req.query.addressId;
  try {
    if (!addressId) {
      const address = await userAddressdb.findOne({
        "userId": userId
      }).populate('defaultAddress');
      res.send(address);
    }
    else {
      const address = await userAddressdb.findOne({
        "userId": userId
      })
      const oneAdd = address.address.find(element => {
        return String(element._id) === addressId
      })
      res.send(oneAdd);
    }

  } catch (err) {
    console.log(err);
    res.status(500).send("internal server error");
  }
}

exports.changeAddress = async (req, res) => {
  try {
    await userAddressdb.updateOne(
      { userId: req.session.isUserAuth },
      { $set: { defaultAddress: req.query.id } }
    );
    res.status(200).redirect("/userAddress");
  } catch (err) {
    res.status(500).send("Internal server error");
  }
}

exports.userAddAddress = async (req, res) => {
  const returnTo = req.session.returnTo;
  try {
    if (!req.body.fName) {
      req.session.fName = `This Field is required`;
    }

    if (!req.body.pincode) {
      req.session.pincode = `This Field is required`;
    }

    if (!req.body.locality) {
      req.session.locality = `This Field is required`;
    }

    if (!req.body.address) {
      req.session.address = `This Field is required`;
    }

    if (!req.body.district) {
      req.session.district = `This Field is required`;
    }

    if (!req.body.state) {
      req.session.state = `This Field is required`;
    }

    if (
      req.session.fName ||
      req.session.pincode ||
      req.session.locality ||
      req.session.address ||
      req.session.district ||
      req.session.state
    ) {
      req.session.sAddress = req.body;
      return res.status(401).redirect("/userAddAddress");
    }

    req.body.fullName = capitalizeFirstLetter(req.body.fName);
    req.body.locality = capitalizeFirstLetter(req.body.locality);
    req.body.district = capitalizeFirstLetter(req.body.district);
    req.body.state = capitalizeFirstLetter(req.body.state);

    const isAddress = await userAddressdb.findOne({
      userId: req.session.isUserAuth,
      "address.fName": req.body.fName,
      "address.pincode": req.body.pincode,
      "address.locality": req.body.locality,
      "address.address": req.body.address,
      "address.district": req.body.district,
      "address.state": req.body.state,
    });

    if (isAddress) {
      req.session.exist = `This address already exist`;
      return res.status(401).redirect("/userAddAddress");
    }
    
    const structuredAddress = `${req.body.fName}, ${req.body.address}, ${req.body.locality}, ${req.body.district}, ${req.body.state} - ${req.body.pincode}`;

    await userAddressdb.updateOne(
      { userId: req.session.isUserAuth },
      {
        $push: {
          address: {
            fullName: req.body.fName,
            pincode: req.body.pincode,
            locality: req.body.locality,
            address: req.body.address,
            district: req.body.district,
            state: req.body.state,
            structuredAddress,
          },
        },
      },
      { upsert: true }
    );

    const addres = await userAddressdb.findOne({
      userId: req.session.isUserAuth,
    });

    if (!addres.defaultAddress || addres.address.length === 1) {
      await userAddressdb.updateOne(
        { userId: req.session.isUserAuth },
        { $set: { defaultAddress: addres.address[0]._id } }
      );
    }
    console.log('returnTo:', returnTo);
    if (returnTo === 'userCheckout') {
      delete req.session.returnTo
      console.log('Redirecting to userCheckout');
      res.status(200).redirect('/userCheckout');
    } else {
      console.log('Redirecting to userAddress');
      res.redirect('/userAddress');
    }
    // res.redirect('/userAddress')
  } catch (err) {
    console.log(err);
  }
}

exports.userEditAddress = async (req, res) => {
  const returnTo = req.session.returnTo;
  const addressId = req.query.addressId;
  const userId = req.session.isUserAuth
  console.log(addressId)
  console.log(userId)
  try {
    req.body.fName = req.body.fName.trim()
    req.body.locality = req.body.locality.trim()
    req.body.address = req.body.address.trim()
    req.body.district = req.body.district.trim()
    req.body.state = req.body.state.trim()

    if (!req.body.fName) {
      req.session.fName = `This Field is required`;
    }

    if (!req.body.pincode) {
      req.session.pincode = `This Field is required`;
    }

    if (!req.body.locality) {
      req.session.locality = `This Field is required`;
    }

    if (!req.body.address) {
      req.session.address = `This Field is required`;
    }

    if (!req.body.district) {
      req.session.district = `This Field is required`;
    }

    if (!req.body.state) {
      req.session.state = `This Field is required`;
    }

    if (
      req.session.fName ||
      req.session.pincode ||
      req.session.locality ||
      req.session.address ||
      req.session.district ||
      req.session.state
    ) {
      req.session.sAddress = req.body;
      return res.status(401).redirect("/userEditAddress");
    }

    req.body.fName = capitalizeFirstLetter(req.body.fName);
    req.body.locality = capitalizeFirstLetter(req.body.locality);
    req.body.district = capitalizeFirstLetter(req.body.district);
    req.body.state = capitalizeFirstLetter(req.body.state);

    // Validate if the addressId is provided
    if (!addressId) {
      return res.status(400).send("Address ID is required");
    }

    // Check if the address exists
    const existingAddress = await userAddressdb.findOne({
      userId: userId,
      "address._id": addressId,
    });

    if (!existingAddress) {
      return res.status(404).send("Address not found");
    }

    // Update the existing address
    await userAddressdb.updateOne(
      {
        userId: userId,
        "address._id": addressId,
      },
      {
        $set: {
          "address.$.fullName": req.body.fName,
          "address.$.pincode": req.body.pincode,
          "address.$.locality": req.body.locality,
          "address.$.address": req.body.address,
          "address.$.district": req.body.district,
          "address.$.state": req.body.state,
          "address.$.structuredAddress": `${req.body.fName}, ${req.body.address}, ${req.body.locality}, ${req.body.district}, ${req.body.state} - ${req.body.pincode}`
        },
      }
    );
    console.log('returnTo:', returnTo);
    if (returnTo === 'userCheckout') {
      delete req.session.returnTo
      console.log('Redirecting to userCheckout');
      res.status(200).redirect('/userCheckout');
    } else {
      console.log('Redirecting to userAddress');
      res.redirect('/userAddress');
    }
    // res.status(200).redirect("/userAddress");
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
}

exports.deleteAddress = async (req, res) => {
  try {
    const address = await userAddressdb.findOneAndUpdate(
      { userId: req.session.isUserAuth },
      { $pull: { address: { _id: req.query.addressId } } }
    );

    if (
      String(address.defaultAddress) === req.query.addressId &&
      address.address.length > 1
    ) {
      const addres = await userAddressdb.findOne({
        userId: req.session.isUserAuth,
      });

      await userAddressdb.updateOne(
        { userId: req.session.isUserAuth },
        { $set: { defaultAddress: addres.address[0]._id } }
      );
    }
    res.status(200).redirect("/userAddress");
  } catch (err) {
    console.log("err");
    res.status(500).send(err);
  }
}
