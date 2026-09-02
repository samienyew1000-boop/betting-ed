const jwt = require("jsonwebtoken");

function authRequired(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) {
    return res.status(401).json({ ok: false, error: "Authentication required" });
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: payload.sub, email: payload.email };
    next();
  } catch {
    return res.status(401).json({ ok: false, error: "Invalid or expired session" });
  }
}

function signToken(user) {
  return jwt.sign({ email: user.email }, process.env.JWT_SECRET, {
    subject: String(user.id),
    expiresIn: "30d",
  });
}

module.exports = { authRequired, signToken };
