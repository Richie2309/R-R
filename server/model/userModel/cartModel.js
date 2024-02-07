const mongodb = require("mongoose");
const product =require('../adminModel/productModel')

const cartSchema = new mongodb.Schema({
  userId: {
    type: mongodb.SchemaTypes.ObjectId,
    required: true,
    ref:'User'
  },
  products: [
    {
      productId: {
        type: mongodb.SchemaTypes.ObjectId,
        required: true,
        ref:'Productdb'
      },
      units: {
        type: Number, 
        default: 1
      }
    },
  ],
});

const Cartdb = mongodb.model('Cartdb', cartSchema);

module.exports = Cartdb