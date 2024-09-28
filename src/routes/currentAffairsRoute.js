var express = require("express");
var router = express.Router();

const multer = require("multer");

var {
  addCurrentAffairs,
  getCurrentAffairs,
  deleteCurrentAffairs,
  currentAffairsStatusUpdate,
  getAllCurrentAffairs,
  getCurrentAffairsById,
  editCurrentAffairs,
} = require("../controller/currentAffairsController");

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "public/assets/currentAffairs/");
//   },

//   filename: function (req, file, cb) {
//     const ext = file.originalname.split(".").pop();
//     const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
//     cb(null, "currentAffairs-" + uniqueSuffix + "." + ext);
//   },
// });

// const upload = multer({ storage: storage });

router.post("/addCurrentAffairs", addCurrentAffairs);
router.get("/getallCurrentAffairs", getCurrentAffairs);
router.get("/getCurrentAffairsById/:id", getCurrentAffairsById);
router.post("/getallCurrentAffairs", getAllCurrentAffairs);
router.delete("/deleteCurrentAffairs/:id", deleteCurrentAffairs);
router.post("/currentAffairsStatusUpdate", currentAffairsStatusUpdate);
router.put("/editCurrentAffairs/:id", editCurrentAffairs);
module.exports = router;
