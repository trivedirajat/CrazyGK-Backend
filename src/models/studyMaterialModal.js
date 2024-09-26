const mongoose = require("mongoose");
const dataScema = new mongoose.Schema({
  topic_name: {
    type: String,
  },
  subject_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "subjects",
    required: true,
  },
  status: {
    type: Boolean,
    default: true,
  },
  toc: [
    {
      text: { type: String },
      id: { type: String },
      level: { type: String },
    },
  ],
  containt: {
    type: String,
  },
  sortContent: {
    type: String,
  },
  createdDate: {
    type: Date,
    default: Date.now,
    required: true,
  },
});
dataScema.pre("save", function (next) {
  if (this.containt) {
    this.sortContent = this.containt.substring(0, 100);
  }
  next();
});
module.exports = mongoose.model("stadyMaterial", dataScema);
