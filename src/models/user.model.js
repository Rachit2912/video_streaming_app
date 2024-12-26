import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true, // for optimized search options
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    fullname: {
      type: String,
      required: true,
      trim: true,
      index: true, // for optimized search options
    },
    avatar: {
      type: String, //cloudinary url; free cloud storage
      required: true,
    },
    coverImage: {
      type: String, //cloudinary url; free cloud storage
    },
    watchHistory: [
      {
        type: Schema.Types.ObjectId,
        ref: "Video",
      },
    ],

    password: {
      type: String,
      required: [true, "Password is required"],
    },
    refreshToken: {
      type: String,
    },
  },
  { timestamps: true }
);

// it's a hook kind of a middleware, here we have used it for the password encryption and we aren't using arrow fns. for callback as it doesn't contain 'this' keyword basically it doesn't contain a reference to the current data, but we need it here and it takes time that's why used async
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next(); // if pswd isn't modified, return from here only
  this.password = bcrypt.hash(this.password, 10);
  next();
});

// custom method for getting the decrypted pswd from the usr and then check it with the encrypted one in the db, as we are storing encrypted pswd in the db.
userSchema.methods.isPasswordCorrect = async function (pswd) {
  return await bcrypt.compare(pswd, this.password);
};

// jwt is a bearer token, it's like key, who has the key can open the lock
userSchema.methods.generateAccessToken = async function () {
  return await jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
      fullname: this.fullname,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
  );
};

// refresh token only contains _id, as it'll getting refreshed many times
userSchema.methods.generateRefreshToken = async function () {
  return await jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
  );
};

export const User = mongoose.model("User", userSchema);
