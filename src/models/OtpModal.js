const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema(
  {
    otp: { type: String, required: true },
    mobile: { type: String, required: true },
    email: { type: String, default: null },
    expiresAt: {
      type: Date,
      required: true,
      default: Date.now,
      index: { expires: "20m" },
    },
  },
  { timestamps: true }
);

otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const OTP = mongoose.model("OTP", otpSchema);

module.exports = OTP;
