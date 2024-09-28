const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {
  hashPassword,
  generateAccessToken,
  generateRefreshToken,
} = require("../helper/helper");

// Define your schema
const dataSchema = new mongoose.Schema({
  user_name: {
    type: String,
  },
  name: {
    type: String,
  },
  email: {
    type: String,
    unique: true,
  },
  password: {
    type: String,
    required: function () {
      return !this.googleId;
    },
  },
  googleId: {
    type: String,
    required: false,
  },
  gender: {
    type: String,
    enum: ["male", "female", "others", "not specified"],
    default: "not specified",
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
    unique: true,
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
    default: "user",
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

// Add method to generate JWT tokens
dataSchema.methods.generateAuthToken = function () {
  const accessToken = generateAccessToken(this);
  const refreshToken = generateRefreshToken(this);

  return { accessToken, refreshToken };
};

dataSchema.pre("save", async function (next) {
  if (!this.googleId && (this.isModified("password") || this.isNew)) {
    this.password = await hashPassword(this.password);
  }
  next();
});

module.exports = mongoose.model("user", dataSchema);
