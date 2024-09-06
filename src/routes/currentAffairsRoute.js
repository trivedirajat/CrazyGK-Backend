var express = require("express");
var router = express.Router();

const multer = require("multer");

var {
  addCurrentAffairs,
  getCurrentAffairs,
  deleteCurrentAffairs,
  currentAffairsStatusUpdate,
  getAllCurrentAffairs,
} = require("../controller/currentAffairsController");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/assets/currentAffairs/");
  },

  filename: function (req, file, cb) {
    const ext = file.originalname.split(".").pop();
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "currentAffairs-" + uniqueSuffix + "." + ext);
  },
});

const upload = multer({ storage: storage });

router.post(
  "/addCurrentAffairs",
  upload.fields([{ name: "image" }]),
  addCurrentAffairs
);
router.post("/getCurrentAffairs", getCurrentAffairs);
router.post("/getallCurrentAffairs", getAllCurrentAffairs);
router.post("/deleteCurrentAffairs", deleteCurrentAffairs);
router.post("/currentAffairsStatusUpdate", currentAffairsStatusUpdate);

module.exports = router;
