const cron = require("node-cron");
const {
  sendTrialReminderEmails,
  disableExpiredTrials,
} = require("../services/subscriptionService");

function scheduleTrialJobs() {
  cron.schedule("0 7 * * *", async () => {
    try {
      await sendTrialReminderEmails();
      await disableExpiredTrials();
      console.info("✅ Trial reminder job executed");
    } catch (error) {
      console.error("Trial reminder job failed", error);
    }
  });
}

module.exports = scheduleTrialJobs;




