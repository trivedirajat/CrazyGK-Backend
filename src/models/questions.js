const mongoose = require('mongoose');
const dataScema = new mongoose.Schema({
  questions: {
    type: String,
  },
  options: {
    type: [String],
  },
  answers: {
    type: int,
  },
  marks: {
    type: number,
  },
  time: {
    type: number,
  },
  isPublished: {
    type: Boolean,
    default: false,
  },
  createdDate: {
    type: Date,
    default: Date.now,
    required: true,
  },
});

module.exports = mongoose.model('query', dataScema);
