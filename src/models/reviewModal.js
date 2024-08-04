const mongoose = require("mongoose");
const dataScema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
  },
  review: {
    type: String,
  },  
  rating: {
    type: String,
  },
  user_profile: {
    type: String,
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
