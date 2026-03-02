const { Router } = require("express");
const validate = require("../middlewares/validate");
const { registerSchema, loginSchema } = require("../validators/auth");
const ctrl = require("../controllers/auth.controller");

const r = Router();

r.post("/register", validate(registerSchema), ctrl.register);
r.post("/login", validate(loginSchema), ctrl.login);
r.get("/refresh", ctrl.refresh);
r.post("/logout", ctrl.logout);

module.exports = r;
