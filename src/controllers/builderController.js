const { body, param } = require("express-validator");

const Builder = require("../models/Builder");

const updateProfileValidators = [
  body("businessName").optional().notEmpty(),
  body("phone").optional().isString(),
  body("abn").optional().isString(),
  body("quoteTerms").optional().isString(),
];

const pricingValidators = [
  body("pricingMode").optional().isIn(["final", "base"]),
  body("pricingItems").isArray(),
  body("pricingItems.*.itemName").notEmpty(),
  body("pricingItems.*.priceType").isIn(["sqm", "fixed", "percentage"]),
  body("pricingItems.*.finalPrice").optional().isFloat({ min: 0 }),
  body("pricingItems.*.baseCost").optional().isFloat({ min: 0 }),
  body("pricingItems.*.markupPercent").optional().isFloat({ min: 0 }),
];

const adminPricingValidators = [
  param("id").isMongoId(),
  body("pricingMode").optional().isIn(["final", "base"]),
  body("pricingItems").isArray(),
  body("pricingItems.*.itemName").notEmpty(),
  body("pricingItems.*.priceType").isIn(["sqm", "fixed", "percentage"]),
  body("pricingItems.*.finalPrice").optional().isFloat({ min: 0 }),
  body("pricingItems.*.baseCost").optional().isFloat({ min: 0 }),
  body("pricingItems.*.markupPercent").optional().isFloat({ min: 0 }),
];

function formatBuilder(builder) {
  return {
    id: builder._id?.toString(),
    businessName: builder.businessName,
    contactName: builder.contactName,
    phone: builder.phone,
    abn: builder.abn,
    quoteTerms: builder.quoteTerms,
    email: builder.email,
    role: builder.role,
    surveySlug: builder.surveySlug,
    trialEndsAt: builder.trialEndsAt,
    subscriptionStatus: builder.subscriptionStatus,
    hasPaymentMethod: builder.hasPaymentMethod,
    notifications: builder.notifications,
    createdAt: builder.createdAt,
    updatedAt: builder.updatedAt,
    lastLoginAt: builder.lastLoginAt,
  };
}

async function getProfile(req, res) {
  res.json({ builder: formatBuilder(req.user) });
}

async function updateProfile(req, res) {
  const { businessName, phone, contactName, abn, quoteTerms } = req.body;
  if (businessName) req.user.businessName = businessName;
  if (phone) req.user.phone = phone;
  if (contactName) req.user.contactName = contactName;
  if (abn !== undefined) req.user.abn = abn || null;
  if (quoteTerms !== undefined) req.user.quoteTerms = quoteTerms || "";
  await req.user.save();
  res.json({ builder: formatBuilder(req.user) });
}

async function getPricing(req, res) {
  res.json({
    pricingMode: req.user.pricingMode,
    pricingItems: req.user.pricingItems,
  });
}

async function updatePricing(req, res) {
  const { pricingMode, pricingItems } = req.body;
  req.user.pricingMode = pricingMode || req.user.pricingMode;
  req.user.pricingItems = pricingItems;
  await req.user.save();
  res.json({
    pricingMode: req.user.pricingMode,
    pricingItems: req.user.pricingItems,
  });
}

async function regenerateSurveyLink(req, res) {
  req.user.surveySlug = undefined;
  await req.user.save();
  res.json({ surveySlug: req.user.surveySlug });
}

async function adminGetBuilder(req, res) {
  const builder = await Builder.findById(req.params.id).select(
    "-password -refreshTokens"
  );
  if (!builder) {
    return res.status(404).json({ message: "Builder not found" });
  }
  res.json({ builder: formatBuilder(builder) });
}

async function adminGetPricing(req, res) {
  const builder = await Builder.findById(req.params.id);
  if (!builder) {
    return res.status(404).json({ message: "Builder not found" });
  }
  res.json({
    pricingMode: builder.pricingMode,
    pricingItems: builder.pricingItems,
  });
}

async function adminUpdatePricing(req, res) {
  const builder = await Builder.findById(req.params.id);
  if (!builder) {
    return res.status(404).json({ message: "Builder not found" });
  }
  const { pricingMode, pricingItems } = req.body;
  builder.pricingMode = pricingMode || builder.pricingMode;
  builder.pricingItems = pricingItems;
  await builder.save();
  res.json({
    pricingMode: builder.pricingMode,
    pricingItems: builder.pricingItems,
  });
}

async function getAllBuilders(req, res) {
  const builders = await Builder.find().select("-password -refreshTokens");
  res.json({ builders });
}

module.exports = {
  updateProfileValidators,
  pricingValidators,
  adminPricingValidators,
  getProfile,
  updateProfile,
  getPricing,
  updatePricing,
  regenerateSurveyLink,
  getAllBuilders,
  adminGetBuilder,
  adminGetPricing,
  adminUpdatePricing,
};

