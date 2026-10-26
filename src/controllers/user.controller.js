import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();

    //making db refreshToken = generated refreshToken
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false }); //saving refreshToken in db without validating or updating other fields

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating refresh and access token"
    );
  }
};

const registerUser = asyncHandler(async (req, res, next) => {
  //user enters data in the form and we will get that data through req.body
  //validate that data and check if user already exists or not
  //check for images and avtar
  //store images in cloudinary and get the url for that img and store it in db
  //after that we will store that data in db
  //create user object and save it in db
  //remove pwd and refresh token from response
  //check for user creations
  //return res

  const { username, email, fullname, password } = req.body;

  //console.log(req.body);

  if (
    [username, email, fullname, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError("All fields are required", 400);
  }

  const existingUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existingUser) {
    throw new ApiError("User already exists", 400);
  }

  //console.log(req.files);

  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  const coverimageLocalPath = req.files?.coverimage?.[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);

  const coverimage = coverimageLocalPath
    ? await uploadOnCloudinary(coverimageLocalPath)
    : null;

  if (!avatar) {
    throw new ApiError(400, "Failed to upload avatar");
  }

  const user = await User.create({
    username: username.toLowerCase(),
    email,
    fullname,
    password,
    avatar: avatar.secure_url,
    coverimage: coverimage?.secure_url || null,
  });

  const userCreated = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!userCreated) {
    throw new ApiError("Something went wrong while creating the user", 500);
  }

  return res
    .status(201)
    .json(new ApiResponse(200, userCreated, "User Registered Successfully"));
});

const loginUser = asyncHandler(async (req, res, next) => {
  // Take input credentials from req.body
  // Validate both credentials(username or email and password)
  // if credentials are wrong res with invalid username and password
  // else make it logged in
  // Grant a Refresh and Access Token in order to access different section of app.

  // or

  // req.body -> data
  // username or email
  // find the user
  // check password
  // access and refresh token
  // send cookie

  const { username, email, password } = req.body;

  if (!(username || email)) {
    throw new ApiError(400, "username/email is required");
  }

  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new ApiError(400, "Invalid username/email");
  }

  if (!password) {
    throw new ApiError(500, "Password is required");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(500, "Invalid user credentials");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  ); // getting access and refresh token separately from function generateAccessAndRefreshToken

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  ); // loggedInUser doesn't have password and refreshToken with him

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
        { loggedInUser, accessToken, refreshToken }, //sending this because in case may user want to store it on his end...not a good practice but helpful for mobile app
        "User logged In Successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res, next) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
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
    .clearCookie("accessToken")
    .clearCookie("refreshToken")
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res, next) => {
  const incomingRefreshToeken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToeken) {
    throw new ApiError(401, "Unauthorized Request");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToeken,
      process.env.REFRESH_TOKEN_SECRET
    );
    //we pass token and secret key in verify
    //incomingRefreshToken converted into docodedToken
    //Now we get decoded token, it may or may not with payload/data

    const user = await User.findById(decodedToken?._id);

    if (!user) {
      throw new ApiError(401, "Invalid Refresh Token");
    }

    if (incomingRefreshToeken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh Token is Expired");
    }

    //options are used for cookies
    const options = {
      httpOnly: true,
      secure: true,
    };

    const { accessToken, newRefreshToken } =
      await generateAccessAndRefreshTokens(user.id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(200, { accessToken, newRefreshToken }, "Access Token Refreshed");
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid Refresh Token");
  }
});

export { registerUser, loginUser, logoutUser, refreshAccessToken };
