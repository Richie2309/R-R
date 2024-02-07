const axios = require('axios');
const Productdb = require('../../model/adminModel/productModel');
const userDbHelper = require('../../dbHelpers/userDbHelpers')

exports.homepage = async (req, res) => {
    const cartProducts = await userDbHelper.getCartItems(req.session.isUserAuth)
    const category = await axios.post(`http://localhost:${process.env.PORT}/api/getCategory/1`);
    delete req.session.orderSucessPage
    res.render('userViews/homepage', { isLoggedIn: req.session.isUserAuth, category: category.data, cartProducts:cartProducts });
}

exports.singleProductCategory = async (req, res) => {
    try {
        const name = req.query.name
        const cartProducts = await userDbHelper.getCartItems(req.session.isUserAuth)
        const product = await axios.get(`http://localhost:${process.env.PORT}/api/productByCategory?name=${name}`)
        const category = await axios.post(`http://localhost:${process.env.PORT}/api/getCategory/1`);
        res.render('userViews/singleProductCategory', { isLoggedIn: req.session.isUserAuth, product: product.data, category: category.data, selectedCategory: name,cartProducts:cartProducts });
    }
    catch (err) {
        console.log(err);
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

        res.render('userViews/userProductDetail', { isLoggedIn: req.session.isUserAuth, product: product.data[0], isCartItem: isCartItem.data, cartProducts:cartProducts })
    } catch (err) {
        console.log(err);
    }
}

exports.userSignupEmailVerify = async (req, res) => {
    res.render('userViews/userSignupEmail', { isUser: req.session.isUser }, (err, html) => {
        if (err) {
            console.log(err);
        }
        delete req.session.isUser
        res.send(html)
    })
}

exports.userSignupOtpVerify = async (req, res) => {

    res.render('userViews/userSignupOtpVerify', { email: req.session.verifyEmail, errorMesg: req.session.err, rTime: req.session.rTime }, (err, html) => {
        if (err) {
            console.log(err);
            return res.status(500).send('Internal Error');
        }
        delete req.session.err;
        delete req.session.rTime;
        res.send(html)
    })
}


exports.userSignup = (req, res) => {
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
}

exports.userSigninEmail = (req, res) => {
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
}

exports.userForgotPass = async (req, res) => {
    res.render('userViews/userForgotPass', { isUser: req.session.isUser }, (err, html) => {
        if (err) {
            console.log(err);
        }
        delete req.session.isUser;
        res.send(html)
    })
}

exports.userEnterOtp = (req, res) => {
    res.render('userViews/userEnterOtp', { email: req.session.verifyEmail, errorMesg: req.session.err, rTime: req.session.rTime }, (err, html) => {
        if (err) {
            console.log(err);
            return res.status(500).send('Internal Error');
        }
        delete req.session.err;
        delete req.session.rTime;
        res.send(html)
    })
}

exports.userResetPassword = (req, res) => {
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
}

exports.userProfile = async (req, res) => {
    const userId = req.session.isUserAuth
    try {
        const cartProducts = await userDbHelper.getCartItems(req.session.isUserAuth)
        const user = await axios.get(`http://localhost:${process.env.PORT}/api/getUserInfo?userId=${userId}`)
        res.render('userViews/userProfile', { user: user.data, cartProducts:cartProducts })
    } catch (err) {
        console.log(err)
    }
}

exports.userEditProfile = async (req, res) => {
    const userId = req.session.isUserAuth
    try {
        const cartProducts = await userDbHelper.getCartItems(req.session.isUserAuth)
        const user = await axios.get(`http://localhost:${process.env.PORT}/api/getUserInfo?userId=${userId}`)
        res.status(200).render('userViews/userEditProfile', {
            user: user.data, cartProducts:cartProducts,
            errMesg: {
                fName: req.session.fName,
                oldPass: req.session.oldPass,
                newPass: req.session.newPass,
                conNewPass: req.session.conNewPass,
            }
        },
            (err, html) => {
                if (err) {
                    console.log("Render error edit profile");
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
        console.log(err);
    }
}

exports.userAddress = async (req, res) => {
    const userId = req.session.isUserAuth
    try {
        const cartProducts = await userDbHelper.getCartItems(req.session.isUserAuth)
        const user = await axios.get(`http://localhost:${process.env.PORT}/api/getAddress?userId=${userId}`)
        res.status(200).render('userViews/userAddress', { userInfo: user.data, cartProducts:cartProducts })
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
}

exports.userAddAddress = async (req, res) => {
    const { returnTo } = req.query
    console.log(returnTo);
    if (returnTo)
        req.session.returnTo = returnTo
    try {
        const cartProducts = await userDbHelper.getCartItems(req.session.isUserAuth)
        res.status(200).render('userViews/userAddAddress',
            {
                sInfo: req.session.sAddress, cartProducts:cartProducts,
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
                    console.log("Render erorr at add address", err);
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
        console.log(err);
    }
}

exports.userEditAddress = async (req, res) => {
    const { returnTo } = req.query
    console.log(returnTo);
    if (returnTo)
        req.session.returnTo = returnTo
    const userId = req.session.isUserAuth
    const addressId = req.query.addressId
    console.log(addressId);
    try {
        const cartProducts = await userDbHelper.getCartItems(req.session.isUserAuth)
        const address = await axios.get(`http://localhost:${process.env.PORT}/api/getAddress?userId=${userId}&addressId=${addressId}`)
        console.log(address.data);
        res.status(200).render('userViews/userEditAddress',
            {
                cartProducts:cartProducts,
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
                    console.log("Render erorr at edit address", err);
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
            }
        )

    } catch (err) {
        console.log("Update query err:", err);
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
        console.log(err);
        res.status(500).send("Internal server error usercart")
    }
}

exports.userCheckout = async (req, res) => {
    const userId = req.session.isUserAuth
    try {
        const user = await axios.get(`http://localhost:${process.env.PORT}/api/getAddress?userId=${userId}`)
        const cartProducts = await userDbHelper.getCartItems(req.session.isUserAuth)
        if (cartProducts.length > 0 && cartProducts[0].pDetail && cartProducts[0].pDetail[0]) {
            res.status(200).render('userViews/userCheckout', { cartProducts: cartProducts, userInfo: user.data });
        } else {
            // Handle the case when cartProducts is empty or doesn't have the expected structure
            res.status(200).render('userViews/userCheckout', { cartProducts: [] });
        }
    } catch (err) {
        res.status(500).send("Internal server error usercheckout")
    }
}


exports.orderSuccess = async (req, res) => {
    try {
        const cartProducts = await userDbHelper.getCartItems(req.session.isUserAuth)
        res.render('userViews/orderSuccess',{cartProducts:cartProducts},(err, html) => {
            if (err) {
                res.send('Internal server err', err);
            }
            delete req.session.orderSucessPage;
            res.send(html);
        })
    } catch (err) {
        console.log(err);
        res.status(500).send('Internal Server Error');
    }
}

exports.userOrderHistory = async (req, res) => {
    try {
        const cartProducts = await userDbHelper.getCartItems(req.session.isUserAuth)
        delete req.session.orderSucessPage
        const orderItems = await userDbHelper.getOrders(req.session.isUserAuth);
        console.log(orderItems);
        res.status(200).render('userViews/userOrderHistory', { orders: orderItems, isCancelled: req.session.isCancelled, cartProducts:cartProducts }, (err, html) => {
            if (err) {
                res.send('Internal server err', err);
            }
            delete req.session.isCancelled;
            res.send(html);
        })
    } catch (err) {
        console.log(err);
    }
}