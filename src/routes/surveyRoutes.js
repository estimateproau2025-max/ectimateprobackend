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
router.post(
  "/:slug",
  upload.array("photos", 5),
  surveySubmissionValidators,
  validateRequest,
  submitSurvey
);

module.exports = router;



