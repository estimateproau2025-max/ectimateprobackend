const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const slugify = require("slugify");
const { subscriptionStatuses } = require("../constants");

const PricingItemSchema = new mongoose.Schema(
  {
    itemName: { type: String, required: true },
    applicability: { type: String, default: "all" },
    priceType: { type: String, enum: ["sqm", "fixed", "percentage"], default: "sqm" },
    finalPrice: { type: Number, default: 0 },
    baseCost: { type: Number, default: 0 },
    markupPercent: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { _id: false }
);

const BuilderSchema = new mongoose.Schema(
  {
    businessName: { type: String, required: true },
    contactName: { type: String },
    email: { type: String, required: true, unique: true, lowercase: true },
    phone: { type: String },
    abn: { type: String },
    password: { type: String, required: true },
    role: { type: String, enum: ["builder", "admin"], default: "builder" },
    surveySlug: { type: String, unique: true },
    pricingItems: [PricingItemSchema],
    pricingMode: { type: String, enum: ["final", "base"], default: "final" },
    trialEndsAt: { type: Date },
    subscriptionStatus: {
      type: String,
      enum: subscriptionStatuses,
      default: "trialing",
    },
    stripeCustomerId: { type: String },
    stripeSubscriptionId: { type: String },
    hasPaymentMethod: { type: Boolean, default: false },
    refreshTokens: [
      {
        token: { type: String, required: true },
        expiresAt: { type: Date, required: true },
      },
    ],
    passwordResetToken: { type: String },
    passwordResetExpires: { type: Date },
    notifications: {
      leadEmails: { type: Boolean, default: true },
    },
    isAccessDisabled: { type: Boolean, default: false },
    lastLoginAt: { type: Date },
  },
  { timestamps: true }
);

BuilderSchema.pre("save", async function hashPassword(next) {
  if (!this.isModified("password")) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  return next();
});

BuilderSchema.pre("save", function setSlug(next) {
  if (!this.surveySlug && this.businessName) {
    const slug = slugify(this.businessName, { lower: true, strict: true });
    this.surveySlug = `${slug}-${Math.random().toString(36).substring(2, 6)}`;
  }
  next();
});

BuilderSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

const Builder = mongoose.model("Builder", BuilderSchema);

module.exports = Builder;



