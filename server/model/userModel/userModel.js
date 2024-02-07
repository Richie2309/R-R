const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  userStatus: {
    type: Boolean,
    required: true
  },
  userLstatus: {
    type: Boolean,
    default: false,
  }
});

const User = mongoose.model('User', userSchema);

module.exports = User;
