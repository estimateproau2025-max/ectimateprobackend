const { body, param } = require("express-validator");
const Builder = require("../models/Builder");
const Lead = require("../models/Lead");

const toggleAccessValidators = [
  param("id").isMongoId(),
  body("isAccessDisabled").isBoolean(),
];

async function getSummary(req, res) {
  const [builderCount, activeBuilders, leadCount] = await Promise.all([
    Builder.countDocuments(),
    Builder.countDocuments({ subscriptionStatus: { $in: ["trialing", "active"] } }),
    Lead.countDocuments(),
  ]);

  res.json({
    summary: {
      builderCount,
      activeBuilders,
      leadCount,
    },
  });
}

async function toggleBuilderAccess(req, res) {
  const builder = await Builder.findById(req.params.id);
  if (!builder) {
    return res.status(404).json({ message: "Builder not found" });
  }
  builder.isAccessDisabled = req.body.isAccessDisabled;
  await builder.save();
  res.json({ builder });
}

module.exports = {
  toggleAccessValidators,
  getSummary,
  toggleBuilderAccess,
};



