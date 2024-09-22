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
  getStudyById,
  getAllStudyMaterials,
  editStudyMaterial,
} = require("../controller/studyMaterialController");

router.post("/addStudyMaterial", addStudyMaterial);
router.post("/getStudyMaterial", getStudyMaterial);
router.delete("/deleteStudyMaterial/:id", deleteStudyMaterial);
router.post("/addSubjectTopics", addSubjectTopics);
router.put("/editSubjectTopics", editSubjectTopics);
router.put("/editstudyMaterial/:id", editStudyMaterial);
router.post("/getSubjectTopics", getSubjectTopics);
router.get("/getStudyById/:id", getStudyById);
router.get("/getallstudyMaterial", getAllStudyMaterials);
router.post("/deleteSubjectTopics", deleteSubjectTopics);

module.exports = router;
