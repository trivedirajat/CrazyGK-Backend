var express = require('express');
var router = express.Router();

var {addReview, getReview, reviewDelete} = require('../controller/reviewController');

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

router.post('/addReview', upload.fields([{ name: "user_profile" }]), addReview);
router.post('/getReview', getReview);
router.post('/reviewDelete', reviewDelete);

module.exports = router;
