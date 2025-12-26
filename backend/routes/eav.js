import express from "express";
import { getPool, sql } from "../db.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

/**
 * GET /eav/:entityType/:entityId
 * returns array: [{ AttributeName, DataType, Value }]
 */
router.get("/:entityType/:entityId", requireAuth, async (req, res) => {
  try {
    const { entityType, entityId } = req.params;
    const pool = await getPool();
    const r = await pool
      .request()
      .input("EntityType", sql.NVarChar(50), entityType)
      .input("EntityId", sql.BigInt, Number(entityId))
      .execute("ext.usp_EntityAttribute_Get");

    return res.json(r.recordset || []);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Server error" });
  }
});

/**
 * POST /eav/:entityType/:entityId
 * body: { attributes: { key: value, ... } }
 */
router.post("/:entityType/:entityId", requireAuth, async (req, res) => {
  try {
    const { entityType, entityId } = req.params;
    const attrs = req.body?.attributes;
    if (!attrs || typeof attrs !== "object") return res.status(400).json({ error: "attributes object is required" });

    const pool = await getPool();

    for (const [name, value] of Object.entries(attrs)) {
      await pool
        .request()
        .input("EntityType", sql.NVarChar(50), entityType)
        .input("EntityId", sql.BigInt, Number(entityId))
        .input("AttributeName", sql.NVarChar(100), name)
        .input("ValueJson", sql.NVarChar(sql.MAX), JSON.stringify(value))
        .execute("ext.usp_EntityAttribute_SetJson");
    }

    return res.json({ ok: true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Server error" });
  }
});

export default router;
