const mongodb = require('mongoose');

const productSchema = new mongodb.Schema({
    pName: {
        type: String,
        required: true
    },
    brand: {
        type: String,
        required: true//objid
    },
    category: {
        type: String,
        required: true//objid 
    },
    pDescription: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    units: {
        type: Number,
        required: true
    },
    images: [
        {
            type: String
        }
    ],
    listed: {
        type: Boolean,
        default: true
    }
})

const Productdb=mongodb.model('Productdb', productSchema);
module.exports=Productdb