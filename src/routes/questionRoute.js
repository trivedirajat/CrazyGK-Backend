var express = require('express');
var router = express.Router();
var { verifyRole } = require('../middleware/tokenVerify');

var {
  addQuestion,
  editQuestion,
  deleteQuestion,
  getAllQuestion,
} = require('../controller/questionController');

router.get('/', verifyRole, getAllQuestion);
router.get('/:id', verifyRole, getAllQuestion);
router.post('/addQuestion', verifyRole, addQuestion);
router.put('/editQuestion/:id', verifyRole, editQuestion);
router.delete('/deleteQuestion/:id', verifyRole, deleteQuestion);

// router.get('/getPlan', getPlan);

module.exports = router;
