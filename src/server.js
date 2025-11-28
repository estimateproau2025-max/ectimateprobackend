const http = require("http");
const app = require("./app");
const config = require("./config");
const connectDatabase = require("./config/database");
const scheduleTrialJobs = require("./jobs/trialReminderJob");
const { verifyEmailTransport } = require("./config/email");

async function startServer() {
  await connectDatabase();
  verifyEmailTransport();
  scheduleTrialJobs();

  const server = http.createServer(app);
  server.listen(config.port, () => {
    console.log(`🚀 API listening on port ${config.port}`);
  });
}

startServer().catch((error) => {
  console.error("Failed to start server", error);
  process.exit(1);
});



