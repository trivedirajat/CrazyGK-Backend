var express = require('express');
const { verifyToken } = require('../middleware/tokenVerify');
var router = express.Router();

var tokenRoutes = require('./tokenRoute');
var authRoutes = require('./authRoute');
var subjectsRoutes = require('./subjectsRoute')
var plansRoutes = require('./plansRoute')
var videoRoutes = require('./videoRoute')
var usersRoutes = require('./userRoute')
var studyMaterials = require('./studyMaterialRoute')
var bookRoutes = require('./bookRoute')
var blogRoutes = require('./blogRoute')
var currentAffairsRoutes = require('./currentAffairsRoute')
var reviewRoutes = require('./reviewRoute')
var whatsNewRoutes = require('./whatsNewRoute')
var jobRoutes = require('./jobRoute')
var dalyVocabRoutes = require('./dalyVocabRoute')
var quizRoutes = require('./quizRoute')
var questionRoutes = require('./questionRoute');
/* GET home page. */

router.use('/token', tokenRoutes);
router.use('/auth', authRoutes);
router.use('/subjects', subjectsRoutes);
router.use('/plans', plansRoutes);
router.use('/video', videoRoutes);
router.use('/users', usersRoutes);
router.use('/studyMaterial', verifyToken, studyMaterials);
router.use('/books', verifyToken, bookRoutes);
router.use('/blogs', verifyToken, blogRoutes);
router.use('/currentAffairs', verifyToken, currentAffairsRoutes);
router.use('/review', verifyToken, reviewRoutes);
router.use('/whatsNew', verifyToken, whatsNewRoutes);
router.use('/job', verifyToken, jobRoutes);
router.use('/dalyVocab', verifyToken, dalyVocabRoutes);
router.use('/quiz', verifyToken, quizRoutes);
router.use('/question', verifyToken, questionRoutes);

module.exports = router;
