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
  { id: "main", label: "Main" },
  { id: "goals", label: "Goals" },
  { id: "handicap", label: "Handicap" },
  { id: "score", label: "Correct Score" },
  { id: "half", label: "Half" },
  { id: "other", label: "Other" },
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
  el.textContent = msg;
  el.className = "toast" + (kind ? " is-" + kind : "");
  el.hidden = false;
  clearTimeout(toast._t);
  toast._t = setTimeout(() => {
    el.hidden = true;
  }, 2400);
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
  ];

  return base.map((m) => ({
    fixtureId: m.fixtureId,
    date: hoursFromNow(m.hours).toISOString(),
    status: "NS",
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

  const leagues = [
    ...new Map(
      state.fixtures
        .filter((f) => f.league.country === countryName)
        .map((f) => [f.league.id, { id: f.league.id, name: f.league.name, logo: f.league.logo, count: 0 }])
    ).values(),
  ];
  leagues.forEach((l) => {
    l.count = state.fixtures.filter((f) => f.league.id === l.id).length;
  });
  state.countryLeagues[countryName] = leagues;
  return leagues;
}

function closeLeagueDropdown() {
  state.leagueDropdown = null;
  state.leagueDropdownSearch = "";
  $("league-dropdown-backdrop").hidden = true;
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
  renderCarousel();
  renderBoard();
}

function selectLeague(leagueId) {
  state.leagueFilter = leagueId;
  state.countryFilter = null;
  closeLeagueDropdown();
  renderSidebar();
  renderFilters();
  renderCarousel();
  renderBoard();
}

function selectCountryFromDropdown(countryName) {
  state.countryFilter = countryName;
  state.leagueFilter = "all";
  closeLeagueDropdown();
  if (!state.expandedSidebarCountries.has(countryName)) {
    state.expandedSidebarCountries.add(countryName);
    fetchCountryLeagues(countryName).then(() => {
      renderSidebar();
    });
  }
  renderSidebar();
  renderFilters();
  renderCarousel();
  renderBoard();
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

async function fetchLiveFixtures() {
  const topLeagues = "39-140-61-88-78-135-40";
  const urls = useApi()
    ? [
        `${api().apiUrl()}/api/odds/fixtures/upcoming`,
        `${api().apiUrl()}/api/odds/fixtures/prematch?leagues=${topLeagues}`,
      ]
    : [
        `${API_BASE}/football/board/upcoming?bookmaker=${BOOKMAKER}`,
        `${API_BASE}/football/board/prematch?bookmaker=${BOOKMAKER}&leagues=${topLeagues}`,
      ];

  for (const url of urls) {
    try {
      const res = await fetch(url);
      if (!res.ok) continue;
      const data = await res.json();
      if (!data.ok) continue;

      let rows = [];
      if (Array.isArray(data.fixtures)) rows = data.fixtures;
      else if (data.leagueBoards) {
        for (const board of Object.values(data.leagueBoards)) {
          if (Array.isArray(board.fixtures)) rows.push(...board.fixtures);
        }
      }

      if (rows.length) {
        state.liveSource = true;
        return rows.map(normalizeApiFixture);
      }
    } catch (_) {}
  }
  return null;
}

async function fetchSidebar() {
  try {
    const res = await fetch(
      useApi()
        ? `${api().apiUrl()}/api/odds/sidebar`
        : `${API_BASE}/football/sidebar/summary?view=prematch&bookmaker=${BOOKMAKER}`
    );
    if (!res.ok) return;
    const data = await res.json();
    if (!data.ok) return;

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
    }
  } catch (_) {}
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

async function loadFixtures() {
  $("board-loading").hidden = false;
  try {
    const live = await fetchLiveFixtures();
    if (live && live.length) {
      state.fixtures = live;
      state.liveSource = true;
    }
  } catch (_) {}
  $("board-loading").hidden = true;
  renderSportsSidebar();
  renderTopLeaguesGrid();
  renderCarousel();
  renderBoard();
  renderSidebar();
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
      name: "Match Winner",
      values: [
        { value: "Home", odd: h.toFixed(2), handicap: null },
        { value: "Draw", odd: d.toFixed(2), handicap: null },
        { value: "Away", odd: a.toFixed(2), handicap: null },
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
      name: "Exact Score",
      values: [
        { value: "1:0", odd: "7.50", handicap: null },
        { value: "2:1", odd: "8.50", handicap: null },
        { value: "1:1", odd: "6.50", handicap: null },
        { value: "0:1", odd: "9.50", handicap: null },
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
      id: 13,
      name: "First Half Winner",
      values: [
        { value: "Home", odd: (h * 1.4).toFixed(2), handicap: null },
        { value: "Draw", odd: "2.20", handicap: null },
        { value: "Away", odd: (a * 1.35).toFixed(2), handicap: null },
      ],
    },
  ];
}

async function fetchFixtureMarkets(fixtureId) {
  if (state.fixtureMarkets[fixtureId]) return state.fixtureMarkets[fixtureId];

  try {
    const res = await fetch(
      useApi()
        ? `${api().apiUrl()}/api/odds/fixture/${fixtureId}/markets`
        : `${API_BASE}/football/odds/fixture/${fixtureId}?bookmaker=${BOOKMAKER}`
    );
    if (res.ok) {
      const data = await res.json();
      if (data.ok && Array.isArray(data.markets) && data.markets.length) {
        state.fixtureMarkets[fixtureId] = data.markets;
        return data.markets;
      }
    }
  } catch (_) {}

  const fixture = state.fixtures.find((f) => f.fixtureId === fixtureId);
  const markets = fixture?.markets?.length > 3 ? fixture.markets : buildMockMarkets(fixture || { odds: {} });
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
  if (value === "Home/Draw") return "Home or Draw";
  if (value === "Home/Away") return "Home or Away";
  if (value === "Draw/Away") return "Draw or Away";
  return value;
}

function marketCategory(name) {
  const n = name.toLowerCase();
  if (n.includes("handicap") || n.includes("goal line")) return "handicap";
  if (n.includes("score") || n.includes("exact")) return "score";
  if (n.includes("first half") || n.includes("ht/ft") || n.includes("1st half") || n.includes("second half")) return "half";
  if (n.includes("over") || n.includes("under") || n.includes("goals") || n.includes("total") || n.includes("odd/even")) return "goals";
  if (
    n.includes("winner") ||
    n.includes("double chance") ||
    n.includes("both teams") ||
    n.includes("draw no bet") ||
    n.includes("home/away")
  )
    return "main";
  return "other";
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

function passesTimeFilter(fixture) {
  const tf = TIME_FILTERS.find((t) => t.id === state.timeFilter);
  if (!tf || tf.hours === null) return true;

  const kick = new Date(fixture.date).getTime();
  const now = Date.now();

  if (tf.hours === "today") return kick <= endOfToday().getTime() && kick >= now - 3600000;
  if (tf.hours === "tomorrow") {
    return kick >= startOfTomorrow().getTime() && kick <= endOfTomorrow().getTime();
  }
  return kick <= now + tf.hours * 3600000 && kick >= now - 3600000;
}

function filteredFixtures() {
  return state.fixtures.filter((f) => {
    if (state.eventSearch) {
      const q = state.eventSearch.toLowerCase();
      const hay = `${f.home.name} ${f.away.name} ${f.league.name}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    if (state.countryFilter && f.league.country !== state.countryFilter) return false;
    if (state.leagueFilter === "top" && !TOP_LEAGUE_IDS.has(f.league.id)) return false;
    if (state.leagueFilter !== "all" && state.leagueFilter !== "top" && f.league.id !== state.leagueFilter) return false;
    return passesTimeFilter(f);
  });
}

function boardTitle() {
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

function toggleSelection(fixture, market, selection) {
  const odd = getMarketOdds(fixture, market, selection);
  addToSlip(fixture, market, selection, odd, marketNameFor(market), selectionLabel(market, selection, fixture));
  save();
  renderSlip();
  renderBoard();
  renderCarousel();
  if (state.detailFixtureId) renderMatchDetail();
}

function toggleDetailSelection(fixture, market, value) {
  const marketKey = `m${market.id}`;
  addToSlip(fixture, marketKey, value.value, value.odd, market.name, value.value);
  save();
  renderSlip();
  renderMatchDetail();
  renderBoard();
  renderCarousel();
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
  $("balance").textContent = hidden ? "••••" : fmt(state.balance);
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
    <button type="button" class="sidebar-item${state.sportFilter === s.id ? " is-on" : ""}" data-sidebar-sport="${s.id}">
      <span class="sport-icon">${s.icon}</span>
      <span>${s.name}</span>
      <em>${counts[s.id] || 0}</em>
    </button>`
  ).join("");
}

function renderTopLeaguesGrid() {
  const el = $("top-leagues-grid");
  if (!el) return;
  const sidebar = state.sidebar.topLeagues.length ? state.sidebar : buildMockSidebar();
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

function renderSidebar() {
  const sidebar = state.sidebar.topLeagues.length ? state.sidebar : buildMockSidebar();
  if (!state.sidebar.topLeagues.length) state.sidebar = sidebar;

  $("top-league-count").textContent = sidebar.topLeagues.length;
  $("country-count").textContent = sidebar.countries.length;

  $("sidebar-leagues").innerHTML = sidebar.topLeagues
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

  $("sidebar-countries").innerHTML = sidebar.countries
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

function closeLeagueDropdown() {
  state.leagueDropdown = null;
  state.leagueDropdownSearch = "";
  $("league-dropdown-backdrop").hidden = true;
}

function renderFilters() {
  const sidebar = state.sidebar.topLeagues.length ? state.sidebar : buildMockSidebar();
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

  $("league-filter-bar").innerHTML = `
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

  $("league-dropdown-backdrop").hidden = !allOpen && !topOpen;

  const tf = $("time-filters");
  if (tf) {
    tf.innerHTML = TIME_FILTERS_SIDEBAR.map(
      (f) =>
        `<button type="button" class="chip${state.timeFilter === f.id ? " is-on" : ""}" data-time="${f.id}">${f.label}</button>`
    ).join("");
  }

  $("board-title").textContent = boardTitle();
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
  const popular = filteredFixtures().slice(0, 8);
  const el = $("popular-carousel");

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
  const list = filteredFixtures();
  const board = $("match-board");

  if (!list.length) {
    board.innerHTML = `<div class="board-empty">No matches for this filter</div>`;
    return;
  }

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
              <div class="match-row-team"><img src="${f.home.logo}" alt="" loading="lazy" />${f.home.name}</div>
              <div class="match-row-team"><img src="${f.away.logo}" alt="" loading="lazy" />${f.away.name}</div>
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

function renderSlip() {
  const count = state.slip.length;
  const activeCount = activeSlipBets().length;
  const hasExpired = count > activeCount;
  $("slip-tab-count").textContent = String(count);

  const list = $("slip-list");
  const empty = $("slip-empty");
  const foot = $("slip-foot");

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
  $("quick-stakes").innerHTML = QUICK_STAKES.map(
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
  const tools = document.querySelector(".betslip-tools");
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

  $("match-hero").innerHTML = `
    <div class="md-date">${formatMatchDate(fixture.date)}</div>
    <div class="md-teams">
      <div class="md-team"><img src="${fixture.home.logo}" alt="" /><span>${fixture.home.name}</span></div>
      <div class="md-vs">VS</div>
      <div class="md-team"><img src="${fixture.away.logo}" alt="" /><span>${fixture.away.name}</span></div>
    </div>`;

  $("market-tabs").innerHTML = MARKET_TABS.map(
    (t) => `<button type="button" class="md-tab${state.marketTab === t.id ? " is-on" : ""}" data-mtab="${t.id}">${t.label}</button>`
  ).join("");

  $("match-markets").innerHTML = "";
  $("match-loading").hidden = false;

  const markets = await fetchFixtureMarkets(fixtureId);
  $("match-loading").hidden = true;
  state.fixtureMarkets[fixtureId] = markets;
  renderMatchDetail();
}

function closeMatchDetail() {
  state.detailFixtureId = null;
  setView("sports");
}

function renderMatchDetail() {
  if (!state.detailFixtureId) return;

  const fixture = state.fixtures.find((f) => f.fixtureId === state.detailFixtureId);
  const markets = state.fixtureMarkets[state.detailFixtureId] || [];
  if (!fixture) return;

  $("market-tabs").innerHTML = MARKET_TABS.map(
    (t) => `<button type="button" class="md-tab${state.marketTab === t.id ? " is-on" : ""}" data-mtab="${t.id}">${t.label}</button>`
  ).join("");

  const filtered = markets.filter((m) => {
    if (state.marketTab !== "all" && marketCategory(m.name) !== state.marketTab) return false;
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
          <span class="md-market-chevron" aria-hidden="true">▼</span>
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

function renderSession() {
  const joinBtn = $("btn-join");
  const userPill = $("user-pill");
  const depositBtn = $("btn-deposit");
  if (!useApi()) {
    joinBtn.textContent = "Demo";
    userPill.hidden = true;
    if (depositBtn) depositBtn.hidden = true;
    return;
  }

  if (state.sessionUser) {
    joinBtn.textContent = "Sign Out";
    userPill.hidden = false;
    userPill.textContent = state.sessionUser.displayName || state.sessionUser.email;
    if (depositBtn) depositBtn.hidden = false;
  } else {
    joinBtn.textContent = "Sign In";
    userPill.hidden = true;
    if (depositBtn) depositBtn.hidden = true;
  }
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

function openAuthModal(tab) {
  state.authTab = tab || "login";
  $("auth-modal").hidden = false;
  document.querySelectorAll(".auth-tab").forEach((btn) => {
    btn.classList.toggle("is-on", btn.dataset.authTab === state.authTab);
  });
  $("auth-phone-wrap").hidden = state.authTab !== "register";
  $("auth-title").textContent = state.authTab === "register" ? "Create Hope Bet account" : "Sign in to Hope Bet";
  $("auth-submit").textContent = state.authTab === "register" ? "Create Account" : "Sign In";
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
    if (state.betslipTab === "bets") renderHistory();
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
      renderBoard();
      renderCarousel();
      if (state.detailFixtureId) renderMatchDetail();
      toast(`Bet placed — ${ticket.id}`, "ok");
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
  renderBoard();
  renderCarousel();
  if (state.detailFixtureId) renderMatchDetail();
  toast(`Bet placed — ${id}`, "ok");

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
  renderCarousel();
  renderBoard();
  renderSlip();
  renderQuickStakes();
  renderLastWinnings();
}

function applyBoardFilters() {
  renderSidebar();
  renderFilters();
  renderCarousel();
  renderBoard();
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
  $("sidebar-leagues").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-sidebar-league]");
    if (!btn) return;
    selectLeague(Number(btn.dataset.sidebarLeague));
  });

  $("sidebar-countries").addEventListener("click", async (e) => {
    const leagueBtn = e.target.closest("[data-sidebar-league]");
    if (leagueBtn) {
      selectLeague(Number(leagueBtn.dataset.sidebarLeague));
      return;
    }

    const countryBtn = e.target.closest("[data-sidebar-country]");
    if (!countryBtn) return;
    await toggleSidebarCountry(countryBtn.dataset.sidebarCountry);
  });

  $("league-filter-bar").addEventListener("click", (e) => {
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

  $("league-filter-bar").addEventListener("input", (e) => {
    if (!e.target.matches("[data-dropdown-search]")) return;
    state.leagueDropdownSearch = e.target.value;
    renderFilters();
    const input = $("league-filter-bar").querySelector("[data-dropdown-search]");
    if (input) {
      input.focus();
      input.setSelectionRange(input.value.length, input.value.length);
    }
  });

  $("league-dropdown-backdrop").addEventListener("click", () => {
    closeLeagueDropdown();
    renderFilters();
  });

  $("time-filters").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-time]");
    if (!btn) return;
    state.timeFilter = btn.dataset.time;
    renderFilters();
    renderCarousel();
    renderBoard();
  });

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

  $("popular-carousel").addEventListener("click", (e) => {
    handleOddClick(e);
    handleOpenFixture(e);
  });

  $("match-board").addEventListener("click", (e) => {
    handleOddClick(e);
    handleOpenFixture(e);
  });

  $("market-tabs").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-mtab]");
    if (!btn) return;
    state.marketTab = btn.dataset.mtab;
    renderMatchDetail();
  });

  $("market-search").addEventListener("input", (e) => {
    state.marketSearch = e.target.value.trim();
    renderMatchDetail();
  });

  $("match-markets").addEventListener("click", (e) => {
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
    toggleDetailSelection(fixture, { id: Number(btn.dataset.marketId), name: btn.dataset.marketName }, { value: btn.dataset.value, odd: btn.dataset.odd });
  });

  $("btn-back")?.addEventListener("click", (e) => {
    if (state.detailFixtureId) {
      e.preventDefault();
      closeMatchDetail();
    }
  });

  $("match-back").addEventListener("click", closeMatchDetail);

  $("btn-my-bets-shortcut")?.addEventListener("click", () => setBetslipTab("bets"));
  $("sub-nav-my-bets")?.addEventListener("click", () => setBetslipTab("bets"));

  document.querySelectorAll(".betslip-tab").forEach((btn) => {
    btn.addEventListener("click", () => setBetslipTab(btn.dataset.btab));
  });

  $("slip-list").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-remove]");
    if (!btn) return;
    const key = btn.dataset.remove;
    state.slip = state.slip.filter((b) => b.key !== key);
    save();
    renderSlip();
    renderBoard();
    renderCarousel();
    if (state.detailFixtureId) renderMatchDetail();
  });

  document.querySelectorAll(".betslip-mode-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.slipMode = btn.dataset.mode;
      document.querySelectorAll(".betslip-mode-btn").forEach((b) => b.classList.toggle("is-on", b === btn));
      if (state.slipMode === "single" && state.slip.length > 1) {
        state.slip = [state.slip[state.slip.length - 1]];
        save();
        renderSlip();
        renderBoard();
        renderCarousel();
      }
    });
  });

  $("stake-input").addEventListener("input", (e) => {
    state.stake = Math.max(0, Number(e.target.value) || 0);
    save();
    renderSlip();
  });

  $("quick-stakes").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-stake]");
    if (!btn) return;
    state.stake = Number(btn.dataset.stake);
    save();
    renderSlip();
    renderQuickStakes();
  });

  $("stake-minus")?.addEventListener("click", () => {
    state.stake = Math.max(MIN_STAKE, state.stake - 10);
    save();
    renderSlip();
    renderQuickStakes();
  });

  $("stake-plus")?.addEventListener("click", () => {
    state.stake += 10;
    save();
    renderSlip();
    renderQuickStakes();
  });

  $("btn-balance-toggle")?.addEventListener("click", () => {
    state.balanceHidden = !state.balanceHidden;
    renderBalance();
  });

  $("event-search")?.addEventListener("input", (e) => {
    state.eventSearch = e.target.value.trim();
    renderCarousel();
    renderBoard();
  });

  $("ad-prev")?.addEventListener("click", () => {
    if (!state.adSlides.length) return;
    state.adIndex = (state.adIndex - 1 + state.adSlides.length) % state.adSlides.length;
    updateAdCarousel();
  });

  $("ad-next")?.addEventListener("click", () => {
    if (!state.adSlides.length) return;
    state.adIndex = (state.adIndex + 1) % state.adSlides.length;
    updateAdCarousel();
  });

  $("ad-carousel-dots")?.addEventListener("click", (e) => {
    const dot = e.target.closest("[data-dot]");
    if (!dot) return;
    state.adIndex = Number(dot.dataset.dot);
    updateAdCarousel();
  });

  $("top-leagues-grid")?.addEventListener("click", (e) => {
    const card = e.target.closest("[data-top-league]");
    if (!card) return;
    selectLeague(Number(card.dataset.topLeague));
  });

  $("sidebar-sports")?.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-sidebar-sport]");
    if (!btn) return;
    state.sportFilter = btn.dataset.sidebarSport;
    if (btn.dataset.sidebarSport !== "football") {
      toast("Only Football is live for now — other sports coming soon", "err");
    }
    renderSportsSidebar();
  });

  $("btn-share-slip")?.addEventListener("click", () => {
    if (!state.slip.length) {
      toast("Add selections to share", "err");
      return;
    }
    const code = btoa(JSON.stringify({ slip: state.slip, stake: state.stake })).slice(0, 12);
    navigator.clipboard?.writeText(code);
    toast(`Share code copied: ${code}`, "ok");
  });

  document.querySelectorAll(".btn-load-tool").forEach((btn) => {
    btn.addEventListener("click", () => {
      toast("Ticket tools coming soon — ask admin to enable", "err");
    });
  });

  $("btn-place").addEventListener("click", placeBet);

  $("btn-clear-slip").addEventListener("click", () => {
    state.slip = [];
    save();
    renderSlip();
    renderBoard();
    renderCarousel();
  });

  $("btn-join").addEventListener("click", () => {
    if (!useApi()) {
      state.balance += 1000;
      save();
      renderBalance();
      toast(`+1,000 ${CURRENCY} demo added`, "ok");
      return;
    }
    if (state.sessionUser) {
      api().clearSession();
      state.sessionUser = null;
      state.balance = 0;
      state.history = [];
      renderSession();
      renderBalance();
      if (state.betslipTab === "bets") renderHistory();
      toast("Signed out", "ok");
      return;
    }
    openAuthModal("login");
  });

  document.querySelectorAll(".auth-tab").forEach((btn) => {
    btn.addEventListener("click", () => openAuthModal(btn.dataset.authTab));
  });

  $("auth-close").addEventListener("click", closeAuthModal);
  $("auth-modal").addEventListener("click", (e) => {
    if (e.target === $("auth-modal")) closeAuthModal();
  });

  $("auth-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!useApi()) return;
    const email = $("auth-email").value.trim();
    const password = $("auth-password").value;
    const phone = $("auth-phone").value.trim();
    const submitBtn = $("auth-submit");
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

  $("btn-deposit")?.addEventListener("click", openDepositModal);
  $("deposit-close")?.addEventListener("click", closeDepositModal);
  $("deposit-modal")?.addEventListener("click", (e) => {
    if (e.target === $("deposit-modal")) closeDepositModal();
  });
  $("deposit-method")?.addEventListener("change", () => updateDepositInstructions(state.depositMethods || []));
  $("deposit-form")?.addEventListener("submit", async (e) => {
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
  load();
  state.fixtures = buildMockFixtures();
  state.sidebar = buildMockSidebar();
  bindEvents();
  renderSession();
  renderAll();
  syncFromApi();
  fetchSidebar().then(() => {
    renderSidebar();
  });
  loadFixtures();
  initAdvertCarousel();
  setInterval(updateCountdowns, 1000);
  setInterval(() => {
    if (state.adSlides.length > 1) {
      state.adIndex = (state.adIndex + 1) % state.adSlides.length;
      updateAdCarousel();
    }
  }, 6000);
}

init();
