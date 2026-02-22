const nodemailer = require("nodemailer");

const SMTP_USER = process.env.SMTP_USER || process.env.SMTP_EMAIL;
const SMTP_PASS = process.env.SMTP_PASS;

const transport = nodemailer.createTransport({
  service: "gmail",
  auth: { user: SMTP_USER, pass: SMTP_PASS },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 10000,
});

module.exports = async (email, otp) => {
  if (!SMTP_USER || !SMTP_PASS) {
    console.log("⚠️ SMTP sozlanmagan: OTP email yuborilmadi.");
    return;
  }

  const html = `... sizning HTML ...`;

  await transport.sendMail({
    from: `Avto elon uz <${SMTP_USER}>`,
    to: email,
    subject: "OTP tasdiqlash kodi",
    html,
    text: `OTP: ${otp}. Ushbu kod faqat 2 daqiqa amal qiladi`,
  });
};