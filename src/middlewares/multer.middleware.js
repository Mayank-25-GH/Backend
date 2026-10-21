import multer from "multer";
import crypto from "crypto";
import path from "node:path";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp");
  },
  filename: function (req, file, cb) {
    crypto.randomBytes(16, function (err, raw) {
      if (err) return cb(err);
      cb(null, `${raw.toString("hex")}${path.extname(file.originalname)}`);
    });
  },
});

export const upload = multer({ storage: storage });