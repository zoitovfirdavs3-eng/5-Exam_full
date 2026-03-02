class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

const notFound = (req, res, next) => {
  next(new HttpError(404, "Route not found"));
};

const errorHandler = (err, req, res, next) => {
  const status = err.status || 500;

  // CORS xatosini ham chiroyli qaytaramiz
  const message =
    err.message?.startsWith("CORS:")
      ? err.message
      : err.message || "Internal server error";

  if (process.env.NODE_ENV !== "production") {
    console.error("❌ ERROR:", err);
  }

  res.status(status).json({
    status,
    message,
  });
};

module.exports = { HttpError, notFound, errorHandler };
