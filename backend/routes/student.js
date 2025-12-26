import express from "express";
import { getPool, sql } from "../db.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = express.Router();

/**
 * GET /student/courses
 * Uses auth token -> student userId
 * Dev fallback: /student/courses?userId=101&role=student
 */
router.get("/courses", requireAuth, requireRole("student"), async (req, res) => {
  try {
    const studentId = req.user.userId;
    const pool = await getPool();
    const r = await pool
      .request()
      .input("StudentId", sql.Int, studentId)
      .execute("core.usp_Student_GetCourses");

    return res.json(r.recordset || []);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Server error" });
  }
});

export default router;
