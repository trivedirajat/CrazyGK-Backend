var user = require("../models/user");
var {
  hashPassword,
  comparePassword,
  s3UploadImage,
  generateAccessToken,
  verifyRefreshToken,
} = require("../helper/helper");
var sendemails = require("../helper/mailSend");
const { jwtToken } = require("../helper/helper");
const { isNumber } = require("razorpay/dist/utils/razorpay-utils");
var { ObjectId } = require("mongodb");
const OTP = require("../models/OtpModal");
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

    const otp = generateOtp();

    const otpEntry = new OTP({
      otp,
      mobile: mobile || null,
      email: email || null,
      expiresAt: new Date(Date.now() + 20 * 60 * 1000), // OTP valid for 20 minutes
    });

    await otpEntry.save();

    console.log(`OTP for ${mobile || email}: ${otp}`);

    return res.status(201).send({
      status: 201,
      message: "OTP sent successfully",
    });
  } catch (error) {
    console.error("Error:", error.message);
    return res.status(500).send({
      status: 500,
      message: "Internal Server Error",
    });
  }
};

// Function to generate a new OTP
const generateOtp = () => {
  // Implement your OTP generation logic here
  return 111111; // Replace with actual OTP generation logic
};

// Resend OTP Controller
exports.resentOtp = async (req, res) => {
  try {
    const { mobile, email } = req.body;

    if (!mobile && !email) {
      return res.status(400).send({
        status: 400,
        message: "Mobile or email must be provided.",
      });
    }

    let query = {};
    if (mobile) query.mobile = mobile;
    if (email) query.email = email;

    const otp = generateOtp();

    const existingOtp = await OTP.findOne(query).exec();

    if (existingOtp) {
      existingOtp.otp = otp;
      existingOtp.expiresAt = new Date(Date.now() + 20 * 60 * 1000); // OTP valid for 20 minutes
      await existingOtp.save();
    } else {
      // Create new OTP record
      const otpEntry = new OTP({
        otp,
        mobile: mobile || null,
        email: email || null,
        expiresAt: new Date(Date.now() + 20 * 60 * 1000), // OTP valid for 20 minutes
      });
      await otpEntry.save();
    }

    console.log(`OTP for ${mobile || email}: ${otp}`);

    return res.status(200).send({
      status: 200,
      message: "OTP  sent successfully",
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
  const { otp, user_type = "user", data } = req.body;
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
    const otpEntry = await OTP.findOne(query).exec();
    if (!otpEntry || otpEntry.otp !== otp || otpEntry.expiresAt < Date.now()) {
      return res.status(400).send({
        status: 400,
        message: "Invalid or expired OTP.",
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

    // Delete OTP entry after successful user creation
    await OTP.findOneAndDelete(query).exec();

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

exports.updateProfile = async (req, res) => {
  try {
    const user_id = req.user_id;
    let { user_name, password } = req.body;

    if (!user_name) {
      return res.status(400).send({
        status: 400,
        message: "Username cannot be empty.",
      });
    }

    if (req.files && req.files.profile && req.files.profile.length > 0) {
      const profileFilename = req.files.profile[0].filename;
      const bucketFilePath = `profile/${profileFilename}`;
      const localFilePath = `${req.files.profile[0].destination}${profileFilename}`;

      await s3UploadImage(localFilePath, bucketFilePath);
      req.body.profile = bucketFilePath;
    }

    if (password) {
      req.body.password = await hashPassword(password);
    }

    const updateResult = await user.updateOne(
      { _id: new ObjectId(user_id) },
      req.body
    );

    if (updateResult.nModified > 0) {
      const updatedUser = await user
        .findOne({ _id: new ObjectId(user_id) })
        .exec();
      const token = await jwtToken(
        updatedUser._id,
        user_name,
        updatedUser.email,
        updatedUser.user_type,
        "logged"
      );

      return res.status(200).send({
        status: 200,
        message: "Update success",
        data: updatedUser,
        token: token,
        base_url: process.env.BASEURL,
      });
    } else {
      return res.status(500).send({
        status: 500,
        message: "Update failed",
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
exports.forgotPassword = async (req, res) => {
  const { mobile, email } = req.body;

  if (!mobile && !email) {
    return res.status(400).send({
      status: 400,
      message: "Mobile or email must be provided.",
    });
  }

  try {
    // Check if the user exists
    const existingUser = await user
      .findOne({
        $or: [{ mobile }, { email }],
      })
      .exec();
    if (!existingUser) {
      return res.status(404).send({
        status: 404,
        message: "User with this mobile number or email does not exist.",
      });
    }

    // Generate OTP for resetting password
    const otp = generateOTP();
    // const otp = crypto.randomInt(100000, 999999).toString();

    const otpEntry = new OTP({
      otp,
      mobile: mobile || null,
      email: email || null,
      expiresAt: new Date(Date.now() + 20 * 60 * 1000),
    });

    await otpEntry.save();

    console.log(`OTP for ${mobile || email}: ${otp}`);

    return res.status(200).send({
      status: 200,
      message:
        "OTP sent successfully. Please verify the OTP to reset your password.",
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
  const { emailOrMobile, otp, newPassword } = req.body;

  if (!otp || !newPassword || !emailOrMobile) {
    return res.status(400).send({
      status: 400,
      message: "OTP, new password, and email or mobile number are required.",
    });
  }

  try {
    let query;
    if (isValidNumber(emailOrMobile)) {
      query = { mobile: emailOrMobile };
    } else {
      query = { email: emailOrMobile };
    }

    // Find the OTP entry
    const otpEntry = await OTP.findOne({
      otp,
      $or: [{ mobile: query.mobile || null }, { email: query.email || null }],
    }).exec();

    if (!otpEntry) {
      return res.status(400).send({
        status: 400,
        message: "Invalid or expired OTP.",
      });
    }

    // Check if OTP is expired
    if (otpEntry.expiresAt < new Date()) {
      return res.status(400).send({
        status: 400,
        message: "OTP has expired.",
      });
    }

    // Find the user to update
    const userToUpdate = await user.findOne(query).exec();

    if (!userToUpdate) {
      return res.status(404).send({
        status: 404,
        message: "User not found.",
      });
    }

    // Update the user's password directly (hashing is handled by the pre-save hook)
    userToUpdate.password = newPassword;
    await userToUpdate.save();

    await OTP.deleteOne({ _id: otpEntry._id });

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

  try {
    const criteria =
      user_type === "admin"
        ? { email, user_type: "admin" }
        : {
            mobile,
            user_type: "user",
          };

    const userfound = await findUser(criteria);
    console.log("🚀 ~ exports.login= ~ criteria:", criteria);

    if (!userfound) {
      return res.status(404).send({
        status: 404,
        message: "User not found.",
      });
    }

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

    // Generate a secure OTP
    const otp = generateOtp();

    // Create a new OTP entry
    const otpEntry = new OTP({
      otp,
      mobile: userRecord.mobile || null,
      email: userRecord.email || null,
      expiresAt: new Date(Date.now() + 20 * 60 * 1000), // OTP valid for 20 minutes
    });

    await otpEntry.save();

    return res.status(200).send({
      status: 200,
      message: "OTP sent successfully.",
    });
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
exports.SignrefreshToken = async (req, res) => {
  const { refresh_token } = req.body;

  if (!refresh_token) {
    return res.status(401).json({ error: "No refresh token provided." });
  }

  try {
    const UserDetails = await verifyRefreshToken(refresh_token);
    const accessToken = generateAccessToken(UserDetails);

    res.json({ accessToken });
  } catch (error) {
    console.error("🚀 ~ /refresh-token ~ error:", error);
    return res.status(401).json({ error: error.message });
  }
};
