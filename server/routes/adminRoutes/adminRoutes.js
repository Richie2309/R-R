const express = require('express')
const route = express.Router();
const multer = require('../../controller/adminController/multer')

const adminAuthMiddleware = require('../../../middlewares/adminMiddleware/adminAuthMiddleware');
const adminRender = require('../../services/adminServices/adminRender');
const adminController = require('../../controller/adminController/adminController');
const productController = require('../../controller/productController')
const categoryController = require('../../controller/categoryController')
const orderController = require('../../controller/orderController')
const couponController = require('../../controller/couponController')

//Sgn in and out
route.get('/adminSignin', adminAuthMiddleware.noAdminAuth, adminRender.adminSignin)

route.post('/adminSignin', adminController.adminSignin)

route.get('/adminLogout', adminController.adminLogout)

//Dahsboard
route.get('/adminHome', adminAuthMiddleware.isAdminAuth, adminRender.adminHome);
route.post('/api/getDetailsChart', adminAuthMiddleware.isAdminAuth, adminController.getDetailsChart)

route.get('/downloadSalesReport', adminAuthMiddleware.isAdminAuth, adminController.downloadSalesReport)

// Product Manage//
route.get('/adminProductManage', adminAuthMiddleware.isAdminAuth, adminRender.adminProductManage);

route.get('/adminAddProduct', adminAuthMiddleware.isAdminAuth, adminRender.adminAddProduct);
route.post('/adminAddProduct', multer.store.array('images', 4), productController.adminAddProducts);

route.get('/adminUnlistedProduct', adminAuthMiddleware.isAdminAuth, adminRender.adminUnlistedProduct);
route.get('/adminUnlistedProduct/:id', adminAuthMiddleware.isAdminAuth, productController.adminUnlistedProduct);

route.get('/adminRestoreProduct/:id', adminAuthMiddleware.isAdminAuth, productController.adminRestoreProduct);

route.get('/adminUpdateProduct/:id', adminAuthMiddleware.isAdminAuth, adminRender.adminUpdateProduct)
route.post('/adminUpdateProduct/:id', multer.store.array('images', 4), adminAuthMiddleware.isAdminAuth, productController.adminUpdateProduct)

route.post('/adminUpdateProduct/:productId/deleteImage/:imageIndex', productController.deleteProductImage);

//Category Manage
route.get('/adminCategoryManage', adminAuthMiddleware.isAdminAuth, adminRender.adminCategoryManage);

route.get('/adminAddCategory', adminAuthMiddleware.isAdminAuth, adminRender.adminAddCategory);
route.post('/adminAddCategory', categoryController.adminAddCategory)

route.get('/adminUnlistedCategory', adminAuthMiddleware.isAdminAuth, adminRender.adminUnlistedCategory)
route.get('/adminUnlistCategory/:id', adminAuthMiddleware.isAdminAuth, categoryController.adminUnlistedCategory)

route.get('/adminRestoreCategory/:id', adminAuthMiddleware.isAdminAuth, categoryController.adminRestoreCategory);

route.get('/adminUpdateCategory', adminAuthMiddleware.isAdminAuth, adminRender.adminUpdateCategory)
route.post('/adminUpdateCategory', adminAuthMiddleware.isAdminAuth, categoryController.adminUpdateCategory)

//User Manage
route.get('/adminUserManage', adminAuthMiddleware.isAdminAuth, adminRender.adminUserManage);

route.get('/adminUserStatus/:id/:block', adminAuthMiddleware.isAdminAuth, adminController.adminUserStatus);

//Order Manage
route.get('/adminOrderManage', adminAuthMiddleware.isAdminAuth, adminRender.adminOrderManage)

route.get('/adminOrderDetail', adminAuthMiddleware.isAdminAuth, adminRender.orderManage)

route.post('/adminChangeOrderStatus', adminAuthMiddleware.isAdminAuth, orderController.adminChangeOrderStatus)

//Coupon Manage
route.get('/adminCouponManage', adminAuthMiddleware.isAdminAuth, adminRender.adminCouponManage)

route.get('/adminAddCoupon', adminAuthMiddleware.isAdminAuth, adminRender.adminAddCoupon)

route.post('/adminAddCoupon', adminAuthMiddleware.isAdminAuth, couponController.adminAddCoupon)

route.delete('/adminDeleteCoupon', adminAuthMiddleware.isAdminAuth, couponController.adminDeleteCoupon);

//api 
route.post('/api/getAllUser', adminController.getAllUser);

route.get('/api/getProduct/:value', productController.showProduct)

route.get('/api/singleProduct/:value', productController.singleProduct);

route.get('/api/getSingleCategory', categoryController.singleCategory)

route.post('/api/getCategory/:value', categoryController.getCategory);


module.exports = route;