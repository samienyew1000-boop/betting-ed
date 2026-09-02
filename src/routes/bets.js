const express = require("express");
const { withStore, debitWallet, creditWallet, nextTicketId } = require("../db");
const { authRequired } = require("../middleware/auth");

const router = express.Router();
const MIN_STAKE = Number(process.env.MIN_STAKE || 20);

function parseOdd(value) {
  const n = Number(value);
  return Number.isFinite(n) && n > 1 ? n : null;
}

router.post("/place", authRequired, (req, res) => {
  const stake = Number(req.body.stake);
  const mode = req.body.mode === "single" ? "single" : "multiple";
  const selections = Array.isArray(req.body.selections) ? req.body.selections : [];

  if (!Number.isFinite(stake) || stake < MIN_STAKE) {
    return res.status(400).json({ ok: false, error: `Minimum stake is ${MIN_STAKE}` });
  }
  if (!selections.length) {
    return res.status(400).json({ ok: false, error: "No selections in bet slip" });
  }

  const fixtureIds = new Set();
  const normalized = [];

  for (const sel of selections) {
    const fixtureId = Number(sel.fixtureId);
    const odd = parseOdd(sel.odd);
    if (!fixtureId || !odd) {
      return res.status(400).json({ ok: false, error: "Invalid selection data" });
    }
    if (fixtureIds.has(fixtureId)) {
      return res.status(400).json({ ok: false, error: "Only one selection per match allowed" });
    }
    fixtureIds.add(fixtureId);
    normalized.push({
      fixtureId,
      marketKey: String(sel.marketKey || ""),
      marketName: String(sel.marketName || ""),
      value: String(sel.value || ""),
      odd,
      homeName: String(sel.homeName || ""),
      awayName: String(sel.awayName || ""),
      kickoff: sel.kickoff || null,
    });
  }

  const totalOdds =
    mode === "single"
      ? normalized[normalized.length - 1].odd
      : normalized.reduce((acc, s) => acc * s.odd, 1);

  const potentialWin = Number((stake * totalOdds).toFixed(2));
  const ticketId = nextTicketId();

  try {
    debitWallet(req.user.id, stake, "bet_stake", ticketId, { mode, selections: normalized.length });
  } catch (err) {
    if (err.code === "INSUFFICIENT_BALANCE") {
      return res.status(400).json({ ok: false, error: "Insufficient balance" });
    }
    throw err;
  }

  withStore((store) => {
    store.bets.unshift({
      user_id: req.user.id,
      ticket_id: ticketId,
      stake,
      total_odds: Number(totalOdds.toFixed(4)),
      potential_win: potentialWin,
      status: "open",
      payout: 0,
      mode,
      selections: JSON.stringify(normalized),
      placed_at: new Date().toISOString(),
      settled_at: null,
    });
  });

  const wallet = withStore((store) => store.wallets[String(req.user.id)]);

  res.status(201).json({
    ok: true,
    ticket: {
      id: ticketId,
      stake,
      totalOdds: Number(totalOdds.toFixed(2)),
      potentialWin,
      status: "open",
      mode,
      bets: normalized,
      placedAt: new Date().toISOString(),
    },
    balance: wallet.balance,
    currency: wallet.currency,
  });
});

router.get("/history", authRequired, (req, res) => {
  const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 30));
  const rows = withStore((store) =>
    store.bets.filter((b) => b.user_id === req.user.id).slice(0, limit)
  );

  const tickets = rows.map((row) => ({
    id: row.ticket_id,
    stake: row.stake,
    totalOdds: row.total_odds,
    potentialWin: row.potential_win,
    status: row.status,
    payout: row.payout,
    mode: row.mode,
    bets: JSON.parse(row.selections),
    placedAt: row.placed_at,
    settledAt: row.settled_at,
  }));

  res.json({ ok: true, tickets });
});

router.post("/dev/settle/:ticketId", authRequired, (req, res) => {
  if (process.env.NODE_ENV === "production" && process.env.ALLOW_DEV_SETTLE !== "true") {
    return res.status(403).json({ ok: false, error: "Not available in production" });
  }

  const ticketId = req.params.ticketId;
  const won = Boolean(req.body.won);

  const row = withStore((store) =>
    store.bets.find((b) => b.ticket_id === ticketId && b.user_id === req.user.id && b.status === "open")
  );

  if (!row) return res.status(404).json({ ok: false, error: "Open ticket not found" });

  const payout = won ? row.potential_win : 0;

  withStore((store) => {
    const bet = store.bets.find((b) => b.ticket_id === ticketId);
    if (!bet) return;
    bet.status = won ? "won" : "lost";
    bet.payout = payout;
    bet.settled_at = new Date().toISOString();
  });

  if (won && payout > 0) {
    creditWallet(req.user.id, payout, "bet_win", ticketId, { ticketId });
  }

  const wallet = withStore((store) => store.wallets[String(req.user.id)]);

  res.json({
    ok: true,
    ticketId,
    status: won ? "won" : "lost",
    payout,
    balance: wallet.balance,
  });
});

module.exports = router;
