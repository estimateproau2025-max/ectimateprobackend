const nodemailer = require("nodemailer");
const config = require("./index");

const transporter = nodemailer.createTransport({
  host: config.email.host,
  port: config.email.port,
  secure: config.email.port === 465,
  auth: {
    user: config.email.user,
    pass: config.email.pass,
  },
});

async function verifyEmailTransport() {
  try {
    await transporter.verify();
    console.info("📧 Email transporter ready");
  } catch (error) {
    console.warn("⚠️  Email transporter verification failed:", error.message);
  }
}

module.exports = {
  transporter,
  verifyEmailTransport,
};




