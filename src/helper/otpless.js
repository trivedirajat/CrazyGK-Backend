const { UserDetail } = require("otpless-node-js-auth-sdk");
const {
  OTPLESS_CLIENT_ID,
  OTPLESS_CLIENT_SECRET,
} = require("../../utils/config");

const generateOrderId = () => {
  const timestamp = Date.now();
  const randomNum = Math.floor(Math.random() * 1000);
  return `OTPID-${timestamp}-${randomNum}`;
};
const clientId = OTPLESS_CLIENT_ID;
const clientSecret = OTPLESS_CLIENT_SECRET;
const sendOTP = async ({
  phoneNumber,
  email = "",
  channel = "SMS",
  hash = "",
  orderId,
  expiry = 120,
  otpLength = 6,
}) => {
  try {
    const response = await UserDetail.sendOTP(
      phoneNumber,
      email,
      channel,
      hash,
      orderId,
      expiry,
      otpLength,
      clientId,
      clientSecret
    );

    return response;
  } catch (error) {
    console.error("Error sending OTP:", error);
    return { success: false, message: error.message };
  }
};

const resendOTP = async ({ orderId }) => {
  try {
    const response = await UserDetail.resendOTP(
      orderId,
      clientId,
      clientSecret
    );
    return response;
  } catch (error) {
    console.error("Error resending OTP:", error);
    return { success: false, message: error.message };
  }
};

const verifyOTP = async ({ phoneNumber, orderId, otp, email = "" }) => {
  try {
    const response = await UserDetail.verifyOTP(
      email,
      phoneNumber,
      orderId,
      otp,
      clientId,
      clientSecret
    );
    return response;
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return { success: false, message: error.message };
  }
};

module.exports = {
  sendOTP,
  resendOTP,
  verifyOTP,
  generateOrderId,
};
