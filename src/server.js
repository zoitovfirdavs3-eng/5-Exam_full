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
const allowedOrigins = [
  "http://localhost:5173",
  "https://5-exam-full.vercel.app",
];

// ✅ Preflight'ni qo'l bilan yopamiz (eng ishonchli yo'l)
app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (origin && allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
    res.header("Vary", "Origin");
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  }

  // ✅ OPTIONS bo'lsa shu yerda qaytarib yuboramiz
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});
app.use(express.json());
app.use(cookieParser());
app.use(fileUpload());
app.use("/car/photos", express.static( path.join(process.cwd(), "uploads", "carPhotos") ));

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerConfig));

app.use("/api", mainRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server is running on ${PORT}-port`));