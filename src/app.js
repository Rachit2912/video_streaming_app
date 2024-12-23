import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();
app.use(
  cors({
    origin: "process.env.CORS_ORIGIN",
    credentials: true,
  })
); // cors -enables server

app.use(express.json({ limit: "16kb" })); // middleware for accepting the json data with the server limit
app.use(express.urlencoded({ extended: true, limit: "16kb" })); // data url me jate waqt encoded ho jata h, eg : a+b or a%20b like that, for solving that, it's use here

app.use(express.static("public")); //for public folder and assets, storing them and utilizing them

app.use(cookieParser()); // for doing crud operations on cookies which are useful for server

export default app;
