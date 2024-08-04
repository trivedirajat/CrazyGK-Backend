const mongoose = require("mongoose");
const dataScema = new mongoose.Schema({
  
  title: {
    type: String,
  },
  image: {
    type: String,
  },
  subject_id: {
    type: mongoose.Schema.Types.ObjectId,
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
module.exports = mongoose.model("blog", dataScema);
