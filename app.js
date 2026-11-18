/* ============================================================================
   QUESTIONAIRE — app.js
   Static router, practice engine, deadline-based exam timer, unified review
   queue, search, theme switching and localStorage progress.

   Deliberate simplifications over v1:
   - One `exam` object with an absolute deadline (no drifting countdown).
   - One `pendingTarget` selector for search jumps (no focus object/async).
   - One review queue (bookmarks + mistakes deduped) with a filter.
   - Card feedback resets on navigation, not on every re-render.
   ========================================================================== */

(function () {
  "use strict";

  /* --------------------------------------------------------------------------
     Constants
     -------------------------------------------------------------------------- */

  const STORAGE_KEY = "questionaire.progress.v1";
  const ACCOUNTS_KEY = "questionaire.accounts.v1";
  const THEME_KEY = "questionaire.theme";
  const THEMES = ["light", "dark", "oled"];
  const THEME_COLORS = { light: "#f2eee4", dark: "#14120e", oled: "#000000" };

  const XP_PER_CORRECT = 12;
  const XP_PER_ATTEMPT = 4;
  const XP_PER_LEVEL = 200;
  const SECONDS_PER_QUESTION = 60;
  const RANKS = ["Initiate", "Apprentice", "Analyst", "Researcher", "Fellow", "Laureate"];

  const TABS = [
    { id: "practice", label: "Practice", icon: "list-checks" },
    { id: "study", label: "Study bank", icon: "book-open" },
    { id: "tips", label: "Tips & hacks", icon: "lightbulb" },
    { id: "videos", label: "Video lessons", icon: "play" }
  ];
  const TAB_IDS = TABS.map(function (tab) { return tab.id; });
  const DIFFICULTIES = ["All", "Beginner", "Intermediate", "Advanced"];

  /* --------------------------------------------------------------------------
     DOM
     -------------------------------------------------------------------------- */

  const view = document.getElementById("view");
  const sidebar = document.getElementById("sidebar");
  const sidebarNav = document.getElementById("sidebar-nav");
  const sidebarOverlay = document.getElementById("sidebar-overlay");
  const menuBtn = document.getElementById("menu-btn");
  const sidebarClose = document.getElementById("sidebar-close");
  const searchWrap = document.getElementById("search-wrap");
  const searchInput = document.getElementById("global-search");
  const searchResultsPanel = document.getElementById("search-results");
  const searchClear = document.getElementById("search-clear");
  const toastEl = document.getElementById("toast");

  /* --------------------------------------------------------------------------
     Data index
     -------------------------------------------------------------------------- */

  const SUBJECTS = [];
  const SUBJECT_MAP = new Map();
  const QUESTION_MAP = new Map();
  const DATA_READY = Boolean(window.STUDY_DATA && Array.isArray(window.STUDY_DATA.categories));

  let SEARCH_INDEX = [];

  function buildIndex() {
    window.STUDY_DATA.categories.forEach(function (category) {
      category.subjects.forEach(function (subject) {
        const entry = {
          subject: subject,
          category: category,
          accent: subject.accent || category.accent || "indigo"
        };
        SUBJECTS.push(entry);
        SUBJECT_MAP.set(subject.id, entry);
        if (window.QuestionaireBanks) window.QuestionaireBanks.sample(subject, 20);
        subject.questions.forEach(function (question) {
          registerQuestion(question, entry);
        });
      });
    });
  }

  function registerQuestion(question, entry) {
    QUESTION_MAP.set(question.id, {
      question: question,
      subject: entry.subject,
      category: entry.category,
      entry: entry
    });
  }

  function questionTotal(subject) {
    return Math.max(Number(subject.questionTarget) || 0, subject.questions.length);
  }

  function formatCount(value) {
    return Number(value || 0).toLocaleString("en-US");
  }

  function isBankQuestionIdForSubject(id, subject) {
    return String(id).indexOf(subject.id + "-g") === 0;
  }

  function isKnownQuestionId(id) {
    if (QUESTION_MAP.has(id)) return true;
    return SUBJECTS.some(function (entry) {
      return isBankQuestionIdForSubject(id, entry.subject);
    });
  }

  function ensureSubjectBank(entry) {
    if (!entry) return;
    const subject = entry.subject;
    const before = subject.questions.length;
    if (window.QuestionaireBanks) window.QuestionaireBanks.ensure(subject);
    for (let index = before; index < subject.questions.length; index += 1) {
      registerQuestion(subject.questions[index], entry);
    }
  }

  function ensureReviewBanks() {
    const ids = progress.bookmarks.concat(progress.mistakes);
    if (!ids.length) return;
    if (window.QuestionaireBanks && typeof window.QuestionaireBanks.ensureForIds === "function") {
      window.QuestionaireBanks.ensureForIds(ids);
    }
    SUBJECTS.forEach(function (entry) {
      if (ids.some(function (id) { return isBankQuestionIdForSubject(id, entry.subject); })) {
        ensureSubjectBank(entry);
      }
    });
  }

  /* --------------------------------------------------------------------------
     Theme
     -------------------------------------------------------------------------- */

  function getTheme() {
    const current = document.documentElement.getAttribute("data-theme");
    return THEMES.indexOf(current) >= 0 ? current : "dark";
  }

  function syncThemeButtons() {
    const theme = getTheme();
    document.querySelectorAll("[data-theme-set]").forEach(function (button) {
      const active = button.getAttribute("data-theme-set") === theme;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", String(active));
    });
  }

  function applyTheme(theme, persist) {
    if (THEMES.indexOf(theme) < 0) theme = "dark";
    const root = document.documentElement;
    root.setAttribute("data-theme", theme);
    root.style.colorScheme = theme === "light" ? "light" : "dark";
    const meta = document.getElementById("theme-color");
    if (meta) meta.setAttribute("content", THEME_COLORS[theme]);
    if (persist) {
      try {
        window.localStorage.setItem(THEME_KEY, theme);
      } catch (error) {
        /* Private mode: the theme still applies for this session. */
      }
    }
    syncThemeButtons();
  }

  /* --------------------------------------------------------------------------
     State
     -------------------------------------------------------------------------- */

  const state = {
    route: { name: "dashboard" },
    routeKey: "",
    filters: {},
    cards: {},
    reviewFilter: "all"
  };

  let exam = null;
  let examTimer = null;
  let pendingTarget = null;
  let searchResults = [];
  let searchDebounce = null;
  let toastTimer = null;

  let accountStore = { version: 1, activeId: null, accounts: [] };
  let activeAccount = null;
  let storageKey = null;
  let legacyGuestProgress = null;
  let authRedirect = null;

  let cloud = null;
  let cloudState = { configured: false, status: "unconfigured", user: null, error: null };
  let cloudUid = null;
  let cloudHydrating = false;
  let cloudSaveTimer = null;
  let focusQid = null;

  /* --------------------------------------------------------------------------
     Progress
     -------------------------------------------------------------------------- */

  function defaultProgress() {
    return {
      version: 1,
      answered: {},
      xp: 0,
      streak: 0,
      bestStreak: 0,
      lastStudyDate: null,
      bookmarks: [],
      mistakes: []
    };
  }

  let progress = defaultProgress();

  function readAccountStore() {
    try {
      const value = JSON.parse(window.localStorage.getItem(ACCOUNTS_KEY) || "null");
      if (!value || !Array.isArray(value.accounts)) return { version: 1, activeId: null, accounts: [] };
      value.accounts = value.accounts.filter(function (account) {
        return account && typeof account.id === "string" && typeof account.name === "string";
      });
      return value;
    } catch (error) {
      return { version: 1, activeId: null, accounts: [] };
    }
  }

  function persistAccountStore() {
    try {
      window.localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accountStore));
    } catch (error) {
      /* The signed-in profile remains in memory if storage is unavailable. */
    }
  }

  function accountStorageKey(id) {
    return STORAGE_KEY + ".account." + id;
  }

  function cloudStorageKey(uid) {
    return STORAGE_KEY + ".cloud." + uid;
  }

  function cloudIdentity() {
    return cloudState.user && !cloudState.user.isAnonymous ? cloudState.user : null;
  }

  function hasIdentity() {
    return Boolean(cloudIdentity() || activeAccount);
  }

  function currentAccountKey() {
    return activeAccount ? accountStorageKey(activeAccount.id) : null;
  }

  function findAccount(id) {
    return accountStore.accounts.find(function (account) { return account.id === id; }) || null;
  }

  function hasProgressData(value) {
    if (!value || typeof value !== "object") return false;
    return Boolean(
      (value.answered && Object.keys(value.answered).length) ||
      Number(value.xp) ||
      Number(value.streak) ||
      (Array.isArray(value.bookmarks) && value.bookmarks.length) ||
      (Array.isArray(value.mistakes) && value.mistakes.length)
    );
  }

  function initialiseAccounts() {
    accountStore = readAccountStore();
    activeAccount = accountStore.activeId ? findAccount(accountStore.activeId) : null;
    if (!activeAccount && accountStore.activeId) accountStore.activeId = null;
    storageKey = currentAccountKey();
  }

  function takeLegacyGuestProgress() {
    const legacy = storedProgress(STORAGE_KEY);
    return legacy && hasProgressData(legacy) ? legacy : null;
  }

  function clearLegacyGuestProgress() {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      /* The record is already removed from the active identity. */
    }
  }

  function storedProgress(key) {
    try {
      const value = JSON.parse(window.localStorage.getItem(key) || "null");
      return value && typeof value === "object" ? value : null;
    } catch (error) {
      return null;
    }
  }

  function mergeProgress(local, remote) {
    const left = Object.assign(defaultProgress(), local && typeof local === "object" ? local : {});
    const right = Object.assign(defaultProgress(), remote && typeof remote === "object" ? remote : {});
    const answered = {};
    const ids = new Set(Object.keys(left.answered || {}).concat(Object.keys(right.answered || {})));
    ids.forEach(function (id) {
      if (!isKnownQuestionId(id)) return;
      const a = left.answered[id] || {};
      const b = right.answered[id] || {};
      const firstCorrect = [a.firstCorrect, b.firstCorrect].filter(Boolean).sort()[0] || null;
      answered[id] = {
        attempts: Math.max(Number(a.attempts) || 0, Number(b.attempts) || 0),
        correct: Math.max(Number(a.correct) || 0, Number(b.correct) || 0),
        firstCorrect: firstCorrect,
        last: [a.last, b.last].filter(Boolean).sort().pop() || null
      };
    });

    const bookmarks = Array.from(new Set((left.bookmarks || []).concat(right.bookmarks || []))).filter(isKnownQuestionId);
    const mistakes = Array.from(new Set((left.mistakes || []).concat(right.mistakes || []))).filter(isKnownQuestionId);
    const lastStudyDate = [left.lastStudyDate, right.lastStudyDate].filter(Boolean).sort().pop() || null;

    return {
      version: 1,
      answered: answered,
      xp: Math.max(Number(left.xp) || 0, Number(right.xp) || 0),
      streak: Math.max(Number(left.streak) || 0, Number(right.streak) || 0),
      bestStreak: Math.max(Number(left.bestStreak) || 0, Number(right.bestStreak) || 0),
      lastStudyDate: lastStudyDate,
      bookmarks: bookmarks,
      mistakes: mistakes
    };
  }

  function persistLocal() {
    if (!storageKey) return;
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(progress));
    } catch (error) {
      /* Progress remains in memory if storage is unavailable. */
    }
  }

  function scheduleCloudSave() {
    if (!cloud || !cloudState.user || cloudHydrating) return;
    window.clearTimeout(cloudSaveTimer);
    cloudSaveTimer = window.setTimeout(function () {
      if (!cloud || !cloudState.user || cloudHydrating) return;
      cloud.saveProgress(progress).catch(function () {
        /* The local record is still authoritative; the next answer retries. */
      });
    }, 700);
  }

  function loadProgress() {
    if (!storageKey) {
      progress = defaultProgress();
      return;
    }
    const stored = storedProgress(storageKey);
    const merged = Object.assign(defaultProgress(), stored && typeof stored === "object" ? stored : {});
    if (!merged.answered || typeof merged.answered !== "object") merged.answered = {};
    if (!Array.isArray(merged.bookmarks)) merged.bookmarks = [];
    if (!Array.isArray(merged.mistakes)) merged.mistakes = [];
    merged.bookmarks = merged.bookmarks.filter(isKnownQuestionId);
    merged.mistakes = merged.mistakes.filter(isKnownQuestionId);
    merged.xp = Number(merged.xp) || 0;
    merged.streak = Number(merged.streak) || 0;
    merged.bestStreak = Number(merged.bestStreak) || 0;
    progress = merged;
    normalizeStreak();
  }

  function saveProgress() {
    persistLocal();
    scheduleCloudSave();
  }

  function reloadProgress() {
    progress = defaultProgress();
    loadProgress();
    state.cards = {};
    exam = null;
    pendingTarget = null;
    normalizeStreak();
  }

  function createLocalAccount(name, email) {
    if (cloudIdentity()) {
      toast("Sign out of your cloud account before creating an offline profile.", "is-warn");
      return false;
    }
    const cleanName = String(name || "").trim().slice(0, 40);
    const cleanEmail = String(email || "").trim().slice(0, 120);
    if (!cleanName) {
      toast("Add a display name first.", "is-warn");
      return false;
    }
    const existing = accountStore.accounts.find(function (account) {
      return account.name.toLowerCase() === cleanName.toLowerCase();
    });
    if (existing) {
      switchLocalAccount(existing.id);
      return false;
    }

    const guestCopy = !accountStore.accounts.length ? legacyGuestProgress : null;
    legacyGuestProgress = null;
    persistLocal();
    const account = {
      id: "local-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 7),
      name: cleanName,
      email: cleanEmail,
      createdAt: new Date().toISOString()
    };
    const nextKey = accountStorageKey(account.id);
    if (guestCopy && hasProgressData(guestCopy)) {
      try {
        window.localStorage.setItem(nextKey, JSON.stringify(guestCopy));
      } catch (error) {
        /* The account still starts with the in-memory record. */
      }
    }
    clearLegacyGuestProgress();
    accountStore.accounts.push(account);
    accountStore.activeId = account.id;
    activeAccount = account;
    storageKey = nextKey;
    persistAccountStore();
    reloadProgress();
    paint();
    toast("Signed in as " + account.name + " on this device.");
    return true;
  }

  function switchLocalAccount(id) {
    const account = findAccount(id);
    if (!account || (activeAccount && activeAccount.id === id)) return;
    if (cloudState.user) {
      toast("Sign out of your cloud account before switching offline profiles.", "is-warn");
      return;
    }
    persistLocal();
    activeAccount = account;
    accountStore.activeId = account.id;
    storageKey = accountStorageKey(account.id);
    persistAccountStore();
    reloadProgress();
    paint();
    toast("Signed in as " + account.name + ".");
  }

  function signOutLocal() {
    if (!activeAccount) return;
    persistLocal();
    const name = activeAccount.name;
    activeAccount = null;
    accountStore.activeId = null;
    storageKey = null;
    persistAccountStore();
    reloadProgress();
    authRedirect = null;
    go("#/login");
    toast("Signed out of " + name + ".");
  }

  function deleteLocalAccount(id) {
    const account = findAccount(id);
    if (!account) return;
    if (!window.confirm("Delete the local profile \"" + account.name + "\" and its progress on this device?")) return;
    const wasActive = activeAccount && activeAccount.id === id;
    accountStore.accounts = accountStore.accounts.filter(function (item) { return item.id !== id; });
    if (accountStore.activeId === id) accountStore.activeId = null;
    try {
      window.localStorage.removeItem(accountStorageKey(id));
    } catch (error) {
      /* ignore */
    }
    if (wasActive) {
      activeAccount = null;
      storageKey = null;
      reloadProgress();
      authRedirect = null;
    }
    persistAccountStore();
    if (wasActive) go("#/login");
    else paint();
    toast("Local profile deleted.", "is-warn");
  }

  function resumeAfterAuth() {
    const target = authRedirect || "#/dashboard";
    authRedirect = null;
    if (state.route && state.route.name === "login") go(target);
  }

  function activateCloudUser(nextUser) {
    if (!nextUser || nextUser.isAnonymous || cloudUid === nextUser.uid) return;
    const previousProgress = progress;
    persistLocal();
    cloudUid = nextUser.uid;
    const key = cloudStorageKey(nextUser.uid);
    const cached = storedProgress(key);
    let seed = cached;
    if (hasProgressData(previousProgress)) seed = mergeProgress(cached, previousProgress);
    if (!seed && legacyGuestProgress) seed = legacyGuestProgress;
    if (seed && hasProgressData(seed)) {
      try {
        window.localStorage.setItem(key, JSON.stringify(seed));
      } catch (error) {
        /* The cloud record is still hydrated below. */
      }
    }
    clearLegacyGuestProgress();
    legacyGuestProgress = null;
    storageKey = key;
    reloadProgress();
    hydrateCloud(nextUser);
    if (state.route && state.route.name === "login") resumeAfterAuth();
    else paint();
  }

  function deactivateCloudUser() {
    if (!cloudUid) return;
    persistLocal();
    cloudUid = null;
    storageKey = currentAccountKey();
    reloadProgress();
    if (activeAccount) {
      paint();
    } else {
      authRedirect = null;
      go("#/login");
    }
  }

  function dateKey(date) {
    return [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, "0"),
      String(date.getDate()).padStart(2, "0")
    ].join("-");
  }

  function dayOffset(key) {
    if (!key) return null;
    const parts = String(key).split("-").map(Number);
    if (parts.length !== 3 || parts.some(isNaN)) return null;
    const then = new Date(parts[0], parts[1] - 1, parts[2]);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return Math.round((today.getTime() - then.getTime()) / 86400000);
  }

  function normalizeStreak() {
    if (!progress.lastStudyDate) return;
    const offset = dayOffset(progress.lastStudyDate);
    if (offset !== null && offset > 1) progress.streak = 0;
  }

  function touchStreak() {
    const today = dateKey(new Date());
    if (progress.lastStudyDate === today) return;
    if (dayOffset(progress.lastStudyDate) === 1) progress.streak += 1;
    else progress.streak = 1;
    progress.lastStudyDate = today;
    progress.bestStreak = Math.max(progress.bestStreak || 0, progress.streak);
  }

  function getStats() {
    const records = Object.values(progress.answered || {});
    let attempts = 0;
    let correct = 0;
    records.forEach(function (record) {
      attempts += Number(record.attempts) || 0;
      correct += Number(record.correct) || 0;
    });
    const level = Math.floor((progress.xp || 0) / XP_PER_LEVEL) + 1;
    const levelXp = (progress.xp || 0) % XP_PER_LEVEL;
    return {
      solved: records.length,
      attempts: attempts,
      correct: correct,
      accuracy: attempts > 0 ? Math.round((correct / attempts) * 100) : 0,
      xp: progress.xp || 0,
      level: level,
      levelXp: levelXp,
      levelProgress: Math.round((levelXp / XP_PER_LEVEL) * 100),
      xpToNext: XP_PER_LEVEL - levelXp,
      streak: progress.streak || 0,
      bestStreak: progress.bestStreak || 0,
      rank: RANKS[Math.min(level - 1, RANKS.length - 1)]
    };
  }

  function subjectStats(subject) {
    let solved = 0;
    let attempts = 0;
    let correct = 0;
    const loaded = new Set(subject.questions.map(function (question) { return question.id; }));
    Object.keys(progress.answered || {}).forEach(function (id) {
      if (!loaded.has(id) && !isBankQuestionIdForSubject(id, subject)) return;
      const record = progress.answered[id];
      if (!record) return;
      solved += 1;
      attempts += Number(record.attempts) || 0;
      correct += Number(record.correct) || 0;
    });
    const total = questionTotal(subject);
    return {
      solved: solved,
      total: total,
      accuracy: attempts > 0 ? Math.round((correct / attempts) * 100) : 0,
      pct: total > 0 ? Math.round((solved / total) * 100) : 0
    };
  }

  function recordAnswer(questionId, isCorrect) {
    if (!QUESTION_MAP.has(questionId)) return;
    const record = progress.answered[questionId] || { attempts: 0, correct: 0, last: null };
    record.attempts = (Number(record.attempts) || 0) + 1;
    record.correct = (Number(record.correct) || 0) + (isCorrect ? 1 : 0);
    const now = new Date().toISOString();
    record.last = now;
    if (isCorrect && !record.firstCorrect) record.firstCorrect = now;
    progress.answered[questionId] = record;
    progress.xp = (progress.xp || 0) + (isCorrect ? XP_PER_CORRECT : XP_PER_ATTEMPT);
    if (!isCorrect && progress.mistakes.indexOf(questionId) < 0) {
      progress.mistakes.push(questionId);
    }
    touchStreak();
    saveProgress();
  }

  function reviewMap() {
    const items = new Map();
    progress.mistakes.forEach(function (id) {
      if (QUESTION_MAP.has(id)) items.set(id, { reasons: ["missed"] });
    });
    progress.bookmarks.forEach(function (id) {
      if (!QUESTION_MAP.has(id)) return;
      const item = items.get(id) || { reasons: [] };
      if (item.reasons.indexOf("starred") < 0) item.reasons.push("starred");
      items.set(id, item);
    });
    return items;
  }

  function reviewCount() {
    const ids = new Set(progress.bookmarks.concat(progress.mistakes));
    let count = 0;
    ids.forEach(function (id) {
      if (isKnownQuestionId(id)) count += 1;
    });
    return count;
  }

  function toggleBookmark(questionId) {
    const index = progress.bookmarks.indexOf(questionId);
    if (index >= 0) {
      progress.bookmarks.splice(index, 1);
      toast("Bookmark removed.", "is-warn");
    } else {
      progress.bookmarks.push(questionId);
      toast("Saved to the review queue.");
    }
    saveProgress();
    updateChrome();
  }

  /* --------------------------------------------------------------------------
     Utilities
     -------------------------------------------------------------------------- */

  function esc(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (character) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[character];
    });
  }

  function plain(value) {
    return String(value == null ? "" : value)
      .replace(/\$\$?/g, " ")
      .replace(/\\[a-zA-Z]+/g, " ")
      .replace(/[{}\\]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function formatTime(totalSeconds) {
    const safe = Math.max(0, Math.ceil(totalSeconds));
    return Math.floor(safe / 60) + ":" + String(safe % 60).padStart(2, "0");
  }

  function plural(count, singular, pluralWord) {
    return count === 1 ? singular : pluralWord;
  }

  function pad2(value) {
    return String(value).padStart(2, "0");
  }

  function badgeClass(level) {
    const value = String(level || "").toLowerCase();
    if (value === "beginner") return "badge-beginner";
    if (value === "advanced") return "badge-advanced";
    return "badge-intermediate";
  }

  function accentClass(entry) {
    return "accent-" + (entry.accent || "indigo");
  }

  function refreshIcons() {
    if (window.lucide && typeof window.lucide.createIcons === "function") {
      try {
        window.lucide.createIcons();
      } catch (error) {
        /* Icons are decorative. */
      }
    }
  }

  function typeset(root) {
    if (!root || typeof window.renderMathInElement !== "function") return;
    try {
      window.renderMathInElement(root, {
        delimiters: [
          { left: "$$", right: "$$", display: true },
          { left: "$", right: "$", display: false },
          { left: "\\[", right: "\\]", display: true },
          { left: "\\(", right: "\\)", display: false }
        ],
        throwOnError: false,
        strict: false,
        ignoredClasses: ["no-math"]
      });
    } catch (error) {
      /* Keep the raw formula visible if KaTeX fails. */
    }
  }

  function toast(message, variant) {
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.className = "toast show" + (variant ? " " + variant : "");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      toastEl.className = "toast";
    }, 2600);
  }

  function setText(id, value) {
    const element = document.getElementById(id);
    if (element) element.textContent = String(value);
  }

  function getFilters(subjectId) {
    if (!state.filters[subjectId]) {
      state.filters[subjectId] = { difficulty: "All", mode: "practice", limit: 20 };
    }
    if (!Number(state.filters[subjectId].limit)) state.filters[subjectId].limit = 20;
    return state.filters[subjectId];
  }

  function filteredQuestions(subject, difficulty) {
    if (!difficulty || difficulty === "All") return subject.questions.slice();
    return subject.questions.filter(function (question) {
      return question.difficulty === difficulty;
    });
  }

  function emptyState(icon, title, text, cta) {
    return (
      '<div class="empty-state">' +
      '<span class="empty-state-icon"><i data-lucide="' + esc(icon) + '"></i></span>' +
      "<h3>" + esc(title) + "</h3>" +
      "<p>" + esc(text) + "</p>" +
      (cta || "") +
      "</div>"
    );
  }

  /* --------------------------------------------------------------------------
     Chrome and sidebar
     -------------------------------------------------------------------------- */

  function accountCardHTML() {
    const user = cloudIdentity();
    if (user) {
      const name = user.displayName || user.email || "Cloud account";
      const provider = user.provider === "google.com" ? "Google account" : "Email account";
      const note = cloudState.status === "error"
        ? (cloudState.error || "Cloud sync needs attention.")
        : provider + " · synced";
      return (
        '<div class="account-summary">' +
        '<span class="account-avatar">' + esc(name.charAt(0).toUpperCase()) + "</span>" +
        '<div class="account-copy"><strong>' + esc(name) + "</strong><small>" + esc(user.email || provider) + "</small></div>" +
        "</div>" +
        '<div class="account-actions"><a class="account-btn" href="#/login"><i data-lucide="user-round"></i>Manage profile</a></div>' +
        '<p class="account-note">' + esc(note) + "</p>"
      );
    }

    if (activeAccount) {
      const name = activeAccount.name;
      const detail = activeAccount.email || "Device profile";
      const syncNote = "Local profile · offline only";
      return (
        '<div class="account-summary">' +
        '<span class="account-avatar">' + esc(name.charAt(0).toUpperCase()) + "</span>" +
        '<div class="account-copy"><strong>' + esc(name) + "</strong><small>" + esc(detail) + "</small></div>" +
        "</div>" +
        '<div class="account-actions"><a class="account-btn" href="#/login"><i data-lucide="user-round"></i>Manage profile</a></div>' +
        '<p class="account-note">' + esc(syncNote) + "</p>"
      );
    }

    return (
      '<div class="account-summary">' +
      '<span class="account-avatar account-avatar-guest">!</span>' +
      '<div class="account-copy"><strong>Sign in required</strong><small>Use a cloud account or an offline profile.</small></div>' +
      "</div>" +
      '<div class="account-actions"><a class="account-btn" href="#/login"><i data-lucide="log-in"></i>Sign in</a></div>' +
      '<p class="account-note">' + (cloudState.configured ? "Email/password and Google are available." : "Cloud login needs Firebase; local profiles work now.") + "</p>"
    );
  }

  function updateAccountUI() {
    const panel = document.getElementById("account-panel");
    if (panel) panel.innerHTML = accountCardHTML();
    const note = document.getElementById("sidebar-note");
    if (note) {
      const user = cloudIdentity();
      note.textContent = user
        ? (user.provider === "google.com" ? "Google account · synced" : "Email account · synced")
        : activeAccount
        ? "Local profile · offline only"
        : "Sign in required";
    }
  }

  async function hydrateCloud(user) {
    if (!cloud || !user || cloudHydrating) return;
    cloudHydrating = true;
    window.clearTimeout(cloudSaveTimer);
    try {
      const remote = await cloud.loadProgress();
      if (!cloudState.user || cloudState.user.uid !== user.uid) return;
      if (remote) {
        progress = mergeProgress(progress, remote);
        normalizeStreak();
        persistLocal();
      }
      cloudUid = user.uid;
      await cloud.saveProgress(progress);
      if (state.routeKey) paint();
      toast("Signed in — cloud progress merged.");
    } catch (error) {
      toast("Cloud sync is unavailable. Local progress is safe.", "is-warn");
    } finally {
      cloudHydrating = false;
    }
  }

  function handleCloudState(snapshot) {
    cloudState = snapshot || { configured: false, status: "unconfigured", user: null, error: null };
    updateAccountUI();
    const user = cloudIdentity();
    if (user) {
      activateCloudUser(user);
    } else if (cloudUid) {
      deactivateCloudUser();
    } else if (state.routeKey && (state.route.name === "settings" || state.route.name === "login")) {
      paint();
    }
  }

  function attachCloud(api) {
    if (!api || cloud === api) return;
    cloud = api;
    if (typeof api.onChange === "function") {
      api.onChange(handleCloudState);
    } else {
      handleCloudState(api.state || cloudState);
    }
  }

  function runCloudAction(action) {
    if (!cloud || !cloud.configured) {
      toast("Add your Firebase web config before signing in.", "is-warn");
      return;
    }
    if (action === "google-signin") {
      cloud.signInGoogle().catch(function () {
        /* The cloud state carries the friendly error. */
      });
    } else if (action === "cloud-signout") {
      cloud.signOut().catch(function () {
        /* The cloud state carries the friendly error. */
      });
    }
  }

  function runAccountAction(action, trigger) {
    if (action === "local-signout") {
      signOutLocal();
      return;
    }
    if (action === "local-switch") {
      switchLocalAccount(trigger.getAttribute("data-account"));
      if (activeAccount && state.route.name === "login") go("#/dashboard");
      return;
    }
    if (action === "local-delete") {
      deleteLocalAccount(trigger.getAttribute("data-account"));
      return;
    }
    runCloudAction(action);
  }

  function updateChrome() {
    const stats = getStats();
    setText("stat-streak", stats.streak);
    setText("stat-xp", stats.xp);
    setText("stat-level", stats.level);
    setText("saved-count", reviewCount());
    updateAccountUI();

    const panel = document.getElementById("sidebar-level");
    const footerMeta = document.getElementById("footer-meta");
    if (footerMeta) {
      footerMeta.textContent = "Vol. 1 · " + SUBJECTS.length + " subjects · Set in Instrument Serif & IBM Plex";
    }

    if (panel) {
      panel.innerHTML =
        '<div class="sidebar-level-top">' +
        '<span class="sidebar-level-rank">' + esc(stats.rank) + "</span>" +
        '<span class="sidebar-level-xp">' + stats.xp + " XP</span>" +
        "</div>" +
        '<div class="progress"><div class="progress-bar" style="width:' + stats.levelProgress + '%"></div></div>' +
        '<div class="sidebar-level-xp" style="margin-top:6px">Level ' + stats.level + " · " + stats.levelXp + "/" + XP_PER_LEVEL + " XP</div>";
    }

    document.querySelectorAll("[data-nav]").forEach(function (link) {
      link.classList.toggle("active", link.getAttribute("data-nav") === state.route.name);
    });
    document.querySelectorAll("[data-nav-subject]").forEach(function (link) {
      link.classList.toggle(
        "active",
        state.route.name === "subject" &&
          link.getAttribute("data-nav-subject") === state.route.subjectId
      );
    });
  }

  function renderSidebar() {
    sidebarNav.innerHTML = window.STUDY_DATA.categories
      .map(function (category, categoryIndex) {
        const subjects = category.subjects
          .map(function (subject, subjectIndex) {
            return (
              '<a class="nav-subject accent-' + esc(subject.accent || category.accent) + '" ' +
              'href="#/subject/' + esc(subject.id) + '/practice" data-nav-subject="' + esc(subject.id) + '">' +
              '<span class="nav-subject-index">' + pad2(subjectIndex + 1) + "</span>" +
              '<span class="nav-subject-title">' + esc(subject.title) + "</span>" +
              '<span class="nav-subject-level">' + formatCount(questionTotal(subject)) + "</span></a>"
            );
          })
          .join("");
        const isCurrent = state.route.name === "subject" && category.subjects.some(function (subject) {
          return subject.id === state.route.subjectId;
        });
        return (
          '<div class="nav-group accent-' + esc(category.accent) + (isCurrent ? "" : " collapsed") + '">' +
          '<button class="nav-group-head" type="button" aria-expanded="' + (isCurrent ? "true" : "false") + '">' +
          '<span class="nav-group-index">' + pad2(categoryIndex + 1) + "</span>" +
          '<span class="nav-group-title">' + esc(category.title) + "</span>" +
          '<span class="nav-group-count">' + category.subjects.length + "</span>" +
          '<i data-lucide="chevron-down" class="nav-chevron"></i>' +
          "</button>" +
          '<div class="nav-subjects">' + subjects + "</div>" +
          "</div>"
        );
      })
      .join("");
    refreshIcons();
  }

  /* --------------------------------------------------------------------------
     Router
     -------------------------------------------------------------------------- */

  function parseHash() {
    const parts = window.location.hash.replace(/^#\/?/, "").split("/").filter(Boolean);
    if (parts[0] === "subject" && SUBJECT_MAP.has(parts[1])) {
      return {
        name: "subject",
        subjectId: parts[1],
        tab: TAB_IDS.indexOf(parts[2]) >= 0 ? parts[2] : "practice"
      };
    }
    if (parts[0] === "browse") {
      const category = window.STUDY_DATA && window.STUDY_DATA.categories.some(function (item) {
        return item.id === parts[1];
      }) ? parts[1] : "all";
      const tracks = ["arts", "english", "history", "math-cs", "sciences", "languages", "capstone", "career"];
      return {
        name: "browse",
        category: category,
        track: tracks.indexOf(parts[2]) >= 0 ? parts[2] : "all"
      };
    }
    if (parts[0] === "review" || parts[0] === "saved") return { name: "review" };
    if (parts[0] === "settings") return { name: "settings" };
    if (parts[0] === "login") return { name: "login" };
    return { name: "dashboard" };
  }

  function routeKey(route) {
    return route.name + ":" + (route.subjectId || "") + ":" + (route.tab || "") + ":" + (route.category || "") + ":" + (route.track || "");
  }

  function go(hash) {
    closeSearch(true);
    closeSidebar();
    if (window.location.hash === hash) render();
    else window.location.hash = hash;
  }

  function examMatches(route) {
    return Boolean(
      exam &&
        route.name === "subject" &&
        route.tab === "practice" &&
        route.subjectId === exam.subjectId
    );
  }

  function render() {
    const route = parseHash();
    if (!hasIdentity() && route.name !== "login" && route.name !== "settings") {
      authRedirect = window.location.hash || "#/dashboard";
      go("#/login");
      return;
    }
    const key = routeKey(route);
    const changed = key !== state.routeKey;
    state.route = route;
    state.routeKey = key;

    if (changed) {
      state.cards = {};
      renderSidebar();
    }
    if (exam && !examMatches(route)) {
      exam = null;
      stopExamTimer();
    }

    document.title =
      route.name === "subject"
        ? "Questionaire — " + SUBJECT_MAP.get(route.subjectId).subject.title
        : route.name === "browse"
        ? "Questionaire — Browse subjects"
        : route.name === "review"
        ? "Questionaire — Review queue"
        : route.name === "settings"
        ? "Questionaire — Settings"
        : route.name === "login"
        ? "Questionaire — Sign in"
        : "Questionaire — A Study Annual";

    paint();

    if (changed && !pendingTarget) window.scrollTo(0, 0);
    applyPendingTarget();
  }

  function paint() {
    renderView();
    updateChrome();
    refreshIcons();
    typeset(view);
    syncThemeButtons();
    updateSearchClear();
  }

  function renderView() {
    if (!DATA_READY) {
      view.innerHTML = emptyState(
        "triangle-alert",
        "Study database not found",
        "Make sure database.js sits next to index.html and defines window.STUDY_DATA.",
        ""
      );
      return;
    }
    switch (state.route.name) {
      case "subject":
        renderSubject();
        break;
      case "browse":
        renderBrowse();
        break;
      case "review":
        renderReview();
        break;
      case "settings":
        renderSettings();
        break;
      case "login":
        renderLogin();
        break;
      default:
        renderDashboard();
    }
  }

  function applyPendingTarget() {
    if (!pendingTarget) return;
    const selector = pendingTarget;
    pendingTarget = null;
    const element = view.querySelector(selector);
    focusQid = null;
    if (!element) return;
    element.classList.add("is-target");
    element.scrollIntoView({ block: "center", behavior: "smooth" });
  }

  /* --------------------------------------------------------------------------
     Dashboard
     -------------------------------------------------------------------------- */

  function greeting() {
    const hour = new Date().getHours();
    if (hour < 5) return "Still up";
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  }

  function recommendedEntry() {
    for (let i = 0; i < SUBJECTS.length; i += 1) {
      const entry = SUBJECTS[i];
      if (subjectStats(entry.subject).solved < questionTotal(entry.subject)) {
        return entry;
      }
    }
    return SUBJECTS[0];
  }

  function continueEntries() {
    const active = SUBJECTS.map(function (entry) {
      return { entry: entry, solved: subjectStats(entry.subject).solved };
    })
      .filter(function (item) { return item.solved > 0; })
      .sort(function (a, b) { return b.solved - a.solved; })
      .slice(0, 3)
      .map(function (item) { return item.entry; });
    if (active.length) return active;
    const starterCategories = ["mathematics", "sciences", "languages"];
    const starters = starterCategories.map(function (categoryId) {
      return SUBJECTS.find(function (entry) { return entry.category.id === categoryId; });
    }).filter(Boolean);
    return starters.length ? starters : SUBJECTS.slice(0, 3);
  }

  function statCard(options) {
    return (
      '<article class="stat-card ' + options.accent + '">' +
      '<span class="stat-card-label">' + esc(options.label) + "</span>" +
      '<div class="stat-card-value">' + options.value +
      (options.unit ? "<small>" + esc(options.unit) + "</small>" : "") +
      "</div>" +
      '<p class="stat-card-foot">' + options.foot + "</p>" +
      "</article>"
    );
  }

  function subjectCardHTML(entry) {
    const subject = entry.subject;
    const stats = subjectStats(subject);
    const index = SUBJECTS.indexOf(entry) + 1;
    const tags = subject.tags.slice(0, 3).map(function (tag) {
      return '<span class="tag">' + esc(tag) + "</span>";
    }).join("");
    return (
      '<a class="subject-card ' + accentClass(entry) + '" href="#/subject/' + esc(subject.id) + '/practice">' +
      '<div class="subject-card-top">' +
      '<span class="subject-index">' + pad2(index) + "</span>" +
      '<span class="subject-icon"><i data-lucide="' + esc(subject.icon) + '"></i></span>' +
      '<span class="badge ' + badgeClass(subject.level) + '">' + esc(subject.level) + "</span>" +
      "</div>" +
      '<h3 class="subject-title">' + esc(subject.title) + "</h3>" +
      '<p class="subject-blurb">' + esc(subject.blurb) + "</p>" +
      '<div class="subject-tags">' + tags + "</div>" +
      '<div class="subject-progress"><div class="progress"><div class="progress-bar" style="width:' + stats.pct + '%"></div></div></div>' +
      '<div class="subject-meta">' +
      '<span><i data-lucide="circle-help"></i>' + stats.total + " Qs</span>" +
      '<span><i data-lucide="book-open"></i>' + subject.study.length + "</span>" +
      '<span><i data-lucide="play"></i>' + subject.videos.length + "</span>" +
      '<span class="subject-pct">' + stats.solved + "/" + stats.total + "</span>" +
      "</div></a>"
    );
  }

  function renderDashboard() {
    const stats = getStats();
    const totalQuestions = SUBJECTS.reduce(function (sum, entry) {
      return sum + questionTotal(entry.subject);
    }, 0);
    const categories = window.STUDY_DATA.categories;
    const apCategory = categories.find(function (category) { return category.id === "ap-courses"; });
    const featuredAp = apCategory ? apCategory.subjects.slice(0, 6) : [];
    const examCategory = categories.find(function (category) { return category.id === "exam-prep"; });
    const featuredExams = examCategory ? examCategory.subjects : [];
    const otherCategories = categories.filter(function (category) {
      return category.id !== "ap-courses" && category.id !== "exam-prep";
    });
    const starts = continueEntries();
    const continueLabel = stats.solved > 0 ? "Pick up where you left off" : "Good places to start";

    const categoryRows = otherCategories.map(function (category, index) {
      return (
        '<a class="category-row accent-' + esc(category.accent) + '" href="#/browse/' + esc(category.id) + '">' +
        '<span class="category-row-icon"><i data-lucide="' + esc(category.icon) + '"></i></span>' +
        '<span class="category-row-body"><strong>' + esc(category.title) + '</strong><small>' + esc(category.tagline) + '</small></span>' +
        '<span class="category-row-count">' + category.subjects.length + ' subjects</span>' +
        '<i data-lucide="chevron-right" class="category-row-arrow"></i></a>'
      );
    }).join("");

    view.innerHTML =
      '<div class="view-inner dashboard-home">' +
      '<section class="home-intro">' +
      '<div class="home-intro-copy">' +
      '<span class="eyebrow">Study annual · Vol. 1 · 2026-27</span>' +
      '<h1>What are we studying today?</h1>' +
      '<p>Find your course, answer a few questions, and get an explanation you can actually use. Sign in once, then keep the noise out and do the work.</p>' +
      '<button class="home-search" type="button" data-action="focus-search">' +
      '<i data-lucide="search"></i><span>Search subjects, topics or questions</span><kbd aria-hidden="true">/</kbd></button>' +
      '<div class="home-actions">' +
      '<a class="btn btn-primary" href="#/browse"><span>Browse all ' + SUBJECTS.length + ' subjects</span><i data-lucide="arrow-right"></i></a>' +
      '<a class="btn btn-ghost" href="#/browse/ap-courses"><span>AP courses</span><span class="btn-count">' + (apCategory ? apCategory.subjects.length : 0) + '</span></a>' +
      '</div></div>' +
      '<aside class="home-record">' +
      '<div class="record-head"><span>Your record</span><span>Level ' + stats.level + ' · ' + esc(stats.rank) + '</span></div>' +
      '<div class="record-grid">' +
      '<div class="record-stat"><strong>' + formatCount(stats.solved) + '</strong><span>of ' + formatCount(totalQuestions) + ' solved</span></div>' +
      '<div class="record-stat"><strong>' + stats.accuracy + '%</strong><span>accuracy</span></div>' +
      '<div class="record-stat"><strong>' + stats.streak + '</strong><span>' + plural(stats.streak, "day", "days") + ' streak</span></div>' +
      '</div>' +
      '<div class="record-xp"><span>' + stats.xp + ' XP</span><span>' + stats.xpToNext + ' XP to next level</span></div>' +
      '<div class="progress"><div class="progress-bar" style="width:' + stats.levelProgress + '%"></div></div>' +
      '<a class="record-review" href="#/review"><span>Review queue</span><b>' + reviewCount() + '</b><i data-lucide="arrow-right"></i></a>' +
      '</aside></section>' +

      '<section class="home-section">' +
      '<div class="home-section-head"><div><span class="eyebrow">Your next session</span><h2>' + continueLabel + '</h2></div>' +
      '<a class="text-link" href="#/browse">All subjects<i data-lucide="arrow-right"></i></a></div>' +
      '<div class="course-grid course-grid-3">' + starts.map(compactSubjectCard).join("") + '</div>' +
      '</section>' +

      '<section class="home-section home-ap">' +
      '<div class="home-section-head"><div><span class="eyebrow">Advanced Placement</span><h2>All 42 AP courses</h2><p>Exam-focused practice for every current College Board course, from Art History to Cybersecurity.</p></div>' +
      '<a class="btn btn-primary" href="#/browse/ap-courses"><span>Open AP shelf</span><i data-lucide="arrow-right"></i></a></div>' +
      '<div class="course-grid course-grid-3">' + featuredAp.map(function (subject) {
        return compactSubjectCard(SUBJECT_MAP.get(subject.id));
      }).join("") + '</div>' +
      '</section>' +

      (featuredExams.length
        ? '<section class="home-section home-exams">' +
          '<div class="home-section-head"><div><span class="eyebrow">Test season</span><h2>SAT, ACT and more</h2><p>1,000 practice questions per exam, with a timed section builder and full explanations.</p></div>' +
          '<a class="btn btn-primary" href="#/browse/exam-prep"><span>Open exam prep</span><i data-lucide="arrow-right"></i></a></div>' +
          '<div class="course-grid course-grid-3">' + featuredExams.map(function (subject) {
            return compactSubjectCard(SUBJECT_MAP.get(subject.id));
          }).join("") + '</div></section>'
        : "") +

      '<section class="home-section">' +
      '<div class="home-section-head"><div><span class="eyebrow">The rest of the annual</span><h2>Browse by section</h2></div></div>' +
      '<div class="category-list">' + categoryRows + '</div>' +
      '</section>' +
      '</div>';
  }

  /* --------------------------------------------------------------------------
     Browse catalogue
     -------------------------------------------------------------------------- */

  function compactSubjectCard(entry) {
    const subject = entry.subject;
    const stats = subjectStats(subject);
    const kicker = subject.trackLabel || entry.category.title;
    return (
      '<a class="course-card ' + accentClass(entry) + '" href="#/subject/' + esc(subject.id) + '/practice">' +
      '<span class="course-card-top">' +
      '<span class="course-card-icon"><i data-lucide="' + esc(subject.icon) + '"></i></span>' +
      '<span class="course-card-kicker">' + esc(kicker) + "</span>" +
      '<span class="course-card-arrow"><i data-lucide="arrow-up-right"></i></span>' +
      "</span>" +
      '<span class="course-card-title">' + esc(subject.title) + "</span>" +
      '<span class="course-card-blurb">' + esc(subject.blurb) + "</span>" +
      '<span class="course-card-meta">' +
      "<span>" + formatCount(questionTotal(subject)) + " questions</span>" +
      "<span>" + subject.study.length + " study cards</span>" +
      "<span>" + stats.solved + "/" + stats.total + " solved</span>" +
      "</span>" +
      '<span class="course-card-progress"><span class="progress"><span class="progress-bar" style="width:' + stats.pct + '%"></span></span></span>' +
      "</a>"
    );
  }

  function renderBrowse() {
    const categories = window.STUDY_DATA.categories;
    const categoryId = state.route.category || "all";
    const track = state.route.track || "all";
    const activeCategory = categories.find(function (category) { return category.id === categoryId; });
    const tracks = [
      { id: "all", label: "All AP" },
      { id: "arts", label: "Arts" },
      { id: "english", label: "English" },
      { id: "history", label: "History & social sciences" },
      { id: "math-cs", label: "Math & computer science" },
      { id: "sciences", label: "Sciences" },
      { id: "languages", label: "World languages" },
      { id: "capstone", label: "Capstone" },
      { id: "career", label: "Career Kickstart" }
    ];

    const entries = SUBJECTS.filter(function (entry) {
      if (categoryId !== "all" && entry.category.id !== categoryId) return false;
      if (track !== "all" && entry.subject.track !== track) return false;
      return true;
    });

    const categoryChips = [{ id: "all", title: "All subjects" }].concat(categories).map(function (category) {
      const count = category.id === "all" ? SUBJECTS.length : category.subjects.length;
      return (
        '<a class="filter-chip ' + (categoryId === category.id ? "active" : "") + '" href="#/browse/' + (category.id === "all" ? "" : esc(category.id)) + '">' +
        esc(category.title) + '<span>' + count + "</span></a>"
      );
    }).join("");

    const trackChips = categoryId === "ap-courses"
      ? '<div class="filter-bar filter-bar-sub" aria-label="Filter AP courses by subject area">' + tracks.map(function (item) {
          return '<a class="filter-chip ' + (track === item.id ? "active" : "") + '" href="#/browse/ap-courses' + (item.id === "all" ? "" : "/" + item.id) + '">' + esc(item.label) + "</a>";
        }).join("") + "</div>"
      : "";

    view.innerHTML =
      '<div class="view-inner browse-page">' +
      '<a class="back-link" href="#/dashboard"><i data-lucide="arrow-left"></i>Dashboard</a>' +
      '<header class="browse-head">' +
      '<span class="eyebrow">Subject index · ' + SUBJECTS.length + ' subjects</span>' +
      "<h1>" + esc(activeCategory ? activeCategory.title : "Browse all subjects") + "</h1>" +
      "<p>" + esc(activeCategory ? activeCategory.tagline : "Every AP course, language, science and study vault in one place. Pick a card to start practising.") + "</p>" +
      "</header>" +
      '<div class="filter-bar" aria-label="Filter by section">' + categoryChips + "</div>" +
      trackChips +
      '<div class="browse-toolbar"><strong>' + entries.length + " " + plural(entries.length, "subject", "subjects") + "</strong><span>Select a card to open its question bank</span></div>" +
      (entries.length
        ? '<div class="course-grid">' + entries.map(compactSubjectCard).join("") + "</div>"
        : emptyState("filter", "No courses here yet", "Try another section or clear the subject-area filter.", "")) +
      "</div>";
  }

  /* --------------------------------------------------------------------------
     Subject workspace
     -------------------------------------------------------------------------- */

  function renderSubject() {
    const entry = SUBJECT_MAP.get(state.route.subjectId);
    ensureSubjectBank(entry);
    const subject = entry.subject;
    const stats = subjectStats(subject);
    const bookmarked = progress.bookmarks.filter(function (id) {
      const info = QUESTION_MAP.get(id);
      return info && info.subject.id === subject.id;
    }).length;

    const visibleTabs = TABS.filter(function (tab) {
      return tab.id !== "videos" || subject.videos.length > 0;
    });

    const tabs = visibleTabs.map(function (tab) {
      let count = 0;
      if (tab.id === "practice") count = subject.questions.length;
      if (tab.id === "study") count = subject.study.length;
      if (tab.id === "tips") count = subject.tips.length;
      if (tab.id === "videos") count = subject.videos.length;
      return (
        '<a class="tab ' + (state.route.tab === tab.id ? "active" : "") + '" ' +
        'href="#/subject/' + esc(subject.id) + "/" + tab.id + '" role="tab" aria-selected="' + (state.route.tab === tab.id) + '">' +
        '<i data-lucide="' + tab.icon + '"></i>' + esc(tab.label) +
        '<span class="tab-count">' + count + "</span></a>"
      );
    }).join("");

    let panel = "";
    if (state.route.tab === "study") panel = studyTabHTML(subject);
    else if (state.route.tab === "tips") panel = tipsTabHTML(subject);
    else if (state.route.tab === "videos" && subject.videos.length) panel = videosTabHTML(subject);
    else panel = practiceTabHTML(entry);

    view.innerHTML =
      '<div class="view-inner">' +
      '<nav class="crumbs" aria-label="Breadcrumb">' +
      '<a href="#/dashboard">Dashboard</a><i data-lucide="chevron-right"></i>' +
      '<a href="#/browse/' + esc(entry.category.id) + '">' + esc(entry.category.title) + '</a><i data-lucide="chevron-right"></i>' +
      "<span>" + esc(subject.title) + "</span></nav>" +
      '<header class="subject-header card ' + accentClass(entry) + '">' +
      '<span class="subject-header-icon"><i data-lucide="' + esc(subject.icon) + '"></i></span>' +
      '<div class="subject-header-body">' +
      '<div class="subject-badges"><span class="badge ' + badgeClass(subject.level) + '">' + esc(subject.level) + "</span>" +
      (subject.trackLabel ? '<span class="badge badge-accent">' + esc(subject.trackLabel) + "</span>" : "") + "</div>" +
      "<h1>" + esc(subject.title) + "</h1>" +
      "<p>" + esc(subject.blurb) + "</p>" +
      (subject.examFormat ? '<p class="subject-exam-format"><i data-lucide="calendar-check"></i>' + esc(subject.examFormat) + "</p>" : "") +
      '<div class="subject-header-meta">' + subject.tags.slice(0, 4).map(function (tag) {
        return '<span class="tag">' + esc(tag) + "</span>";
      }).join("") + "</div>" +
      '<div class="subject-header-actions">' +
      '<a class="btn btn-primary" href="#/subject/' + esc(subject.id) + '/practice"><i data-lucide="play"></i>Practice</a>' +
      '<a class="btn btn-ghost" href="#/subject/' + esc(subject.id) + '/study"><i data-lucide="book-open"></i>Study cards</a>' +
      "</div></div>" +
      '<div class="subject-header-side">' +
      '<div class="shs-row"><span>Bank</span><strong>' + subject.questions.length + "</strong></div>" +
      '<div class="shs-row"><span>Solved</span><strong>' + stats.solved + "/" + stats.total + "</strong></div>" +
      '<div class="shs-row"><span>Accuracy</span><strong>' + stats.accuracy + "%</strong></div>" +
      '<div class="shs-row"><span>Starred</span><strong>' + bookmarked + "</strong></div>" +
      "</div></header>" +
      '<div class="tabs" role="tablist" aria-label="' + esc(subject.title) + ' workspace">' + tabs + "</div>" +
      '<div id="tab-panel" role="tabpanel">' + panel + "</div>" +
      "</div>";
  }

  function practiceTabHTML(entry) {
    const subject = entry.subject;
    const filters = getFilters(subject.id);
    const questions = filteredQuestions(subject, filters.difficulty);
    let ordered = questions;
    if (focusQid) {
      const focused = questions.find(function (question) { return question.id === focusQid; });
      if (focused) {
        ordered = [focused].concat(questions.filter(function (question) { return question.id !== focusQid; }));
      }
    }
    const limit = Math.max(20, Number(filters.limit) || 20);
    const visible = ordered.slice(0, limit);
    const remaining = Math.max(0, ordered.length - visible.length);

    const toolbar =
      '<div class="toolbar card">' +
      '<div class="filter-group" role="group" aria-label="Filter by difficulty">' +
      '<span class="filter-label">Difficulty</span>' +
      DIFFICULTIES.map(function (difficulty) {
        return (
          '<button type="button" class="chip ' + (filters.difficulty === difficulty ? "active" : "") + '" ' +
          'data-action="difficulty" data-subject="' + esc(subject.id) + '" data-value="' + difficulty + '">' +
          difficulty + "</button>"
        );
      }).join("") +
      "</div>" +
      '<div class="mode-switch" role="group" aria-label="Practice mode">' +
      '<button type="button" class="mode-btn ' + (filters.mode === "practice" ? "active" : "") + '" data-action="mode" data-subject="' + esc(subject.id) + '" data-mode="practice">' +
      '<i data-lucide="zap"></i>Practice</button>' +
      '<button type="button" class="mode-btn ' + (filters.mode === "exam" ? "active" : "") + '" data-action="mode" data-subject="' + esc(subject.id) + '" data-mode="exam">' +
      '<i data-lucide="timer"></i>Exam</button>' +
      "</div></div>";

    if (filters.mode === "exam") return toolbar + examTabHTML(entry, questions);

    if (!questions.length) {
      return toolbar + emptyState("filter", "No questions at this difficulty", "Try another filter — this bank has " + subject.questions.length + " questions in total.", "");
    }

    return (
      toolbar +
      '<p class="practice-note"><i data-lucide="zap"></i>Instant feedback — answer, then reveal the derivation one step at a time.' +
      (ordered.length > 20 ? ' <span class="practice-count">' + visible.length + " of " + ordered.length + " shown</span>" : "") + "</p>" +
      '<div class="question-list">' + visible.map(function (question) {
        return questionCardHTML(entry, question, {});
      }).join("") + "</div>" +
      (remaining
        ? '<div class="practice-more"><button type="button" class="btn btn-ghost" data-action="load-more" data-subject="' + esc(subject.id) + '"><i data-lucide="chevron-down"></i>Load 20 more</button><span>' + remaining + " remaining</span></div>"
        : "")
    );
  }

  function questionCardHTML(entry, question, options) {
    options = options || {};
    const cardState = state.cards[question.id] || {
      selected: null,
      answered: false,
      correct: false,
      hintOpen: false,
      revealed: 1
    };
    const starred = progress.bookmarks.indexOf(question.id) >= 0;
    const steps = Array.isArray(question.explanation) ? question.explanation : [];
    const revealed = cardState.answered ? Math.min(Math.max(cardState.revealed || 1, 1), steps.length || 1) : 0;

    const optionHTML = question.options.map(function (option, index) {
      let className = "option";
      let icon = "";
      if (cardState.answered) {
        if (index === question.answer) {
          className += " is-correct";
          icon = '<i data-lucide="check" class="option-icon"></i>';
        } else if (index === cardState.selected) {
          className += " is-wrong";
          icon = '<i data-lucide="x" class="option-icon"></i>';
        } else {
          className += " is-dim";
        }
      }
      return (
        '<button type="button" class="' + className + '" data-action="answer" data-qid="' + esc(question.id) + '" data-index="' + index + '"' +
        (cardState.answered ? " disabled" : "") + ">" +
        '<span class="option-key">' + String.fromCharCode(65 + index) + "</span>" +
        '<span class="option-text">' + esc(option) + "</span>" + icon + "</button>"
      );
    }).join("");

    const subjectChip = options.showSubject
      ? '<a class="badge badge-accent" href="#/subject/' + esc(entry.subject.id) + '/practice">' + esc(entry.subject.title) + "</a>"
      : "";

    const reasons = (options.reviewReasons || []).map(function (reason) {
      return reason === "missed"
        ? '<span class="badge badge-advanced"><i data-lucide="circle-x"></i>Missed</span>'
        : '<span class="badge badge-intermediate"><i data-lucide="star"></i>Starred</span>';
    }).join("");

    const tags = (question.tags || []).slice(0, 2).map(function (tag) {
      return '<span class="tag">' + esc(tag) + "</span>";
    }).join("");

    const status = cardState.answered
      ? '<span class="q-status ' + (cardState.correct ? "is-correct" : "is-wrong") + '">' +
        (cardState.correct ? "Correct · +" + XP_PER_CORRECT + " XP" : "Not quite — trace the steps") + "</span>"
      : "";

    const hintPanel = cardState.hintOpen
      ? '<div class="hint-panel"><i data-lucide="lightbulb"></i><span>' + esc(question.hint) + "</span></div>"
      : "";

    const explanation = cardState.answered
      ? '<div class="explanation">' +
        '<div class="explanation-head"><i data-lucide="route"></i>Step-by-step explanation</div>' +
        '<ol class="steps">' + steps.slice(0, revealed).map(function (step) {
          return '<li class="step"><span class="step-body">' + esc(step) + "</span></li>";
        }).join("") + "</ol>" +
        '<div class="explanation-actions">' +
        (revealed < steps.length
          ? '<button type="button" class="btn btn-ghost btn-sm" data-action="next-step" data-qid="' + esc(question.id) + '"><i data-lucide="chevron-down"></i>Next step</button>' +
            '<button type="button" class="btn btn-ghost btn-sm" data-action="show-all" data-qid="' + esc(question.id) + '">Show all</button>'
          : "") +
        '<button type="button" class="btn btn-ghost btn-sm" data-action="retry" data-qid="' + esc(question.id) + '"><i data-lucide="rotate-ccw"></i>Retry</button>' +
        '<span class="step-progress">' + revealed + " / " + steps.length + " steps</span>" +
        "</div></div>"
      : "";

    return (
      '<article class="question-card card" data-card="' + esc(question.id) + '">' +
      '<div class="q-head">' +
      '<div class="q-badges">' +
      '<span class="badge ' + badgeClass(question.difficulty) + '">' + esc(question.difficulty) + "</span>" +
      subjectChip + reasons + tags +
      "</div>" +
      '<div class="q-actions">' +
      '<button type="button" class="icon-btn star-btn ' + (starred ? "is-starred" : "") + '" data-action="bookmark" data-qid="' + esc(question.id) + '" ' +
      'aria-pressed="' + starred + '" aria-label="' + (starred ? "Remove bookmark" : "Bookmark for review") + '" title="Bookmark for review">' +
      '<i data-lucide="star"></i></button>' +
      "</div></div>" +
      '<div class="q-prompt">' + esc(question.prompt) + "</div>" +
      '<div class="q-options">' + optionHTML + "</div>" +
      '<div class="q-footer">' +
      '<button type="button" class="btn btn-ghost btn-sm" data-action="hint" data-qid="' + esc(question.id) + '">' +
      '<i data-lucide="lightbulb"></i>' + (cardState.hintOpen ? "Hide hint" : "Need a hint?") + "</button>" +
      status +
      "</div>" + hintPanel + explanation +
      "</article>"
    );
  }

  /* --------------------------------------------------------------------------
     Exam — absolute deadline, one interval
     -------------------------------------------------------------------------- */

  function remainingSeconds() {
    if (!exam) return 0;
    return Math.max(0, Math.ceil((exam.endsAt - Date.now()) / 1000));
  }

  function examTabHTML(entry, questions) {
    const subject = entry.subject;
    const activeExam = exam && exam.subjectId === subject.id ? exam : null;

    if (!activeExam) {
      if (!questions.length) {
        return emptyState("filter", "No questions at this difficulty", "Switch difficulty to build an exam from this bank.", "");
      }
      const test = subject.testConfig;
      const count = test ? Math.min(test.questions || 20, questions.length) : questions.length;
      const secondsPerQuestion = test ? test.secondsPerQuestion || SECONDS_PER_QUESTION : SECONDS_PER_QUESTION;
      const minutes = Math.ceil((count * secondsPerQuestion) / 60);
      const title = test ? test.label : "Timed exam mode";
      const copy = test
        ? "A fresh sample from the full bank. No hints or feedback until you submit."
        : "No hints or feedback until you submit. The clock starts when you do.";
      return (
        '<div class="card exam-panel">' +
        '<div class="exam-intro-head">' +
        '<span class="subject-icon accent-amber"><i data-lucide="timer"></i></span>' +
        "<div><h2>" + esc(title) + "</h2>" +
        "<p>" + esc(copy) + "</p></div></div>" +
        '<ul class="settings-list">' +
        "<li><strong>" + count + "</strong> questions at " + esc(getFilters(subject.id).difficulty) + " difficulty</li>" +
        "<li><strong>" + minutes + "</strong> " + plural(minutes, "minute", "minutes") + " on the clock</li>" +
        "<li>Graded at the end with full explanations</li>" +
        "<li>Every answer counts toward XP, accuracy and the mistake bank</li>" +
        "</ul>" +
        '<div class="exam-actions"><button type="button" class="btn btn-teal" data-action="start-exam" data-subject="' + esc(subject.id) + '">' +
        '<i data-lucide="play"></i>Start test</button></div></div>'
      );
    }

    const submitted = activeExam.submitted;
    const answeredCount = Object.keys(activeExam.answers).length;
    const remaining = remainingSeconds();
    const timePct = activeExam.totalSeconds ? Math.max(0, Math.round((remaining / activeExam.totalSeconds) * 100)) : 0;

    const bar = submitted
      ? '<div class="exam-result">' +
        '<div class="exam-score">' + activeExam.score + "<small>/" + activeExam.questions.length + "</small></div>" +
        '<div class="exam-result-copy"><strong>' +
        (activeExam.score === activeExam.questions.length ? "Perfect run." : activeExam.score / activeExam.questions.length >= 0.7 ? "Strong pass." : "Review the misses below.") +
        "</strong>You answered " + activeExam.score + " of " + activeExam.questions.length + " correctly. Explanations are unlocked below.</div>" +
        '<button type="button" class="btn btn-ghost btn-sm" data-action="retake-exam" data-subject="' + esc(subject.id) + '"><i data-lucide="rotate-ccw"></i>Retake</button>' +
        "</div>"
      : '<div class="exam-bar">' +
        '<div class="exam-timer" id="exam-timer-wrap"><i data-lucide="timer"></i><span id="exam-timer">' + formatTime(remaining) + "</span></div>" +
        '<div class="exam-progress"><div class="progress"><div class="progress-bar" id="exam-progress-bar" style="width:' + timePct + '%"></div></div></div>' +
        '<div class="exam-meta">' + answeredCount + " / " + activeExam.questions.length + " answered</div>" +
        '<button type="button" class="btn btn-teal" data-action="submit-exam"><i data-lucide="check-check"></i>Submit</button>' +
        "</div>";

    return (
      bar +
      '<div class="card exam-panel">' + activeExam.questions.map(function (question, index) {
        return examQuestionHTML(question, index, activeExam, submitted);
      }).join("") + "</div>" +
      (submitted ? "" : '<div class="exam-actions"><button type="button" class="btn btn-teal" data-action="submit-exam"><i data-lucide="check-check"></i>Submit exam</button></div>')
    );
  }

  function examQuestionHTML(question, index, activeExam, submitted) {
    const selected = activeExam.answers[question.id];
    const starred = progress.bookmarks.indexOf(question.id) >= 0;
    const options = question.options.map(function (option, optionIndex) {
      let className = "option";
      let icon = "";
      if (submitted) {
        if (optionIndex === question.answer) {
          className += " is-correct";
          icon = '<i data-lucide="check" class="option-icon"></i>';
        } else if (optionIndex === selected) {
          className += " is-wrong";
          icon = '<i data-lucide="x" class="option-icon"></i>';
        } else {
          className += " is-dim";
        }
      } else if (optionIndex === selected) {
        className += " is-selected";
      }
      return (
        '<button type="button" class="' + className + '" data-action="exam-select" data-qid="' + esc(question.id) + '" data-index="' + optionIndex + '"' +
        (submitted ? " disabled" : "") + ">" +
        '<span class="option-key">' + String.fromCharCode(65 + optionIndex) + "</span>" +
        '<span class="option-text">' + esc(option) + "</span>" + icon + "</button>"
      );
    }).join("");

    const explanation = submitted
      ? '<div class="explanation"><div class="explanation-head"><i data-lucide="route"></i>Step-by-step explanation</div>' +
        '<ol class="steps">' + (question.explanation || []).map(function (step) {
          return '<li class="step"><span class="step-body">' + esc(step) + "</span></li>";
        }).join("") + "</ol></div>"
      : "";

    return (
      '<div class="exam-question">' +
      '<div class="exam-question-head">' +
      '<span class="exam-qnum">' + (index + 1) + "</span>" +
      '<span class="badge ' + badgeClass(question.difficulty) + '">' + esc(question.difficulty) + "</span>" +
      '<span style="margin-left:auto"><button type="button" class="icon-btn star-btn ' + (starred ? "is-starred" : "") + '" data-action="bookmark" data-qid="' + esc(question.id) + '" aria-label="Bookmark for review" title="Bookmark for review"><i data-lucide="star"></i></button></span>' +
      "</div>" +
      '<div class="q-prompt">' + esc(question.prompt) + "</div>" +
      '<div class="q-options">' + options + "</div>" + explanation +
      "</div>"
    );
  }

  function sampleQuestions(items, count) {
    const copy = items.slice();
    for (let index = copy.length - 1; index > 0; index -= 1) {
      const swap = Math.floor(Math.random() * (index + 1));
      const value = copy[index];
      copy[index] = copy[swap];
      copy[swap] = value;
    }
    return copy.slice(0, count);
  }

  function startExam(subjectId) {
    const entry = SUBJECT_MAP.get(subjectId);
    if (!entry) return;
    const pool = filteredQuestions(entry.subject, getFilters(subjectId).difficulty);
    if (!pool.length) {
      toast("No questions at this difficulty.", "is-warn");
      return;
    }
    const test = entry.subject.testConfig;
    const questions = test ? sampleQuestions(pool, Math.min(test.questions || 20, pool.length)) : pool;
    stopExamTimer();
    const totalSeconds = questions.length * (test ? test.secondsPerQuestion || SECONDS_PER_QUESTION : SECONDS_PER_QUESTION);
    exam = {
      subjectId: subjectId,
      questions: questions,
      answers: {},
      submitted: false,
      score: 0,
      totalSeconds: totalSeconds,
      endsAt: Date.now() + totalSeconds * 1000
    };
    paint();
    startExamTimer();
  }

  function startExamTimer() {
    stopExamTimer();
    function tick() {
      if (!exam || exam.submitted) {
        stopExamTimer();
        return;
      }
      const remaining = remainingSeconds();
      const text = document.getElementById("exam-timer");
      if (text) text.textContent = formatTime(remaining);
      const wrap = document.getElementById("exam-timer-wrap");
      if (wrap) wrap.classList.toggle("is-low", remaining <= 15);
      const bar = document.getElementById("exam-progress-bar");
      if (bar && exam.totalSeconds) {
        bar.style.width = Math.max(0, Math.round((remaining / exam.totalSeconds) * 100)) + "%";
      }
      if (remaining <= 0) {
        stopExamTimer();
        gradeExam(true);
      }
    }
    tick();
    examTimer = window.setInterval(tick, 1000);
  }

  function stopExamTimer() {
    if (examTimer) {
      window.clearInterval(examTimer);
      examTimer = null;
    }
  }

  function submitExam() {
    if (!exam || exam.submitted) return;
    const unanswered = exam.questions.length - Object.keys(exam.answers).length;
    if (unanswered > 0 && !window.confirm(unanswered + " " + plural(unanswered, "question is", "questions are") + " unanswered. Submit anyway?")) {
      return;
    }
    gradeExam(false);
  }

  function gradeExam(auto) {
    if (!exam || exam.submitted) return;
    stopExamTimer();
    exam.submitted = true;
    exam.score = 0;
    exam.questions.forEach(function (question) {
      const correct = exam.answers[question.id] === question.answer;
      if (correct) exam.score += 1;
      recordAnswer(question.id, correct);
    });
    paint();
    toast(
      (auto ? "Time's up — " : "") + "Exam graded: " + exam.score + "/" + exam.questions.length,
      exam.score / exam.questions.length >= 0.7 ? "" : "is-warn"
    );
  }

  /* --------------------------------------------------------------------------
     Study bank, tips, videos
     -------------------------------------------------------------------------- */

  function studyTabHTML(subject) {
    const callout = Array.isArray(subject.mistakes) && subject.mistakes.length
      ? '<div class="callout"><span class="callout-icon"><i data-lucide="triangle-alert"></i></span>' +
        "<div><h3>Common mistakes to avoid</h3><ul>" +
        subject.mistakes.map(function (mistake) { return "<li>" + esc(mistake) + "</li>"; }).join("") +
        "</ul></div></div>"
      : "";

    return (
      callout +
      '<div class="study-grid">' + subject.study.map(function (card) {
        return (
          '<article class="study-card card" data-study="' + esc(card.id) + '">' +
          '<div class="study-card-head"><span class="study-icon"><i data-lucide="' + esc(card.icon) + '"></i></span>' +
          "<div><h3>" + esc(card.title) + "</h3></div></div>" +
          '<p class="study-summary">' + esc(card.summary) + "</p>" +
          '<ul class="study-points">' + (card.points || []).map(function (point) {
            return "<li>" + esc(point) + "</li>";
          }).join("") + "</ul></article>"
        );
      }).join("") + "</div>"
    );
  }

  function tipsTabHTML(subject) {
    return (
      '<div class="tips-grid">' + subject.tips.map(function (tip, index) {
        return (
          '<article class="tip-card card" data-tip="' + esc(subject.id + "-tip-" + index) + '">' +
          '<div class="tip-head"><span class="tip-icon"><i data-lucide="' + esc(tip.icon) + '"></i></span>' +
          "<h3>" + esc(tip.title) + "</h3></div>" +
          '<p class="tip-body">' + esc(tip.body) + "</p></article>"
        );
      }).join("") + "</div>"
    );
  }

  function videosTabHTML(subject) {
    if (!subject.videos.length) {
      return emptyState("video-off", "No videos yet", "This subject has no curated video lessons.", "");
    }
    return (
      '<p class="practice-note"><i data-lucide="play"></i>Curated by Khan Academy, 3Blue1Brown, CrashCourse and friends.</p>' +
      '<div class="video-grid">' + subject.videos.map(function (video) {
        return (
          '<article class="video-card card">' +
          '<div class="video-frame"><iframe src="https://www.youtube-nocookie.com/embed/' + encodeURIComponent(video.youtube) + '?rel=0" ' +
          'title="' + esc(video.title) + '" loading="lazy" ' +
          'allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" ' +
          'referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe></div>' +
          '<div class="video-body"><h3 class="video-title">' + esc(video.title) + "</h3>" +
          '<p class="video-channel"><i data-lucide="play"></i>' + esc(video.channel) + "</p>" +
          '<ul class="video-takeaways">' + (video.takeaways || []).map(function (takeaway) {
            return "<li>" + esc(takeaway) + "</li>";
          }).join("") + "</ul></div></article>"
        );
      }).join("") + "</div>"
    );
  }

  /* --------------------------------------------------------------------------
     Review queue
     -------------------------------------------------------------------------- */

  function renderReview() {
    ensureReviewBanks();
    const items = reviewMap();
    const filter = state.reviewFilter;
    const visible = Array.from(items.keys()).filter(function (id) {
      return filter === "all" || items.get(id).reasons.indexOf(filter) >= 0;
    });
    const visibleSet = new Set(visible);
    const starredCount = Array.from(items.values()).filter(function (item) {
      return item.reasons.indexOf("starred") >= 0;
    }).length;
    const missedCount = Array.from(items.values()).filter(function (item) {
      return item.reasons.indexOf("missed") >= 0;
    }).length;

    const groups = SUBJECTS.map(function (entry) {
      const questions = entry.subject.questions.filter(function (question) {
        return visibleSet.has(question.id);
      });
      return { entry: entry, questions: questions };
    }).filter(function (group) { return group.questions.length > 0; });

    const groupsHTML = groups.map(function (group) {
      return (
        '<div class="saved-subject-label">' + esc(group.entry.subject.title) +
        '<a href="#/subject/' + esc(group.entry.subject.id) + '/practice">open bank →</a></div>' +
        '<div class="question-list">' + group.questions.map(function (question) {
          return questionCardHTML(group.entry, question, {
            showSubject: true,
            reviewReasons: items.get(question.id).reasons
          });
        }).join("") + "</div>"
      );
    }).join("");

    const empty = items.size === 0
      ? emptyState("bookmark-check", "Your review queue is empty", "Star a tricky question or get one wrong and it will appear here automatically.", '<a class="btn btn-ghost btn-sm" href="#/dashboard">Browse subjects</a>')
      : emptyState(
          filter === "starred" ? "star" : "circle-x",
          filter === "starred" ? "No starred questions" : "No mistakes logged",
          filter === "starred" ? "Use the star on any question to save it here." : "Answer a question incorrectly and it will be filed here for another attempt.",
          ""
        );

    const actions = [];
    if (starredCount > 0) {
      actions.push('<button type="button" class="btn btn-ghost btn-sm" data-action="clear-bookmarks"><i data-lucide="star-off"></i>Clear stars</button>');
    }
    if (missedCount > 0) {
      actions.push('<button type="button" class="btn btn-ghost btn-sm" data-action="clear-mistakes"><i data-lucide="trash-2"></i>Clear mistakes</button>');
    }

    view.innerHTML =
      '<div class="view-inner">' +
      '<div class="page-head">' +
      "<div><span class=\"eyebrow\">Review queue</span><h1>Bookmarks &amp; mistakes</h1>" +
      "<p>One queue, deduplicated. Retry a question, reveal the steps, and clear it when it finally sticks.</p></div>" +
      '<a class="btn btn-ghost" href="#/dashboard"><i data-lucide="layout-dashboard"></i>Dashboard</a>' +
      "</div>" +
      '<div class="toolbar card review-toolbar">' +
      '<div class="review-filters" role="group" aria-label="Review filter">' +
      '<span class="filter-label">Show</span>' +
      '<button type="button" class="chip ' + (filter === "all" ? "active" : "") + '" data-action="review-filter" data-value="all">All ' + items.size + "</button>" +
      '<button type="button" class="chip ' + (filter === "starred" ? "active" : "") + '" data-action="review-filter" data-value="starred">Starred ' + starredCount + "</button>" +
      '<button type="button" class="chip ' + (filter === "missed" ? "active" : "") + '" data-action="review-filter" data-value="missed">Missed ' + missedCount + "</button>" +
      "</div>" +
      '<div class="review-actions">' + actions.join("") + "</div>" +
      "</div>" +
      (groups.length ? groupsHTML : empty) +
      "</div>";
  }

  /* --------------------------------------------------------------------------
     Sign in
     -------------------------------------------------------------------------- */

  function loginProfileRow(account) {
    const active = activeAccount && activeAccount.id === account.id;
    const detail = account.email || "Device profile";
    return (
      '<div class="profile-row' + (active ? " active" : "") + '">' +
      '<button type="button" class="profile-main" data-action="local-switch" data-account="' + esc(account.id) + '">' +
      '<span class="account-avatar">' + esc(account.name.charAt(0).toUpperCase()) + "</span>" +
      '<span class="account-copy"><strong>' + esc(account.name) + "</strong><small>" + esc(detail) + (active ? " · active" : "") + "</small></span>" +
      "</button>" +
      '<button type="button" class="profile-delete" data-action="local-delete" data-account="' + esc(account.id) + '" aria-label="Delete ' + esc(account.name) + '"><i data-lucide="trash-2"></i></button>' +
      "</div>"
    );
  }

  function renderLogin() {
    const profiles = accountStore.accounts.map(loginProfileRow).join("");
    const cloudUser = cloudIdentity();
    const busy = Boolean(cloudState.operation) || cloudState.status === "loading" || cloudState.status === "signing-in";
    const activeName = activeAccount ? activeAccount.name : "";
    const provider = cloudUser && cloudUser.provider === "google.com" ? "Google account" : "Email account";

    const localCard =
      '<section class="settings-card card login-card">' +
      "<h2>Local profile</h2>" +
      (activeAccount
        ? '<div class="account-summary login-current">' +
          '<span class="account-avatar">' + esc(activeName.charAt(0).toUpperCase()) + "</span>" +
          '<div class="account-copy"><strong>' + esc(activeName) + '</strong><small>' + esc(activeAccount.email || "Signed in on this device") + "</small></div>" +
          "</div>" +
          '<div class="account-actions"><button type="button" class="account-btn account-btn-quiet" data-action="local-signout"><i data-lucide="log-out"></i>Sign out</button></div>'
        : '<p>No cloud account? Create an offline profile on this browser. Each profile has its own progress, XP, streak, bookmarks and mistakes.</p>') +
      '<form class="login-form" data-form="local-login">' +
      '<label>Display name<input id="login-name" name="name" maxlength="40" autocomplete="nickname" placeholder="e.g. Alex" required /></label>' +
      '<label>Email <span>optional</span><input id="login-email" name="email" type="email" maxlength="120" autocomplete="email" placeholder="you@example.com" /></label>' +
      '<button class="btn btn-primary" type="submit"><i data-lucide="log-in"></i>' + (activeAccount ? "Add another profile" : "Create offline profile") + "</button>" +
      "</form>" +
      '<p class="account-note">Local profiles are stored in this browser and are <strong>not password protected</strong>. Sign in above for a real cross-device account.</p>' +
      "</section>";

    const profileCard = !cloudUser && accountStore.accounts.length
      ? '<section class="settings-card card login-card"><h2>Saved offline profiles</h2><div class="profile-list">' + profiles + "</div></section>"
      : "";

    const cloudCard =
      '<section class="settings-card card login-card login-cloud">' +
      "<h2>Cloud account</h2>" +
      (cloudUser
        ? '<div class="account-summary login-current">' +
          '<span class="account-avatar">' + esc((cloudUser.displayName || cloudUser.email || "C").charAt(0).toUpperCase()) + "</span>" +
          '<div class="account-copy"><strong>' + esc(cloudUser.displayName || cloudUser.email || provider) + '</strong><small>' + esc(cloudUser.email || provider) + "</small></div>" +
          "</div>" +
          '<div class="account-actions"><button type="button" class="account-btn account-btn-quiet" data-action="cloud-signout"><i data-lucide="log-out"></i>Sign out of cloud</button></div>' +
          '<p class="account-note">' + esc(provider) + " · progress is mirrored to your private Firestore record.</p>"
        : cloudState.configured
        ? '<p>Sign in to sync progress across devices. Email/password and Google are both supported.</p>' +
          '<form class="login-form" data-form="cloud-signin">' +
          '<label>Email<input name="email" type="email" autocomplete="email" maxlength="160" placeholder="you@example.com" required /></label>' +
          '<label>Password<input name="password" type="password" autocomplete="current-password" minlength="6" placeholder="Your password" required /></label>' +
          '<button class="btn btn-primary" type="submit"' + (busy ? " disabled" : "") + '><i data-lucide="log-in"></i>Sign in with email</button>' +
          "</form>" +
          '<details class="auth-more"><summary>Create an account</summary>' +
          '<form class="login-form" data-form="cloud-signup">' +
          '<label>Display name<input name="name" maxlength="60" autocomplete="nickname" placeholder="e.g. Alex" required /></label>' +
          '<label>Email<input name="email" type="email" autocomplete="email" maxlength="160" placeholder="you@example.com" required /></label>' +
          '<label>Password<input name="password" type="password" autocomplete="new-password" minlength="6" placeholder="At least 6 characters" required /></label>' +
          '<button class="btn" type="submit"' + (busy ? " disabled" : "") + '><i data-lucide="user-plus"></i>Create account</button>' +
          "</form></details>" +
          '<details class="auth-more"><summary>Forgot password?</summary>' +
          '<form class="login-form" data-form="cloud-reset">' +
          '<label>Email<input name="email" type="email" autocomplete="email" maxlength="160" placeholder="you@example.com" required /></label>' +
          '<button class="btn" type="submit"' + (busy ? " disabled" : "") + '><i data-lucide="mail"></i>Send reset link</button>' +
          "</form></details>" +
          '<div class="auth-divider"><span>or</span></div>' +
          '<div class="account-actions"><button type="button" class="account-btn" data-action="google-signin"' + (busy ? " disabled" : "") + '><i data-lucide="globe"></i>' + (busy ? "Connecting…" : "Continue with Google") + "</button></div>" +
          (cloudState.error ? '<p class="account-note auth-error">' + esc(cloudState.error) + "</p>" : "")
        : '<p>Cloud login is not configured on this deployment. Use an offline profile below.</p><p class="account-note">Add the public Firebase keys to <code>firebase-config.js</code> to enable email/password and Google sign-in.</p><div class="account-actions"><a class="account-btn" href="#/settings"><i data-lucide="settings"></i>Open setup guide</a></div>') +
      "</section>";

    view.innerHTML =
      '<div class="view-inner">' +
      '<div class="page-head">' +
      '<div><span class="eyebrow">Account</span><h1>Sign in to study</h1><p>Use a cloud account for cross-device sync, or an offline profile that stays in this browser.</p></div>' +
      (hasIdentity() ? '<a class="btn btn-ghost" href="#/dashboard"><i data-lucide="layout-dashboard"></i>Dashboard</a>' : "") +
      "</div>" +
      '<div class="login-grid">' + cloudCard + (cloudUser ? "" : localCard + profileCard) + "</div>" +
      '<p class="account-note login-footnote">Offline profiles are not password protected and clearing site data removes them. Cloud accounts are the only cross-device option.</p>' +
      "</div>";
  }

  /* --------------------------------------------------------------------------
     Settings
     -------------------------------------------------------------------------- */

  function renderSettings() {
    const stats = getStats();
    const totalQuestions = SUBJECTS.reduce(function (sum, entry) {
      return sum + questionTotal(entry.subject);
    }, 0);
    const theme = getTheme();
    const themeOption = function (value, label, swatch, description) {
      return (
        '<button type="button" class="theme-option ' + (theme === value ? "active" : "") + '" data-theme-set="' + value + '">' +
        '<span class="theme-swatch theme-swatch-' + swatch + '"></span>' +
        '<span class="theme-option-label">' + label + '<i data-lucide="check"></i></span>' +
        "<small>" + description + "</small></button>"
      );
    };

    view.innerHTML =
      '<div class="view-inner">' +
      '<div class="page-head">' +
      "<div><span class=\"eyebrow\">Workspace</span><h1>Settings &amp; progress</h1>" +
      "<p>Cloud accounts sync across devices through Firebase. Offline profiles stay in this browser.</p></div>" +
      '<a class="btn btn-ghost" href="#/dashboard"><i data-lucide="layout-dashboard"></i>Dashboard</a>' +
      "</div>" +
      '<div class="settings-grid">' +

      '<section class="settings-card card">' +
      "<h2>Account &amp; sync</h2>" +
      '<p>Email/password and Google accounts sync to Firestore. Local profiles are the offline fallback.</p>' +
      '<div class="account-panel">' + accountCardHTML() + "</div>" +
      '<p style="margin-top:10px"><a class="section-link" href="#/login"><i data-lucide="log-in"></i>Manage sign-in</a></p>' +
      (cloudState.configured ? "" : '<p class="account-note">Paste <code>apiKey</code>, <code>authDomain</code>, <code>projectId</code> and <code>appId</code> into <code>firebase-config.js</code>. The owner-only Firestore rules live in <code>firestore.rules</code>.</p>') +
      "</section>" +

      '<section class="settings-card card">' +
      "<h2>Appearance</h2>" +
      '<p>Pick a palette. Paper for daylight, Ink for the desk, OLED for pure black.</p>' +
      '<div class="theme-options">' +
      themeOption("light", "Paper", "light", "Warm paper & ink") +
      themeOption("dark", "Ink", "dark", "Warm black") +
      themeOption("oled", "OLED", "oled", "True black") +
      "</div></section>" +

      '<section class="settings-card card">' +
      "<h2>Your record</h2>" +
      '<p>Accuracy counts every attempt, so retries are included.</p>' +
      '<div class="settings-row"><span>Questions solved</span><strong>' + formatCount(stats.solved) + " / " + formatCount(totalQuestions) + "</strong></div>" +
      '<div class="settings-row"><span>Total attempts</span><strong>' + stats.attempts + "</strong></div>" +
      '<div class="settings-row"><span>Accuracy</span><strong>' + stats.accuracy + "%</strong></div>" +
      '<div class="settings-row"><span>Level</span><strong>' + stats.level + " · " + esc(stats.rank) + "</strong></div>" +
      '<div class="settings-row"><span>Experience</span><strong>' + stats.xp + " XP</strong></div>" +
      '<div class="settings-row"><span>Current streak</span><strong>' + stats.streak + " " + plural(stats.streak, "day", "days") + "</strong></div>" +
      '<div class="settings-row"><span>Best streak</span><strong>' + stats.bestStreak + " " + plural(stats.bestStreak, "day", "days") + "</strong></div>" +
      '<div class="settings-row"><span>Review queue</span><strong>' + reviewCount() + "</strong></div>" +
      "</section>" +

      '<section class="settings-card card">' +
      "<h2>Adding your own packs</h2>" +
      '<p>Open <code>database.js</code>, copy a subject block, and refresh. No build step.</p>' +
      '<ul class="settings-list">' +
      "<li>Give each subject a unique <code>id</code> and add it to a category's <code>subjects</code> array.</li>" +
      "<li>Question ids must be globally unique — prefix them with the subject id.</li>" +
      "<li>LaTeX goes between <code>$…$</code> inline or <code>$$…$$</code> block.</li>" +
      "<li><code>answer</code> is the zero-based index of the correct option.</li>" +
      "<li>Videos use the 11-character YouTube id.</li>" +
      "</ul></section>" +

      '<section class="settings-card card">' +
      "<h2>Shortcuts &amp; storage</h2>" +
      '<div class="settings-row"><span>Focus search</span><span><kbd>/</kbd></span></div>' +
      '<div class="settings-row"><span>Close search / drawer</span><span><kbd>Esc</kbd></span></div>' +
      '<div class="settings-row"><span>Open first result</span><span><kbd>Enter</kbd></span></div>' +
      '<p style="margin-top:10px">Clearing site data resets the record but never the study content. Theme preference is stored separately.</p>' +
      '<p style="margin-top:8px"><a class="section-link" href="https://pages.github.com/" target="_blank" rel="noopener"><i data-lucide="external-link"></i>GitHub Pages docs</a></p>' +
      "</section>" +

      '<section class="settings-card card">' +
      "<h2>Danger zone</h2>" +
      '<p>Resetting wipes solved questions, XP, streak, bookmarks and mistakes. It cannot be undone.</p>' +
      '<div class="settings-danger"><p>This device\u2019s record will be deleted immediately.</p>' +
      '<button type="button" class="btn btn-danger" data-action="reset"><i data-lucide="trash-2"></i>Reset progress</button></div>' +
      "</section>" +

      "</div></div>";
  }

  /* --------------------------------------------------------------------------
     Search
     -------------------------------------------------------------------------- */

  function buildSearchIndex() {
    const entries = [];
    SUBJECTS.forEach(function (entry) {
      const subject = entry.subject;
      entries.push({
        type: "Subject",
        icon: subject.icon,
        subjectId: subject.id,
        tab: "practice",
        title: subject.title,
        text: subject.blurb + " " + subject.tags.join(" "),
        tags: subject.tags
      });
      subject.questions.forEach(function (question) {
        entries.push({
          type: "Question",
          icon: "circle-help",
          subjectId: subject.id,
          tab: "practice",
          qid: question.id,
          title: plain(question.prompt),
          text: plain(question.prompt) + " " + question.options.map(plain).join(" ") + " " + question.tags.join(" ") + " " + plain(question.hint),
          tags: question.tags
        });
      });
      subject.study.forEach(function (card) {
        entries.push({
          type: "Study card",
          icon: "book-open",
          subjectId: subject.id,
          tab: "study",
          studyId: card.id,
          title: card.title,
          text: plain(card.summary) + " " + card.points.map(plain).join(" "),
          tags: subject.tags
        });
      });
      subject.tips.forEach(function (tip, index) {
        entries.push({
          type: "Tip",
          icon: "lightbulb",
          subjectId: subject.id,
          tab: "tips",
          tipId: subject.id + "-tip-" + index,
          title: tip.title,
          text: plain(tip.body),
          tags: subject.tags
        });
      });
    });
    SEARCH_INDEX = entries;
  }

  function performSearch(rawQuery) {
    const query = rawQuery.trim().toLowerCase();
    if (!query) return [];
    const terms = query.split(/\s+/);
    return SEARCH_INDEX.map(function (entry) {
      const haystack = (entry.title + " " + entry.text + " " + entry.tags.join(" ")).toLowerCase();
      if (!terms.every(function (term) { return haystack.indexOf(term) >= 0; })) return null;
      let score = 0;
      if (entry.title.toLowerCase().indexOf(query) >= 0) score += 10;
      entry.tags.forEach(function (tag) {
        if (tag.toLowerCase() === query) score += 6;
      });
      if (entry.type === "Subject") score += 2;
      return { entry: entry, score: score };
    })
      .filter(Boolean)
      .sort(function (a, b) { return b.score - a.score; })
      .slice(0, 12)
      .map(function (item) { return item.entry; });
  }

  function highlight(text, query) {
    const escaped = esc(text);
    const trimmed = query.trim();
    if (!trimmed) return escaped;
    const safe = trimmed.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    try {
      return escaped.replace(new RegExp("(" + safe + ")", "ig"), "<mark>$1</mark>");
    } catch (error) {
      return escaped;
    }
  }

  function renderSearch(rawQuery) {
    const query = rawQuery.trim();
    if (!query) {
      closeSearch(false);
      return;
    }
    const results = performSearch(query);
    searchResults = results;

    if (!results.length) {
      searchResultsPanel.innerHTML =
        '<div class="search-empty">No matches for “' + esc(query) + '”. Try a tag like <strong>fractions</strong>, <strong>chain rule</strong> or <strong>ATP</strong>.</div>';
    } else {
      searchResultsPanel.innerHTML = results.map(function (entry, index) {
        const subject = SUBJECT_MAP.get(entry.subjectId);
        return (
          '<button type="button" class="search-result" role="option" data-search-index="' + index + '">' +
          '<span class="search-result-icon"><i data-lucide="' + esc(entry.icon) + '"></i></span>' +
          '<span class="search-result-body">' +
          '<span class="search-result-title">' + highlight(entry.title, query) + "</span>" +
          '<span class="search-result-meta"><span class="search-type">' + esc(entry.type) + "</span>" +
          "<span>" + esc(subject ? subject.subject.title : "") + "</span></span>" +
          "</span></button>"
        );
      }).join("") +
        '<div class="search-hint">' + results.length + " result" + (results.length === 1 ? "" : "s") + " · press Enter to open the first</div>";
    }

    searchResultsPanel.hidden = false;
    refreshIcons();
  }

  function openSearchResult(index) {
    const result = searchResults[index];
    if (!result) return;
    const filters = getFilters(result.subjectId);
    filters.difficulty = "All";
    filters.mode = "practice";

    stopExamTimer();
    exam = null;

    if (result.qid) {
      focusQid = result.qid;
      getFilters(result.subjectId).limit = 20;
      pendingTarget = '[data-card="' + result.qid + '"]';
    } else if (result.studyId) pendingTarget = '[data-study="' + result.studyId + '"]';
    else if (result.tipId) pendingTarget = '[data-tip="' + result.tipId + '"]';
    else pendingTarget = null;

    go("#/subject/" + result.subjectId + "/" + result.tab);
  }

  function closeSearch(clear) {
    searchResultsPanel.hidden = true;
    if (clear) {
      searchInput.value = "";
      searchResults = [];
      updateSearchClear();
    }
  }

  function updateSearchClear() {
    if (searchClear) searchClear.hidden = !searchInput.value;
  }

  function onSearchInput() {
    updateSearchClear();
    window.clearTimeout(searchDebounce);
    searchDebounce = window.setTimeout(function () {
      renderSearch(searchInput.value);
    }, 110);
  }

  /* --------------------------------------------------------------------------
     Sidebar drawer
     -------------------------------------------------------------------------- */

  function openSidebar() {
    sidebar.classList.add("open");
    sidebarOverlay.hidden = false;
    menuBtn.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
  }

  function closeSidebar() {
    sidebar.classList.remove("open");
    sidebarOverlay.hidden = true;
    menuBtn.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  }

  /* --------------------------------------------------------------------------
     Events
     -------------------------------------------------------------------------- */

  view.addEventListener("click", function (event) {
    const trigger = event.target.closest("[data-action]");
    if (!trigger) return;
    const action = trigger.getAttribute("data-action");
    const questionId = trigger.getAttribute("data-qid");
    const subjectId = trigger.getAttribute("data-subject");

    if (action === "focus-search") {
      searchInput.focus();
      searchInput.select();
      return;
    }

    if (action.indexOf("local-") === 0 || action === "google-signin" || action === "cloud-signout") {
      runAccountAction(action, trigger);
      return;
    }

    if (action === "load-more" && subjectId) {
      getFilters(subjectId).limit += 20;
      paint();
      return;
    }

    if (action === "answer" && questionId) {
      const info = QUESTION_MAP.get(questionId);
      if (!info) return;
      const card = state.cards[questionId];
      if (card && card.answered) return;
      const index = Number(trigger.getAttribute("data-index"));
      state.cards[questionId] = {
        selected: index,
        answered: true,
        correct: index === info.question.answer,
        hintOpen: false,
        revealed: 1
      };
      recordAnswer(questionId, index === info.question.answer);
      paint();
      return;
    }

    if (action === "hint" && questionId) {
      const card = state.cards[questionId] || { selected: null, answered: false, correct: false, hintOpen: false, revealed: 1 };
      card.hintOpen = !card.hintOpen;
      state.cards[questionId] = card;
      paint();
      return;
    }

    if (action === "bookmark" && questionId) {
      toggleBookmark(questionId);
      paint();
      return;
    }

    if (action === "next-step" && questionId) {
      const info = QUESTION_MAP.get(questionId);
      const card = state.cards[questionId];
      if (!info || !card) return;
      card.revealed = Math.min((card.revealed || 1) + 1, info.question.explanation.length);
      paint();
      return;
    }

    if (action === "show-all" && questionId) {
      const info = QUESTION_MAP.get(questionId);
      const card = state.cards[questionId];
      if (!info || !card) return;
      card.revealed = info.question.explanation.length;
      paint();
      return;
    }

    if (action === "retry" && questionId) {
      delete state.cards[questionId];
      paint();
      return;
    }

    if (action === "difficulty" && subjectId) {
      const filters = getFilters(subjectId);
      filters.difficulty = trigger.getAttribute("data-value");
      filters.limit = 20;
      focusQid = null;
      stopExamTimer();
      exam = null;
      paint();
      return;
    }

    if (action === "mode" && subjectId) {
      const filters = getFilters(subjectId);
      const mode = trigger.getAttribute("data-mode");
      if (filters.mode === mode) return;
      filters.mode = mode;
      filters.limit = 20;
      focusQid = null;
      stopExamTimer();
      exam = null;
      paint();
      return;
    }

    if (action === "start-exam" && subjectId) {
      startExam(subjectId);
      return;
    }

    if (action === "retake-exam" && subjectId) {
      exam = null;
      startExam(subjectId);
      return;
    }

    if (action === "submit-exam") {
      submitExam();
      return;
    }

    if (action === "exam-select" && questionId) {
      if (!exam || exam.submitted) return;
      exam.answers[questionId] = Number(trigger.getAttribute("data-index"));
      paint();
      return;
    }

    if (action === "review-filter") {
      state.reviewFilter = trigger.getAttribute("data-value");
      paint();
      return;
    }

    if (action === "clear-bookmarks") {
      if (!progress.bookmarks.length) return;
      if (!window.confirm("Clear all starred questions?")) return;
      progress.bookmarks = [];
      saveProgress();
      paint();
      toast("Stars cleared.", "is-warn");
      return;
    }

    if (action === "clear-mistakes") {
      if (!progress.mistakes.length) return;
      if (!window.confirm("Clear the entire mistake bank?")) return;
      progress.mistakes = [];
      saveProgress();
      paint();
      toast("Mistake bank cleared.", "is-warn");
      return;
    }

    if (action === "reset") {
      if (!window.confirm("Reset all progress? This erases solved questions, XP, streak, bookmarks and mistakes.")) return;
      stopExamTimer();
      progress = defaultProgress();
      state.cards = {};
      exam = null;
      pendingTarget = null;
      try {
        window.localStorage.removeItem(storageKey);
      } catch (error) {
        /* ignore */
      }
      saveProgress();
      paint();
      toast("Progress reset. Fresh notebook, same lab.", "is-warn");
    }
  });

  view.addEventListener("submit", function (event) {
    const form = event.target.closest("form[data-form]");
    if (!form) return;
    event.preventDefault();

    const kind = form.getAttribute("data-form");
    const name = form.elements.name ? form.elements.name.value : "";
    const email = form.elements.email ? form.elements.email.value : "";
    const password = form.elements.password ? form.elements.password.value : "";

    if (kind === "local-login") {
      createLocalAccount(name, email);
      if (activeAccount) resumeAfterAuth();
      return;
    }

    if (!cloud || !cloud.configured) {
      toast("Add your Firebase web config before using cloud login.", "is-warn");
      return;
    }

    if (kind === "cloud-signin") {
      cloud.signInEmail(email, password).then(function (ok) {
        if (ok && hasIdentity()) resumeAfterAuth();
      });
      return;
    }

    if (kind === "cloud-signup") {
      cloud.signUpEmail(name, email, password).then(function (ok) {
        if (ok && hasIdentity()) resumeAfterAuth();
      });
      return;
    }

    if (kind === "cloud-reset") {
      cloud.resetPassword(email).then(function (ok) {
        if (ok) toast("Password reset link sent to " + email.trim() + ".");
      });
    }
  });

  sidebarNav.addEventListener("click", function (event) {
    const toggle = event.target.closest(".nav-group-head");
    if (!toggle) return;
    const group = toggle.closest(".nav-group");
    if (!group) return;
    const collapsed = group.classList.toggle("collapsed");
    toggle.setAttribute("aria-expanded", String(!collapsed));
  });

  sidebar.addEventListener("click", function (event) {
    if (event.target.closest('a[href^="#/"]')) closeSidebar();
  });

  menuBtn.addEventListener("click", function () {
    if (sidebar.classList.contains("open")) closeSidebar();
    else openSidebar();
  });

  sidebarClose.addEventListener("click", closeSidebar);
  sidebarOverlay.addEventListener("click", closeSidebar);

  const accountPanel = document.getElementById("account-panel");
  if (accountPanel) {
    accountPanel.addEventListener("click", function (event) {
      const trigger = event.target.closest("[data-action]");
      if (!trigger) return;
      runAccountAction(trigger.getAttribute("data-action"), trigger);
    });
  }

  searchInput.addEventListener("input", onSearchInput);

  searchInput.addEventListener("focus", function () {
    if (searchInput.value.trim()) renderSearch(searchInput.value);
  });

  searchInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      event.preventDefault();
      if (searchResults.length) openSearchResult(0);
    } else if (event.key === "Escape") {
      closeSearch(true);
      searchInput.blur();
    }
  });

  searchClear.addEventListener("click", function () {
    closeSearch(true);
    searchInput.focus();
  });

  searchResultsPanel.addEventListener("click", function (event) {
    const result = event.target.closest("[data-search-index]");
    if (!result) return;
    openSearchResult(Number(result.getAttribute("data-search-index")));
  });

  document.addEventListener("click", function (event) {
    const focusSearch = event.target.closest('[data-action="focus-search"]');
    if (focusSearch) {
      searchInput.focus();
      searchInput.select();
      return;
    }
    if (!searchWrap.contains(event.target)) closeSearch(false);
    const themeButton = event.target.closest("[data-theme-set]");
    if (themeButton) applyTheme(themeButton.getAttribute("data-theme-set"), true);
  });

  document.addEventListener("keydown", function (event) {
    const active = document.activeElement;
    const typing = active && (active.tagName === "INPUT" || active.tagName === "TEXTAREA" || active.isContentEditable);
    if (event.key === "/" && !typing) {
      event.preventDefault();
      searchInput.focus();
      searchInput.select();
    }
    if (event.key === "Escape") {
      closeSearch(false);
      closeSidebar();
    }
  });

  window.addEventListener("hashchange", function () {
    closeSearch(true);
    closeSidebar();
    render();
  });

  /* --------------------------------------------------------------------------
     Boot
     -------------------------------------------------------------------------- */

  function boot() {
    if (!DATA_READY) {
      renderView();
      return;
    }
    buildIndex();
    initialiseAccounts();
    legacyGuestProgress = takeLegacyGuestProgress();
    loadProgress();
    if (activeAccount && legacyGuestProgress) {
      progress = mergeProgress(progress, legacyGuestProgress);
      legacyGuestProgress = null;
      saveProgress();
      clearLegacyGuestProgress();
    }
    buildSearchIndex();
    attachCloud(window.QuestionaireCloud);
    window.addEventListener("questionaire:cloud-ready", function (event) {
      attachCloud(event.detail);
    });
    renderSidebar();
    applyTheme(getTheme(), false);
    if (!window.location.hash) {
      window.history.replaceState(null, "", "#/dashboard");
    }
    render();
  }

  boot();
})();
