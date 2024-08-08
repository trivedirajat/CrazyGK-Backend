var user = require("../models/user");
var {
  hashPassword,
  comparePassword,
  s3UploadImage,
} = require("../helper/helper");
var sendemails = require("../helper/mailSend");
const { jwtToken } = require("../helper/helper");
const { isNumber } = require("razorpay/dist/utils/razorpay-utils");
var { ObjectId } = require("mongodb");

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

exports.signup = async (req, res) => {
  try {
    const { mobile, user_type } = req.body;

    if (!mobile || !user_type) {
      return res.status(400).send({
        status: 400,
        message: "Mobile and user type cannot be empty.",
      });
    }

    const existingUser = await user.findOne({ mobile }).exec();
    if (existingUser) {
      return res.status(409).send({
        status: 409,
        message: "This mobile number is already registered.",
      });
    }

    const otp = 111111; // For production, replace with actual OTP generation logic
    req.body.otp = otp;

    const newUser = await user.create(req.body);
    if (newUser) {
      // await sendemails(email, user_name, otp, 1); // Uncomment and implement this line if email sending is required

      return res.status(201).send({
        status: 201,
        message: "Registration success",
        data: newUser,
      });
    } else {
      return res.status(500).send({
        status: 500,
        message: "Registration failed",
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

exports.login = async (req, res) => {
  try {
    const { mobile, password, user_type } = req.body;

    if (!mobile || !password) {
      return res.status(400).send({
        status: 400,
        message: "Mobile and password cannot be empty.",
      });
    }

    const userRecord = await user.findOne({ mobile }).exec();

    if (!userRecord) {
      return res.status(404).send({
        status: 404,
        message: "User not found.",
      });
    }

    if (!userRecord.verified) {
      return res.status(403).send({
        status: 403,
        message: "Your account is not verified.",
      });
    }

    if (!userRecord.password || !userRecord.user_name) {
      return res.status(400).send({
        status: 400,
        message: "Username or password not set up correctly.",
      });
    }

    const isPasswordValid = await comparePassword(
      userRecord.password,
      password
    );
    if (!isPasswordValid) {
      return res.status(401).send({
        status: 401,
        message: "Invalid password.",
      });
    }

    if (userRecord.user_type !== user_type) {
      return res.status(400).send({
        status: 400,
        message: "User type mismatch.",
      });
    }

    if (userRecord.profile_image) {
      userRecord.profile_image = `${process.env.BASEURL}${process.env.PROFILE}${userRecord.profile_image}`;
    }

    const token = await jwtToken(
      userRecord._id,
      userRecord.user_name,
      userRecord.email,
      userRecord.user_type,
      "logged"
    );

    return res.status(200).send({
      status: 200,
      message: "Login successful.",
      data: { userDetail: userRecord, token },
    });
  } catch (error) {
    console.error("Error:", error.message);
    return res.status(500).send({
      status: 500,
      message: "Internal Server Error",
    });
  }
};

exports.otpVerify = async (req, res) => {
  try {
    const { mobile, otp } = req.body;

    if (!mobile || !otp) {
      return res.status(400).send({
        status: 400,
        message: "Mobile number and OTP cannot be empty.",
      });
    }

    const userRecord = await user.findOne({ mobile }).exec();

    if (!userRecord) {
      return res.status(404).send({
        status: 404,
        message: "User not found.",
      });
    }

    if (userRecord.otp !== otp) {
      return res.status(400).send({
        status: 400,
        message: "Incorrect OTP, please enter the correct OTP.",
      });
    }

    await user.updateOne({ mobile }, { otp: null, verified: true });

    let token = null;
    if (!userRecord.verified) {
      token = await jwtToken(
        userRecord._id,
        userRecord.user_name,
        userRecord.email,
        userRecord.user_type,
        "logged"
      );
    }

    return res.status(200).send({
      status: 200,
      message: "OTP verification successful.",
      data: userRecord,
      token,
    });
  } catch (error) {
    console.error("Error:", error.message);
    return res.status(500).send({
      status: 500,
      message: "Internal Server Error",
    });
  }
};

exports.resentOtp = async (req, res) => {
  try {
    const { mobile } = req.body;

    if (!mobile) {
      return res.status(400).send({
        status: 400,
        message: "Mobile number cannot be empty.",
      });
    }

    const userRecord = await user.findOne({ mobile }).exec();

    if (!userRecord) {
      return res.status(404).send({
        status: 404,
        message: "User with the provided mobile number does not exist.",
      });
    }

    const otp = 111111; // Replace with actual OTP generation logic
    const updateResult = await user.findOneAndUpdate(
      { _id: userRecord._id },
      { otp }
    );

    if (updateResult) {
      // await sendemails(email, userRecord.user_name, otp, 2); // Uncomment and implement this line if email sending is required

      return res.status(200).send({
        status: 200,
        message: "OTP sent successfully.",
      });
    } else {
      return res.status(500).send({
        status: 500,
        message: "Failed to send OTP.",
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

exports.forgotPassword = async (req, res) => {
  try {
    const { mobile } = req.body;

    if (!mobile) {
      return res.status(400).send({
        status: 400,
        message: "Mobile number cannot be empty.",
      });
    }

    const userRecord = await user.findOne({ mobile }).exec();

    if (!userRecord) {
      return res.status(404).send({
        status: 404,
        message: "User with the provided mobile number does not exist.",
      });
    }

    if (!userRecord.password || !userRecord.user_name) {
      return res.status(400).send({
        status: 400,
        message: "User details are not properly set up.",
      });
    }

    const otp = 1111; // Replace with actual OTP generation logic
    const updateResult = await user.findOneAndUpdate(
      { _id: userRecord._id },
      { otp }
    );

    if (updateResult) {
      // await sendemails(userRecord.email, userRecord.user_name, otp, 3); // Uncomment and implement this line if email sending is required

      return res.status(200).send({
        status: 200,
        message: "OTP sent successfully.",
      });
    } else {
      return res.status(500).send({
        status: 500,
        message: "Failed to send OTP.",
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

exports.updatePassword = async (req, res) => {
  try {
    const { mobile, password } = req.body;

    if (!mobile || !password) {
      return res.status(400).send({
        status: 400,
        message: "Mobile number and password cannot be empty.",
      });
    }

    const isMobile = isNumber(mobile); // Assuming isNumber is a function to check if mobile is valid
    const query = isMobile ? { mobile } : { email: mobile };
    const userRecord = await user.findOne(query).exec();

    if (!userRecord) {
      return res.status(404).send({
        status: 404,
        message: `User with the provided ${
          isMobile ? "mobile" : "email"
        } does not exist.`,
      });
    }

    if (userRecord.otp) {
      return res.status(400).send({
        status: 400,
        message: "Please verify OTP before updating the password.",
      });
    }

    const hashedPassword = await hashPassword(password);
    await user.updateOne({ _id: userRecord._id }, { password: hashedPassword });

    return res.status(200).send({
      status: 200,
      message: "Password updated successfully.",
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
