const { default: mongoose } = require('mongoose');
const Userdb = require('../model/userModel/userModel');
const userAddressdb = require('../model/userModel/addressModel')
const Cartdb = require('../model/userModel/cartModel')
const Orderdb = require('../model/userModel/orderModel');
const Productdb = require('../model/adminModel/productModel');

//Search for product
exports.search = async (search) => {
  try {
    const regexPattern = new RegExp(search, 'i');
    const searchResults = await Productdb.find({
      $or: [
        { pName: regexPattern },
        { brand: regexPattern },
        { category: regexPattern },
      ],
    });
    return searchResults
  } catch (err) {
    console.log(err);
  }
}

//To get all items in cart
exports.getCartItems = async (userId) => {
  try {
    if (!userId) {
      return null
    }
    const agg = [
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId)
        }
      },
      {
        '$unwind': {
          'path': '$products'
        }
      }, {
        '$lookup': {
          'from': 'productdbs',
          'localField': 'products.productId',
          'foreignField': '_id',
          'as': 'pDetail'
        }
      }
    ];
    return await Cartdb.aggregate(agg)
  } catch (err) {
    return err;
  }
}

//To get default address
exports.getDefaultAddress = async (userId, addressId) => {
  try {
    const agg = [
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId)
        }
      },
      {
        $unwind: '$address'
      },
      {
        $match: {
          'address._id': new mongoose.Types.ObjectId(addressId)
        }
      }
    ];
    return await userAddressdb.aggregate(agg);
  } catch (err) {
    console.log(err);
  }
}

//To get all orders
exports.getOrders = async (userId) => {
  try {
    const agg = [
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
        },
      },
      {
        $sort: {
          orderDate: -1
        }
      },
      {
        $unwind: {
          path: "$orderItems",
        },
      },
    ];
    return await Orderdb.aggregate(agg);
  } catch (err) {
    console.log(err);
  }
}

exports.userCancelOrder = async (orderId, productId) => {
  try {
    const order = await Orderdb.findOneAndUpdate({
      $and: [{ _id: orderId }, { 'orderItems.productId': productId }]
    },
      {
        $set: {
          "orderItems.$.orderStatus": "Cancelled"
        }
      }
    )
    const units = order.orderItems.find(value => {
      if (String(value.productId) === productId) {
        return value.units;
      }
    })
    await Productdb.updateOne({ _id: productId },
      {
        $inc: {
          units: units.units
        }
      });

    return;
  } catch (err) {
    console.log(err);
  }
}