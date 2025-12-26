import jwt from "jsonwebtoken";

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  // Dev-friendly fallback: allow ?userId=... and ?role=...
  if (!token) {
    const userId = req.query.userId ? Number(req.query.userId) : null;
    const role = req.query.role ? String(req.query.role) : null;
    if (userId && role) {
      req.user = { userId, role };
      return next();
    }
    return res.status(401).json({ error: "Missing Authorization token" });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { userId: payload.userId, role: payload.role };
    return next();
  } catch {
    return res.status(401).json({ error: "Invalid/expired token" });
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user?.role) return res.status(401).json({ error: "Not authenticated" });
    if (!roles.includes(req.user.role)) return res.status(403).json({ error: "Forbidden" });
    return next();
  };
}
