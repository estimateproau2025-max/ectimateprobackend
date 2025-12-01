const { body, param } = require("express-validator");
const fs = require("fs/promises");
const path = require("path");
const Builder = require("../models/Builder");
const Lead = require("../models/Lead");
const { calculateEstimate } = require("../utils/estimate");
const config = require("../config");
const cloudinary = require("../config/cloudinary");
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

function normalizePhotoUrls(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.filter(Boolean);
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.filter(Boolean);
      }
    } catch (error) {
      // ignore JSON parse error, treat as comma-delimited
      if (raw.includes(",")) {
        return raw
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean);
      }
    }
    return [raw];
  }
  return [];
}

async function uploadSurveyFiles(files = [], builderId) {
  if (!files.length) return [];
  const canUseCloudinary =
    config.cloudinary.cloudName &&
    config.cloudinary.apiKey &&
    config.cloudinary.apiSecret;

  return Promise.all(
    files.map(async (file) => {
      if (canUseCloudinary) {
        try {
          const uploadResult = await cloudinary.uploader.upload(file.path, {
            folder: `estimate-pro/${builderId}`,
            resource_type: "auto",
          });
          await fs.unlink(file.path).catch(() => {});
          return uploadResult.secure_url;
        } catch (error) {
          console.error("Cloudinary upload failed", error.message);
        }
      }
      return file.path.replace(`${process.cwd()}${path.sep}`, "");
    })
  );
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
    clientSuburb: req.body.clientSuburb,
    bathroomType: req.body.bathroomType,
    tilingLevel: req.body.tilingLevel,
    tilesSupply: req.body.tilesSupply,
    toiletLocation: req.body.toiletLocation,
    wallChanges: req.body.wallChanges,
    designStyle: req.body.designStyle,
    homeAgeCategory: req.body.homeAgeCategory,
    measurements: {
      totalArea: req.body.totalArea,
      floorLength: req.body.floorLength,
      floorWidth: req.body.floorWidth,
      wallHeight: req.body.wallHeight,
    },
  };

  // Map frontend field names to backend expected names
  const toiletMove = req.body.toiletLocation === "change_location" ? true : false;
  const wallChange = req.body.wallChanges === "yes" ? true : false;
  const includeTiles = req.body.tilesSupply === "yes_include" ? true : false;

  const estimate = calculateEstimate(builder.pricingItems, {
    measurements: payload.measurements,
    tilingLevel: payload.tilingLevel,
    bathroomType: payload.bathroomType,
    toiletMove: toiletMove,
    wallChange: wallChange,
    includeTiles: includeTiles,
  });

  const uploadedUrls = await uploadSurveyFiles(req.files || [], builder._id);
  const directUrls = normalizePhotoUrls(req.body.photoUrls);
  const photoPaths = [...directUrls, ...uploadedUrls].filter(Boolean);

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



