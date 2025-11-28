const express = require("express");
const validateRequest = require("../middleware/validateRequest");
const { authenticate } = require("../middleware/auth");
const {
  registerValidators,
  loginValidators,
  refreshValidators,
  passwordResetRequestValidators,
  passwordResetValidators,
  register,
  login,
  refresh,
  logout,
  requestPasswordReset,
  resetPassword,
  supabaseSignup,
  supabaseToken,
} = require("../controllers/authController");

const router = express.Router();

router.post("/register", registerValidators, validateRequest, register);
router.post("/login", loginValidators, validateRequest, login);
router.post("/refresh", refreshValidators, validateRequest, refresh);
router.post("/logout", authenticate, logout);
router.post(
  "/request-password-reset",
  passwordResetRequestValidators,
  validateRequest,
  requestPasswordReset
);
router.post(
  "/reset-password",
  passwordResetValidators,
  validateRequest,
  resetPassword
);
router.post("/v1/signup", supabaseSignup);
router.post("/v1/token", supabaseToken);

module.exports = router;

