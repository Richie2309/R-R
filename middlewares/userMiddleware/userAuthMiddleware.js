const Userdb = require('../../server/model/userModel/userModel');
const Cartdb = require('../../server/model/userModel/cartModel')

module.exports = {
    otpVerify: (req, res, next) => {
        if (req.session.verifyOtpPage) {
            next();
        } else {
            res.redirect('/userSignupEmail');
        }
    },


    isUserAuth: (req, res, next) => {
        if (req.session.isUserAuth) {
            res.redirect('/');
        } else {
            next();
        }
    },

    isUserAuth2: (req, res, next) => {
        if (req.session.isUserAuth) {
            next();
        } else {
            res.redirect('/');
        }
    },
    // userLoginResetPassword: (req, res, next) => {
    //     if (req.session.resetPasswordPage) {
    //         next();
    //     } else {
    //         res.redirect('/userSigninEmail');
    //     }
    // },
    isUserBlocked: async (req, res, next) => {
        try {
            if (!req.session.isUserAuth) {
                return next();
            }
            const data = await Userdb.findOne({ _id: req.session.isUserAuth });

            if (!data || !data.userStatus) {
                req.session.userBlockedMesg = true;
                delete req.session.isUserAuth;
                return res.status(200).redirect('/userSigninEmail');
            }
            next();
        } catch (err) {
            console.log('Middle ware err', err);
            res.status(401).send('You are blocked');
        }
    },
    cartItemsTrue: async (req, res, next) => {
        try {
            const userId = req.session.isUserAuth
            const cartItemsExist = await Cartdb.exists({
                userId: userId,
                products: { $exists: true, $not: { $size: 0 } }
            })
            console.log(cartItemsExist);
            if (cartItemsExist) {
                next()
            }
            else {
                res.status(401).redirect('/')
            }
        } catch (err) {
            console.log(err);
            res.status(500).send("Internal server error")
        }

    },
    isAuthOrder: (req, res, next) => {
        if (req.session.orderSucessPage) {
            next()
        } else {
            res.redirect('/')
        }
    }
} 