const express = require("express");
const router = express.Router();

const tokenRoutes = require("./tokenRoute");
const authRoutes = require("./authRoute");
const subjectsRoutes = require("./subjectsRoute");
const plansRoutes = require("./plansRoute");
const videoRoutes = require("./videoRoute");
const usersRoutes = require("./userRoute");
const studyMaterials = require("./studyMaterialRoute");
const bookRoutes = require("./bookRoute");
const blogRoutes = require("./blogRoute");
const currentAffairsRoutes = require("./currentAffairsRoute");
const reviewRoutes = require("./reviewRoute");
const whatsNewRoutes = require("./whatsNewRoute");
const jobRoutes = require("./jobRoute");
const dalyVocabRoutes = require("./dalyVocabRoute");
const quizRoutes = require("./quizRoute");
const questionRoutes = require("./questionRoute");
const { verifyTokenDb } = require("../middleware/tokenVerify");

/* GET home page. */

router.use("/token", tokenRoutes);
router.use("/auth", authRoutes);

// Apply middleware conditionally
router.use("/subjects", verifyTokenDb, subjectsRoutes);
router.use("/plans", verifyTokenDb, plansRoutes);
router.use("/video", verifyTokenDb, videoRoutes);
router.use("/users", verifyTokenDb, usersRoutes);
router.use("/studyMaterial", verifyTokenDb, studyMaterials);
router.use("/books", verifyTokenDb, bookRoutes);
router.use("/blogs", verifyTokenDb, blogRoutes);
router.use("/currentAffairs", verifyTokenDb, currentAffairsRoutes);
router.use("/review", verifyTokenDb, reviewRoutes);
router.use("/whatsNew", verifyTokenDb, whatsNewRoutes);
router.use("/job", verifyTokenDb, jobRoutes);
router.use("/dalyVocab", verifyTokenDb, dalyVocabRoutes);
router.use("/quiz", verifyTokenDb, quizRoutes);
router.use("/question", verifyTokenDb, questionRoutes);

module.exports = router;
