const axios = require('axios');
const { response } = require('express');
const Productdb = require('../../model/adminModel/productModel');
const { ExpressValidator } = require('express-validator');
const adminDbHelpers = require('../../dbHelpers/adminDbHelpers')
const userDbHelpers=require('../../dbHelpers/userDbHelpers')

exports.adminSignin = (req, res) => {
  res.render(
    "adminViews/adminSignin",
    {
      invalid: req.session.invalidAdmin, adminErr: {
        adminEmail: req.session.adminEmail,
        adminPassword: req.session.adminPassword
      }
    },
    (err, html) => {
      if (err) {
        console.error("Error rendering view:", err);
        return res.status(500).send("Internal Server Error");
      }

      delete req.session.invalidAdmin;
      delete req.session.adminPassword;
      delete req.session.adminEmail;

      res.send(html);
    }
  );

}

exports.adminHome = async (req, res) => {
  try {
    const topProducts = await adminDbHelpers.topProducts()
    const topBrands = await adminDbHelpers.topBrands()
    const topCategories = await adminDbHelpers.topCategories()
    const dashDetails = await adminDbHelpers.dashDetails()
    const orders = await adminDbHelpers.getAllOrders();
    const users = await axios.post(`http://localhost:${process.env.PORT}/api/getAllUser`);
    res.render('adminViews/adminHome', { users: users.data, orders, dashDetails: dashDetails, topProducts, topBrands, topCategories });
  } catch (err) {
    console.log(err);
  }
}

//product manage
exports.adminProductManage = async (req, res) => {
  try {
    const page = req.query.page || 1; 
    const productsResponse = await axios.get(`http://localhost:${process.env.PORT}/api/getProduct/1?page=${page}`);
    const products = productsResponse.data.products;
    const totalPages = productsResponse.data.totalPages;

    const searchQuery = req.query.Search;
    let result
    if (searchQuery) {
         result = await adminDbHelpers.productSearchResult(searchQuery)
    }
    res.status(200).render("adminViews/adminProductManage", {
      products: result || products,
      totalPages: totalPages,
      currentPage: page
    });
  } catch (err) {
    console.error("Error rendering admin product management page:", err);
    res.status(500).send('Internal server error');
  }
};


exports.adminAddProduct = async (req, res) => {
  try {
    const category = await axios.post(`http://localhost:${process.env.PORT}/api/getCategory/1`)
    res.status(200).render("adminViews/adminAddProduct", {
      category: category.data,
      product: {
        pName: req.session.pName,
        brand: req.session.brand,
        pDescription: req.session.pDescription,
        price: req.session.price,
        units: req.session.units,
        files: req.session.files,
      },
      savedDetails: req.session.productInfo,
    }, (err, html) => {
      if (err) {
        console.error("Error rendering view:", err);
        return res.status(500).send("Internal Server Error");
      }
      delete req.session.pName;
      delete req.session.brand;
      delete req.session.price;
      delete req.session.units;
      delete req.session.pDescription;
      delete req.session.productInfo;
      delete req.session.files

      res.send(html);
    }
    )

  } catch (err) {
    console.log("err", err);
    res.send("Internal server err hh");
  }
}

exports.adminUpdateProduct = async (req, res) => {
  try {
    const [category, product] = await Promise.all([
      axios.post(`http://localhost:${process.env.PORT}/api/getCategory/1`),
      axios.get(`http://localhost:${process.env.PORT}/api/singleProduct/${req.params.id}`)]);

    res.status(200).render("adminViews/adminUpdateProduct", {
      category: category.data,
      product: product.data,
      savedDetails: req.session.updateProductInfo,
      errMesg: {
        pName: req.session.pName,
        brand: req.session.brand,
        pDescription: req.session.pDescription,
        price: req.session.price,
        units: req.session.units,
        files: req.session.files,
        category: req.session.category,
      }
    },

      (err, html) => {
        if (err) {
          console.error("Error rendering view:", err);
          return res.status(500).send("Internal Server Error");
        }
        delete req.session.pName;
        delete req.session.brand;
        delete req.session.price;
        delete req.session.units;
        delete req.session.pDescription;
        delete req.session.productInfo;
        delete req.session.files
        delete req.session.updateProductInfo;

        res.send(html);
      }
    );
  } catch (err) {
    console.log("err", err);
    res.send("Internal server err");
  }

}

exports.adminUnlistedProduct = async (req, res) => {
  try {
    const product = await axios.get(`http://localhost:${process.env.PORT}/api/getProduct/0`);

    res.status(200).render('adminViews/adminUnlistedProduct', { products: product.data })
  } catch (error) {
    console.error('Error fetching product details:', error);
    res.status(500).send('Internal server error');
  }
}

//Category Management
exports.adminCategoryManage = async (req, res) => {
  try {
    const category = await axios.post(
      `http://localhost:${process.env.PORT}/api/getCategory/1`);
    res.render("adminViews/adminCategoryManage", { category: category.data });
  } catch (err) {
    res.send("Internal server err");

  }
}

exports.adminAddCategory = (req, res) => {
  res.status(200).render('adminViews/adminAddCategory', { err: req.session.errMesg }, (err, html) => {
    if (err) {
      res.status(500).send("Internal server error")
    }
    delete req.session.errMesg;
    res.send(html);
  })
}

exports.adminUpdateCategory = async (req, res) => {
  try {
    const category = await axios.get(`http://localhost:${process.env.PORT}/api/getSingleCategory?id=${req.query.id}`)
    res.status(200).render('adminViews/adminUpdateCategory',
      { category: category.data, errMesg: req.session.category })
  } catch (err) {
    res.send("Internal server err");
  }
}

exports.adminUnlistedCategory = async (req, res) => {
  try {

    console.log(req.params.value);
    const category = await axios.post(`http://localhost:${process.env.PORT}/api/getCategory/0`)
    res.status(200).render('adminViews/adminUnlistedCategory', { category: category.data })
  } catch (err) {
    res.send("Internal server error");
  }
}

//User maanage
exports.adminUserManage = async (req, res) => {
  const users = await axios.post(`http://localhost:${process.env.PORT}/api/getAllUser`);
  res.status(200).render('adminViews/adminUserManage', { users: users.data });
}

//Order Manage
exports.adminOrderManage = async (req, res) => {
  try {
    const orders = await adminDbHelpers.getAllOrders();
    res.status(200).render('adminViews/adminOrderManage', { orders })
  }
  catch (err) {
    console.log("err", err);
    res.send("Internal server err");
  }
}

exports.orderManage=async(req,res)=>{
  try{
    const orderDetail = await userDbHelpers.getOrderDetails(req.query.orderId,req.query.productId)
    console.log(orderDetail);
    res.status(200).render('adminViews/adminOrderDetail', { orderDetail })
  }catch(err){
    res.send("Internal server err");
  }
}

//Coupon Manage
exports.adminCouponManage = async (req, res) => {
  try {
    const coupons = await adminDbHelpers.getAllCoupon();
    res.render('adminViews/adminCouponManage', { coupons })
  } catch (err) {
    console.log("err", err);
    res.send("Internal server err");
  }
}

exports.adminAddCoupon = async (req, res) => {
  try {
    res.render('adminViews/adminAddCoupon', {
      errMesg: {
        code: req.session.code,
        discount: req.session.discount,
        minPrice: req.session.minPrice,
        expiry: req.session.expiry,
      }
    }, (err, html) => {
      if (err) {
        console.error('Add Coupon render err', err);
        return res.status(500).send('Internal server err');
      }
      delete req.session.code;
      delete req.session.discount;
      delete req.session.minPrice;
      delete req.session.expiry;

      res.status(200).send(html);
    })
  } catch (err) {
    console.log("err", err);
    res.send("Internal server err");
  }
}