const { default: mongoose } = require('mongoose');
const Cartdb = require('../model/userModel/cartModel')
const Orderdb = require('../model/userModel/orderModel')
const Productdb = require('../model/adminModel/productModel')
const Userdb = require('../model/userModel/userModel');
const categoryDb = require('../model/adminModel/categoryModel')
const couponDb = require('../model/userModel/couponModel');

//top selling products
exports.topProducts = async () => {
    try {
        const agg = [
            {
                $unwind: {
                    path: "$orderItems",
                },
            },
            {
                $group: {
                    _id: "$orderItems.productId",
                    productName: { $first: "$orderItems.pName" },
                    totalUnitsSold: { $sum: "$orderItems.units" }
                }
            },
            {
                $project: {
                    _id: 0,
                    productName: 1,
                    totalUnitsSold: 1
                }
            },
            {
                $sort: {
                    totalUnitsSold: -1
                }
            },
            {
                $limit: 10
            }
        ];
        return await Orderdb.aggregate(agg);
    } catch (error) {
        console.log("Error in getAllOrders:", error);
    }
}

//Top sellign brands
exports.topBrands = async () => {
    try {
        const agg = [
            {
                $unwind: {
                    path: "$orderItems",
                },
            },
            {
                $group: {
                    _id: "$orderItems.brand",
                    totalUnitsSold: { $sum: "$orderItems.units" }
                }
            },
            {
                $project: {
                    _id: 0,
                    brand: "$_id",
                    totalUnitsSold: 1
                }
            },
            {
                $sort: {
                    totalUnitsSold: -1
                }
            },
            {
                $limit: 10
            }
        ];
        return await Orderdb.aggregate(agg);
    } catch (error) {
        console.log("Error in topBrands:", error);
        throw error;
    }
}

//Top selling categories
exports.topCategories = async () => {
    try {
        const agg = [
            {
                $unwind: {
                    path: "$orderItems",
                },
            },
            {
                $group: {
                    _id: "$orderItems.category",
                    totalUnitsSold: { $sum: "$orderItems.units" }
                }
            },
            {
                $project: {
                    _id: 0,
                    category: "$_id",
                    totalUnitsSold: 1
                }
            },
            {
                $sort: {
                    totalUnitsSold: -1
                }
            },
            {
                $limit: 10
            }
        ];
        return await Orderdb.aggregate(agg);
    } catch (error) {
        console.log("Error in topCategories:", error);
        throw error;
    }
}

//To return all order detalis
exports.getAllOrders = async (filter) => {
    try {
        const agg = [
            {
                $unwind: {
                    path: "$orderItems",
                },
            },
            {
                $lookup: {
                    from: "userdbs",
                    localField: "userId",
                    foreignField: "_id",
                    as: "userInfo",
                },

            },

            {
                $sort: {
                    orderDate: -1,
                },
            }
        ];
        return await Orderdb.aggregate(agg);
    } catch (err) {

    }
}


exports.dashDetails = async () => {
    try {
        const [totalSales] = await Orderdb.aggregate([
            {
                $unwind: {
                    path: "$orderItems",
                },
            },
            {
                $match: {
                    $or: [
                        { "orderItems.orderStatus": "Delivered" },
                        { paymentMethod: "online" },
                    ],
                },
            },
            {
                $group: {
                    _id: null,
                    profit: {
                        $sum: {
                            $multiply: ["$orderItems.price", "$orderItems.units"],
                        },
                    },
                },
            },
            {
                $project: {
                    _id: 0,
                },
            }
        ])
        console.log('totl prft', totalSales?.profit);
        return { profit: totalSales?.profit }

    } catch (err) {
        console.log(err);
    }
}

//To change the order status from admin side
exports.adminChangeOrderStatus = async (orderId, productId, orderStatus) => {
    try {
        if (orderStatus === 'Cancelled') {
            const units = await Orderdb.findOne({ $and: [{ _id: new mongoose.Types.ObjectId(orderId) }, { 'orderItems.productId': productId }] }, { 'orderItems.$': 1, _id: 0 });
            await Productdb.updateOne({ productId: productId }, { $inc: { units: units.orderItems[0].units } });
        }
        return await Orderdb.updateOne({ $and: [{ _id: new mongoose.Types.ObjectId(orderId) }, { "orderItems.productId": productId }] }, { $set: { "orderItems.$.orderStatus": orderStatus } });
    } catch (err) {
        console.log(err);
    }
}

//To return all coupon
exports.getAllCoupon = async () => {
    try {
        return await couponDb.find();
    } catch (err) {
        console.log(err);
    }
}

//To delete a coupon
exports.adminDeleteCoupon = async (couponId) => {
    try {
        return await couponDb.deleteOne({ _id: couponId });
    } catch (err) {
        console.log(err);
    }
}

//To check if a coupon exists or not
exports.checkIfCouponExist = async (code) => {
    try {
        // to check if the given code is already existing or not if the id is eq then it's same coupon
        if (code) {
            return await couponDb.findOne({ code: code });
        }
        // return await Coupondb.findOne({ code });
    } catch (err) {
        throw err;
    }
}

//To get count of all listing in the admin side
exports.adminListCount = async (management) => {
    try {
        if (management == 'Product') {
            return (await Productdb.find({ listed: true })).length;
        }
        if (management == 'Category') {
            return (await categoryDb.find({ status: true })).length;
        }
        if (management == 'User') {
            return await Userdb.countDocuments();
        }
        if (management == 'Order') {
            const totalOrders = await Orderdb.aggregate([
                {
                    $unwind: {
                        path: "$orderItems",
                    },
                },
            ]);

            return totalOrders.length;
        }
        if (management == 'Coupon') {
            return await couponDb.countDocuments();
        }
    } catch (err) {
        console.log(err);
    }
}