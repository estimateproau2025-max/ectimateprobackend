const dayjs = require("dayjs");

function ensureSubscriptionActive(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ message: "Authentication required" });
  }

  const { subscriptionStatus, trialEndsAt } = req.user;

  if (req.user.role === "admin") {
    return next();
  }

  if (subscriptionStatus === "active") {
    return next();
  }

  if (subscriptionStatus === "trialing" && trialEndsAt) {
    if (dayjs().isBefore(dayjs(trialEndsAt))) {
      return next();
    }
  }

  return res.status(402).json({
    message: "Subscription inactive. Please add a payment method.",
  });
}

module.exports = ensureSubscriptionActive;




