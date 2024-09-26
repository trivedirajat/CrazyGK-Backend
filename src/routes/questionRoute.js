var express = require("express");
var router = express.Router();
var { verifyRole } = require("../middleware/tokenVerify");

var {
  addQuestion,
  editQuestion,
  deleteQuestion,
  getAllQuestion,
  getQuestionsListbySubjectid,
} = require("../controller/questionController");

router.get("/getquestion", getAllQuestion);
router.get("/getquestion/:id", getAllQuestion);
router.get(
  "/getQuestionsListbySubjectid/:subjectId",
  getQuestionsListbySubjectid
);
router.post("/addQuestion", addQuestion);
router.put("/editQuestion/:id", editQuestion);
router.delete("/deleteQuestion/:id", deleteQuestion);

// router.get('/getPlan', getPlan);

module.exports = router;
