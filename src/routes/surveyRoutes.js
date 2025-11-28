const express = require("express");
const upload = require("../middleware/upload");
const validateRequest = require("../middleware/validateRequest");
const {
  surveySlugValidator,
  surveySubmissionValidators,
  getSurveyMeta,
  submitSurvey,
} = require("../controllers/surveyController");

const router = express.Router();

router.get("/:slug", surveySlugValidator, validateRequest, getSurveyMeta);
function optionalUpload(req, res, next) {
  const contentType = req.headers["content-type"] || "";
  if (contentType.includes("multipart/form-data")) {
    return upload.array("photos", 5)(req, res, next);
  }
  return next();
}

router.post(
  "/:slug",
  optionalUpload,
  surveySubmissionValidators,
  validateRequest,
  submitSurvey
);

module.exports = router;



