const express = require("express");
const { authenticate } = require("../middleware/auth");
const ensureSubscriptionActive = require("../middleware/subscriptionGuard");
const validateRequest = require("../middleware/validateRequest");
const {
  statusUpdateValidators,
  leadQueryValidators,
  listLeads,
  getLead,
  updateStatus,
  deleteLead,
} = require("../controllers/leadController");

const router = express.Router();

router.use(authenticate, ensureSubscriptionActive);

router.get("/", leadQueryValidators, validateRequest, listLeads);
router.get("/:id", getLead);
router.patch(
  "/:id/status",
  statusUpdateValidators,
  validateRequest,
  updateStatus
);
router.delete("/:id", deleteLead);

module.exports = router;

