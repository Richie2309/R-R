const axios = require('axios');
const Productdb = require('../../model/adminModel/productModel');
const userDbHelper = require('../../dbHelpers/userDbHelpers')

exports.homepage = async (req, res) => {
    try {
        const cartProducts = await userDbHelper.getCartItems(req.session.isUserAuth)
        const recentProducts = await userDbHelper.recentProducts()
        const category = await axios.post(`http://localhost:${process.env.PORT}/api/getCategory/1`);
        delete req.session.orderSucessPage
        res.render('userViews/homepage', { isLoggedIn: req.session.isUserAuth, category: category.data, cartProducts: cartProducts, recentProducts });
    } catch (err) {
        res.status(500).render('errorPages/500page')
    }
}

exports.singleProductCategory = async (req, res) => {
    try {
        const search = req.query.search;
        const name = req.query.name || "";
        const currentPage = parseInt(req.query.page) || 1;
        const cartProducts = await userDbHelper.getCartItems(req.session.isUserAuth);
        const { result: products, totalPages } = await userDbHelper.getProductByCategory(name, currentPage, req.query);
        res.render('userViews/singleProductCategory', { isLoggedIn: req.session.isUserAuth, product: products, selectedCategory: name, cartProducts: cartProducts, currentPage: currentPage, totalPages: totalPages });
    }
    catch (err) {
        res.status(500).render('errorPages/500page')
    }
}


exports.userProductDetail = async (req, res) => {
    try {
        const productId = req.query.productId
        const userId = req.session.isUserAuth;
        const cartProducts = await userDbHelper.getCartItems(req.session.isUserAuth)
        // api to fetch details of the single product
        const product = await axios.get(`http://localhost:${process.env.PORT}/api/getProductDetail?productId=${productId}`);
        //checking if product is in the cart or not
        const isCartItem = await axios.post(`http://localhost:${process.env.PORT}/api/getCartItems?productId=${productId}&userId=${userId}`);

        res.render('userViews/userProductDetail', { isLoggedIn: req.session.isUserAuth, product: product.data[0], isCartItem: isCartItem.data, cartProducts: cartProducts })
    } catch (err) {
        res.status(500).render('errorPages/500page')
    }
}

exports.userSignupEmailVerify = async (req, res) => {
    try {
        res.render('userViews/userSignupEmail', { isUser: req.session.isUser }, (err, html) => {
            if (err) {
                console.log(err);
            }
            delete req.session.isUser
            res.send(html)
        })
    } catch (err) {
        res.status(500).render('errorPages/500page')
    }
}

exports.userSignupOtpVerify = async (req, res) => {
    try {
        res.render('userViews/userSignupOtpVerify', { email: req.session.verifyEmail, errorMesg: req.session.err, rTime: req.session.rTime }, (err, html) => {
            if (err) {
                console.log(err);
                return res.status(500).send('Internal Error');
            }
            delete req.session.err;
            delete req.session.rTime;
            res.send(html)
        })
    } catch (err) {
        res.status(500).render('errorPages/500page')
    }
}


exports.userSignup = (req, res) => {
    try {
        const signinfo = { name: req.session.fName, pass: req.session.pass, conPass: req.session.conPass, bothPass: req.session.bothPass }
        res.status(200).render('userViews/userSignup', { signinfo: signinfo }, (err, html) => {
            if (err) {
                console.log(err);
            }
            delete req.session.fName;
            delete req.session.pass;
            delete req.session.conPass;
            delete req.session.bothPass;
            res.send(html)
        });
    } catch (err) {
        res.status(500).render('errorPages/500page')
    }
}

exports.userSigninEmail = (req, res) => {
    try {
        const signinfo = { email: req.session.email, pass: req.session.pass, noUser: req.session.noUser, wrongPass: req.session.wrongPass, isBlock: req.session.userBlockedMesg }
        res.render('userViews/userSigninEmail', { signinfo: signinfo }, (err, html) => {
            if (err) {
                console.log(err);
            }
            delete req.session.email;
            delete req.session.pass;
            delete req.session.noUser;
            delete req.session.wrongPass;
            delete req.session.userBlockedMesg;
            res.send(html)
        })
    } catch (err) {
        res.status(500).render('errorPages/500page')
    }
}

exports.userForgotPass = async (req, res) => {
    try {
        res.render('userViews/userForgotPass', { isUser: req.session.isUser }, (err, html) => {
            if (err) {
                console.log(err);
            }
            delete req.session.isUser;
            res.send(html)
        })
    } catch (err) {
        res.status(500).render('errorPages/500page')
    }
}

exports.userEnterOtp = (req, res) => {
    try {
        res.render('userViews/userEnterOtp', { email: req.session.verifyEmail, errorMesg: req.session.err, rTime: req.session.rTime }, (err, html) => {
            if (err) {
                console.log(err);
                return res.status(500).send('Internal Error');
            }
            delete req.session.err;
            delete req.session.rTime;
            res.send(html)
        })
    } catch (err) {
        res.status(500).render('errorPages/500page')
    }
}

exports.userResetPassword = (req, res) => {
    try {
        res.render('userViews/userResetPassword', { pass: req.session.pass, conPass: req.session.conPass, bothPass: req.session.bothPass }, (err, html) => {
            if (err) {
                console.log(err);
                return res.status(500).send('Internal Error');
            }
            delete req.session.pass;
            delete req.session.conPass;
            delete req.session.bothPass;
            res.send(html)
        })
    } catch (err) {
        res.status(500).render('errorPages/500page')
    }
}

exports.userProfile = async (req, res) => {
    const userId = req.session.isUserAuth
    try {
        const cartProducts = await userDbHelper.getCartItems(req.session.isUserAuth)
        const user = await axios.get(`http://localhost:${process.env.PORT}/api/getUserInfo?userId=${userId}`)
        res.render('userViews/userProfile', { user: user.data, cartProducts: cartProducts })
    } catch (err) {
        res.status(500).render('errorPages/500page')
    }
}

exports.userEditProfile = async (req, res) => {
    const userId = req.session.isUserAuth
    try {
        const cartProducts = await userDbHelper.getCartItems(req.session.isUserAuth)
        const user = await axios.get(`http://localhost:${process.env.PORT}/api/getUserInfo?userId=${userId}`)
        res.status(200).render('userViews/userEditProfile', {
            user: user.data, cartProducts: cartProducts,
            errMesg: {
                fName: req.session.fName,
                oldPass: req.session.oldPass,
                newPass: req.session.newPass,
                conNewPass: req.session.conNewPass,
            }
        },
            (err, html) => {
                if (err) {
                    return res.send("Internal server error");
                }
                delete req.session.fName;
                delete req.session.oldPass;
                delete req.session.newPass;
                delete req.session.conNewPass;

                res.send(html);
            }
        )
    } catch (err) {
        res.status(500).render('errorPages/500page')
    }
}

exports.userAddress = async (req, res) => {
    const userId = req.session.isUserAuth
    try {
        const cartProducts = await userDbHelper.getCartItems(req.session.isUserAuth)
        const user = await axios.get(`http://localhost:${process.env.PORT}/api/getAddress?userId=${userId}`)
        res.status(200).render('userViews/userAddress', { userInfo: user.data, cartProducts: cartProducts })
    } catch (err) {
        res.status(500).render('errorPages/500page')
    }
}

exports.userAddAddress = async (req, res) => {
    const { returnTo } = req.query
    if (returnTo)
        req.session.returnTo = returnTo
    try {
        const cartProducts = await userDbHelper.getCartItems(req.session.isUserAuth)
        res.status(200).render('userViews/userAddAddress',
            {
                sInfo: req.session.sAddress, cartProducts: cartProducts,
                errMesg: {
                    fName: req.session.fName,
                    pincode: req.session.pincode,
                    locality: req.session.locality,
                    address: req.session.address,
                    district: req.session.district,
                    state: req.session.state
                },
            },
            (err, html) => {
                if (err) {
                    return res.status(500).send("Internal server error");
                }
                delete req.session.fName;
                delete req.session.pincode;
                delete req.session.locality;
                delete req.session.address;
                delete req.session.district;
                delete req.session.state;
                delete req.session.sAddress;

                res.send(html);
            }
        )
    } catch (err) {
        res.status(500).render('errorPages/500page')
    }
}

exports.userEditAddress = async (req, res) => {
    const { returnTo } = req.query
    if (returnTo)
        req.session.returnTo = returnTo
    const userId = req.session.isUserAuth
    const addressId = req.query.addressId
    try {
        const cartProducts = await userDbHelper.getCartItems(req.session.isUserAuth)
        const address = await axios.get(`http://localhost:${process.env.PORT}/api/getAddress?userId=${userId}&addressId=${addressId}`)
        res.status(200).render('userViews/userEditAddress',
            {
                cartProducts: cartProducts,
                sInfo: req.session.sAddress,
                addressInfo: address.data,
                errMesg: {
                    fName: req.session.fName,
                    pincode: req.session.pincode,
                    locality: req.session.locality,
                    address: req.session.address,
                    district: req.session.district,
                    state: req.session.state,
                    exist: req.session.exist
                },
            },
            (err, html) => {
                if (err) {
                    return res.status(500).send("Internal server error");
                }
                delete req.session.fName;
                delete req.session.pincode;
                delete req.session.locality;
                delete req.session.address;
                delete req.session.district;
                delete req.session.state;
                delete req.session.exist;
                delete req.session.sAddress;

                res.send(html);
            })
    } catch (err) {
        res.status(500).render('errorPages/500page')
    }
}

exports.userCart = async (req, res) => {
    try {
        const cartProducts = await userDbHelper.getCartItems(req.session.isUserAuth)
        if (cartProducts.length > 0 && cartProducts[0].pDetail && cartProducts[0].pDetail[0]) {
            res.status(200).render('userViews/userCart', { cartProducts: cartProducts });
        } else {
            // Handle the case when cartProducts is empty or doesn't have the expected structure
            res.status(200).render('userViews/userCart', { cartProducts: [] });
        }
    } catch (err) {
        res.status(500).render('errorPages/500page')
    }
}

exports.userCheckout = async (req, res) => {
    const userId = req.session.isUserAuth
    try {
        const user = await axios.get(`http://localhost:${process.env.PORT}/api/getAddress?userId=${userId}`);
        const walletInfo = await userDbHelper.getWallet(req.session.isUserAuth)
        const cartProducts = await userDbHelper.getCartItems(req.session.isUserAuth);
        const coupons = await userDbHelper.getAvailableCoupons()

        const total = cartProducts.reduce((total, value) => {
            return total += Math.round((value.pDetail[0].price * value.products.units));
        }, 0);

        let walletErrorMessage = '';
        let walletSuccessMessage = '';
        if (walletInfo && walletInfo.balance < total) {
            walletErrorMessage = 'Insufficient balance in wallet';
        }
        if (walletInfo && walletInfo.balance >= total) {
            walletSuccessMessage = 'You can order with wallet money';
        }


        if (cartProducts.length > 0 && cartProducts[0].pDetail && cartProducts[0].pDetail[0]) {
            res.status(200).render('userViews/userCheckout', {
                cartProducts: cartProducts,
                userInfo: user.data,
                total,
                walletInfo,
                walletErrorMessage,
                walletSuccessMessage,
                coupons: coupons || []
            }, (err, html) => {
                if (err) {
                    console.log(err);
                    return res.status(500).send("Internal server on err html error");
                }
                delete req.session.totalPrice;

                res.send(html);
            });
        } else {
            // Handle the case when cartProducts is empty or doesn't have the expected structure
            res.status(200).render('userViews/userCheckout', { cartProducts: [], coupons: [] });
        }
    } catch (error) {
        res.status(500).render('errorPages/500page')
    }
}

exports.orderSuccess = async (req, res) => {
    try {
        const cartProducts = await userDbHelper.getCartItems(req.session.isUserAuth)
        res.render('userViews/orderSuccess', { cartProducts: cartProducts }, (err, html) => {
            if (err) {
                res.send('Internal server err', err);
            }
            delete req.session.orderSucessPage;
            res.send(html);
        })
    } catch (err) {
        res.status(500).render('errorPages/500page')
    }
}

//To see the order history in user side
exports.userOrderHistory = async (req, res) => {
    try {
        const cartProducts = await userDbHelper.getCartItems(req.session.isUserAuth)
        delete req.session.orderSucessPage
        const orderItems = await userDbHelper.getOrders(req.session.isUserAuth);
        res.status(200).render('userViews/userOrderHistory', { orders: orderItems, isReturned: req.session.isReturned, isCancelled: req.session.isCancelled, cartProducts: cartProducts }, (err, html) => {
            if (err) {
                return res.status(500).send('Internal server err');
            }
            delete req.session.isCancelled;
            delete req.session.isReturned;
            return res.status(200).send(html);
        });
    } catch (err) {
        res.status(500).render('errorPages/500page')
    }
}

//To see order deails page
exports.userOrderDetail = async (req, res) => {
    try {
        const cartProducts = await userDbHelper.getCartItems(req.session.isUserAuth)
        const orderDetail = await userDbHelper.getOrderDetails(req.query.orderId, req.query.productId)
        res.status(200).render('userViews/userOrderDetail', { cartProducts: cartProducts, orderDetail })
    } catch (err) {
        res.status(500).render('errorPages/500page')
    }
}

//User Wallet
exports.userWallet = async (req, res) => {
    try {
        const cartProducts = await userDbHelper.getCartItems(req.session.isUserAuth)
        const walletInfo = await userDbHelper.getWallet(req.session.isUserAuth)
        res.render('userViews/userWallet', { walletInfo, cartProducts });
    } catch (err) {
        res.status(500).render('errorPages/500page')
    }
}