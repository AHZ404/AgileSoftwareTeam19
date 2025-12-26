import jwt from "jsonwebtoken";

/* -------------------------
   Authentication middleware
   ------------------------- */
export function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  /* -------------------------
     DEV MODE fallback (SAFE)
     ------------------------- */
  if (!token && process.env.NODE_ENV !== "production") {
    const userId = req.query.userId ? Number(req.query.userId) : null;
    const role = req.query.role ? String(req.query.role) : null;

    if (userId && role) {
      req.user = { userId, role };
      return next();
    }
  }

  if (!token) {
    return res.status(401).json({ error: "Missing Authorization token" });
  }

  /* -------------------------
     JWT verification
     ------------------------- */
  if (!process.env.JWT_SECRET) {
    console.error("❌ JWT_SECRET is not defined");
    return res.status(500).json({ error: "Server configuration error" });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    if (!payload?.userId || !payload?.role) {
      return res.status(401).json({ error: "Invalid token payload" });
    }

    req.user = {
      userId: payload.userId,
      role: payload.role,
    };

    return next();
  } catch (err) {
    return res.status(401).json({
      error: "Invalid or expired token",
      reason: err.message,
    });
  }
}

/* -------------------------
   Role-based authorization
   ------------------------- */
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    if (!req.user.role) {
      return res.status(401).json({ error: "Invalid user context" });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: "Forbidden",
        requiredRoles: roles,
        userRole: req.user.role,
      });
    }

    return next();
  };
}
