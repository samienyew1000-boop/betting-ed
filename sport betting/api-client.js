(function () {
  "use strict";

  const cfg = () => window.HOPE_BET_CONFIG || {};
  const apiUrl = () => String(cfg().API_URL || "").replace(/\/$/, "");

  function getToken() {
    return localStorage.getItem(cfg().TOKEN_KEY || "hope-bet-token");
  }

  function setSession(token, user) {
    localStorage.setItem(cfg().TOKEN_KEY || "hope-bet-token", token);
    localStorage.setItem(cfg().USER_KEY || "hope-bet-user", JSON.stringify(user || {}));
  }

  function clearSession() {
    localStorage.removeItem(cfg().TOKEN_KEY || "hope-bet-token");
    localStorage.removeItem(cfg().USER_KEY || "hope-bet-user");
  }

  function getUser() {
    try {
      return JSON.parse(localStorage.getItem(cfg().USER_KEY || "hope-bet-user") || "null");
    } catch {
      return null;
    }
  }

  function isEnabled() {
    return Boolean(apiUrl());
  }

  async function request(path, options = {}) {
    const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(`${apiUrl()}${path}`, { ...options, headers });
    let data = null;
    try {
      data = await res.json();
    } catch {
      data = { ok: false, error: "Invalid server response" };
    }
    if (!res.ok) {
      const err = new Error(data.error || `Request failed (${res.status})`);
      err.status = res.status;
      err.data = data;
      throw err;
    }
    return data;
  }

  async function register(payload) {
    const data = await request("/api/auth/register", { method: "POST", body: JSON.stringify(payload) });
    setSession(data.token, data.user);
    return data;
  }

  async function login(payload) {
    const data = await request("/api/auth/login", { method: "POST", body: JSON.stringify(payload) });
    setSession(data.token, data.user);
    return data;
  }

  async function fetchBalance() {
    return request("/api/wallet/balance");
  }

  async function placeBet(payload) {
    return request("/api/bets/place", { method: "POST", body: JSON.stringify(payload) });
  }

  async function fetchHistory() {
    return request("/api/bets/history");
  }

  async function devSettle(ticketId, won) {
    return request(`/api/bets/dev/settle/${encodeURIComponent(ticketId)}`, {
      method: "POST",
      body: JSON.stringify({ won }),
    });
  }

  window.HopeBetAPI = {
    isEnabled,
    getToken,
    getUser,
    clearSession,
    register,
    login,
    fetchBalance,
    placeBet,
    fetchHistory,
    devSettle,
    apiUrl,
  };
})();
