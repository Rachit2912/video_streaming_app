import mongoose, { mongo } from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URI}`
    );
    console.log(
      `\n mongodb connected !! DB host : ${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.log("error in connection to mongodb in database.js", error);
    process.exitCode = 1;
  }
};

export default connectDB;
