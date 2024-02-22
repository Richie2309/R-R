const adminEmail = `admin@gmail.com`;
const adminPassword = `123`;

const mongodb = require("mongoose");
const Userdb = require("../model/userModel/userModel");
const Productdb = require('../model/adminModel/productModel')

const fs = require("fs");
const path = require("path");
const Categorydb = require("../model/adminModel/categoryModel");
const session = require("express-session");


exports.adminAddCategory = async (req, res) => {
  try {
    if (!req.body.name) {
      req.session.errMesg = `This field is required`
      return res.status(200).redirect('/adminAddCategory')
    }
    const categoryExists = await Categorydb.findOne({ category: req.body.name })
    if (categoryExists) {
      req.session.errMesg = "Category already exists"
      return res.status(200).redirect('/adminAddCategory')
    }
    const newCat = new Categorydb(req.body);
    const result = await newCat.save();
    res.status(200).redirect("/adminCategoryManage");
  } catch (err) {
    req.session.errMesg = `Category already exist `;
    res.status(401).redirect("/adminAddCategory");
  }
}

exports.getCategory = async (req, res) => {
  try {
    if (Number(req.params.value) === 1) {
      const result = await Categorydb.find({ status: true });
      res.send(result);
    } else {
      const result = await Categorydb.find({ status: false });
      res.send(result);
    }
  } catch (err) {
    res.status(500).render('errorPages/500page')
  }
}

exports.adminUpdateCategory = async (req, res) => {
  const id = req.query.id
  const name = req.body.name
  try {
    if (name === 'undefined' || !name) {
      req.session.category = `Category name cannot be empty`;
      const referer = req.get('Referrer')
      return res.redirect(303, referer);
    } else {
      await Categorydb.updateOne(
        { _id: id },
        { $set: { name: name } }
      );
      delete req.session.category
      res.redirect('/adminCategoryManage')
    }
  } catch (error) {
    res.status(500).render('errorPages/500page')
  }
}

exports.singleCategory = async (req, res) => {
  try {
    const id = req.query.id
    const result = await Categorydb.findOne({ _id: id })
    res.send(result)
  } catch (err) {
    res.status(500).render('errorPages/500page')

  }
}

exports.adminUnlistedCategory = async (req, res) => {
  try {
    await Categorydb.updateOne(
      { _id: req.params.id },
      { $set: { status: false } }
    );
    res.status(200).redirect("/adminCategoryManage");
  } catch (err) {
    res.status(500).render('errorPages/500page')
  }
}

exports.adminRestoreCategory = async (req, res) => {
  try {
    await Categorydb.updateOne(
      { _id: req.params.id },
      { $set: { status: true } }
    );
    res.status(200).redirect("/adminUnlistedCategory");
  } catch (err) {
    res.status(500).render('errorPages/500page')
  }
}