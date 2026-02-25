require("dotenv").config();
const nodemailer = require("nodemailer");

const SMTP_EMAIL = process.env.SMTP_EMAIL;
const SMTP_PASS = process.env.SMTP_PASS;

const transport = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // STARTTLS
  auth: { user: SMTP_EMAIL, pass: SMTP_PASS },
  family: 4, // IPv4
  connectionTimeout: 8000,
  greetingTimeout: 8000,
  socketTimeout: 8000,
});

const escapeHtml = (s = "") =>
  String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const buildOtpTemplate = ({ otp, email }) => {
  const safeOtp = escapeHtml(otp);
  const safeEmail = escapeHtml(email);

  return `<!doctype html>
<html lang="uz">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1.0" />
  <title>OTP tasdiqlash kodi</title>
  <style>
    body{margin:0;padding:0;background:#f6f7fb;font-family:Arial,Helvetica,sans-serif;}
    .wrap{width:100%;padding:24px 0;}
    .card{max-width:560px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 8px 30px rgba(16,24,40,.08);}
    .head{background:#111827;color:#fff;padding:18px 22px;}
    .brand{font-size:18px;font-weight:800;letter-spacing:.2px;}
    .sub{font-size:12px;opacity:.85;margin-top:4px;}
    .body{padding:26px 22px;color:#111827;}
    .p{margin:0 0 12px;font-size:14px;line-height:1.65;color:#0f172a;}
    .otpBox{margin:16px 0;padding:18px;border:1px dashed #cbd5e1;border-radius:14px;text-align:center;background:#f8fafc;}
    .otp{font-size:30px;letter-spacing:8px;font-weight:900;color:#111827;}
    .muted{margin:0;font-size:12.5px;line-height:1.6;color:#475569;}
    .note{margin-top:10px;font-size:12.5px;color:#64748b;}
    .foot{padding:14px 22px;background:#f8fafc;color:#64748b;font-size:12px;display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;}
    .chip{display:inline-block;padding:6px 10px;border-radius:999px;background:#eef2ff;color:#3730a3;font-size:12px;font-weight:700;}
    @media (max-width:600px){
      .card{border-radius:0;}
      .otp{letter-spacing:6px;}
    }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="card">
      <div class="head">
        <div class="brand">Mashina bozori</div>
        <div class="sub">OTP tasdiqlash kodi</div>
      </div>

      <div class="body">
        <p class="p">Salom! Hisobingizni tasdiqlash uchun quyidagi OTP kodni kiriting:</p>

        <div class="otpBox">
          <div class="otp">${safeOtp}</div>
        </div>

        <p class="muted">Kod <b>2 daqiqa</b> amal qiladi. Agar siz so‘ramagan bo‘lsangiz, bu xabarni e’tiborsiz qoldiring.</p>
        <p class="note">Email: <b>${safeEmail}</b></p>
      </div>

      <div class="foot">
        <span>© Mashina bozori</span>
        <span class="chip">Security • OTP</span>
      </div>
    </div>
  </div>
</body>
</html>`;
};

// ✅ Prod’da transport.verify() ba’zan Render’ni sekinlashtiradi / timeout qiladi.
// Shuning uchun faqat localda tekshiramiz.
(async () => {
  if (process.env.NODE_ENV !== "production" && SMTP_EMAIL && SMTP_PASS) {
    try {
      await transport.verify();
      console.log("✅ SMTP server ready (dev)");
    } catch (err) {
      console.error("❌ SMTP connection error (dev):", err?.message || err);
    }
  }
})();

const emailService = async (email, otp) => {
  try {
    if (!SMTP_EMAIL || !SMTP_PASS) {
      console.log(`\n[OTP DEV MODE] Email: ${email} | OTP: ${otp}\n`);
      return true;
    }

    const html = buildOtpTemplate({ otp, email });

    const info = await transport.sendMail({
      from: `5-Exam <${SMTP_EMAIL}>`,
      to: email,
      subject: "OTP tasdiqlash kodi",
      html,
      text: `OTP: ${otp}. Kod 2 daqiqa amal qiladi.`,
    });

    if (!info?.accepted || info.accepted.length === 0) {
      throw new Error("Email qabul qilinmadi (accepted empty)");
    }

    console.log("✅ OTP email sent to:", email);
    return true;
  } catch (err) {
    console.error("❌ OTP SEND ERROR:", err?.message || err);
    throw err;
  }
};

module.exports = emailService;