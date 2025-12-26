import express from "express";
import { getPool, sql } from "../db.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = express.Router();

/**
 * GET /advisor/overview
 * returns: { bookingsPending, bookingsApproved, requestsPending }
 */
router.get("/overview", requireAuth, requireRole("advisor"), async (req, res) => {
  try {
    const advisorId = req.user.userId;
    const pool = await getPool();
    const r = await pool
      .request()
      .input("AdvisorId", sql.Int, advisorId)
      .execute("core.usp_Advisor_GetOverview");

    return res.json(r.recordset?.[0] || { bookingsPending: 0, bookingsApproved: 0, requestsPending: 0 });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Server error" });
  }
});

export default router;
