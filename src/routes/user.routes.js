import { Router } from "express";
import {
  refreshAccessToken,
  loginUser,
  logoutUser,
  registerUser,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverimage,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(
  upload.fields([
    //declaring a middleware to handle multiple file uploads for avatar and cover image
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverimage", 
      maxCount: 1,
    },
  ]),
  registerUser
);

router.route("/login").post(loginUser);

//secured routes
router.route("/logout").post(verifyJWT, logoutUser);
//as soon as verifyJWT done it's work it will handover work to logoutUser due to next() used in verify JWT

router.route("/refresh-token").post(refreshAccessToken);
//we already done verifyJWT in refreshAccessToken so no need to add it above

router.route("/change-password").post(verifyJWT, changeCurrentPassword);

router.route("/current-user").post(verifyJWT, getCurrentUser);

router.route("/update-account").post(verifyJWT, updateAccountDetails);

router
  .route("/update-avatar")
  .patch(verifyJWT, upload.single("avatar"), updateUserAvatar);

router
  .route("/update-coverimage")
  .patch(verifyJWT, upload.single("coverimage"), updateUserCoverimage);

export default router;
