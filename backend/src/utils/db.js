const mongoose = require("mongoose");

module.exports = async function connectDb() {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error("MONGO_URI .env da yo'q");

  await mongoose.connect(uri);
};
