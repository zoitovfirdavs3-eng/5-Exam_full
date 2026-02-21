require("dotenv").config();
const path = require("path");
const express = require("express");
const mainRouter = require("./router/main.routes");
const dbConnection = require("./lib/db.service");
const cookieParser = require("cookie-parser");
const fileUpload = require("express-fileupload");
const swaggerUi = require("swagger-ui-express");
const swaggerConfig = require("./lib/swagger.config");

dbConnection().catch(() => process.exit(1));

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(fileUpload());
app.use("/car/photos", express.static( path.join(process.cwd(), "uploads", "carPhotos") ));

// app.use(cors({
//   origin: [
//     "http://localhost:5173",
//     "https://5-exam-full.vercel.app/"
//   ],
//   credentials: true,
// }));

const cors = require("cors");

const allowedOrigins = [
  "http://localhost:5173",
  "https://5-exam-full.vercel.app",
];

app.use(cors({
  origin: function (origin, cb) {
    // Postman/curl da origin bo'lmaydi -> ruxsat
    if (!origin) return cb(null, true);

    if (allowedOrigins.includes(origin)) return cb(null, true);

    return cb(new Error("CORS blocked: " + origin), false);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// ✅ Preflight requestlarni ham javob qaytaradigan qiling
app.options("*", cors());

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerConfig));

app.use("/api", mainRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server is running on ${PORT}-port`));