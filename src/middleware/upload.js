const fs = require("fs");
const path = require("path");
const multer = require("multer");
const config = require("../config");

if (!fs.existsSync(config.upload.dir)) {
  fs.mkdirSync(config.upload.dir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, config.upload.dir),
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `survey-${uniqueSuffix}${ext}`);
  },
});

function fileFilter(req, file, cb) {
  const allowed = config.upload.allowedTypes;
  if (allowed.length === 0) return cb(null, true);
  const ext = path.extname(file.originalname).replace(".", "").toLowerCase();
  if (allowed.includes(ext)) {
    return cb(null, true);
  }
  return cb(new Error("Unsupported file type"));
}

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: config.upload.maxFileSize,
    files: 5,
  },
});

module.exports = upload;




