var express = require("express");
var router = express.Router();

const multer = require("multer");

var {
  deleteDalyVocab,
  getDailyVocab,
  getDailyVocabById,
  addDailyVocab,
  editDailyVocab,
} = require("../controller/dalyVocabController");

router.get("/getDalyVocab", getDailyVocab);
router.get("/getDalyVocabById/:id", getDailyVocabById);
router.post("/addDalyVocab", addDailyVocab);
router.put("/editDalyVocab/:id", editDailyVocab);
router.delete("/deleteDalyVocab/:id", deleteDalyVocab);

module.exports = router;
