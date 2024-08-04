const mongoose = require("mongoose");
const dataScema = new mongoose.Schema({
  title: {
    type: String,
  },  
  description: {
    type: String,
  },
  duration: { //weekly, monthly, yearly
    type: String,
    default: 'monthly',
  },
  price: {
    type: String,
  },
  features: {
    type: Object,
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
module.exports = mongoose.model("plan", dataScema);
