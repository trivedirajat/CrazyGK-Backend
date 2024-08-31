var express = require('express');
var router = express.Router();
var { verifyRole } = require('../middleware/tokenVerify');

var { addQuestion, editQuestion } = require('../controller/questionController');

router.post('/addQuestion', verifyRole, addQuestion);
router.post('/editQuestion', verifyRole, editQuestion);

// router.get('/getPlan', getPlan);

module.exports = router;
