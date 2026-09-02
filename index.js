require("dotenv").config();

const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const walletRoutes = require("./routes/wallet");
const betsRoutes = require("./routes/bets");
const oddsRoutes = require("./routes/odds");

const app = express();
const PORT = Number(process.env.PORT || 8787);

if (!process.env.JWT_SECRET || process.env.JWT_SECRET === "change-this-to-a-long-random-string") {
  console.warn("[hope-bet-api] Warning: set a strong JWT_SECRET in .env before production");
}

const origins = String(process.env.CORS_ORIGIN || "*")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, cb) {
      if (!origin || origins.includes("*") || origins.includes(origin)) return cb(null, true);
      return cb(null, false);
    },
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    service: "hope-bet-api",
    version: "1.0.0",
    currency: process.env.CURRENCY || "ETB",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/bets", betsRoutes);
app.use("/api/odds", oddsRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ ok: false, error: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`Hope Bet API running on http://127.0.0.1:${PORT}`);
});
