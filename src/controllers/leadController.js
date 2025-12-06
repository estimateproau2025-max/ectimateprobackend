const { body, param, query } = require("express-validator");
const Lead = require("../models/Lead");
const { leadStatuses } = require("../constants");

const statusUpdateValidators = [
  param("id").isMongoId(),
  body("status").isIn(leadStatuses),
];

const notesUpdateValidators = [
  param("id").isMongoId(),
  body("notes").isString().trim().isLength({ min: 0, max: 5000 }),
];

const leadQueryValidators = [
  query("status").optional().isIn(leadStatuses),
];

async function listLeads(req, res) {
  const filter = { builder: req.user._id };
  if (req.query.status) {
    filter.status = req.query.status;
  }
  const leads = await Lead.find(filter)
    .sort({ createdAt: -1 })
    .lean();
  res.json({ leads });
}

async function getLead(req, res) {
  const lead = await Lead.findOne({
    _id: req.params.id,
    builder: req.user._id,
  }).lean();
  if (!lead) {
    return res.status(404).json({ message: "Lead not found" });
  }
  res.json({ lead });
}

async function updateStatus(req, res) {
  const lead = await Lead.findOne({
    _id: req.params.id,
    builder: req.user._id,
  });
  if (!lead) {
    return res.status(404).json({ message: "Lead not found" });
  }
  lead.status = req.body.status;
  await lead.save();
  res.json({ lead });
}

async function updateNotes(req, res) {
  const lead = await Lead.findOne({
    _id: req.params.id,
    builder: req.user._id,
  });
  if (!lead) {
    return res.status(404).json({ message: "Lead not found" });
  }
  lead.notes = req.body.notes || "";
  await lead.save();
  res.json({ lead });
}

async function listAllLeads(req, res) {
  const leads = await Lead.find()
    .populate("builder", "businessName email")
    .sort({ createdAt: -1 });
  res.json({ leads });
}

async function deleteLead(req, res) {
  const lead = await Lead.findOne({
    _id: req.params.id,
    builder: req.user._id,
  });
  if (!lead) {
    return res.status(404).json({ message: "Lead not found" });
  }
  await Lead.deleteOne({ _id: lead._id });
  res.json({ message: "Lead deleted" });
}

module.exports = {
  statusUpdateValidators,
  notesUpdateValidators,
  leadQueryValidators,
  listLeads,
  getLead,
  updateStatus,
  updateNotes,
  listAllLeads,
  deleteLead,
};


