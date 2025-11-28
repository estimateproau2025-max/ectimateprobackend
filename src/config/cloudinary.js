const cloudinary = require("cloudinary").v2;
const config = require("./index");

if (config.cloudinary.cloudName && config.cloudinary.apiKey && config.cloudinary.apiSecret) {
  cloudinary.config({
    cloud_name: config.cloudinary.cloudName,
    api_key: config.cloudinary.apiKey,
    api_secret: config.cloudinary.apiSecret,
  });
} else {
  console.warn("⚠️  Cloudinary credentials missing. Image uploads will default to local storage.");
}

module.exports = cloudinary;

