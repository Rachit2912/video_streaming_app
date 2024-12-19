// require('dotenv').config({path:"./env" });  method of importing the env. variables at the start, but it distorts the pattern of require and then importing that's why we use an experimental option for it
import dotenv from "dotenv"; // this is the experimental option for it : go to config.json : in dev : change it to "nodemon -r dotenv/config --experimental-json-modules src/index.js"
dotenv.config({ path: "../.env" });
import mongoose from "mongoose";
import { DB_NAME } from "./constants.js";

/*  // i) approach : all conn. fns. made and executed here only :

-> connecting the db directly using iife
(async () => {
  try {
    await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
    app.on("error", () => {
      console.log("ERR : ", error);
      throw error;
    });

    app.listen(process.env.PORT, () => {
      console.log(`app is running on port ${process.env.PORT}`);
    });
  } catch (error) {
    console.error("ERROR :", error);
    throw error;
  }
})();


ii) all conn. fns. in other file, export it here and run it 
*/

import connectDB from "./db/database.js";
import app from "./app.js";
const PORT = process.env.PORT || 8000;
connectDB()
  .then(() => {
    console.log("mongodb db connection completed");
    app.listen(PORT, () => {
      console.log(`server is running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error(
      "mongodb is connected but error @ promises & express in index.js",
      err
    );
  });
