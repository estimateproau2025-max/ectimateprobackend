const express = require("express");
const { authenticate } = require("../middleware/auth");
const ensureSubscriptionActive = require("../middleware/subscriptionGuard");
const { checkout, portal } = require("../controllers/billingController");

const router = express.Router();

router.use(authenticate);

router.post("/checkout", checkout);
router.post("/portal", portal);

module.exports = router;


