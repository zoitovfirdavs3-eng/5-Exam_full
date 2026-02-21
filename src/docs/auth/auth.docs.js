module.exports = {
  paths: {
    "/api/auth/register": {
      post: {
        summary: "Register user",
        tags: ["Users"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UserRegister" },
            },
          },
        },
        responses: {
          409: { description: "User already exists" },
          400: { description: "Validation error" },
          201: { description: "User successfully registered" },
        },
      },
    },
    "/api/auth/verify": {
      post: {
        summary: "Verify user",
        tags: ["Users"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UserVerify" },
            },
          },
        },
        responses: {
          404: { description: "User not found" },
          400: { description: "Validation error" },
          400: { description: "OTP expired" },
          400: { description: "OTP invalid" },
          200: { description: "Profile successfully verified" },
        },
      },
    },
    "/api/auth/resend/otp": {
      post: {
        summary: "Rensend otp for user",
        tags: ["Users"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/UserResendOtpOrForgotPassword" },
            },
          },
        },
        responses: {
          404: { description: "User not found or already activated" },
          400: { description: "Validation error" },
          200: { description: "OTP successfully resended" },
        },
      },
    },
    "/api/auth/login": {
      post: {
        summary: "Login user",
        tags: ["Users"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UserLogin" },
            },
          },
        },
        responses: {
          404: { description: "User not found or already activated" },
          404: { description: "User not found" },
          400: { description: "Validation error" },
          200: { description: "User successfully logged in" },
        },
      },
    },
    "/api/auth/refresh": {
      post: {
        summary: "Refresh token for user",
        tags: ["Users"],
        responses: {
          403: { description: "Forbidden request" },
          403: { description: "Invalid refresh token" },
          400: { description: "Validation error" },
          200: { description: "Access token successfully generated" },
        },
      },
    },
    "/api/auth/forgot/password": {
      post: {
        summary: "Forgot password",
        tags: ["Users"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/UserResendOtpOrForgotPassword" },
            },
          },
        },
        responses: {
          404: { description: "User not found or user already activated" },
          400: { description: "Validation error" },
          200: { description: "Password successfully forgotten" },
        },
      },
    },
    "/api/auth/change/password": {
      post: {
        summary: "Change password",
        tags: ["Users"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/UserChangePassword" },
            },
          },
        },
        responses: {
          404: { description: "User not found or user already activated" },
          400: { description: "Validation error" },
          200: { description: "Password successfully changed" },
        },
      },
    },
  },
};
