const { UserDetail } = require("otpless-node-js-auth-sdk");

const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendOtp = async (mobile, email) => {
  try {
    const otp = generateOtp();

    // const otpEntry = new OTP({
    //   otp,
    //   mobile: mobile || null,
    //   email: email || null,
    //   expiresAt: new Date(Date.now() + 20 * 60 * 1000),
    // });

    // await otpEntry.save();

    console.log(`OTP for ${mobile || email}: ${otp}`);

    // Use your existing logic to send OTP via SMS or email
    const response = await UserDetail.sendOTP(
      mobile,
      email,
      "SMS",
      "your_hash",
      "your_order_id",
      20 * 60,
      6,
      "your_client_id",
      "your_client_secret"
    );

    return response; // Return the response if needed for logging or confirmation
  } catch (error) {
    console.error("Error sending OTP:", error.message);
    throw error; // Propagate the error for handling in the calling function
  }
};
