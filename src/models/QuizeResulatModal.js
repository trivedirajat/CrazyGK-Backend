const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const QuizAttemptSchema = new Schema({
  quizId: { type: Schema.Types.ObjectId, ref: "Quiz" },
  score: { type: Number, required: true },
  totalMarks: { type: Number, required: true },
  timeTaken: { type: Number, required: true },
  attemptDate: { type: Date, default: Date.now },
  questions: [
    {
      questionId: { type: Schema.Types.ObjectId, ref: "Question" },
      userAnswer: [String], 
      isCorrect: Boolean,
    },
  ],
});


const QuizResultSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  quizAttempts: [QuizAttemptSchema],
  totalQuizzesTaken: { type: Number, default: 0 },
  lastAttemptDate: { type: Date },
});

const QuizResult = mongoose.model("QuizResult", QuizResultSchema);

module.exports = QuizResult;
