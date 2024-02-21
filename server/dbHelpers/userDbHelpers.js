const { default: mongoose } = require('mongoose');
const Userdb = require('../model/userModel/userModel');
const userAddressdb = require('../model/userModel/addressModel')
const Cartdb = require('../model/userModel/cartModel')
const Orderdb = require('../model/userModel/orderModel');
const Productdb = require('../model/adminModel/productModel');
const walletDb = require('../model/userModel/walletModel')

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

exports.getProductByCategory = async (category, page, search=null) => {
  try {
    const limit = 2;
    const skip = (page - 1) * limit;
    const totalListedProducts = await Productdb.find({ category: category, listed: true }).countDocuments();
    const totalPages = Math.ceil(totalListedProducts / limit);
    const agg = [
      {
        $match: {
          category: category,
          listed: true,
        },
      },
      {
        $skip: skip
      },
      {
        $limit: limit
      },
    ];
     // if there is both min and max for product price
     if(Number(search?.minPrice) && Number(search?.maxPrice)) {
      agg.splice(1,0, {
        $match: {
          $and: [
            {
              price: {$gte: Number(search?.minPrice)}
            },
            {
              price:{$lte: Number(search?.maxPrice)}
            }
          ]
        },
      });
    }

    //if there is only max for filter
    if(!Number(search?.minPrice) && Number(search?.maxPrice)) {
      agg.splice(1,0, {
        $match: {
          price: {$lt: Number(search?.maxPrice)}
        },
      });
    }

    //if there is only min for filter
    if(Number(search?.minPrice) && !Number(search?.maxPrice)) {
      agg.splice(1,0, {
        $match: {
          price: {$gt: Number(search?.minPrice)}
        },
      });
    }

    //Price Sort
    if(Number(search?.sort)){
      agg.splice(1,0, {
        $sort: {
          price: Number(search?.sort)
        },
      });
    }

    const result = await Productdb.aggregate(agg);
    return { result, totalPages };
  } catch (err) {
    console.log("Error:", err);
  }
}

//Top selling products
exports.recentProducts = async () => {
  try {
    const recentProducts = await Productdb.find()
      .sort({ createdAt: -1 })
      .limit(4);
    return recentProducts
  } catch (err) {
    throw err
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

//To get order detail of a specific product 
exports.getOrderDetails = async (orderId, productId) => {
  try {
    const orderDetails = await Orderdb.findOne({
      _id: orderId,
      "orderItems.productId": productId
    });
    if (orderDetails) {
      const orderItem = orderDetails.orderItems.find(item => item.productId.equals(productId));
      return { order: orderDetails, product: orderItem };
    } else {
      return null;
    }
  } catch (err) {
    throw err
  }
}

exports.userCancelOrder = async (orderId, productId, userId) => {
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

    let cancelPrice = units.price * units.units
    if (units.priceAfterCoupon > 0) {
      cancelPrice = units.priceAfterCoupon
    }

    await Productdb.updateOne({ _id: productId },
      {
        $inc: {
          units: units.units
        }
      });

    if (order.paymentMethod != 'cod') {
      await walletDb.updateOne({ userId: userId },
        {
          $inc: {
            balance: cancelPrice
          },
          $push: {
            transactions: {
              amount: cancelPrice
            }
          }
        },
        {
          upsert: true
        }
      )
    }
    return;
  } catch (err) {
    console.error('Error cancelling order:', err);
    res.status(500).send('Internal server error');
  }
}

//Return order
exports.userReturnOrder = async (orderId, productId, userId) => {
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

    let cancelPrice = units.price * units.units
    if (units.priceAfterCoupon > 0) {
      cancelPrice = units.priceAfterCoupon
    }

    await Productdb.updateOne({ _id: productId },
      {
        $inc: {
          units: units.units
        }
      });

    await walletDb.updateOne({ userId: userId },
      {
        $inc: {
          balance: cancelPrice
        },
        $push: {
          transactions: {
            amount: cancelPrice
          }
        }
      },
      {
        upsert: true
      }
    )
    return;
  } catch (err) {
    console.error('Error returning order:', err);
    res.status(500).send('Internal server error');
  }
}

// exports.returnOrder = async (orderId) => {
//   try {
//     // Retrieve the order
//     const order = await Orderdb.findOne({ _id: orderId });
//     if (!order) {
//       throw new Error('Order not found');
//     }

//     // Calculate refund amount
//     let refundAmount = order.totalPrice;

//     // If coupon was applied, adjust the refund amount
//     // For simplicity, let's assume a fixed coupon amount deducted from totalPrice
//     // You may need to adjust this logic based on your coupon system
//     // For example, if the coupon value is stored in the order document
//     // you should deduct that value from the totalPrice.
//     // refundAmount -= order.couponAmount;

//     // Credit refund amount to user's wallet
//     const userId = order.userId;
//     const wallet = await Wallet.findOne({ userId });
//     if (!wallet) {
//       throw new Error('Wallet not found for user');
//     }

//     wallet.balance += refundAmount;
//     wallet.transactions.push({ amount: refundAmount });

//     await wallet.save();

//     // Increase product quantity
//     for (const item of order.orderItems) {
//       await Productdb.updateOne(
//         { _id: item.productId },
//         { $inc: { units: item.units } }
//       );
//     }

//     // Update order status to "Returned"
//     await Orderdb.updateOne(
//       { _id: orderId },
//       { $set: { 'orderItems.$[].orderStatus': 'Returned' } }
//     );

//     return true; // Return success
//   } catch (error) {
//     console.error('Error returning order:', error);
//     throw error;
//   }
// };

//To get wallet information

exports.getWallet = async (userId) => {
  try {
    return await walletDb.findOne({ userId: userId }).exec();
  } catch (err) {
    console.log(err);
  }
}
