const config = require("../config");
const { transporter } = require("../config/email");

async function sendEmail({ to, subject, html }) {
  if (!to || !subject) {
    throw new Error("Email recipient and subject are required");
  }

  try {
    const info = await transporter.sendMail({
      from: config.email.from,
      to,
      subject,
      html,
    });
    console.info("📧 Email sent", {
      to,
      subject,
      accepted: info?.accepted,
      rejected: info?.rejected,
      response: info?.response,
    });
    return info;
  } catch (err) {
    console.error("❌ Email send failed", {
      to,
      subject,
      host: config.email.host,
      port: config.email.port,
      secure: config.email.secure,
      message: err?.message,
    });
    throw err;
  }
}

module.exports = {
  sendEmail,
};




