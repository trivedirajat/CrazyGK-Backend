const mongoose = require("mongoose");
const dataScema = new mongoose.Schema({
  subject_name: {
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
module.exports = mongoose.model("subjects", dataScema);
