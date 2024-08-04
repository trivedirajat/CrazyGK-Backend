var express = require('express');
var router = express.Router();

const multer = require("multer");


var {addJob, getJob, deleteJob} = require('../controller/jobController');

router.post('/addJob', addJob);
router.post('/getJob', getJob);
router.post('/deleteJob', deleteJob);

module.exports = router;
