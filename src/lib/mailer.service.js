require("dotenv").config();
const nodemailer = require("nodemailer");

const SMTP_EMAIL = process.env.SMTP_EMAIL;
const SMTP_PASS = process.env.SMTP_PASS;

const transport = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // STARTTLS
  auth: {
    user: SMTP_EMAIL,
    pass: SMTP_PASS,
  },
  family: 4,
  connectionTimeout: 20000,
  greetingTimeout: 20000,
  socketTimeout: 20000,
});

// 🔥 SMTP ulanishni tekshirish
(async () => {
  if (SMTP_EMAIL && SMTP_PASS) {
    try {
      await transport.verify();
      console.log("✅ SMTP server ready");
    } catch (err) {
      console.error("❌ SMTP connection error:", err?.message || err);
    }
  } else {
    console.log("⚠️ SMTP credentials topilmadi (DEV MODE)");
  }
})();

const emailService = async (email, otp) => {
  try {
    if (!SMTP_EMAIL || !SMTP_PASS) {
      console.log(`\n[OTP DEV MODE] Email: ${email} | OTP: ${otp}\n`);
      return true;
    }

    const html = `
      <div style="font-family:Arial;padding:20px">
        <h2>Mashina bozori</h2>
        <p>Hisobingizni tasdiqlash uchun OTP kod:</p>
        <h1 style="letter-spacing:5px">${otp}</h1>
        <p>Kod 2 daqiqa amal qiladi.</p>
      </div>
    `;

    const info = await transport.sendMail({
      from: `5-Exam <${SMTP_EMAIL}>`,
      to: email,
      subject: "OTP tasdiqlash kodi",
      html,
      text: `OTP: ${otp}`,
    });

    // 🔥 Email qabul qilinganini tekshirish
    if (!info.accepted || info.accepted.length === 0) {
      throw new Error("Email qabul qilinmadi");
    }

    console.log("✅ OTP email sent to:", email);
    return true;

  } catch (err) {
    console.error("❌ OTP SEND ERROR:", err?.message || err);
    throw err; // muhim! controllerga xato uzatiladi
  }
};

module.exports = emailService;