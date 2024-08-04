var express = require('express');
var router = express.Router();

const multer = require("multer");


var {addDalyVocab, getDalyVocab, deleteDalyVocab} = require('../controller/dalyVocabController');

router.post('/addDalyVocab', addDalyVocab);
router.post('/getDalyVocab', getDalyVocab);
router.post('/deleteDalyVocab', deleteDalyVocab);

module.exports = router;
