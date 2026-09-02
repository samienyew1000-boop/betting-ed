const fs = require("fs");
const path = require("path");

const dataDir = path.join(__dirname, "..", "data");
const storePath = path.join(dataDir, "store.json");

if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

function defaultStore() {
  return {
    users: [],
    wallets: {},
    bets: [],
    transactions: [],
    counters: { user: 0, bet: 0, tx: 0 },
  };
}

function loadStore() {
  if (!fs.existsSync(storePath)) {
    const store = defaultStore();
    fs.writeFileSync(storePath, JSON.stringify(store, null, 2));
    return store;
  }
  try {
    return { ...defaultStore(), ...JSON.parse(fs.readFileSync(storePath, "utf8")) };
  } catch {
    const store = defaultStore();
    fs.writeFileSync(storePath, JSON.stringify(store, null, 2));
    return store;
  }
}

function saveStore(store) {
  fs.writeFileSync(storePath, JSON.stringify(store, null, 2));
}

function withStore(mutator) {
  const store = loadStore();
  const result = mutator(store);
  saveStore(store);
  return result;
}

function getWallet(userId) {
  const store = loadStore();
  return store.wallets[String(userId)] || null;
}

function ensureWallet(userId, currency = "ETB") {
  return withStore((store) => {
    const key = String(userId);
    if (!store.wallets[key]) {
      store.wallets[key] = { user_id: userId, balance: 0, currency, updated_at: new Date().toISOString() };
    }
    return { ...store.wallets[key] };
  });
}

function addTransaction(store, userId, type, amount, balanceAfter, reference, meta) {
  store.counters.tx += 1;
  store.transactions.unshift({
    id: store.counters.tx,
    user_id: userId,
    type,
    amount,
    balance_after: balanceAfter,
    reference: reference || null,
    meta: meta || null,
    created_at: new Date().toISOString(),
  });
  if (store.transactions.length > 5000) store.transactions.length = 5000;
}

function creditWallet(userId, amount, type, reference, meta) {
  return withStore((store) => {
    const key = String(userId);
    if (!store.wallets[key]) {
      store.wallets[key] = { user_id: userId, balance: 0, currency: "ETB", updated_at: new Date().toISOString() };
    }
    const wallet = store.wallets[key];
    wallet.balance = Number((wallet.balance + amount).toFixed(2));
    wallet.updated_at = new Date().toISOString();
    addTransaction(store, userId, type, amount, wallet.balance, reference, meta);
    return wallet.balance;
  });
}

function debitWallet(userId, amount, type, reference, meta) {
  return withStore((store) => {
    const key = String(userId);
    if (!store.wallets[key]) {
      store.wallets[key] = { user_id: userId, balance: 0, currency: "ETB", updated_at: new Date().toISOString() };
    }
    const wallet = store.wallets[key];
    if (wallet.balance < amount) {
      const err = new Error("Insufficient balance");
      err.code = "INSUFFICIENT_BALANCE";
      throw err;
    }
    wallet.balance = Number((wallet.balance - amount).toFixed(2));
    wallet.updated_at = new Date().toISOString();
    addTransaction(store, userId, type, -amount, wallet.balance, reference, meta);
    return wallet.balance;
  });
}

function nextTicketId() {
  return withStore((store) => {
    store.counters.bet += 1;
    return `HB-${String(store.counters.bet).padStart(6, "0")}`;
  });
}

function nextUserId(store) {
  store.counters.user += 1;
  return store.counters.user;
}

module.exports = {
  loadStore,
  saveStore,
  withStore,
  getWallet,
  ensureWallet,
  creditWallet,
  debitWallet,
  nextTicketId,
  nextUserId,
};
