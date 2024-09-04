var express = require("express");
var router = express.Router();

var {
  addStudyMaterial,
  getStudyMaterial,
  deleteStudyMaterial,
  addSubjectTopics,
  getSubjectTopics,
  deleteSubjectTopics,
  editSubjectTopics,
  getSubjectTopic,
} = require("../controller/studyMaterialController");

router.post("/addStudyMaterial", addStudyMaterial);
router.post("/getStudyMaterial", getStudyMaterial);
router.post("/deleteStudyMaterial", deleteStudyMaterial);
router.post("/addSubjectTopics", addSubjectTopics);
router.put("/editSubjectTopics", editSubjectTopics);
router.post("/getSubjectTopics", getSubjectTopics);
router.get("/getSubjectTopic", getSubjectTopic);
router.post("/deleteSubjectTopics", deleteSubjectTopics);

module.exports = router;
