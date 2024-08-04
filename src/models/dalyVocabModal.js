const mongoose = require("mongoose");
const dataScema = new mongoose.Schema({
  
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
  },
  title: {
    type: String,
  },
  description: {
    type: String,
  },
  status: {
    type: Boolean,
    default: true,
  },
  createdDate: {
    type: Date,
    default: Date.now,
    required: true,
  },
});
module.exports = mongoose.model("dalyVocab", dataScema);
