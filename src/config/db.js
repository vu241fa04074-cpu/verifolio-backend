const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const mongoOptions = {
      maxPoolSize: 10,
      minPoolSize: 5,
      maxIdleTimeMS: 45000,
      serverSelectionTimeoutMS: 30000,
      retryWrites: true,
      w: "majority",
    };

    const conn = await mongoose.connect(process.env.MONGO_URI, mongoOptions);

    // Enable query optimization
    mongoose.set("debug", process.env.NODE_ENV === "development");

    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Connection event handlers for monitoring
    mongoose.connection.on("disconnected", () => {
      console.warn("MongoDB disconnected. Attempting reconnection...");
    });

    mongoose.connection.on("error", (err) => {
      console.error("MongoDB connection error:", err);
    });

    return conn;
  } catch (error) {
    console.error("MongoDB Error:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;

