import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

import authRoutes from "./routes/auth.js";
import adminRoutes from "./routes/admin.js";
import advisorRoutes from "./routes/advisor.js";
import studentRoutes from "./routes/student.js";
import eavRoutes from "./routes/eav.js";

const app = express();

/* -------------------------
   Core middleware (ORDER MATTERS)
   ------------------------- */
app.use(cors());
app.use(express.json());                 // parse application/json
app.use(express.urlencoded({ extended: true })); // parse x-www-form-urlencoded

/* -------------------------
   Health check
   ------------------------- */
app.get("/health", (req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

/* -------------------------
   Routes
   ------------------------- */
app.use("/auth", authRoutes);
app.use("/admin", adminRoutes);
app.use("/advisor", advisorRoutes);
app.use("/student", studentRoutes);
app.use("/eav", eavRoutes);

/* -------------------------
   404 handler (no route matched)
   ------------------------- */
app.use((req, res) => {
  res.status(404).json({
    error: "Not found",
    path: req.originalUrl,
  });
});

/* -------------------------
   GLOBAL error handler (CRITICAL)
   This prevents silent 500 crashes
   ------------------------- */
app.use((err, req, res, next) => {
  console.error("🔥 API ERROR:", err);

  res.status(err.status || 500).json({
    error: "Server error",
    message: err.message || "Unexpected error",
  });
});

/* -------------------------
   Start server
   ------------------------- */
const PORT = Number(process.env.PORT || 3000);
app.listen(PORT, () => {
  console.log(`✅ API listening on http://localhost:${PORT}`);
});
