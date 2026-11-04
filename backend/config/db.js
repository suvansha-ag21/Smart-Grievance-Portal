const mongoose = require("mongoose");

let isMongoConnected = false;

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) {
    isMongoConnected = true;
    return;
  }
  try {
    const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/egrievance";
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 2500, // 2.5s quick timeout instead of 30s hang
    });

    isMongoConnected = true;
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    isMongoConnected = false;
    console.warn(`⚠️ Local MongoDB is not running on 127.0.0.1:27017 (${error.message}).`);
    console.warn(`⚠️ Running with resilient fallback so authentication and APIs function smoothly!`);
  }
};

const getIsConnected = () => isMongoConnected && mongoose.connection.readyState === 1;

module.exports = connectDB;
module.exports.getIsConnected = getIsConnected;
