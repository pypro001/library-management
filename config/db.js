const mongoose = require("mongoose");
require("dotenv").config();

const dbURI = process.env.MONGO_DB_CONNECTION_STRING;

const connectDB = async () => {
  mongoose.set("strictQuery", true);
  try {
    const db = await mongoose.connect(dbURI);
    console.log("connected to database");
     db.connection
     .on("error", () => console.log("error occurred while trying to connect to database"))
     .on("disconnected", () => console.log("disconnected from database!"))
    ;
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
};

module.exports = connectDB;