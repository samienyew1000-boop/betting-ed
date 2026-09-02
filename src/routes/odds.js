const express = require("express");

const router = express.Router();
const ODDS_BASE = process.env.ODDS_API_BASE || "https://multi-shop-games-2.onrender.com/api/games/sportsbook";
const BOOKMAKER = process.env.BOOKMAKER || "8";

async function proxyJson(path) {
  const res = await fetch(`${ODDS_BASE}${path}`);
  if (!res.ok) {
    const err = new Error(`Odds upstream ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return res.json();
}

router.get("/fixtures/upcoming", async (_req, res) => {
  try {
    const data = await proxyJson(`/football/board/upcoming?bookmaker=${BOOKMAKER}`);
    res.json(data);
  } catch (err) {
    res.status(err.status || 502).json({ ok: false, error: "Failed to load fixtures" });
  }
});

router.get("/fixtures/prematch", async (req, res) => {
  const leagues = String(req.query.leagues || "39-140-61-88-78-135-40");
  try {
    const data = await proxyJson(`/football/board/prematch?bookmaker=${BOOKMAKER}&leagues=${encodeURIComponent(leagues)}`);
    res.json(data);
  } catch (err) {
    res.status(err.status || 502).json({ ok: false, error: "Failed to load fixtures" });
  }
});

router.get("/sidebar", async (_req, res) => {
  try {
    const data = await proxyJson(`/football/sidebar/summary?view=prematch&bookmaker=${BOOKMAKER}`);
    res.json(data);
  } catch (err) {
    res.status(err.status || 502).json({ ok: false, error: "Failed to load sidebar" });
  }
});

router.get("/countries/:country/leagues", async (req, res) => {
  const country = encodeURIComponent(req.params.country);
  try {
    const data = await proxyJson(`/football/countries/${country}/leagues?view=prematch&bookmaker=${BOOKMAKER}`);
    res.json(data);
  } catch (err) {
    res.status(err.status || 502).json({ ok: false, error: "Failed to load country leagues" });
  }
});

router.get("/fixture/:id/markets", async (req, res) => {
  try {
    const data = await proxyJson(`/football/odds/fixture/${req.params.id}?bookmaker=${BOOKMAKER}`);
    res.json(data);
  } catch (err) {
    res.status(err.status || 502).json({ ok: false, error: "Failed to load markets" });
  }
});

module.exports = router;
