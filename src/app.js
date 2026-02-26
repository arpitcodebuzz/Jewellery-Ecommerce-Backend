import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";

import path from "path";
import { fileURLToPath } from "url";

// Routes
// import webRoutes from "./common/Routes/web.routes.js";
import adminRoutes from "./common/routes/admin.routes.js";

// Swagger
import { swaggerSetupForAdmin } from "./common/config/adminSwaggerSetup.js";
// import { swaggerSetupForWeb } from "./common/config/webSwaggerSetup.js";

const app = express();

/* ==============================
   TRUST PROXY (IMPORTANT)
   ============================== */
// ✅ REQUIRED for express-rate-limit & cloud/proxy environments
app.set("trust proxy", 1);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* ==============================
   GLOBAL MIDDLEWARES
   ============================== */

// Security headers
app.use(helmet());

// CORS
app.use(
  cors({
    origin: true,
    credentials: true
  })
);

// Parse JSON request bodies
app.use(express.json());

// Parse form-data / x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

// Parse cookies
app.use(cookieParser());

/* ==============================
   STATIC FILES
   ============================== */
// existing uploads directory (images, etc.)
app.use(
  "/uploads",
  express.static(path.join(__dirname, "../public/uploads"), {
    index: false,
    maxAge: "7d"
  })
);

// ✅ Add this for test HTML & other static files
app.use(
  express.static(path.join(__dirname, "../public"), {
    maxAge: "1d"
  })
);



// serve the entire public folder so we can drop test pages there
app.use(express.static(path.join(__dirname, "../public"), { index: false }));
// note: accessing /test-chat.html will load the chat test UI

// serve admin panel static assets
app.use(
  "/admin-panel",
  express.static(path.join(__dirname, "../admin-panel"), { index: "index.html" })
);


/* ==============================
   API ROUTES
   ============================== */
app.use("/admin", adminRoutes);
// app.use("/api", webRoutes);

/* ==============================
   SWAGGER SETUP
   ============================== */
swaggerSetupForAdmin(app);
// swaggerSetupForWeb(app);

/* ==============================
   GLOBAL ERROR HANDLER
   ============================== */
app.use((err, req, res, next) => {
  // Multer file size error
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({
      success: false,
      message: "Image size must be less than 10 MB"
    });
  }

  // Multer file type error
  if (err.message === "Only image files are allowed") {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }

  const statusCode = err.status || 500;

  return res.status(statusCode).json({
    success: false,
    message: err.message
  });
});

export default app;
