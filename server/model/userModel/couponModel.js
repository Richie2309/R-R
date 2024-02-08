const mongoose = require('mongoose')

const couponSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique:true
    },
    discount: {
        type: Number,
        required: true
    },
    minPrice: {
        type: Number,
        required: true
    },
    expiry: {
        type: Date,
        required: true
    }
})

const couponDb = mongoose.model('coupondbs', couponSchema);

module.exports = couponDb;