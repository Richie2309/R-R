const mongoose = require('mongoose')
const walletSchema = new mongoose.Schema({
    userId: {
        type: mongoose.SchemaTypes.ObjectId,
        required: true,
    },
    balance: {
        type: Number,
        default: 0
    },
    transactions: [
        {
            amount: {
                type: Number
            },
            date: {
                type: Date,
                default: Date.now
            }
        }
    ]
})

const wallet = mongoose.model('walletdbs', walletSchema)

module.exports = wallet

