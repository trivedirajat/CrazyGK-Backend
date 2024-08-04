const mongoose = require("mongoose");
const dataScema = new mongoose.Schema({
  user_name: {
    type: String,
  },
  name: {
    type: String,
  },
  email: {
    type: String,
  },
  password: {
    type: String,
  },
  gender: {
    type: String,
    enum: ["male", "female"],
    default: 'male'
  },
  birth_date: {
    type: String,
  },
  profile_image: {
    type: String,
  },
  address: {
    type: String,
  },
  city: {
    type: String,
  },
  state: {
    type: String,
  },
  country: {
    type: String,
  },
  pincode: {
    type: String,
  },
  mobile: {
    type: Number,
  },
  otp: {
    type: Number,
  },
  status: {
    type: Boolean,
    default: true,
  },
  profile: {
    type: String,
  },
  user_type: {
    type: String,
    enum: ["admin", "user"],
    default: 'user'
  },
  verified: {
    type: Boolean,
    default: false,
  },
  createdDate: {
    type: Date,
    default: Date.now,
    required: true,
  },
});
module.exports = mongoose.model("user", dataScema);
