const express = require("express");
const bcrypt = require("bcryptjs");
const { withStore, ensureWallet, creditWallet, nextUserId } = require("../db");
const { signToken } = require("../middleware/auth");

const router = express.Router();

router.post("/register", (req, res) => {
  const email = String(req.body.email || "").trim().toLowerCase();
  const password = String(req.body.password || "");
  const phone = String(req.body.phone || "").trim() || null;
  const displayName = String(req.body.displayName || "").trim() || email.split("@")[0];

  if (!email || !email.includes("@")) {
    return res.status(400).json({ ok: false, error: "Valid email is required" });
  }
  if (password.length < 6) {
    return res.status(400).json({ ok: false, error: "Password must be at least 6 characters" });
  }

  let userRow;
  try {
    userRow = withStore((store) => {
      if (store.users.some((u) => u.email === email)) {
        const err = new Error("Email already registered");
        err.code = "EMAIL_EXISTS";
        throw err;
      }
      const row = {
        id: nextUserId(store),
        email,
        phone,
        password_hash: bcrypt.hashSync(password, 10),
        display_name: displayName,
        created_at: new Date().toISOString(),
      };
      store.users.push(row);
      return row;
    });
  } catch (err) {
    if (err.code === "EMAIL_EXISTS") {
      return res.status(409).json({ ok: false, error: err.message });
    }
    throw err;
  }

  ensureWallet(userRow.id, process.env.CURRENCY || "ETB");

  const bonus = Number(process.env.WELCOME_BONUS || 1000);
  if (bonus > 0) {
    creditWallet(userRow.id, bonus, "welcome_bonus", "WELCOME", { note: "Hope Bet welcome bonus" });
  }

  const user = { id: userRow.id, email: userRow.email, displayName: userRow.display_name };
  const token = signToken(user);

  res.status(201).json({
    ok: true,
    token,
    user,
    welcomeBonus: bonus,
  });
});

router.post("/login", (req, res) => {
  const email = String(req.body.email || "").trim().toLowerCase();
  const password = String(req.body.password || "");

  const row = withStore((store) => store.users.find((u) => u.email === email));
  if (!row || !bcrypt.compareSync(password, row.password_hash)) {
    return res.status(401).json({ ok: false, error: "Invalid email or password" });
  }

  ensureWallet(row.id, process.env.CURRENCY || "ETB");
  const token = signToken({ id: row.id, email: row.email });

  res.json({
    ok: true,
    token,
    user: {
      id: row.id,
      email: row.email,
      displayName: row.display_name,
    },
  });
});

router.get("/me", require("../middleware/auth").authRequired, (req, res) => {
  const row = withStore((store) => store.users.find((u) => u.id === req.user.id));
  if (!row) return res.status(404).json({ ok: false, error: "User not found" });
  res.json({
    ok: true,
    user: {
      id: row.id,
      email: row.email,
      phone: row.phone,
      displayName: row.display_name,
      createdAt: row.created_at,
    },
  });
});

module.exports = router;
