const logger = require("./winston.service");

module.exports = function globalError(err, res) {
  // Render loglarda ko‘rinsin
  logger.error(err?.stack || err);

  return res.status(err.status || 500).json({
    status: err.status || 500,
    message: err.message || "Internal Server Error",
  });
};