const mongoose = require('mongoose');

const dburl = process.env.MONGOOSE_URL
console.log('MongoDB URI:', dburl);
const DBConnect = async() =>{
  try {
    await mongoose.connect(dburl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Connection to MongoDB failed:", error);
  }
}
module.exports = DBConnect;