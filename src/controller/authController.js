const user = require("../models/user");
const {
  hashPassword,
  comparePassword,
  generateAccessToken,
  verifyRefreshToken,
  uploadAndSaveImage,
  isValidMobileNumber,
} = require("../helper/helper");
const FirebaseAdmin = require("../helper/FirebaseAdmin");
const { ObjectId } = require("mongodb");
const {
  sendOTP,
  generateOrderId,
  resendOTP,
  verifyOTP,
} = require("../helper/otpless");
const isValidNumber = (str) => !isNaN(str) && !isNaN(parseFloat(str));
exports.verifyUser = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({
      status: 400,
      message: "User ID is required",
    });
  }

  try {
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        status: 400,
        message: "Invalid User ID format",
      });
    }

    const userExists = await user.exists({ _id: new ObjectId(id) });

    if (userExists) {
      return res.status(200).json({
        status: 200,
        message: "User verified successfully",
      });
    } else {
      return res.status(404).json({
        status: 404,
        message: "User not found",
      });
    }
  } catch (error) {
    console.error("Error verifying user:", error);
    return res.status(500).json({
      status: 500,
      message: "Internal server error",
    });
  }
};
exports.checkMobile = async (req, res) => {
  try {
    const { mobile } = req.body;

    if (!mobile) {
      return res.status(400).send({
        status: 400,
        message: "Mobile number cannot be empty.",
      });
    }

    const userExists = await user.exists({ mobile });

    if (userExists) {
      return res.status(200).send({
        status: 200,
        message: "Mobile already exists.",
      });
    } else {
      return res.status(200).send({
        status: 200,
        message: "Mobile is available.",
      });
    }
  } catch (error) {
    console.error("Error:", error.message);
    return res.status(500).send({
      status: 500,
      message: "Internal Server Error",
    });
  }
};
exports.createAdminUser = async () => {
  const email = "admin@example.com";
  const password = "admin123";

  let admin = await user.findOne({ email });
  if (!admin) {
    const hashedPassword = await hashPassword(password);
    const newAdmin = new user({
      email,
      password: hashedPassword,
      role: "admin",
    });
    await newAdmin.save();
    console.log("Admin user created successfully");
  } else {
    console.log("Admin user already exists");
  }
};
// exports.signup = async (req, res) => {
//   try {
//     const { mobile, user_type = "user" } = req.body;

//     if (!mobile) {
//       return res.status(400).send({
//         status: 400,
//         message: "Mobile and user type cannot be empty.",
//       });
//     }

//     const existingUser = await user.findOne({ mobile }).exec();
//     if (existingUser) {
//       return res.status(409).send({
//         status: 409,
//         message: "This mobile number is already registered.",
//       });
//     }

//     const otp = 111111; // For production, replace with actual OTP generation logic
//     req.body.otp = otp;

//     const newUser = await user.create(req.body);
//     if (newUser) {
//       // await sendemails(email, user_name, otp, 1); // Uncomment and implement this line if email sending is required

//       return res.status(201).send({
//         status: 201,
//         message: "Registration success",
//         data: newUser,
//       });
//     } else {
//       return res.status(500).send({
//         status: 500,
//         message: "Registration failed",
//       });
//     }
//   } catch (error) {
//     console.error("Error:", error.message);
//     return res.status(500).send({
//       status: 500,
//       message: "Internal Server Error",
//     });
//   }
// };
exports.signup = async (req, res) => {
  try {
    const { mobile, email } = req.body;

    if (!mobile && !email) {
      return res.status(400).send({
        status: 400,
        message: "Mobile or email must be provided.",
      });
    }

    const existingUser = await user
      .findOne({ $or: [{ mobile }, { email }] })
      .exec();
    if (existingUser) {
      return res.status(409).send({
        status: 409,
        message: "This mobile number or email is already registered.",
      });
    }
    const OTPID = generateOrderId();
    const OtpRes = await sendOTP({
      phoneNumber: `91${mobile}`,
      orderId: OTPID,
    });
    console.log(`OTP for ${mobile || email}: ${OtpRes.orderId}`);
    if (OtpRes.orderId) {
      return res.status(201).send({
        status: 201,
        message: "OTP sent successfully",
        OTPID: OtpRes.orderId,
      });
    }

    return res.status(404).send({
      status: 404,
      message: "OTP sending failed",
    });
  } catch (error) {
    console.error("Error:", error.message);
    return res.status(500).send({
      status: 500,
      message: "Internal Server Error",
    });
  }
};

// Resend OTP Controller
exports.resentOtp = async (req, res) => {
  try {
    const { mobile, email, OTPID } = req.body;

    if (!mobile && !email) {
      return res.status(400).send({
        status: 400,
        message: "Mobile or email must be provided.",
      });
    }

    let query = {};
    if (mobile) query.mobile = mobile;
    if (email) query.email = email;

    const { errorMessage, orderId } = await resendOTP({
      orderId: OTPID,
    });
    console.log(`OTP for ${mobile || email}: ${orderId}`);
    console.log("🚀 ~ exports.resentOtp= ~ success:", orderId);
    if (orderId) {
      return res.status(200).send({
        status: 200,
        message: "OTP  sent successfully",
      });
    }
    return res.status(400).send({
      status: 400,
      message: "OTP sending failed. You can resend up to 3 times.",
      error: errorMessage,
    });
  } catch (error) {
    console.error("Error:", error.message);
    return res.status(500).send({
      status: 500,
      message: "Internal Server Error",
    });
  }
};

exports.verifyOTPAndSignup = async (req, res) => {
  const { otp, user_type = "user", data, OTPID } = req.body;
  const { mobile, email } = data;
  if (!otp || (!mobile && !email)) {
    return res.status(400).send({
      status: 400,
      message: "OTP and either mobile or email are required.",
    });
  }

  try {
    const query = {};
    if (mobile) query.mobile = mobile;
    if (email) query.email = email;

    // Check OTP validity
    const { isOTPVerified: otpResponse, reason } = await verifyOTP({
      phoneNumber: `91${mobile}`,
      orderId: OTPID,
      otp,
    });
    console.log("🚀 ~ exports.verifyOTPAndSignup= ~ otpResponse:", otpResponse);
    if (!otpResponse) {
      return res.status(400).send({
        status: 400,
        message: "Invalid or expired OTP.",
        error: reason,
      });
    }

    // OTP is valid, proceed with user creation
    const newUser = new user({
      ...data,
      user_type,
      verified: true,
      mobile: mobile || null,
      email: email || null,
    });

    // Save new user
    await newUser.save();

    return res.status(201).send({
      status: 201,
      message: "User successfully created.",
      data: newUser,
    });
  } catch (error) {
    console.error("Error:", error.message);
    return res.status(500).send({
      status: 500,
      message: "Internal Server Error",
    });
  }
};

exports.verifyOTPAndResetPassword = async (req, res) => {
  const { emailOrMobile, otp, newPassword, OTPID } = req.body;

  if (!emailOrMobile || !newPassword) {
    return res.status(400).send({
      status: 400,
      message: "Email or mobile number and new password are required.",
    });
  }

  try {
    const query = isValidNumber(emailOrMobile)
      ? { mobile: emailOrMobile }
      : { email: emailOrMobile };

    const userToUpdate = await user.findOne(query).exec();

    if (!userToUpdate) {
      return res.status(404).send({
        status: 404,
        message: "User not found.",
      });
    }

    const { isOTPVerified: otpResponse, reason } = await verifyOTP({
      phoneNumber: `91${userToUpdate.mobile}`,
      orderId: OTPID,
      otp,
    });

    console.log(
      "🚀 ~ exports.verifyOTPAndResetPassword= ~ otpResponse:",
      otpResponse
    );
    if (!otpResponse) {
      return res.status(400).send({
        status: 400,
        message: "Invalid or expired OTP.",
        error: reason,
      });
    }

    // Update the user's password (hashing is handled by the pre-save hook)
    userToUpdate.password = newPassword;
    await userToUpdate.save();

    return res.status(200).send({
      status: 200,
      message: "Password has been reset successfully.",
    });
  } catch (error) {
    console.error("Error:", error.message);
    return res.status(500).send({
      status: 500,
      message: "Internal Server Error.",
    });
  }
};

const findUser = async (criteria) => {
  return await user.findOne(criteria).exec();
};

const validateUserCredentials = async (user, password) => {
  const isPasswordValid = await comparePassword(user.password, password);
  if (!isPasswordValid) {
    throw new Error("Invalid credentials");
  }
  return user.generateAuthToken();
};

exports.login = async (req, res) => {
  const { mobile, email, password, user_type } = req.body;

  if (user_type === "admin") {
    if (!password || !email) {
      return res.status(400).send({
        status: 400,
        message: "Password or email are required.",
      });
    }
  } else if (!password || (!mobile && !email)) {
    return res.status(400).send({
      status: 400,
      message: "Password and either mobile or email are required.",
    });
  }

  if (mobile && !isValidMobileNumber(mobile)) {
    return res.status(400).send({
      status: 400,
      message: "Invalid mobile number",
    });
  }

  try {
    const criteria =
      user_type === "admin"
        ? { email, user_type: "admin" }
        : { mobile, user_type: "user" };

    const userfound = await findUser(criteria);
    console.log("🚀 ~ exports.login= ~ criteria:", criteria);

    if (!userfound) {
      return res.status(404).send({
        status: 404,
        message: "User not found.",
      });
    }

    // Validate the user's credentials
    const { accessToken, refreshToken } = await validateUserCredentials(
      userfound,
      password
    );

    return res.status(200).send({
      status: 200,
      message: "Login successful.",
      data: {
        accessToken,
        refreshToken,
        user: { ...userfound.toObject(), password: undefined },
      },
    });
  } catch (error) {
    if (error.message === "Invalid credentials") {
      return res.status(401).send({
        status: 401,
        message: error.message,
      });
    }

    console.error("Error:", error.message);
    return res.status(500).send({
      status: 500,
      message: "Internal Server Error",
    });
  }
};

exports.forgotPassword = async (req, res) => {
  const { emailOrMobile } = req.body;

  if (!emailOrMobile) {
    return res.status(400).send({
      status: 400,
      message: "Email or mobile number is required.",
    });
  }

  try {
    let query;
    if (isValidNumber(emailOrMobile)) {
      query = { mobile: emailOrMobile };
    } else {
      query = { email: emailOrMobile };
    }

    const userRecord = await user.findOne(query).exec();

    if (!userRecord) {
      return res.status(404).send({
        status: 404,
        message:
          "User with the provided email or mobile number does not exist.",
      });
    }

    const OTPID = generateOrderId();
    const OtpRes = await sendOTP({
      phoneNumber: `91${query.mobile}`,
      orderId: OTPID,
    });
    console.log(`OTP for ${query.mobile || query.email}: ${OtpRes.orderId}`);
    if (OtpRes.orderId) {
      return res.status(200).send({
        status: 200,
        message:
          "OTP sent successfully. Please verify the OTP to reset your password.",
        OTPID: OtpRes.orderId,
      });
    }
  } catch (error) {
    console.error("Error:", error.message);
    return res.status(500).send({
      status: 500,
      message: "Internal Server Error.",
    });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const user_id = req.user_id;
    const { old_password, new_password } = req.body;

    // Check for user authorization
    if (!user_id) {
      return res.status(403).json({
        status: 403,
        message: "User not authorized.",
      });
    }

    // Validate passwords
    if (!old_password || !new_password) {
      return res.status(400).json({
        status: 400,
        message: "Old password and new password cannot be empty.",
      });
    }

    // Find the user
    const userRecord = await user.findById(user_id).exec();

    if (!userRecord) {
      return res.status(404).json({
        status: 404,
        message: "User does not exist.",
      });
    }

    // Check if the old password is correct
    const isPasswordCorrect = await comparePassword(
      userRecord.password,
      old_password
    );

    if (!isPasswordCorrect) {
      return res.status(400).json({
        status: 400,
        message: "Old password is incorrect.",
      });
    }

    // Hash and update the new password
    const hashedPassword = await hashPassword(new_password);
    await user.findByIdAndUpdate(user_id, { password: hashedPassword });

    return res.status(200).json({
      status: 200,
      message: "Password updated successfully.",
    });
  } catch (error) {
    console.error("Error:", error.message);
    return res.status(500).json({
      status: 500,
      message: "Internal Server Error.",
    });
  }
};

exports.getUserList = async (req, res) => {
  try {
    const user_id = req.user_id;
    if (!user_id) {
      return res.status(403).send({
        status: 403,
        message: "User not authorised.",
      });
    }

    const result = await User.find({ user_type: "user" }).select({
      password: -1, // Exclude sensitive field
      otp: -1, // Exclude OTP field
      verified: -1, // Exclude verification status
      createdDate: -1, // Exclude creation date
    });

    if (result.length > 0) {
      return res.status(200).send({
        status: 200,
        message: "success.",
        data: result,
        base_url: process.env.BASEURL,
      });
    } else {
      return res.status(201).send({
        status: 201,
        message: "failed.",
      });
    }
  } catch (error) {
    console.log("error", error.message);
    return res.status(501).send({
      status: 501,
      message: "Internal Server Error.",
    });
  }
};
exports.getUserById = async (req, res) => {
  try {
    const { _id: authUserId } = req.user;
    const { id: clientID } = req.params;
    const user_id = authUserId || clientID;
    if (!user_id) {
      return res.status(403).send({
        status: 403,
        message: "User not authorised.",
      });
    }

    const result = await user.findById(user_id).select({
      password: 0,
      otp: 0,
      createdDate: 0,
      googleId: 0,
    });

    if (result) {
      return res.status(200).send({
        status: 200,
        message: "success.",
        data: result,
        base_url: process.env.BASEURL,
      });
    } else {
      return res.status(400).send({
        status: 400,
        message: "User not found.",
      });
    }
  } catch (error) {
    console.log("error", error.message);
    return res.status(501).send({
      status: 501,
      message: "Internal Server Error.",
    });
  }
};
exports.SignrefreshToken = async (req, res) => {
  const { refresh_token } = req.body;

  if (!refresh_token) {
    return res.status(400).json({ error: "No refresh token provided." });
  }

  try {
    const UserDetails = await verifyRefreshToken(refresh_token);
    if (!UserDetails) {
      return res.status(440).json({ error: "Invalid refresh token." });
    }
    const accessToken = generateAccessToken(UserDetails);
    console.log("🚀 ~ exports.SignrefreshToken= ~ UserDetails:", UserDetails);

    res.json({ accessToken });
  } catch (error) {
    console.error("🚀 ~ exports.SignrefreshToken= ~ error:", error);
    return res.status(440).json({ error: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  const { user_id } = req.body;
  const userId = user_id || req.user._id;
  const {
    email,
    mobile,
    name,
    gender,
    birth_date,
    address,
    city,
    state,
    country,
    pincode,
  } = req.body;

  try {
    const userToUpdate = await user.findById(userId).select({
      password: 0,
      otp: 0,
      createdDate: 0,
      googleId: 0,
    });
    if (!userToUpdate) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (email || mobile) {
      const existingUser = await user.findOne({
        $or: [{ email }, { mobile }],
        _id: { $ne: userId },
      });

      if (existingUser) {
        return res.status(400).json({
          message:
            "Email or mobile number is already in use by another account.",
        });
      }
    }
    let uploadedImage = null;
    if (req.files && req.files.profile) {
      const uploadResult = await uploadAndSaveImage(
        req,
        "profile",
        "public/assets/profile",
        userToUpdate?.profile_image
      );
      if (!uploadResult.success) {
        return res
          .status(500)
          .json({ status: 500, message: uploadResult.message });
      }

      uploadedImage = uploadResult.imageUrl;
      console.log(
        "🚀 ~ exports.updateProfile= ~ uploadedImage:",
        req.files.profile
      );
    }
    userToUpdate.name = name || userToUpdate.name;
    userToUpdate.email = email || userToUpdate.email;
    userToUpdate.mobile = mobile || userToUpdate.mobile;
    userToUpdate.gender = gender || userToUpdate.gender;
    userToUpdate.birth_date = birth_date || userToUpdate.birth_date;
    userToUpdate.address = address || userToUpdate.address;
    userToUpdate.city = city || userToUpdate.city;
    userToUpdate.state = state || userToUpdate.state;
    userToUpdate.country = country || userToUpdate.country;
    userToUpdate.pincode = pincode || userToUpdate.pincode;
    userToUpdate.profile_image = uploadedImage || userToUpdate.profile_image;

    await userToUpdate.save();

    return res.status(200).json({
      message: "Profile updated successfully",
      data: userToUpdate,
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return res.status(500).json({
      message: "Server error",
    });
  }
};

exports.GoogleAuth = async (req, res) => {
  const { idToken } = req.body;

  try {
    const decodedToken = await FirebaseAdmin.auth().verifyIdToken(idToken);
    const { email, name, picture, phone_number, email_verified, uid } =
      decodedToken;

    const IsUserFound = await user.findOne({ email, name }).select({
      password: 0,
      otp: 0,
      createdDate: 0,
      googleId: 0,
    });

    if (!IsUserFound) {
      const newUser = new user({
        googleId: uid,
        email,
        name,
        profile_image: picture,
        mobile: phone_number || null,
        verified: email_verified,
        user_type: "user",
        password: Math.floor(10000000 + Math.random() * 90000000).toString(), // for handle duplicate password error user can change password later
      });
      await newUser.save();

      const { accessToken, refreshToken } = newUser.generateAuthToken();

      return res.status(200).send({
        status: 200,
        message: "Signup successful.",
        data: {
          accessToken,
          refreshToken,
          user: newUser,
        },
      });
    }

    const { accessToken, refreshToken } = IsUserFound.generateAuthToken();
    return res.status(200).send({
      status: 200,
      message: "Login successful.",
      data: {
        accessToken,
        refreshToken,
        user: { ...IsUserFound.toObject(), password: undefined }, // Exclude password
      },
    });
  } catch (error) {
    console.error("Error verifying ID token:", error);
    res.status(401).json({
      message: "Unauthorized - Invalid ID token",
    });
  }
};
