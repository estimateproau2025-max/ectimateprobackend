const express = require("express");
const { authenticate, authorize } = require("../middleware/auth");
const validateRequest = require("../middleware/validateRequest");
const {
  toggleAccessValidators,
  getSummary,
  toggleBuilderAccess,
} = require("../controllers/adminController");
const {
  getAllBuilders,
  adminGetBuilder,
  adminGetPricing,
  adminUpdatePricing,
  adminPricingValidators,
} = require("../controllers/builderController");
const { listAllLeads } = require("../controllers/leadController");

const router = express.Router();

router.use(authenticate, authorize(["admin"]));

router.get("/summary", getSummary);
router.get("/builders", getAllBuilders);
router.get("/builders/:id", adminGetBuilder);
router.get("/builders/:id/pricing", adminGetPricing);
router.put(
  "/builders/:id/pricing",
  adminPricingValidators,
  validateRequest,
  adminUpdatePricing
);
router.get("/leads", listAllLeads);
router.patch(
  "/builders/:id/access",
  toggleAccessValidators,
  validateRequest,
  toggleBuilderAccess
);

module.exports = router;




