const mongoose = require("mongoose");
const config = require("./index");

let cachedConnection = null;

async function connectDatabase() {
  if (cachedConnection) {
    return cachedConnection;
  }

  mongoose.set("strictQuery", true);

  try {
    cachedConnection = await mongoose.connect(config.databaseUrl, {
      autoIndex: true,
    });
    console.info("✅ Connected to MongoDB");
    return cachedConnection;
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    throw error;
  }
}

module.exports = connectDatabase;




