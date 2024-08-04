const mongoose = require("mongoose");
const dataScema = new mongoose.Schema({
  topic_name: {
    type: String,
  },  
  containt: {
    // type: Array,
    type: String,
  },
  subject_id: {
    type: mongoose.Schema.Types.ObjectId,
  },
  material_id: {
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
module.exports = mongoose.model("subjectTopics", dataScema);
