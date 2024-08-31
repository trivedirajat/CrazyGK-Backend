const mongoose = require('mongoose');
const dataScema = new mongoose.Schema({
  question: {
    type: String,
  },
  questionType: {
    type: String,
    enum: [
      'Single Choice',
      'Multiple Choice',
      'True/False',
      'Fill in the Blank',
    ],
    default: 'Multiple Choice',
  },
  options: [
    {
      value: String,
      isCorrect: Boolean,
    },
  ],
  marks: {
    type: Number,
  },
  time: {
    type: Number,
  },
  isPublished: {
    type: Boolean,
    default: true,
  },
  createdDate: {
    type: Date,
    default: Date.now,
    required: true,
  },
});

module.exports = mongoose.model('questions', dataScema);
