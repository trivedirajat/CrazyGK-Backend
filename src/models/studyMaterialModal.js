const mongoose = require("mongoose");
const dataScema = new mongoose.Schema({
  title: {
    type: String,
  },  
  description: {
    type: String,
  },
  subject_id: {
    type: mongoose.Schema.Types.ObjectId,
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
module.exports = mongoose.model("stadyMaterial", dataScema);
