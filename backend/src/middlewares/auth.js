const { verifyAccess } = require("../utils/jwt");
const { HttpError } = require("../utils/errors");

module.exports = function auth(requiredRole = null) {
  return (req, res, next) => {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) return next(new HttpError(401, "Authorization token required"));

    const payload = verifyAccess(token);
    req.user = payload;

    if (requiredRole && payload.role !== requiredRole) {
      return next(new HttpError(403, "Forbidden"));
    }
    next();
  };
};
