var express = require('express');
var router = express.Router();
const { verifyToken } = require('../middleware/tokenVerify');


var {checkMobile, login, signup, updateProfile, otpVerify, resentOtp, forgotPassword, updatePassword, changePassword, getUserList} = require('../controller/authController');
const multer = require('multer');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "public/assets/blog/");
    },
  
    filename: function (req, file, cb) {
        const ext = file.originalname.split('.').pop();
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, "profile-" + uniqueSuffix + '.' + ext);
    },
  });
  const upload = multer({ storage: storage });

router.post('/checkMobile', checkMobile);
router.post('/login', login);
router.post('/signup', signup);
router.post('/otpVerify', otpVerify);
router.post('/resentOtp', resentOtp);
router.post('/forgotPassword', forgotPassword);
router.post('/updatePassword', updatePassword);
router.post('/changePassword', verifyToken, changePassword);
router.post('/getUserList', verifyToken, getUserList);
router.post('/updateProfile', verifyToken, upload.fields([{ name: "profile" }]), updateProfile);

module.exports = router;
