const express = require("express");
const authRoutes = require("./authRoutes");
const builderRoutes = require("./builderRoutes");
const leadRoutes = require("./leadRoutes");
const surveyRoutes = require("./surveyRoutes");
const adminRoutes = require("./adminRoutes");
const billingRoutes = require("./billingRoutes");
const testRoutes = require("./testRoutes");

const router = express.Router();

router.get("/health", (req, res) =>
  res.json({ status: "ok", timestamp: new Date().toISOString() })
);
router.use("/auth", authRoutes);
router.use("/builders", builderRoutes);
router.use("/leads", leadRoutes);
router.use("/surveys", surveyRoutes);
router.use("/admin", adminRoutes);
router.use("/billing", billingRoutes);
router.use("/test", testRoutes);

module.exports = router;

