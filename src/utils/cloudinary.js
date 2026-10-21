import { v2 as cloudinary } from "cloudinary";
import { unlink } from "node:fs/promises";

const uploadOnCloudinary = async (localFilePath) => {
  if (!localFilePath) {
    throw new Error("A local file path is required for Cloudinary upload");
  }

  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } =
    process.env;

  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    throw new Error("Cloudinary environment variables are not configured");
  }

  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
  });

  let uploadResult;
  let uploadError;

  try {
    uploadResult = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
  } catch (error) {
    uploadError = error;
  }

  try {
    await unlink(localFilePath);
  } catch (cleanupError) {
    if (cleanupError.code !== "ENOENT") {
      if (uploadError) {
        console.error("Failed to remove temporary upload file:", cleanupError);
      } else {
        throw cleanupError;
      }
    }
  }

  if (uploadError) {
    throw uploadError;
  }

  return uploadResult;
};

export { uploadOnCloudinary };
