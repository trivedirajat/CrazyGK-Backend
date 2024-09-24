const mongoose = require("mongoose");
const dataScema = new mongoose.Schema({
  title: {
    type: String,
  },
  image: {
    type: String,
  },
  subject_id: {
    type: mongoose.Schema.Types.ObjectId,
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
module.exports = mongoose.model("blog", dataScema);
