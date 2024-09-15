var express = require("express");
var router = express.Router();
const { verifyToken } = require("../middleware/tokenVerify");

var {
  checkMobile,
  login,
  signup,
  updateProfile,
  resentOtp,
  forgotPassword,
  changePassword,
  getUserList,
  verifyOTPAndSignup,
  verifyOTPAndResetPassword,
  verifyUser,
  SignrefreshToken,
} = require("../controller/authController");
const multer = require("multer");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/assets/blog/");
  },

  filename: function (req, file, cb) {
    const ext = file.originalname.split(".").pop();
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "profile-" + uniqueSuffix + "." + ext);
  },
});
const upload = multer({ storage: storage });
router.get("/verify/:id", verifyUser);
router.post("/checkMobile", checkMobile);
router.post("/login", login);
router.post("/signup", signup);
router.post("/otpVerify", verifyOTPAndSignup);
router.post("/resentOtp", resentOtp);
router.post("/forgotPassword", forgotPassword);
router.post("/updatePassword", verifyOTPAndResetPassword);
router.post("/changePassword", verifyToken, changePassword);
router.post("/getUserList", verifyToken, getUserList);
router.post("/refresh-token", SignrefreshToken);
router.post(
  "/updateProfile",
  verifyToken,
  upload.fields([{ name: "profile" }]),
  updateProfile
);

module.exports = router;
