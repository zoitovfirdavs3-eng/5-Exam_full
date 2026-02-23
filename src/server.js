require("dotenv").config();
const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");
const path = require("path");
const express = require("express");
const cookieParser = require("cookie-parser");
const fileUpload = require("express-fileupload");
const swaggerUi = require("swagger-ui-express");

const mainRouter = require("./router/main.routes");
const dbConnection = require("./lib/db.service");
const swaggerConfig = require("./lib/swagger.config");

dbConnection().catch((e) => {
  console.error("❌ DB connection failed:", e?.message || e);
  process.exit(1);
});

const app = express();

/**
 * ✅ CORS (Vercel + Local)
 * - credentials:true ishlatyapsiz, shuning uchun origin * bo'la olmaydi
 * - Preflight (OPTIONS) 204 qaytaradi
 */
const allowedOrigins = new Set([
  "http://localhost:5173",
  "https://5-exam-full.vercel.app",
]);

app.use((req, res, next) => {
  const origin = req.headers.origin;

  // Origin bo'lsa va allow listda bo'lsa — headerlarni qo'yamiz
  if (origin && allowedOrigins.has(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");

    // Cookie ishlashi uchun
    res.setHeader("Access-Control-Allow-Credentials", "true");

    // Preflight uchun
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET,POST,PUT,PATCH,DELETE,OPTIONS"
    );
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization"
    );

    // (ixtiyoriy) cache preflight
    res.setHeader("Access-Control-Max-Age", "86400");
  }

  // ✅ OPTIONS bo'lsa shu yerda tugatamiz
  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  next();
});

// ✅ Body parsers va boshqa middlewarelar
app.use(express.json());
app.use(cookieParser());
app.use(
  fileUpload({
    useTempFiles: false,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  })
);

// ✅ Static files
app.use(
  "/car/photos",
  express.static(path.join(process.cwd(), "uploads", "carPhotos"))
);

// ✅ Swagger
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerConfig));

// ✅ API routes
app.use("/api", mainRouter);

// ✅ Health check (Render tekshirishi uchun foydali)
app.get("/", (req, res) => res.send("OK"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server is running on ${PORT}-port`));
