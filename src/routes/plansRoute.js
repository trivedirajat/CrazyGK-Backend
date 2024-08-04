var express = require('express');
var router = express.Router();

var {addPlan, getPlan} = require('../controller/planController');

router.post('/addPlan', addPlan);
router.get('/getPlan', getPlan);

module.exports = router;
