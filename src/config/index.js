const path = require("path");
const dotenv = require("dotenv");

dotenv.config({ path: path.join(process.cwd(), ".env") });

const config = {
  env: process.env.NODE_ENV || "development",
  port: process.env.PORT || 5000,
  databaseUrl:
    process.env.DATABASE_URL || "mongodb+srv://ehteshambutt58:4G9PFxLyIR6PqGLn@cluster0.mw68zmh.mongodb.net/number_discussion?retryWrites=true&w=majority",
    // process.env.DATABASE_URL || "mongodb+srv://estimateproau2025_db_user:estimatepro@1122@cluster0.mw68zmh.mongodb.net/number_discussion?retryWrites=true&w=majority",

  frontendUrl:
    process.env.FRONTEND_URL ||
    (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "https://ectimatepros.vercel.app"),
  allowedOrigins: (
    // process.env.CORS_ALLOW_ORIGINS ||
    // "http://localhost:5173,https://ectimatepros.vercel.app"
    "http://localhost:5173,https://ectimatepros.vercel.app,https://estimate-pro-chi.vercel.app"

  )
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
  jwt: {
    accessTokenSecret:
      process.env.ACCESS_TOKEN_SECRET || "development_access_secret",
    refreshTokenSecret:
      process.env.REFRESH_TOKEN_SECRET || "development_refresh_secret",
    accessTokenExpiresIn: "7d",
    refreshTokenExpiresIn: "30d",
  },
  upload: {
    dir: process.env.UPLOAD_DIR || path.join(process.cwd(), "uploads"),
    maxFileSize: Number(process.env.MAX_FILE_SIZE) || 20 * 1024 * 1024,
    allowedTypes: (process.env.ALLOWED_FILE_TYPES ||
      "jpg,jpeg,png,webp,heic,heif,avif,gif,mp4,mov")
      .split(",")
      .filter(Boolean)
      .map((ext) => ext.trim().toLowerCase()),
  },
  email: {
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT) || 587,
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    service: process.env.SERVICE,
    // Publicly accessible URL for the email footer logo; fall back to the provided Cloudinary asset
    logoUrl:
      process.env.EMAIL_LOGO_URL ||
      "https://res.cloudinary.com/dgmjg9zr4/image/upload/v1765026255/WhatsApp_Image_2025-11-30_at_12.32.55_AM_gbr49i.jpg",
  },
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY,
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    defaultPriceId: process.env.STRIPE_PRICE_ID,
  },
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
    uploadPreset: process.env.CLOUDINARY_UPLOAD_PRESET,
  },
  admin: {
    // Default to the requested platform-owner email unless overridden by env
    email: ("estimateproau2025@gmail.com").toLowerCase(),
  },
};

module.exports = config;



