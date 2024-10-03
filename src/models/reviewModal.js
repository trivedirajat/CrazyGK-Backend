const mongoose = require("mongoose");
const dataScema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
  },
  review: {
    type: String,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
    default: 1,
  },
  is_feature: {
    type: Boolean,
    default: false,
  },
  user_profile: {
    type: String,
    default: "",
  },
  name: {
    type: String,
  },
  createdDate: {
    type: Date,
    default: Date.now,
    required: true,
  },
});
module.exports = mongoose.model("reviewRating", dataScema);
