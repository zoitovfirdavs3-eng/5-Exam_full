const { globalError, ClientError } = require("shokhijakhon-error-handler");
const UserModel = require("../models/User.model");
const { hash, compare } = require("bcrypt");
const otpGenerator = require("../utils/generators/otp.generator");
const emailService = require("../lib/mailer.service");
const {
  registerValidator,
  loginValidator,
  profileVerifiedValidator,
  resendOtpOrForgotPasswordValidator,
  changePasswordValidator,
} = require("../utils/validator/user.validator");
const jwtService = require("../lib/jwt.service");
const logger = require("../lib/winston.service");
const bcrypt = require("bcrypt");
const mailerService = require("../lib/mailer.service");

module.exports = {
  async REGISTER(req, res) {
    try {
      logger.debug(`REGISTER attempt with data: ${JSON.stringify(req.body)}`);
      let newUser = req.body;
      await registerValidator.validateAsync(newUser, { abortEarly: false });
      let findUser = await UserModel.findOne({ email: newUser.email });
      if (findUser) {
        logger.warn(`REGISTER failed: email already exists: ${newUser.email}`);
        throw new ClientError("User already exists !", 409);
      }
      newUser.password = await hash(newUser.password, 10);
      let { otp, otpTime } = otpGenerator();
      try {
        await mailerService.sendMail({
          from: process.env.SMTP_FROM,
          to: profileData.email,
          subject: "Your OTP Code",
          text: `Your OTP code is: ${otp}`,
        });
      } catch (err) {
        console.error("Mail failed but user created:", err.message);
      }
      await UserModel.create({
        ...newUser,
        otp,
        otpTime,
      });
      logger.info(`Code sent to email ${newUser.email}`);
      return res
        .status(201)
        .json({ message: "User successfully registered !", status: 201 });
    } catch (err) {
      logger.error(`REGISTER error: ${err.message}`);
      return globalError(err, res);
    }
  },
  async VERIFY(req, res) {
    try {
      logger.debug(`VERIFY request: ${JSON.stringify(req.body)}`);
      let profileData = req.body;
      await profileVerifiedValidator.validateAsync(profileData, {
        abortEarly: false,
      });
      let findUser = await UserModel.findOne({ email: profileData.email });
      if (!findUser) {
        logger.warn(`VERIFY failed: user not found (${profileData.email})`);
        throw new ClientError("User not found", 404);
      }
      let currentData = Date.now();
      if (currentData > findUser.otpTime) {
        logger.warn(`VERIFY failed: OTP expired for ${profileData.email}`);
        throw new ClientError("OTP expired", 400);
      }
      if (profileData.otp != findUser.otp) {
        logger.warn(`VERIFY failed: invalid OTP for ${profileData.email}`);
        throw new ClientError("OTP invalid", 400);
      }
      await UserModel.findOneAndUpdate(
        { email: profileData.email },
        { isVerified: true },
      );
      logger.info(`Email has been successfully verified: ${profileData.email}`);
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
      let profileData = req.body;
      await resendOtpOrForgotPasswordValidator.validateAsync(profileData, {
        abortEarly: false,
      });
      let findUser = await UserModel.findOne({ email: profileData.email });
      if (!findUser || findUser.isVerified) {
        logger.warn(
          `RESEND_OTP failed: user not found or already activated (${profileData.email})`,
        );
        throw new ClientError("User not found or already activated", 404);
      }
      let { otp, otpTime } = otpGenerator();
      await emailService(profileData.email, otp);
      logger.info(`Code sent to email ${profileData.email}`);
      await UserModel.findOneAndUpdate(
        { email: profileData.email },
        { otp, otpTime },
      );
      return res.json({ message: "OTP successfully resended" });
    } catch (err) {
      logger.error(`RESEND_OTP error: ${err.message}`);
      return globalError(err, res);
    }
  },
  async LOGIN(req, res) {
    try {
      logger.debug(`LOGIN attempt: ${req.body.email}`);
      let profileData = req.body;
      await loginValidator.validateAsync(profileData, { abortEarly: false });
      let findUser = await UserModel.findOne({ email: profileData.email });
      if (!findUser || !findUser.isVerified) {
        logger.warn(
          `LOGIN failed: user not found or user already activated -> ${profileData.email}`,
        );
        throw new ClientError("User not found or user already activated", 404);
      }

      const checkPassword = await bcrypt.compare(
        profileData.password,
        findUser.password,
      );

      if (!checkPassword) {
        logger.warn(`LOGIN failed: user not found -> ${profileData.email}`);
        throw new ClientError("User not found", 404);
      }
      let refreshToken = jwtService.createRefreshToken({
        sub: findUser._id,
        role: findUser.role,
      });
      let accessToken = jwtService.createAccessToken({
        sub: findUser._id,
        role: findUser.role,
      });

      await findUser.updateOne({ refresh_token: refreshToken });
      res.cookie("refresh_token", refreshToken, {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 90,
      });

      logger.info(`LOGIN success: ${profileData.email}`);
      return res.json({
        message: "User successfully logged in",
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

      const findUser = await UserModel.findOne({
        _id: payload.sub,
        refresh_token: refreshToken,
      });
      if (!findUser) throw new ClientError("Invalid refresh token", 403);

      const accessToken = jwtService.createAccessToken({
        sub: findUser._id,
        role: findUser.role,
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
      logger.dubug(`FORGOT_PASSWORD request: ${JSON.stringify(req.body)}`);
      let profileData = req.body;
      await resendOtpOrForgotPasswordValidator.validateAsync(profileData, {
        abortEarly: false,
      });
      let findUser = UserModel.findOne({ email: profileData.email });
      if (!findUser || findUser.isVerified) {
        logger.warn(
          `FORGOT_PASSWORD failed: user not found or already activated (${profileData.email})`,
        );
        throw new ClientError("User not found or user already activated", 404);
      }
      let { otp, otpTime } = otpGenerator();
      await emailService(profileData.email, otp);
      logger.info(`Code sent to email ${profileData.email}`);
      await UserModel.findOneAndUpdate(
        { email: profileData.email },
        { otp: otpTime },
      );
      return res.json({ message: "Password successfully forgotten" });
    } catch (err) {
      logger.error(`FORGOT_PASSWORD error: ${err.message}`);
      return globalError(err, res);
    }
  },
  async CHANGE_PASSWORD(req, res) {
    try {
      logger.debug(`CHANGE_PASSWORD attempt for: ${req.body.email}`);
      let profileData = req.body;
      await changePasswordValidator.validateAsync(profileData, {
        abortEarly: false,
      });
      let findUser = UserModel.findOne({ email: profileData.email });
      if (!findUser) {
        logger.warn(
          `CHANGE_PASSWORD failed: user not found ot already activated (${profileData.email})`,
        );
        throw new ClientError("User not found or already activated", 404);
      }
      let hash_password = await hash(profileData.new_password, 10);
      await UserModel.findOneAndUpdate(
        { email: profileData.email },
        { password: hash_password },
      );
      logger.info(`CHANGE_PASSWORD success: ${profileData.email}`);
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
