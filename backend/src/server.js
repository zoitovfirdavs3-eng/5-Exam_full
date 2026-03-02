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

// Startup diagnostics
console.log("🔍 Startup Diagnostics:");
console.log("  NODE_ENV:", process.env.NODE_ENV);
console.log("  PORT from env:", process.env.PORT);
console.log("  CORS_ORIGINS:", process.env.CORS_ORIGINS);
console.log("  MongoDB URI:", process.env.MONGO_URI ? "✅ Set" : "❌ Missing");
console.log("  Access Token Key:", process.env.ACCESS_TOKEN_KEY ? "✅ Set" : "❌ Missing");

const app = express();

app.set("trust proxy", 1); // render/proxy uchun

app.use(helmet());
app.use(morgan("dev"));
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// static uploads
const uploadsPath = path.join(__dirname, "..", "uploads");
console.log("📁 Serving uploads from:", uploadsPath);
app.use("/uploads", express.static(uploadsPath));

// ✅ CORS (MUHIM) — har doim ROUTE'lardan oldin turishi kerak
const origins = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: function (origin, cb) {
      console.log("🔍 CORS Debug:", {
        origin,
        allowedOrigins: origins,
        isAllowed: !origin || origins.includes(origin)
      });
      
      // Postman/curl kabi origin bo'lmasa ham ruxsat
      if (!origin) return cb(null, true);
      if (origins.includes(origin)) return cb(null, true);
      return cb(new Error("CORS: origin not allowed -> " + origin));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ✅ Preflight'ni 204 bilan yopib yuboramiz
app.options("*", cors());

app.get("/", (req, res) => res.json({ ok: true, message: "API is running" }));

app.use("/api", routes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 4000;

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
    
    const desiredPort = Number(process.env.PORT) || 4000;
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
