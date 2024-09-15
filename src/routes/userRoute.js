let express = require("express");
const multer = require("multer");
let router = express.Router();
const { verifyToken } = require("../middleware/tokenVerify");
let {
  getUserList,
  updateUser,
  getAllUsers,
  deleteUser,
} = require("../controller/userController");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "upload/profile/");
  },

  filename: function (req, file, cb) {
    const ext = file.originalname.split(".").pop();
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "user-" + req.user_id + "." + ext);
  },
});

const upload = multer({ storage: storage });

router.post("/getUserList", getUserList);
router.get("/getAllUsers", getAllUsers);
router.delete("/deleteUser/:id", deleteUser);
router.post(
  "/updateUser",
  verifyToken,
  upload.fields([{ name: "profile_image" }]),
  updateUser
);

module.exports = router;
