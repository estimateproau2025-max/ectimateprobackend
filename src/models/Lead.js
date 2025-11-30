const mongoose = require("mongoose");
const { leadStatuses } = require("../constants");

const LeadSchema = new mongoose.Schema(
  {
    builder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Builder",
      required: true,
    },
    surveySlug: { type: String, required: true },
    clientName: { type: String, required: true },
    clientPhone: { type: String },
    clientEmail: { type: String },
    bathroomType: { type: String },
    tilingLevel: { type: String },
    designStyle: { type: String },
    homeAgeCategory: { type: String },
    measurements: {
      totalArea: Number,
      floorLength: Number,
      floorWidth: Number,
      wallHeight: Number,
    },
    calculatedAreas: {
      floorArea: Number,
      wallArea: Number,
      totalArea: Number,
      budgetArea: Number,
      standardArea: Number,
      premiumArea: Number,
    },
    estimate: {
      baseEstimate: Number,
      highEstimate: Number,
      lineItems: [
        {
          itemName: String,
          applicability: String,
          priceType: String,
          quantity: Number,
          unitPrice: Number,
          total: Number,
        },
      ],
    },
    answers: mongoose.Schema.Types.Mixed,
    photoPaths: [String],
    status: { type: String, enum: leadStatuses, default: "New" },
    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Lead = mongoose.model("Lead", LeadSchema);

module.exports = Lead;




