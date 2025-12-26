import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { getPool, sql } from "../db.js";

const router = express.Router();

/**
 * POST /auth/login
 * body: { email, password }
 * returns: { user: {userId, firstName, lastName, email, role}, token }
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: "email and password are required" });

    const pool = await getPool();
    const result = await pool
      .request()
      .input("Email", sql.NVarChar(256), String(email).trim())
      .execute("core.usp_User_GetByEmail");

    const u = result.recordset?.[0];
    if (!u) return res.status(401).json({ error: "Invalid credentials" });

    const ok = await bcrypt.compare(String(password), u.PasswordHash);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    const user = {
      userId: u.UserId,
      firstName: u.FirstName,
      lastName: u.LastName,
      email: u.Email,
      role: u.RoleName,
    };

    const token = jwt.sign(
      { userId: user.userId, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );

    return res.json({ user, token });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Server error" });
  }
});

export default router;
