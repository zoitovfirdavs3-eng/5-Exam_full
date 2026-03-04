require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");

const connectDb = require("./utils/db");
const routes = require("./routes");
const { notFound, errorHandler } = require("./utils/errors");

// Trust proxy for Render deployment
const app = express();
app.set("trust proxy", 1);

// Startup diagnostics
console.log("🔍 Startup Diagnostics:");
console.log("  NODE_ENV:", process.env.NODE_ENV);
console.log("  PORT from env:", process.env.PORT);
console.log("  CORS_ORIGINS:", process.env.CORS_ORIGINS);
console.log("  MongoDB URI:", process.env.MONGO_URI ? "✅ Set" : "❌ Missing");
console.log("  Public Origin:", process.env.PUBLIC_ORIGIN || "❌ Missing");
console.log("  Cookie Secure:", process.env.COOKIE_SECURE);

const uploadsPath = path.join(__dirname, "uploads");

app.use(helmet());
app.use(morgan("dev"));
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// static uploads with CORS headers
console.log("📁 Serving uploads from:", uploadsPath);

// Serve static files with proper CORS headers
app.use("/uploads", (req, res, next) => {
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
  res.setHeader("Access-Control-Allow-Origin", "*");
  next();
}, express.static(uploadsPath));

// ✅ CORS (MUHIM) — har doim ROUTE'lardan oldin turishi kerak
const origins = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

console.log("🔍 CORS Origins Loaded:", origins);
console.log("🔍 NODE_ENV:", process.env.NODE_ENV);
console.log("🔍 COOKIE_SECURE:", process.env.COOKIE_SECURE);

app.use(
  cors({
    origin: function (origin, cb) {
      console.log("🔍 CORS Request Debug:", {
        origin,
        allowedOrigins: origins,
        isAllowed: !origin || origins.includes(origin),
        credentials: true
      });
      
      // Postman/curl kabi origin bo'lmasa ham ruxsat
      if (!origin) return cb(null, true);
      
      // EXACT origin matching - no wildcards for production
      if (origins.includes(origin)) {
        console.log("✅ CORS: Origin allowed ->", origin);
        return cb(null, true);
      }
      
      console.log("❌ CORS: Origin NOT allowed ->", origin);
      return cb(new Error("CORS: origin not allowed -> " + origin));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["Set-Cookie"],
    // Important: when credentials: true, origin cannot be "*"
    // This ensures only specific origins are allowed
    preflightContinue: true,
    optionsSuccessStatus: 204
  })
);

// ✅ Preflight'ni 204 bilan yopib yuboramiz
app.options("*", cors());

// ✅ Vary header for proper caching
app.use((req, res, next) => {
  res.header("Vary", "Origin");
  next();
});

app.get("/", (req, res) => res.json({ ok: true, message: "API is running" }));

// Debug endpoint to list uploads (public, no auth required)
app.get("/debug/uploads", (req, res) => {
  const fs = require("fs");
  const uploadsPath = path.join(__dirname, "..", "uploads");
  
  try {
    const files = fs.readdirSync(uploadsPath);
    console.log("🔍 Uploads folder contents:", files);
    res.json({
      uploadsPath,
      files,
      count: files.length
    });
  } catch (error) {
    console.error("❌ Error reading uploads folder:", error);
    res.status(500).json({
      error: "Cannot read uploads folder",
      uploadsPath,
      message: error.message
    });
  }
});

app.use("/api", routes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

// Global error handlers
process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("🛑 SIGTERM received, shutting down gracefully");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("🛑 SIGINT received, shutting down gracefully");
  process.exit(0);
});

// Start server with port conflict handling
(async () => {
  try {
    await connectDb();
    console.log("✅ MongoDB connected");
    
    const desiredPort = Number(process.env.PORT) || 3000;
    const maxPortAttempts = 20;
    let currentPort = desiredPort;
    let server = null;
    
    // Port fallback logic (DEV only)
    const isDev = process.env.NODE_ENV !== "production";
    
    for (let attempt = 0; attempt < maxPortAttempts; attempt++) {
      try {
        server = await new Promise((resolve, reject) => {
          const srv = app.listen(currentPort, () => {
            console.log("✅ Server running on port", currentPort);
            console.log("🌐 Environment:", process.env.NODE_ENV || "development");
            console.log("🔗 API URL:", `http://localhost:${currentPort}/api`);
            
            // Update PORT in env for this session
            if (currentPort !== desiredPort) {
              console.log(`📝 Port ${desiredPort} was busy, using ${currentPort} instead`);
              if (isDev) {
                console.log(`💡 Frontend should use: VITE_API_URL=http://localhost:${currentPort}/api`);
              }
            }
            
            resolve(srv);
          });
          
          srv.on("error", (err) => {
            if (err.code === "EADDRINUSE") {
              reject(err);
            } else {
              resolve(srv);
            }
          });
        });
        
        // If we got a server, break the loop
        if (server) break;
        
      } catch (err) {
        if (err.code === "EADDRINUSE") {
          console.log(`🔄 Port ${currentPort} busy, trying next...`);
          currentPort++;
          continue;
        } else {
          throw err;
        }
      }
    }
    
    if (!server) {
      throw new Error(`Could not start server on any port from ${desiredPort} to ${currentPort - 1}`);
    }

    // Handle server errors
    server.on("error", (err) => {
      console.error("❌ Server error:", err);
      process.exit(1);
    });

  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
})();
