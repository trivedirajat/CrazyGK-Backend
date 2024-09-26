var express = require("express");
var router = express.Router();

const multer = require("multer");

var {
  addWhatsNew,
  getWhatsNew,
  deleteWhatsNew,
  editWhatsNew,
  getwhatsnewById,
} = require("../controller/whatsNewController");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/assets/whatsnew/");
  },

  filename: function (req, file, cb) {
    const ext = file.originalname.split(".").pop();
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "wn-" + uniqueSuffix + "." + ext);
  },
});

const upload = multer({ storage: storage });

router.post("/addWhatsNew", upload.fields([{ name: "image" }]), addWhatsNew);
router.get("/getwhatsnew", getWhatsNew);
router.get("/getwhatsnewbyid/:id", getwhatsnewById);
router.put(
  "/editwhatsnew/:id",
  upload.fields([{ name: "image" }]),
  editWhatsNew
);
router.delete("/deletewhatsnew/:id", deleteWhatsNew);
module.exports = router;
