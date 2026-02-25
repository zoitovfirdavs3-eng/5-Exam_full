module.exports = () => {
  // 000000 - 999999 (leading zero ham bo'lishi mumkin)
  const otp = String(Math.floor(Math.random() * 1000000)).padStart(6, "0");
  const otpTime = new Date(Date.now() + 2 * 60 * 1000); // 2 daqiqa
  return { otp, otpTime };
};