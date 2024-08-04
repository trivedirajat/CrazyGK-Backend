const mongoose = require("mongoose");
const dataScema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
  },
  template_id: {
    type: mongoose.Schema.Types.ObjectId,
  },
  is_favourite: {
    type: Boolean,
    default: true,
  },
  createdDate: {
    type: Date,
    default: Date.now,
    required: true,
  },
});
module.exports = mongoose.model("favourite_theme", dataScema);
