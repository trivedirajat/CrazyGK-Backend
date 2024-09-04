const mongoose = require("mongoose");
const dataScema = new mongoose.Schema({
  title: {
    type: String,
  },
  apply_date: {
    type: String,
  },
  description: {
    type: String,
  },
  job_link: {
    type: String,
    required: true,
  },
  createdDate: {
    type: Date,
    default: Date.now,
    required: true,
  },
});
module.exports = mongoose.model("jobs", dataScema);
