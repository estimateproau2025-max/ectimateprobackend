const Stripe = require("stripe");
const config = require("./index");

if (!config.stripe.secretKey) {
  console.warn("⚠️  STRIPE_SECRET_KEY not found in environment variables. Stripe features will be disabled.");
  console.warn("   Please add STRIPE_SECRET_KEY to your .env file.");
}

const stripeClient = config.stripe.secretKey
  ? new Stripe(config.stripe.secretKey, {
      apiVersion: "2024-06-20",
    })
  : null;

module.exports = stripeClient;


