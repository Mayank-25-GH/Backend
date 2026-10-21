import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

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

export { registerUser };
