const couponDb = require("../model/userModel/couponModel");
const adminDbHelpers = require("../dbHelpers/adminDbHelpers");
const userDbHelpers = require("../dbHelpers/userDbHelpers");

//Add coupon
exports.adminAddCoupon = async (req, res) => {
    try {
        const code = req.body.code ? req.body.code.trim().toUpperCase() : undefined;
        const discount = req.body.discount ? req.body.discount.trim() : undefined;
        const minPrice = req.body.minPrice ? req.body.minPrice.trim() : undefined;
        const expiry = req.body.expiry ? req.body.expiry.trim() : undefined;

        if (!code) {
            req.session.code = `This Field is required`;
        }
        if (!discount) {
            req.session.discount = `This Field is required`;
        }
        if (!minPrice) {
            req.session.minPrice = `This Field is required`;
        }

        if (!expiry) {
            req.session.expiry = `This Field is required`;
        }
        if (discount && discount > 90 || discount < 1) {
            req.session.discount = `Discount should between 1% to 90%`;
        }
        if (code) {
            const isExisting = await adminDbHelpers.checkIfCouponExist(code);
            if (isExisting) {
                req.session.code = 'This coupon already exist';
            }
        }
        if (req.session.code || req.session.discount || req.session.minPrice || req.session.expiry) {
            return res.status(401).redirect('/adminAddCoupon');
        }

        const newCoupon = new couponDb({
            code,
            discount,
            minPrice,
            expiry
        })
        await newCoupon.save();
        res.status(200).redirect('/adminCouponManage');
    } catch (err) {
        res.status(500).render('errorPages/500page')
    }
}

//To delete a coupon
exports.adminDeleteCoupon = async (req, res) => {
    try {
        const couponId = req.query.couponId;
        await adminDbHelpers.adminDeleteCoupon(couponId);
        res.status(200).send('deleted');
    } catch (err) {
        res.status(500).render('errorPages/500page')
    }
}

//User apply coupon
exports.userApplyCoupon = async (req, res) => {
    try {
        const couponCode = req.query.couponCode
        const coupon = await couponDb.findOne({ code: couponCode })

        const cartProducts = await userDbHelpers.getCartItems(req.session.isUserAuth);

        const total = cartProducts.reduce((total, value) => {
            return total += Math.round((value.pDetail[0].price * value.products.units));
        }, 0);

        const currentDate = new Date();
        if (!coupon) {
            const invalid = 'Invalid coupon'
            res.status(200).json({ error: invalid });
        }
        if (coupon) {
            if (coupon.expiry < currentDate) {
                const exp = 'Coupon expired'
                res.status(200).json({ error: exp });
            } else if (coupon.minPrice > total) {
                const min = `Minimum purchase price is ${coupon.minPrice}`
                res.status(200).json({ error: min });
            } else {
                req.session.appliedCouponCode=coupon.code
                const discount = total * (coupon.discount / 100);
                const afterCoupon = total - discount;
                req.session.totalPrice= Math.round(afterCoupon)
                req.session.couponDiscount=coupon.discount
                res.status(200).json({ afterCoupon: afterCoupon, discount: discount });
            }
        }
        // res.redirect(`/userCheckout`);
    } catch (err) {
        res.status(500).render('errorPages/500page')
    }
}