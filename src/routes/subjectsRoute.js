var express = require('express');
var router = express.Router();

const multer = require("multer");


var {addSubjects, getSubjects, deleteSubjects} = require('../controller/subjectController');


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "public/assets/subject/");
    },
  
    filename: function (req, file, cb) {
        const ext = file.originalname.split('.').pop();
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, "subject-" + uniqueSuffix + '.' + ext);
    },
  });
  
  const upload = multer({ storage: storage });

router.post('/addSubjects', upload.fields([{ name: "image" }]), addSubjects);
router.post('/getSubjects', getSubjects);
router.post('/deleteSubjects', deleteSubjects);

module.exports = router;
