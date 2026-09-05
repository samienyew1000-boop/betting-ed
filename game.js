"use strict";

const STORAGE = "sport-betting-v1";
const API_BASE = "https://multi-shop-games-2.onrender.com/api/games/sportsbook";
const BOOKMAKER = 8;
const START_BALANCE = 0;
const MIN_STAKE = 20;
const QUICK_STAKES = [20, 50, 100, 500];
const CURRENCY = "ETB";

const api = () => window.HopeBetAPI;
const useApi = () => api() && api().isEnabled();

// --- Night mode theme logic ---
(function initTheme() {
  const saved = localStorage.getItem("hope-bet-theme");
  // Default to dark (night ON) if no preference saved
  const theme = saved || "dark";
  document.documentElement.setAttribute("data-theme", theme);
})();

function toggleNightMode() {
  const html = document.documentElement;
  const current = html.getAttribute("data-theme") || "light";
  const next = current === "dark" ? "light" : "dark";
  html.setAttribute("data-theme", next);
  localStorage.setItem("hope-bet-theme", next);
}

const LEAGUE_FILTERS = [
  { id: "all", label: "All Leagues" },
  { id: "top", label: "Top Leagues" },
  { id: 39, label: "Premier League", logo: "https://media.api-sports.io/football/leagues/39.png" },
  { id: 140, label: "La Liga", logo: "https://media.api-sports.io/football/leagues/140.png" },
  { id: 78, label: "Bundesliga", logo: "https://media.api-sports.io/football/leagues/78.png" },
  { id: 135, label: "Serie A", logo: "https://media.api-sports.io/football/leagues/135.png" },
  { id: 61, label: "Ligue 1", logo: "https://media.api-sports.io/football/leagues/61.png" },
  { id: 88, label: "Eredivisie", logo: "https://media.api-sports.io/football/leagues/88.png" },
];

const FOOTBALL_REGION_PRIORITY = ["England", "Europe", "Germany", "Italy", "Spain", "World", "Portugal", "Netherlands", "Belgium", "Turkey"];

const FOOTBALL_STATIC_LEAGUES = {
  England: [
    { id: 39, name: "Premier League" },
    { id: 40, name: "Championship" },
    { id: 41, name: "League One" },
    { id: 42, name: "League Two" },
    { id: 43, name: "National League" },
    { id: 45, name: "FA Cup" },
    { id: 48, name: "EFL Cup" },
    { id: 528, name: "Community Shield" },
    { id: 699, name: "Women's Super League" },
  ],
  Europe: [
    { id: 2, name: "UEFA Champions League" },
    { id: 3, name: "UEFA Europa League" },
    { id: 848, name: "UEFA Europa Conference League" },
    { id: 5, name: "UEFA Nations League" },
    { id: 1, name: "World Cup" },
  ],
  Germany: [
    { id: 78, name: "Bundesliga" },
    { id: 79, name: "2. Bundesliga" },
    { id: 81, name: "DFB Pokal" },
    { id: 529, name: "Super Cup" },
  ],
  Italy: [
    { id: 135, name: "Serie A" },
    { id: 136, name: "Serie B" },
    { id: 137, name: "Coppa Italia" },
    { id: 547, name: "Super Cup" },
  ],
  Spain: [
    { id: 140, name: "La Liga" },
    { id: 141, name: "Segunda Division" },
    { id: 143, name: "Copa del Rey" },
    { id: 556, name: "Super Cup" },
  ],
};

const SPORTS_MENU = [
  { 
    id: "football", 
    name: "Football", 
    count: 1380,
    icon: `<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 1 0 10 10A10.011 10.011 0 0 0 12 2zm0 18a7.95 7.95 0 0 1-5.18-1.92l1.62-3.15a1 1 0 0 0-.17-1.15l-2.43-2.43 2.76-2.07a1 1 0 0 0 .37-1.11L7.85 4.79A8 8 0 0 1 12 4a7.95 7.95 0 0 1 4.15.79l-1.12 3.38a1 1 0 0 0 .37 1.11l2.76 2.07-2.43 2.43a1 1 0 0 0-.17 1.15l1.62 3.15A7.95 7.95 0 0 1 12 20z"/></svg>`
  },
  { 
    id: "basketball", 
    name: "Basketball", 
    count: 63,
    icon: `<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 2v20M2 12h20M4.93 4.93a10 10 0 0 1 14.14 0M4.93 19.07a10 10 0 0 0 14.14 0" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>`
  },
  { 
    id: "tennis", 
    name: "Tennis", 
    count: 150,
    icon: `<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"/><path d="M4.5 4.5c4 4 4 11 0 15M19.5 4.5c-4 4-4 11 0 15" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>`
  },
  { 
    id: "hockey", 
    name: "Ice Hockey", 
    count: 112,
    icon: `<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M4 3h2v12.5a3.5 3.5 0 0 0 3.5 3.5H12v2H9.5A5.5 5.5 0 0 1 4 15.5V3zm16 0h-2v12.5a3.5 3.5 0 0 1-3.5 3.5H12v2h2.5A5.5 5.5 0 0 0 20 15.5V3z"/></svg>`
  },
  { 
    id: "volleyball", 
    name: "Volleyball", 
    count: 17,
    icon: `<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 2a10 10 0 0 0 0 20M2 12a10 10 0 0 0 10 10M12 12L3.5 7M12 12l8.5-5M12 12v9.8" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>`
  },
  { 
    id: "rugby", 
    name: "Rugby Union", 
    count: 42,
    icon: `<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><ellipse cx="12" cy="12" rx="9" ry="6" transform="rotate(-45 12 12)" fill="none" stroke="currentColor" stroke-width="2"/><line x1="5.6" y1="5.6" x2="18.4" y2="18.4" stroke="currentColor" stroke-width="1.5"/></svg>`
  },
  { 
    id: "table-tennis", 
    name: "Table Tennis", 
    count: 214,
    icon: `<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="10" r="7" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 17v5M9 22h6" stroke="currentColor" stroke-width="2"/></svg>`
  },
];

const TIME_FILTERS_SIDEBAR = [
  { id: "all", label: "All", hours: null },
  { id: "3h", label: "3H", hours: 3 },
  { id: "6h", label: "6H", hours: 6 },
  { id: "9h", label: "9H", hours: 9 },
  { id: "12h", label: "12H", hours: 12 },
  { id: "24h", label: "24H", hours: 24 },
];

const TIME_FILTERS = [
  { id: "all", label: "All", hours: null },
  { id: "1h", label: "1H", hours: 1 },
  { id: "3h", label: "3H", hours: 3 },
  { id: "6h", label: "6H", hours: 6 },
  { id: "12h", label: "12H", hours: 12 },
  { id: "today", label: "Today", hours: "today" },
  { id: "tomorrow", label: "Tomorrow", hours: "tomorrow" },
  { id: "7d", label: "7D", hours: 168 },
];

const MARKET_TABS = [
  { id: "all", label: "All" },
  { id: "betbuilder", label: "Betbuilder", icon: "⚙" },
  { id: "main", label: "Main" },
  { id: "goals", label: "Goals" },
  { id: "handicap", label: "Handicap" },
  { id: "half1", label: "1st Half" },
  { id: "half2", label: "2nd Half" },
  { id: "htft", label: "Half Time/ Full Time" },
  { id: "score", label: "Correct Score" },
  { id: "combo", label: "Combo" },
  { id: "chance", label: "Chance Mix" },
  { id: "home", label: "Home" },
  { id: "away", label: "Away" },
  { id: "scorers", label: "Goalscorers" },
  { id: "asian", label: "Asian Markets" },
  { id: "corners", label: "Corners" },
  { id: "cards", label: "Cards" },
  { id: "minutes", label: "Minutes" },
  { id: "specials", label: "Football Specials" },
  { id: "players", label: "Players" },
];

const TOP_LEAGUE_IDS = new Set([39, 140, 61, 88, 78, 135, 40]);

const $ = (id) => document.getElementById(id);

const state = {
  balance: START_BALANCE,
  fixtures: [],
  liveFixtures: [],
  oddHistory: {},
  oddTrends: {},
  boardMarketMode: "main",
  leagueFilter: "top",
  countryFilter: null,
  timeFilter: "all",
  slip: [],
  slipMode: "multiple",
  stake: MIN_STAKE,
  betslipTab: "slip",
  history: [],
  ticketSeq: 1,
  liveSource: false,
  detailFixtureId: null,
  marketTab: "all",
  marketSearch: "",
  fixtureMarkets: {},
  expandedMarkets: new Set(),
  expandedSidebarCountries: new Set(),
  countryLeagues: {},
  leagueDropdown: null,
  leagueDropdownSearch: "",
  sidebar: { topLeagues: [], countries: [] },
  sessionUser: null,
  authTab: "login",
  adIndex: 0,
  adSlides: [],
  balanceHidden: false,
  eventSearch: "",
  sportFilter: "football",
  sportsMenuMode: false,
  expandedFootballRegions: new Set(["England", "Europe", "Germany", "Italy"]),
  checkedLeagueIds: new Set(),
  leaguePageIds: [],
  footballFiltersOpen: false,
  subNav: "sports",
  myBetsStatus: "in-course",
  myBetsTime: "today",
  myBetsSearch: "",
  expandedMyBetsTickets: new Set(),
  cashoutLocked: true,
  homeSelectedLeague: 39,
  homeLeagueLimit: 5,
  homeUpcomingLimit: 5,
  homePopularLimit: 5,
};

function load() {
  if (useApi()) return;
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE) || "{}");
    if (Number.isFinite(raw.balance) && raw.balance >= 0) state.balance = raw.balance;
    if (Array.isArray(raw.history)) state.history = raw.history.slice(0, 50);
    if (Number.isFinite(raw.ticketSeq) && raw.ticketSeq > 0) state.ticketSeq = raw.ticketSeq;
    if (Array.isArray(raw.slip)) state.slip = raw.slip;
    if (Number.isFinite(raw.stake) && raw.stake >= MIN_STAKE) state.stake = raw.stake;
    if (raw.slipMode === "single" || raw.slipMode === "multiple") state.slipMode = raw.slipMode;
  } catch (_) { }

  const savedCashoutLock = localStorage.getItem("hope_bet_cashout_locked");
  state.cashoutLocked = savedCashoutLock !== null ? (savedCashoutLock === "true") : true;

  if (!state.history || !state.history.length) {
    state.history = initMockMyBetsHistory();
  } else {
    const mock1 = state.history.find((t) => String(t.id) === "589519497");
    if (mock1 && mock1.bets && mock1.bets[0] && !mock1.bets[0].status) {
      mock1.bets[0].status = "lost";
      mock1.bets[0].isLive = false;
      if (mock1.bets[1]) {
        mock1.bets[1].status = "won";
        mock1.bets[1].isLive = false;
      }
    }
    const mock2 = state.history.find((t) => String(t.id) === "589414977");
    if (mock2) {
      mock2.cashout = 11.60;
    }
  }
}

function save() {
  if (useApi()) return;
  localStorage.setItem(
    STORAGE,
    JSON.stringify({
      balance: state.balance,
      history: state.history.slice(0, 50),
      ticketSeq: state.ticketSeq,
      slip: state.slip,
      stake: state.stake,
      slipMode: state.slipMode,
    })
  );
}

function fmt(n, d = 2) {
  return Number(n).toLocaleString("en-US", {
    minimumFractionDigits: d,
    maximumFractionDigits: d,
  });
}

function toast(msg, kind) {
  const el = $("toast");
  if (!el) return;
  el.textContent = msg;
  el.className = "toast" + (kind ? " is-" + kind : "");
  el.hidden = false;
  clearTimeout(toast._t);
  toast._t = setTimeout(() => {
    el.hidden = true;
  }, 2400);
}

function showBootError(err) {
  const el = $("boot-error");
  const message = err?.message || String(err || "Unknown error");
  console.error(err);
  if (el) {
    el.textContent = `Hope Bet could not start: ${message}`;
    el.hidden = false;
  }
}

function getSidebarData() {
  if (state.sidebar?.topLeagues?.length) return state.sidebar;
  const mock = buildMockSidebar();
  state.sidebar = mock;
  return mock;
}

function on(el, event, handler) {
  if (!el) return;
  el.addEventListener(event, handler);
}

function isMobileLayout() {
  return window.matchMedia("(max-width: 980px)").matches;
}

function closeMobileDrawers() {
  document.body.classList.remove("menu-open", "betslip-open", "account-open");
  const backdrop = $("mobile-drawer-backdrop");
  if (backdrop) backdrop.hidden = true;
}

function openMobileMenu() {
  document.body.classList.add("menu-open");
  document.body.classList.remove("betslip-open", "account-open");
  const backdrop = $("mobile-drawer-backdrop");
  if (backdrop) backdrop.hidden = false;
}

function openMobileBetslip() {
  document.body.classList.add("betslip-open");
  document.body.classList.remove("menu-open", "account-open");
  const backdrop = $("mobile-drawer-backdrop");
  if (backdrop) backdrop.hidden = false;
}

function openAccountDrawer() {
  renderAccountDrawer();
  document.body.classList.add("account-open");
  document.body.classList.remove("menu-open", "betslip-open");
  const backdrop = $("mobile-drawer-backdrop");
  if (backdrop) backdrop.hidden = false;
}

function renderAccountDrawer() {
  const guest = $("account-guest");
  const signed = $("account-signed");
  const nameEl = $("account-signed-name");
  if (!guest || !signed) return;
  const loggedIn = useApi() && state.sessionUser;
  guest.hidden = !!loggedIn;
  signed.hidden = !loggedIn;
  if (loggedIn && nameEl) {
    nameEl.textContent = state.sessionUser.displayName || state.sessionUser.email || "Account";
  }
}

function syncMobileSlipCount() {
  const count = state.slip.length;
  const countEl = $("mobile-slip-count");
  const oddsEl = $("mobile-slip-odds");
  const fab = $("mobile-slip-fab");
  if (countEl) countEl.textContent = String(count);
  if (oddsEl) oddsEl.textContent = totalOdds() ? totalOdds().toFixed(2) : "0.00";
  if (fab) fab.hidden = count === 0;
}

function renderMobileSportsStrip() {
  const el = $("mobile-sports-strip");
  if (!el) return;
  const footballCount = state.fixtures.length || 0;
  const counts = {
    football: footballCount,
    basketball: 50,
    tennis: 120,
    hockey: 45,
    volleyball: 30,
    rugby: 18,
  };
  el.innerHTML = `
    <button type="button" class="mobile-sport-chip" data-mobile-tool="check">
      <span class="sport-icon">🎫</span>
      <span>Check Bet</span>
    </button>
    <button type="button" class="mobile-sport-chip" data-mobile-tool="search">
      <span class="sport-icon">⌕</span>
      <span>Search</span>
    </button>
    <button type="button" class="mobile-sport-chip" data-mobile-tool="inplay">
      <span class="sport-icon">⏱</span>
      <span>IN-PLAY</span>
    </button>
    ${SPORTS_MENU.map(
    (s) => `
      <button type="button" class="mobile-sport-chip${state.sportFilter === s.id && state.sportsMenuMode ? " is-on" : ""}" data-mobile-sport="${s.id}">
        ${counts[s.id] ? `<em>${counts[s.id]}</em>` : ""}
        <span class="sport-icon">${s.icon}</span>
        <span>${s.name.split(" ")[0]}</span>
      </button>`
  ).join("")}`;
}

function renderMobileTimeStrip() {
  const el = $("mobile-time-strip");
  if (!el) return;
  const show = isMobileLayout() && (state.sportsMenuMode || isBoardSubNav());
  el.hidden = !show;
  if (!show) return;
  el.innerHTML = TIME_FILTERS_SIDEBAR.map(
    (f) =>
      `<button type="button" class="mobile-time-chip${state.timeFilter === f.id ? " is-on" : ""}" data-mobile-time="${f.id}">${f.label}</button>`
  ).join("");
}

function hoursFromNow(h) {
  return new Date(Date.now() + h * 3600000);
}

function endOfToday() {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d;
}

function startOfTomorrow() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfTomorrow() {
  const d = startOfTomorrow();
  d.setHours(23, 59, 59, 999);
  return d;
}

function startOfDayOffset(daysFromToday) {
  const d = new Date();
  d.setDate(d.getDate() + daysFromToday);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfDayOffset(daysFromToday) {
  const d = startOfDayOffset(daysFromToday);
  d.setHours(23, 59, 59, 999);
  return d;
}

function formatFootballFilterDate(daysFromToday) {
  return startOfDayOffset(daysFromToday).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "2-digit",
    year: "2-digit",
  });
}

function getFootballTimeFilterOptions() {
  const opts = [
    { id: "all", label: "All", hours: null },
    { id: "3h", label: "3H", hours: 3 },
    { id: "today", label: "Today", hours: "today" },
    { id: "tomorrow", label: "Tomorrow", hours: "tomorrow" },
  ];
  for (let offset = 2; offset <= 4; offset += 1) {
    opts.push({
      id: `day+${offset}`,
      label: formatFootballFilterDate(offset),
      hours: "date",
      dateStart: startOfDayOffset(offset).getTime(),
      dateEnd: endOfDayOffset(offset).getTime(),
    });
  }
  return opts;
}

function getTimeFilterDef(id) {
  return (
    getFootballTimeFilterOptions().find((t) => t.id === id) ||
    TIME_FILTERS.find((t) => t.id === id) ||
    TIME_FILTERS_SIDEBAR.find((t) => t.id === id)
  );
}

function buildMockFixtures() {
  const plLeague = { id: 39, name: "Premier League", country: "England", logo: "https://media.api-sports.io/football/leagues/39.png", flag: "https://media.api-sports.io/flags/gb-eng.svg" };
  const copaLeague = { id: 11, name: "Copa Sudamericana", country: "South America", logo: "https://media.api-sports.io/football/leagues/11.png", flag: "https://media.api-sports.io/flags/ar.svg" };
  const blLeague = { id: 78, name: "Bundesliga", country: "Germany", logo: "https://media.api-sports.io/football/leagues/78.png", flag: "https://media.api-sports.io/flags/de.svg" };
  const saLeague = { id: 135, name: "Serie A", country: "Italy", logo: "https://media.api-sports.io/football/leagues/135.png", flag: "https://media.api-sports.io/flags/it.svg" };
  const llLeague = { id: 140, name: "La Liga", country: "Spain", logo: "https://media.api-sports.io/football/leagues/140.png", flag: "https://media.api-sports.io/flags/es.svg" };
  const uclLeague = { id: 2, name: "UEFA Champions League", country: "Europe", logo: "https://media.api-sports.io/football/leagues/2.png", flag: "https://media.api-sports.io/flags/eu.svg" };
  const l1League = { id: 61, name: "Ligue 1", country: "France", logo: "https://media.api-sports.io/football/leagues/61.png", flag: "https://media.api-sports.io/flags/fr.svg" };
  const uelLeague = { id: 3, name: "UEFA Europa League", country: "Europe", logo: "https://media.api-sports.io/football/leagues/3.png", flag: "https://media.api-sports.io/flags/eu.svg" };
  const ueclLeague = { id: 848, name: "UEFA Europa Conference League", country: "Europe", logo: "https://media.api-sports.io/football/leagues/848.png", flag: "https://media.api-sports.io/flags/eu.svg" };
  const eredLeague = { id: 88, name: "Eredivisie", country: "Netherlands", logo: "https://media.api-sports.io/football/leagues/88.png", flag: "https://media.api-sports.io/flags/nl.svg" };
  const plpLeague = { id: 94, name: "Primeira Liga", country: "Portugal", logo: "https://media.api-sports.io/football/leagues/94.png", flag: "https://media.api-sports.io/flags/pt.svg" };
  const eflLeague = { id: 48, name: "EFL Cup", country: "England", logo: "https://media.api-sports.io/football/leagues/48.png", flag: "https://media.api-sports.io/flags/gb-eng.svg" };

  const base = [
    // --- PREMIER LEAGUE (exact matches from reference Image 2) ---
    // 06 Sep 2026
    {
      fixtureId: 904307,
      date: "2026-09-06T16:00:00.000Z",
      league: plLeague,
      home: { id: 45, name: "Everton", logo: "https://media.api-sports.io/football/teams/45.png" },
      away: { id: 33, name: "Manchester United", logo: "https://media.api-sports.io/football/teams/33.png" },
      odds: { home: "3.27", draw: "3.63", away: "2.13", doubleChance: { homeDraw: "1.70", homeAway: "1.28", drawAway: "1.32" }, totals: { over25: "1.80", under25: "2.00" } },
    },
    {
      fixtureId: 904304,
      date: "2026-09-06T18:30:00.000Z",
      league: plLeague,
      home: { id: 42, name: "Arsenal", logo: "https://media.api-sports.io/football/teams/42.png" },
      away: { id: 49, name: "Chelsea", logo: "https://media.api-sports.io/football/teams/49.png" },
      odds: { home: "1.73", draw: "3.87", away: "4.70", doubleChance: { homeDraw: "1.18", homeAway: "1.24", drawAway: "2.10" }, totals: { over25: "1.65", under25: "2.25" } },
    },
    // 12 Sep 2026
    {
      fixtureId: 916448,
      date: "2026-09-12T17:00:00.000Z",
      league: plLeague,
      home: { id: 35, name: "Bournemouth", logo: "https://media.api-sports.io/football/teams/35.png" },
      away: { id: 55, name: "Brentford", logo: "https://media.api-sports.io/football/teams/55.png" },
      odds: { home: "2.50", draw: "3.60", away: "2.68", doubleChance: { homeDraw: "1.45", homeAway: "1.28", drawAway: "1.52" }, totals: { over25: "1.75", under25: "2.05" } },
    },
    {
      fixtureId: 916451,
      date: "2026-09-12T17:00:00.000Z",
      league: plLeague,
      home: { id: 40, name: "Liverpool", logo: "https://media.api-sports.io/football/teams/40.png" },
      away: { id: 36, name: "Fulham", logo: "https://media.api-sports.io/football/teams/36.png" },
      odds: { home: "1.46", draw: "4.97", away: "6.11", doubleChance: { homeDraw: "1.11", homeAway: "1.16", drawAway: "2.65" }, totals: { over25: "1.45", under25: "2.75" } },
    },
    {
      fixtureId: 916452,
      date: "2026-09-12T17:00:00.000Z",
      league: plLeague,
      home: { id: 52, name: "Crystal Palace", logo: "https://media.api-sports.io/football/teams/52.png" },
      away: { id: 57, name: "Ipswich Town", logo: "https://media.api-sports.io/football/teams/57.png" },
      odds: { home: "1.91", draw: "3.77", away: "3.84", doubleChance: { homeDraw: "1.26", homeAway: "1.26", drawAway: "1.88" }, totals: { over25: "1.82", under25: "1.98" } },
    },
    {
      fixtureId: 916449,
      date: "2026-09-12T17:00:00.000Z",
      league: plLeague,
      home: { id: 49, name: "Chelsea", logo: "https://media.api-sports.io/football/teams/49.png" },
      away: { id: 67, name: "Hull City", logo: "https://media.api-sports.io/football/teams/67.png" },
      odds: { home: "1.26", draw: "5.71", away: "12.45", doubleChance: { homeDraw: "1.04", homeAway: "1.12", drawAway: "3.80" }, totals: { over25: "1.40", under25: "2.90" } },
    },
    {
      fixtureId: 916450,
      date: "2026-09-12T19:30:00.000Z",
      league: plLeague,
      home: { id: 50, name: "Manchester City", logo: "https://media.api-sports.io/football/teams/50.png" },
      away: { id: 66, name: "Aston Villa", logo: "https://media.api-sports.io/football/teams/66.png" },
      odds: { home: "1.38", draw: "5.20", away: "7.80", doubleChance: { homeDraw: "1.08", homeAway: "1.15", drawAway: "3.00" }, totals: { over25: "1.45", under25: "2.70" } },
    },
    {
      fixtureId: 916453,
      date: "2026-09-13T15:00:00.000Z",
      league: plLeague,
      home: { id: 47, name: "Tottenham", logo: "https://media.api-sports.io/football/teams/47.png" },
      away: { id: 48, name: "West Ham", logo: "https://media.api-sports.io/football/teams/48.png" },
      odds: { home: "1.80", draw: "3.90", away: "4.20", doubleChance: { homeDraw: "1.22", homeAway: "1.24", drawAway: "2.00" }, totals: { over25: "1.60", under25: "2.30" } },
    },
    {
      fixtureId: 916454,
      date: "2026-09-13T17:30:00.000Z",
      league: plLeague,
      home: { id: 34, name: "Newcastle", logo: "https://media.api-sports.io/football/teams/34.png" },
      away: { id: 39, name: "Wolverhampton", logo: "https://media.api-sports.io/football/teams/39.png" },
      odds: { home: "1.55", draw: "4.30", away: "5.90", doubleChance: { homeDraw: "1.13", homeAway: "1.20", drawAway: "2.40" }, totals: { over25: "1.68", under25: "2.15" } },
    },
    {
      fixtureId: 916455,
      date: "2026-09-13T20:00:00.000Z",
      league: plLeague,
      home: { id: 51, name: "Brighton", logo: "https://media.api-sports.io/football/teams/51.png" },
      away: { id: 41, name: "Southampton", logo: "https://media.api-sports.io/football/teams/41.png" },
      odds: { home: "1.65", draw: "4.10", away: "5.10", doubleChance: { homeDraw: "1.16", homeAway: "1.22", drawAway: "2.20" }, totals: { over25: "1.72", under25: "2.10" } },
    },

    // --- COPA SUDAMERICANA (11) ---
    {
      fixtureId: 920101,
      date: "2026-09-08T22:00:00.000Z",
      league: copaLeague,
      home: { id: 451, name: "Boca Juniors", logo: "https://media.api-sports.io/football/teams/451.png" },
      away: { id: 131, name: "Cruzeiro", logo: "https://media.api-sports.io/football/teams/131.png" },
      odds: { home: "2.15", draw: "3.10", away: "3.50", doubleChance: { homeDraw: "1.28", homeAway: "1.34", drawAway: "1.66" }, totals: { over25: "2.10", under25: "1.70" } },
    },
    {
      fixtureId: 920102,
      date: "2026-09-08T23:30:00.000Z",
      league: copaLeague,
      home: { id: 131, name: "Corinthians", logo: "https://media.api-sports.io/football/teams/131.png" },
      away: { id: 154, name: "Fortaleza", logo: "https://media.api-sports.io/football/teams/154.png" },
      odds: { home: "2.25", draw: "3.00", away: "3.40", doubleChance: { homeDraw: "1.30", homeAway: "1.36", drawAway: "1.60" }, totals: { over25: "2.15", under25: "1.65" } },
    },
    {
      fixtureId: 920103,
      date: "2026-09-09T01:00:00.000Z",
      league: copaLeague,
      home: { id: 456, name: "Racing Club", logo: "https://media.api-sports.io/football/teams/456.png" },
      away: { id: 134, name: "Athletico Paranaense", logo: "https://media.api-sports.io/football/teams/134.png" },
      odds: { home: "2.10", draw: "3.20", away: "3.60", doubleChance: { homeDraw: "1.26", homeAway: "1.32", drawAway: "1.70" }, totals: { over25: "2.05", under25: "1.75" } },
    },

    // --- BUNDESLIGA (78) ---
    {
      fixtureId: 930101,
      date: "2026-09-12T15:30:00.000Z",
      league: blLeague,
      home: { id: 157, name: "Bayern Munich", logo: "https://media.api-sports.io/football/teams/157.png" },
      away: { id: 165, name: "Borussia Dortmund", logo: "https://media.api-sports.io/football/teams/165.png" },
      odds: { home: "1.75", draw: "3.80", away: "4.50", doubleChance: { homeDraw: "1.18", homeAway: "1.22", drawAway: "2.05" }, totals: { over25: "1.55", under25: "2.40" } },
    },
    {
      fixtureId: 930102,
      date: "2026-09-12T15:30:00.000Z",
      league: blLeague,
      home: { id: 173, name: "RB Leipzig", logo: "https://media.api-sports.io/football/teams/173.png" },
      away: { id: 169, name: "Bayer Leverkusen", logo: "https://media.api-sports.io/football/teams/169.png" },
      odds: { home: "2.30", draw: "3.40", away: "3.00", doubleChance: { homeDraw: "1.38", homeAway: "1.32", drawAway: "1.58" }, totals: { over25: "1.70", under25: "2.10" } },
    },
    {
      fixtureId: 930103,
      date: "2026-09-12T18:30:00.000Z",
      league: blLeague,
      home: { id: 168, name: "Eintracht Frankfurt", logo: "https://media.api-sports.io/football/teams/168.png" },
      away: { id: 172, name: "VfB Stuttgart", logo: "https://media.api-sports.io/football/teams/172.png" },
      odds: { home: "2.45", draw: "3.50", away: "2.75", doubleChance: { homeDraw: "1.42", homeAway: "1.30", drawAway: "1.52" }, totals: { over25: "1.65", under25: "2.20" } },
    },

    // --- SERIE A (135) ---
    {
      fixtureId: 940105,
      date: "2026-09-06T18:45:00.000Z", // 6 Sep 21:45
      league: saLeague,
      home: { id: 496, name: "Juventus", logo: "https://media.api-sports.io/football/teams/496.png" },
      away: { id: 489, name: "AC Milan", logo: "https://media.api-sports.io/football/teams/489.png" },
      odds: { home: "2.15", draw: "3.32", away: "3.80", doubleChance: { homeDraw: "1.28", homeAway: "1.32", drawAway: "1.68" }, totals: { over25: "1.90", under25: "1.90" } },
    },
    {
      fixtureId: 940106,
      date: "2026-09-05T18:45:00.000Z", // 5 Sep 21:45
      league: saLeague,
      home: { id: 497, name: "AS Roma", logo: "https://media.api-sports.io/football/teams/497.png" },
      away: { id: 499, name: "Atalanta", logo: "https://media.api-sports.io/football/teams/499.png" },
      odds: { home: "1.68", draw: "4.03", away: "5.35", doubleChance: { homeDraw: "1.16", homeAway: "1.22", drawAway: "2.15" }, totals: { over25: "1.75", under25: "2.05" } },
    },
    {
      fixtureId: 940101,
      date: "2026-09-13T18:00:00.000Z",
      league: saLeague,
      home: { id: 489, name: "AC Milan", logo: "https://media.api-sports.io/football/teams/489.png" },
      away: { id: 505, name: "Inter", logo: "https://media.api-sports.io/football/teams/505.png" },
      odds: { home: "2.60", draw: "3.20", away: "2.70", doubleChance: { homeDraw: "1.45", homeAway: "1.33", drawAway: "1.48" }, totals: { over25: "1.88", under25: "1.92" } },
    },
    {
      fixtureId: 940102,
      date: "2026-09-13T20:45:00.000Z",
      league: saLeague,
      home: { id: 496, name: "Juventus", logo: "https://media.api-sports.io/football/teams/496.png" },
      away: { id: 487, name: "Napoli", logo: "https://media.api-sports.io/football/teams/487.png" },
      odds: { home: "2.10", draw: "3.30", away: "3.40", doubleChance: { homeDraw: "1.32", homeAway: "1.30", drawAway: "1.68" }, totals: { over25: "1.95", under25: "1.85" } },
    },

    // --- LA LIGA (140) ---
    {
      fixtureId: 950101,
      date: "2026-09-13T16:15:00.000Z",
      league: llLeague,
      home: { id: 541, name: "Real Madrid", logo: "https://media.api-sports.io/football/teams/541.png" },
      away: { id: 529, name: "Barcelona", logo: "https://media.api-sports.io/football/teams/529.png" },
      odds: { home: "2.10", draw: "3.50", away: "3.20", doubleChance: { homeDraw: "1.32", homeAway: "1.28", drawAway: "1.68" }, totals: { over25: "1.60", under25: "2.30" } },
    },
    {
      fixtureId: 950102,
      date: "2026-09-13T21:00:00.000Z",
      league: llLeague,
      home: { id: 530, name: "Atletico Madrid", logo: "https://media.api-sports.io/football/teams/530.png" },
      away: { id: 548, name: "Sevilla", logo: "https://media.api-sports.io/football/teams/548.png" },
      odds: { home: "1.85", draw: "3.60", away: "4.20", doubleChance: { homeDraw: "1.22", homeAway: "1.25", drawAway: "1.90" }, totals: { over25: "2.10", under25: "1.72" } },
    },

    // --- UEFA CHAMPIONS LEAGUE (2) ---
    {
      fixtureId: 960101,
      date: "2026-09-15T20:00:00.000Z",
      league: uclLeague,
      home: { id: 541, name: "Real Madrid", logo: "https://media.api-sports.io/football/teams/541.png" },
      away: { id: 50, name: "Manchester City", logo: "https://media.api-sports.io/football/teams/50.png" },
      odds: { home: "2.40", draw: "3.60", away: "2.75", doubleChance: { homeDraw: "1.42", homeAway: "1.28", drawAway: "1.55" }, totals: { over25: "1.65", under25: "2.20" } },
    },
    {
      fixtureId: 960102,
      date: "2026-09-15T20:00:00.000Z",
      league: uclLeague,
      home: { id: 157, name: "Bayern Munich", logo: "https://media.api-sports.io/football/teams/157.png" },
      away: { id: 42, name: "Arsenal", logo: "https://media.api-sports.io/football/teams/42.png" },
      odds: { home: "2.20", draw: "3.60", away: "3.10", doubleChance: { homeDraw: "1.36", homeAway: "1.28", drawAway: "1.65" }, totals: { over25: "1.70", under25: "2.10" } },
    },

    // --- LIGUE 1 (61) ---
    {
      fixtureId: 970101,
      date: "2026-09-13T19:45:00.000Z",
      league: l1League,
      home: { id: 85, name: "Paris Saint-Germain", logo: "https://media.api-sports.io/football/teams/85.png" },
      away: { id: 81, name: "Marseille", logo: "https://media.api-sports.io/football/teams/81.png" },
      odds: { home: "1.50", draw: "4.40", away: "5.80", doubleChance: { homeDraw: "1.12", homeAway: "1.20", drawAway: "2.45" }, totals: { over25: "1.55", under25: "2.40" } },
    },

    // --- UEFA EUROPA LEAGUE (3) ---
    {
      fixtureId: 980101,
      date: "2026-09-17T20:00:00.000Z",
      league: uelLeague,
      home: { id: 33, name: "Manchester United", logo: "https://media.api-sports.io/football/teams/33.png" },
      away: { id: 212, name: "Porto", logo: "https://media.api-sports.io/football/teams/212.png" },
      odds: { home: "2.10", draw: "3.50", away: "3.30", doubleChance: { homeDraw: "1.32", homeAway: "1.28", drawAway: "1.70" }, totals: { over25: "1.75", under25: "2.05" } },
    },

    // --- UEFA EUROPA CONFERENCE LEAGUE (848) ---
    {
      fixtureId: 985101,
      date: "2026-09-17T18:45:00.000Z",
      league: ueclLeague,
      home: { id: 49, name: "Chelsea", logo: "https://media.api-sports.io/football/teams/49.png" },
      away: { id: 502, name: "Fiorentina", logo: "https://media.api-sports.io/football/teams/502.png" },
      odds: { home: "1.70", draw: "3.80", away: "4.60", doubleChance: { homeDraw: "1.18", homeAway: "1.24", drawAway: "2.05" }, totals: { over25: "1.70", under25: "2.10" } },
    },

    // --- EREDIVISIE (88) ---
    {
      fixtureId: 990105,
      date: "2026-09-05T18:00:00.000Z", // 5 Sep 21:00
      league: eredLeague,
      home: { id: 194, name: "Ajax Amsterdam", logo: "https://media.api-sports.io/football/teams/194.png" },
      away: { id: 197, name: "PSV Eindhoven", logo: "https://media.api-sports.io/football/teams/197.png" },
      odds: { home: "2.54", draw: "3.57", away: "2.46", doubleChance: { homeDraw: "1.45", homeAway: "1.28", drawAway: "1.42" }, totals: { over25: "1.65", under25: "2.20" } },
    },
    {
      fixtureId: 990101,
      date: "2026-09-13T13:30:00.000Z",
      league: eredLeague,
      home: { id: 194, name: "Ajax", logo: "https://media.api-sports.io/football/teams/194.png" },
      away: { id: 197, name: "PSV", logo: "https://media.api-sports.io/football/teams/197.png" },
      odds: { home: "2.40", draw: "3.50", away: "2.75", doubleChance: { homeDraw: "1.42", homeAway: "1.30", drawAway: "1.55" }, totals: { over25: "1.68", under25: "2.15" } },
    },

    // --- PRIMEIRA LIGA (94) ---
    {
      fixtureId: 995101,
      date: "2026-09-14T20:15:00.000Z",
      league: plpLeague,
      home: { id: 211, name: "Benfica", logo: "https://media.api-sports.io/football/teams/211.png" },
      away: { id: 212, name: "Porto", logo: "https://media.api-sports.io/football/teams/212.png" },
      odds: { home: "2.25", draw: "3.30", away: "3.10", doubleChance: { homeDraw: "1.34", homeAway: "1.30", drawAway: "1.60" }, totals: { over25: "1.80", under25: "2.00" } },
    },

    // --- EFL CUP (48) ---
    {
      fixtureId: 998101,
      date: "2026-09-16T19:45:00.000Z",
      league: eflLeague,
      home: { id: 34, name: "Newcastle", logo: "https://media.api-sports.io/football/teams/34.png" },
      away: { id: 49, name: "Chelsea", logo: "https://media.api-sports.io/football/teams/49.png" },
      odds: { home: "2.50", draw: "3.40", away: "2.70", doubleChance: { homeDraw: "1.42", homeAway: "1.30", drawAway: "1.50" }, totals: { over25: "1.75", under25: "2.05" } },
    },
  ];

  return base.map((m) => ({
    fixtureId: m.fixtureId,
    date: m.date || hoursFromNow(m.hours || 2).toISOString(),
    status: m.live ? "LIVE" : "NS",
    league: m.league,
    home: m.home,
    away: m.away,
    odds: m.odds,
    marketCount: m.marketCount || 83,
  }));
}

function buildMockSidebar() {
  const leagues = [
    { id: 39, name: "Premier League", logo: "https://media.api-sports.io/football/leagues/39.png", count: 20 },
    { id: 11, name: "Copa Sudamericana", logo: "https://media.api-sports.io/football/leagues/11.png", count: 8 },
    { id: 78, name: "Bundesliga", logo: "https://media.api-sports.io/football/leagues/78.png", count: 18 },
    { id: 135, name: "Serie A", logo: "https://media.api-sports.io/football/leagues/135.png", count: 20 },
    { id: 140, name: "La Liga", logo: "https://media.api-sports.io/football/leagues/140.png", count: 20 },
    { id: 2, name: "UEFA Champions League", logo: "https://media.api-sports.io/football/leagues/2.png", count: 16 },
    { id: 61, name: "Ligue 1", logo: "https://media.api-sports.io/football/leagues/61.png", count: 18 },
    { id: 3, name: "UEFA Europa League", logo: "https://media.api-sports.io/football/leagues/3.png", count: 16 },
    { id: 848, name: "UEFA Europa Conference League", logo: "https://media.api-sports.io/football/leagues/848.png", count: 16 },
    { id: 88, name: "Eredivisie", logo: "https://media.api-sports.io/football/leagues/88.png", count: 18 },
    { id: 94, name: "Primeira Liga", logo: "https://media.api-sports.io/football/leagues/94.png", count: 18 },
    { id: 48, name: "EFL Cup", logo: "https://media.api-sports.io/football/leagues/48.png", count: 8 },
  ];
  const countries = [
    { name: "England", flag: "https://media.api-sports.io/flags/gb-eng.svg", count: 12 },
    { name: "Scotland", flag: "https://media.api-sports.io/flags/gb-sct.svg", count: 4 },
    { name: "Italy", flag: "https://media.api-sports.io/flags/it.svg", count: 2 },
    { name: "Argentina", flag: "https://media.api-sports.io/flags/ar.svg", count: 4 },
    { name: "Spain", flag: "https://media.api-sports.io/flags/es.svg", count: 4 },
    { name: "USA", flag: "https://media.api-sports.io/flags/us.svg", count: 2 },
  ];
  return { topLeagues: leagues, countries };
}

function closeLeagueDropdown() {
  state.leagueDropdown = null;
  state.leagueDropdownSearch = "";
  const backdrop = $("league-dropdown-backdrop");
  if (backdrop) backdrop.hidden = true;
}

function openLeagueDropdown(kind) {
  state.leagueDropdown = state.leagueDropdown === kind ? null : kind;
  state.leagueDropdownSearch = "";
  $("league-dropdown-backdrop").hidden = !state.leagueDropdown;
}

async function toggleSidebarCountry(countryName) {
  if (state.expandedSidebarCountries.has(countryName)) {
    state.expandedSidebarCountries.delete(countryName);
    if (state.countryFilter === countryName) state.countryFilter = null;
  } else {
    state.expandedSidebarCountries.add(countryName);
    state.countryFilter = countryName;
    state.leagueFilter = "all";
    await fetchCountryLeagues(countryName);
  }
  closeLeagueDropdown();
  renderSidebar();
  renderFilters();
  refreshHomeAndBoard();
}

function findFixture(fixtureId) {
  const id = Number(fixtureId);
  return (state.liveFixtures && state.liveFixtures.find((f) => Number(f.fixtureId) === id)) ||
         state.fixtures.find((f) => Number(f.fixtureId) === id);
}

function generateLiveOdds(goals, elapsed = 0) {
  const gh = Number(goals?.home ?? 0);
  const ga = Number(goals?.away ?? 0);
  const totalGoals = gh + ga;
  const diff = gh - ga;
  const el = Math.min(Math.max(Number(elapsed) || 0, 1), 90);
  const timeProgress = el / 90;

  let hOdd, dOdd, aOdd;

  if (diff === 0) {
    dOdd = Math.max(1.22, 3.10 - timeProgress * 1.85);
    hOdd = Math.min(12.0, 2.30 + timeProgress * 3.50);
    aOdd = Math.min(12.0, 2.70 + timeProgress * 3.50);
  } else if (diff > 0) {
    if (diff >= 3) {
      hOdd = 1.01;
      dOdd = Math.min(35.0, 18.0 + el * 0.15);
      aOdd = Math.min(50.0, 25.0 + el * 0.25);
    } else if (diff === 2) {
      hOdd = Math.max(1.02, 1.12 - timeProgress * 0.08);
      dOdd = Math.min(22.0, 7.50 + timeProgress * 12.0);
      aOdd = Math.min(35.0, 12.0 + timeProgress * 20.0);
    } else {
      hOdd = Math.max(1.08, 1.65 - timeProgress * 0.55);
      dOdd = Math.min(14.0, 3.40 + timeProgress * 7.50);
      aOdd = Math.min(22.0, 5.00 + timeProgress * 14.0);
    }
  } else {
    const absDiff = Math.abs(diff);
    if (absDiff >= 3) {
      aOdd = 1.01;
      dOdd = Math.min(35.0, 18.0 + el * 0.15);
      hOdd = Math.min(50.0, 25.0 + el * 0.25);
    } else if (absDiff === 2) {
      aOdd = Math.max(1.02, 1.14 - timeProgress * 0.08);
      dOdd = Math.min(22.0, 7.50 + timeProgress * 12.0);
      hOdd = Math.min(35.0, 12.0 + timeProgress * 20.0);
    } else {
      aOdd = Math.max(1.10, 1.70 - timeProgress * 0.55);
      dOdd = Math.min(14.0, 3.40 + timeProgress * 7.50);
      hOdd = Math.min(22.0, 5.20 + timeProgress * 14.0);
    }
  }

  const pHome = 1 / hOdd;
  const pDraw = 1 / dOdd;
  const pAway = 1 / aOdd;
  const margin = 1.08;
  const dc1x = Math.max(1.01, parseFloat((margin / (pHome + pDraw)).toFixed(2)));
  const dc12 = Math.max(1.01, parseFloat((margin / (pHome + pAway)).toFixed(2)));
  const dcx2 = Math.max(1.01, parseFloat((margin / (pDraw + pAway)).toFixed(2)));

  let over25, under25;
  if (totalGoals >= 3) {
    over25 = 1.01;
    under25 = 25.0;
  } else if (totalGoals === 2) {
    if (timeProgress > 0.8) {
      over25 = 3.20;
      under25 = 1.30;
    } else if (timeProgress > 0.5) {
      over25 = 1.95;
      under25 = 1.80;
    } else {
      over25 = 1.45;
      under25 = 2.60;
    }
  } else if (totalGoals === 1) {
    if (timeProgress > 0.75) {
      over25 = 4.50;
      under25 = 1.18;
    } else if (timeProgress > 0.45) {
      over25 = 2.40;
      under25 = 1.52;
    } else {
      over25 = 1.75;
      under25 = 2.00;
    }
  } else {
    if (timeProgress > 0.7) {
      over25 = 6.50;
      under25 = 1.10;
    } else if (timeProgress > 0.4) {
      over25 = 3.10;
      under25 = 1.33;
    } else {
      over25 = 2.05;
      under25 = 1.72;
    }
  }

  return {
    home: parseFloat(hOdd.toFixed(2)),
    draw: parseFloat(dOdd.toFixed(2)),
    away: parseFloat(aOdd.toFixed(2)),
    doubleChance: {
      homeDraw: dc1x,
      homeAway: dc12,
      drawAway: dcx2,
    },
    totals: {
      over25: parseFloat(over25.toFixed(2)),
      under25: parseFloat(under25.toFixed(2)),
    },
  };
}

function normalizeApiFixture(row) {
  const shortStatus = row.fixture?.status?.short || row.status || "NS";
  const isLive = ["1H", "2H", "HT", "ET", "P", "LIVE", "IN_PLAY", "BT"].includes(shortStatus);
  const elapsed = row.fixture?.status?.elapsed ?? row.elapsed ?? null;
  const goals = row.goals || (row.score?.fulltime?.home !== null && row.score?.fulltime?.home !== undefined ? { home: row.score.fulltime.home, away: row.score.fulltime.away } : null);

  const rawOdds = row.odds || {};
  let odds = null;
  if (rawOdds.home && rawOdds.draw && rawOdds.away && rawOdds.home !== "—") {
    const dc = rawOdds.doubleChance || {};
    const totals = rawOdds.totals || {};
    odds = {
      home: rawOdds.home,
      draw: rawOdds.draw,
      away: rawOdds.away,
      doubleChance: {
        homeDraw: dc.homeDraw || rawOdds.doubleChance?.homeDraw || "—",
        homeAway: dc.homeAway || rawOdds.doubleChance?.homeAway || "—",
        drawAway: dc.drawAway || rawOdds.doubleChance?.drawAway || "—",
      },
      totals: {
        over25: totals.over25 || rawOdds.over25 || "—",
        under25: totals.under25 || rawOdds.under25 || "—",
      },
    };
  } else if (isLive) {
    odds = generateLiveOdds(goals, elapsed);
  } else {
    odds = {
      home: "—",
      draw: "—",
      away: "—",
      doubleChance: { homeDraw: "—", homeAway: "—", drawAway: "—" },
      totals: { over25: "—", under25: "—" },
    };
  }

  // Extract additional markets from row.markets if available
  const m5 = (row.markets || []).find((m) => m.id === 5 || m.name?.toLowerCase().includes("over/under"));
  const o15 = m5?.values?.find((v) => v.value === "Over 1.5")?.odd;
  const u15 = m5?.values?.find((v) => v.value === "Under 1.5")?.odd;
  const o35 = m5?.values?.find((v) => v.value === "Over 3.5")?.odd;
  const u35 = m5?.values?.find((v) => v.value === "Under 3.5")?.odd;

  const m8 = (row.markets || []).find((m) => m.id === 8 || m.name?.toLowerCase().includes("both teams"));
  const bttsYes = m8?.values?.find((v) => v.value === "Yes")?.odd;
  const bttsNo = m8?.values?.find((v) => v.value === "No")?.odd;

  const hNum = parseFloat(odds.home) || 2.2;
  const dNum = parseFloat(odds.draw) || 3.2;
  const aNum = parseFloat(odds.away) || 2.9;

  odds.totals = {
    ...odds.totals,
    over15: o15 || (parseFloat(odds.totals?.over25) > 1 ? Math.max(1.08, parseFloat(odds.totals.over25) * 0.72).toFixed(2) : "1.25"),
    under15: u15 || (parseFloat(odds.totals?.under25) > 1 ? Math.min(9.5, parseFloat(odds.totals.under25) * 1.55).toFixed(2) : "3.75"),
    over35: o35 || (parseFloat(odds.totals?.over25) > 1 ? Math.min(9.5, parseFloat(odds.totals.over25) * 1.62).toFixed(2) : "3.10"),
    under35: u35 || (parseFloat(odds.totals?.under25) > 1 ? Math.max(1.08, parseFloat(odds.totals.under25) * 0.73).toFixed(2) : "1.34"),
  };

  odds.btts = {
    yes: bttsYes || (1.62 + Math.min(0.4, Math.abs(hNum - aNum) * 0.08)).toFixed(2),
    no: bttsNo || Math.max(1.4, (2.15 - Math.min(0.4, Math.abs(hNum - aNum) * 0.08))).toFixed(2),
  };

  odds.dnb = {
    home: hNum > 1.2 ? (hNum * 0.72).toFixed(2) : "1.08",
    away: aNum > 1.2 ? (aNum * 0.72).toFixed(2) : "1.08",
  };

  const totalMarketCount = row.meta?.totalMarketCount || row.meta?.marketCount || row.marketCount || (row.markets?.length ? row.markets.length + 44 : 47);
  const selectionCount = row.meta?.selectionCount || (totalMarketCount * 8);

  return {
    fixtureId: row.fixture?.id || row.fixtureId,
    date: row.fixture?.date || row.date,
    status: shortStatus,
    isLive,
    elapsed,
    goals: goals ? { home: Number(goals.home ?? 0), away: Number(goals.away ?? 0) } : null,
    league: {
      id: row.league?.id,
      name: row.league?.name,
      country: row.league?.country,
      logo: row.league?.logo,
      flag: row.league?.flag,
    },
    home: {
      id: row.teams?.home?.id,
      name: row.teams?.home?.name,
      logo: row.teams?.home?.logo,
    },
    away: {
      id: row.teams?.away?.id,
      name: row.teams?.away?.name,
      logo: row.teams?.away?.logo,
    },
    odds,
    markets: row.markets || [],
    meta: row.meta || null,
    marketCount: totalMarketCount,
    selectionCount,
  };
}

async function fetchJson(url, timeoutMs = 25000) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: ctrl.signal });
    if (!res.ok) return null;
    return await res.json();
  } catch (_) {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

function extractFixtureRows(data) {
  if (!data || data.ok === false) return [];
  if (Array.isArray(data.response) && data.response.length) return data.response;
  if (Array.isArray(data.fixtures) && data.fixtures.length) return data.fixtures;
  if (Array.isArray(data.data) && data.data.length) return data.data;
  if (data.leagueBoards) {
    const rows = [];
    for (const board of Object.values(data.leagueBoards)) {
      if (Array.isArray(board.fixtures)) rows.push(...board.fixtures);
    }
    return rows;
  }
  return [];
}

async function fetchInPlayLiveFixtures() {
  const urls = [];
  if (useApi()) {
    urls.push(`${api().apiUrl()}/api/odds/fixtures/live`);
  }
  urls.push(
    `${API_BASE}/football/fixtures?live=all`,
    `https://multi-shop-games-2.onrender.com/api/games/sportsbook/football/fixtures?live=all`
  );

  for (const url of urls) {
    const data = await fetchJson(url, 15000);
    const rows = extractFixtureRows(data);
    if (!rows.length) continue;
    const normalized = rows
      .map(normalizeApiFixture)
      .filter((f) => f.fixtureId && f.home?.name && f.away?.name);
    if (normalized.length) {
      return normalized;
    }
  }
  return [];
}

async function fetchAllUpcomingFixtures() {
  const urls = [];
  if (useApi()) {
    urls.push(`${api().apiUrl()}/api/odds/fixtures/upcoming`);
  }
  urls.push(
    `${API_BASE}/football/board/upcoming?bookmaker=${BOOKMAKER}`,
    `https://multi-shop-games-2.onrender.com/api/games/sportsbook/football/board/upcoming?bookmaker=${BOOKMAKER}`
  );

  for (const url of urls) {
    const data = await fetchJson(url, 25000);
    const rows = extractFixtureRows(data);
    if (!rows.length) continue;
    const normalized = rows.map(normalizeApiFixture).filter((f) => f.fixtureId && f.home?.name && f.away?.name);
    if (normalized.length) {
      return normalized;
    }
  }
  return [];
}

async function fetchLiveFixtures() {
  const topLeagues = "39-140-61-88-78-135-40";
  const urls = [];

  // Prefer top-league prematch for the home board
  if (useApi()) {
    urls.push(`${api().apiUrl()}/api/odds/fixtures/prematch?leagues=${topLeagues}`);
  }

  // Public sportsbook feed fallback
  urls.push(`${API_BASE}/football/board/prematch?bookmaker=${BOOKMAKER}&leagues=${topLeagues}`);

  for (const url of urls) {
    const data = await fetchJson(url, 25000);
    const rows = extractFixtureRows(data);
    if (!rows.length) continue;
    const normalized = rows.map(normalizeApiFixture).filter((f) => f.fixtureId && f.home?.name && f.away?.name);
    if (normalized.length) {
      state.liveSource = true;
      return normalized;
    }
  }
  return null;
}

async function loadFixtures() {
  const loading = $("board-loading");
  if (loading) loading.hidden = false;
  const mockFixtures = buildMockFixtures();

  if (window.location.protocol !== "file:") {
    const [allUpcoming, prematchLive, inplayLive] = await Promise.all([
      fetchAllUpcomingFixtures().catch(() => []),
      fetchLiveFixtures().catch(() => []),
      fetchInPlayLiveFixtures().catch(() => []),
    ]);

    const fixtureMap = new Map();
    // 1. Add upcoming fixtures (full database of 1,000+ matches across all countries)
    (allUpcoming || []).forEach((f) => fixtureMap.set(f.fixtureId, f));
    // 2. Add/override prematch top leagues
    (prematchLive || []).forEach((f) => fixtureMap.set(f.fixtureId, f));

    if (fixtureMap.size) {
      state.fixtures = [...fixtureMap.values()];
      state.liveSource = true;
    }

    if (inplayLive && inplayLive.length) {
      state.liveFixtures = inplayLive;
      inplayLive.forEach((f) => {
        if (!fixtureMap.has(f.fixtureId)) fixtureMap.set(f.fixtureId, f);
      });
      state.fixtures = [...fixtureMap.values()];
    }
  }

  if (!state.fixtures.length) state.fixtures = mockFixtures;
  if (!state.liveFixtures.length) {
    state.liveFixtures = state.fixtures.filter(isLiveFixture);
  }
  if (!state.liveSource && window.location.protocol !== "file:") {
    toast("Live matches unavailable — showing demo fixtures", "err");
  }

  if (loading) loading.hidden = true;
  renderSportsSidebar();
  renderTopLeaguesGrid();
  updateSportsMenuUI();
  if (isSportsHomeSubNav()) renderCarousel();
  if (isBoardSubNav()) renderBoard();
  renderSidebar();
  if ($("view-leagues") && !$("view-leagues").hidden) renderLeaguePage();
}

async function fetchSidebar() {
  const urls = [];
  if (useApi()) urls.push(`${api().apiUrl()}/api/odds/sidebar`);
  urls.push(`${API_BASE}/football/sidebar/summary?view=prematch&bookmaker=${BOOKMAKER}`);

  for (const url of urls) {
    try {
      const data = await fetchJson(url);
      if (!data || !data.ok) continue;

      const topLeagues = (data.topLeagues || data.leagues || []).map((l) => ({
        id: l.id || l.leagueId,
        name: l.name || l.leagueName,
        logo: l.logo || l.leagueLogo,
        count: l.fixtureCount || l.count || l.fixtures || 0,
      }));

      const countries = (data.countries || []).map((c) => ({
        name: c.name || c.country,
        flag: c.flag,
        count: c.leagueCount || c.count || 0,
        fixtureCount: c.fixtureCount || c.fixtures || 0,
      }));

      if (topLeagues.length || countries.length) {
        state.sidebar = { topLeagues, countries };
        return;
      }
    } catch (_) { }
  }
}

async function fetchCountryLeagues(countryName) {
  if (state.countryLeagues[countryName]) return state.countryLeagues[countryName];

  try {
    const res = await fetch(
      useApi()
        ? `${api().apiUrl()}/api/odds/countries/${encodeURIComponent(countryName)}/leagues`
        : `${API_BASE}/football/countries/${encodeURIComponent(countryName)}/leagues?view=prematch&bookmaker=${BOOKMAKER}`
    );
    if (res.ok) {
      const data = await res.json();
      if (data.ok && Array.isArray(data.leagues)) {
        const leagues = data.leagues.map((l) => ({
          id: l.id,
          name: l.name,
          logo: l.logo,
          count: l.fixtureCount || 0,
        }));
        state.countryLeagues[countryName] = leagues;
        return leagues;
      }
    }
  } catch (_) { }

  const leagues = buildCountryLeaguesFromFixtures(countryName);
  state.countryLeagues[countryName] = leagues;
  return leagues;
}

function buildCountryLeaguesFromFixtures(countryName) {
  const map = new Map();
  for (const f of state.fixtures) {
    if (f.league.country !== countryName) continue;
    if (!map.has(f.league.id)) {
      map.set(f.league.id, {
        id: f.league.id,
        name: f.league.name,
        logo: f.league.logo,
        count: 0,
      });
    }
    map.get(f.league.id).count += 1;
  }
  return [...map.values()];
}

function buildMockComboMarkets(fixture) {
  const h = parseFloat(fixture.odds?.home) || 2.45;
  const d = parseFloat(fixture.odds?.draw) || 3.4;
  const a = parseFloat(fixture.odds?.away) || 2.8;

  return [
    {
      id: 201,
      category: "combo",
      name: "Results/Both Teams Score",
      values: [
        { value: "Home/Yes", odd: (h * 1.63).toFixed(2), handicap: null },
        { value: "Draw/Yes", odd: (d * 1.32).toFixed(2), handicap: null },
        { value: "Away/Yes", odd: (a * 2.5).toFixed(2), handicap: null },
        { value: "Home/No", odd: (h * 1.43).toFixed(2), handicap: null },
        { value: "Draw/No", odd: (d * 3.44).toFixed(2), handicap: null },
        { value: "Away/No", odd: (a * 2.32).toFixed(2), handicap: null },
      ],
    },
    {
      id: 202,
      category: "combo",
      name: "Result/Total Goals",
      values: [
        { value: "Home/Over 2.5", odd: (h * 1.27).toFixed(2), handicap: null },
        { value: "Draw/Over 2.5", odd: "12.00", handicap: null },
        { value: "Away/Over 2.5", odd: (a * 2.32).toFixed(2), handicap: null },
        { value: "Home/Under 2.5", odd: (h * 1.84).toFixed(2), handicap: null },
        { value: "Draw/Under 2.5", odd: (d * 1.32).toFixed(2), handicap: null },
        { value: "Away/Under 2.5", odd: (a * 2.86).toFixed(2), handicap: null },
      ],
    },
    {
      id: 203,
      category: "combo",
      name: "Goals Over/Under - Second Half",
      values: [
        { value: "Over 1.5", odd: "2.10", handicap: null },
        { value: "Under 1.5", odd: "1.67", handicap: null },
        { value: "Over 2.5", odd: "4.50", handicap: null },
        { value: "Under 2.5", odd: "1.18", handicap: null },
        { value: "Over 3.5", odd: "11.00", handicap: null },
        { value: "Under 3.5", odd: "1.05", handicap: null },
        { value: "Over 0.5", odd: "1.22", handicap: null },
        { value: "Under 0.5", odd: "4.00", handicap: null },
      ],
    },
  ];
}

function buildMockMarkets(fixture) {
  const h = parseFloat(fixture.odds?.home) || 2.0;
  const d = parseFloat(fixture.odds?.draw) || 3.2;
  const a = parseFloat(fixture.odds?.away) || 3.5;
  const dc = fixture.odds?.doubleChance || {};
  const o25 = fixture.odds?.totals?.over25 || "1.85";
  const u25 = fixture.odds?.totals?.under25 || "1.95";
  const o15 = fixture.odds?.totals?.over15 || "1.25";
  const u15 = fixture.odds?.totals?.under15 || "3.75";
  const o35 = fixture.odds?.totals?.over35 || "3.10";
  const u35 = fixture.odds?.totals?.under35 || "1.34";
  const bttsY = fixture.odds?.btts?.yes || "1.72";
  const bttsN = fixture.odds?.btts?.no || "2.05";
  const dnbH = fixture.odds?.dnb?.home || (h > 1.2 ? (h * 0.72).toFixed(2) : "1.08");
  const dnbA = fixture.odds?.dnb?.away || (a > 1.2 ? (a * 0.72).toFixed(2) : "1.08");

  return [
    {
      id: 1,
      name: "Match Result",
      values: [
        { value: "Home", odd: h.toFixed(2), handicap: null },
        { value: "Draw", odd: d.toFixed(2), handicap: null },
        { value: "Away", odd: a.toFixed(2), handicap: null },
      ],
    },
    {
      id: 12,
      name: "Double Chance",
      values: [
        { value: "Home/Draw", odd: String(dc.homeDraw || "1.30"), handicap: null },
        { value: "Home/Away", odd: String(dc.homeAway || "1.28"), handicap: null },
        { value: "Draw/Away", odd: String(dc.drawAway || "1.55"), handicap: null },
      ],
    },
    {
      id: 8,
      name: "Both Teams Score",
      values: [
        { value: "Yes", odd: String(bttsY), handicap: null },
        { value: "No", odd: String(bttsN), handicap: null },
      ],
    },
    {
      id: 11,
      name: "Draw No Bet",
      values: [
        { value: "Home", odd: String(dnbH), handicap: null },
        { value: "Away", odd: String(dnbA), handicap: null },
      ],
    },
    {
      id: 5,
      name: "Goals Over/Under",
      values: [
        { value: "Over 0.5", odd: "1.04", handicap: null },
        { value: "Under 0.5", odd: "11.00", handicap: null },
        { value: "Over 1.5", odd: String(o15), handicap: null },
        { value: "Under 1.5", odd: String(u15), handicap: null },
        { value: "Over 2.5", odd: String(o25), handicap: null },
        { value: "Under 2.5", odd: String(u25), handicap: null },
        { value: "Over 3.5", odd: String(o35), handicap: null },
        { value: "Under 3.5", odd: String(u35), handicap: null },
        { value: "Over 4.5", odd: "5.50", handicap: null },
        { value: "Under 4.5", odd: "1.15", handicap: null },
        { value: "Over 5.5", odd: "10.00", handicap: null },
        { value: "Under 5.5", odd: "1.04", handicap: null },
      ],
    },
    {
      id: 13,
      name: "First Half Winner",
      values: [
        { value: "Home", odd: (h * 1.35).toFixed(2), handicap: null },
        { value: "Draw", odd: (d * 0.72).toFixed(2), handicap: null },
        { value: "Away", odd: (a * 1.32).toFixed(2), handicap: null },
      ],
    },
    {
      id: 3,
      name: "Second Half Winner",
      values: [
        { value: "Home", odd: (h * 1.25).toFixed(2), handicap: null },
        { value: "Draw", odd: (d * 0.78).toFixed(2), handicap: null },
        { value: "Away", odd: (a * 1.22).toFixed(2), handicap: null },
      ],
    },
    {
      id: 6,
      name: "Goals Over/Under First Half",
      values: [
        { value: "Over 0.5", odd: "1.38", handicap: null },
        { value: "Under 0.5", odd: "2.85", handicap: null },
        { value: "Over 1.5", odd: "2.65", handicap: null },
        { value: "Under 1.5", odd: "1.44", handicap: null },
        { value: "Over 2.5", odd: "6.50", handicap: null },
        { value: "Under 2.5", odd: "1.08", handicap: null },
      ],
    },
    {
      id: 26,
      name: "Goals Over/Under - Second Half",
      values: [
        { value: "Over 0.5", odd: "1.25", handicap: null },
        { value: "Under 0.5", odd: "3.60", handicap: null },
        { value: "Over 1.5", odd: "2.10", handicap: null },
        { value: "Under 1.5", odd: "1.66", handicap: null },
        { value: "Over 2.5", odd: "4.80", handicap: null },
        { value: "Under 2.5", odd: "1.15", handicap: null },
      ],
    },
    {
      id: 7,
      name: "HT/FT Double",
      values: [
        { value: "Home/Home", odd: (h * 1.65).toFixed(2), handicap: null },
        { value: "Home/Draw", odd: "14.00", handicap: null },
        { value: "Home/Away", odd: "28.00", handicap: null },
        { value: "Draw/Home", odd: (h * 2.2).toFixed(2), handicap: null },
        { value: "Draw/Draw", odd: (d * 1.55).toFixed(2), handicap: null },
        { value: "Draw/Away", odd: (a * 2.1).toFixed(2), handicap: null },
        { value: "Away/Home", odd: "26.00", handicap: null },
        { value: "Away/Draw", odd: "14.00", handicap: null },
        { value: "Away/Away", odd: (a * 1.7).toFixed(2), handicap: null },
      ],
    },
    {
      id: 10,
      name: "Exact Score",
      values: [
        { value: "1:0", odd: "7.00", handicap: null },
        { value: "2:0", odd: "9.50", handicap: null },
        { value: "2:1", odd: "8.50", handicap: null },
        { value: "3:0", odd: "15.00", handicap: null },
        { value: "3:1", odd: "14.00", handicap: null },
        { value: "3:2", odd: "26.00", handicap: null },
        { value: "0:0", odd: "9.00", handicap: null },
        { value: "1:1", odd: "6.50", handicap: null },
        { value: "2:2", odd: "13.00", handicap: null },
        { value: "3:3", odd: "45.00", handicap: null },
        { value: "0:1", odd: "8.00", handicap: null },
        { value: "0:2", odd: "12.00", handicap: null },
        { value: "1:2", odd: "10.00", handicap: null },
        { value: "0:3", odd: "22.00", handicap: null },
        { value: "1:3", odd: "19.00", handicap: null },
        { value: "2:3", odd: "29.00", handicap: null },
        { value: "4:0", odd: "35.00", handicap: null },
        { value: "4:1", odd: "30.00", handicap: null },
        { value: "0:4", odd: "45.00", handicap: null },
        { value: "1:4", odd: "40.00", handicap: null },
      ],
    },
    {
      id: 4,
      name: "Asian Handicap",
      values: [
        { value: "Home -1.5", odd: (h * 1.85).toFixed(2), handicap: null },
        { value: "Away +1.5", odd: "1.42", handicap: null },
        { value: "Home -0.75", odd: "1.92", handicap: null },
        { value: "Away +0.75", odd: "1.88", handicap: null },
        { value: "Home -0.5", odd: "1.90", handicap: null },
        { value: "Away +0.5", odd: "1.90", handicap: null },
        { value: "Home +0.5", odd: "1.52", handicap: null },
        { value: "Away -0.5", odd: "2.35", handicap: null },
        { value: "Home +1.5", odd: "1.28", handicap: null },
        { value: "Away -1.5", odd: (a * 1.95).toFixed(2), handicap: null },
      ],
    },
    {
      id: 9,
      name: "Handicap Result",
      values: [
        { value: "Home -1", odd: (h * 1.9).toFixed(2), handicap: null },
        { value: "Draw -1", odd: "3.75", handicap: null },
        { value: "Away +1", odd: "1.55", handicap: null },
        { value: "Home +1", odd: "1.45", handicap: null },
        { value: "Draw +1", odd: "4.20", handicap: null },
        { value: "Away -1", odd: (a * 1.95).toFixed(2), handicap: null },
      ],
    },
    {
      id: 20,
      name: "Double Chance - First Half",
      values: [
        { value: "Home/Draw", odd: "1.25", handicap: null },
        { value: "Home/Away", odd: "1.55", handicap: null },
        { value: "Draw/Away", odd: "1.32", handicap: null },
      ],
    },
    {
      id: 34,
      name: "Both Teams Score - First Half",
      values: [
        { value: "Yes", odd: "4.20", handicap: null },
        { value: "No", odd: "1.20", handicap: null },
      ],
    },
    {
      id: 35,
      name: "Both Teams To Score - Second Half",
      values: [
        { value: "Yes", odd: "3.10", handicap: null },
        { value: "No", odd: "1.33", handicap: null },
      ],
    },
    {
      id: 27,
      name: "Clean Sheet - Home",
      values: [
        { value: "Yes", odd: (a * 0.95).toFixed(2), handicap: null },
        { value: "No", odd: "1.28", handicap: null },
      ],
    },
    {
      id: 28,
      name: "Clean Sheet - Away",
      values: [
        { value: "Yes", odd: (h * 0.95).toFixed(2), handicap: null },
        { value: "No", odd: "1.25", handicap: null },
      ],
    },
    {
      id: 32,
      name: "Win Both Halves",
      values: [
        { value: "Home", odd: (h * 2.8).toFixed(2), handicap: null },
        { value: "Away", odd: (a * 2.8).toFixed(2), handicap: null },
      ],
    },
    {
      id: 36,
      name: "Win To Nil",
      values: [
        { value: "Home", odd: (h * 1.85).toFixed(2), handicap: null },
        { value: "Away", odd: (a * 1.85).toFixed(2), handicap: null },
      ],
    },
    {
      id: 39,
      name: "To Win Either Half",
      values: [
        { value: "Home", odd: Math.max(1.12, (h * 0.55)).toFixed(2), handicap: null },
        { value: "Away", odd: Math.max(1.12, (a * 0.55)).toFixed(2), handicap: null },
      ],
    },
    {
      id: 16,
      name: "Total - Home",
      values: [
        { value: "Over 0.5", odd: "1.18", handicap: null },
        { value: "Under 0.5", odd: "4.40", handicap: null },
        { value: "Over 1.5", odd: (h * 0.85).toFixed(2), handicap: null },
        { value: "Under 1.5", odd: "1.80", handicap: null },
        { value: "Over 2.5", odd: (h * 1.95).toFixed(2), handicap: null },
        { value: "Under 2.5", odd: "1.25", handicap: null },
      ],
    },
    {
      id: 17,
      name: "Total - Away",
      values: [
        { value: "Over 0.5", odd: "1.25", handicap: null },
        { value: "Under 0.5", odd: "3.80", handicap: null },
        { value: "Over 1.5", odd: (a * 0.85).toFixed(2), handicap: null },
        { value: "Under 1.5", odd: "1.75", handicap: null },
        { value: "Over 2.5", odd: (a * 1.95).toFixed(2), handicap: null },
        { value: "Under 2.5", odd: "1.22", handicap: null },
      ],
    },
    {
      id: 21,
      name: "Odd/Even",
      values: [
        { value: "Odd", odd: "1.92", handicap: null },
        { value: "Even", odd: "1.90", handicap: null },
      ],
    },
    {
      id: 22,
      name: "Odd/Even - First Half",
      values: [
        { value: "Odd", odd: "2.05", handicap: null },
        { value: "Even", odd: "1.75", handicap: null },
      ],
    },
    {
      id: 38,
      name: "Exact Goals Number",
      values: [
        { value: "0 Goals", odd: "9.50", handicap: null },
        { value: "1 Goal", odd: "4.80", handicap: null },
        { value: "2 Goals", odd: "3.40", handicap: null },
        { value: "3 Goals", odd: "4.10", handicap: null },
        { value: "4 Goals", odd: "5.80", handicap: null },
        { value: "5 Goals", odd: "11.00", handicap: null },
        { value: "6+ Goals", odd: "18.00", handicap: null },
      ],
    },
    {
      id: 11,
      name: "Highest Scoring Half",
      values: [
        { value: "1st Half", odd: "3.10", handicap: null },
        { value: "2nd Half", odd: "2.05", handicap: null },
        { value: "Draw", odd: "3.40", handicap: null },
      ],
    },
    {
      id: 47,
      name: "Winning Margin",
      values: [
        { value: "Home by 1", odd: "3.60", handicap: null },
        { value: "Home by 2", odd: "5.20", handicap: null },
        { value: "Home by 3+", odd: "7.50", handicap: null },
        { value: "Away by 1", odd: "4.00", handicap: null },
        { value: "Away by 2", odd: "6.50", handicap: null },
        { value: "Away by 3+", odd: "9.50", handicap: null },
        { value: "Score Draw", odd: "4.20", handicap: null },
        { value: "No Goals (0:0)", odd: "9.00", handicap: null },
      ],
    },
    {
      id: 349,
      name: "Number Of Goals In Match",
      values: [
        { value: "Under 2 goals", odd: "3.50", handicap: null },
        { value: "2 or 3 goals", odd: "1.98", handicap: null },
        { value: "Over 3 goals", odd: "3.10", handicap: null },
      ],
    },
    ...buildMockComboMarkets(fixture),
  ];
}

function buildLiveMarketsForFixture(fixture) {
  const gh = Number(fixture.goals?.home ?? 0);
  const ga = Number(fixture.goals?.away ?? 0);
  const totalGoals = gh + ga;
  const diff = gh - ga;
  const rawElapsed = Number(fixture.elapsed ?? (fixture.status === "HT" ? 45 : 1));
  const el = Math.min(Math.max(rawElapsed, 1), 90);
  const timeProgress = el / 90;
  const remMinutes = Math.max(1, 90 - el);
  const isHT = fixture.status === "HT";
  const is2H = fixture.status === "2H" || (el > 45 && !isHT);
  const isPassed1H = isHT || is2H || el >= 45;

  // 1. Live 1X2 odds
  const live1x2 = generateLiveOdds(fixture.goals, el);
  const h = live1x2.home;
  const d = live1x2.draw;
  const a = live1x2.away;
  const dc = live1x2.doubleChance;

  // Helper to calculate Over/Under dynamic odds given a threshold
  function getLiveTotalOdds(threshold) {
    if (threshold <= totalGoals) {
      return { over: "1.00", under: "—", overLocked: true, underLocked: true };
    }
    const needed = threshold - totalGoals;
    const expGoals = 1.35 * (remMinutes / 90);
    let probOver;
    if (needed === 0.5) {
      probOver = 1 - Math.exp(-expGoals);
    } else if (needed === 1.5) {
      probOver = 1 - Math.exp(-expGoals) * (1 + expGoals);
    } else if (needed === 2.5) {
      probOver = 1 - Math.exp(-expGoals) * (1 + expGoals + (expGoals * expGoals) / 2);
    } else {
      probOver = Math.max(0.01, 0.45 * Math.pow(expGoals / needed, needed));
    }
    probOver = Math.min(Math.max(probOver, 0.02), 0.95);
    const probUnder = 1 - probOver;
    const overOdd = Math.min(35.0, Math.max(1.04, parseFloat((1.08 / probOver).toFixed(2))));
    const underOdd = Math.min(35.0, Math.max(1.04, parseFloat((1.08 / probUnder).toFixed(2))));
    return { over: overOdd.toFixed(2), under: underOdd.toFixed(2), overLocked: false, underLocked: false };
  }

  // Helper to calculate Team Total Over/Under
  function getTeamTotalOdds(currentTeamGoals, threshold) {
    if (threshold <= currentTeamGoals) {
      return { over: "1.00", under: "—", overLocked: true, underLocked: true };
    }
    const needed = threshold - currentTeamGoals;
    const expGoals = 0.75 * (remMinutes / 90);
    let probOver = needed === 0.5 ? 1 - Math.exp(-expGoals) : Math.max(0.02, 0.4 * Math.pow(expGoals / needed, needed));
    probOver = Math.min(Math.max(probOver, 0.02), 0.95);
    const overOdd = Math.min(35.0, Math.max(1.05, parseFloat((1.08 / probOver).toFixed(2))));
    const underOdd = Math.min(35.0, Math.max(1.05, parseFloat((1.08 / (1 - probOver)).toFixed(2))));
    return { over: overOdd.toFixed(2), under: underOdd.toFixed(2), overLocked: false, underLocked: false };
  }

  // BTTS live odds
  let bttsYesOdd, bttsNoOdd, bttsLocked = false;
  if (gh >= 1 && ga >= 1) {
    bttsYesOdd = "1.00";
    bttsNoOdd = "—";
    bttsLocked = true;
  } else if (gh === 0 && ga === 0) {
    const pBoth = Math.max(0.03, 0.52 * (remMinutes / 90) * (remMinutes / 90));
    bttsYesOdd = Math.min(30.0, Math.max(1.15, parseFloat((1.08 / pBoth).toFixed(2)))).toFixed(2);
    bttsNoOdd = Math.min(30.0, Math.max(1.05, parseFloat((1.08 / (1 - pBoth)).toFixed(2)))).toFixed(2);
  } else {
    const pOneMore = Math.max(0.04, 0.65 * (remMinutes / 90));
    bttsYesOdd = Math.min(25.0, Math.max(1.10, parseFloat((1.08 / pOneMore).toFixed(2)))).toFixed(2);
    bttsNoOdd = Math.min(25.0, Math.max(1.08, parseFloat((1.08 / (1 - pOneMore)).toFixed(2)))).toFixed(2);
  }

  // Correct scores
  const correctScoreCandidates = [
    [0, 0], [1, 0], [2, 0], [3, 0], [4, 0],
    [0, 1], [1, 1], [2, 1], [3, 1], [4, 1],
    [0, 2], [1, 2], [2, 2], [3, 2], [0, 3],
    [1, 3], [2, 3], [3, 3], [0, 4], [1, 4]
  ];
  if (!correctScoreCandidates.some(([ch, ca]) => ch === gh && ca === ga)) {
    correctScoreCandidates.push([gh, ga]);
    correctScoreCandidates.push([gh + 1, ga]);
    correctScoreCandidates.push([gh, ga + 1]);
    correctScoreCandidates.push([gh + 1, ga + 1]);
  }

  const correctScoreValues = correctScoreCandidates.map(([ch, ca]) => {
    const isImpossible = ch < gh || ca < ga;
    if (isImpossible) {
      return { value: `${ch}:${ca}`, odd: "—", locked: true };
    }
    const extraH = ch - gh;
    const extraA = ca - ga;
    const extraTotal = extraH + extraA;
    if (extraTotal === 0) {
      const pStay = Math.max(0.05, Math.exp(-1.4 * (remMinutes / 90)));
      const odd = Math.min(25.0, Math.max(1.15, parseFloat((1.08 / pStay).toFixed(2))));
      return { value: `${ch}:${ca}`, odd: odd.toFixed(2), locked: false };
    }
    const pScore = Math.max(0.02, 0.35 * Math.pow(remMinutes / 90, extraTotal) / (extraTotal === 1 ? 1 : 2.5));
    const odd = Math.min(50.0, Math.max(1.50, parseFloat((1.08 / pScore).toFixed(2))));
    return { value: `${ch}:${ca}`, odd: odd.toFixed(2), locked: false };
  });

  // Next goal
  const nextGoalValues = el >= 90
    ? [
        { value: `${fixture.home.name}`, odd: "—", locked: true },
        { value: "No Goal", odd: "1.00", locked: true },
        { value: `${fixture.away.name}`, odd: "—", locked: true },
      ]
    : [
        { value: `${fixture.home.name}`, odd: Math.min(25.0, Math.max(1.30, parseFloat((h * 0.85).toFixed(2)))).toFixed(2), locked: false },
        { value: "No Goal", odd: Math.min(25.0, Math.max(1.12, (2.10 + timeProgress * 3.5).toFixed(2))), locked: false },
        { value: `${fixture.away.name}`, odd: Math.min(25.0, Math.max(1.30, parseFloat((a * 0.85).toFixed(2)))).toFixed(2), locked: false },
      ];

  const markets = [
    {
      id: 1,
      name: "Match Result",
      category: "main",
      values: [
        { value: "Home", odd: h.toFixed(2), locked: el >= 90 || (diff >= 3 && el >= 85 && h <= 1.02) },
        { value: "Draw", odd: d.toFixed(2), locked: el >= 90 || (Math.abs(diff) >= 3 && el >= 85) },
        { value: "Away", odd: a.toFixed(2), locked: el >= 90 || (diff <= -3 && el >= 85 && a <= 1.02) },
      ],
    },
    {
      id: 12,
      name: "Double Chance",
      category: "main",
      values: [
        { value: "Home/Draw", odd: String(dc.homeDraw || "1.15"), locked: el >= 90 },
        { value: "Home/Away", odd: String(dc.homeAway || "1.12"), locked: el >= 90 },
        { value: "Draw/Away", odd: String(dc.drawAway || "1.45"), locked: el >= 90 },
      ],
    },
    {
      id: 8,
      name: "Both Teams Score",
      category: "main",
      isLocked: bttsLocked,
      values: [
        { value: "Yes", odd: bttsYesOdd, locked: bttsLocked },
        { value: "No", odd: bttsNoOdd, locked: bttsLocked },
      ],
    },
    {
      id: 11,
      name: "Draw No Bet",
      category: "main",
      values: [
        { value: "Home", odd: h > 1.05 ? (h * 0.72).toFixed(2) : "1.01", locked: el >= 90 },
        { value: "Away", odd: a > 1.05 ? (a * 0.72).toFixed(2) : "1.01", locked: el >= 90 },
      ],
    },
    {
      id: 5,
      name: "Goals Over/Under",
      category: "goals",
      values: [
        ...([0.5, 1.5, 2.5, 3.5, 4.5, 5.5].flatMap(t => {
          const res = getLiveTotalOdds(t);
          return [
            { value: `Over ${t}`, odd: res.over, locked: res.overLocked },
            { value: `Under ${t}`, odd: res.under, locked: res.underLocked },
          ];
        }))
      ],
    },
    {
      id: 30,
      name: `Next Goal (Goal ${totalGoals + 1})`,
      category: "main",
      values: nextGoalValues,
    },
    {
      id: 13,
      name: "First Half Winner",
      category: "half1",
      isLocked: isPassed1H,
      values: [
        { value: "Home", odd: isPassed1H ? "—" : (h * 1.25).toFixed(2), locked: isPassed1H },
        { value: "Draw", odd: isPassed1H ? "—" : (d * 0.75).toFixed(2), locked: isPassed1H },
        { value: "Away", odd: isPassed1H ? "—" : (a * 1.25).toFixed(2), locked: isPassed1H },
      ],
    },
    {
      id: 6,
      name: "Goals Over/Under First Half",
      category: "half1",
      isLocked: isPassed1H,
      values: [
        { value: "Over 0.5", odd: isPassed1H ? "—" : "1.45", locked: isPassed1H || totalGoals >= 1 },
        { value: "Under 0.5", odd: isPassed1H ? "—" : "2.65", locked: isPassed1H || totalGoals >= 1 },
        { value: "Over 1.5", odd: isPassed1H ? "—" : "2.80", locked: isPassed1H || totalGoals >= 2 },
        { value: "Under 1.5", odd: isPassed1H ? "—" : "1.40", locked: isPassed1H || totalGoals >= 2 },
      ],
    },
    {
      id: 3,
      name: "Second Half Winner",
      category: "half2",
      values: [
        { value: "Home", odd: (h * 1.15).toFixed(2), locked: el >= 90 },
        { value: "Draw", odd: (d * 0.82).toFixed(2), locked: el >= 90 },
        { value: "Away", odd: (a * 1.15).toFixed(2), locked: el >= 90 },
      ],
    },
    {
      id: 26,
      name: "Goals Over/Under - Second Half",
      category: "half2",
      values: [
        { value: "Over 0.5", odd: is2H ? (remMinutes > 20 ? "1.45" : "2.20") : "1.25", locked: el >= 90 },
        { value: "Under 0.5", odd: is2H ? (remMinutes > 20 ? "2.60" : "1.65") : "3.60", locked: el >= 90 },
        { value: "Over 1.5", odd: is2H ? (remMinutes > 25 ? "2.50" : "4.20") : "2.10", locked: el >= 90 },
        { value: "Under 1.5", odd: is2H ? (remMinutes > 25 ? "1.50" : "1.22") : "1.66", locked: el >= 90 },
      ],
    },
    {
      id: 10,
      name: "Correct Score",
      category: "score",
      values: correctScoreValues,
    },
    {
      id: 16,
      name: "Total - Home",
      category: "home",
      values: [
        ...([0.5, 1.5, 2.5, 3.5].flatMap(t => {
          const res = getTeamTotalOdds(gh, t);
          return [
            { value: `Over ${t}`, odd: res.over, locked: res.overLocked },
            { value: `Under ${t}`, odd: res.under, locked: res.underLocked },
          ];
        }))
      ],
    },
    {
      id: 17,
      name: "Total - Away",
      category: "away",
      values: [
        ...([0.5, 1.5, 2.5, 3.5].flatMap(t => {
          const res = getTeamTotalOdds(ga, t);
          return [
            { value: `Over ${t}`, odd: res.over, locked: res.overLocked },
            { value: `Under ${t}`, odd: res.under, locked: res.underLocked },
          ];
        }))
      ],
    },
    {
      id: 24,
      name: `Clean Sheet - ${fixture.home.name}`,
      category: "home",
      isLocked: ga >= 1,
      values: [
        { value: "Yes", odd: ga >= 1 ? "—" : (remMinutes > 30 ? "1.65" : "1.22"), locked: ga >= 1 },
        { value: "No", odd: ga >= 1 ? "1.00" : (remMinutes > 30 ? "2.10" : "3.80"), locked: ga >= 1 },
      ],
    },
    {
      id: 25,
      name: `Clean Sheet - ${fixture.away.name}`,
      category: "away",
      isLocked: gh >= 1,
      values: [
        { value: "Yes", odd: gh >= 1 ? "—" : (remMinutes > 30 ? "1.75" : "1.25"), locked: gh >= 1 },
        { value: "No", odd: gh >= 1 ? "1.00" : (remMinutes > 30 ? "2.00" : "3.60"), locked: gh >= 1 },
      ],
    },
    {
      id: 34,
      name: `Win To Nil - ${fixture.home.name}`,
      category: "home",
      isLocked: ga >= 1,
      values: [
        { value: "Yes", odd: ga >= 1 ? "—" : (h * 1.2).toFixed(2), locked: ga >= 1 },
        { value: "No", odd: ga >= 1 ? "1.00" : "1.35", locked: ga >= 1 },
      ],
    },
    {
      id: 35,
      name: `Win To Nil - ${fixture.away.name}`,
      category: "away",
      isLocked: gh >= 1,
      values: [
        { value: "Yes", odd: gh >= 1 ? "—" : (a * 1.2).toFixed(2), locked: gh >= 1 },
        { value: "No", odd: gh >= 1 ? "1.00" : "1.30", locked: gh >= 1 },
      ],
    },
    {
      id: 21,
      name: "Odd/Even",
      category: "goals",
      values: [
        { value: "Odd", odd: totalGoals % 2 === 1 ? (remMinutes < 15 ? "1.35" : "1.90") : (remMinutes < 15 ? "2.90" : "1.90"), locked: false },
        { value: "Even", odd: totalGoals % 2 === 0 ? (remMinutes < 15 ? "1.35" : "1.90") : (remMinutes < 15 ? "2.90" : "1.90"), locked: false },
      ],
    },
    {
      id: 4,
      name: "Asian Handicap (Live)",
      category: "handicap",
      values: [
        { value: `Home -0.5`, odd: diff > 0 ? (1.05 + timeProgress * 0.1).toFixed(2) : (h * 1.1).toFixed(2), locked: false },
        { value: `Away +0.5`, odd: diff > 0 ? (a * 1.8).toFixed(2) : "1.65", locked: false },
        { value: `Home 0.0`, odd: h.toFixed(2), locked: false },
        { value: `Away 0.0`, odd: a.toFixed(2), locked: false },
        { value: `Home +0.5`, odd: diff < 0 ? (h * 1.8).toFixed(2) : "1.65", locked: false },
        { value: `Away -0.5`, odd: diff < 0 ? (1.05 + timeProgress * 0.1).toFixed(2) : (a * 1.1).toFixed(2), locked: false },
      ],
    },
    {
      id: 2,
      name: "European Handicap (Live)",
      category: "handicap",
      values: [
        { value: `Home (-1)`, odd: diff >= 2 ? "1.18" : (h * 1.6).toFixed(2), locked: false },
        { value: `Draw (-1)`, odd: (d * 1.1).toFixed(2), locked: false },
        { value: `Away (+1)`, odd: diff >= 2 ? (a * 2.5).toFixed(2) : "1.55", locked: false },
      ],
    },
    {
      id: 40,
      name: "Rest of the Match - Who will win?",
      category: "main",
      values: [
        { value: `${fixture.home.name}`, odd: "2.35", locked: el >= 90 },
        { value: "Draw", odd: "2.10", locked: el >= 90 },
        { value: `${fixture.away.name}`, odd: "2.80", locked: el >= 90 },
      ],
    },
  ];

  return markets;
}

async function fetchFixtureMarkets(fixtureId) {
  const fixture = findFixture(fixtureId) || { odds: {} };
  const isLive = isLiveFixture(fixture);

  // If match is LIVE, ALWAYS build real-time dynamic live markets with locked passed states!
  if (isLive) {
    const liveMarkets = buildLiveMarketsForFixture(fixture);
    state.fixtureMarkets[fixtureId] = liveMarkets;
    return liveMarkets;
  }

  const combo = buildMockComboMarkets(fixture);

  if (state.fixtureMarkets[fixtureId]) {
    const existing = state.fixtureMarkets[fixtureId];
    const missing = combo.filter((c) => !existing.some((m) => m.id === c.id || m.name === c.name));
    if (missing.length) state.fixtureMarkets[fixtureId] = [...existing, ...missing];
    return state.fixtureMarkets[fixtureId];
  }

  try {
    const res = await fetch(
      useApi()
        ? `${api().apiUrl()}/api/odds/fixture/${fixtureId}/markets`
        : `${API_BASE}/football/odds/fixture/${fixtureId}?bookmaker=${BOOKMAKER}`
    );
    if (res.ok) {
      const data = await res.json();
      if (data.ok && Array.isArray(data.markets) && data.markets.length) {
        const merged = [
          ...data.markets,
          ...combo.filter((c) => !data.markets.some((m) => m.name === c.name)),
        ];
        state.fixtureMarkets[fixtureId] = merged;
        return merged;
      }
    }
  } catch (_) { }

  const markets = fixture?.markets?.length > 3 ? fixture.markets : buildMockMarkets(fixture);
  state.fixtureMarkets[fixtureId] = markets;
  return markets;
}

function formatMatchDate(iso) {
  const d = new Date(iso);
  const date = d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  const time = d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  return `${date} ${time}`;
}

function marketGridCols(count) {
  if (count <= 1) return 1;
  if (count === 2) return 2;
  if (count === 3) return 3;
  if (count === 4) return 2;
  if (count <= 6) return 3;
  if (count <= 8) return 4;
  return 3;
}

function formatMarketLabel(value, fixture) {
  if (value === "Home") return "Home";
  if (value === "Away") return "Away";
  if (value === "Draw") return "Draw";
  if (value === "Yes") return "Yes";
  if (value === "No") return "No";
  if (value === "Home/Draw") return "Home or Draw";
  if (value === "Home/Away") return "Home or Away";
  if (value === "Draw/Away") return "Draw or Away";
  return value;
}

function getMarketCategory(market) {
  if (market.category) return market.category;
  return marketCategory(market.name);
}

function marketCategory(name) {
  const n = name.toLowerCase();
  if (n.includes("results/") || n.includes("result/total")) return "combo";
  if (n.includes("asian")) return "asian";
  if (n.includes("corner")) return "corners";
  if (n.includes("card")) return "cards";
  if (n.includes("goalscorer") || n.includes("scorer")) return "scorers";
  if (n.includes("player")) return "players";
  if (n.includes("minute")) return "minutes";
  if (n.includes("special")) return "specials";
  if (n.includes("combo")) return "combo";
  if (n.includes("chance mix")) return "chance";
  if (n.includes("handicap") || n.includes("goal line")) return "handicap";
  if (n.includes("correct score") || n.includes("exact score")) return "score";
  if (n.includes("first half") || n.includes("1st half")) return "half1";
  if (n.includes("second half") || n.includes("2nd half")) return "half2";
  if (n.includes("ht/ft") || n.includes("half time/full")) return "htft";
  if (n.includes("over") || n.includes("under") || n.includes("goals") || n.includes("total") || n.includes("odd/even")) return "goals";
  if (n.includes("home") && !n.includes("away") && !n.includes("draw")) return "home";
  if (n.includes("away") && !n.includes("home")) return "away";
  if (
    n.includes("result") ||
    n.includes("winner") ||
    n.includes("double chance") ||
    n.includes("both teams") ||
    n.includes("draw no bet") ||
    n.includes("score draw")
  )
    return "main";
  return "specials";
}

function matchBreadcrumb(fixture) {
  return `Football ${fixture.league.country} - ${fixture.league.name} / ${fixture.home.name} vs ${fixture.away.name}`;
}

function renderMarketTabs() {
  const el = $("market-tabs");
  if (!el) return;
  const markets = state.fixtureMarkets[state.detailFixtureId] || [];
  el.innerHTML = MARKET_TABS.map((t) => {
    const icon = t.icon ? `<span class="md-tab-icon" aria-hidden="true">${t.icon}</span>` : "";
    let count = 0;
    if (t.id === "all") {
      count = markets.length;
    } else {
      count = markets.filter((m) => getMarketCategory(m) === t.id).length;
    }
    const badgeHtml = count > 0 ? `<span class="md-tab-badge">${count}</span>` : "";
    return `<button type="button" class="md-tab${state.marketTab === t.id ? " is-on" : ""}" data-mtab="${t.id}">${icon}<span>${t.label}</span>${badgeHtml}</button>`;
  }).join("");
}

function formatKickoff(iso) {
  const d = new Date(iso);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const isTomorrow = d.toDateString() === tomorrow.toDateString();

  const time = d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  if (sameDay) return `Today ${time}`;
  if (isTomorrow) return `Tomorrow ${time}`;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" }) + " " + time;
}

function formatCountdown(iso) {
  const diff = new Date(iso).getTime() - Date.now();
  if (diff <= 0) return "00:00:00";
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return [h, m, s].map((v) => String(v).padStart(2, "0")).join(":");
}

function isLiveFixture(fixture) {
  if (!fixture) return false;
  const status = String(fixture.status || "").toUpperCase();
  if (["FT", "AET", "PEN", "PST", "CANC", "ABD", "FINISHED", "ENDED"].includes(status)) return false;
  if (fixture.isLive) return true;
  if (["LIVE", "1H", "2H", "HT", "ET", "P", "IN_PLAY", "BT"].includes(status)) return true;
  const kick = new Date(fixture.date).getTime();
  const now = Date.now();
  return kick <= now && kick >= now - 2 * 3600000;
}

function isBoardSubNav() {
  return ["daily", "upcoming", "inplay"].includes(state.subNav);
}

function isSportsHomeSubNav() {
  return state.subNav === "sports" && !state.sportsMenuMode;
}

function leagueIdInTopSet(leagueId) {
  return TOP_LEAGUE_IDS.has(Number(leagueId));
}

function updateSubNavHighlight() {
  document.querySelectorAll(".sub-nav-item").forEach((btn) => {
    btn.classList.toggle("is-on", btn.dataset.subnav === state.subNav);
  });
  updateMainNavHighlight();
}

function updateMainNavHighlight() {
  let active = "sport";
  if (state.subNav === "upcoming") active = "upcoming";
  if (state.subNav === "inplay") active = "live";
  document.querySelectorAll(".main-nav-tab").forEach((btn) => {
    btn.classList.toggle("is-on", btn.dataset.nav === active);
  });
  document.querySelectorAll(".top-link[data-nav]").forEach((btn) => {
    btn.classList.toggle("is-on", btn.dataset.nav === active);
  });
}

function refreshHomeAndBoard() {
  if (isSportsHomeSubNav()) renderHomeSportsView();
  if (isBoardSubNav()) renderBoard();
}

function applySubNav(id) {
  if (!id) return;

  state.subNav = id;
  state.leaguePageIds = [];
  state.detailFixtureId = null;
  updateSubNavHighlight();

  if (id === "my-bets") {
    setView("my-bets");
    renderMyBetsPage();
    return;
  }

  if (id === "check-bet") {
    setView("check-bet");
    return;
  }

  setView("sports");

  if (id === "all-events") {
    openSportsMenu("football", { fromSubNav: true });
    return;
  }

  if (state.sportsMenuMode) {
    state.sportsMenuMode = false;
    state.checkedLeagueIds.clear();
    updateOpenSelectedButton();
  }

  switch (id) {
    case "sports":
      state.timeFilter = "all";
      state.leagueFilter = "top";
      state.countryFilter = null;
      break;
    case "daily":
      state.timeFilter = "today";
      state.leagueFilter = "all";
      state.countryFilter = null;
      break;
    case "upcoming":
      state.timeFilter = "24h";
      state.leagueFilter = "all";
      state.countryFilter = null;
      break;
    case "inplay":
      state.timeFilter = "live";
      state.leagueFilter = "all";
      state.countryFilter = null;
      if (!state.liveFixtures || !state.liveFixtures.length) {
        fetchInPlayLiveFixtures().then((res) => {
          if (res && res.length) {
            state.liveFixtures = res;
            if (state.subNav === "inplay") refreshHomeAndBoard();
          }
        }).catch(() => {});
      }
      break;
    default:
      break;
  }

  updateSportsMenuUI();
  renderFilters();
  renderMobileTimeStrip();
  refreshHomeAndBoard();
}

function ticketHasLiveSelection(ticket) {
  return (ticket.bets || []).some((bet) => {
    const fixture = findFixture(bet.fixtureId);
    return isLiveFixture(fixture);
  });
}

function ticketPlacedAtMs(ticket) {
  if (!ticket.placedAt) return Date.now();
  return new Date(ticket.placedAt).getTime();
}

function passesMyBetsTimeFilter(ticket) {
  const placed = ticketPlacedAtMs(ticket);
  const now = Date.now();
  if (state.myBetsTime === "all") return true;
  if (state.myBetsTime === "week") return placed >= now - 7 * 24 * 3600000;
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  return placed >= start.getTime();
}

function initMockMyBetsHistory() {
  const now = new Date();
  const dStr = now.toISOString();

  return [
    {
      id: "589519497",
      type: "Multiple",
      placedAt: "2026-09-05T14:54:00",
      stake: 120.00,
      totalWin: 37927.58,
      cashout: 178.68,
      cashoutAvailable: false,
      status: "in-course",
      bets: [
        {
          homeName: "TSG 1899 Hoffenheim",
          awayName: "Borussia Dortmund",
          sport: "Football",
          country: "Germany",
          leagueName: "Bundesliga",
          kickoff: "5 Sep 16:30",
          isLive: false,
          marketName: "Match Result",
          selectionName: "W1",
          odd: 2.54,
          status: "lost",
        },
        {
          homeName: "West Ham United",
          awayName: "Derby County",
          sport: "Football",
          country: "England",
          leagueName: "Championship",
          kickoff: "5 Sep 17:00",
          isLive: false,
          marketName: "Match Result",
          selectionName: "W1",
          odd: 1.37,
          status: "won",
        },
        {
          homeName: "Bayern Munich",
          awayName: "RB Leipzig",
          sport: "Football",
          country: "Germany",
          leagueName: "Bundesliga",
          kickoff: "5 Sep 19:30",
          isLive: false,
          marketName: "Match Result",
          selectionName: "W1",
          odd: 1.65,
          status: "pending",
        },
      ],
    },
    {
      id: "589414977",
      type: "Multiple",
      placedAt: "2026-09-05T11:56:00",
      stake: 20.00,
      totalWin: 59.86,
      cashout: 11.60,
      cashoutAvailable: true,
      status: "won",
      bets: [
        {
          homeName: "Brentford",
          awayName: "Sunderland",
          sport: "Football",
          country: "England",
          leagueName: "Premier League",
          kickoff: "5 Sep 17:00",
          isLive: false,
          marketName: "Match Result",
          selectionName: "W1",
          odd: 1.73,
          status: "won",
        },
        {
          homeName: "Arsenal",
          awayName: "Chelsea",
          sport: "Football",
          country: "England",
          leagueName: "Premier League",
          kickoff: "6 Sep 18:30",
          isLive: false,
          marketName: "Match Result",
          selectionName: "W1",
          odd: 1.73,
          status: "won",
        },
      ],
    },
    {
      id: "589414105",
      type: "Multiple",
      placedAt: "2026-09-05T11:54:00",
      stake: 50.00,
      totalWin: 420.50,
      cashout: 42.00,
      cashoutAvailable: false,
      cashoutLocked: true,
      status: "in-course",
      bets: [
        {
          homeName: "Athletic Bilbao",
          awayName: "Atletico Madrid",
          sport: "Football",
          country: "Spain",
          leagueName: "La Liga",
          kickoff: "5 Sep 17:15",
          isLive: true,
          marketName: "Match Result",
          selectionName: "W1",
          odd: 2.10,
        },
      ],
    },
  ];
}

function calculateTicketCashout(t) {
  if (t.cashout != null) return Number(t.cashout);
  const stake = Number(t.stake) || 20;
  const totalWin = Number(t.totalWin) || (stake * (Number(t.totalOdds) || 2));
  const val = Math.min(totalWin * 0.75, Math.max(stake * 0.58, totalWin * 0.08));
  return Number(val.toFixed(2));
}

function isTicketCashoutLocked(t) {
  if (state.cashoutLocked || window.HOPE_BET_CONFIG?.CASHOUT_LOCKED) return true;
  if (t.cashoutLocked) return true;
  return (t.bets || []).some((b) => {
    const f = findFixture(b.fixtureId);
    if (!f) return false;
    return isFixtureMarketLocked(f, b);
  });
}

window.unlockCashout = function () {
  state.cashoutLocked = false;
  if (window.HOPE_BET_CONFIG) window.HOPE_BET_CONFIG.CASHOUT_LOCKED = false;
  try { localStorage.setItem("hope_bet_cashout_locked", "false"); } catch (_) {}
  renderMyBetsPage();
  toast("Cashout has been unlocked", "ok");
};

window.lockCashout = function () {
  state.cashoutLocked = true;
  if (window.HOPE_BET_CONFIG) window.HOPE_BET_CONFIG.CASHOUT_LOCKED = true;
  try { localStorage.setItem("hope_bet_cashout_locked", "true"); } catch (_) {}
  renderMyBetsPage();
  toast("Cashout has been locked", "err");
};

window.toggleCashoutLock = function () {
  if (state.cashoutLocked) {
    window.unlockCashout();
  } else {
    window.lockCashout();
  }
};

function cashoutTicket(ticketId) {
  const t = (state.history || []).find((item) => String(item.id) === String(ticketId));
  if (!t) return;
  if (isTicketCashoutLocked(t)) {
    toast("Cashout is currently locked / suspended for this ticket", "err");
    return;
  }
  if (t.cashedOut || t.status === "closed") {
    toast("This ticket has already been cashed out or closed", "err");
    return;
  }
  const amount = calculateTicketCashout(t);
  state.balance = Number((state.balance + amount).toFixed(2));
  t.status = "closed";
  t.cashedOut = true;
  t.cashedOutAmount = amount;
  save();
  renderBalance();
  renderMyBetsPage();
  toast(`Ticket #${t.id} successfully cashed out for ${amount.toFixed(2)} ETB!`, "ok");
}

function repeatTicketToSlip(ticketId) {
  const t = (state.history || []).find((item) => String(item.id) === String(ticketId));
  if (!t || !t.bets || !t.bets.length) return;

  state.slip = [];
  let added = 0;
  t.bets.forEach((b) => {
    const fixture = findFixture(b.fixtureId) || {
      fixtureId: b.fixtureId || Math.floor(Math.random() * 900000) + 100000,
      home: { name: b.homeName || "Home Team", logo: "" },
      away: { name: b.awayName || "Away Team", logo: "" },
      league: { name: b.leagueName || "League", country: b.country || "World" },
      date: new Date().toISOString(),
      status: b.isLive ? "1H" : "NS",
      isLive: Boolean(b.isLive),
    };
    addToSlip(fixture, b.market || "1x2", b.selection || "home", b.odd, b.marketName || "Match Result", b.selectionName || "W1");
    added++;
  });
  save();
  renderSlip();
  setView("sports");
  toast(`Added ${added} events to betslip`, "ok");
}

function handleMyBetsPrint(ticketId) {
  const t = (state.history || []).find((item) => String(item.id) === String(ticketId));
  if (!t) return;
  printTicketReceipt(t, { forceReprint: true });
}

function formatMyBetsDate(dateStr) {
  const d = dateStr ? new Date(dateStr) : new Date();
  if (isNaN(d.getTime())) return "05/09/2026 14:54";
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, "0");
  const mins = String(d.getMinutes()).padStart(2, "0");
  return `${day}/${month}/${year} ${hours}:${mins}`;
}

function formatMyBetsMatchTime(kickoffStr, isLive) {
  let displayTime = "Today";
  if (kickoffStr) {
    const raw = String(kickoffStr).trim();
    if (/^\d{1,2}\s+[A-Za-z]{3}\s+\d{1,2}:\d{2}$/.test(raw)) {
      displayTime = raw;
    } else {
      const d = new Date(raw);
      if (!isNaN(d.getTime())) {
        const day = d.getDate();
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const month = months[d.getMonth()];
        const hours = String(d.getHours()).padStart(2, "0");
        const mins = String(d.getMinutes()).padStart(2, "0");
        displayTime = `${day} ${month} ${hours}:${mins}`;
      } else {
        displayTime = raw.replace(/T/, " ").replace(/\..+$/, "").replace(/Z$/, "");
      }
    }
  }
  if (isLive) return `${displayTime} <span class="mb-event-time-live">[Live]</span>`;
  return displayTime;
}

function formatMyBetsPickBadge(b) {
  const mName = String(b.marketName || b.market || "").toLowerCase();
  const selName = String(b.selectionName || "").trim();
  const selVal = String(b.selection || b.value || "").trim().toLowerCase();
  const home = String(b.homeName || "").trim().toLowerCase();
  const away = String(b.awayName || "").trim().toLowerCase();

  // Match Result / 1X2 market or unspecified main market
  if (
    mName.includes("match") ||
    mName.includes("1x2") ||
    mName === "1x2" ||
    mName.includes("result") ||
    !mName
  ) {
    if (
      selVal === "home" ||
      selVal === "1" ||
      selVal === "w1" ||
      selName.toLowerCase() === "home" ||
      selName.toLowerCase() === "w1" ||
      (home && selName.toLowerCase() === home) ||
      (home && home.includes(selName.toLowerCase()))
    ) {
      return "W1";
    }
    if (
      selVal === "away" ||
      selVal === "2" ||
      selVal === "w2" ||
      selName.toLowerCase() === "away" ||
      selName.toLowerCase() === "w2" ||
      (away && selName.toLowerCase() === away) ||
      (away && away.includes(selName.toLowerCase()))
    ) {
      return "W2";
    }
    if (
      selVal === "draw" ||
      selVal === "x" ||
      selName.toLowerCase() === "draw" ||
      selName.toLowerCase() === "x"
    ) {
      return "X";
    }
  }

  // General fallback mappings if home/away/draw are specified
  if (selVal === "home" || (home && selName.toLowerCase() === home)) return "W1";
  if (selVal === "away" || (away && selName.toLowerCase() === away)) return "W2";
  if (selVal === "draw" || selName.toLowerCase() === "draw") return "X";

  // Double chance mappings
  if (selVal.includes("1x") || selName.toLowerCase().includes("1x")) return "1X";
  if (selVal.includes("x2") || selName.toLowerCase().includes("x2")) return "X2";
  if (selVal.includes("12") || selName.toLowerCase().includes("12")) return "12";

  return b.selectionName || b.value || b.selection || "W1";
}

function renderBetResultBadge(result) {
  if (result === "won") {
    return `<span class="mb-pick-result mb-pick-result--win" title="Won">
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="3.8" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
    </span>`;
  }
  if (result === "lost") {
    return `<span class="mb-pick-result mb-pick-result--loss" title="Lost">
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="3.8" stroke-linecap="round" stroke-linejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    </span>`;
  }
  return "";
}

function evaluateFixtureBetResult(fixture, b) {
  if (!fixture) return null;
  const gh = Number(fixture.goals?.home ?? fixture.score?.home ?? 0);
  const ga = Number(fixture.goals?.away ?? fixture.score?.away ?? 0);
  const market = String(b.market || b.marketKey || "").toLowerCase();
  const sel = String(b.selection || b.value || b.selectionName || "").toLowerCase();

  // Match Result / 1X2
  if (market === "1x2" || market.includes("match") || String(b.marketName || "").toLowerCase().includes("match result")) {
    if (gh > ga) {
      return (sel === "home" || sel === "1" || sel === "w1") ? "won" : "lost";
    } else if (ga > gh) {
      return (sel === "away" || sel === "2" || sel === "w2") ? "won" : "lost";
    } else {
      return (sel === "draw" || sel === "x") ? "won" : "lost";
    }
  }

  // Over / Under 2.5
  if (market.includes("over") || market.includes("under") || String(b.marketName || "").toLowerCase().includes("over/under")) {
    const total = gh + ga;
    const isOver = sel.includes("over") || sel.startsWith("o");
    const line = parseFloat(sel.replace(/[^0-9.]/g, "")) || 2.5;
    if (isOver) return total > line ? "won" : "lost";
    return total < line ? "won" : "lost";
  }

  // Both Teams to Score (GG/NG)
  if (market.includes("btts") || market.includes("gg") || String(b.marketName || "").toLowerCase().includes("both teams")) {
    const bothScored = gh > 0 && ga > 0;
    const wantsYes = sel === "yes" || sel === "gg";
    return (wantsYes && bothScored) || (!wantsYes && !bothScored) ? "won" : "lost";
  }

  // Double Chance
  if (market.includes("double") || String(b.marketName || "").toLowerCase().includes("double chance")) {
    if (sel === "1x" || sel === "1/x") return gh >= ga ? "won" : "lost";
    if (sel === "x2" || sel === "x/2") return ga >= gh ? "won" : "lost";
    if (sel === "12" || sel === "1/2") return gh !== ga ? "won" : "lost";
  }

  return null;
}

function getBetSelectionResult(b, ticket) {
  if (b.status === "won" || b.status === "win") return "won";
  if (b.status === "lost" || b.status === "loss") return "lost";
  if (b.status === "void" || b.status === "canceled") return "void";

  const fixture = findFixture(b.fixtureId);
  if (fixture && isFixtureFinished(fixture, b)) {
    return evaluateFixtureBetResult(fixture, b);
  }

  // Fallback for settled tickets if individual match status was not stored
  if (ticket) {
    if (ticket.status === "won") return "won";
    if (ticket.status === "lost") {
      const bets = ticket.bets || [];
      const hasExplicitLoss = bets.some((x) => x.status === "lost" || x.status === "loss");
      if (hasExplicitLoss) {
        return (b.status === "lost" || b.status === "loss") ? "lost" : ((b.status === "won" || b.status === "win") ? "won" : null);
      }
      // If none was explicitly marked lost, first match is marked lost (x) and second won (v)
      if (bets[0] === b) return "lost";
      if (bets.length > 1 && bets[1] === b) return "won";
    }
  }

  return null;
}

function recordMatchResult(query, outcome) {
  const norm = String(query || "").trim().toLowerCase();
  const validOutcome = (outcome === "won" || outcome === "win" || outcome === true) ? "won" :
                       (outcome === "lost" || outcome === "loss" || outcome === false) ? "lost" :
                       (outcome === "void" || outcome === "cancel") ? "void" : "pending";

  let updatedCount = 0;
  (state.history || []).forEach((ticket) => {
    (ticket.bets || []).forEach((bet) => {
      const matchName = `${bet.homeName || ""} ${bet.awayName || ""} ${bet.fixtureName || ""}`.toLowerCase();
      if (!norm || matchName.includes(norm) || String(bet.fixtureId) === norm) {
        bet.status = validOutcome;
        updatedCount++;
      }
    });

    const allBets = ticket.bets || [];
    const hasLost = allBets.some((b) => getBetSelectionResult(b, ticket) === "lost");
    const isAllWon = allBets.length > 0 && allBets.every((b) => getBetSelectionResult(b, ticket) === "won");
    if (hasLost) {
      ticket.status = "lost";
    } else if (isAllWon) {
      ticket.status = "won";
    }
  });

  save();
  renderMyBetsPage();
  return { updatedCount, outcome: validOutcome };
}

function recordTicketResult(ticketId, outcome) {
  const t = (state.history || []).find((ticket) => String(ticket.id) === String(ticketId));
  if (!t) return false;
  const validOutcome = (outcome === "won" || outcome === "win") ? "won" : "lost";
  t.status = validOutcome;
  if (validOutcome === "won") {
    (t.bets || []).forEach((b) => { b.status = "won"; });
  } else {
    const hasLost = (t.bets || []).some((b) => b.status === "lost");
    if (!hasLost && (t.bets || []).length > 0) {
      t.bets[0].status = "lost";
      if (t.bets.length > 1) t.bets[1].status = "won";
    }
  }
  save();
  renderMyBetsPage();
  return true;
}

window.recordMatchResult = recordMatchResult;
window.recordTicketResult = recordTicketResult;

function passesMyBetsStatusFilter(ticket) {
  const status = ticket.status || "in-course";
  const hasLost = (ticket.bets || []).some((b) => getBetSelectionResult(b, ticket) === "lost");
  const isAllWon = (ticket.bets || []).length > 0 && (ticket.bets || []).every((b) => getBetSelectionResult(b, ticket) === "won");
  const isSettled = status === "closed" || status === "won" || status === "lost" || hasLost || isAllWon;

  if (state.myBetsStatus === "closed") {
    return isSettled;
  }
  if (state.myBetsStatus === "live") {
    return !isSettled && (ticketHasLiveSelection(ticket) || (ticket.bets || []).some((b) => b.isLive));
  }
  // In Course:
  return !isSettled || status === "in-course";
}

function filteredMyBets() {
  const q = state.myBetsSearch.trim().toLowerCase();
  return state.history.filter((ticket) => {
    if (q && !String(ticket.id).toLowerCase().includes(q)) return false;
    if (!passesMyBetsStatusFilter(ticket)) return false;
    if (!passesMyBetsTimeFilter(ticket)) return false;
    return true;
  });
}

function renderMyBetsPage() {
  const list = $("my-bets-list");
  if (!list) return;

  document.querySelectorAll("[data-mybets-status]").forEach((btn) => {
    btn.classList.toggle("is-on", btn.dataset.mybetsStatus === state.myBetsStatus);
  });
  document.querySelectorAll("[data-mybets-time]").forEach((btn) => {
    btn.classList.toggle("is-on", btn.dataset.mybetsTime === state.myBetsTime);
  });

  const search = $("my-bets-search");
  if (search && search.value !== state.myBetsSearch) search.value = state.myBetsSearch;

  const tickets = filteredMyBets();
  if (!tickets.length) {
    list.innerHTML = `<div class="my-bets-empty">There are no active bets this moment!</div>`;
    return;
  }

  list.innerHTML = `<div class="my-bets-grid">` + tickets
    .map((t) => {
      const isExpanded = state.expandedMyBetsTickets && state.expandedMyBetsTickets.has(String(t.id));
      const allBets = t.bets || [];
      const visibleBets = isExpanded ? allBets : allBets.slice(0, 2);
      const hasMore = allBets.length > 2;

      const eventsHtml = visibleBets.map((b) => {
        const homeAway = b.homeName && b.awayName ? `${b.homeName} - ${b.awayName}` : (b.fixtureName || "Match");
        const meta = [b.sport || "Football", b.country || "", b.leagueName || ""].filter(Boolean).join(" - ");
        const res = getBetSelectionResult(b, t);
        const isLive = Boolean(b.isLive) && !res;
        const timeHtml = formatMyBetsMatchTime(b.kickoff, isLive);
        const pickBadge = formatMyBetsPickBadge(b);
        const oddVal = Number(b.odd || 0).toFixed(2);
        const resultBadgeHtml = renderBetResultBadge(res);

        return `
        <div class="mb-event-row">
          <div class="mb-event-title">${homeAway}</div>
          <div class="mb-event-league">${meta}</div>
          <div class="mb-event-time">${timeHtml}</div>
          <div class="mb-pick-line">
            <span class="mb-pick-left">
              <span>${b.marketName || "Match Result"}:</span>
              <span class="mb-pick-badge">${pickBadge}</span>
            </span>
            <span class="mb-odd-val">${oddVal}${resultBadgeHtml}</span>
          </div>
        </div>`;
      }).join("");

      const accordionHtml = hasMore ? `
        <div class="mb-show-events" data-toggle-events="${t.id}">
          ${isExpanded ? "Show Less Events ▲" : "Show All Events ▼"}
        </div>` : "";

      const hasLostPick = allBets.some((b) => getBetSelectionResult(b, t) === "lost");
      const isAllWon = allBets.length > 0 && allBets.every((b) => getBetSelectionResult(b, t) === "won");
      const isSettled = t.status === "closed" || t.status === "won" || t.status === "lost" || hasLostPick || isAllWon;

      const isLocked = isTicketCashoutLocked(t);
      const isCashedOut = Boolean(t.cashedOut || t.status === "closed");
      const cashoutVal = calculateTicketCashout(t).toFixed(2);
      const stakeVal = Number(t.stake || 0).toFixed(2);
      const totalWinVal = Number(t.totalWin || (t.stake * (t.totalOdds || 1))).toFixed(2);
      const dateHeader = formatMyBetsDate(t.placedAt);

      let outcomeHtml = "";
      let headerStatusTag = "";
      if (hasLostPick || t.status === "lost") {
        outcomeHtml = `<div class="mb-ticket-outcome is-lost"><span class="mb-outcome-badge">✕</span><span>Ticket Lost</span></div>`;
        headerStatusTag = `<span class="mb-header-status is-lost">Ticket Lost</span>`;
      } else if (!hasLostPick && (isAllWon || t.status === "won")) {
        outcomeHtml = `<div class="mb-ticket-outcome is-won"><span class="mb-outcome-badge">✓</span><span>Ticket Won</span></div>`;
        headerStatusTag = `<span class="mb-header-status is-won">Ticket Won</span>`;
      }

      let cashoutBtnHtml = "";

      if (isCashedOut) {
        cashoutBtnHtml = `<button type="button" class="mb-btn-cashout is-cashed-out" disabled>Cashed Out (${Number(t.cashedOutAmount || cashoutVal).toFixed(2)} ETB)</button>`;
      } else if (!isSettled) {
        const lockedAttr = isLocked ? ` data-locked="true" title="Cashout is currently locked"` : "";
        cashoutBtnHtml = `<button type="button" class="mb-btn-cashout${isLocked ? " is-locked" : ""}" data-cashout-ticket="${t.id}"${lockedAttr}>Cashout ${cashoutVal} ETB</button>`;
      }

      return `
      <article class="my-bets-card" data-ticket-id="${t.id}">
        <div class="my-bets-card-header">
          <div>
            <span class="mb-header-title">${t.type || "Multiple"}:${t.id}</span>
            <span class="mb-header-date">${dateHeader}</span>
            ${headerStatusTag}
          </div>
          <button type="button" class="mb-header-print" data-print-ticket="${t.id}" title="Print Receipt">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z"/></svg>
          </button>
        </div>

        <div class="mb-events-list">
          ${eventsHtml}
          ${accordionHtml}
        </div>

        <div class="mb-card-footer">
          <div class="mb-amounts-row">
            <span>Stake: ${stakeVal} ETB</span>
            <span>Total Win: ${totalWinVal} ETB</span>
          </div>
          ${outcomeHtml}
          <button type="button" class="mb-btn-repeat" data-repeat-ticket="${t.id}">Add Ticket To Betslip</button>
          ${cashoutBtnHtml}
        </div>
      </article>`;
    })
    .join("") + `</div>`;
}

function passesTimeFilter(fixture) {
  const tf = getTimeFilterDef(state.timeFilter);
  if (!tf || tf.hours === null) return true;

  const kick = new Date(fixture.date).getTime();
  const now = Date.now();

  if (tf.hours === "today") return kick <= endOfToday().getTime() && kick >= now - 3600000;
  if (tf.hours === "tomorrow") {
    return kick >= startOfTomorrow().getTime() && kick <= endOfTomorrow().getTime();
  }
  if (tf.hours === "date") {
    return kick >= tf.dateStart && kick <= tf.dateEnd;
  }
  return kick <= now + tf.hours * 3600000 && kick >= now - 3600000;
}

function footballMenuFixtures() {
  if (!state.leaguePageIds.length) return [];
  const ids = new Set(state.leaguePageIds);
  return state.fixtures.filter((f) => {
    if (!ids.has(f.league.id)) return false;
    if (state.eventSearch) {
      const q = state.eventSearch.toLowerCase();
      const hay = `${f.home.name} ${f.away.name} ${f.league.name}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return passesTimeFilter(f);
  });
}

function getLeagueNameById(id) {
  for (const region of Object.values(FOOTBALL_STATIC_LEAGUES)) {
    const hit = region.find((l) => l.id === id);
    if (hit) return hit.name;
  }
  for (const leagues of Object.values(state.countryLeagues)) {
    const hit = leagues.find((l) => l.id === id);
    if (hit) return hit.name;
  }
  const fromFixture = state.fixtures.find((f) => f.league.id === id);
  return fromFixture?.league.name || `League ${id}`;
}

function filteredFixtures() {
  const source = state.subNav === "inplay"
    ? ((state.liveFixtures && state.liveFixtures.length) ? state.liveFixtures : state.fixtures.filter(isLiveFixture))
    : state.fixtures;

  return source.filter((f) => {
    if (!f?.home?.name || !f?.away?.name) return false;
    if (state.subNav === "inplay" && !isLiveFixture(f)) return false;
    if (state.eventSearch) {
      const q = state.eventSearch.toLowerCase();
      const hay = `${f.home.name} ${f.away.name} ${f.league?.name || ""}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    if (state.countryFilter && f.league?.country !== state.countryFilter) return false;
    if (state.leagueFilter === "top" && !leagueIdInTopSet(f.league?.id)) return false;
    if (state.leagueFilter !== "all" && state.leagueFilter !== "top" && Number(f.league?.id) !== Number(state.leagueFilter)) {
      return false;
    }
    if (state.subNav === "inplay") return true;
    return passesTimeFilter(f);
  });
}

function fixturesForCarousel() {
  const preferredIds = [940105, 990105, 940106, 904304, 904307, 950101, 930101, 970101, 960101];
  const byId = new Map();
  (state.fixtures || []).forEach((f) => byId.set(f.fixtureId, f));

  const result = [];
  for (const id of preferredIds) {
    if (byId.has(id)) {
      result.push(byId.get(id));
      byId.delete(id);
    }
  }

  if (result.length < 8) {
    const rest = (state.fixtures || []).filter((f) => f?.home?.name && f?.away?.name && !result.includes(f));
    result.push(...rest.slice(0, 8 - result.length));
  }
  return result;
}

function boardTitle() {
  if (state.subNav === "daily") return "Daily Events";
  if (state.subNav === "upcoming") return "Upcoming";
  if (state.subNav === "inplay") return "Live / In-Play Matches";
  if (state.countryFilter) return state.countryFilter.toUpperCase();
  if (state.leagueFilter === "all") return "All Leagues";
  if (state.leagueFilter === "top") return "Top Leagues";
  const lf = LEAGUE_FILTERS.find((l) => l.id === state.leagueFilter);
  return lf ? lf.label : "Matches";
}

function slipKey(fixtureId, marketKey, selection) {
  return `${fixtureId}:${marketKey}:${selection}`;
}

function isSelected(fixtureId, marketKey, selection) {
  return state.slip.some((b) => b.key === slipKey(fixtureId, marketKey, selection));
}

function getMarketOdds(fixture, market, selection) {
  if (market === "1x2") {
    if (selection === "home") return fixture.odds?.home || "—";
    if (selection === "draw") return fixture.odds?.draw || "—";
    return fixture.odds?.away || "—";
  }
  if (market === "dc") {
    const dc = fixture.odds?.doubleChance || {};
    if (selection === "1x") return dc.homeDraw || "—";
    if (selection === "12") return dc.homeAway || "—";
    if (selection === "x2") return dc.drawAway || "—";
    return dc.drawAway || "—";
  }
  if (market === "btts") {
    const b = fixture.odds?.btts || {};
    return selection === "yes" ? (b.yes || "—") : (b.no || "—");
  }
  if (market === "dnb") {
    const d = fixture.odds?.dnb || {};
    return selection === "home" ? (d.home || "—") : (d.away || "—");
  }
  if (market === "ou15") {
    const t = fixture.odds?.totals || {};
    return selection === "over" ? (t.over15 || "—") : (t.under15 || "—");
  }
  if (market === "ou35") {
    const t = fixture.odds?.totals || {};
    return selection === "over" ? (t.over35 || "—") : (t.under35 || "—");
  }
  const t = fixture.odds?.totals || {};
  if (selection === "over") return t.over25 || "—";
  return t.under25 || "—";
}

function selectionLabel(market, selection, fixture) {
  if (market === "1x2") {
    if (selection === "home") return fixture.home?.name || "1";
    if (selection === "draw") return "Draw";
    return fixture.away?.name || "2";
  }
  if (market === "dc") {
    if (selection === "1x") return "1X";
    if (selection === "12") return "12";
    return "X2";
  }
  if (market === "btts") {
    return selection === "yes" ? "GG (Yes)" : "NG (No)";
  }
  if (market === "dnb") {
    return selection === "home" ? `${fixture.home?.name || "Home"} (DNB)` : `${fixture.away?.name || "Away"} (DNB)`;
  }
  if (market === "ou15") {
    return selection === "over" ? "Over 1.5" : "Under 1.5";
  }
  if (market === "ou35") {
    return selection === "over" ? "Over 3.5" : "Under 3.5";
  }
  return selection === "over" ? "Over 2.5" : "Under 2.5";
}

function inferCountry(leagueName, fixtureName) {
  const s = String((leagueName || "") + " " + (fixtureName || "")).toLowerCase();
  if (s.includes("premier league") || s.includes("championship") || s.includes("league one") || s.includes("league two") || s.includes("england") || s.includes("efl") || s.includes("fa cup")) return "England";
  if (s.includes("la liga") || s.includes("spain") || s.includes("segunda") || s.includes("copa del rey")) return "Spain";
  if (s.includes("serie a") || s.includes("italy") || s.includes("serie b") || s.includes("coppa italia")) return "Italy";
  if (s.includes("bundesliga") || s.includes("germany") || s.includes("dfb")) return "Germany";
  if (s.includes("ligue 1") || s.includes("france") || s.includes("ligue 2")) return "France";
  if (s.includes("eredivisie") || s.includes("netherlands") || s.includes("holland")) return "Netherlands";
  if (s.includes("npl") || s.includes("australia") || s.includes("a-league") || s.includes("adelaide") || s.includes("playford")) return "Australia";
  if (s.includes("ethiopia") || s.includes("ethiopian")) return "Ethiopia";
  if (s.includes("kenya")) return "Kenya";
  if (s.includes("belgium") || s.includes("first division a") || s.includes("pro league")) return "Belgium";
  if (s.includes("portugal") || s.includes("primeira")) return "Portugal";
  if (s.includes("turkey") || s.includes("super lig")) return "Turkey";
  if (s.includes("scotland") || s.includes("premiership")) return "Scotland";
  if (s.includes("champions league") || s.includes("europa")) return "Europe";
  if (s.includes("mls") || s.includes("usa")) return "USA";
  if (s.includes("brazil")) return "Brazil";
  if (s.includes("argentina")) return "Argentina";
  return "";
}

function marketNameFor(market) {
  if (market === "1x2") return "Match Result";
  if (market === "dc") return "Double Chance";
  if (market === "btts") return "Both Teams to Score";
  if (market === "dnb") return "Draw No Bet";
  if (market === "ou15") return "Total Goals Over/Under 1.5";
  if (market === "ou35") return "Total Goals Over/Under 3.5";
  return "Total Goals Over/Under 2.5";
}

function isFixtureStarted(kickoff) {
  return new Date(kickoff).getTime() <= Date.now();
}

function isFixtureFinished(fixture, bet) {
  if (!fixture) return false;
  const status = String(fixture.status || "").toUpperCase();
  if (["FT", "AET", "PEN", "PST", "CANC", "ABD", "FINISHED", "ENDED"].includes(status)) return true;
  if (fixture.isFinished || fixture.finished) return true;
  if (!fixture.isLive && fixture.date) {
    const kick = new Date(fixture.date).getTime();
    if (!isNaN(kick) && Date.now() - kick > 120 * 60 * 1000) return true;
  }
  return false;
}

function isFixtureMarketLocked(fixture, bet) {
  if (!fixture) return false;
  if (isFixtureFinished(fixture, bet)) return false;

  if (isLiveFixture(fixture)) {
    const rawElapsed = Number(fixture.elapsed ?? 1);
    if (rawElapsed >= 88) return true;

    if (String(bet.market).startsWith("m")) {
      const marketId = Number(String(bet.market).slice(1));
      const markets = state.fixtureMarkets[fixture.fixtureId] || buildLiveMarketsForFixture(fixture);
      const m = markets.find((item) => Number(item.id) === marketId);
      if (!m || m.isLocked) return true;
      const val = (m.values || []).find((v) => v.value === bet.selection);
      if (!val || val.locked) return true;
      return false;
    }

    return isLiveSelectionLocked(fixture, bet.market, bet.selection);
  }

  // Pre-match game that kicked off but isn't tracked in live in-play
  if (isFixtureStarted(fixture.date || bet.kickoff)) {
    return true;
  }
  return false;
}

function getLatestOddForSlipBet(b) {
  const fixture = findFixture(b.fixtureId);
  if (!fixture) return b.odd;

  if (String(b.market).startsWith("m")) {
    const marketId = Number(String(b.market).slice(1));
    const markets = state.fixtureMarkets[fixture.fixtureId] || (isLiveFixture(fixture) ? buildLiveMarketsForFixture(fixture) : []);
    const m = markets.find((item) => Number(item.id) === marketId);
    if (m && m.values) {
      const val = m.values.find((v) => v.value === b.selection);
      if (val && !isNaN(parseFloat(val.odd))) {
        return parseFloat(val.odd);
      }
    }
  } else {
    const oddStr = getMarketOdds(fixture, b.market, b.selection);
    if (oddStr && oddStr !== "—") {
      const num = parseFloat(oddStr);
      if (!isNaN(num) && num > 1) return num;
    }
  }
  return b.odd;
}

function getSlipBetStatus(b) {
  const fixture = findFixture(b.fixtureId);
  const isFinished = isFixtureFinished(fixture, b);
  const isSuspended = !isFinished && isFixtureMarketLocked(fixture, b);
  const currentOdd = getLatestOddForSlipBet(b);
  const oddDiff = Number((currentOdd - b.odd).toFixed(2));
  let trend = "";
  if (!isFinished && !isSuspended) {
    if (oddDiff > 0.005) trend = "up";
    else if (oddDiff < -0.005) trend = "down";
  }

  return {
    fixture,
    isFinished,
    isSuspended,
    currentOdd,
    oddDiff,
    trend,
  };
}

function isSlipBetExpired(bet) {
  const st = getSlipBetStatus(bet);
  return st.isFinished || st.isSuspended;
}

function activeSlipBets() {
  return state.slip.filter((b) => !isSlipBetExpired(b));
}

function acceptSlipOddsChanges() {
  let updatedCount = 0;
  state.slip.forEach((b) => {
    const st = getSlipBetStatus(b);
    if (!st.isFinished && !st.isSuspended && st.currentOdd) {
      if (b.odd !== st.currentOdd) {
        b.odd = st.currentOdd;
        updatedCount++;
      }
    }
  });
  save();
  renderSlip();
  if (updatedCount > 0) {
    toast("Odds changes accepted", "ok");
  }
}

function addToSlip(fixture, marketKey, selection, odd, marketLabel, pickLabel) {
  state.betPlacedSuccessTicket = null;
  const key = slipKey(fixture.fixtureId, marketKey, selection);
  const idx = state.slip.findIndex((b) => b.key === key);

  if (idx >= 0) {
    state.slip.splice(idx, 1);
    return;
  }

  // Only one selection allowed per match
  state.slip = state.slip.filter((b) => b.fixtureId !== fixture.fixtureId);

  const country = fixture.league?.country || inferCountry(fixture.league?.name, `${fixture.home.name} vs ${fixture.away.name}`) || "England";
  const leagueName = fixture.league?.name || "League";
  const isLive = Boolean(fixture.isLive || isLiveFixture(fixture));

  state.slip.push({
    key,
    fixtureId: fixture.fixtureId,
    market: marketKey,
    selection,
    odd: parseFloat(odd) || 1,
    fixtureName: `${fixture.home.name} vs ${fixture.away.name}`,
    homeName: fixture.home.name,
    awayName: fixture.away.name,
    homeLogo: fixture.home.logo,
    awayLogo: fixture.away.logo,
    selectionName: pickLabel,
    marketName: marketLabel || "Match Result",
    kickoff: fixture.date,
    sport: "Football",
    country,
    leagueName,
    isLive,
  });
}

function refreshMatchViews() {
  const leaguesView = document.querySelector('[data-view="leagues"]');
  if (leaguesView && !leaguesView.hidden) {
    renderLeaguePage();
    return;
  }
  refreshHomeAndBoard();
}

function toggleSelection(fixture, market, selection) {
  if (isLiveSelectionLocked(fixture, market, selection)) {
    toast("This market outcome has already passed / is locked", "err");
    return;
  }
  const odd = getMarketOdds(fixture, market, selection);
  addToSlip(fixture, market, selection, odd, marketNameFor(market), selectionLabel(market, selection, fixture));
  save();
  renderSlip();
  refreshMatchViews();
  if (state.detailFixtureId) renderMatchDetail();
}

function toggleDetailSelection(fixture, market, value) {
  const marketKey = `m${market.id}`;
  addToSlip(fixture, marketKey, value.value, value.odd, market.name, value.value);
  save();
  renderSlip();
  renderMatchDetail();
  refreshMatchViews();
}

function totalOdds() {
  const bets = activeSlipBets();
  if (!bets.length) return 0;
  if (state.slipMode === "single" && bets.length === 1) {
    const st = getSlipBetStatus(bets[0]);
    return st.currentOdd || bets[0].odd;
  }
  return bets.reduce((acc, b) => {
    const st = getSlipBetStatus(b);
    return acc * (st.currentOdd || b.odd);
  }, 1);
}

function potentialWin() {
  return state.stake * totalOdds();
}

function renderBalance() {
  const hidden = state.balanceHidden;
  const balance = $("balance");
  if (balance) {
    const val = Number(state.balance) || 0;
    balance.textContent = hidden ? "••••" : (val % 1 === 0 ? String(val) : fmt(val));
  }
  const cur = $("currency-label");
  const stakeCur = $("stake-currency");
  const bonus = $("bonus-balance");
  const bonusCur = $("bonus-currency");
  if (cur) cur.textContent = CURRENCY;
  if (stakeCur) stakeCur.textContent = CURRENCY;
  if (bonusCur) bonusCur.textContent = CURRENCY;
  if (bonus) {
    const bVal = Number(state.sessionUser?.bonusBalance ?? state.bonusBalance ?? 0);
    bonus.textContent = hidden ? "••••" : fmt(bVal);
  }
}

function renderSportsSidebar() {
  const el = $("sidebar-sports");
  if (!el) return;
  el.innerHTML = SPORTS_MENU.map(
    (s) => `
    <button type="button" class="sidebar-sport-row${state.sportFilter === s.id && state.sportsMenuMode ? " is-on" : ""}" data-sidebar-sport="${s.id}">
      <span class="sidebar-sport-count">${s.count || 0}</span>
      <span class="sidebar-sport-dot">•</span>
      <span class="sidebar-sport-name">${s.name}</span>
      <span class="sidebar-sport-icon">${s.icon}</span>
    </button>`
  ).join("");
  renderMobileSportsStrip();
  renderMobileTimeStrip();
}

function renderTopLeaguesGrid() {
  const el = $("top-leagues-grid");
  if (!el) return;
  const sidebar = getSidebarData();
  const leagues = sidebar.topLeagues || [];
  if (!leagues.length) {
    el.innerHTML = "";
    return;
  }
  const activeId = Number(state.homeSelectedLeague || 39);
  el.innerHTML = leagues
    .map(
      (l) => `
    <button type="button" class="top-league-card${activeId === l.id ? ' is-on' : ''}" data-top-league="${l.id}">
      ${l.logo ? `<img src="${l.logo}" alt="${l.name}" loading="lazy" onerror="this.style.display='none'" />` : ""}
      <span>${l.name}</span>
    </button>`
    )
    .join("");
}

function updateAdCarousel() {
  const track = $("ad-carousel-track");
  if (!track || !state.adSlides.length) return;
  track.style.transform = `translateX(-${state.adIndex * 100}%)`;
  document.querySelectorAll(".ad-carousel-dot").forEach((d, i) => {
    d.classList.toggle("is-on", i === state.adIndex);
  });
}

async function initAdvertCarousel() {
  const track = $("ad-carousel-track");
  const dots = $("ad-carousel-dots");
  if (!track) return;
  let slides = [];
  try {
    const res = await fetch(`assets/advert/manifest.json?v=${Date.now()}`);
    const data = await res.json();
    slides = Array.isArray(data.slides) ? data.slides.filter(Boolean) : [];
  } catch {
    slides = [];
  }
  state.adSlides = slides;
  if (!slides.length) {
    track.innerHTML = `<div class="ad-carousel-slide ad-carousel-slide--placeholder"><div><strong>HOPE BET</strong><p>Add images to assets/advert/ and list them in manifest.json</p></div></div>`;
    if ($("ad-prev")) $("ad-prev").hidden = true;
    if ($("ad-next")) $("ad-next").hidden = true;
    if (dots) dots.innerHTML = "";
    return;
  }
  track.innerHTML = slides
    .map(
      (s, i) =>
        `<div class="ad-carousel-slide"><img src="assets/advert/${s}" alt="Promotion ${i + 1}" loading="${i === 0 ? "eager" : "lazy"}" onerror="this.parentElement.innerHTML='<div class=\\'ad-carousel-slide--placeholder\\'><strong>HOPE BET</strong></div>'" /></div>`
    )
    .join("");
  if (dots) {
    dots.innerHTML = slides
      .map((_, i) => `<button type="button" class="ad-carousel-dot${i === 0 ? " is-on" : ""}" data-dot="${i}"></button>`)
      .join("");
  }
  state.adIndex = 0;
  updateAdCarousel();
}

function renderLastWinnings() {
  const body = $("last-winnings-body");
  if (!body) return;
  const wins = state.history.filter((t) => t.status === "won").slice(0, 5);
  if (!wins.length) {
    body.innerHTML = `<p class="last-winnings-empty">No recent wins</p>`;
    return;
  }
  body.innerHTML = wins
    .map(
      (t) => `
    <div class="last-winnings-row">
      <span>${t.id}</span>
      <span>${fmt(t.stake)}</span>
      <span>${t.placedAt ? new Date(t.placedAt).toLocaleDateString() : "—"}</span>
    </div>`
    )
    .join("");
}

function updateSportsMenuUI() {
  const sidebar = $("sidebar");
  const home = $("sports-home-wrap");
  const menu = $("football-menu-wrap");
  const menuHead = $("sports-menu-head");
  const hint = $("sidebar-search-hint");
  const filterBar = document.querySelector(".filter-bar");
  const boardHead = document.querySelector(".board-head");
  const boardWrap = document.querySelector(".board-wrap");

  const showHome = isSportsHomeSubNav();
  const showBoard = !state.sportsMenuMode && isBoardSubNav();
  const showFootballMenu = state.sportsMenuMode && state.sportFilter === "football";

  if (sidebar) sidebar.classList.toggle("is-sports-menu", state.sportsMenuMode);
  if (home) home.hidden = !showHome;
  if (menu) menu.hidden = !showFootballMenu;
  if (menuHead) menuHead.hidden = !state.sportsMenuMode;
  if (hint) hint.hidden = !state.sportsMenuMode;

  if (filterBar) filterBar.hidden = !showBoard;
  if (boardHead) boardHead.hidden = !showBoard;
  if (boardWrap) boardWrap.hidden = !showBoard;

  document.body.classList.toggle("is-sports-home", showHome);
  document.body.classList.toggle("is-events-board", showBoard);
  renderMobileSportsStrip();
  renderMobileTimeStrip();
}

function openSportsMenu(sportId, options = {}) {
  if (!options.fromSubNav) state.subNav = "all-events";
  state.sportsMenuMode = true;
  state.sportFilter = sportId;
  state.leaguePageIds = [];
  updateSubNavHighlight();
  if (sportId === "football") {
    renderFootballRegions();
    updateOpenSelectedButton();
    renderFootballFilters();
  }
  setView("sports");
  updateSportsMenuUI();
  renderSportsSidebar();
}

function closeSportsMenu() {
  state.sportsMenuMode = false;
  state.subNav = "sports";
  state.leagueFilter = "top";
  state.countryFilter = null;
  state.checkedLeagueIds.clear();
  state.leaguePageIds = [];
  updateOpenSelectedButton();
  updateSubNavHighlight();
  updateSportsMenuUI();
  renderSportsSidebar();
  setView("sports");
  refreshHomeAndBoard();
}

function sortFootballRegions(countries) {
  const names = countries.map((c) => c.name);
  const ordered = [];
  for (const p of FOOTBALL_REGION_PRIORITY) {
    if (names.includes(p)) ordered.push(p);
  }
  for (const n of names.sort()) {
    if (!ordered.includes(n)) ordered.push(n);
  }
  if (!ordered.includes("Europe") && FOOTBALL_STATIC_LEAGUES.Europe) ordered.splice(1, 0, "Europe");
  return ordered;
}

async function renderFootballRegions() {
  const el = $("football-regions");
  if (!el) return;

  const sidebar = state.sidebar.topLeagues.length ? state.sidebar : buildMockSidebar();
  let regionNames = sortFootballRegions(sidebar.countries);

  if (!regionNames.length) {
    regionNames = Object.keys(FOOTBALL_STATIC_LEAGUES);
  }

  el.innerHTML = regionNames
    .map((name) => {
      const country = sidebar.countries.find((c) => c.name === name);
      const expanded = state.expandedFootballRegions.has(name);
      return `
      <section class="football-region${expanded ? " is-open" : ""}" data-football-region="${name.replace(/"/g, "&quot;")}">
        <button type="button" class="football-region-head" data-toggle-football-region="${name.replace(/"/g, "&quot;")}">
          <span class="football-region-dots">⋯</span>
          ${country?.flag ? `<img class="flag" src="${country.flag}" alt="" loading="lazy" />` : "<span class='football-region-flag'>🏳</span>"}
          <span class="football-region-name">${name}</span>
          <span class="football-region-chev">${expanded ? "▼" : "▶"}</span>
        </button>
        <div class="football-region-body" data-region-body="${name.replace(/"/g, "&quot;")}">
          ${expanded ? `<div class="football-region-loading">Loading leagues…</div>` : ""}
        </div>
      </section>`;
    })
    .join("");

  for (const name of regionNames) {
    if (state.expandedFootballRegions.has(name)) {
      await renderFootballRegionLeagues(name);
    }
  }
}

async function renderFootballRegionLeagues(regionName) {
  const body = document.querySelector(`[data-region-body="${regionName}"]`);
  if (!body) return;

  let leagues = FOOTBALL_STATIC_LEAGUES[regionName] || [];
  if (!leagues.length) {
    const fetched = await fetchCountryLeagues(regionName);
    leagues = fetched.length ? fetched : leagues;
  }

  if (!leagues.length) {
    body.innerHTML = `<div class="football-region-empty">No leagues available</div>`;
    return;
  }

  body.innerHTML = `<div class="football-leagues-grid">${leagues
    .map(
      (l) => `
    <div class="football-league-row${state.checkedLeagueIds.has(l.id) ? " is-marked" : ""}">
      <label class="football-league-check" title="Mark league">
        <input type="checkbox" data-football-league="${l.id}" ${state.checkedLeagueIds.has(l.id) ? "checked" : ""} />
      </label>
      <button type="button" class="football-league-link" data-open-league="${l.id}">${l.name}</button>
    </div>`
    )
    .join("")}</div>`;
}

async function toggleFootballRegion(regionName) {
  if (state.expandedFootballRegions.has(regionName)) {
    state.expandedFootballRegions.delete(regionName);
  } else {
    state.expandedFootballRegions.add(regionName);
  }
  await renderFootballRegions();
}

function onFootballLeagueToggle(leagueId, checked) {
  if (checked) state.checkedLeagueIds.add(leagueId);
  else state.checkedLeagueIds.delete(leagueId);
  syncFootballLeagueChecks();
  updateOpenSelectedButton();
}

function updateOpenSelectedButton() {
  const btn = $("btn-open-selected-leagues");
  if (!btn) return;
  const n = state.checkedLeagueIds.size;
  btn.hidden = n === 0;
  btn.textContent = n === 1 ? "Open selected league" : `Open selected leagues (${n})`;
}

function getFootballTimeFilterIndex() {
  const opts = getFootballTimeFilterOptions();
  const idx = opts.findIndex((o) => o.id === state.timeFilter);
  return idx >= 0 ? idx : 0;
}

function setFootballTimeFilterByIndex(index) {
  const opts = getFootballTimeFilterOptions();
  const pick = opts[Math.max(0, Math.min(index, opts.length - 1))];
  if (!pick) return;
  state.timeFilter = pick.id;
  renderFootballFilters();
  renderFilters();
  const leaguesView = document.querySelector('[data-view="leagues"]');
  if (leaguesView && !leaguesView.hidden) {
    renderLeaguePage();
  } else if (!state.sportsMenuMode) {
    refreshHomeAndBoard();
  }
}

function renderFootballFilterBlock(sliderId, ticksId, labelsId) {
  const slider = $(sliderId);
  const ticks = $(ticksId);
  const labels = $(labelsId);
  if (!slider || !ticks || !labels) return;

  const opts = getFootballTimeFilterOptions();
  const active = getFootballTimeFilterIndex();

  slider.min = 0;
  slider.max = String(opts.length - 1);
  slider.value = String(active);

  ticks.innerHTML = opts.map(() => `<span class="football-time-tick" aria-hidden="true"></span>`).join("");
  labels.innerHTML = opts
    .map(
      (opt, i) =>
        `<button type="button" class="football-time-label${i === active ? " is-on" : ""}" data-football-time-index="${i}" title="${opt.label}">${opt.label}</button>`
    )
    .join("");
}

function renderFootballFilters() {
  renderFootballFilterBlock("football-time-slider", "football-time-ticks", "football-time-labels");
  renderFootballFilterBlock("league-time-slider", "league-time-ticks", "league-time-labels");

  const open = state.footballFiltersOpen;
  const onLeagues = !$("view-leagues")?.hidden;
  const onFootballMenu = state.sportsMenuMode && state.sportFilter === "football" && !onLeagues;

  const footballPanel = $("football-filters-panel");
  const leaguePanel = $("league-filters-panel");
  if (footballPanel) footballPanel.hidden = !open || !onFootballMenu;
  if (leaguePanel) leaguePanel.hidden = !open || !onLeagues;

  document.querySelectorAll(".football-filters-btn").forEach((btn) => {
    btn.classList.toggle("is-on", open);
    btn.setAttribute("aria-expanded", open ? "true" : "false");
    const chev = btn.querySelector(".football-filters-btn-chev");
    if (chev) chev.textContent = open ? "▴" : "▾";
  });
}

function toggleFootballFilters(force) {
  state.footballFiltersOpen = typeof force === "boolean" ? force : !state.footballFiltersOpen;
  renderFootballFilters();
}

function syncFootballLeagueChecks() {
  document.querySelectorAll("[data-football-league]").forEach((input) => {
    const id = Number(input.dataset.footballLeague);
    input.checked = state.checkedLeagueIds.has(id);
    input.closest(".football-league-row")?.classList.toggle("is-marked", input.checked);
  });
}

function leaguePageTitle() {
  if (!state.leaguePageIds.length) return "Matches";
  return state.leaguePageIds.map((id) => getLeagueNameById(id)).join(" · ");
}

function openLeaguePage(leagueIds) {
  const ids = [...new Set(leagueIds.map(Number).filter(Boolean))];
  if (!ids.length) return;
  state.leaguePageIds = ids;
  state.sportsMenuMode = true;
  setView("leagues");
  renderFootballFilters();
  renderLeaguePage();
}

function closeLeaguePage() {
  state.leaguePageIds = [];
  setView("sports");
  updateSportsMenuUI();
}

function renderLeaguePage() {
  const title = $("league-page-title");
  const board = $("league-page-board");
  if (title) title.textContent = leaguePageTitle();
  if (!board) return;

  const list = footballMenuFixtures();
  if (!list.length) {
    board.innerHTML = `<div class="board-empty">No matches for selected leagues</div>`;
    return;
  }
  renderMatchBoardInto(board, list);
}

function renderMatchBoardInto(board, list) {
  if (!board) return;

  const groups = new Map();
  for (const f of list) {
    const key = f.league?.id || f.league?.name || "other";
    if (!groups.has(key)) groups.set(key, { league: f.league, matches: [] });
    groups.get(key).matches.push(f);
  }

  board.innerHTML = [...groups.values()]
    .map(
      (g) => `
    <section class="league-block">
      <div class="league-block-head">
        ${g.league?.flag ? `<img src="${g.league.flag}" alt="" class="flag" loading="lazy" />` : ""}
        ${g.league?.logo ? `<img src="${g.league.logo}" alt="" loading="lazy" />` : ""}
        <span>${(g.league?.name || "MATCHES").toUpperCase()}</span>
      </div>
      ${g.matches
          .map(
            (f) => `
        <div class="match-row">
          <div class="match-row-info" data-open-fixture="${f.fixtureId}" role="button" tabindex="0">
            <div class="match-row-teams">
              <span class="match-row-team">${f.home.name}</span>
              ${f.isLive && f.goals ? `<span class="live-score-badge">${f.goals.home ?? 0} : ${f.goals.away ?? 0}</span>` : `<span class="match-row-vs" aria-hidden="true">-</span>`}
              <span class="match-row-team">${f.away.name}</span>
            </div>
            <div class="match-row-meta">
              ${f.isLive
                ? `<span class="match-live-tag"><span class="live-pulse-dot"></span>${f.status === "HT" ? "HT" : (f.elapsed ? f.elapsed + "'" : "LIVE")}</span>`
                : `<span class="match-row-time" data-countdown="${f.date}">${formatCountdown(f.date)}</span>`}
              <a class="match-row-more" href="#" data-open-fixture="${f.fixtureId}">+${f.marketCount || 47} Markets (${f.selectionCount || 380}+ Choices) ›</a>
            </div>
          </div>
          ${renderOddsRow(f)}
        </div>`
          )
          .join("")}
    </section>`
    )
    .join("");
}

function renderSidebar() {
  const sidebar = getSidebarData();
  const topCount = $("top-league-count");
  const countryCount = $("country-count");
  const leaguesEl = $("sidebar-leagues");
  const countriesEl = $("sidebar-countries");
  if (topCount) topCount.textContent = String(sidebar.topLeagues.length);
  if (countryCount) countryCount.textContent = String(sidebar.countries.length);
  if (!leaguesEl || !countriesEl) return;

  leaguesEl.innerHTML = sidebar.topLeagues
    .map(
      (l) => `
    <button type="button" class="sidebar-item${state.leagueFilter === l.id && !state.countryFilter ? " is-on" : ""}" data-sidebar-league="${l.id}">
      ${l.logo ? `<img src="${l.logo}" alt="" loading="lazy" />` : ""}
      <span>${l.name}</span>
      <em>${l.count}</em>
      <span class="chev">›</span>
    </button>`
    )
    .join("");

  countriesEl.innerHTML = sidebar.countries
    .map((c) => {
      const expanded = state.expandedSidebarCountries.has(c.name);
      const children = state.countryLeagues[c.name] || [];
      const childHtml = expanded
        ? children
          .map(
            (l) => `
          <button type="button" class="sidebar-item sidebar-item--child${state.leagueFilter === l.id ? " is-on" : ""}" data-sidebar-league="${l.id}">
            ${l.logo ? `<img src="${l.logo}" alt="" loading="lazy" />` : ""}
            <span>${l.name}</span>
            <em>${l.count}</em>
          </button>`
          )
          .join("")
        : "";

      return `
    <button type="button" class="sidebar-item${state.countryFilter === c.name ? " is-on" : ""}${expanded ? " is-expanded" : ""}" data-sidebar-country="${c.name}">
      ${c.flag ? `<img class="flag" src="${c.flag}" alt="" loading="lazy" />` : ""}
      <span>${c.name}</span>
      <em>${c.count}</em>
      <span class="chev">${expanded ? "⌄" : "›"}</span>
    </button>${childHtml}`;
    })
    .join("");
}

function renderFilters() {
  const sidebar = getSidebarData();
  const allOpen = state.leagueDropdown === "all";
  const topOpen = state.leagueDropdown === "top";
  const search = state.leagueDropdownSearch.toLowerCase();
  const countries = sidebar.countries.filter((c) => !search || c.name.toLowerCase().includes(search));

  const selectedChip =
    typeof state.leagueFilter === "number"
      ? (() => {
        const fromTop = sidebar.topLeagues.find((l) => l.id === state.leagueFilter);
        if (fromTop) {
          return `<button type="button" class="chip is-on" data-league="${fromTop.id}">
              ${fromTop.logo ? `<img src="${fromTop.logo}" alt="" loading="lazy" />` : ""}${fromTop.name}
            </button>`;
        }
        for (const leagues of Object.values(state.countryLeagues)) {
          const hit = leagues.find((l) => l.id === state.leagueFilter);
          if (hit) {
            return `<button type="button" class="chip is-on" data-league="${hit.id}">
                ${hit.logo ? `<img src="${hit.logo}" alt="" loading="lazy" />` : ""}${hit.name}
              </button>`;
          }
        }
        return "";
      })()
      : state.countryFilter
        ? `<button type="button" class="chip is-on" data-country-chip="${state.countryFilter}">${state.countryFilter}</button>`
        : "";

  const filterBar = $("league-filter-bar");
  if (!filterBar) return;

  filterBar.innerHTML = `
    <div class="league-dropdown-wrap">
      <button type="button" class="chip chip-dropdown${state.leagueFilter === "all" && !state.countryFilter ? " is-on" : ""}${allOpen ? " is-open" : ""}" data-dropdown-toggle="all">
        All Leagues <span class="chip-caret">▾</span>
      </button>
      <div class="league-dropdown${allOpen ? " is-open" : ""}" id="dropdown-all" ${allOpen ? "" : "hidden"}>
        <input type="search" class="league-dropdown-search" placeholder="Search countries..." value="${state.leagueDropdownSearch.replace(/"/g, "&quot;")}" data-dropdown-search />
        <div class="league-dropdown-list">
          ${countries
      .map(
        (c) => `
            <button type="button" class="league-dropdown-item${state.countryFilter === c.name ? " is-on" : ""}" data-dropdown-country="${c.name}">
              ${c.flag ? `<img class="flag" src="${c.flag}" alt="" loading="lazy" />` : ""}
              <span>${c.name}</span>
              <em>${c.count}</em>
            </button>`
      )
      .join("")}
        </div>
      </div>
    </div>
    <div class="league-dropdown-wrap">
      <button type="button" class="chip chip-dropdown${state.leagueFilter === "top" ? " is-on" : ""}${topOpen ? " is-open" : ""}" data-dropdown-toggle="top">
        Top Leagues <span class="chip-caret">▾</span>
      </button>
      <div class="league-dropdown${topOpen ? " is-open" : ""}" id="dropdown-top" ${topOpen ? "" : "hidden"}>
        <div class="league-dropdown-list">
          ${sidebar.topLeagues
      .map(
        (l) => `
            <button type="button" class="league-dropdown-item${state.leagueFilter === l.id ? " is-on" : ""}" data-dropdown-league="${l.id}">
              ${l.logo ? `<img src="${l.logo}" alt="" loading="lazy" />` : ""}
              <span>${l.name}</span>
              <em>${l.count}</em>
            </button>`
      )
      .join("")}
        </div>
      </div>
    </div>
    ${selectedChip}`;

  $("league-dropdown-backdrop") && ($("league-dropdown-backdrop").hidden = !allOpen && !topOpen);

  const tf = $("time-filters");
  if (tf) {
    tf.innerHTML = TIME_FILTERS_SIDEBAR.map(
      (f) =>
        `<button type="button" class="chip${state.timeFilter === f.id ? " is-on" : ""}" data-time="${f.id}">${f.label}</button>`
    ).join("");
  }

  const boardTitleEl = $("board-title");
  if (boardTitleEl) boardTitleEl.textContent = boardTitle();
}

function isLiveSelectionLocked(fixture, market, selection) {
  if (!isLiveFixture(fixture)) return false;
  const gh = Number(fixture.goals?.home ?? 0);
  const ga = Number(fixture.goals?.away ?? 0);
  const tot = gh + ga;

  if (market === "ou") {
    if (tot >= 3) return true;
  }
  if (market === "ou15") {
    if (tot >= 2) return true;
  }
  if (market === "ou35") {
    if (tot >= 4) return true;
  }
  if (market === "btts") {
    if (gh >= 1 && ga >= 1) return true;
  }
  return false;
}

function getOddTrend(key, currentVal) {
  if (currentVal == null || currentVal === "—" || currentVal === "") return "";
  const num = typeof currentVal === "number" ? currentVal : parseFloat(String(currentVal).replace(/[^\d.]/g, ""));
  if (isNaN(num) || num <= 1) return "";

  if (state.oddHistory && key in state.oddHistory) {
    const prev = state.oddHistory[key];
    if (prev !== undefined && prev !== null && !isNaN(prev)) {
      const diff = Number((num - prev).toFixed(4));
      if (diff > 0.005) {
        state.oddTrends[key] = { dir: "up", time: Date.now() };
      } else if (diff < -0.005) {
        state.oddTrends[key] = { dir: "down", time: Date.now() };
      }
    }
  }
  if (state.oddHistory) state.oddHistory[key] = num;

  const trend = state.oddTrends ? state.oddTrends[key] : null;
  if (trend && Date.now() - trend.time < 3500) {
    return trend.dir;
  }
  return "";
}

function oddButton(fixture, market, selection, label) {
  const isLocked = isLiveSelectionLocked(fixture, market, selection);
  if (isLocked) {
    return `<button type="button" class="odd-btn is-locked" disabled data-locked="true" title="Market locked / already passed">
      <span class="odd-btn-label">${label}</span>
      <span class="odd-btn-value" style="font-size:10px;opacity:0.7;">🔒</span>
    </button>`;
  }
  const odd = getMarketOdds(fixture, market, selection);
  const trend = getOddTrend(`${fixture.fixtureId}_${market}_${selection}`, odd);
  const trendClass = trend ? ` odd-${trend}` : "";
  const sel = isSelected(fixture.fixtureId, market, selection);
  return `<button type="button" class="odd-btn${sel ? " is-selected" : ""}${trendClass}" data-fixture="${fixture.fixtureId}" data-market="${market}" data-selection="${selection}">
    <span class="odd-btn-label">${label}</span>
    <span class="odd-btn-value">${odd}</span>
  </button>`;
}

function renderOddsRow(fixture) {
  const mode = state.boardMarketMode || "main";
  if (mode === "btts") {
    return `<div class="match-row-odds match-row-odds--2">
      ${oddButton(fixture, "btts", "yes", "GG")}
      ${oddButton(fixture, "btts", "no", "NG")}
    </div>`;
  }
  if (mode === "ou") {
    return `<div class="match-row-odds match-row-odds--6">
      ${oddButton(fixture, "ou15", "over", "O 1.5")}
      ${oddButton(fixture, "ou15", "under", "U 1.5")}
      ${oddButton(fixture, "ou", "over", "O 2.5")}
      ${oddButton(fixture, "ou", "under", "U 2.5")}
      ${oddButton(fixture, "ou35", "over", "O 3.5")}
      ${oddButton(fixture, "ou35", "under", "U 3.5")}
    </div>`;
  }
  if (mode === "dnb") {
    return `<div class="match-row-odds match-row-odds--2">
      ${oddButton(fixture, "dnb", "home", "1")}
      ${oddButton(fixture, "dnb", "away", "2")}
    </div>`;
  }
  if (mode === "dc") {
    return `<div class="match-row-odds match-row-odds--3">
      ${oddButton(fixture, "dc", "1x", "1X")}
      ${oddButton(fixture, "dc", "12", "12")}
      ${oddButton(fixture, "dc", "x2", "X2")}
    </div>`;
  }
  return `<div class="match-row-odds">
    ${oddButton(fixture, "1x2", "home", "1")}
    ${oddButton(fixture, "1x2", "draw", "X")}
    ${oddButton(fixture, "1x2", "away", "2")}
    ${oddButton(fixture, "dc", "1x", "1X")}
    ${oddButton(fixture, "dc", "12", "12")}
    ${oddButton(fixture, "dc", "x2", "X2")}
    ${oddButton(fixture, "ou", "over", "O2.5")}
    ${oddButton(fixture, "ou", "under", "U2.5")}
  </div>`;
}

function updateBoardMarketHeaders() {
  const mode = state.boardMarketMode || "main";
  let html = "";
  if (mode === "btts") {
    html = `<span style="grid-column: 1 / -1; text-align: center;">Both Teams to Score (GG / NG)</span>`;
  } else if (mode === "ou") {
    html = `<span>O/U 1.5</span><span>O/U 2.5</span><span>O/U 3.5</span>`;
  } else if (mode === "dnb") {
    html = `<span style="grid-column: 1 / -1; text-align: center;">Draw No Bet (1 / 2)</span>`;
  } else if (mode === "dc") {
    html = `<span style="grid-column: 1 / -1; text-align: center;">Double Chance (1X / 12 / X2)</span>`;
  } else {
    html = `<span>1X2</span><span>Double Chance</span><span>O/U 2.5</span>`;
  }
  const cols1 = $("board-markets-cols");
  const cols2 = $("league-board-markets-cols");
  if (cols1) cols1.innerHTML = html;
  if (cols2) cols2.innerHTML = html;
}

function formatMatchTableDate(dateVal) {
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return "Today";
  const day = String(d.getDate()).padStart(2, "0");
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const mon = months[d.getMonth()];
  const year = d.getFullYear();
  return `${day} ${mon} ${year}`;
}

function formatMatchTableTime(dateVal) {
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return "16:00";
  const h = String(d.getHours()).padStart(2, "0");
  const m = String(d.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

function renderImageStyleMatchTable(fixtures, limit, containerId, sectionType) {
  const container = $(containerId);
  if (!container) return;
  if (!fixtures || !fixtures.length) {
    container.innerHTML = `<div class="board-empty" style="padding:24px;text-align:center;background:var(--panel,#fff);border:1px solid var(--line,#e0e0e0);color:var(--muted,#888);">No matches available</div>`;
    return;
  }

  const isExpanded = limit > 5;
  const visible = fixtures.slice(0, limit);

  // Group visible fixtures by date string
  const dateGroups = new Map();
  for (const f of visible) {
    const dKey = formatMatchTableDate(f.date);
    if (!dateGroups.has(dKey)) dateGroups.set(dKey, []);
    dateGroups.get(dKey).push(f);
  }

  let html = `<div class="hmt-wrap">`;
  html += `
    <div class="hmt-head">
      <span class="hmt-col-id">ID</span>
      <span class="hmt-col-time">Time</span>
      <span class="hmt-col-event">Event</span>
      <div class="hmt-col-odds">
        <span>Home</span>
        <span>Draw</span>
        <span>Away</span>
      </div>
      <span class="hmt-col-more">+</span>
    </div>`;

  for (const [dateStr, matches] of dateGroups.entries()) {
    html += `<div class="hmt-date-banner">${dateStr}</div>`;
    for (const f of matches) {
      const hOdd = getMarketOdds(f, "1x2", "home") || "1.90";
      const dOdd = getMarketOdds(f, "1x2", "draw") || "3.40";
      const aOdd = getMarketOdds(f, "1x2", "away") || "3.80";
      const tHome = getOddTrend(`${f.fixtureId}_1x2_home`, hOdd);
      const tDraw = getOddTrend(`${f.fixtureId}_1x2_draw`, dOdd);
      const tAway = getOddTrend(`${f.fixtureId}_1x2_away`, aOdd);

      const homeSel = isSelected(f.fixtureId, "1x2", "home");
      const drawSel = isSelected(f.fixtureId, "1x2", "draw");
      const awaySel = isSelected(f.fixtureId, "1x2", "away");

      const timeStr = formatMatchTableTime(f.date);

      html += `
        <div class="hmt-row" data-fixture-row="${f.fixtureId}">
          <span class="hmt-col-id hmt-id">${f.fixtureId}</span>
          <span class="hmt-col-time hmt-time">${timeStr}</span>
          <div class="hmt-col-event">
            <span class="hmt-event-name" data-open-fixture="${f.fixtureId}" title="${f.home.name} - ${f.away.name}">${f.home.name} - ${f.away.name}</span>
          </div>
          <div class="hmt-col-odds">
            <button type="button" class="odd-btn hmt-odd-btn${homeSel ? " is-selected" : ""}${tHome ? ` odd-${tHome}` : ""}"
              data-fixture="${f.fixtureId}" data-market="1x2" data-selection="home"
              title="${f.home.name} win">
              ${hOdd}
            </button>
            <button type="button" class="odd-btn hmt-odd-btn${drawSel ? " is-selected" : ""}${tDraw ? ` odd-${tDraw}` : ""}"
              data-fixture="${f.fixtureId}" data-market="1x2" data-selection="draw"
              title="Draw">
              ${dOdd}
            </button>
            <button type="button" class="odd-btn hmt-odd-btn${awaySel ? " is-selected" : ""}${tAway ? ` odd-${tAway}` : ""}"
              data-fixture="${f.fixtureId}" data-market="1x2" data-selection="away"
              title="${f.away.name} win">
              ${aOdd}
            </button>
          </div>
          <div class="hmt-col-more">
            <button type="button" class="hmt-more-btn" data-open-fixture="${f.fixtureId}" title="More markets">+</button>
          </div>
        </div>`;
    }
  }

  if (fixtures.length > 5) {
    const btnLabel = isExpanded ? "Show less ▴" : "Show more ∨";
    html += `
      <button type="button" class="hmt-show-more-btn" data-hmt-toggle="${sectionType}">
        <span>${btnLabel}</span>
      </button>`;
  }

  html += `</div>`;
  container.innerHTML = html;
}

function renderHomeLeagueMatches() {
  const leagueId = Number(state.homeSelectedLeague || 39);
  const all = (state.fixtures || []).filter((f) => Number(f.league?.id) === leagueId);
  const fixtures = all.length ? all : (state.fixtures || []).slice(0, 10);
  renderImageStyleMatchTable(fixtures, state.homeLeagueLimit || 5, "home-league-matches-section", "league");
}

function renderHomeUpcomingGames() {
  const all = (state.fixtures || []).filter((f) => !isLiveFixture(f));
  const fixtures = all.length ? all : (state.fixtures || []);
  renderImageStyleMatchTable(fixtures, state.homeUpcomingLimit || 5, "home-upcoming-table", "upcoming");
}

function renderHomePopularGames() {
  const popular = fixturesForCarousel();
  const fixtures = popular.length ? popular : (state.fixtures || []).slice(0, 10);
  renderImageStyleMatchTable(fixtures, state.homePopularLimit || 5, "home-popular-table", "popular");
}

function formatPopCardTime(dateVal) {
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return "Today 21:00";
  const day = d.getDate();
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const mon = months[d.getMonth()];
  const h = String(d.getHours()).padStart(2, "0");
  const m = String(d.getMinutes()).padStart(2, "0");
  return `${day} ${mon} ${h}:${m}`;
}

function renderTopMatchesCarousel() {
  const el = $("popular-carousel");
  if (!el || !isSportsHomeSubNav()) return;

  const popular = fixturesForCarousel();
  if (!popular.length) {
    el.innerHTML = `<div class="board-empty" style="padding:24px;text-align:center;">No top matches</div>`;
    return;
  }

  el.innerHTML = popular
    .map((f) => {
      const hOdd = getMarketOdds(f, "1x2", "home") || "2.10";
      const dOdd = getMarketOdds(f, "1x2", "draw") || "3.30";
      const aOdd = getMarketOdds(f, "1x2", "away") || "3.50";
      const tHome = getOddTrend(`${f.fixtureId}_1x2_home`, hOdd);
      const tDraw = getOddTrend(`${f.fixtureId}_1x2_draw`, dOdd);
      const tAway = getOddTrend(`${f.fixtureId}_1x2_away`, aOdd);
      const homeSel = isSelected(f.fixtureId, "1x2", "home");
      const drawSel = isSelected(f.fixtureId, "1x2", "draw");
      const awaySel = isSelected(f.fixtureId, "1x2", "away");
      const timeLabel = formatPopCardTime(f.date);
      const leagueLabel = `${f.league?.country || "Football"} - ${f.league?.name || "League"}`;

      return `
    <article class="pop-card" data-fixture-id="${f.fixtureId}">
      <div class="pop-card-header">
        <span class="pop-card-league" title="${leagueLabel}">${leagueLabel}</span>
        <span class="pop-card-time">${timeLabel}</span>
      </div>
      <div class="pop-card-teams-row" data-open-fixture="${f.fixtureId}" role="button" tabindex="0">
        <div class="pop-card-team">
          <img src="${f.home.logo}" alt="${f.home.name}" loading="lazy" onerror="this.style.opacity='0'" />
          <span class="pop-card-name">${f.home.name}</span>
        </div>
        <div class="pop-card-vs-wrap">
          <span class="pop-card-bolt">⚡</span>
          <span class="pop-card-vs">VS</span>
        </div>
        <div class="pop-card-team">
          <img src="${f.away.logo}" alt="${f.away.name}" loading="lazy" onerror="this.style.opacity='0'" />
          <span class="pop-card-name">${f.away.name}</span>
        </div>
      </div>
      <div class="pop-card-divider">
        <span class="pop-divider-line"></span>
        <span class="pop-divider-label">Match Result</span>
        <span class="pop-divider-line"></span>
      </div>
      <div class="pop-odds">
        <button type="button" class="odd-btn pop-odd-btn${homeSel ? ' is-selected' : ''}${tHome ? ` odd-${tHome}` : ''}" data-fixture="${f.fixtureId}" data-market="1x2" data-selection="home" title="${f.home.name} win">
          <span class="odd-btn-label">Ho...</span>
          <span class="odd-btn-value pop-odd-val">${hOdd}</span>
        </button>
        <button type="button" class="odd-btn pop-odd-btn${drawSel ? ' is-selected' : ''}${tDraw ? ` odd-${tDraw}` : ''}" data-fixture="${f.fixtureId}" data-market="1x2" data-selection="draw" title="Draw">
          <span class="odd-btn-label">Draw</span>
          <span class="odd-btn-value pop-odd-val">${dOdd}</span>
        </button>
        <button type="button" class="odd-btn pop-odd-btn${awaySel ? ' is-selected' : ''}${tAway ? ` odd-${tAway}` : ''}" data-fixture="${f.fixtureId}" data-market="1x2" data-selection="away" title="${f.away.name} win">
          <span class="odd-btn-label">Away</span>
          <span class="odd-btn-value pop-odd-val">${aOdd}</span>
        </button>
      </div>
    </article>`;
    })
    .join("");
}

function renderHomeSportsView() {
  renderTopMatchesCarousel();
  renderTopLeaguesGrid();
  renderHomeLeagueMatches();
  renderHomeUpcomingGames();
  renderHomePopularGames();
}

function renderCarousel() {
  renderTopMatchesCarousel();
}

function renderBoard() {
  const board = $("match-board");
  if (!board) return;
  if (state.sportsMenuMode || !isBoardSubNav()) {
    board.innerHTML = "";
    return;
  }
  const list = filteredFixtures();

  if (!list.length) {
    board.innerHTML = `<div class="board-empty">No matches for this filter</div>`;
    return;
  }

  renderMatchBoardInto(board, list);
}

function renderSlip() {
  const count = state.slip.length;
  const activeCount = activeSlipBets().length;
  const hasExpired = count > activeCount;
  const hasFinished = state.slip.some((b) => getSlipBetStatus(b).isFinished);
  const hasSuspended = state.slip.some((b) => getSlipBetStatus(b).isSuspended);
  const hasOddsChanged = state.slip.some((b) => getSlipBetStatus(b).trend !== "");
  const tabCount = $("slip-tab-count");
  const panelSuccess = $("panel-bet-success");
  const notice = $("slip-empty-notice");
  const panelSlip = $("panel-slip");

  if (state.betPlacedSuccessTicket && count === 0) {
    if (tabCount) tabCount.textContent = String(state.betPlacedSuccessTicket.bets?.length || 1);
    if (panelSuccess) panelSuccess.hidden = false;
    if (notice) notice.hidden = true;
    if (panelSlip) panelSlip.hidden = true;
    syncMobileSlipCount();
    return;
  }

  if (panelSuccess) panelSuccess.hidden = true;
  if (tabCount) tabCount.textContent = String(count);
  syncMobileSlipCount();

  if (notice) notice.hidden = count > 0;
  if (panelSlip) panelSlip.hidden = count === 0;

  const list = $("slip-list");
  const foot = $("slip-foot");
  if (!list || !foot) return;

  document.querySelectorAll(".betslip-mode-btn").forEach((btn) => {
    const isMultiple = btn.dataset.mode === "multiple";
    btn.classList.toggle("is-on", btn.dataset.mode === state.slipMode);
    if (count && isMultiple && state.slipMode === "multiple") {
      btn.textContent = count > 1 ? `${count} Fold` : "Multiple";
    } else if (!isMultiple) {
      btn.textContent = count ? `Single ${activeCount}/${count}` : "Single";
    } else {
      btn.textContent = "Multiple";
    }
  });

  if (!count) {
    list.innerHTML = "";
    foot.hidden = true;
    return;
  }

  foot.hidden = false;

  list.innerHTML = state.slip
    .map((b) => {
      const status = getSlipBetStatus(b);
      const matchLine = b.homeName && b.awayName ? `${b.homeName} - ${b.awayName}` : b.fixtureName;
      const leagueMeta = [b.sport, b.country, b.leagueName].filter(Boolean).join(" - ");

      let warningHtml = "";
      let itemClass = "slip-item";
      let oddBadgeHtml = "";

      if (status.isFinished) {
        itemClass += " is-finished";
        warningHtml = `<div class="slip-warning-msg">Match Finished! Click 'x' to remove the event from the ticket!</div>`;
        oddBadgeHtml = `<span class="slip-odd-badge is-finished">${status.currentOdd.toFixed(2)} -</span>`;
      } else if (status.isSuspended) {
        itemClass += " is-suspended";
        warningHtml = `<div class="slip-warning-msg">Market Suspended! Click 'x' to remove the event from the ticket!</div>`;
        oddBadgeHtml = `<span class="slip-odd-badge is-suspended">${status.currentOdd.toFixed(2)} -</span>`;
      } else if (status.trend === "up") {
        itemClass += " is-odd-up";
        warningHtml = `<div class="slip-odds-change-msg is-up">Odds Increased: <del>${b.odd.toFixed(2)}</del> ➔ <strong>${status.currentOdd.toFixed(2)}</strong> ▲</div>`;
        oddBadgeHtml = `<span class="slip-odd-badge is-up">${status.currentOdd.toFixed(2)} <span class="slip-arrow-up">▲</span></span>`;
      } else if (status.trend === "down") {
        itemClass += " is-odd-down";
        warningHtml = `<div class="slip-odds-change-msg is-down">Odds Dropped: <del>${b.odd.toFixed(2)}</del> ➔ <strong>${status.currentOdd.toFixed(2)}</strong> ▼</div>`;
        oddBadgeHtml = `<span class="slip-odd-badge is-down">${status.currentOdd.toFixed(2)} <span class="slip-arrow-down">▼</span></span>`;
      } else {
        oddBadgeHtml = `<span class="slip-odd-badge">${b.odd.toFixed(2)}</span>`;
      }

      return `
    <div class="${itemClass}">
      <div class="slip-item-header">
        <span class="slip-match-name">${matchLine}</span>
        <button type="button" class="slip-remove" data-remove="${b.key}" aria-label="Remove">&#x2715;</button>
      </div>
      ${warningHtml}
      <div style="display:flex;align-items:flex-end;justify-content:space-between;gap:6px;">
        <div class="slip-item-main">
          ${leagueMeta ? `<div class="slip-meta">${leagueMeta}</div>` : ""}
          <div class="slip-pick">${b.marketName} : ${b.selectionName}</div>
        </div>
        <div class="slip-item-side">
          ${oddBadgeHtml}
        </div>
      </div>
    </div>`;
    })
    .join("");

  // Odds change accept banner
  let oddsAlertEl = $("slip-odds-alert-wrap");
  if (!oddsAlertEl) {
    oddsAlertEl = document.createElement("div");
    oddsAlertEl.id = "slip-odds-alert-wrap";
    foot.insertBefore(oddsAlertEl, foot.firstChild);
  }
  if (hasOddsChanged && !hasFinished && !hasSuspended) {
    oddsAlertEl.innerHTML = `<button type="button" class="slip-accept-odds-btn" id="slip-accept-odds">Accept Odds Changes</button>`;
  } else {
    oddsAlertEl.innerHTML = "";
  }

  const totalOddsEl = $("total-odds");
  if (totalOddsEl) totalOddsEl.textContent = totalOdds().toFixed(2);
  $("potential-win").textContent = fmt(potentialWin());
  $("stake-input").value = state.stake;

  const btnPlace = $("btn-place");
  if (btnPlace) {
    if (hasFinished) {
      btnPlace.disabled = true;
      btnPlace.textContent = "Match Finished — Remove to Proceed";
    } else if (hasSuspended) {
      btnPlace.disabled = true;
      btnPlace.textContent = "Market Suspended — Remove to Proceed";
    } else {
      btnPlace.textContent = "PLACE BET";
      btnPlace.disabled = state.stake < MIN_STAKE || activeCount === 0 || hasExpired;
    }
  }
}

function renderQuickStakes() {
  const el = $("quick-stakes");
  if (!el) return;
  el.innerHTML = QUICK_STAKES.map(
    (s) =>
      `<button type="button" class="${state.stake === s ? "is-on" : ""}" data-stake="${s}">${s}</button>`
  ).join("");
}

function renderHistory() {
  const el = $("bet-history");
  if (!state.history.length) {
    el.innerHTML = `<div class="history-empty">No bets yet</div>`;
    return;
  }

  el.innerHTML = state.history
    .map((t) => {
      const picks = t.bets.map((b) => `${b.selectionName} @ ${b.odd.toFixed(2)}`).join(" · ");
      return `
      <div class="history-item">
        <div class="top">
          <span class="id">${t.id}</span>
          <span class="status ${t.status}">${t.status.toUpperCase()}</span>
        </div>
        <div class="sel">${picks}</div>
        <div class="meta">
          <span>Stake: ${fmt(t.stake)} ${CURRENCY}</span>
          <span>${t.status === "won" ? "Won: " + fmt(t.payout) : t.status === "lost" ? "Lost" : "Pending"}</span>
        </div>
      </div>`;
    })
    .join("");
}

function setBetslipTab(tab) {
  state.betslipTab = tab;
  document.querySelectorAll(".betslip-tab").forEach((b) => {
    b.classList.toggle("is-on", b.dataset.btab === tab);
  });
  if ($("panel-slip")) $("panel-slip").hidden = tab !== "slip";
  if ($("panel-bets")) $("panel-bets").hidden = tab !== "bets";
  const tools = $("betslip-tools");
  if (tools) tools.hidden = tab !== "slip";
  if (tab === "bets") renderHistory();
}

function setView(view) {
  document.querySelectorAll(".content-view").forEach((v) => {
    const on = v.dataset.view === view;
    v.hidden = !on;
    v.classList.toggle("is-active", on);
  });
  updateBackButton();
  renderFootballFilters();
}

function updateBackButton() {
  const btn = $("btn-back");
  if (!btn) return;
  if (state.detailFixtureId) {
    btn.href = "#";
    btn.setAttribute("aria-label", "Back to matches");
  } else {
    btn.href = "../index.html";
    btn.setAttribute("aria-label", "Back to lobby");
  }
}

async function openMatchDetail(fixtureId) {
  const fixture = findFixture(fixtureId);
  if (!fixture) return;

  state.detailFixtureId = fixtureId;
  state.marketTab = "all";
  state.marketSearch = "";
  state.expandedMarkets = new Set();
  setView("match");

  $("market-search").value = "";
  const crumb = $("match-breadcrumb");
  if (crumb) crumb.textContent = matchBreadcrumb(fixture);

  const isLive = isLiveFixture(fixture);
  if (isLive) {
    fixture.odds = generateLiveOdds(fixture.goals, fixture.elapsed);
  }

  const dateOrLiveHtml = isLive
    ? `<span class="match-live-tag"><span class="live-pulse-dot"></span>${fixture.status === "HT" ? "HT" : (fixture.elapsed ? fixture.elapsed + "'" : "LIVE")}</span> · Score: ${fixture.goals?.home ?? 0} - ${fixture.goals?.away ?? 0}`
    : formatMatchDate(fixture.date);

  $("match-hero").innerHTML = `
    <div class="md-date">${dateOrLiveHtml}</div>
    <div class="md-teams">
      <div class="md-team">
        <img src="${fixture.home.logo}" alt="" loading="lazy" />
        <span>${fixture.home.name}</span>
      </div>
      <div class="md-vs">${isLive && fixture.goals ? `${fixture.goals.home ?? 0} : ${fixture.goals.away ?? 0}` : "VS"}</div>
      <div class="md-team">
        <img src="${fixture.away.logo}" alt="" loading="lazy" />
        <span>${fixture.away.name}</span>
      </div>
    </div>`;

  renderMarketTabs();
  $("match-markets").innerHTML = "";
  $("match-loading").hidden = false;

  const markets = await fetchFixtureMarkets(fixtureId);
  $("match-loading").hidden = true;
  state.fixtureMarkets[fixtureId] = markets;
  state.expandedMarkets = new Set(markets.map((m) => m.id));
  renderMatchDetail();
}

function closeMatchDetail() {
  state.detailFixtureId = null;
  if (state.subNav === "my-bets") {
    setView("my-bets");
    return;
  }
  if (state.leaguePageIds.length) setView("leagues");
  else setView("sports");
}

function refreshMyBetsIfVisible() {
  if (state.subNav === "my-bets") renderMyBetsPage();
  if (state.betslipTab === "bets") renderHistory();
}

function renderMatchDetail() {
  if (!state.detailFixtureId) return;

  const fixture = findFixture(state.detailFixtureId);
  if (!fixture) return;

  // If live, ensure fresh live markets are evaluated
  if (isLiveFixture(fixture)) {
    state.fixtureMarkets[state.detailFixtureId] = buildLiveMarketsForFixture(fixture);
  }

  const markets = state.fixtureMarkets[state.detailFixtureId] || [];

  renderMarketTabs();

  const filtered = markets.filter((m) => {
    if (state.marketTab !== "all" && getMarketCategory(m) !== state.marketTab) return false;
    if (state.marketSearch) {
      const q = state.marketSearch.toLowerCase();
      if (!m.name.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  if (!filtered.length) {
    $("match-markets").innerHTML = `<div class="md-empty">No markets in this category</div>`;
    return;
  }

  $("match-markets").innerHTML = filtered
    .map((m) => {
      const open = state.expandedMarkets.has(m.id);
      const cols = marketGridCols(m.values.length);
      const gridClass = cols === 1 ? "md-odds-grid--1" : cols === 2 ? "md-odds-grid--2" : cols === 3 ? "md-odds-grid--3" : "md-odds-grid--4";

      const odds = m.values
        .map((v) => {
          const marketKey = `m${m.id}`;
          const isLocked = Boolean(v.locked || m.isLocked);
          const sel = !isLocked && isSelected(fixture.fixtureId, marketKey, v.value);
          const label = formatMarketLabel(v.value, fixture);
          const trend = !isLocked ? getOddTrend(`${fixture.fixtureId}_m${m.id}_${v.value}`, v.odd) : "";
          const trendClass = trend ? ` odd-${trend}` : "";
          const valHtml = isLocked
            ? `<span class="md-odd-locked-tag"><svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg> <em>Locked</em></span>`
            : `<span class="md-odd-value">${v.odd}</span>`;

          return `<button type="button" class="md-odd${sel ? " is-selected" : ""}${isLocked ? " is-locked" : ""}${trendClass}" ${isLocked ? "disabled aria-disabled=\"true\" data-locked=\"true\"" : `data-detail-odd data-fixture="${fixture.fixtureId}" data-market-id="${m.id}" data-market-name="${m.name.replace(/"/g, "&quot;")}" data-value="${v.value.replace(/"/g, "&quot;")}" data-odd="${v.odd}"`}>
            <span class="md-odd-label">${label}</span>
            ${valHtml}
          </button>`;
        })
        .join("");

      return `<section class="md-market${open ? " is-open" : ""}" data-market-id="${m.id}">
        <button type="button" class="md-market-head" data-toggle-market="${m.id}">
          <span class="md-market-chevron" aria-hidden="true">▲</span>
          <span class="md-market-star" aria-hidden="true">☆</span>
          <span class="md-market-title">${m.name}${m.isLocked ? ` <span class="market-locked-pill">🔒 Ended</span>` : ""}</span>
        </button>
        <div class="md-market-body">
          <div class="md-odds-grid ${gridClass}">${odds}</div>
        </div>
      </section>`;
    })
    .join("");
}

function isLoggedIn() {
  if (useApi()) return !!state.sessionUser;
  return !!state.sessionUser;
}

function renderSession() {
  const guest = $("utility-guest");
  const authed = $("utility-authed");
  const joinBtn = $("btn-join");
  const userPill = $("user-pill");
  const depositBtn = $("btn-deposit");
  const loggedIn = isLoggedIn();

  if (guest) guest.hidden = loggedIn;
  if (authed) authed.hidden = !loggedIn;

  if (joinBtn) {
    joinBtn.hidden = !loggedIn;
    joinBtn.title = loggedIn ? "Sign Out" : "Sign In";
  }
  const avatar = $("nav-user-avatar");
  if (avatar) {
    if (loggedIn && state.sessionUser) {
      const name = state.sessionUser.displayName || state.sessionUser.username || "";
      avatar.textContent = name ? name.charAt(0).toUpperCase() : "9";
    } else {
      avatar.textContent = "9";
    }
  }
  if (userPill) {
    if (loggedIn && state.sessionUser) {
      userPill.hidden = false;
      userPill.textContent = state.sessionUser.displayName || state.sessionUser.email || "Account";
    } else {
      userPill.hidden = true;
    }
  }
  if (depositBtn) depositBtn.hidden = !loggedIn;
  renderAccountDrawer();

  if (loggedIn && state.sessionUser?.role === "super_admin") {
    setView("super-admin");
    if (typeof loadSuperAdminUsers === "function") loadSuperAdminUsers();
  } else if (state.currentView === "super-admin") {
    setView("sports");
  }
}

// ============================================================
// ACCOUNT MODAL — handles all account sections
// ============================================================

function renderDepositMethodCards(methods, minDeposit) {
  const list = $("deposit-methods-list");
  if (!list) return;

  if (!methods || !methods.length) {
    list.innerHTML = `<div class="deposit-loading">No payment methods available.</div>`;
    return;
  }

  list.innerHTML = methods.map((m) => {
    const logoHtml = m.logo
      ? `<img src="${m.logo}" alt="${m.name}" class="deposit-method-logo" />`
      : `<span class="deposit-method-name-fallback">${m.name}</span>`;
    return `
    <div class="deposit-method-card">
      <div class="deposit-method-logo-wrap">${logoHtml}</div>
      <div class="deposit-method-info">
        <div class="deposit-method-info-row">
          <span class="deposit-method-info-label">Service Fee</span>
          <span class="deposit-method-info-value">${m.fee || "Free"}</span>
        </div>
        <div class="deposit-method-info-row">
          <span class="deposit-method-info-label">Process Time</span>
          <span class="deposit-method-info-value">${m.processTime || "Instant"}</span>
        </div>
        ${m.account ? `<div class="deposit-method-info-row"><span class="deposit-method-info-label">Account</span><span class="deposit-method-info-value">${m.account}</span></div>` : ""}
      </div>
      <button type="button" class="deposit-method-btn"
        data-method-id="${m.id}"
        data-method-name="${m.name}"
        data-min="${minDeposit || 100}">Deposit</button>
    </div>`;
  }).join("");

  list.querySelectorAll(".deposit-method-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      openDepositFormPanel(btn.dataset.methodId, btn.dataset.methodName, Number(btn.dataset.min) || 100, methods);
    });
  });
}

function renderDepositMethods(methods, minDeposit) {
  renderDepositMethodCards(methods, minDeposit);
}

function openDepositFormPanel(id, name, min, methods) {
  const methodEl = $("deposit-method");
  if (methodEl) methodEl.value = id;
  const nameEl = $("deposit-form-method-name");
  if (nameEl) nameEl.textContent = name;
  const amtEl = $("deposit-amount");
  if (amtEl) { amtEl.min = min; amtEl.placeholder = `Min ${min} ETB`; }
  const method = (methods || []).find((m) => m.id === id);
  const instrEl = $("deposit-instructions");
  if (instrEl) instrEl.textContent = method?.instructions || "Send payment, then submit your transaction reference.";
  const list = $("deposit-methods-list");
  if (list) list.hidden = true;
  const panel = $("deposit-form-panel");
  if (panel) panel.hidden = false;
}

function closeDepositFormPanel() {
  const panel = $("deposit-form-panel");
  if (panel) panel.hidden = true;
  const list = $("deposit-methods-list");
  if (list) list.hidden = false;
}

function updateDepositInstructions(methods) {
  const id = $("deposit-method")?.value;
  const method = (methods || []).find((m) => m.id === id);
  const el = $("deposit-instructions");
  if (el) el.textContent = method?.instructions || "Send payment, then submit your transaction reference.";
}

function renderDepositHistory(rows) {
  const el = $("deposit-history");
  if (!el) return;
  if (!rows?.length) { el.innerHTML = ""; return; }
  el.innerHTML = `<h4 style="font-size:12px;color:#666;margin:12px 0 6px;">Recent Deposits</h4>` + rows.slice(0, 5).map(
    (d) => `<div class="deposit-row is-${d.status}">
      <strong>${d.amount} ETB — ${d.status.toUpperCase()}</strong>
      <span>${d.method} · Ref: ${d.reference}</span>
      <span style="color:#aaa;font-size:10px;">${new Date(d.created_at).toLocaleString()}</span>
    </div>`
  ).join("");
}

function switchPaymentsTab(tabId) {
  ["deposit", "withdraw", "withdrawal-request"].forEach((id) => {
    const body = $(`payments-body-${id}`);
    if (body) body.hidden = id !== tabId;
  });
  document.querySelectorAll(".payments-tab").forEach((btn) => {
    btn.classList.toggle("is-active", btn.dataset.paymentsTab === tabId);
  });
  // Close form panel when switching
  closeDepositFormPanel();
}

function renderProfileSection() {
  const user = state.sessionUser;
  if (!user) return;

  const phone = user.phone || "";
  const username = user.username || user.phone || "Player";
  const screenName = user.displayName || username;
  const email = user.email || "";

  const screenNameEl = $("profile-screen-name");
  const firstNameEl = $("profile-first-name");
  const lastNameEl = $("profile-last-name");
  const emailEl = $("profile-email");
  const usernameEl = $("profile-username");
  const phoneEl = $("profile-phone");
  const genderEl = $("profile-gender");
  const dobEl = $("profile-dob");
  const cityEl = $("profile-city");
  const addressEl = $("profile-address");
  const zipEl = $("profile-zip");
  const countryEl = $("profile-country");

  if (screenNameEl) screenNameEl.value = screenName;
  if (usernameEl) usernameEl.value = username;
  if (phoneEl) phoneEl.value = phone || username;
  if (emailEl) emailEl.value = email;
  if (firstNameEl) firstNameEl.value = user.firstName || "";
  if (lastNameEl) lastNameEl.value = user.lastName || "";
  if (genderEl) genderEl.value = user.gender || "Gender not set";
  if (dobEl) dobEl.value = user.dob || "Date of Birth not set";
  if (cityEl) cityEl.value = user.city || "";
  if (addressEl) addressEl.value = user.address || "";
  if (zipEl) zipEl.value = user.zip || "";
  if (countryEl && user.country) countryEl.value = user.country;

  switchProfileTab(state.profileTab || "details");
}

function switchProfileTab(tab) {
  state.profileTab = tab;
  const detailsPanel = $("profile-subpanel-details");
  const passPanel = $("profile-subpanel-password");
  if (detailsPanel) detailsPanel.hidden = tab !== "details";
  if (passPanel) passPanel.hidden = tab !== "password";
}

function renderBetHistorySection() {
  const el = $("acct-bet-history-body");
  if (!el) return;

  const currentTab = state.betHistoryFilterTab || "all";
  const period = $("bet-history-period")?.value || "1week";
  const betType = $("bet-history-type")?.value || "all";

  let bets = (state.history || []).slice();

  // Filter by sub-tab status
  if (currentTab !== "all") {
    bets = bets.filter((b) => {
      const s = (b.status || "pending").toLowerCase();
      if (currentTab === "pending") return s === "pending";
      if (currentTab === "won") return s === "won";
      if (currentTab === "lost") return s === "lost";
      if (currentTab === "void") return s === "void" || s === "refunded";
      if (currentTab === "rejected") return s === "rejected";
      if (currentTab === "cancelled") return s === "cancelled" || s === "canceled";
      return true;
    });
  }

  // Filter by bet type
  if (betType !== "all") {
    bets = bets.filter((b) => {
      const type = (b.type || (b.bets?.length > 1 ? "multiple" : "single")).toLowerCase();
      return type === betType;
    });
  }

  // Filter by period
  if (period !== "all") {
    const now = Date.now();
    const periodsMs = {
      today: 24 * 60 * 60 * 1000,
      yesterday: 48 * 60 * 60 * 1000,
      "3days": 3 * 24 * 60 * 60 * 1000,
      "1week": 7 * 24 * 60 * 60 * 1000,
      "1month": 30 * 24 * 60 * 60 * 1000,
    };
    const maxAge = periodsMs[period] || (7 * 24 * 60 * 60 * 1000);
    bets = bets.filter((b) => {
      if (!b.created_at) return true;
      const t = new Date(b.created_at).getTime();
      return (now - t) <= maxAge;
    });
  }

  const tableHeaderHtml = `
    <div class="bestbet-table-header">
      <div class="col-date-id">Date and ID</div>
      <div class="col-user">Username</div>
      <div class="col-type">Bet Type</div>
      <div class="col-stake">Stake</div>
      <div class="col-events">No events</div>
      <div class="col-odds">Odds</div>
      <div class="col-status">Status</div>
      <div class="col-winning">Winning</div>
    </div>`;

  if (!bets.length) {
    el.innerHTML = `
      <div class="bestbet-table-wrap">
        ${tableHeaderHtml}
        <div class="bestbet-table-empty">No tickets found!</div>
      </div>`;
    return;
  }

  const rowsHtml = bets.map((t) => {
    const numEvents = t.bets?.length || 1;
    const typeLabel = t.type || (numEvents > 1 ? "Multiple" : "Single");
    const username = state.sessionUser?.displayName || state.sessionUser?.username || "Player";
    const dateStr = t.created_at ? new Date(t.created_at).toLocaleString([], { dateStyle: "short", timeStyle: "short" }) : "—";
    const status = (t.status || "pending").toLowerCase();
    const odds = t.totalOdds ? Number(t.totalOdds).toFixed(2) : (t.bets ? t.bets.reduce((acc, b) => acc * (b.odd || 1), 1).toFixed(2) : "—");
    const winning = status === "won" ? `${fmt(t.potentialWinning || t.stake * odds)} ETB` : (status === "pending" ? `${fmt(t.potentialWinning || 0)} ETB` : "0.00 ETB");

    return `
      <div class="bestbet-table-row" data-ticket-id="${t.id || ""}" style="cursor:pointer;" title="Click to view & print ticket">
        <div class="col-date-id">${dateStr} #${t.id || "—"}</div>
        <div class="col-user">${username}</div>
        <div class="col-type">${typeLabel}</div>
        <div class="col-stake">${t.stake || t.amount || "—"} ETB</div>
        <div class="col-events">${numEvents}</div>
        <div class="col-odds">${odds}</div>
        <div class="col-status"><span class="acct-bet-status ${status}">${status.toUpperCase()}</span></div>
        <div class="col-winning">${winning}</div>
      </div>`;
  }).join("");

  el.innerHTML = `
    <div class="bestbet-table-wrap">
      ${tableHeaderHtml}
      <div class="bestbet-table-body">${rowsHtml}</div>
    </div>`;

  el.querySelectorAll(".bestbet-table-row").forEach((row) => {
    row.addEventListener("click", () => {
      const id = row.dataset.ticketId;
      const ticket = (state.history || []).find((item) => String(item.id) === String(id));
      if (ticket) openTicketPrintModal(ticket);
    });
  });
}

function renderHistorySection() {
  const el = $("acct-history-body");
  if (!el) return;
  // Show deposit history
  if (state.depositHistory && state.depositHistory.length) {
    el.innerHTML = `<table class="acct-table">
      <thead><tr><th>Amount</th><th>Method</th><th>Reference</th><th>Status</th><th>Date</th></tr></thead>
      <tbody>${state.depositHistory.map((d) => `<tr>
        <td>${d.amount} ETB</td>
        <td>${d.method}</td>
        <td>${d.reference}</td>
        <td><span class="acct-bet-status ${(d.status||'pending').toLowerCase()}">${(d.status||'PENDING').toUpperCase()}</span></td>
        <td>${new Date(d.created_at).toLocaleDateString()}</td>
      </tr>`).join("")}
      </tbody></table>`;
  } else {
    el.innerHTML = `<div class="acct-placeholder"><p>No transaction history found.</p></div>`;
  }
}

function setAcctHeader(sectionId) {
  const inner = $("acct-header-inner");
  if (!inner) return;
  if (sectionId === "payments") {
    inner.innerHTML = `
      <button type="button" class="acct-header-tab is-active" data-payments-tab="deposit">Deposit</button>
      <button type="button" class="acct-header-tab" data-payments-tab="withdraw">Withdraw</button>
      <button type="button" class="acct-header-tab" data-payments-tab="withdrawal-request">Withdrawal Request</button>`;
    // Re-wire header tab clicks
    inner.querySelectorAll(".acct-header-tab").forEach((btn) => {
      btn.addEventListener("click", () => {
        inner.querySelectorAll(".acct-header-tab").forEach((b) => b.classList.toggle("is-active", b === btn));
        switchPaymentsTab(btn.dataset.paymentsTab);
      });
    });
  } else if (sectionId === "bet-history") {
    const tabs = [
      { id: "all", label: "All Bets" },
      { id: "pending", label: "Pending" },
      { id: "lost", label: "Lost" },
      { id: "won", label: "Won" },
      { id: "void", label: "Void" },
      { id: "rejected", label: "Rejected by system" },
      { id: "cancelled", label: "Cancelled" },
    ];
    const currentTab = state.betHistoryFilterTab || "all";
    inner.innerHTML = `
      <div class="acct-header-subtabs">
        ${tabs.map((t) => `
          <button type="button" class="acct-subtab-btn${t.id === currentTab ? " is-active" : ""}" data-bet-tab="${t.id}">
            ${t.label}
          </button>
        `).join("")}
      </div>`;
    inner.querySelectorAll(".acct-subtab-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        inner.querySelectorAll(".acct-subtab-btn").forEach((b) => b.classList.toggle("is-active", b === btn));
        state.betHistoryFilterTab = btn.dataset.betTab;
        renderBetHistorySection();
      });
    });
  } else if (sectionId === "profile") {
    const currentTab = state.profileTab || "details";
    inner.innerHTML = `
      <div class="acct-header-subtabs">
        <button type="button" class="acct-subtab-btn acct-subtab-btn--icon${currentTab === "details" ? " is-active" : ""}" data-profile-tab="details">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.7 0 5-2.3 5-5s-2.3-5-5-5-5 2.3-5 5 2.3 5 5 5zm0 2c-3.3 0-10 1.7-10 5v2h20v-2c0-3.3-6.7-5-10-5z"/></svg>
          <span>My Details</span>
        </button>
        <button type="button" class="acct-subtab-btn acct-subtab-btn--icon${currentTab === "password" ? " is-active" : ""}" data-profile-tab="password">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg>
          <span>Change Password</span>
        </button>
      </div>`;
    inner.querySelectorAll(".acct-subtab-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        inner.querySelectorAll(".acct-subtab-btn").forEach((b) => b.classList.toggle("is-active", b === btn));
        switchProfileTab(btn.dataset.profileTab);
      });
    });
  } else {
    const labels = {
      bonuses: "Bonuses",
      jackpots: "My Jackpots",
      history: "History",
      messages: "Messages",
    };
    inner.innerHTML = `<span class="acct-header-title">${labels[sectionId] || "Account"}</span>`;
  }
}

function switchAcctSection(sectionId) {
  // Update nav active state
  document.querySelectorAll(".acct-nav-item").forEach((item) => {
    item.classList.toggle("is-active", item.dataset.acctSection === sectionId);
  });
  // Update section active state
  document.querySelectorAll(".acct-section").forEach((sec) => {
    sec.classList.toggle("is-active", sec.id === `acct-section-${sectionId}`);
  });
  // Update header
  setAcctHeader(sectionId);
  // Load section-specific data
  if (sectionId === "profile") renderProfileSection();
  if (sectionId === "bet-history") renderBetHistorySection();
  if (sectionId === "history") renderHistorySection();
}

async function openAccountModal(sectionId) {
  sectionId = sectionId || "payments";
  if (!useApi() || !api().getToken()) {
    openAuthModal("login");
    return;
  }
  // Show modal
  $("account-modal").hidden = false;
  $("account-modal-panel").hidden = false;
  // Switch to requested section
  switchAcctSection(sectionId);
  // If payments: load methods
  if (sectionId === "payments") {
    switchPaymentsTab("deposit");
    closeDepositFormPanel();
    try {
      const data = await api().fetchDepositMethods();
      state.depositMethods = data.methods || [];
      state.minDeposit = data.minDeposit || 100;
      renderDepositMethodCards(state.depositMethods, state.minDeposit);
    } catch (err) {
      const list = $("deposit-methods-list");
      if (list) list.innerHTML = `<div class="deposit-loading">Could not load payment methods.</div>`;
    }
    try {
      const hist = await api().fetchDepositHistory();
      state.depositHistory = hist.deposits || [];
      renderDepositHistory(state.depositHistory);
    } catch (_) {}
  }
}

// Legacy: keep openDepositModal pointing to openAccountModal
function openDepositModal() {
  return openAccountModal("payments");
}

function closeDepositModal() {
  $("account-modal").hidden = true;
  $("account-modal-panel").hidden = true;
}

function phoneToAccountEmail(rawPhone) {
  if (/[a-zA-Z]/.test(rawPhone)) return rawPhone;
  let digits = String(rawPhone || "").replace(/\D/g, "");
  if (digits.startsWith("251")) digits = digits.slice(3);
  if (digits.startsWith("0")) digits = digits.slice(1);
  return `251${digits}@phone.hopebet.local`;
}

function formatAuthPhone(rawPhone) {
  let digits = String(rawPhone || "").replace(/\D/g, "");
  if (digits.startsWith("251")) digits = digits.slice(3);
  if (digits.startsWith("0")) digits = digits.slice(1);
  return `+251${digits}`;
}

function openAuthModal(tab) {
  state.authTab = tab || "login";
  const isReg = state.authTab === "register";
  $("auth-modal").hidden = false;
  $("auth-card")?.classList.toggle("is-register", isReg);
  if ($("auth-title")) {
    $("auth-title").hidden = !isReg;
    $("auth-title").textContent = "Register";
  }
  document.querySelectorAll(".auth-label--reg, #auth-phone-label").forEach((el) => {
    el.hidden = !isReg;
  });
  if ($("auth-role-wrap")) $("auth-role-wrap").hidden = !isReg;
  if ($("auth-confirm-wrap")) $("auth-confirm-wrap").hidden = !isReg;
  if ($("auth-checks")) $("auth-checks").hidden = !isReg;
  if ($("auth-footer-login")) $("auth-footer-login").hidden = isReg;
  if ($("auth-footer-register")) $("auth-footer-register").hidden = !isReg;
  if ($("auth-phone")) $("auth-phone").placeholder = isReg ? "" : "Number";
  if ($("auth-password")) {
    $("auth-password").placeholder = isReg ? "" : "Password";
    $("auth-password").autocomplete = isReg ? "new-password" : "current-password";
  }
  if ($("auth-password2")) {
    $("auth-password2").required = isReg;
    $("auth-password2").value = isReg ? $("auth-password2").value : "";
  }
  if ($("auth-submit")) $("auth-submit").textContent = isReg ? "REGISTER" : "LOGIN";
}

function closeAuthModal() {
  $("auth-modal").hidden = true;
}

async function syncFromApi() {
  if (!useApi()) return;
  if (!api().getToken()) {
    state.sessionUser = null;
    state.balance = 0;
    if (!state.history || !state.history.length) {
      state.history = initMockMyBetsHistory();
    }
    renderSession();
    renderBalance();
    return;
  }

  try {
    state.sessionUser = api().getUser();
    const bal = await api().fetchBalance();
    state.balance = bal.balance;
    const hist = await api().fetchHistory();
    const apiTickets = (hist.tickets || []).map((t) => {
      const bets = (t.bets || []).map((b, idx) => {
        if (t.status === "lost" && !(t.bets || []).some((x) => x.status === "lost")) {
          if (idx === 0) return { ...b, status: "lost" };
          if (idx === 1) return { ...b, status: "won" };
        } else if (t.status === "won" && !b.status) {
          return { ...b, status: "won" };
        }
        return b;
      });

      return {
        id: t.id,
        type: (bets && bets.length > 1) ? "Multiple" : "Single",
        bets,
        stake: t.stake,
        totalOdds: t.totalOdds,
        totalWin: t.totalWin || Number((t.stake * (t.totalOdds || 1)).toFixed(2)),
        status: t.status || "in-course",
        payout: t.payout || 0,
        placedAt: t.placedAt,
      };
    });
    state.history = apiTickets.length ? apiTickets : initMockMyBetsHistory();
    renderSession();
    renderBalance();
    refreshMyBetsIfVisible();
    renderLastWinnings();
  } catch (err) {
    if (err.status === 401) {
      api().clearSession();
      state.sessionUser = null;
    }
    if (err.status !== 401) {
      toast(err.message || "Could not sync account", "err");
    }
  }
}

async function settleTicketRemote(ticket) {
  if (!useApi()) {
    settleTicketLocal(ticket);
    return;
  }
  const won = Math.random() < (ticket.bets.length === 1 ? 0.32 : 0.12);
  try {
    const result = await api().devSettle(ticket.id, won);
    ticket.status = result.status;
    ticket.payout = result.payout || 0;
    if (result.status === "won") {
      (ticket.bets || []).forEach((b) => { b.status = "won"; });
    } else {
      const bets = ticket.bets || [];
      if (bets.length > 0) bets[0].status = "lost";
      if (bets.length > 1) bets[1].status = "won";
    }
    state.balance = result.balance;
    renderBalance();
    if (state.betslipTab === "bets") renderHistory();
    refreshMyBetsIfVisible();
  } catch (err) {
    ticket.status = won ? "won" : "lost";
    if (won) {
      ticket.payout = ticket.stake * ticket.totalOdds;
      (ticket.bets || []).forEach((b) => { b.status = "won"; });
    } else {
      const bets = ticket.bets || [];
      if (bets.length > 0) bets[0].status = "lost";
      if (bets.length > 1) bets[1].status = "won";
    }
    toast(err.message || "Settlement pending", "err");
  }
}

function settleTicketLocal(ticket) {
  const winChance = ticket.bets.length === 1 ? 0.32 : 0.12;
  const won = Math.random() < winChance;
  ticket.status = won ? "won" : "lost";
  if (won) {
    ticket.payout = ticket.stake * ticket.totalOdds;
    state.balance += ticket.payout;
    (ticket.bets || []).forEach((b) => { b.status = "won"; });
  } else {
    const bets = ticket.bets || [];
    if (bets.length > 0) bets[0].status = "lost";
    if (bets.length > 1) bets[1].status = "won";
  }
  save();
  renderBalance();
  if (state.betslipTab === "bets") renderHistory();
  refreshMyBetsIfVisible();
}

async function placeBet() {
  if (!state.slip.length) return;
  if (useApi() && !api().getToken()) {
    openAuthModal("login");
    toast("Sign in to place bets", "err");
    return;
  }
  const finishedBets = state.slip.filter((b) => getSlipBetStatus(b).isFinished);
  if (finishedBets.length) {
    toast("Match Finished! Click 'x' to remove the event from the ticket!", "err");
    return;
  }
  const suspendedBets = state.slip.filter((b) => getSlipBetStatus(b).isSuspended);
  if (suspendedBets.length) {
    toast("Market Suspended! Click 'x' to remove the event from the ticket!", "err");
    return;
  }
  if (state.slip.some(isSlipBetExpired)) {
    toast("Remove suspended or finished selections before placing a bet", "err");
    return;
  }
  const active = activeSlipBets();
  if (!active.length) return;

  // Auto-sync latest live odds for active selections
  active.forEach((b) => {
    const st = getSlipBetStatus(b);
    if (st.currentOdd && st.currentOdd > 1) {
      b.odd = st.currentOdd;
    }
  });
  if (state.stake < MIN_STAKE) {
    toast(`Minimum stake is ${MIN_STAKE} ${CURRENCY}`, "err");
    return;
  }
  if (!useApi() && state.balance < state.stake) {
    toast("Insufficient balance", "err");
    return;
  }

  if (useApi()) {
    try {
      const payload = {
        stake: state.stake,
        mode: state.slipMode,
        selections: active.map((b) => ({
          fixtureId: b.fixtureId,
          marketKey: b.market || b.marketKey || "1x2",
          marketName: b.marketName || "Match Result",
          selectionName: b.selectionName || b.selection || "",
          value: b.selection || b.value || "",
          odd: b.odd,
          homeName: b.homeName,
          awayName: b.awayName,
          fixtureName: b.fixtureName,
          kickoff: b.kickoff,
          sport: b.sport || "Football",
          country: b.country || "",
          leagueName: b.leagueName || "",
        })),
      };
      const result = await api().placeBet(payload);
      const ticket = {
        id: result.ticket.id,
        bets: (result.ticket.bets && result.ticket.bets.length ? result.ticket.bets : active).map((rb, idx) => {
          const act = active[idx] || {};
          return {
            ...act,
            ...rb,
            sport: rb.sport || act.sport || "Football",
            country: rb.country || act.country || "",
            leagueName: rb.leagueName || act.leagueName || "",
            fixtureName: rb.fixtureName || act.fixtureName || "",
            marketName: rb.marketName || act.marketName || "",
            selectionName: rb.selectionName || act.selectionName || "",
            homeName: rb.homeName || act.homeName,
            awayName: rb.awayName || act.awayName,
            kickoff: rb.kickoff || act.kickoff,
            odd: rb.odd || act.odd,
          };
        }),
        stake: result.ticket.stake,
        totalOdds: result.ticket.totalOdds,
        totalWin: result.ticket.totalWin || Number((result.ticket.stake * (result.ticket.totalOdds || 1)).toFixed(2)),
        type: active.length > 1 ? "Multiple" : "Single",
        status: result.ticket.status || "in-course",
        payout: 0,
        placedAt: result.ticket.placedAt || new Date().toISOString(),
      };
      state.balance = result.balance;
      state.history.unshift(ticket);
      state.betPlacedSuccessTicket = ticket;
      state.slip = [];
      renderBalance();
      renderSlip();
      refreshHomeAndBoard();
      if (state.detailFixtureId) renderMatchDetail();
      toast(`Bet placed — ${ticket.id}`, "ok");
      refreshMyBetsIfVisible();
    } catch (err) {
      toast(err.message || "Could not place bet", "err");
    }
    return;
  }

  const id = "TKT-" + String(state.ticketSeq++).padStart(6, "0");
  const ticket = {
    id,
    type: active.length > 1 ? "Multiple" : "Single",
    bets: [...active],
    stake: state.stake,
    totalOdds: totalOdds(),
    totalWin: Number((state.stake * totalOdds()).toFixed(2)),
    status: "in-course",
    payout: 0,
    placedAt: new Date().toISOString(),
  };

  state.balance -= state.stake;
  state.history.unshift(ticket);
  state.betPlacedSuccessTicket = ticket;
  state.slip = [];
  save();

  renderBalance();
  renderSlip();
  refreshHomeAndBoard();
  if (state.detailFixtureId) renderMatchDetail();
  toast(`Bet placed — ${id}`, "ok");
  refreshMyBetsIfVisible();
}

function updateCountdowns() {
  document.querySelectorAll("[data-countdown]").forEach((el) => {
    el.textContent = formatCountdown(el.dataset.countdown);
  });
  if (state.slip.length) renderSlip();
}

function renderAll() {
  renderBalance();
  renderSportsSidebar();
  renderSidebar();
  renderTopLeaguesGrid();
  renderFilters();
  refreshHomeAndBoard();
  renderSlip();
  renderQuickStakes();
  renderLastWinnings();
}

function applyBoardFilters() {
  renderSidebar();
  renderFilters();
  const leaguesView = document.querySelector('[data-view="leagues"]');
  if (leaguesView && !leaguesView.hidden) {
    renderLeaguePage();
  } else {
    refreshHomeAndBoard();
  }
}

async function toggleSidebarCountry(countryName) {
  if (state.expandedSidebarCountries.has(countryName)) {
    state.expandedSidebarCountries.delete(countryName);
  } else {
    state.expandedSidebarCountries.add(countryName);
    await fetchCountryLeagues(countryName);
  }
  state.countryFilter = countryName;
  state.leagueFilter = "all";
  closeLeagueDropdown();
  applyBoardFilters();
}

function selectLeague(leagueId) {
  state.leagueFilter = leagueId;
  state.countryFilter = null;
  closeLeagueDropdown();
  applyBoardFilters();
  renderTopLeaguesGrid();
}

function selectCountry(countryName) {
  state.countryFilter = countryName;
  state.leagueFilter = "all";
  state.expandedSidebarCountries.add(countryName);
  closeLeagueDropdown();
  fetchCountryLeagues(countryName).then(applyBoardFilters);
}

// ============================================================
// TICKET RECEIPT & PRINT PREVIEW
// ============================================================

const CODE128_PATTERNS = [
  "212222","222122","222221","121223","121322","131222","122213","122312","132212","221213",
  "221312","231212","112232","122132","122231","113222","123122","123221","223211","221132",
  "221231","213212","223112","312131","311222","321122","321221","312212","322112","322211",
  "212123","212321","232121","111323","131123","131321","112313","132113","132311","211313",
  "231113","231311","112133","112331","132131","113123","113321","133121","313121","211331",
  "231131","213113","213311","213131","311123","311321","331121","312113","312311","332111",
  "314111","221411","431111","111224","111422","121124","121421","141122","141221","112214",
  "112412","122114","122411","142112","142211","241211","221114","413111","241112","134111",
  "111242","121142","121241","114212","124112","124211","411212","421112","421211","212141",
  "214121","412121","111143","111341","131141","114113","114311","411113","411311","113141",
  "114131","311141","411131","211412","211214","211232","2331112"
];

function generateBarcodeSvg(text, height) {
  text = String(text || "567813396").trim();
  height = height || 44;

  const codes = [104];
  let checkSum = 104;

  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i) - 32;
    const val = (charCode >= 0 && charCode <= 95) ? charCode : 0;
    codes.push(val);
    checkSum += val * (i + 1);
  }

  codes.push(checkSum % 103);
  codes.push(106);

  let totalModules = 0;
  for (let i = 0; i < codes.length; i++) {
    const pat = CODE128_PATTERNS[codes[i]] || "111111";
    for (let j = 0; j < pat.length; j++) {
      totalModules += parseInt(pat[j], 10);
    }
  }

  const quietZone = 8;
  const totalWidth = totalModules + quietZone * 2;
  let curX = quietZone;
  let rects = "";

  for (let i = 0; i < codes.length; i++) {
    const pat = CODE128_PATTERNS[codes[i]] || "111111";
    let isBar = true;
    for (let j = 0; j < pat.length; j++) {
      const w = parseInt(pat[j], 10);
      if (isBar) {
        rects += `<rect x="${curX}" y="0" width="${w}" height="${height}" fill="#000000" />`;
      }
      curX += w;
      isBar = !isBar;
    }
  }

  return `<svg class="receipt-barcode-svg" viewBox="0 0 ${totalWidth} ${height}" preserveAspectRatio="none">${rects}</svg>`;
}

function generateCashierCode(ticketHash, betId) {
  let h = 0;
  const str = String(ticketHash || "") + String(betId || "");
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  }
  const suffix = String(Math.abs(h)).padStart(5, "3").slice(0, 5);
  return `5678${suffix}`;
}

function generateTicketHash(betId, timestamp) {
  let h1 = 0x811c9dc5;
  let h2 = 0x5bd1e995;
  const seed = String(betId || "TKT") + "-" + String(timestamp || Date.now());
  for (let i = 0; i < seed.length; i++) {
    const c = seed.charCodeAt(i);
    h1 = Math.imul(h1 ^ c, 0x01000193);
    h2 = Math.imul(h2 ^ c, 0x5bd1e995);
  }
  const hex1 = (h1 >>> 0).toString(16).toUpperCase().padStart(8, "0");
  const hex2 = (h2 >>> 0).toString(16).toUpperCase().padStart(8, "0");
  return (`505685${hex1}${hex2}645A3D`).slice(0, 20);
}

function generateTicketQrSvg(payload) {
  if (typeof qrcode === "function") {
    try {
      const qr = qrcode(0, "M");
      qr.addData(payload);
      qr.make();
      return qr.createSvgTag({ cellSize: 2, margin: 0, scalable: true });
    } catch (err) {
      console.warn("QR code generation error:", err);
    }
  }

  return generateDeterministicQrFallback(payload);
}

function generateDeterministicQrFallback(seedStr) {
  let hash = 0;
  const str = String(seedStr || "HOPEBET");
  for (let i = 0; i < str.length; i++) {
    hash = (Math.imul(31, hash) + str.charCodeAt(i)) | 0;
  }
  const rng = (step) => {
    hash = (Math.imul(48271, hash + step)) | 0;
    return Math.abs(hash);
  };

  const size = 25;
  let rects = "";
  const drawFinder = (x0, y0) => {
    rects += `<rect x="${x0}" y="${y0}" width="7" height="7" fill="#000"/>`;
    rects += `<rect x="${x0+1}" y="${y0+1}" width="5" height="5" fill="#fff"/>`;
    rects += `<rect x="${x0+2}" y="${y0+2}" width="3" height="3" fill="#000"/>`;
  };
  drawFinder(0, 0);
  drawFinder(size - 7, 0);
  drawFinder(0, size - 7);

  for (let i = 7; i < size - 7; i += 2) {
    rects += `<rect x="${i}" y="6" width="1" height="1" fill="#000"/>`;
    rects += `<rect x="6" y="${i}" width="1" height="1" fill="#000"/>`;
  }

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if ((x < 8 && y < 8) || (x >= size - 8 && y < 8) || (x < 8 && y >= size - 8)) continue;
      if (x === 6 || y === 6) continue;
      if ((rng(x * size + y) % 3) === 0) {
        rects += `<rect x="${x}" y="${y}" width="1" height="1" fill="#000"/>`;
      }
    }
  }

  return `<svg viewBox="0 0 ${size} ${size}" preserveAspectRatio="none" style="width:100%;height:100%;"><rect width="${size}" height="${size}" fill="#fff"/>${rects}</svg>`;
}

function formatReceiptDate(d) {
  const date = d ? new Date(d) : new Date();
  const pad = (n) => String(n).padStart(2, "0");
  const day = pad(date.getDate());
  const month = pad(date.getMonth() + 1);
  const year = date.getFullYear();
  const hrs = pad(date.getHours());
  const mins = pad(date.getMinutes());
  const secs = pad(date.getSeconds());
  return `${day}/${month}/${year} ${hrs}:${mins}:${secs}`;
}

function formatKickoffDate(d) {
  const date = d ? new Date(d) : new Date();
  const pad = (n) => String(n).padStart(2, "0");
  const day = pad(date.getDate());
  const month = pad(date.getMonth() + 1);
  const year = String(date.getFullYear()).slice(2);
  const hrs = pad(date.getHours());
  const mins = pad(date.getMinutes());
  return `${day}/${month}/${year} ${hrs}:${mins}`;
}

function resolveReceiptMarketName(marketName, marketKey) {
  const m = String(marketName || "").trim().toLowerCase();
  const k = String(marketKey || "").trim().toLowerCase();
  if (k === "1x2" || m.includes("match result") || m === "1x2" || m === "1 x 2" || !m) {
    return "Match Result";
  }
  if (k === "dc" || m.includes("double chance")) {
    return "Double Chance";
  }
  if (k === "ou" || m.includes("total") || m.includes("over/under")) {
    return "Total Goals";
  }
  if (k === "btts" || m.includes("both teams")) {
    return "Both Teams To Score";
  }
  return marketName || "Match Result";
}

function resolveEventCountryAndLeague(b) {
  const sport = b.sport || "Football";
  let league = String(b.leagueName || "").trim();
  let country = String(b.country || "").trim();
  const fixture = String(b.fixtureName || `${b.homeName || ""} vs ${b.awayName || ""}`).trim();

  if (!country) {
    country = inferCountry(league, fixture);
  }
  if (!country) {
    const s = `${league} ${fixture}`.toLowerCase();
    if (s.includes("australia") || s.includes("npl") || s.includes("a-league") || s.includes("adelaide") || s.includes("playford")) country = "Australia";
    else if (s.includes("england") || s.includes("premier") || s.includes("championship")) country = "England";
    else if (s.includes("spain") || s.includes("la liga") || s.includes("segunda")) country = "Spain";
    else if (s.includes("italy") || s.includes("serie")) country = "Italy";
    else if (s.includes("germany") || s.includes("bundesliga")) country = "Germany";
    else if (s.includes("france") || s.includes("ligue")) country = "France";
    else country = "International";
  }

  if (!league) {
    league = "League";
  }

  if (league.toLowerCase().startsWith(country.toLowerCase() + " -")) {
    return `${sport} / ${league}`;
  }

  return `${sport} / ${country} - ${league}`;
}

function normalizeReceiptPick(selectionName, marketName, homeName, awayName, selectionKey) {
  const s = String(selectionName || "").trim();
  const m = String(marketName || "").toLowerCase();
  const k = String(selectionKey || "").toLowerCase();
  const h = String(homeName || "").toLowerCase().trim();
  const a = String(awayName || "").toLowerCase().trim();
  const sl = s.toLowerCase();

  // If selection matches home or W1
  if (s === "1" || sl === "home" || sl === "w1" || k === "home" || k === "1" || (h && (sl === h || sl.includes(h) || h.includes(sl)))) {
    return "W1";
  }
  // If selection matches draw or X
  if (s === "X" || sl === "x" || sl === "draw" || k === "draw" || k === "x") {
    return "X";
  }
  // If selection matches away or W2
  if (s === "2" || sl === "away" || sl === "w2" || k === "away" || k === "2" || (a && (sl === a || sl.includes(a) || a.includes(sl)))) {
    return "W2";
  }
  if (s === "1X" || s === "12" || s === "X2" || sl === "1x" || sl === "x2") {
    return s.toUpperCase();
  }
  if (sl.startsWith("over")) {
    const num = s.replace(/[^0-9.]/g, "") || "2.5";
    return `Over (${num})`;
  }
  if (sl.startsWith("under")) {
    const num = s.replace(/[^0-9.]/g, "") || "2.5";
    return `Under (${num})`;
  }
  if (sl === "gg" || (m.includes("both") && (sl === "yes" || sl === "y"))) return "Yes";
  if (sl === "ng" || (m.includes("both") && (sl === "no" || sl === "n"))) return "No";
  return s;
}

function isTicketAlreadyPrinted(ticketId) {
  if (!ticketId) return false;
  try {
    const store = JSON.parse(localStorage.getItem("hope_printed_tickets") || "{}");
    return Boolean(store[String(ticketId)]);
  } catch (_) {
    return false;
  }
}

function markTicketAsPrinted(ticketId) {
  if (!ticketId) return;
  try {
    const store = JSON.parse(localStorage.getItem("hope_printed_tickets") || "{}");
    store[String(ticketId)] = (store[String(ticketId)] || 0) + 1;
    localStorage.setItem("hope_printed_tickets", JSON.stringify(store));
  } catch (_) {}
}

function renderPrintTicket(ticket, options = {}) {
  const paper = $("receipt-paper");
  if (!paper) return;

  ticket = ticket || state.betPlacedSuccessTicket || state.history[0] || {
    id: "969060459",
    bets: state.slip.length ? state.slip : [
      { fixtureName: "Adelaide City FC v Playford City Patriots SC", homeName: "Adelaide City FC", awayName: "Playford City Patriots SC", sport: "Football", country: "Australia", leagueName: "NPL South Australia", marketName: "Match Result", selectionName: "W1", selection: "home", odd: 1.68, kickoff: "2026-09-05T12:30:00.000Z" }
    ],
    stake: state.stake || 20,
    totalOdds: totalOdds() || 1.68,
    status: "pending",
    placedAt: new Date().toISOString(),
  };

  const bets = ticket.bets || [];
  const stake = Number(ticket.stake || ticket.amount || 20);
  const odds = Number(ticket.totalOdds || (bets.reduce((acc, b) => acc * (b.odd || 1), 1)) || 1);
  const bonus = Number(ticket.bonus || 0);
  const possibleWin = ticket.potentialWinning ? Number(ticket.potentialWinning) : (stake * odds);
  const netWin = Math.max(0, possibleWin - stake);
  const winTax = Number(ticket.winTax || (netWin >= 1000 ? netWin * 0.15 : 0));
  const finalWin = Math.max(0, possibleWin - winTax + bonus);

  const numEvents = bets.length;
  const rawBetId = String(ticket.id || "000011").replace(/^TKT-/i, "");
  const betId = rawBetId;
  const ticketHash = ticket.ticketHash || generateTicketHash(betId, ticket.placedAt || ticket.created_at);
  const cashierCode = ticket.cashierCode || generateCashierCode(ticketHash, betId);
  const username = state.sessionUser?.phone || state.sessionUser?.username || "";
  const dateStr = formatReceiptDate(ticket.placedAt || ticket.created_at);
  const printDateStr = formatReceiptDate(new Date());

  // Determine win / lost / settled outcome for the ticket
  const allBets = ticket.bets || [];
  const hasLostPick = allBets.some((b) => getBetSelectionResult(b, ticket) === "lost");
  const isAllWon = allBets.length > 0 && allBets.every((b) => getBetSelectionResult(b, ticket) === "won");
  const isLost = hasLostPick || ticket.status === "lost";
  const isWon = !hasLostPick && (isAllWon || ticket.status === "won");
  const isSettled = isLost || isWon || ticket.status === "closed";
  const statusLabel = isLost ? "TICKET LOST" : (isWon ? "TICKET WON" : (ticket.status || "IN COURSE").toUpperCase());

  // Watermark logic: on original first print after bet placement, isReprint is false.
  // On subsequent prints or when reprinting past tickets from My Bets, isReprint is true ("የማያገለግል" watermark shown)
  const ticketId = String(ticket.id || rawBetId);
  const alreadyPrinted = isTicketAlreadyPrinted(ticketId);
  const isReprint = options.forceOriginal ? false : (options.forceReprint ? true : (alreadyPrinted || isSettled));
  markTicketAsPrinted(ticketId);

  const watermarkHtml = isReprint ? `
    <div class="receipt-watermark-overlay" aria-hidden="true">
      ${Array.from({ length: 14 }).map(() => `
        <div class="receipt-watermark-row">
          <span>የማያገለግል</span>
          <span>የማያገለግል</span>
          <span>የማያገለግል</span>
        </div>
      `).join("")}
    </div>` : "";

  const bonusHtml = bonus > 0 ? `
      <div class="rec-fin-row">
        <span>BONUS</span>
        <span>${fmt(bonus)} ETB</span>
      </div>` : "";

  const winTaxHtml = winTax > 0 ? `
      <div class="rec-fin-row">
        <span>WIN TAX</span>
        <span>${fmt(winTax)} ETB</span>
      </div>` : "";

  // Dynamic QR Code SVG encoding ticket verification
  const qrPayload = `https://hopebet.et/check?t=${ticketHash}`;
  const qrSvg = generateTicketQrSvg(qrPayload);

  // Dynamic Code 128 Barcode SVG
  const barcodeSvg = generateBarcodeSvg(cashierCode, 44);

  const eventsHtml = bets.map((b) => {
    let match = "";
    if (b.fixtureName) {
      match = b.fixtureName.replace(/\s+-\s+|\s+vs\s+/gi, " v ");
    } else if (b.homeName && b.awayName) {
      match = `${b.homeName} v ${b.awayName}`;
    } else {
      match = "Match";
    }

    const leagueStr = resolveEventCountryAndLeague(b);
    const kickoffStr = formatKickoffDate(b.kickoff);
    const market = resolveReceiptMarketName(b.marketName, b.marketKey || b.market);
    const pick = normalizeReceiptPick(b.selectionName, b.marketName, b.homeName, b.awayName, b.selection || b.value);
    const odd = Number(b.odd || 1).toFixed(2);

    const res = getBetSelectionResult(b, ticket);
    let highlightClass = "";
    if (res === "lost") {
      highlightClass = " is-lost";
    } else if (res === "won") {
      highlightClass = " is-won";
    }

    return `
      <div class="receipt-event-item${highlightClass}">
        <div class="rec-match-title">${match}</div>
        <div class="rec-meta-row">
          <span>${leagueStr}</span>
          <span>${kickoffStr}</span>
        </div>
        <div class="rec-pick-row">
          <span class="rec-market">${market}</span>
          <span class="rec-pick">${pick}</span>
          <span class="rec-odd">Q: ${odd}</span>
        </div>
      </div>`;
  }).join("");

  paper.innerHTML = `
    ${watermarkHtml}
    <!-- Top Header Brand Box -->
    <div class="receipt-box receipt-brand-box">
      <div class="receipt-brand-left">
        <div class="receipt-brand-row">
          <span class="receipt-brand-text">Hope Bet</span>
          <span class="receipt-brand-scan">SCAN &amp; CHECK BET</span>
          <span class="receipt-status-pill ${isLost ? 'is-lost' : (isWon ? 'is-won' : 'is-open')}">${statusLabel}</span>
        </div>
      </div>
      <div class="receipt-qr-wrap">
        ${qrSvg}
      </div>
    </div>

    <!-- Metadata Box -->
    <div class="receipt-box receipt-meta-box">
      <div class="receipt-meta-row">
        <span class="receipt-meta-key">DATE</span>
        <span class="receipt-meta-val">${dateStr}</span>
      </div>
      <div class="receipt-meta-row">
        <span class="receipt-meta-key">TICKET</span>
        <span class="receipt-meta-val">${ticketHash}</span>
      </div>
      <div class="receipt-meta-row">
        <span class="receipt-meta-key">BET</span>
        <span class="receipt-meta-val">${betId}</span>
      </div>
      <div class="receipt-meta-row">
        <span class="receipt-meta-key">USERNAME</span>
        <span class="receipt-meta-val">${username}</span>
      </div>
      <div class="receipt-meta-row">
        <span class="receipt-meta-key">PRINT DATE</span>
        <span class="receipt-meta-val">${printDateStr}</span>
      </div>
      <div class="receipt-meta-row receipt-meta-status-row">
        <span class="receipt-meta-key">STATUS</span>
        <span class="receipt-meta-val receipt-status-badge ${isLost ? 'is-lost' : (isWon ? 'is-won' : 'is-open')}">${statusLabel}</span>
      </div>
    </div>

    <!-- Age Warning Banner -->
    <div class="receipt-box receipt-age-box">
      <div class="receipt-age-circle">21+</div>
      <div class="receipt-age-text">
        <div>ከ21 ዓመት በታች ለሆኑ አይፈቀድም!</div>
        <div class="receipt-age-line"></div>
        <div>ህግና ደንቦች ተፈፃሚ ናቸው</div>
      </div>
    </div>

    <!-- Events List -->
    <div class="receipt-events-list">
      ${eventsHtml}
    </div>

    ${isLost ? `
    <div class="receipt-box receipt-outcome-box is-lost">
      <span class="receipt-outcome-icon">✕</span>
      <span>TICKET LOST</span>
    </div>` : (isWon ? `
    <div class="receipt-box receipt-outcome-box is-won">
      <span class="receipt-outcome-icon">✓</span>
      <span>TICKET WON</span>
    </div>` : "")}

    <!-- Summary Row -->
    <div class="receipt-box receipt-events-summary">
      <span>NR EVENTS: ${numEvents}</span>
      <span>ODDS TOTAL: ${odds.toFixed(2)}</span>
    </div>

    <!-- Financials Box -->
    <div class="receipt-box receipt-financials-box">
      <div class="rec-fin-row">
        <span>BET AMOUNT</span>
        <span>${fmt(stake)} ETB</span>
      </div>
      ${bonusHtml}
      <div class="rec-fin-row">
        <span>POSSIBLE WIN</span>
        <span>${fmt(possibleWin)} ETB</span>
      </div>
      ${winTaxHtml}
      <div class="rec-fin-divider"></div>
      <div class="rec-fin-total ${isLost ? 'is-lost' : (isWon ? 'is-won' : '')}">
        <span class="rec-fin-total-label">WINNING</span>
        <span class="rec-fin-total-amount">${isLost ? '0.00 ETB (LOST)' : fmt(finalWin) + ' ETB'}</span>
      </div>
    </div>

    <!-- Barcode -->
    <div class="receipt-barcode-wrap">
      ${barcodeSvg}
      <div class="receipt-cashier-code">Cashier Code: ${cashierCode}</div>
    </div>

    <!-- Footer Terms & Hotline -->
    <div class="receipt-footer-terms">
      All Win Tickets are ONLY valid for 30 Days | Soccer Betting is 90 Minutes and Doesn't include Extra Time or Penalties.
    </div>

    <div class="receipt-footer-age">
      <div class="receipt-age-circle receipt-age-circle--small">21+</div>
      <div class="receipt-footer-amharic">
        <div>ከ21 ዓመት በታች ለሆኑ አይፈቀድም!</div>
        <div>ህግና ደንቦች ተፈፃሚ ናቸው</div>
      </div>
    </div>

    <div class="receipt-hotline-bar">
      <span class="receipt-hotline-icon">📞</span>
      <span class="receipt-hotline-number">8804</span>
      <span class="receipt-hotline-amharic">ይደውሉ!</span>
    </div>
  `;
}

function printTicketReceipt(ticket, options = {}) {
  renderPrintTicket(ticket, options);
  setTimeout(() => {
    window.print();
  }, 50);
}

function openTicketPrintModal(ticket, options = {}) {
  printTicketReceipt(ticket, options);
}

function closeTicketPrintModal() {
  // no-op
}

// ============================================================
// SHARE ON SOCIALS / BOOKED BET MODAL
// ============================================================

function openShareModal() {
  if (!state.slip || !state.slip.length) {
    toast("Add selections to your betslip first", "err");
    return;
  }

  // Generate 5-digit numeric booking code
  const code = String(Math.floor(10000 + Math.random() * 90000));
  state.currentBookingCode = code;

  // Persist the booked bet in localStorage so it can be reloaded via this 5-digit code
  try {
    const bookedStore = JSON.parse(localStorage.getItem("hope_booked_bets") || "{}");
    bookedStore[code] = {
      code,
      slip: JSON.parse(JSON.stringify(state.slip)),
      stake: state.stake || 20,
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem("hope_booked_bets", JSON.stringify(bookedStore));
  } catch (_) {}

  // Update modal header / summary values
  const codeEl = $("share-code-val");
  if (codeEl) codeEl.textContent = `*${code}*`;

  const today = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  const dateStr = `${pad(today.getDate())}/${pad(today.getMonth() + 1)}/${today.getFullYear()}`;
  const dateEl = $("share-date-val");
  if (dateEl) dateEl.textContent = dateStr;

  const stakeVal = Number(state.stake || 20);
  const stakeEl = $("share-stake-val");
  if (stakeEl) stakeEl.textContent = stakeVal.toFixed(2);

  const totalOddsVal = totalOdds() || 1;
  const winVal = stakeVal * totalOddsVal;
  const winEl = $("share-win-val");
  if (winEl) winEl.textContent = winVal.toFixed(2);

  // Populate Table of Events
  const tbody = $("share-table-body");
  if (tbody) {
    tbody.innerHTML = state.slip.map((b) => {
      let kickoffStr = "";
      if (b.kickoff) {
        try {
          const kd = new Date(b.kickoff);
          kickoffStr = !isNaN(kd.getTime()) ? kd.toISOString().replace(".000Z", "").slice(0, 19) : "2026-09-05T13:30:00";
        } catch (_) {
          kickoffStr = "2026-09-05T13:30:00";
        }
      } else {
        kickoffStr = "2026-09-05T13:30:00";
      }

      const tournament = b.leagueName || "Tournament";
      const eventName = b.fixtureName ? b.fixtureName.replace(/\s+vs\s+/gi, " - ") : (b.homeName && b.awayName ? `${b.homeName} - ${b.awayName}` : "Match");
      const pick = normalizeReceiptPick(b.selectionName, b.marketName, b.homeName, b.awayName, b.selection || b.value);
      const marketLabel = `Match Result: ${pick}`;
      const oddVal = Number(b.odd || 1).toFixed(2);

      return `
        <tr>
          <td>${kickoffStr}</td>
          <td>${tournament}</td>
          <td class="event-cell">${eventName}</td>
          <td class="market-cell">${marketLabel}</td>
          <td class="odd-cell">${oddVal}</td>
        </tr>`;
    }).join("");
  }

  // Show modal
  const backdrop = $("share-modal-backdrop");
  const modal = $("share-modal");
  if (backdrop) backdrop.hidden = false;
  if (modal) modal.hidden = false;
}

function closeShareModal() {
  const backdrop = $("share-modal-backdrop");
  const modal = $("share-modal");
  if (backdrop) backdrop.hidden = true;
  if (modal) modal.hidden = true;
}

function loadBookedBetByCode(rawCode) {
  const code = String(rawCode || "").replace(/[^0-9]/g, "").trim();
  if (code.length !== 5) {
    toast("Enter a valid 5-digit booking code (5 numbers)", "err");
    return;
  }

  try {
    let bookedStore = {};
    try {
      bookedStore = JSON.parse(localStorage.getItem("hope_booked_bets") || "{}");
    } catch (_) {}

    let item = bookedStore[code];

    // If not found in storage, generate a valid set of real matches from current fixtures
    if (!item || !item.slip || !item.slip.length) {
      const availFixtures = (state.fixtures && state.fixtures.length) ? state.fixtures : buildMockFixtures();
      const numSelections = 3; // 3 matches
      const selections = [];
      const codeNum = parseInt(code, 10) || 12345;

      for (let i = 0; i < Math.min(numSelections, availFixtures.length); i++) {
        const fixIdx = (codeNum + i * 2) % availFixtures.length;
        const fix = availFixtures[fixIdx];
        const pickType = ((codeNum + i) % 3 === 0) ? "home" : (((codeNum + i) % 3 === 1) ? "away" : "draw");
        const pickLabel = pickType === "home" ? fix.home.name : (pickType === "away" ? fix.away.name : "Draw");
        const oddVal = pickType === "home" ? (fix.odds?.home || 2.15) : (pickType === "away" ? (fix.odds?.away || 2.40) : (fix.odds?.draw || 3.20));

        selections.push({
          key: slipKey(fix.fixtureId, "1x2", pickType),
          fixtureId: fix.fixtureId,
          market: "1x2",
          selection: pickType,
          odd: parseFloat(oddVal) || 2.15,
          fixtureName: `${fix.home.name} vs ${fix.away.name}`,
          homeName: fix.home.name,
          awayName: fix.away.name,
          homeLogo: fix.home.logo,
          awayLogo: fix.away.logo,
          selectionName: pickLabel,
          marketName: "Match Result",
          kickoff: fix.date || new Date().toISOString(),
          sport: fix.sport || "Football",
          country: fix.league?.country || inferCountry(fix.league?.name, `${fix.home.name} vs ${fix.away.name}`) || "England",
          leagueName: fix.league?.name || "Premier League",
        });
      }

      item = {
        code,
        slip: selections,
        stake: 20,
        createdAt: new Date().toISOString()
      };
      bookedStore[code] = item;
      try {
        localStorage.setItem("hope_booked_bets", JSON.stringify(bookedStore));
      } catch (_) {}
    }

    // Set state
    state.betPlacedSuccessTicket = null; // Clear receipt
    state.slip = JSON.parse(JSON.stringify(item.slip));
    state.slipMode = state.slip.length > 1 ? "multiple" : "single";
    if (item.stake) state.stake = Number(item.stake);

    // Switch to betslip tab
    setBetslipTab("slip");
    save();
    renderSlip();
    refreshMatchViews();

    // If on mobile screen, open the mobile betslip drawer
    if (window.innerWidth <= 900 && typeof openMobileBetslip === "function") {
      openMobileBetslip();
    }

    // Smooth scroll betslip into view so user sees loaded matches immediately
    const slipContainer = $("slip-list") || $("panel-slip") || $("betslip");
    if (slipContainer) {
      slipContainer.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }

    // Clear inputs
    const input1 = $("load-booked-code");
    if (input1) input1.value = "";
    const input2 = $("page-load-booked-code");
    if (input2) input2.value = "";

    toast(`Loaded booked bet *${code}* (${state.slip.length} matches)`, "ok");
  } catch (err) {
    console.error("Failed to load booked bet:", err);
    toast("Could not load booked bet", "err");
  }
}

function bindEvents() {
  if (typeof bindSuperAdminEvents === "function") bindSuperAdminEvents();

  // Night mode toggle
  const nightToggle = $("night-toggle");
  if (nightToggle) on(nightToggle, "click", toggleNightMode);

  // Universal Coming Soon handler
  document.addEventListener("click", (e) => {
    const target = e.target.closest("[data-coming-soon], .btn-load-red, .check-it-link");
    if (target) {
      e.preventDefault();
      e.stopPropagation();
      toast("Coming Soon", "info");
    }
  });

  // League sport tabs (Football, Basketball, Tennis, etc.)
  const leagueSportTabs = $("league-sport-tabs");
  if (leagueSportTabs) {
    on(leagueSportTabs, "click", (e) => {
      const tab = e.target.closest(".league-sport-tab");
      if (!tab) return;
      if (tab.dataset.leagueSport !== "football") {
        toast("Coming Soon", "info");
        return;
      }
      document.querySelectorAll(".league-sport-tab").forEach((t) => t.classList.remove("is-on"));
      tab.classList.add("is-on");
    });
  }

  function handleOddClick(e) {
    const btn = e.target.closest(".odd-btn");
    if (!btn || btn.disabled || btn.dataset.locked === "true" || btn.classList.contains("is-locked")) return;
    e.stopPropagation();
    e.preventDefault();
    const fixtureId = Number(btn.dataset.fixture);
    const market = btn.dataset.market;
    const selection = btn.dataset.selection;
    const fixture = findFixture(fixtureId);
    if (!fixture) return;
    toggleSelection(fixture, market, selection);
  }

  function handleOpenFixture(e) {
    const row = e.target.closest("[data-open-fixture]");
    if (!row || e.target.closest(".odd-btn")) return;
    e.preventDefault();
    openMatchDetail(Number(row.dataset.openFixture));
  }

  on($("btn-mobile-menu"), "click", () => {
    if (document.body.classList.contains("menu-open")) closeMobileDrawers();
    else openMobileMenu();
  });

  on($("mobile-slip-fab"), "click", () => {
    if (document.body.classList.contains("betslip-open")) closeMobileDrawers();
    else openMobileBetslip();
  });

  on($("btn-mobile-home"), "click", () => {
    closeMobileDrawers();
    applySubNav("sports");
  });

  on($("btn-mobile-account"), "click", () => {
    if (document.body.classList.contains("account-open")) closeMobileDrawers();
    else openAccountDrawer();
  });

  on($("btn-close-account"), "click", closeMobileDrawers);

  on($("account-drawer"), "click", (e) => {
    const authBtn = e.target.closest("[data-account-auth]");
    if (authBtn) {
      closeMobileDrawers();
      openAuthModal(authBtn.dataset.accountAuth);
      return;
    }
  });

  on($("account-live-chat"), "click", () => {
    closeMobileDrawers();
    toast("Live chat coming soon", "ok");
  });

  on($("account-android"), "click", (e) => {
    e.preventDefault();
    toast("Android app coming soon", "ok");
  });

  on($("account-ios"), "click", (e) => {
    e.preventDefault();
    toast("iOS app coming soon", "ok");
  });

  on($("account-language"), "change", () => {
    toast("English is the only language available for now", "ok");
  });

  on($("account-deposit"), "click", () => {
    closeMobileDrawers();
    $("btn-deposit")?.click();
  });

  on($("account-signout"), "click", () => {
    closeMobileDrawers();
    $("btn-join")?.click();
  });

  on($("mobile-sports-strip"), "click", (e) => {
    const tool = e.target.closest("[data-mobile-tool]");
    if (tool) {
      const kind = tool.dataset.mobileTool;
      if (kind === "inplay") applySubNav("inplay");
      else if (kind === "search") {
        openMobileMenu();
        $("event-search")?.focus();
      } else if (kind === "check") {
        closeMobileDrawers();
        applySubNav("check-bet");
      }
      return;
    }
    const sport = e.target.closest("[data-mobile-sport]");
    if (!sport) return;
    if (sport.dataset.mobileSport === "football") {
      openSportsMenu("football");
      return;
    }
    toast("Only Football is live for now — other sports coming soon", "err");
  });

  on($("mobile-time-strip"), "click", (e) => {
    const btn = e.target.closest("[data-mobile-time]");
    if (!btn) return;
    state.timeFilter = btn.dataset.mobileTime;
    renderFilters();
    renderMobileTimeStrip();
    refreshHomeAndBoard();
    if (!$("view-leagues")?.hidden) renderLeaguePage();
  });

  on($("btn-close-sidebar"), "click", closeMobileDrawers);
  on($("btn-close-betslip"), "click", closeMobileDrawers);
  on($("mobile-drawer-backdrop"), "click", closeMobileDrawers);

  on(window, "resize", () => {
    if (!isMobileLayout()) closeMobileDrawers();
    renderMobileTimeStrip();
  });

  on($("sidebar-leagues"), "click", (e) => {
    const btn = e.target.closest("[data-sidebar-league]");
    if (!btn) return;
    selectLeague(Number(btn.dataset.sidebarLeague));
    closeMobileDrawers();
  });

  on($("sidebar-countries"), "click", async (e) => {
    const leagueBtn = e.target.closest("[data-sidebar-league]");
    if (leagueBtn) {
      selectLeague(Number(leagueBtn.dataset.sidebarLeague));
      closeMobileDrawers();
      return;
    }
    const countryBtn = e.target.closest("[data-sidebar-country]");
    if (!countryBtn) return;
    await toggleSidebarCountry(countryBtn.dataset.sidebarCountry);
  });

  on($("sidebar-sports"), "click", (e) => {
    const btn = e.target.closest("[data-sidebar-sport]");
    if (!btn) return;
    if (btn.dataset.sidebarSport === "football") {
      openSportsMenu("football");
      closeMobileDrawers();
      return;
    }
    toast("Only Football is live for now — other sports coming soon", "err");
  });

  on($("league-filter-bar"), "click", (e) => {
    const toggle = e.target.closest("[data-dropdown-toggle]");
    if (toggle) {
      const id = toggle.dataset.dropdownToggle;
      const wasOpen = state.leagueDropdown === id;
      state.leagueDropdown = wasOpen ? null : id;
      if (!wasOpen) {
        if (id === "all") {
          state.leagueFilter = "all";
          state.countryFilter = null;
        } else if (id === "top") {
          state.leagueFilter = "top";
          state.countryFilter = null;
        }
        applyBoardFilters();
      } else {
        renderFilters();
      }
      return;
    }

    const country = e.target.closest("[data-dropdown-country]");
    if (country) {
      selectCountry(country.dataset.dropdownCountry);
      return;
    }

    const league = e.target.closest("[data-dropdown-league]");
    if (league) {
      selectLeague(Number(league.dataset.dropdownLeague));
      return;
    }

    const chipLeague = e.target.closest("[data-league]");
    if (chipLeague) {
      selectLeague(Number(chipLeague.dataset.league));
      return;
    }

    const chipCountry = e.target.closest("[data-country-chip]");
    if (chipCountry) {
      selectCountry(chipCountry.dataset.countryChip);
    }
  });

  on($("league-filter-bar"), "input", (e) => {
    if (!e.target.matches("[data-dropdown-search]")) return;
    state.leagueDropdownSearch = e.target.value;
    renderFilters();
    const input = $("league-filter-bar")?.querySelector("[data-dropdown-search]");
    if (input) {
      input.focus();
      input.setSelectionRange(input.value.length, input.value.length);
    }
  });

  on($("league-dropdown-backdrop"), "click", () => {
    closeLeagueDropdown();
    renderFilters();
  });

  on($("time-filters"), "click", (e) => {
    const btn = e.target.closest("[data-time]");
    if (!btn) return;
    state.timeFilter = btn.dataset.time;
    renderFilters();
    const leaguesView = document.querySelector('[data-view="leagues"]');
    if (leaguesView && !leaguesView.hidden) renderLeaguePage();
    else if (!state.sportsMenuMode) refreshHomeAndBoard();
  });

  on($("popular-carousel"), "click", (e) => {
    handleOddClick(e);
    handleOpenFixture(e);
  });

  const marketTabsEl = $("board-market-tabs");
  if (marketTabsEl) {
    marketTabsEl.addEventListener("click", (e) => {
      const btn = e.target.closest(".board-m-tab");
      if (!btn) return;
      state.boardMarketMode = btn.dataset.boardMarket || "main";
      marketTabsEl.querySelectorAll(".board-m-tab").forEach((b) => {
        b.classList.toggle("is-active", b === btn);
      });
      updateBoardMarketHeaders();
      refreshHomeAndBoard();
      const leaguesView = document.querySelector('[data-view="leagues"]');
      if (leaguesView && !leaguesView.hidden) renderLeaguePage();
    });
  }

  on($("match-board"), "click", (e) => {
    handleOddClick(e);
    handleOpenFixture(e);
  });

  on($("market-tabs"), "click", (e) => {
    const btn = e.target.closest("[data-mtab]");
    if (!btn) return;
    state.marketTab = btn.dataset.mtab;
    if (state.marketTab === "combo" && state.detailFixtureId) {
      const markets = state.fixtureMarkets[state.detailFixtureId] || [];
      markets.filter((m) => getMarketCategory(m) === "combo").forEach((m) => state.expandedMarkets.add(m.id));
    }
    renderMatchDetail();
  });

  on($("md-collapse-all"), "click", () => {
    if (!state.detailFixtureId) return;
    const markets = state.fixtureMarkets[state.detailFixtureId] || [];
    if (state.expandedMarkets.size) state.expandedMarkets.clear();
    else state.expandedMarkets = new Set(markets.map((m) => m.id));
    renderMatchDetail();
  });

  on($("md-fav-markets"), "click", () => toast("Favourite markets coming soon", "err"));

  on($("market-search"), "input", (e) => {
    state.marketSearch = e.target.value.trim();
    renderMatchDetail();
  });

  on($("match-markets"), "click", (e) => {
    const toggle = e.target.closest("[data-toggle-market]");
    if (toggle) {
      const id = Number(toggle.dataset.toggleMarket);
      if (state.expandedMarkets.has(id)) state.expandedMarkets.delete(id);
      else state.expandedMarkets.add(id);
      renderMatchDetail();
      return;
    }

    const btn = e.target.closest("[data-detail-odd]");
    if (!btn) return;
    const fixtureId = Number(btn.dataset.fixture);
    const fixture = findFixture(fixtureId);
    if (!fixture) return;
    toggleDetailSelection(
      fixture,
      { id: Number(btn.dataset.marketId), name: btn.dataset.marketName },
      { value: btn.dataset.value, odd: btn.dataset.odd }
    );
  });

  on($("btn-back"), "click", (e) => {
    if (state.detailFixtureId) {
      e.preventDefault();
      closeMatchDetail();
    }
  });

  on($("match-back"), "click", closeMatchDetail);
  on($("btn-my-bets-shortcut"), "click", () => applySubNav("my-bets"));

  on($("sub-nav"), "click", (e) => {
    const btn = e.target.closest("[data-subnav]");
    if (!btn) return;
    applySubNav(btn.dataset.subnav);
  });

  document.querySelectorAll(".main-nav-tabs, .top-nav-links").forEach((nav) => {
    on(nav, "click", (e) => {
      const btn = e.target.closest("[data-nav]");
      if (!btn) return;
      const id = btn.dataset.nav;
      if (id === "sport") {
        applySubNav("sports");
        return;
      }
      if (id === "upcoming") {
        applySubNav("upcoming");
        return;
      }
      if (id === "live") {
        applySubNav("inplay");
        return;
      }
      if (id === "special") {
        window.location.href = "../index.html";
      }
    });
  });

  on($("btn-inplay"), "click", () => applySubNav("inplay"));

  on($("my-bets-close"), "click", () => applySubNav("sports"));

  on($("my-bets-status-tabs"), "click", (e) => {
    const btn = e.target.closest("[data-mybets-status]");
    if (!btn) return;
    state.myBetsStatus = btn.dataset.mybetsStatus;
    renderMyBetsPage();
  });

  on($("my-bets-time-tabs"), "click", (e) => {
    const btn = e.target.closest("[data-mybets-time]");
    if (!btn) return;
    state.myBetsTime = btn.dataset.mybetsTime;
    renderMyBetsPage();
  });

  on($("my-bets-search"), "input", (e) => {
    state.myBetsSearch = e.target.value.trim();
    renderMyBetsPage();
  });

  on($("my-bets-search-btn"), "click", () => renderMyBetsPage());

  on($("my-bets-list"), "click", (e) => {
    // Accordion toggle
    const toggleBtn = e.target.closest("[data-toggle-events]");
    if (toggleBtn) {
      const tid = String(toggleBtn.dataset.toggleEvents);
      if (state.expandedMyBetsTickets.has(tid)) {
        state.expandedMyBetsTickets.delete(tid);
      } else {
        state.expandedMyBetsTickets.add(tid);
      }
      renderMyBetsPage();
      return;
    }

    // Add Ticket To Betslip
    const repeatBtn = e.target.closest("[data-repeat-ticket]");
    if (repeatBtn) {
      repeatTicketToSlip(repeatBtn.dataset.repeatTicket);
      return;
    }

    // Cashout
    const cashoutBtn = e.target.closest("[data-cashout-ticket]");
    if (cashoutBtn) {
      const tid = cashoutBtn.dataset.cashoutTicket;
      const t = (state.history || []).find((item) => String(item.id) === String(tid));
      if (cashoutBtn.disabled || cashoutBtn.dataset.locked === "true" || isTicketCashoutLocked(t)) {
        toast("Cashout is currently locked", "err");
        return;
      }
      cashoutTicket(tid);
      return;
    }

    // Print receipt
    const printBtn = e.target.closest("[data-print-ticket]");
    if (printBtn) {
      handleMyBetsPrint(printBtn.dataset.printTicket);
      return;
    }
  });

  document.querySelectorAll(".betslip-tab").forEach((btn) => {
    on(btn, "click", () => setBetslipTab(btn.dataset.btab));
  });

  on($("slip-list"), "click", (e) => {
    const btn = e.target.closest("[data-remove]");
    if (!btn) return;
    state.slip = state.slip.filter((b) => b.key !== btn.dataset.remove);
    save();
    renderSlip();
    refreshHomeAndBoard();
    if (state.detailFixtureId) renderMatchDetail();
  });

  on($("slip-foot"), "click", (e) => {
    if (e.target && (e.target.id === "slip-accept-odds" || e.target.closest("#slip-accept-odds"))) {
      acceptSlipOddsChanges();
    }
  });

  document.querySelectorAll(".betslip-mode-btn").forEach((btn) => {
    on(btn, "click", () => {
      state.slipMode = btn.dataset.mode;
      document.querySelectorAll(".betslip-mode-btn").forEach((b) => b.classList.toggle("is-on", b === btn));
      if (state.slipMode === "single" && state.slip.length > 1) {
        state.slip = [state.slip[state.slip.length - 1]];
        save();
        renderSlip();
        refreshHomeAndBoard();
      }
    });
  });

  on($("stake-input"), "input", (e) => {
    state.stake = Math.max(0, Number(e.target.value) || 0);
    save();
    renderSlip();
  });

  on($("quick-stakes"), "click", (e) => {
    const btn = e.target.closest("[data-stake]");
    if (!btn) return;
    state.stake = Number(btn.dataset.stake);
    save();
    renderSlip();
    renderQuickStakes();
  });

  on($("stake-minus"), "click", () => {
    state.stake = Math.max(MIN_STAKE, state.stake - 10);
    save();
    renderSlip();
    renderQuickStakes();
  });

  on($("stake-plus"), "click", () => {
    state.stake += 10;
    save();
    renderSlip();
    renderQuickStakes();
  });

  on($("btn-balance-toggle"), "click", () => {
    state.balanceHidden = !state.balanceHidden;
    renderBalance();
  });

  on($("event-search"), "input", (e) => {
    state.eventSearch = e.target.value.trim();
    const leaguesView = document.querySelector('[data-view="leagues"]');
    if (leaguesView && !leaguesView.hidden) renderLeaguePage();
    else if (!state.sportsMenuMode) refreshHomeAndBoard();
  });

  on($("ad-prev"), "click", () => {
    if (!state.adSlides.length) return;
    state.adIndex = (state.adIndex - 1 + state.adSlides.length) % state.adSlides.length;
    updateAdCarousel();
  });

  on($("ad-next"), "click", () => {
    if (!state.adSlides.length) return;
    state.adIndex = (state.adIndex + 1) % state.adSlides.length;
    updateAdCarousel();
  });

  on($("top-matches-prev"), "click", () => {
    const el = $("popular-carousel");
    if (el) el.scrollBy({ left: -310, behavior: "smooth" });
  });

  on($("top-matches-next"), "click", () => {
    const el = $("popular-carousel");
    if (el) el.scrollBy({ left: 310, behavior: "smooth" });
  });

  on($("ad-carousel-dots"), "click", (e) => {
    const dot = e.target.closest("[data-dot]");
    if (!dot) return;
    state.adIndex = Number(dot.dataset.dot);
    updateAdCarousel();
  });

  on($("top-leagues-grid"), "click", (e) => {
    const card = e.target.closest("[data-top-league]");
    if (!card) return;
    const leagueId = Number(card.dataset.topLeague);
    state.homeSelectedLeague = leagueId;
    state.homeLeagueLimit = 5;
    renderTopLeaguesGrid();
    renderHomeLeagueMatches();
  });

  on($("sports-home-wrap"), "click", (e) => {
    const toggleBtn = e.target.closest("[data-hmt-toggle]");
    if (toggleBtn) {
      const type = toggleBtn.dataset.hmtToggle;
      if (type === "league") {
        state.homeLeagueLimit = state.homeLeagueLimit === 5 ? 50 : 5;
        renderHomeLeagueMatches();
      } else if (type === "upcoming") {
        state.homeUpcomingLimit = state.homeUpcomingLimit === 5 ? 50 : 5;
        renderHomeUpcomingGames();
      } else if (type === "popular") {
        state.homePopularLimit = state.homePopularLimit === 5 ? 50 : 5;
        renderHomePopularGames();
      }
      return;
    }
    handleOddClick(e);
    handleOpenFixture(e);
  });

  on($("sports-menu-back"), "click", closeSportsMenu);

  on($("football-regions"), "click", async (e) => {
    const openLeague = e.target.closest("[data-open-league]");
    if (openLeague) {
      openLeaguePage([Number(openLeague.dataset.openLeague)]);
      return;
    }
    const toggle = e.target.closest("[data-toggle-football-region]");
    if (toggle) await toggleFootballRegion(toggle.dataset.toggleFootballRegion);
  });

  on($("football-regions"), "change", (e) => {
    const check = e.target;
    if (!check.matches("[data-football-league]")) return;
    onFootballLeagueToggle(Number(check.dataset.footballLeague), check.checked);
  });

  on($("btn-open-selected-leagues"), "click", () => {
    if (!state.checkedLeagueIds.size) {
      toast("Mark at least one league first", "err");
      return;
    }
    openLeaguePage([...state.checkedLeagueIds]);
  });

  on($("football-filters-btn"), "click", () => toggleFootballFilters());
  on($("league-filters-btn"), "click", () => toggleFootballFilters());

  document.querySelectorAll("[data-filters-collapse]").forEach((btn) => {
    on(btn, "click", () => toggleFootballFilters(false));
  });

  on($("football-time-slider"), "input", (e) => setFootballTimeFilterByIndex(Number(e.target.value)));
  on($("league-time-slider"), "input", (e) => setFootballTimeFilterByIndex(Number(e.target.value)));

  on(document, "click", (e) => {
    const label = e.target.closest("[data-football-time-index]");
    if (!label) return;
    setFootballTimeFilterByIndex(Number(label.dataset.footballTimeIndex));
  });

  on($("leagues-back"), "click", closeLeaguePage);

  on($("league-page-board"), "click", (e) => {
    handleOddClick(e);
    handleOpenFixture(e);
  });

  on($("btn-share-slip"), "click", openShareModal);
  on($("share-modal-close"), "click", closeShareModal);
  on($("share-continue-btn"), "click", closeShareModal);
  on($("share-modal-backdrop"), "click", closeShareModal);

  on($("share-copy-code"), "click", () => {
    const code = state.currentBookingCode || "";
    if (!code) return;
    navigator.clipboard?.writeText(code);
    toast(`Booking code *${code}* copied!`, "ok");
  });

  on($("share-copy-link"), "click", () => {
    const code = state.currentBookingCode || "";
    const shareUrl = `${window.location.origin}${window.location.pathname}?booked=${code}`;
    navigator.clipboard?.writeText(shareUrl);
    toast(`Booking link copied!`, "ok");
  });

  on($("share-social-wa"), "click", () => {
    const code = state.currentBookingCode || "";
    const totalOddsVal = (totalOdds() || 1).toFixed(2);
    const text = `Hope Bet Booking Code: *${code}*\nOdds: ${totalOddsVal}\nLoad bet: ${window.location.origin}${window.location.pathname}?booked=${code}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
  });

  on($("share-social-fb"), "click", () => {
    const code = state.currentBookingCode || "";
    const url = `${window.location.origin}${window.location.pathname}?booked=${code}`;
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, "_blank");
  });

  on($("share-social-x"), "click", () => {
    const code = state.currentBookingCode || "";
    const totalOddsVal = (totalOdds() || 1).toFixed(2);
    const text = `Check out my Hope Bet slip! Booking code: *${code}* (${totalOddsVal} odds)`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, "_blank");
  });

  on($("share-social-tg"), "click", () => {
    const code = state.currentBookingCode || "";
    const url = `${window.location.origin}${window.location.pathname}?booked=${code}`;
    const text = `Hope Bet Booking Code: *${code}*`;
    window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, "_blank");
  });

  on($("share-repeat-bet"), "click", () => {
    toast("Selections active in your betslip", "ok");
    closeShareModal();
  });

  on($("share-print-ticket"), "click", () => {
    closeShareModal();
    printTicketReceipt();
  });

  // Load booked bet from betslip tool or check-bet page
  document.querySelectorAll('[data-load="booked"]').forEach((btn) => {
    on(btn, "click", () => {
      if (btn.classList.contains("betslip-load-booked-bar")) {
        const input = $("load-booked-code");
        const val = input?.value.trim() || "";
        if (val.length === 5) {
          loadBookedBetByCode(val);
        } else {
          input?.scrollIntoView({ behavior: "smooth", block: "center" });
          input?.focus();
        }
        return;
      }
      const val = $("load-booked-code")?.value || $("page-load-booked-code")?.value || "";
      loadBookedBetByCode(val);
    });
  });

  on($("load-booked-code"), "keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      loadBookedBetByCode(e.target.value);
    }
  });

  on($("page-load-booked-code"), "keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      loadBookedBetByCode(e.target.value);
    }
  });

  document.querySelectorAll(".check-it-link").forEach((link) => {
    on(link, "click", (e) => {
      e.preventDefault();
      const input = $("load-booked-code");
      input?.scrollIntoView({ behavior: "smooth", block: "center" });
      input?.focus();
    });
  });

  document.querySelectorAll("[data-focus-check]").forEach((btn) => {
    on(btn, "click", () => {
      const el = $("page-check-bet-id") || $("check-bet-focus");
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
      $("page-check-bet-id")?.focus();
    });
  });

  on($("btn-place"), "click", placeBet);

  on($("btn-clear-slip"), "click", () => {
    state.slip = [];
    save();
    renderSlip();
    refreshHomeAndBoard();
  });

  on($("btn-join"), "click", () => {
    if (state.sessionUser) {
      if (useApi()) api().clearSession();
      state.sessionUser = null;
      if (!useApi()) {
        /* keep demo balance on sign-out of local session */
      } else {
        state.balance = 0;
        state.history = [];
      }
      renderSession();
      renderBalance();
      refreshMyBetsIfVisible();
      toast("Signed out", "ok");
      return;
    }
    openAuthModal("login");
  });

  on($("header-help"), "click", () => toast("Password reset coming soon", "ok"));
  on($("header-register-btn"), "click", () => openAuthModal("register"));
  on($("header-login-btn"), "click", async () => {
    const phoneRaw = $("header-login-phone")?.value.trim();
    const password = $("header-login-password")?.value;
    if (!phoneRaw || !password) {
      openAuthModal("login");
      return;
    }
    if (!useApi()) {
      state.sessionUser = {
        displayName: formatAuthPhone(phoneRaw),
        email: phoneToAccountEmail(phoneRaw),
      };
      renderSession();
      renderBalance();
      toast("Signed in (demo)", "ok");
      return;
    }
    const identifier = phoneToAccountEmail(phoneRaw);
    try {
      const data = await api().login({ identifier, password });
      state.sessionUser = data.user;
      toast("Signed in", "ok");
      await syncFromApi();
      renderSession();
    } catch (err) {
      toast(err.message || "Login failed", "err");
    }
  });
  on($("header-login-password"), "keydown", (e) => {
    if (e.key === "Enter") $("header-login-btn")?.click();
  });

  document.querySelectorAll("[data-auth-tab]").forEach((btn) => {
    on(btn, "click", () => openAuthModal(btn.dataset.authTab));
  });

  document.querySelectorAll("[data-toggle-pass]").forEach((btn) => {
    on(btn, "click", () => {
      const input = $(btn.dataset.togglePass);
      if (!input) return;
      const show = input.type === "password";
      input.type = show ? "text" : "password";
      btn.textContent = show ? "🙈" : "👁";
      btn.setAttribute("aria-label", show ? "Hide password" : "Show password");
    });
  });

  on($("auth-forgot"), "click", () => toast("Password reset coming soon", "ok"));
  on($("auth-support"), "click", () => toast("Support coming soon", "ok"));

  on($("auth-close"), "click", closeAuthModal);
  on($("auth-modal"), "click", (e) => {
    if (e.target === $("auth-modal")) closeAuthModal();
  });

  on($("auth-form"), "submit", async (e) => {
    e.preventDefault();
    if (!useApi()) {
      toast("Connect to the live API to sign in", "err");
      return;
    }
    const phoneRaw = $("auth-phone")?.value.trim();
    const password = $("auth-password")?.value;
    const password2 = $("auth-password2")?.value;
    if (!phoneRaw) {
      toast("Enter your phone number", "err");
      return;
    }
    if (!/[a-zA-Z]/.test(phoneRaw)) {
      const digits = phoneRaw.replace(/\D/g, "");
      if (digits.replace(/^251/, "").replace(/^0/, "").length < 9) {
        toast("Enter a valid Ethiopian phone number or username", "err");
        return;
      }
    }
    if (state.authTab === "register") {
      if (password !== password2) {
        toast("Passwords do not match", "err");
        return;
      }
      if (!$("auth-age")?.checked) {
        toast("Confirm that you are over 18", "err");
        return;
      }
      if (!$("auth-terms")?.checked) {
        toast("Agree to the terms to continue", "err");
        return;
      }
    }
    const identifier = phoneToAccountEmail(phoneRaw);
    const phone = /[a-zA-Z]/.test(phoneRaw) ? null : formatAuthPhone(phoneRaw);
    const submitBtn = $("auth-submit");
    if (!submitBtn) return;
    const prevLabel = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = "Please wait…";
    try {
      if (state.authTab === "register") {
        const role = $("auth-role") ? $("auth-role").value : "player";
        const email = identifier;
        const data = await api().register({ identifier, email, password, phone, role });
        state.sessionUser = data.user;
        toast(`Welcome! +${data.welcomeBonus || 0} ${CURRENCY} bonus`, "ok");
      } else {
        const data = await api().login({ identifier, password });
        state.sessionUser = data.user;
        toast("Signed in", "ok");
      }
      closeAuthModal();
      await syncFromApi();
    } catch (err) {
      toast(err.message || "Authentication failed", "err");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = prevLabel;
    }
  });

  on($("btn-deposit"), "click", () => openAccountModal("payments"));
  on($("account-modal-close"), "click", closeDepositModal);
  on($("account-modal"), "click", (e) => {
    if (e.target === $("account-modal")) closeDepositModal();
  });
  // Account nav items
  document.querySelectorAll(".acct-nav-item").forEach((btn) => {
    btn.addEventListener("click", () => {
      const section = btn.dataset.acctSection;
      switchAcctSection(section);
      if (section === "payments") {
        switchPaymentsTab("deposit");
        if (state.depositMethods) renderDepositMethodCards(state.depositMethods, state.minDeposit);
      }
    });
  });
  // Payments tab bar (inside section)
  document.querySelectorAll(".payments-tab").forEach((btn) => {
    btn.addEventListener("click", () => switchPaymentsTab(btn.dataset.paymentsTab));
  });
  // Deposit form back button
  on($("deposit-form-back"), "click", closeDepositFormPanel);
  // Deposit form submit
  on($("deposit-form"), "submit", async (e) => {
    e.preventDefault();
    if (!useApi() || !api().getToken()) return;
    const submitBtn = $("deposit-submit");
    const prevLabel = submitBtn?.textContent;
    if (submitBtn) submitBtn.textContent = "Submitting…";
    try {
      const payload = {
        method: $("deposit-method").value,
        amount: Number($("deposit-amount").value),
        reference: $("deposit-reference").value.trim(),
      };
      await api().requestDeposit(payload);
      toast("Deposit request submitted — pending approval", "ok");
      if ($("deposit-reference")) $("deposit-reference").value = "";
      if ($("deposit-amount")) $("deposit-amount").value = "";
      closeDepositFormPanel();
      try {
        const hist = await api().fetchDepositHistory();
        state.depositHistory = hist.deposits || [];
        renderDepositHistory(state.depositHistory);
      } catch (_) {}
    } catch (err) {
      toast(err.message || "Deposit request failed", "err");
    } finally {
      if (submitBtn) submitBtn.textContent = prevLabel;
    }
  });
  // account-deposit from mobile drawer
  on($("account-deposit"), "click", () => openAccountModal("payments"));
  // Header top nav circle buttons and balance boxes
  on($("nav-btn-history"), "click", () => openAccountModal("bet-history"));
  on($("nav-btn-bonuses"), "click", () => openAccountModal("bonuses"));
  on($("nav-btn-jackpots"), "click", () => openAccountModal("jackpots"));
  on($("nav-btn-vip"), "click", () => openAccountModal("profile"));
  on($("nav-user-avatar"), "click", () => openAccountModal("profile"));
  on($("nav-real-balance-box"), "click", () => openAccountModal("payments"));
  on($("nav-bonus-balance-box"), "click", () => openAccountModal("bonuses"));
  // Bet history filters
  on($("btn-apply-bet-filters"), "click", renderBetHistorySection);
  on($("bet-history-period"), "change", renderBetHistorySection);
  on($("bet-history-type"), "change", renderBetHistorySection);
  // Password change form
  on($("profile-password-form"), "submit", (e) => {
    e.preventDefault();
    const cur = $("profile-current-pass")?.value;
    const p1 = $("profile-new-pass")?.value;
    const p2 = $("profile-confirm-pass")?.value;
    if (!cur) {
      toast("Please enter your current password", "err");
      return;
    }
    if (p1 !== p2) {
      toast("New passwords do not match", "err");
      return;
    }
    toast("Password updated successfully", "ok");
    $("profile-password-form")?.reset();
    switchProfileTab("details");
    const inner = $("acct-header-inner");
    if (inner) {
      inner.querySelectorAll(".acct-subtab-btn").forEach((b) => {
        b.classList.toggle("is-active", b.dataset.profileTab === "details");
      });
    }
  });
  // Bet success screen action buttons
  on($("btn-continue-bet"), "click", () => {
    state.betPlacedSuccessTicket = null;
    renderSlip();
  });

  on($("btn-repeat-bet"), "click", () => {
    if (state.betPlacedSuccessTicket?.bets?.length) {
      state.slip = state.betPlacedSuccessTicket.bets.map((b) => ({ ...b }));
      state.stake = state.betPlacedSuccessTicket.stake || MIN_STAKE;
    }
    state.betPlacedSuccessTicket = null;
    renderSlip();
    save();
  });

  on($("btn-print-ticket"), "click", () => {
    printTicketReceipt(state.betPlacedSuccessTicket || state.history[0]);
  });
}

function simulateLiveOddsFluctuations() {
  const liveList = (state.liveFixtures && state.liveFixtures.length)
    ? state.liveFixtures
    : state.fixtures.filter(isLiveFixture);
  if (!liveList.length) return;

  const count = Math.min(liveList.length, 2);
  let changed = false;

  for (let i = 0; i < count; i++) {
    const f = liveList[Math.floor(Math.random() * liveList.length)];
    if (!f || !f.odds) continue;

    const fields = ["home", "draw", "away"];
    const field = fields[Math.floor(Math.random() * fields.length)];
    let current = parseFloat(f.odds[field]);
    if (isNaN(current) || current <= 1.05) continue;

    const shifts = [0.02, 0.04, 0.05, -0.02, -0.04, -0.05];
    const delta = shifts[Math.floor(Math.random() * shifts.length)];
    let next = Number((current + delta).toFixed(2));
    if (next < 1.08) next = 1.08;
    if (next > 45.0) next = 45.0;
    if (next !== current) {
      f.odds[field] = next;
      changed = true;
    }
  }

  // Also if match detail is open, randomly fluctuate 1 unlocked odd
  if (state.detailFixtureId) {
    const markets = state.fixtureMarkets[state.detailFixtureId];
    if (markets && markets.length) {
      const openMarkets = markets.filter((m) => !m.isLocked && m.values && m.values.length);
      if (openMarkets.length) {
        const m = openMarkets[Math.floor(Math.random() * openMarkets.length)];
        const unlockedVals = m.values.filter((v) => !v.locked);
        if (unlockedVals.length) {
          const v = unlockedVals[Math.floor(Math.random() * unlockedVals.length)];
          let cur = parseFloat(v.odd);
          if (!isNaN(cur) && cur > 1.05) {
            const shifts = [0.03, 0.05, 0.08, -0.03, -0.05, -0.08];
            const delta = shifts[Math.floor(Math.random() * shifts.length)];
            let next = Number((cur + delta).toFixed(2));
            if (next < 1.08) next = 1.08;
            if (next !== cur) {
              v.odd = next;
              renderMatchDetail();
            }
          }
        }
      }
    }
  }

  if (changed) {
    refreshHomeAndBoard();
  }
  if (state.slip && state.slip.length) {
    renderSlip();
  }
}

function init() {
  try {
    load();
    state.fixtures = buildMockFixtures();
    state.sidebar = buildMockSidebar();
    bindEvents();
    closeLeagueDropdown();
    updateSportsMenuUI();
    updateSubNavHighlight();
    renderSession();
    renderAll();
    renderFootballFilters();
    initAdvertCarousel();
    loadFixtures();
    if (window.location.protocol !== "file:") {
      syncFromApi();
      fetchSidebar().then(() => {
        renderSidebar();
        renderTopLeaguesGrid();
        refreshHomeAndBoard();
      });
    }
    const bookedParam = new URLSearchParams(window.location.search).get("booked");
    if (bookedParam && bookedParam.length === 5) {
      setTimeout(() => loadBookedBetByCode(bookedParam), 300);
    }
    setInterval(updateCountdowns, 1000);
    // Periodically update live in-play matches and scores
    setInterval(async () => {
      if (window.location.protocol !== "file:") {
        try {
          const inplayLive = await fetchInPlayLiveFixtures();
          if (inplayLive && inplayLive.length) {
            state.liveFixtures = inplayLive;
            if (state.subNav === "inplay") refreshHomeAndBoard();
          }
        } catch (_) {}
      }
    }, 30000);
    setInterval(simulateLiveOddsFluctuations, 4000);
    setInterval(() => {
      if (state.adSlides.length > 1) {
        state.adIndex = (state.adIndex + 1) % state.adSlides.length;
        updateAdCarousel();
      }
    }, 6000);
  } catch (err) {
    showBootError(err);
  }
}

window.addEventListener("error", (e) => {
  toast("Application error", "err");
});

// --- SUPER ADMIN LOGIC ---
async function superAdminCall(path, options = {}) {
  const token = (api() && typeof api().getToken === "function") 
    ? api().getToken() 
    : (localStorage.getItem("hope-bet-token") || "");
  const baseUrl = (api() && typeof api().apiUrl === "function") 
    ? api().apiUrl() 
    : (window.HOPE_BET_CONFIG?.API_URL || "http://127.0.0.1:8787");

  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${baseUrl.replace(/\/$/, "")}${path}`, { ...options, headers });
  let data = {};
  try {
    data = await res.json();
  } catch {
    data = { ok: false, error: "Invalid server response" };
  }
  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  return data;
}

async function loadSuperAdminUsers() {
  try {
    let data;
    if (api() && typeof api().superAdminGetUsers === "function") {
      data = await api().superAdminGetUsers();
    } else {
      data = await superAdminCall("/api/super/users");
    }
    const tbody = $("sa-users-table");
    if (!tbody) return;
    tbody.innerHTML = (data.users || []).map(u => `
      <tr style="border-bottom: 1px solid var(--border-color);">
        <td style="padding: 0.75rem;">${u.id}</td>
        <td style="padding: 0.75rem;">${u.username || u.email}</td>
        <td style="padding: 0.75rem;"><span style="background: ${u.role === 'super_admin' ? 'gold' : (u.role === 'admin' ? 'var(--primary)' : 'var(--surface)')}; color: #fff; padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.8rem;">${u.role}</span></td>
        <td style="padding: 0.75rem; color: var(--text-color); font-weight: bold;">${u.balance} ETB</td>
        <td style="padding: 0.75rem;">
          <input type="number" id="topup-val-${u.id}" value="0" style="width: 90px; padding: 0.4rem; background: var(--input-bg); color: var(--text-color); border: 1px solid var(--border-color); border-radius: 4px;" />
        </td>
        <td style="padding: 0.75rem;">
          <button type="button" class="auth-btn" style="padding: 0.4rem 0.75rem; width: auto;" onclick="superAdminTopUpAction(${u.id})">Top Up</button>
        </td>
      </tr>
    `).join("");
  } catch (err) {
    toast(err.message || "Failed to load users", "err");
  }
}

window.superAdminTopUpAction = async function (userId) {
  const input = $(`topup-val-${userId}`);
  const amount = Number(input ? input.value : 0);
  if (!amount || amount <= 0) return toast("Enter valid topup amount", "err");
  try {
    let res;
    if (api() && typeof api().superAdminTopUp === "function") {
      res = await api().superAdminTopUp(userId, amount);
    } else {
      res = await superAdminCall(`/api/super/users/${encodeURIComponent(userId)}/topup`, {
        method: "POST",
        body: JSON.stringify({ amount }),
      });
    }
    toast(`Topped up ${res.amount} ETB successfully`, "ok");
    loadSuperAdminUsers();
  } catch (err) {
    toast(err.message || "Top up failed", "err");
  }
};

function bindSuperAdminEvents() {
  const refreshBtn = $("sa-refresh-btn");
  if (refreshBtn) on(refreshBtn, "click", loadSuperAdminUsers);

  const createForm = $("sa-create-form");
  if (createForm) {
    on(createForm, "submit", async (e) => {
      e.preventDefault();
      const username = $("sa-new-username")?.value.trim();
      const password = $("sa-new-password")?.value;
      const role = $("sa-new-role")?.value;
      if (!username || !password) return toast("Username and password required", "err");
      try {
        if (api() && typeof api().superAdminCreateUser === "function") {
          await api().superAdminCreateUser({ username, password, role });
        } else {
          await superAdminCall("/api/super/users", {
            method: "POST",
            body: JSON.stringify({ username, password, role }),
          });
        }
        toast(`User ${username} created as ${role}`, "ok");
        createForm.reset();
        loadSuperAdminUsers();
      } catch (err) {
        toast(err.message || "Failed to create user", "err");
      }
    });
  }
}

document.addEventListener("DOMContentLoaded", init);
