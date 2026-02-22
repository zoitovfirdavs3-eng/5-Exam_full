const nodemailer = require("nodemailer");

const SMTP_EMAIL = process.env.SMTP_EMAIL;
const SMTP_PASS = process.env.SMTP_PASS;

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: { user: SMTP_EMAIL, pass: SMTP_PASS },

  // 👇 IPv4 majburiy
  family: 4,

  connectionTimeout: 20000,
  greetingTimeout: 20000,
  socketTimeout: 20000,
});

module.exports = async function emailService(toEmail, otp) {
  if (!SMTP_EMAIL || !SMTP_PASS) throw new Error("SMTP creds missing");

  await transporter.sendMail({
    from: `5-Exam <${SMTP_EMAIL}>`,
    to: toEmail,
    subject: "OTP tasdiqlash kodi",
    text: `OTP: ${otp}`,
  });
};