const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { HttpError } = require("../utils/errors");
const { signAccess, signRefresh, verifyRefresh } = require("../utils/jwt");

function setRefreshCookie(res, token) {
  const secure = String(process.env.COOKIE_SECURE || "true") === "true";
  res.cookie("refresh_token", token, {
    httpOnly: true,
    secure,
    sameSite: secure ? "none" : "lax",
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });
}

exports.register = async (req, res, next) => {
  try {
    const { first_name, last_name, age, email, password } = req.body;

    const exists = await User.findOne({ email: email.toLowerCase().trim() });
    if (exists) throw new HttpError(409, "Bu email allaqachon ro'yxatdan o'tgan");

    const password_hash = await bcrypt.hash(password, 10);

    const count = await User.countDocuments();
    const role = count === 0 ? "admin" : "user";

    const user = await User.create({
      first_name,
      last_name,
      age,
      email: email.toLowerCase().trim(),
      password: password_hash,
      role,
    });

    const accessToken = signAccess({ sub: user._id.toString(), role: user.role });
    const refreshToken = signRefresh({ sub: user._id.toString(), role: user.role });

    user.refresh_token = refreshToken;
    await user.save();

    setRefreshCookie(res, refreshToken);

    res.status(201).json({
      status: 201,
      message: "Muvaffaqiyatli ro'yxatdan o'tildi",
      accessToken,
      user: {
        id: user._id,
        first_name: user.first_name,
        last_name: user.last_name,
        age: user.age,
        email: user.email,
        role: user.role,
      },
    });
  } catch (e) {
    next(e);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new HttpError(400, "Email va parol kiritilishi shart");
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) throw new HttpError(401, "Email yoki parol noto'g'ri");

    const hash = user.password || user.password_hash;
    if (!hash) throw new HttpError(401, "Email yoki parol noto'g'ri");

    const ok = await bcrypt.compare(password, hash);
    if (!ok) throw new HttpError(401, "Email yoki parol noto'g'ri");

    const accessToken = signAccess({ sub: user._id.toString(), role: user.role });
    const refreshToken = signRefresh({ sub: user._id.toString(), role: user.role });

    user.refresh_token = refreshToken;
    await user.save();

    setRefreshCookie(res, refreshToken);

    res.json({
      status: 200,
      message: "Muvaffaqiyatli kirish",
      accessToken,
      user: {
        id: user._id,
        first_name: user.first_name,
        last_name: user.last_name,
        age: user.age,
        email: user.email,
        role: user.role,
      },
    });
  } catch (e) {
    next(e);
  }
};

exports.refresh = async (req, res, next) => {
  try {
    const token = req.cookies?.refresh_token;
    if (!token) throw new HttpError(401, "Refresh token topilmadi");

    const payload = verifyRefresh(token);

    const user = await User.findById(payload.sub);
    if (!user || user.refresh_token !== token)
      throw new HttpError(401, "Yaroqsiz refresh token");

    const accessToken = signAccess({ sub: user._id.toString(), role: user.role });

    res.json({ status: 200, message: "Yangilandi", accessToken });
  } catch (e) {
    next(e);
  }
};

exports.logout = async (req, res, next) => {
  try {
    const token = req.cookies?.refresh_token;
    if (token) {
      await User.updateOne({ refresh_token: token }, { $set: { refresh_token: null } });
    }
    res.clearCookie("refresh_token", { httpOnly: true, secure: true, sameSite: "none" });
    res.json({ status: 200, message: "Chiqildi" });
  } catch (e) {
    next(e);
  }
};
