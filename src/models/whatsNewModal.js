const mongoose = require("mongoose");
const dataScema = new mongoose.Schema({
  
  title: {
    type: String,
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
  createdDate: {
    type: Date,
    default: Date.now,
    required: true,
  },
});
module.exports = mongoose.model("whatsNewModal", dataScema);
