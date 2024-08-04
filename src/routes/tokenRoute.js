var express = require('express');
var router = express.Router();

var {tokenGenrate} = require('../controller/jwtController');
/* GET home page. */
router.get('/tokenGenrate', tokenGenrate);

module.exports = router;
