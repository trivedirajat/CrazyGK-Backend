var express = require('express');
var router = express.Router();

var { addQuiz } = require('../controller/quizController');

router.post('/addQuery', addQuiz);
// router.get('/getPlan', getPlan);

module.exports = router;
