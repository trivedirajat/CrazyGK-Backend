const mongoose = require('mongoose');

const dburl = "mongodb+srv://digitalappdb:n44sBufbQlSut04W@cluster0.a4a10pu.mongodb.net/CrazyGkTricksDB"

const DBConnect = () =>{

    mongoose.connect("mongodb+srv://digitalappdb:n44sBufbQlSut04W@cluster0.a4a10pu.mongodb.net/CrazyGkTricksDB")
      .then(() => console.log('Database Connected!')).catch(error => console.log('error', error));
}
module.exports = DBConnect;