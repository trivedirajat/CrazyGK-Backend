const mongoose = require("mongoose");
const dataScema = new mongoose.Schema({
  
  image: {
    type: String,
  },
  pdf_link: {
    type: String,
  },
  subject_id: {
    type: mongoose.Schema.Types.ObjectId,
  },
  status: {
    type: Boolean,
    default: true,
  },
  is_active: {
    type: Boolean,
    default: false,
  },
  createdDate: {
    type: Date,
    default: Date.now,
    required: true,
  },
});
module.exports = mongoose.model("book", dataScema);
