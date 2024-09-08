var express = require("express");
var router = express.Router();

var {
  addQuiz,
  getAllQuiz,
  UpdateQuiz,
  deleteQuiz,
  getQuizWithSubject,
  getQuizBySubjectId,
  startQuiz,
  getQuizByFeatured,
} = require("../controller/quizController");

router.post("/addQuiz", addQuiz);
router.post("/getQuizs", getAllQuiz);
router.get("/getQuizs", getQuizWithSubject);
router.get("/getQuizsbyFeatured", getQuizByFeatured);
router.get("/getQuizsbySubject/:id", getQuizBySubjectId);
router.get("/startQuiz/:id", startQuiz);
router.put("/updateQuiz/:id", UpdateQuiz);
router.delete("/deleteQuiz/:id", deleteQuiz);
// router.get('/getPlan', getPlan);

module.exports = router;
