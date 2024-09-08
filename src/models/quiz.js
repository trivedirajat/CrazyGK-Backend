const mongoose = require("mongoose");
const dataScema = new mongoose.Schema({
  name: {
    type: String,
  },
  description: {
    type: String,
  },
  questionList: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "questions",
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "subjects",
  },
  totalMarks: {
    type: Number,
  },
  passingMarks: {
    type: Number,
  },
  negativeMarks: {
    type: Number,
  },
  isPublished: {
    type: Boolean,
    default: false,
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
  createdDate: {
    type: Date,
    default: Date.now,
    required: true,
  },
});

module.exports = mongoose.model("quiz", dataScema);
