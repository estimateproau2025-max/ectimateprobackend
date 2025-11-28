function trialReminderTemplate({ businessName, trialEndsAt, frontendUrl }) {
  return {
    subject: "Trial ending soon – Add your card to keep EstiMate Pro access",
    html: `<p>Hi ${businessName || "there"},</p>
      <p>Your EstiMate Pro trial ends on <strong>${trialEndsAt.toDateString()}</strong>.</p>
      <p>Please add your card to keep uninterrupted access to your dashboard.</p>
      <p><a href="${frontendUrl}" target="_blank">Go to EstiMate Pro</a></p>
      <p>Thanks,<br/>The EstiMate Pro team</p>`,
  };
}

function trialExpiredTemplate({ businessName, frontendUrl }) {
  return {
    subject: "Trial expired – Add payment method to re-enable access",
    html: `<p>Hi ${businessName || "there"},</p>
      <p>Your EstiMate Pro trial has expired and access is temporarily disabled.</p>
      <p>Add a payment method to continue using the quoting assistant.</p>
      <p><a href="${frontendUrl}" target="_blank">Go to EstiMate Pro</a></p>
      <p>Thanks,<br/>The EstiMate Pro team</p>`,
  };
}

function newLeadTemplate({ builderName, clientName, dashboardUrl }) {
  return {
    subject: `New client submission from ${clientName}`,
    html: `<p>Hi ${builderName || "there"},</p>
      <p>You have a new client survey submission.</p>
      <p><a href="${dashboardUrl}" target="_blank">View the lead in your dashboard</a></p>
      <p>Thanks,<br/>EstiMate Pro</p>`,
  };
}

module.exports = {
  trialReminderTemplate,
  trialExpiredTemplate,
  newLeadTemplate,
};



