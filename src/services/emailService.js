const config = require("../config");
const { transporter } = require("../config/email");

async function sendEmail({ to, subject, html }) {
  if (!to || !subject) {
    throw new Error("Email recipient and subject are required");
  }

  await transporter.sendMail({
    from: config.email.from,
    to,
    subject,
    html,
  });
}

module.exports = {
  sendEmail,
};




