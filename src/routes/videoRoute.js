var express = require('express');
var router = express.Router();

var {addVideo, getvideo, videoDelete} = require('../controller/videoController');

router.post('/addVideo', addVideo);
router.post('/getvideo', getvideo);
router.post('/videoDelete', videoDelete);

module.exports = router;
