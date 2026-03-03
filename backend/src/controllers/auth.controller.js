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
    path: "/",
    maxAge: 30 * 24 * 60 * 60 * 1000
  });
}

exports.register = async (req, res, next) => {
  try {
    const { first_name, last_name, age, email, password } = req.body;

    const exists = await User.findOne({ email });
    if (exists) throw new HttpError(409, "Email already exists");

    const password_hash = await bcrypt.hash(password, 10);

    // birinchi user admin bo'lib ketsin (xohlasangiz o'chirasiz)
    const count = await User.countDocuments();
    const role = count === 0 ? "admin" : "user";

    const user = await User.create({ first_name, last_name, age, email, password: password_hash, password_hash, role });

    const accessToken = signAccess({ sub: user._id.toString(), role: user.role });
    const refreshToken = signRefresh({ sub: user._id.toString(), role: user.role });

    user.refresh_token = refreshToken;
    await user.save();

    setRefreshCookie(res, refreshToken);

    res.status(201).json({
      status: 201,
      message: "Registered",
      accessToken,
      user: { id: user._id, first_name, last_name, age, email, role: user.role }
    });
  } catch (e) {
    next(e);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Debug: Log request details (without password)
    console.log("🔍 Backend Login Debug:", {
      email: email,
      hasPassword: !!password,
      emailLength: email?.length,
      passwordLength: password?.length
    });

    // Basic validation
    if (!email || !password) {
      console.log("❌ Missing email or password");
      throw new HttpError(400, "Email va parol kiritilishi shart");
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log("❌ Invalid email format");
      throw new HttpError(400, "Email formati noto'g'ri");
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    console.log("🔍 User lookup result:", {
      found: !!user,
      userId: user?._id,
      hasPassword: !!(user?.password || user?.password_hash)
    });

    if (!user) {
      console.log("❌ User not found");
      throw new HttpError(401, "Email yoki parol noto'g'ri");
    }

    const hash = user.password || user.password_hash;
    if (!hash) {
      console.log("❌ User password not found in DB");
      throw new HttpError(400, "Foydalanuvchi paroli topilmadi");
    }

    const ok = await bcrypt.compare(password, hash);
    console.log("🔍 Password comparison result:", { isValid: ok });

    if (!ok) {
      console.log("❌ Password comparison failed");
      throw new HttpError(401, "Email yoki parol noto'g'ri");
    }

    const accessToken = signAccess({ sub: user._id.toString(), role: user.role });
    const refreshToken = signRefresh({ sub: user._id.toString(), role: user.role });

    console.log("✅ Tokens created:", {
      hasAccessToken: !!accessToken,
      hasRefreshToken: !!refreshToken,
      userId: user._id.toString(),
      role: user.role
    });

    user.refresh_token = refreshToken;
    await user.save();

    setRefreshCookie(res, refreshToken);

    const responseData = {
      status: 200,
      message: "Muvaffaqiyatli kirish",
      accessToken,
      user: { 
        id: user._id, 
        first_name: user.first_name, 
        last_name: user.last_name, 
        age: user.age, 
        email: user.email, 
        role: user.role 
      }
    };

    console.log("✅ Login success, sending response:", {
      status: responseData.status,
      hasAccessToken: !!responseData.accessToken,
      hasUser: !!responseData.user
    });

    res.json(responseData);
  } catch (e) {
    console.error("❌ Backend Login Error:", {
      message: e.message,
      status: e.status,
      stack: e.stack
    });
    next(e);
  }
};

exports.refresh = async (req, res, next) => {
  try {
    const token = req.cookies?.refresh_token;
    if (!token) throw new HttpError(401, "Refresh token missing");

    const payload = verifyRefresh(token);

    const user = await User.findById(payload.sub);
    if (!user || user.refresh_token !== token) throw new HttpError(401, "Invalid refresh token");

    const accessToken = signAccess({ sub: user._id.toString(), role: user.role });

    res.json({ status: 200, message: "Refreshed", accessToken });
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
    const secure = String(process.env.COOKIE_SECURE || "true") === "true";
    res.clearCookie("refresh_token", { 
      httpOnly: true, 
      secure, 
      sameSite: secure ? "none" : "lax",
      path: "/"
    });
    res.json({ status: 200, message: "Logged out" });
  } catch (e) {
    next(e);
  }
};
