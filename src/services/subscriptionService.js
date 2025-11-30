const dayjs = require("dayjs");
const Builder = require("../models/Builder");
const config = require("../config");
const { sendEmail } = require("./emailService");
const {
  trialReminderTemplate,
  trialExpiredTemplate,
} = require("../utils/emailTemplates");

async function getBuildersApproachingTrial(daysBefore = 7) {
  const targetDate = dayjs().add(daysBefore, "day").endOf("day").toDate();
  return Builder.find({
    subscriptionStatus: "trialing",
    trialEndsAt: { $lte: targetDate, $gte: dayjs().startOf("day").toDate() },
  });
}

async function getBuildersWithExpiredTrial() {
  return Builder.find({
    subscriptionStatus: "trialing",
    trialEndsAt: { $lt: new Date() },
  });
}

async function sendTrialReminderEmails() {
  const builders = await getBuildersApproachingTrial(7);
  await Promise.all(
    builders.map((builder) =>
      sendEmail({
        to: builder.email,
        ...trialReminderTemplate({
          businessName: builder.businessName,
          trialEndsAt: builder.trialEndsAt,
          frontendUrl: config.frontendUrl,
        }),
      })
    )
  );
}

async function disableExpiredTrials() {
  const builders = await getBuildersWithExpiredTrial();
  await Promise.all(
    builders.map(async (builder) => {
      builder.subscriptionStatus = "inactive";
      builder.isAccessDisabled = true;
      await builder.save();
      await sendEmail({
        to: builder.email,
        ...trialExpiredTemplate({
          businessName: builder.businessName,
          frontendUrl: config.frontendUrl,
        }),
      });
    })
  );
}

module.exports = {
  sendTrialReminderEmails,
  disableExpiredTrials,
};




