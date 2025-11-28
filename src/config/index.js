const path = require("path");
const dotenv = require("dotenv");

dotenv.config({ path: path.join(process.cwd(), ".env") });

const config = {
  env: process.env.NODE_ENV || "development",
  port: process.env.PORT || 5000,
  databaseUrl:
    process.env.DATABASE_URL || "mongodb+srv://ehteshambutt58:4G9PFxLyIR6PqGLn@cluster0.mw68zmh.mongodb.net/number_discussion?retryWrites=true&w=majority",
  frontendUrl: process.env.FRONTEND_URL || "https://estimate-pro-chi.vercel.app",
  allowedOrigins: (
    process.env.CORS_ALLOW_ORIGINS ||
    "http://localhost:5173,https://estimate-pro-chi.vercel.app"
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
    allowedTypes: (process.env.ALLOWED_FILE_TYPES || "")
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
  },
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY,
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    defaultPriceId: process.env.STRIPE_PRICE_ID,
  },
  admin: {
    email: (process.env.ADMIN_EMAIL || "").toLowerCase(),
  },
};

module.exports = config;



