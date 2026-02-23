require("dotenv").config();
const nodemailer = require("nodemailer");

// Gmail SMTP creds (Render Environment variables)
const SMTP_EMAIL = process.env.SMTP_EMAIL;
const SMTP_PASS = process.env.SMTP_PASS;

// Reuse transporter (do not recreate each request)
const transport = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // STARTTLS
  auth: {
    user: SMTP_EMAIL,
    pass: SMTP_PASS,
  },

  // Force IPv4 to avoid ENETUNREACH to Gmail IPv6 on some hosts
  family: 4,

  connectionTimeout: 20000,
  greetingTimeout: 20000,
  socketTimeout: 20000,
});

const emailService = async (email, otp) => {
  if (!SMTP_EMAIL || !SMTP_PASS) {
    throw new Error("SMTP_EMAIL yoki SMTP_PASS yo‘q (Render Environment’da tekshiring)");
  }

  const html = `<!doctype html>
<html lang="uz">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>OTP tasdiqlash kodi</title>
</head>
<body style="margin:0;padding:0;background:#f6f7fb;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f6f7fb;padding:24px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="560" cellspacing="0" cellpadding="0" style="background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 8px 30px rgba(16,24,40,0.08);">
          <tr>
            <td style="padding:18px 22px;background:#111827;color:#ffffff;">
              <div style="font-size:18px;font-weight:700;">Mashina bozori</div>
              <div style="font-size:12px;opacity:.85;margin-top:4px;">OTP tasdiqlash kodi</div>
            </td>
          </tr>
          <tr>
            <td style="padding:26px 22px;color:#111827;">
              <p style="margin:0 0 10px;font-size:14px;line-height:1.6;">
                Salom! Hisobingizni tasdiqlash uchun quyidagi OTP kodni kiriting:
              </p>
              <div style="margin:16px 0;padding:18px;border:1px dashed #cbd5e1;border-radius:12px;text-align:center;">
                <span style="font-size:28px;letter-spacing:6px;font-weight:800;color:#1f2937;">${otp}</span>
              </div>
              <p style="margin:0 0 4px;font-size:13px;line-height:1.6;color:#334155;">
                Kod <b>2 daqiqa</b> amal qiladi. Agar siz so‘ramagan bo‘lsangiz, bu xabarni e’tiborsiz qoldiring.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:14px 22px;background:#f8fafc;color:#64748b;font-size:12px;">
              <div>© Mashina bozori</div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  await transport.sendMail({
    from: `5-Exam <${SMTP_EMAIL}>`,
    to: email,
    subject: "OTP tasdiqlash kodi",
    html,
    text: `OTP: ${otp}. Ushbu kod faqat 2 daqiqa amal qiladi`,
  });
};

module.exports = emailService;
