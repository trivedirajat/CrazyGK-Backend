var express = require("express");
var router = express.Router();

const multer = require("multer");

var {
  addJob,
  getJob,
  deleteJob,
  UpdateJobs,
  getJobById,
} = require("../controller/jobController");

router.post("/addJob", addJob);
router.get("/getJob", getJob);
router.get("/getJobById/:id", getJobById);
router.put("/editJob/:id", UpdateJobs);
router.delete("/deleteJob/:id", deleteJob);

module.exports = router;
