const mongoose = require("mongoose");
const dataScema = new mongoose.Schema({
  title: {
    type: String,
  },  
  description: {
    type: Array,
  },
  subject_id: {
    type: mongoose.Schema.Types.ObjectId,
  },
  video_url: {
    type: String,
  },
  status: {
    type: Boolean,
    default: true,
  },
  is_trending: {
    type: Boolean,
    default: true,
  },
  createdDate: {
    type: Date,
    default: Date.now,
    required: true,
  },
});
module.exports = mongoose.model("video", dataScema);
