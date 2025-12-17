const nodemailer = require("nodemailer");
const config = require("./index");

// If service is provided (e.g., 'gmail'), use service-based config
// Otherwise, use host/port configuration
const transporterConfig = config.email.service
  ? {
      service: config.email.service,
      auth: {
        user: config.email.user,
        pass: config.email.pass,
      },
    }
  : {
      host: config.email.host,
      port: config.email.port,
      secure:
        typeof config.email.secure === "boolean"
          ? config.email.secure
          : config.email.port === 465,
      auth: {
        user: config.email.user,
        pass: config.email.pass,
      },
    };

const transporter = nodemailer.createTransport(transporterConfig);

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




