const express = require("express");
const config = require("../config");
const stripeClient = require("../config/stripe");

const router = express.Router();

// Diagnostic endpoint to check Stripe configuration
router.get("/stripe-config", (req, res) => {
  res.json({
    stripeSecretKeyExists: !!config.stripe.secretKey,
    stripeSecretKeyLength: config.stripe.secretKey ? config.stripe.secretKey.length : 0,
    stripeSecretKeyPrefix: config.stripe.secretKey ? config.stripe.secretKey.substring(0, 10) + "..." : null,
    stripePublishableKeyExists: !!config.stripe.publishableKey,
    stripePriceIdExists: !!config.stripe.defaultPriceId,
    stripeClientInitialized: !!stripeClient,
    frontendUrl: config.frontendUrl,
    message: stripeClient 
      ? "✅ Stripe is properly configured!" 
      : "❌ Stripe client is not initialized. Check STRIPE_SECRET_KEY in .env file.",
  });
});

module.exports = router;


