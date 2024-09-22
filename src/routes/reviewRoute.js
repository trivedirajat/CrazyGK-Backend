var express = require("express");
var router = express.Router();

var {
  addReview,
  getReviews,
  reviewDelete,
  createReview,
  getReviewbyId,
  updateReview,
} = require("../controller/reviewController");

const multer = require("multer");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/assets/reviews");
  },

  filename: function (req, file, cb) {
    const ext = file.originalname.split(".").pop();
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "profile-" + uniqueSuffix + "." + ext);
  },
});
const upload = multer({ storage: storage });

router.post(
  "/addReview",
  upload.fields([{ name: "user_profile" }]),
  createReview
);
// router.post("/addReview", upload.fields([{ name: "user_profile" }]), addReview);
router.get("/getReviews", getReviews);
router.get("/getreviewbyid/:id", getReviewbyId);
router.put(
  "/editReview/:id",
  upload.fields([{ name: "user_profile" }]),
  updateReview
);
router.delete("/reviewDelete/:id", reviewDelete);

module.exports = router;
