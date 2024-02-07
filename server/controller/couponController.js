const couponDb = require("../model/userModel/couponModel");
const adminDbHelpers = require("../dbHelpers/adminDbHelpers");
const userDbHelpers = require("../dbHelpers/userDbHelpers");

//Add coupon
exports.adminAddCoupon = async (req, res) => {
    try {
        const code = req.body.code ? req.body.code.trim().toUpperCase() : undefined;
        const discount = req.body.discount ? req.body.discount.trim() : undefined;
        const minPrice = req.body.minPrice ? req.body.minPrice.trim() : undefined;
        const maxUse = req.body.maxUse ? req.body.maxUse.trim() : undefined;
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
        if (!maxUse) {
            req.session.maxUse = `This Field is required`;
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
        if (req.session.code || req.session.discount || req.session.maxUse || req.session.minPrice || req.session.expiry) {
            return res.status(401).redirect('/adminAddCoupon');
        }

        const newCoupon = new couponDb({
            code,
            discount,
            minPrice,
            maxUse,
            expiry
        })
        await newCoupon.save();
        res.status(200).redirect('/adminCouponManage');
    } catch (err) {
        console.log('coupon controller err in add coupon', err);
        res.status(500).send('Internal server error');
    }
}

//To delete a coupon
exports.adminDeleteCoupon = async (req,res) => {
    try {
        const couponId = req.query.couponId;
        await adminDbHelpers.adminDeleteCoupon(couponId);
        res.status(200).send('deleted');
    } catch (err) {
        console.log('coupon controller err in delete coupon', err);
    }
}