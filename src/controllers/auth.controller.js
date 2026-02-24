const { ClientError } = require("shokhijakhon-error-handler");
const bcrypt = require("bcrypt");

const UserModel = require("../models/User.model");
const otpGenerator = require("../utils/generators/otp.generator");
const emailService = require("../lib/mailer.service");
const jwtService = require("../lib/jwt.service");
const logger = require("../lib/winston.service");
const {
  registerValidator,
  loginValidator,
  profileVerifiedValidator,
  resendOtpOrForgotPasswordValidator,
  changePasswordValidator,
} = require("../utils/validator/user.validator");
const globalError = require("../lib/global-error");

module.exports = {
  async REGISTER(req, res) {
    try {
      logger.debug(`REGISTER attempt with data: ${JSON.stringify(req.body)}`);

      const newUser = req.body;
      await registerValidator.validateAsync(newUser, { abortEarly: false });

      const exists = await UserModel.findOne({ email: newUser.email });
      if (exists) throw new ClientError("User already exists !", 409);

      const passwordHash = await bcrypt.hash(newUser.password, 10);
      const { otp, otpTime } = otpGenerator();
      // ✅ OTP email yuboriladi (xato bo‘lsa REGISTER ham xato qaytaradi)
      await emailService(newUser.email, otp);

await UserModel.create({
        ...newUser,
        password: passwordHash,
        otp,
        otpTime,
      });

      return res.status(201).json({
        message: "User successfully registered !",
        status: 201,
      });
    } catch (err) {
      // Mongo duplicate key
      if (err?.code === 11000) {
        return res.status(409).json({
          status: 409,
          message: "Bu email allaqachon ro‘yxatdan o‘tgan",
        });
      }
      logger.error(`REGISTER error: ${err.message}`);
      return globalError(err, res);
    }
  },

  async VERIFY(req, res) {
    try {
      logger.debug(`VERIFY request: ${JSON.stringify(req.body)}`);

      const profileData = req.body;
      await profileVerifiedValidator.validateAsync(profileData, {
        abortEarly: false,
      });

      const user = await UserModel.findOne({ email: profileData.email });
      if (!user) throw new ClientError("User not found", 404);
      if (user.isVerified) {
        return res.json({ message: "Profile already verified", status: 200 });
      }

      const now = Date.now();
      if (!user.otpTime || now > user.otpTime)
        throw new ClientError("OTP expired", 400);
      if (Number(profileData.otp) !== Number(user.otp))
        throw new ClientError("OTP invalid", 400);

      await UserModel.findOneAndUpdate(
        { email: profileData.email },
        { isVerified: true, otp: null, otpTime: null },
      );

      return res.json({
        message: "Profile successfully verified",
        status: 200,
      });
    } catch (err) {
      logger.error(`VERIFY error: ${err.message}`);
      return globalError(err, res);
    }
  },

  async RESEND_OTP(req, res) {
    try {
      logger.debug(`RESEND_OTP attempt: ${JSON.stringify(req.body)}`);

      const profileData = req.body;
      await resendOtpOrForgotPasswordValidator.validateAsync(profileData, {
        abortEarly: false,
      });

      const user = await UserModel.findOne({ email: profileData.email });
      if (!user) throw new ClientError("User not found", 404);
      if (user.isVerified) throw new ClientError("User already activated", 400);

      const { otp, otpTime } = otpGenerator();

      // ✅ 1) avval email yuboramiz
      await emailService(profileData.email, otp);

      // ✅ 2) email muvaffaqiyatli bo‘lsa keyin DB update
      await UserModel.findOneAndUpdate(
        { email: profileData.email },
        { otp, otpTime },
        { new: true },
      );

      return res.json({ message: "OTP successfully resent", status: 200 });
    } catch (err) {
      logger.error(`RESEND_OTP error: ${err?.message || err}`);
      return globalError(err, res);
    }
  },

  async LOGIN(req, res) {
    try {
      logger.debug(`LOGIN attempt: ${req.body.email}`);

      const profileData = req.body;
      await loginValidator.validateAsync(profileData, { abortEarly: false });

      // ✅ Admin bootstrap (env orqali)
      // .env:
      // ADMIN_EMAIL=...
      // ADMIN_PASSWORD=...
      if (
        process.env.ADMIN_EMAIL &&
        process.env.ADMIN_PASSWORD &&
        profileData.email === process.env.ADMIN_EMAIL &&
        profileData.password === process.env.ADMIN_PASSWORD
      ) {
        let adminUser = await UserModel.findOne({ email: profileData.email });
        if (!adminUser) {
          adminUser = await UserModel.create({
            first_name: "Admin",
            last_name: "Admin",
            age: 18,
            email: profileData.email,
            password: await bcrypt.hash(profileData.password, 10),
            isVerified: true,
            role: "admin",
          });
        } else if (adminUser.role !== "admin") {
          await adminUser.updateOne({ role: "admin", isVerified: true });
        }

        const refreshToken = jwtService.createRefreshToken({
          sub: adminUser._id,
          role: "admin",
        });
        const accessToken = jwtService.createAccessToken({
          sub: adminUser._id,
          role: "admin",
        });
        await adminUser.updateOne({ refresh_token: refreshToken });
        res.cookie("refresh_token", refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
          maxAge: 1000 * 60 * 60 * 24 * 90,
        });
        return res.json({
          message: "Admin successfully logged in",
          status: 200,
          accessToken,
        });
      }

      const user = await UserModel.findOne({ email: profileData.email });
      if (!user || !user.isVerified)
        throw new ClientError("User not found or not verified", 404);

      const ok = await bcrypt.compare(profileData.password, user.password);
      if (!ok) throw new ClientError("User not found", 404);

      const refreshToken = jwtService.createRefreshToken({
        sub: user._id,
        role: user.role,
      });
      const accessToken = jwtService.createAccessToken({
        sub: user._id,
        role: user.role,
      });

      await user.updateOne({ refresh_token: refreshToken });
      res.cookie("refresh_token", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        maxAge: 1000 * 60 * 60 * 24 * 90,
      });

      return res.json({
        message: "User successfully logged in",
        status: 200,
        accessToken,
      });
    } catch (err) {
      logger.error(`LOGIN error: ${err.message}`);
      return globalError(err, res);
    }
  },

  async REFRESH(req, res) {
    try {
      const refreshToken = req.cookies?.refresh_token;
      if (!refreshToken) throw new ClientError("Forbidden request", 403);

      let payload;
      try {
        payload = jwtService.parseRefreshToken(refreshToken);
      } catch (e) {
        throw new ClientError("Invalid refresh token", 403);
      }

      const user = await UserModel.findOne({
        _id: payload.sub,
        refresh_token: refreshToken,
      });
      if (!user) throw new ClientError("Invalid refresh token", 403);

      const accessToken = jwtService.createAccessToken({
        sub: user._id,
        role: user.role,
      });

      return res.json({
        message: "Access token successfully generated !",
        status: 200,
        accessToken,
      });
    } catch (err) {
      return globalError(err, res);
    }
  },

  async FORGOT_PASSWORD(req, res) {
    try {
      logger.debug(`FORGOT_PASSWORD request: ${JSON.stringify(req.body)}`);

      const profileData = req.body;
      await resendOtpOrForgotPasswordValidator.validateAsync(profileData, {
        abortEarly: false,
      });

      const user = await UserModel.findOne({ email: profileData.email });
      if (!user) throw new ClientError("User not found", 404);
      const { otp, otpTime } = otpGenerator();
      // ✅ OTP email yuboriladi (xato bo‘lsa endpoint xato qaytaradi)
      await emailService(profileData.email, otp);

await UserModel.findOneAndUpdate(
        { email: profileData.email },
        { otp, otpTime },
      );

      return res.json({ message: "OTP sent to email", status: 200 });
    } catch (err) {
      logger.error(`FORGOT_PASSWORD error: ${err.message}`);
      return globalError(err, res);
    }
  },

  async CHANGE_PASSWORD(req, res) {
    try {
      logger.debug(`CHANGE_PASSWORD attempt for: ${req.body.email}`);

      const profileData = req.body;
      await changePasswordValidator.validateAsync(profileData, {
        abortEarly: false,
      });

      const user = await UserModel.findOne({ email: profileData.email });
      if (!user) throw new ClientError("User not found", 404);

      const passwordHash = await bcrypt.hash(profileData.new_password, 10);
      await UserModel.findOneAndUpdate(
        { email: profileData.email },
        { password: passwordHash },
      );

      return res.json({
        message: "Password successfully changed",
        status: 200,
      });
    } catch (err) {
      logger.error(`CHANGE_PASSWORD error: ${err.message}`);
      return globalError(err, res);
    }
  },
};
