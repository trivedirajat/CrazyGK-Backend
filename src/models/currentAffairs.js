const mongoose = require("mongoose");
const dataScema = new mongoose.Schema({
  
  title: {
    type: String,
  },
  subject_id: {
    type: mongoose.Schema.Types.ObjectId,
  },
  image: {
    type: String,
  },
  description: {
    type: String,
  },
  status: {
    type: Boolean,
    default: true,
  },
  is_important: {
    type: Boolean,
    default: false,
  },
  date: {
    type: String,
  },
  createdDate: {
    type: Date,
    default: Date.now,
    required: true,
  },
});
module.exports = mongoose.model("currentAffairs", dataScema);
