import { Error } from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
const registerUser = asyncHandler(async (req, res) => {
  // steps to be followed :
  //  i) get user details from frontend
  const { fullname, email, username, password } = req.body;
  //   console.log(email, fullname, username, password);

  // ii) validation -not empty
  if (
    [fullname, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "all fields are required");
  }

  // iii) check if user already exists : usrname,email
  // first, import User model from models folder, now it'll contact the mongodb because it's a mongodb model and it can directly contact the db bcz it's made with the mongoose library, so, on our behalf, User will call the mongodb db.
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  }); // reference to the user

  if (existedUser) {
    throw new ApiError(409, "user with email/username already exists");
  }

  // iv) check for images, check for avatar
  //   now, due to multer middleware, req has access to req.files by which we can access the files also
  const avatarLocalPath = req.files?.avatar[0]?.path;
  //   const coverImageLocalPath = req.files?.coverImage[0]?.path;

  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  if (!avatarLocalPath) throw new ApiError(400, "avatar file is required");

  // v) upload it to cloudinary, rechk avatar
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) throw new ApiError(400, "avatar is required");

  // vi) create user object - create entry in db & check if it's created successfully or not
  const user = await User.create({
    fullname,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });

  // vii) remove pswd and refresh token field from response
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  // viii) check for user creation
  if (!createdUser)
    throw new ApiError(500, "something went wrong while registering the user");

  // ix) return res
  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered successfully"));
});

//generating fn. for access & refresh tokens :
const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;

    // it'll save the user details without checking or validating anything, will just save the data
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "something went wrong while generating both the tokens"
    );
  }
};

const loginUser = asyncHandler(async (req, res) => {
  //  i) req.body
  const { email, username, password } = req.body;
  if (!(username || email)) {
    throw new ApiError(400, "username or email are required");
  }

  // ii) username or email
  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  // iii) find the user
  if (!user) {
    throw new ApiError(404, "user doesn't exist");
  }

  // iv) pswd check
  const isPswdValid = await user.isPasswordCorrect(password);

  if (isPswdValid == false) {
    throw new ApiError(401, "invalid credentials");
  }

  // v) access and refresh token
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  // vi) send it in cookies
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  // these options are like the cookies settings, which prohibits the modification of cookies from frontend side and only server can modify this
  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "user logged in successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: { refreshToken: undefined },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "user logged out"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "unauthorized request");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken?._id);

    if (!user) {
      throw new ApiError(401, "invalid refresh token");
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "refresh token is expired or used");
    }

    const options = {
      httpOnly: true,
      secure: true,
    };

    const { accessToken, newRefreshToken } =
      await generateAccessAndRefreshTokens(user._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, option)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "access token refreshed"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || " invalid refresh token ");
  }
});

export { registerUser, loginUser, logoutUser, refreshAccessToken };
