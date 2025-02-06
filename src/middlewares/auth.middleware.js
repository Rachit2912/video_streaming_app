import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    // ya to cookies me hoga, ya header se bhejega user agr phone app use ho rha h to
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");
    // replace krne se jo bearer ke baad authorization token likha huwa tha vo clear ho gya ab and user don't have any access token

    if (!token) {
      throw new ApiError(401, "unauthorized access");
    }

    const decodecToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(decodecToken?._id).select(
      "-password -refreshToken"
    );

    if (!user) {
      throw new ApiError(401, "invalid access token");
    }

    req.user = user;
    next(); // jisse ye next wale fn. ko run krega jo ki params. me hoga
  } catch (error) {
    throw new ApiError(401, error?.message || "invalid access token");
  }
});
