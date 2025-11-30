const express = require("express");
const validateRequest = require("../middleware/validateRequest");
const { authenticate } = require("../middleware/auth");
const ensureSubscriptionActive = require("../middleware/subscriptionGuard");
const {
  updateProfileValidators,
  pricingValidators,
  getProfile,
  updateProfile,
  getPricing,
  updatePricing,
  regenerateSurveyLink,
} = require("../controllers/builderController");

const router = express.Router();

router.use(authenticate);
router.get("/me", getProfile);
router.put(
  "/me",
  updateProfileValidators,
  validateRequest,
  updateProfile
);

router.get(
  "/pricing",
  ensureSubscriptionActive,
  getPricing
);

router.put(
  "/pricing",
  ensureSubscriptionActive,
  pricingValidators,
  validateRequest,
  updatePricing
);

router.post("/survey-link/regenerate", regenerateSurveyLink);

module.exports = router;




