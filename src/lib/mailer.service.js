const nodemailer = require("nodemailer");

const SMTP_EMAIL = process.env.SMTP_EMAIL;
const SMTP_PASS = process.env.SMTP_PASS;

// Gmail SMTP (IPv4 host, 587)
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // 587 uchun false
  auth: {
    user: SMTP_EMAIL,
    pass: SMTP_PASS,
  },
  connectionTimeout: 20000,
  greetingTimeout: 20000,
  socketTimeout: 20000,
});

module.exports = async function emailService(toEmail, otp) {
  if (!SMTP_EMAIL || !SMTP_PASS) {
    throw new Error("SMTP_EMAIL yoki SMTP_PASS yo‘q");
  }

  await transporter.sendMail({
    from: `5-Exam <${SMTP_EMAIL}>`,
    to: toEmail,
    subject: "OTP tasdiqlash kodi",
    text: `Sizning OTP kodingiz: ${otp}`,
  });
};