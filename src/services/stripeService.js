const dayjs = require("dayjs");
const config = require("../config");
const stripeClient = require("../config/stripe");

if (!stripeClient) {
  console.warn("⚠️  Stripe secret key missing. Billing endpoints disabled.");
}

async function ensureStripeCustomer(builder) {
  if (!stripeClient) return null;

  if (builder.stripeCustomerId) {
    return builder.stripeCustomerId;
  }

  const customer = await stripeClient.customers.create({
    email: builder.email,
    name: builder.businessName,
    metadata: {
      builderId: builder._id.toString(),
    },
  });
  builder.stripeCustomerId = customer.id;
  await builder.save();
  return customer.id;
}

async function createCheckoutSession(builder, options = {}) {
  if (!stripeClient) {
    throw new Error("Stripe is not configured");
  }

  const customerId = await ensureStripeCustomer(builder);
  const { setupMode = false } = options;

  // If user is in trial and just wants to add a payment method, use setup mode
  // Otherwise, create a subscription checkout
  if (setupMode || (builder.subscriptionStatus === "trialing" && !config.stripe.defaultPriceId)) {
    const session = await stripeClient.checkout.sessions.create({
      mode: "setup",
      payment_method_types: ["card"],
      customer: customerId,
      success_url: `${config.frontendUrl}/dashboard/account-settings?checkout=success`,
      cancel_url: `${config.frontendUrl}/dashboard/account-settings?checkout=cancelled`,
    });
    return session;
  }

  // Subscription checkout (requires price ID)
  if (!config.stripe.defaultPriceId) {
    throw new Error("Stripe price ID not configured. Please set STRIPE_PRICE_ID in environment variables.");
  }

  const session = await stripeClient.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    customer: customerId,
    line_items: [
      {
        price: config.stripe.defaultPriceId,
        quantity: 1,
      },
    ],
    success_url: `${config.frontendUrl}/dashboard/account-settings?checkout=success`,
    cancel_url: `${config.frontendUrl}/dashboard/account-settings?checkout=cancelled`,
    subscription_data: {
      trial_end:
        builder.trialEndsAt && dayjs(builder.trialEndsAt).isAfter(dayjs())
          ? dayjs(builder.trialEndsAt).unix()
          : undefined,
    },
  });

  return session;
}

async function createCustomerPortalSession(builder) {
  if (!stripeClient) {
    throw new Error("Stripe is not configured");
  }

  const customerId = await ensureStripeCustomer(builder);

  const session = await stripeClient.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${config.frontendUrl}/dashboard/account-settings`,
  });

  return session;
}

module.exports = {
  ensureStripeCustomer,
  createCheckoutSession,
  createCustomerPortalSession,
};


