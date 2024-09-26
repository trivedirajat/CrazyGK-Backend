const mongoose = require("mongoose");
const dataScema = new mongoose.Schema({
  title: {
    type: String,
  },
  subject_id: {
    type: mongoose.Schema.Types.ObjectId,
  },
  image: {
    type: String,
  },
  description: {
    type: String,
  },
  sortdescription: {
    type: String,
    default: "",
  },
  status: {
    type: Boolean,
    default: true,
  },
  is_important: {
    type: Boolean,
    default: false,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  toc: [
    {
      text: { type: String },
      id: { type: String },
      level: { type: String },
    },
  ],
  createdDate: {
    type: Date,
    default: Date.now,
    required: true,
  },
});
dataScema.pre("save", function (next) {
  if (this.description) {
    this.sortdescription = this.description.substring(0, 100);
  }
  next();
});
module.exports = mongoose.model("currentAffairs", dataScema);
