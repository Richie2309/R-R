const Razorpay = require('razorpay')
const walletDb = require('../model/userModel/walletModel');
const userDbHelper = require('../dbHelpers/userDbHelpers')


var instance = new Razorpay({
    key_id: 'rzp_test_IwnjcUU9Jdcian',
    key_secret: 'IVbX06LxB8oMcuyvF6RZFhxt'
})

exports.addWalletMoney = async (req, res) => {
    try {
        req.session.walletAddAmount = req.body.amount

        const amount = Number(req.body.amount) * 100
        const options = {
            amount: amount,
            currency: "INR",
            receipt: "wallet",
        };

        const wallet = await instance.orders.create(options);

        return res.status(200).json({
            success: true,
            msg: 'money added',
            key_id: instance.key_id,
            wallet: wallet
        })
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Internal server error Wallet");
    }
}


exports.addWalletPaymentSuccessfull = async (req, res) => {
    try {
        const crypto = require("crypto");
        const hmac = crypto.createHmac("sha256", instance.key_secret);
        hmac.update(
            req.body.razorpay_order_id + "|" + req.body.razorpay_payment_id
        );
        if (hmac.digest("hex") === req.body.razorpay_signature) {
            await walletDb.updateOne({ userId: req.session.isUserAuth }, { $inc: { balance: req.session.walletAddAmount } }, { upsert: true })
            const d = await walletDb.findOneAndUpdate({ userId: req.session.isUserAuth },
                {
                    $push: {
                        'transactions': {
                            amount: req.session.walletAddAmount,
                        }
                    }
                })
            res.status(200).redirect('/orderSuccess')
        } else {
            return res.send("Payment Failed");
        }
    } catch (err) {
        console.error("order razorpay err", err);
        res.status(500).send('Internal server error')
    }
}
