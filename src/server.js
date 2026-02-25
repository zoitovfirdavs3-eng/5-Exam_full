require("dotenv").config();
const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");

const path = require("path");
const express = require("express");
const cookieParser = require("cookie-parser");
const swaggerUi = require("swagger-ui-express");

const mainRouter = require("./router/main.routes");
const dbConnection = require("./lib/db.service");
const swaggerConfig = require("./lib/swagger.config");
const logger = require("./lib/winston.service");

dbConnection().catch((e) => {
  console.error("❌ DB connection failed:", e?.message || e);
  process.exit(1);
});

const app = express();

const allowedOrigins = new Set([
  "http://localhost:5173",
  "https://5-exam-full.vercel.app",
]);

function isAllowedOrigin(origin) {
  if (!origin) return false;
  if (allowedOrigins.has(origin)) return true;

  // ✅ Vercel preview domenlari uchun (masalan: https://5-exam-full-xxxx.vercel.app)
  try {
    const host = new URL(origin).hostname;
    if (host.endsWith(".vercel.app")) return true;
  } catch (e) {}

  return false;
}

app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (isAllowedOrigin(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.setHeader("Access-Control-Max-Age", "86400");
    res.setHeader("Access-Control-Expose-Headers", "Set-Cookie");
  }

  if (req.method === "OPTIONS") return res.status(204).end();
  next();
});

app.use(express.json());
app.use(cookieParser());

app.use(
  "/car/photos",
  express.static(path.join(process.cwd(), "uploads", "carPhotos")),
);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerConfig));
app.use("/api", mainRouter);

app.get("/", (req, res) => res.send("OK"));

app.use((err, req, res, next) => {
  logger.error(err?.stack || err);
  res.status(err.status || 500).json({
    status: err.status || 500,
    message: err.message || "Internal Server Error",
  });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server is running on ${PORT}-port`));
