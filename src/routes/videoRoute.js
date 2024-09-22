var express = require("express");
var router = express.Router();

var {
  addVideo,
  getvideo,
  videoDelete,
  getVideoById,
  editVideo,
} = require("../controller/videoController");

router.post("/addVideo", addVideo);
router.get("/getAllVideo", getvideo);
router.delete("/videoDelete/:id", videoDelete);
router.get("/getVideoById/:id", getVideoById);
router.put("/editVideo/:id", editVideo);
module.exports = router;
