const Builder = require("../models/Builder");
const config = require("../config");
const stripeClient = require("../config/stripe");
const {
  createCheckoutSession,
  createCustomerPortalSession,
} = require("../services/stripeService");
const { subscriptionStatuses } = require("../constants");

async function checkout(req, res) {
  if (!stripeClient) {
    console.error("Stripe checkout attempted but stripeClient is null. Check STRIPE_SECRET_KEY in .env");
    return res.status(503).json({ 
      message: "Stripe not configured. Please ensure STRIPE_SECRET_KEY is set in the backend .env file." 
    });
  }
  try {
    // Allow setup mode for trial users who just want to add a payment method
    const setupMode = req.body.setupMode === true || 
                      (req.user.subscriptionStatus === "trialing" && !config.stripe.defaultPriceId);
    
    const session = await createCheckoutSession(req.user, { setupMode });
    res.json({ url: session.url });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      message: error.message || "Unable to create checkout session" 
    });
  }
}

async function portal(req, res) {
  if (!stripeClient) {
    return res.status(503).json({ message: "Stripe not configured" });
  }
  try {
    const session = await createCustomerPortalSession(req.user);
    res.json({ url: session.url });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Unable to create portal session" });
  }
}

async function stripeWebhook(req, res) {
  if (!stripeClient || !config.stripe.webhookSecret) {
    return res.status(503).json({ message: "Stripe webhook not configured" });
  }

  const signature = req.headers["stripe-signature"];
  let event;

  try {
    event = stripeClient.webhooks.constructEvent(
      req.rawBody,
      signature,
      config.stripe.webhookSecret
    );
  } catch (error) {
    console.error("Stripe webhook signature verification failed", error);
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }

  try {
    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated":
        await syncSubscription(event.data.object);
        break;
      case "customer.subscription.deleted":
        await disableSubscription(event.data.object);
        break;
      default:
        break;
    }
    res.json({ received: true });
  } catch (error) {
    console.error("Stripe webhook processing failed", error);
    res.status(500).send("Webhook handler error");
  }
}

async function syncSubscription(subscription) {
  const builder = await Builder.findOne({
    stripeCustomerId: subscription.customer,
  });
  if (!builder) return;
  builder.subscriptionStatus = mapStripeStatus(subscription.status);
  builder.stripeSubscriptionId = subscription.id;
  builder.hasPaymentMethod = true;
  builder.isAccessDisabled = false;
  await builder.save();
}

async function disableSubscription(subscription) {
  const builder = await Builder.findOne({
    stripeCustomerId: subscription.customer,
  });
  if (!builder) return;
  builder.subscriptionStatus = "inactive";
  builder.isAccessDisabled = true;
  await builder.save();
}

function mapStripeStatus(status) {
  if (status === "active" || status === "trialing") return status;
  if (status === "past_due" || status === "unpaid") return "past_due";
  if (status === "canceled" || status === "incomplete_expired") {
    return "inactive";
  }
  return subscriptionStatuses.includes(status) ? status : "inactive";
}

module.exports = {
  checkout,
  portal,
  stripeWebhook,
};


