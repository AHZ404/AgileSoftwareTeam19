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
app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => res.json({ ok: true }));

app.use("/auth", authRoutes);
app.use("/admin", adminRoutes);
app.use("/advisor", advisorRoutes);
app.use("/student", studentRoutes);
app.use("/eav", eavRoutes);

// Helpful 404
app.use((req, res) => res.status(404).json({ error: "Not found" }));

const PORT = Number(process.env.PORT || 3000);
app.listen(PORT, () => console.log(`API listening on http://localhost:${PORT}`));
