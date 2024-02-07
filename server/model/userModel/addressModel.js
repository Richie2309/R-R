const mongoose = require('mongoose');

const userAddressSchema = new mongoose.Schema({
    userId: {
        type: mongoose.SchemaTypes.ObjectId,
        required: true
    },
    address: [
        {
            fullName: {
                type: String,
                required: true
            },
            pincode: {
                type: Number,
                required: true
            },
            locality: {
                type: String,
                required: true
            },
            address: {
                type: String,
                required: true
            },
            district: {
                type: String,
                required: true
            },
            state: {
                type: String,
                required: true
            },
            structuredAddress: {
                type: String,
                required: true
            }
        }
    ],
    defaultAddress: {
        type: mongoose.SchemaTypes.ObjectId
    }
});

const userAddressdb = mongoose.model('userAddressdb', userAddressSchema);

module.exports = userAddressdb;
