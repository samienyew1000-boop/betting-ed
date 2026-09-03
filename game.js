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
  { id: "football", name: "Football", icon: "⚽" },
  { id: "basketball", name: "Basketball", icon: "🏀" },
  { id: "tennis", name: "Tennis", icon: "🎾" },
  { id: "hockey", name: "Ice Hockey", icon: "🏒" },
  { id: "volleyball", name: "Volleyball", icon: "🏐" },
  { id: "rugby", name: "Rugby Union", icon: "🏉" },
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
  } catch (_) {}
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
  const base = [
    {
      fixtureId: 1001,
      hours: 2,
      league: { id: 39, name: "Premier League", country: "England", logo: "https://media.api-sports.io/football/leagues/39.png", flag: "https://media.api-sports.io/flags/gb-eng.svg" },
      home: { id: 33, name: "Manchester United", logo: "https://media.api-sports.io/football/teams/33.png" },
      away: { id: 40, name: "Liverpool", logo: "https://media.api-sports.io/football/teams/40.png" },
      odds: { home: "2.45", draw: "3.40", away: "2.80", doubleChance: { homeDraw: "1.42", homeAway: "1.30", drawAway: "1.55" }, totals: { over25: "1.82", under25: "1.98" } },
    },
    {
      fixtureId: 1002,
      hours: 4,
      league: { id: 39, name: "Premier League", country: "England", logo: "https://media.api-sports.io/football/leagues/39.png", flag: "https://media.api-sports.io/flags/gb-eng.svg" },
      home: { id: 49, name: "Chelsea", logo: "https://media.api-sports.io/football/teams/49.png" },
      away: { id: 42, name: "Arsenal", logo: "https://media.api-sports.io/football/teams/42.png" },
      odds: { home: "2.90", draw: "3.25", away: "2.50", doubleChance: { homeDraw: "1.52", homeAway: "1.35", drawAway: "1.42" }, totals: { over25: "1.75", under25: "2.05" } },
    },
    {
      fixtureId: 1003,
      hours: 5,
      league: { id: 140, name: "La Liga", country: "Spain", logo: "https://media.api-sports.io/football/leagues/140.png", flag: "https://media.api-sports.io/flags/es.svg" },
      home: { id: 541, name: "Real Madrid", logo: "https://media.api-sports.io/football/teams/541.png" },
      away: { id: 529, name: "Barcelona", logo: "https://media.api-sports.io/football/teams/529.png" },
      odds: { home: "2.20", draw: "3.50", away: "3.10", doubleChance: { homeDraw: "1.35", homeAway: "1.28", drawAway: "1.65" }, totals: { over25: "1.65", under25: "2.20" } },
    },
    {
      fixtureId: 1004,
      hours: 8,
      league: { id: 140, name: "La Liga", country: "Spain", logo: "https://media.api-sports.io/football/leagues/140.png", flag: "https://media.api-sports.io/flags/es.svg" },
      home: { id: 530, name: "Atletico Madrid", logo: "https://media.api-sports.io/football/teams/530.png" },
      away: { id: 548, name: "Sevilla", logo: "https://media.api-sports.io/football/teams/548.png" },
      odds: { home: "1.85", draw: "3.60", away: "4.20", doubleChance: { homeDraw: "1.22", homeAway: "1.25", drawAway: "1.90" }, totals: { over25: "2.10", under25: "1.72" } },
    },
    {
      fixtureId: 1005,
      hours: 10,
      league: { id: 78, name: "Bundesliga", country: "Germany", logo: "https://media.api-sports.io/football/leagues/78.png", flag: "https://media.api-sports.io/flags/de.svg" },
      home: { id: 157, name: "Bayern Munich", logo: "https://media.api-sports.io/football/teams/157.png" },
      away: { id: 165, name: "Borussia Dortmund", logo: "https://media.api-sports.io/football/teams/165.png" },
      odds: { home: "1.75", draw: "3.80", away: "4.50", doubleChance: { homeDraw: "1.18", homeAway: "1.22", drawAway: "2.05" }, totals: { over25: "1.55", under25: "2.40" } },
    },
    {
      fixtureId: 1006,
      hours: 14,
      league: { id: 78, name: "Bundesliga", country: "Germany", logo: "https://media.api-sports.io/football/leagues/78.png", flag: "https://media.api-sports.io/flags/de.svg" },
      home: { id: 173, name: "RB Leipzig", logo: "https://media.api-sports.io/football/teams/173.png" },
      away: { id: 169, name: "Bayer Leverkusen", logo: "https://media.api-sports.io/football/teams/169.png" },
      odds: { home: "2.30", draw: "3.40", away: "3.00", doubleChance: { homeDraw: "1.38", homeAway: "1.32", drawAway: "1.58" }, totals: { over25: "1.70", under25: "2.10" } },
    },
    {
      fixtureId: 1007,
      hours: 18,
      league: { id: 135, name: "Serie A", country: "Italy", logo: "https://media.api-sports.io/football/leagues/135.png", flag: "https://media.api-sports.io/flags/it.svg" },
      home: { id: 489, name: "AC Milan", logo: "https://media.api-sports.io/football/teams/489.png" },
      away: { id: 505, name: "Inter", logo: "https://media.api-sports.io/football/teams/505.png" },
      odds: { home: "2.60", draw: "3.20", away: "2.70", doubleChance: { homeDraw: "1.45", homeAway: "1.33", drawAway: "1.48" }, totals: { over25: "1.88", under25: "1.92" } },
    },
    {
      fixtureId: 1008,
      hours: 22,
      league: { id: 135, name: "Serie A", country: "Italy", logo: "https://media.api-sports.io/football/leagues/135.png", flag: "https://media.api-sports.io/flags/it.svg" },
      home: { id: 496, name: "Juventus", logo: "https://media.api-sports.io/football/teams/496.png" },
      away: { id: 487, name: "Napoli", logo: "https://media.api-sports.io/football/teams/487.png" },
      odds: { home: "2.10", draw: "3.30", away: "3.40", doubleChance: { homeDraw: "1.32", homeAway: "1.30", drawAway: "1.68" }, totals: { over25: "1.95", under25: "1.85" } },
    },
    {
      fixtureId: 1009,
      hours: 26,
      league: { id: 61, name: "Ligue 1", country: "France", logo: "https://media.api-sports.io/football/leagues/61.png", flag: "https://media.api-sports.io/flags/fr.svg" },
      home: { id: 85, name: "PSG", logo: "https://media.api-sports.io/football/teams/85.png" },
      away: { id: 81, name: "Marseille", logo: "https://media.api-sports.io/football/teams/81.png" },
      odds: { home: "1.55", draw: "4.20", away: "5.50", doubleChance: { homeDraw: "1.14", homeAway: "1.18", drawAway: "2.35" }, totals: { over25: "1.60", under25: "2.30" } },
    },
    {
      fixtureId: 1010,
      hours: 30,
      league: { id: 88, name: "Eredivisie", country: "Netherlands", logo: "https://media.api-sports.io/football/leagues/88.png", flag: "https://media.api-sports.io/flags/nl.svg" },
      home: { id: 194, name: "Ajax", logo: "https://media.api-sports.io/football/teams/194.png" },
      away: { id: 197, name: "PSV", logo: "https://media.api-sports.io/football/teams/197.png" },
      odds: { home: "2.40", draw: "3.50", away: "2.75", doubleChance: { homeDraw: "1.42", homeAway: "1.30", drawAway: "1.55" }, totals: { over25: "1.68", under25: "2.15" } },
    },
    {
      fixtureId: 1011,
      hours: 36,
      league: { id: 39, name: "Premier League", country: "England", logo: "https://media.api-sports.io/football/leagues/39.png", flag: "https://media.api-sports.io/flags/gb-eng.svg" },
      home: { id: 50, name: "Manchester City", logo: "https://media.api-sports.io/football/teams/50.png" },
      away: { id: 47, name: "Tottenham", logo: "https://media.api-sports.io/football/teams/47.png" },
      odds: { home: "1.65", draw: "3.90", away: "5.00", doubleChance: { homeDraw: "1.16", homeAway: "1.20", drawAway: "2.20" }, totals: { over25: "1.58", under25: "2.35" } },
    },
    {
      fixtureId: 1012,
      hours: 48,
      league: { id: 140, name: "La Liga", country: "Spain", logo: "https://media.api-sports.io/football/leagues/140.png", flag: "https://media.api-sports.io/flags/es.svg" },
      home: { id: 532, name: "Valencia", logo: "https://media.api-sports.io/football/teams/532.png" },
      away: { id: 543, name: "Real Betis", logo: "https://media.api-sports.io/football/teams/543.png" },
      odds: { home: "2.55", draw: "3.15", away: "2.85", doubleChance: { homeDraw: "1.40", homeAway: "1.34", drawAway: "1.50" }, totals: { over25: "1.90", under25: "1.90" } },
    },
    {
      fixtureId: 1013,
      hours: -0.5,
      live: true,
      league: { id: 39, name: "Premier League", country: "England", logo: "https://media.api-sports.io/football/leagues/39.png", flag: "https://media.api-sports.io/flags/gb-eng.svg" },
      home: { id: 34, name: "Newcastle", logo: "https://media.api-sports.io/football/teams/34.png" },
      away: { id: 66, name: "Aston Villa", logo: "https://media.api-sports.io/football/teams/66.png" },
      odds: { home: "2.10", draw: "3.40", away: "3.30", doubleChance: { homeDraw: "1.32", homeAway: "1.30", drawAway: "1.68" }, totals: { over25: "1.88", under25: "1.92" } },
    },
    {
      fixtureId: 1014,
      hours: -1.2,
      live: true,
      league: { id: 78, name: "Bundesliga", country: "Germany", logo: "https://media.api-sports.io/football/leagues/78.png", flag: "https://media.api-sports.io/flags/de.svg" },
      home: { id: 161, name: "Wolfsburg", logo: "https://media.api-sports.io/football/teams/161.png" },
      away: { id: 162, name: "Werder Bremen", logo: "https://media.api-sports.io/football/teams/162.png" },
      odds: { home: "2.35", draw: "3.30", away: "2.95", doubleChance: { homeDraw: "1.38", homeAway: "1.32", drawAway: "1.58" }, totals: { over25: "1.72", under25: "2.08" } },
    },
  ];

  return base.map((m) => ({
    fixtureId: m.fixtureId,
    date: hoursFromNow(m.hours).toISOString(),
    status: m.live ? "LIVE" : "NS",
    league: m.league,
    home: m.home,
    away: m.away,
    odds: m.odds,
    marketCount: 83,
  }));
}

function buildMockSidebar() {
  const leagues = [
    { id: 39, name: "Premier League", logo: "https://media.api-sports.io/football/leagues/39.png", count: 20 },
    { id: 140, name: "La Liga", logo: "https://media.api-sports.io/football/leagues/140.png", count: 15 },
    { id: 61, name: "Ligue 1", logo: "https://media.api-sports.io/football/leagues/61.png", count: 5 },
    { id: 88, name: "Eredivisie", logo: "https://media.api-sports.io/football/leagues/88.png", count: 11 },
    { id: 78, name: "Bundesliga", logo: "https://media.api-sports.io/football/leagues/78.png", count: 14 },
    { id: 135, name: "Serie A", logo: "https://media.api-sports.io/football/leagues/135.png", count: 20 },
    { id: 40, name: "Championship", logo: "https://media.api-sports.io/football/leagues/40.png", count: 20 },
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

function normalizeApiFixture(row) {
  const dc = row.odds?.doubleChance || {};
  const totals = row.odds?.totals || {};
  return {
    fixtureId: row.fixture?.id || row.fixtureId,
    date: row.fixture?.date || row.date,
    status: row.fixture?.status?.short || "NS",
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
    odds: {
      home: row.odds?.home || "—",
      draw: row.odds?.draw || "—",
      away: row.odds?.away || "—",
      doubleChance: {
        homeDraw: dc.homeDraw || row.odds?.doubleChance?.homeDraw || "—",
        homeAway: dc.homeAway || row.odds?.doubleChance?.homeAway || "—",
        drawAway: dc.drawAway || row.odds?.doubleChance?.drawAway || "—",
      },
      totals: {
        over25: totals.over25 || row.odds?.over25 || "—",
        under25: totals.under25 || row.odds?.under25 || "—",
      },
    },
    markets: row.markets || [],
    meta: row.meta || null,
    marketCount: row.meta?.marketCount || row.marketCount || (row.markets?.length ? row.markets.length + 70 : 83),
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
  if (Array.isArray(data.fixtures) && data.fixtures.length) return data.fixtures;
  if (data.leagueBoards) {
    const rows = [];
    for (const board of Object.values(data.leagueBoards)) {
      if (Array.isArray(board.fixtures)) rows.push(...board.fixtures);
    }
    return rows;
  }
  return [];
}

async function fetchLiveFixtures() {
  const topLeagues = "39-140-61-88-78-135-40";
  const urls = [];

  // Prefer top-league prematch for the home board, then full upcoming.
  if (useApi()) {
    const base = api().apiUrl();
    urls.push(
      `${base}/api/odds/fixtures/prematch?leagues=${topLeagues}`,
      `${base}/api/odds/fixtures/upcoming`
    );
  }

  // Public sportsbook feed fallback (same fixture shape).
  urls.push(
    `${API_BASE}/football/board/prematch?bookmaker=${BOOKMAKER}&leagues=${topLeagues}`,
    `${API_BASE}/football/board/upcoming?bookmaker=${BOOKMAKER}`
  );

  for (const url of urls) {
    const data = await fetchJson(url);
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
  let live = null;

  if (window.location.protocol !== "file:") {
    live = await fetchLiveFixtures();
    if (live && live.length) {
      state.fixtures = live;
      state.liveSource = true;
    }
  }

  if (!state.fixtures.length) state.fixtures = mockFixtures;
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
    } catch (_) {}
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
  } catch (_) {}

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
  const h = parseFloat(fixture.odds.home) || 2.0;
  const d = parseFloat(fixture.odds.draw) || 3.2;
  const a = parseFloat(fixture.odds.away) || 3.5;
  const dc = fixture.odds.doubleChance || {};
  const o25 = fixture.odds.totals?.over25 || "1.85";
  const u25 = fixture.odds.totals?.under25 || "1.95";

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
      id: 10,
      name: "Both Teams To Score",
      values: [
        { value: "Yes", odd: "1.55", handicap: null },
        { value: "No", odd: "2.30", handicap: null },
      ],
    },
    {
      id: 11,
      name: "Draw No Bet",
      values: [
        { value: "Home", odd: (h * 1.62).toFixed(2), handicap: null },
        { value: "Away", odd: (a * 0.78).toFixed(2), handicap: null },
      ],
    },
    {
      id: 14,
      name: "Match Score Draw",
      values: [
        { value: "Yes", odd: d.toFixed(2), handicap: null },
        { value: "No", odd: Math.max(1.05, Number((1.12 / Math.max(0.2, 1 - 1 / Math.max(d, 1.05))).toFixed(2))).toFixed(2), handicap: null },
      ],
    },
    {
      id: 4,
      name: "Asian Handicap",
      values: [
        { value: "Home -0.75", odd: "1.92", handicap: null },
        { value: "Away -0.75", odd: "1.88", handicap: null },
        { value: "Home -0.5", odd: "1.90", handicap: null },
        { value: "Away -0.5", odd: "1.90", handicap: null },
      ],
    },
    {
      id: 5,
      name: "Goals Over/Under",
      values: [
        { value: "Over 2.5", odd: String(o25), handicap: null },
        { value: "Under 2.5", odd: String(u25), handicap: null },
        { value: "Over 1.5", odd: "1.33", handicap: null },
        { value: "Under 1.5", odd: "3.25", handicap: null },
      ],
    },
    {
      id: 8,
      name: "Correct Score",
      values: [
        { value: "1:0", odd: "7.50", handicap: null },
        { value: "2:1", odd: "8.50", handicap: null },
        { value: "1:1", odd: "6.50", handicap: null },
        { value: "0:1", odd: "9.50", handicap: null },
      ],
    },
    {
      id: 13,
      name: "First Half Winner",
      values: [
        { value: "Home", odd: (h * 1.4).toFixed(2), handicap: null },
        { value: "Draw", odd: "2.20", handicap: null },
        { value: "Away", odd: (a * 1.35).toFixed(2), handicap: null },
      ],
    },
    ...buildMockComboMarkets(fixture),
  ];
}

async function fetchFixtureMarkets(fixtureId) {
  const fixture = state.fixtures.find((f) => f.fixtureId === fixtureId) || { odds: {} };
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
  } catch (_) {}

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
  el.innerHTML = MARKET_TABS.map((t) => {
    const icon = t.icon ? `<span class="md-tab-icon" aria-hidden="true">${t.icon}</span>` : "";
    return `<button type="button" class="md-tab${state.marketTab === t.id ? " is-on" : ""}" data-mtab="${t.id}">${icon}<span>${t.label}</span></button>`;
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
  if (fixture.status === "LIVE" || fixture.status === "1H" || fixture.status === "2H") return true;
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
  document.querySelectorAll(".main-nav-tab").forEach((btn) => {
    btn.classList.toggle("is-on", btn.dataset.nav === active);
  });
}

function refreshHomeAndBoard() {
  if (isSportsHomeSubNav()) renderCarousel();
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
      state.leagueFilter = "all";
      state.countryFilter = null;
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
    const fixture = state.fixtures.find((f) => f.fixtureId === bet.fixtureId);
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

function passesMyBetsStatusFilter(ticket) {
  const status = ticket.status || "open";
  if (state.myBetsStatus === "closed") return status === "won" || status === "lost";
  if (state.myBetsStatus === "live") return status === "open" && ticketHasLiveSelection(ticket);
  return status === "open";
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

  list.innerHTML = tickets
    .map((t) => {
      const picks = (t.bets || [])
        .map((b) => {
          const label = b.selectionName || b.value || b.selection || "Pick";
          const odd = Number(b.odd || 0).toFixed(2);
          return `${label} @ ${odd}`;
        })
        .join(" · ");
      const placed = t.placedAt ? new Date(t.placedAt).toLocaleString() : "—";
      const status = t.status || "open";
      const statusLabel =
        status === "open" && ticketHasLiveSelection(t) ? "LIVE" : status.toUpperCase();
      return `
      <article class="my-bets-ticket">
        <div class="my-bets-ticket-head">
          <span class="my-bets-ticket-id">${t.id}</span>
          <span class="my-bets-ticket-status ${status}">${statusLabel}</span>
        </div>
        <div class="my-bets-ticket-picks">${picks}</div>
        <div class="my-bets-ticket-meta">
          <span>Stake: ${fmt(t.stake)} ${CURRENCY}</span>
          <span>${status === "won" ? `Won: ${fmt(t.payout)} ${CURRENCY}` : status === "lost" ? "Lost" : `Placed: ${placed}`}</span>
        </div>
      </article>`;
    })
    .join("");
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
  return state.fixtures.filter((f) => {
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
  if (isSportsHomeSubNav()) {
    return state.fixtures
      .filter((f) => f?.home?.name && f?.away?.name && leagueIdInTopSet(f.league?.id))
      .slice(0, 8);
  }
  return filteredFixtures().slice(0, 8);
}

function boardTitle() {
  if (state.subNav === "daily") return "Daily Events";
  if (state.subNav === "upcoming") return "Upcoming";
  if (state.subNav === "inplay") return "In-Play Calendar";
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
    if (selection === "home") return fixture.odds.home;
    if (selection === "draw") return fixture.odds.draw;
    return fixture.odds.away;
  }
  if (market === "dc") {
    const dc = fixture.odds.doubleChance;
    if (selection === "1x") return dc.homeDraw;
    if (selection === "12") return dc.homeAway;
    if (selection === "x2") return dc.drawAway;
    return dc.drawAway;
  }
  const t = fixture.odds.totals || {};
  if (selection === "over") return t.over25 || "—";
  return t.under25 || "—";
}

function selectionLabel(market, selection, fixture) {
  if (market === "1x2") {
    if (selection === "home") return fixture.home.name;
    if (selection === "draw") return "Draw";
    return fixture.away.name;
  }
  if (market === "dc") {
    if (selection === "1x") return "1X";
    if (selection === "12") return "12";
    return "X2";
  }
  return selection === "over" ? "Over 2.5" : "Under 2.5";
}

function marketNameFor(market) {
  if (market === "1x2") return "1X2";
  if (market === "dc") return "Double Chance";
  return "O/U 2.5";
}

function isFixtureStarted(kickoff) {
  return new Date(kickoff).getTime() <= Date.now();
}

function isSlipBetExpired(bet) {
  const fixture = state.fixtures.find((f) => f.fixtureId === bet.fixtureId);
  const kickoff = fixture?.date || bet.kickoff;
  return isFixtureStarted(kickoff);
}

function activeSlipBets() {
  return state.slip.filter((b) => !isSlipBetExpired(b));
}

function addToSlip(fixture, marketKey, selection, odd, marketLabel, pickLabel) {
  const key = slipKey(fixture.fixtureId, marketKey, selection);
  const idx = state.slip.findIndex((b) => b.key === key);

  if (idx >= 0) {
    state.slip.splice(idx, 1);
    return;
  }

  // Only one selection allowed per match
  state.slip = state.slip.filter((b) => b.fixtureId !== fixture.fixtureId);

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
    marketName: marketLabel,
    kickoff: fixture.date,
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
  if (state.slipMode === "single" && bets.length === 1) return bets[0].odd;
  return bets.reduce((acc, b) => acc * b.odd, 1);
}

function potentialWin() {
  return state.stake * totalOdds();
}

function renderBalance() {
  const hidden = state.balanceHidden;
  const balance = $("balance");
  if (balance) balance.textContent = hidden ? "••••" : fmt(state.balance);
  const cur = $("currency-label");
  const stakeCur = $("stake-currency");
  const bonus = $("bonus-balance");
  if (cur) cur.textContent = CURRENCY;
  if (stakeCur) stakeCur.textContent = CURRENCY;
  if (bonus) bonus.textContent = hidden ? "••••" : "0.00";
}

function renderSportsSidebar() {
  const el = $("sidebar-sports");
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
  el.innerHTML = SPORTS_MENU.map(
    (s) => `
    <button type="button" class="sidebar-item sidebar-item--sport${state.sportFilter === s.id && state.sportsMenuMode ? " is-on" : ""}" data-sidebar-sport="${s.id}">
      <span class="sport-icon">${s.icon}</span>
      <span>${s.name}</span>
      <em>${counts[s.id] || 0}</em>
    </button>`
  ).join("");
  renderMobileSportsStrip();
  renderMobileTimeStrip();
}

function renderTopLeaguesGrid() {
  const el = $("top-leagues-grid");
  if (!el) return;
  const sidebar = getSidebarData();
  const leagues = sidebar.topLeagues.slice(0, 12);
  if (!leagues.length) {
    el.innerHTML = "";
    return;
  }
  el.innerHTML = leagues
    .map(
      (l) => `
    <button type="button" class="top-league-card" data-top-league="${l.id}">
      ${l.logo ? `<img src="${l.logo}" alt="" loading="lazy" />` : ""}
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
    const key = f.league.id;
    if (!groups.has(key)) groups.set(key, { league: f.league, matches: [] });
    groups.get(key).matches.push(f);
  }

  board.innerHTML = [...groups.values()]
    .map(
      (g) => `
    <section class="league-block">
      <div class="league-block-head">
        <img src="${g.league.flag}" alt="" class="flag" loading="lazy" />
        <img src="${g.league.logo}" alt="" loading="lazy" />
        <span>${g.league.name.toUpperCase()}</span>
      </div>
      ${g.matches
        .map(
          (f) => `
        <div class="match-row">
          <div class="match-row-info" data-open-fixture="${f.fixtureId}" role="button" tabindex="0">
            <div class="match-row-teams">
              <span class="match-row-team">${f.home.name}</span>
              <span class="match-row-vs" aria-hidden="true">-</span>
              <span class="match-row-team">${f.away.name}</span>
            </div>
            <div class="match-row-meta">
              <span class="match-row-time" data-countdown="${f.date}">${formatCountdown(f.date)}</span>
              <a class="match-row-more" href="#" data-open-fixture="${f.fixtureId}">+${f.marketCount || 83} Markets</a>
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

function oddButton(fixture, market, selection, label) {
  const odd = getMarketOdds(fixture, market, selection);
  const sel = isSelected(fixture.fixtureId, market, selection);
  return `<button type="button" class="odd-btn${sel ? " is-selected" : ""}" data-fixture="${fixture.fixtureId}" data-market="${market}" data-selection="${selection}">
    <span class="odd-btn-label">${label}</span>
    <span class="odd-btn-value">${odd}</span>
  </button>`;
}

function renderOddsRow(fixture) {
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

function renderCarousel() {
  const el = $("popular-carousel");
  if (!el || !isSportsHomeSubNav()) return;

  const popular = fixturesForCarousel();

  if (!popular.length) {
    el.innerHTML = `<div class="board-empty">No popular matches</div>`;
    return;
  }

  el.innerHTML = popular
    .map(
      (f) => `
    <article class="pop-card">
      <div class="pop-card-league">
        <img src="${f.league.logo}" alt="" loading="lazy" />
        <span>${f.league.name} · ${f.league.country}</span>
      </div>
      <div class="pop-card-time">${formatKickoff(f.date)}</div>
      <div class="pop-card-teams" data-open-fixture="${f.fixtureId}" role="button" tabindex="0">
        <div class="pop-card-team"><img src="${f.home.logo}" alt="" loading="lazy" /><span>${f.home.name}</span></div>
        <div class="pop-card-vs">VS</div>
        <div class="pop-card-team"><img src="${f.away.logo}" alt="" loading="lazy" /><span>${f.away.name}</span></div>
      </div>
      <div class="pop-odds">
        ${oddButton(f, "1x2", "home", "W1")}
        ${oddButton(f, "1x2", "draw", "X")}
        ${oddButton(f, "1x2", "away", "W2")}
      </div>
    </article>`
    )
    .join("");
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
  const tabCount = $("slip-tab-count");
  if (tabCount) tabCount.textContent = String(count);
  syncMobileSlipCount();

  const list = $("slip-list");
  const empty = $("slip-empty");
  const foot = $("slip-foot");
  if (!list || !empty || !foot) return;

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
    empty.hidden = false;
    foot.hidden = true;
    return;
  }

  empty.hidden = true;
  foot.hidden = false;

  list.innerHTML = state.slip
    .map((b) => {
      const expired = isSlipBetExpired(b);
      const homeLogo = b.homeLogo ? `<img src="${b.homeLogo}" alt="" class="slip-team-logo" loading="lazy" />` : "";
      const awayLogo = b.awayLogo ? `<img src="${b.awayLogo}" alt="" class="slip-team-logo" loading="lazy" />` : "";
      const matchLine = b.homeName && b.awayName ? `${b.homeName} vs ${b.awayName}` : b.fixtureName;
      return `
    <div class="slip-item${expired ? " is-expired" : ""}">
      <button type="button" class="slip-remove" data-remove="${b.key}" aria-label="Remove">🗑</button>
      <div class="slip-item-main">
        <div class="slip-match">
          ${homeLogo}
          <span class="slip-match-name">${matchLine}</span>
          ${awayLogo}
        </div>
        <div class="slip-pick">${b.marketName} : ${b.selectionName}</div>
      </div>
      <div class="slip-item-side">
        ${expired ? `<span class="slip-expired-label">Expired</span>` : ""}
        <span class="slip-odd-badge">${b.odd.toFixed(2)}</span>
      </div>
    </div>`;
    })
    .join("");

  $("total-odds").textContent = totalOdds().toFixed(2);
  $("potential-win").textContent = fmt(potentialWin());
  $("stake-input").value = state.stake;
  $("btn-place").disabled = state.stake < MIN_STAKE || activeCount === 0 || hasExpired;
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
  const fixture = state.fixtures.find((f) => f.fixtureId === fixtureId);
  if (!fixture) return;

  state.detailFixtureId = fixtureId;
  state.marketTab = "all";
  state.marketSearch = "";
  state.expandedMarkets = new Set();
  setView("match");

  $("market-search").value = "";
  const crumb = $("match-breadcrumb");
  if (crumb) crumb.textContent = matchBreadcrumb(fixture);

  $("match-hero").innerHTML = `
    <div class="md-date">${formatMatchDate(fixture.date)}</div>
    <div class="md-teams">
      <div class="md-team">
        <img src="${fixture.home.logo}" alt="" loading="lazy" />
        <span>${fixture.home.name}</span>
      </div>
      <div class="md-vs">VS</div>
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

  const fixture = state.fixtures.find((f) => f.fixtureId === state.detailFixtureId);
  const markets = state.fixtureMarkets[state.detailFixtureId] || [];
  if (!fixture) return;

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
          const sel = isSelected(fixture.fixtureId, marketKey, v.value);
          const label = formatMarketLabel(v.value, fixture);
          return `<button type="button" class="md-odd${sel ? " is-selected" : ""}" data-detail-odd data-fixture="${fixture.fixtureId}" data-market-id="${m.id}" data-market-name="${m.name.replace(/"/g, "&quot;")}" data-value="${v.value.replace(/"/g, "&quot;")}" data-odd="${v.odd}">
            <span class="md-odd-label">${label}</span>
            <span class="md-odd-value">${v.odd}</span>
          </button>`;
        })
        .join("");

      return `<section class="md-market${open ? " is-open" : ""}" data-market-id="${m.id}">
        <button type="button" class="md-market-head" data-toggle-market="${m.id}">
          <span class="md-market-chevron" aria-hidden="true">▲</span>
          <span class="md-market-star" aria-hidden="true">☆</span>
          <span class="md-market-title">${m.name}</span>
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
    joinBtn.textContent = loggedIn ? "Sign Out" : "Sign In";
    joinBtn.hidden = !loggedIn;
  }
  if (userPill) {
    if (loggedIn && state.sessionUser) {
      userPill.hidden = false;
      userPill.textContent = state.sessionUser.displayName || state.sessionUser.email || "Account";
    } else {
      userPill.hidden = true;
    }
  }
  if (depositBtn) depositBtn.hidden = !loggedIn || !useApi();
  renderAccountDrawer();
}

function renderDepositMethods(methods, minDeposit) {
  const select = $("deposit-method");
  select.innerHTML = (methods || [])
    .map((m) => `<option value="${m.id}">${m.name} — ${m.account}</option>`)
    .join("");
  $("deposit-amount").min = minDeposit || 100;
  $("deposit-amount").placeholder = `Min ${minDeposit || 100} ETB`;
  updateDepositInstructions(methods);
}

function updateDepositInstructions(methods) {
  const id = $("deposit-method").value;
  const method = (methods || []).find((m) => m.id === id);
  $("deposit-instructions").textContent = method?.instructions || "Send payment, then submit your transaction reference.";
}

function renderDepositHistory(rows) {
  const el = $("deposit-history");
  if (!rows?.length) {
    el.innerHTML = "";
    return;
  }
  el.innerHTML = rows
    .slice(0, 5)
    .map(
      (d) => `<div class="deposit-row is-${d.status}">
        <strong>${d.amount} ETB · ${d.status}</strong>
        <span>${d.method} · ${d.reference}</span>
        <span>${new Date(d.created_at).toLocaleString()}</span>
      </div>`
    )
    .join("");
}

async function openDepositModal() {
  if (!useApi() || !api().getToken()) {
    openAuthModal("login");
    return;
  }
  try {
    const data = await api().fetchDepositMethods();
    state.depositMethods = data.methods || [];
    state.minDeposit = data.minDeposit || 100;
    renderDepositMethods(state.depositMethods, state.minDeposit);
    const hist = await api().fetchDepositHistory();
    renderDepositHistory(hist.deposits || []);
    $("deposit-modal").hidden = false;
  } catch (err) {
    toast(err.message || "Could not open deposits", "err");
  }
}

function closeDepositModal() {
  $("deposit-modal").hidden = true;
}

function phoneToAccountEmail(rawPhone) {
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
    state.history = [];
    renderSession();
    renderBalance();
    return;
  }

  try {
    state.sessionUser = api().getUser();
    const bal = await api().fetchBalance();
    state.balance = bal.balance;
    const hist = await api().fetchHistory();
    state.history = (hist.tickets || []).map((t) => ({
      id: t.id,
      bets: t.bets,
      stake: t.stake,
      totalOdds: t.totalOdds,
      status: t.status,
      payout: t.payout || 0,
      placedAt: t.placedAt,
    }));
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
    state.balance = result.balance;
    renderBalance();
    if (state.betslipTab === "bets") renderHistory();
    refreshMyBetsIfVisible();
  } catch (err) {
    ticket.status = won ? "won" : "lost";
    if (won) ticket.payout = ticket.stake * ticket.totalOdds;
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
  if (state.slip.some(isSlipBetExpired)) {
    toast("Remove expired selections before placing a bet", "err");
    return;
  }
  const active = activeSlipBets();
  if (!active.length) return;
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
          marketKey: b.marketKey,
          marketName: b.marketName,
          value: b.value,
          odd: b.odd,
          homeName: b.homeName,
          awayName: b.awayName,
          kickoff: b.kickoff,
        })),
      };
      const result = await api().placeBet(payload);
      const ticket = {
        id: result.ticket.id,
        bets: result.ticket.bets,
        stake: result.ticket.stake,
        totalOdds: result.ticket.totalOdds,
        status: result.ticket.status,
        payout: 0,
        placedAt: result.ticket.placedAt,
      };
      state.balance = result.balance;
      state.history.unshift(ticket);
      state.slip = [];
      renderBalance();
      renderSlip();
      refreshHomeAndBoard();
      if (state.detailFixtureId) renderMatchDetail();
      toast(`Bet placed — ${ticket.id}`, "ok");
      refreshMyBetsIfVisible();
      setTimeout(() => settleTicketRemote(ticket), 3000 + Math.random() * 4000);
    } catch (err) {
      toast(err.message || "Could not place bet", "err");
    }
    return;
  }

  const id = "TKT-" + String(state.ticketSeq++).padStart(6, "0");
  const ticket = {
    id,
    bets: [...active],
    stake: state.stake,
    totalOdds: totalOdds(),
    status: "open",
    payout: 0,
    placedAt: new Date().toISOString(),
  };

  state.balance -= state.stake;
  state.history.unshift(ticket);
  state.slip = [];
  save();

  renderBalance();
  renderSlip();
  refreshHomeAndBoard();
  if (state.detailFixtureId) renderMatchDetail();
  toast(`Bet placed — ${id}`, "ok");
  refreshMyBetsIfVisible();

  setTimeout(() => settleTicketLocal(ticket), 3000 + Math.random() * 4000);
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
}

function selectCountry(countryName) {
  state.countryFilter = countryName;
  state.leagueFilter = "all";
  state.expandedSidebarCountries.add(countryName);
  closeLeagueDropdown();
  fetchCountryLeagues(countryName).then(applyBoardFilters);
}

function bindEvents() {
  function handleOddClick(e) {
    const btn = e.target.closest(".odd-btn");
    if (!btn) return;
    e.stopPropagation();
    e.preventDefault();
    const fixtureId = Number(btn.dataset.fixture);
    const market = btn.dataset.market;
    const selection = btn.dataset.selection;
    const fixture = state.fixtures.find((f) => f.fixtureId === fixtureId);
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
    const fixture = state.fixtures.find((f) => f.fixtureId === fixtureId);
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

  document.querySelectorAll(".main-nav-tabs").forEach((nav) => {
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
        toast("Live is currently unavailable", "err");
        return;
      }
      if (id === "special") {
        window.location.href = "../index.html";
      }
    });
  });

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

  on($("ad-carousel-dots"), "click", (e) => {
    const dot = e.target.closest("[data-dot]");
    if (!dot) return;
    state.adIndex = Number(dot.dataset.dot);
    updateAdCarousel();
  });

  on($("top-leagues-grid"), "click", (e) => {
    const card = e.target.closest("[data-top-league]");
    if (!card) return;
    selectLeague(Number(card.dataset.topLeague));
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

  on($("btn-share-slip"), "click", () => {
    if (!state.slip.length) {
      toast("Add selections to share", "err");
      return;
    }
    const code = btoa(JSON.stringify({ slip: state.slip, stake: state.stake })).slice(0, 12);
    navigator.clipboard?.writeText(code);
    toast(`Share code copied: ${code}`, "ok");
  });

  document.querySelectorAll(".btn-load-tool").forEach((btn) => {
    on(btn, "click", () => toast("Ticket tools coming soon — ask admin to enable", "err"));
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
    const email = phoneToAccountEmail(phoneRaw);
    try {
      const data = await api().login({ email, password });
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
    const digits = phoneRaw.replace(/\D/g, "");
    if (digits.replace(/^251/, "").replace(/^0/, "").length < 9) {
      toast("Enter a valid Ethiopian phone number", "err");
      return;
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
    const email = phoneToAccountEmail(phoneRaw);
    const phone = formatAuthPhone(phoneRaw);
    const submitBtn = $("auth-submit");
    if (!submitBtn) return;
    const prevLabel = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = "Please wait…";
    try {
      if (state.authTab === "register") {
        const data = await api().register({ email, password, phone });
        state.sessionUser = data.user;
        toast(`Welcome! +${data.welcomeBonus || 0} ${CURRENCY} bonus`, "ok");
      } else {
        const data = await api().login({ email, password });
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

  on($("btn-deposit"), "click", openDepositModal);
  on($("deposit-close"), "click", closeDepositModal);
  on($("deposit-modal"), "click", (e) => {
    if (e.target === $("deposit-modal")) closeDepositModal();
  });
  on($("deposit-method"), "change", () => updateDepositInstructions(state.depositMethods || []));
  on($("deposit-form"), "submit", async (e) => {
    e.preventDefault();
    if (!useApi() || !api().getToken()) return;
    try {
      const payload = {
        method: $("deposit-method").value,
        amount: Number($("deposit-amount").value),
        reference: $("deposit-reference").value.trim(),
      };
      await api().requestDeposit(payload);
      toast("Deposit request submitted — pending approval", "ok");
      $("deposit-reference").value = "";
      const hist = await api().fetchDepositHistory();
      renderDepositHistory(hist.deposits || []);
    } catch (err) {
      toast(err.message || "Deposit request failed", "err");
    }
  });
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
    setInterval(updateCountdowns, 1000);
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
  if (e?.error) showBootError(e.error);
});

init();
