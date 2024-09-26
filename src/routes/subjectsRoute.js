var express = require("express");
var router = express.Router();

const multer = require("multer");

var {
  addSubjects,
  getSubjects,
  deleteSubjects,
  editSubject,
  getSubjectById,
  getallsubjectname,
} = require("../controller/subjectController");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/assets/subjects/");
  },

  filename: function (req, file, cb) {
    const ext = file.originalname.split(".").pop();
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "subject-" + uniqueSuffix + "." + ext);
  },
});

const upload = multer({ storage: storage });

router.post("/addSubjects", upload.fields([{ name: "image" }]), addSubjects);
router.put("/editSubject/:id", upload.fields([{ name: "image" }]), editSubject);
router.get("/getSubjects", getSubjects);
router.get("/getSubjectById/:id", getSubjectById);
router.get("/getallsubjectname", getallsubjectname);

router.delete("/deleteSubjects/:id", deleteSubjects);

module.exports = router;
