const { body, param } = require("express-validator");
const Builder = require("../models/Builder");
const Lead = require("../models/Lead");
const { calculateEstimate } = require("../utils/estimate");
const config = require("../config");
const { sendEmail } = require("../services/emailService");
const { newLeadTemplate } = require("../utils/emailTemplates");

const surveySlugValidator = [param("slug").notEmpty()];

const surveySubmissionValidators = [
  param("slug").notEmpty(),
  body("clientName").notEmpty(),
  body("tilingLevel").optional().isString(),
];

async function getSurveyMeta(req, res) {
  const builder = await Builder.findOne({ surveySlug: req.params.slug }).lean();
  if (!builder) {
    return res.status(404).json({ message: "Survey not found" });
  }
  res.json({
    builder: {
      businessName: builder.businessName,
      surveySlug: builder.surveySlug,
      pricingMode: builder.pricingMode,
    },
  });
}

async function submitSurvey(req, res) {
  const builder = await Builder.findOne({ surveySlug: req.params.slug });
  if (!builder) {
    return res.status(404).json({ message: "Survey not found" });
  }

  const payload = {
    clientName: req.body.clientName,
    clientPhone: req.body.clientPhone,
    clientEmail: req.body.clientEmail,
    bathroomType: req.body.bathroomType,
    tilingLevel: req.body.tilingLevel,
    designStyle: req.body.designStyle,
    homeAgeCategory: req.body.homeAgeCategory,
    measurements: {
      totalArea: req.body.totalArea,
      floorLength: req.body.floorLength,
      floorWidth: req.body.floorWidth,
      wallHeight: req.body.wallHeight,
    },
  };

  const estimate = calculateEstimate(builder.pricingItems, {
    measurements: payload.measurements,
    tilingLevel: payload.tilingLevel,
  });

  const photoPaths = (req.files || []).map((file) =>
    file.path.replace(`${process.cwd()}${require("path").sep}`, "")
  );

  const lead = await Lead.create({
    builder: builder._id,
    surveySlug: builder.surveySlug,
    ...payload,
    measurements: payload.measurements,
    calculatedAreas: {
      ...estimate.areas,
      ...estimate.tiledAreas,
    },
    estimate: {
      baseEstimate: estimate.baseEstimate,
      highEstimate: estimate.highEstimate,
      lineItems: estimate.lineItems,
    },
    answers: req.body,
    photoPaths,
  });

  if (builder.notifications.leadEmails) {
    try {
      await sendEmail({
        to: builder.email,
        ...newLeadTemplate({
          builderName: builder.businessName,
          clientName: lead.clientName,
          dashboardUrl: `${config.frontendUrl}/dashboard/leads/${lead._id}`,
        }),
      });
    } catch (error) {
      console.warn("Failed to send lead email", error.message);
    }
  }

  res.status(201).json({
    message: "Survey submitted",
    leadId: lead._id,
    estimate: {
      baseEstimate: estimate.baseEstimate,
      highEstimate: estimate.highEstimate,
    },
  });
}

module.exports = {
  surveySlugValidator,
  surveySubmissionValidators,
  getSurveyMeta,
  submitSurvey,
};



