import express from "express";
import { getPool } from "../db.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = express.Router();

/**
 * GET /admin/stats
 * returns: { students, advisors, bookings, requests }
 */
router.get("/stats", requireAuth, requireRole("admin"), async (req, res) => {
  try {
    const pool = await getPool();
    const r = await pool.request().execute("core.usp_Admin_GetStats");
    return res.json(r.recordset?.[0] || { students: 0, advisors: 0, bookings: 0, requests: 0 });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Server error" });
  }
});

export default router;
