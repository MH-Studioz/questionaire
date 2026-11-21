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

  const APP_VERSION = "0.7.3-alpha";
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
    { id: "written", label: "Written", icon: "pen-line" },
    { id: "learn", label: "Learn", icon: "graduation-cap" },
    { id: "words", label: "Word bank", icon: "languages" },
    { id: "study", label: "Study bank", icon: "book-open" },
    { id: "tips", label: "Tips & hacks", icon: "lightbulb" },
    { id: "videos", label: "Video lessons", icon: "play" }
  ];
  const TAB_IDS = TABS.map(function (tab) { return tab.id; });
  const DIFFICULTIES = ["All", "Beginner", "Intermediate", "Advanced"];

  /* --------------------------------------------------------------------------
     Question codes — internal slug for code, #CODE for people
     -------------------------------------------------------------------------- */

  const DISPLAY_ID_CHARS = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
  const ID_LOOKUP = Object.create(null);

  /* Deterministic 6-character code a student can read aloud, copy and search.
     The alphabet drops 0/O, 1/I and L so a typed code cannot be ambiguous. */
  function getDisplayId(internalId) {
    const source = String(internalId == null ? "" : internalId);
    let hash = 2166136261;
    for (let i = 0; i < source.length; i += 1) {
      hash ^= source.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    let code = "";
    let num = hash >>> 0;
    for (let i = 0; i < 6; i += 1) {
      code += DISPLAY_ID_CHARS[num % DISPLAY_ID_CHARS.length];
      num = Math.floor(num / DISPLAY_ID_CHARS.length) + i * 7;
    }
    return "#" + code;
  }

  function registerDisplayId(question) {
    if (!question || !question.id) return;
    if (!question.displayId) question.displayId = getDisplayId(question.id);
    const full = question.displayId.toUpperCase();
    const bare = full.slice(1);
    [full, bare].forEach(function (key) {
      const bucket = ID_LOOKUP[key] || (ID_LOOKUP[key] = []);
      if (bucket.indexOf(question) < 0) bucket.push(question);
    });
  }

  /* Boot-time map from a typed code back to every question that owns it.
     Values are arrays: the 6-character code is deterministic, so a rare hash
     collision must stay visible instead of silently hiding a question. */
  function buildIdLookup(questions) {
    (Array.isArray(questions) ? questions : []).forEach(registerDisplayId);
    return ID_LOOKUP;
  }

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
    const openBank = window.QUESTIONAIRE_OPEN_BANK || {};
    const frqBank = window.QUESTIONAIRE_FRQ_BANK || {};
    window.STUDY_DATA.categories.forEach(function (category) {
      category.subjects.forEach(function (subject) {
        if (Array.isArray(frqBank[subject.id]) && frqBank[subject.id].length) {
          subject.frq = frqBank[subject.id];
        }
        const extra = openBank[subject.id];
        if (Array.isArray(extra) && extra.length) {
          const known = new Set(subject.questions.map(function (question) { return question.id; }));
          extra.forEach(function (question) {
            if (!question || !question.id || known.has(question.id)) return;
            subject.questions.push(question);
            known.add(question.id);
          });
        }
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
    registerDisplayId(question);
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
    const ids = progress.bookmarks.concat(progress.mistakes, Object.keys(progress.corrected || {}));
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
    decks: {},
    reviewFilter: "all",
    attemptId: null,
    attemptFilter: "all",
    frqId: null
  };

  let exam = null;
  let examTimer = null;
  let paper = null;
  let pendingTarget = null;
  let searchResults = [];
  let searchDebounce = null;
  let toastTimer = null;
  let frqSaveTimer = null;
  let pendingAnnounce = "";
  let pendingFocus = null;

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

  const MAX_ATTEMPTS = 60;
  const MAX_PAUSED = 3;

  function defaultProgress() {
    return {
      version: 1,
      answered: {},
      vocab: {},
      xp: 0,
      streak: 0,
      bestStreak: 0,
      lastStudyDate: null,
      bookmarks: [],
      mistakes: [],
      corrected: {},
      topicStats: {},
      attempts: [],
      active: null,
      paused: [],
      frq: {}
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
      (value.vocab && Object.keys(value.vocab).length) ||
      Number(value.xp) ||
      Number(value.streak) ||
      (Array.isArray(value.bookmarks) && value.bookmarks.length) ||
      (Array.isArray(value.mistakes) && value.mistakes.length) ||
      (Array.isArray(value.attempts) && value.attempts.length) ||
      (Array.isArray(value.paused) && value.paused.length) ||
      (value.topicStats && Object.keys(value.topicStats).length) ||
      (value.frq && Object.keys(value.frq).length)
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

  function mergeAttempts(left, right) {
    const byId = new Map();
    (Array.isArray(left) ? left : []).concat(Array.isArray(right) ? right : []).forEach(function (attempt) {
      if (!attempt || typeof attempt !== "object" || !attempt.id) return;
      const existing = byId.get(attempt.id);
      if (!existing || String(attempt.finishedAt || "") > String(existing.finishedAt || "")) {
        byId.set(attempt.id, attempt);
      }
    });
    return Array.from(byId.values())
      .sort(function (a, b) { return String(b.finishedAt || "").localeCompare(String(a.finishedAt || "")); })
      .slice(0, MAX_ATTEMPTS);
  }

  function mergeTopicStats(left, right) {
    const merged = {};
    [left || {}, right || {}].forEach(function (source) {
      Object.keys(source).forEach(function (subjectId) {
        const bucket = merged[subjectId] || (merged[subjectId] = {});
        const rows = source[subjectId] || {};
        Object.keys(rows).forEach(function (tag) {
          const a = bucket[tag];
          const b = rows[tag] || {};
          if (!a) {
            bucket[tag] = { correct: Number(b.correct) || 0, total: Number(b.total) || 0 };
            return;
          }
          bucket[tag] = {
            correct: Math.max(Number(a.correct) || 0, Number(b.correct) || 0),
            total: Math.max(Number(a.total) || 0, Number(b.total) || 0)
          };
        });
      });
    });
    return merged;
  }

  function mergeFrq(left, right) {
    const merged = {};
    [left || {}, right || {}].forEach(function (source) {
      Object.keys(source).forEach(function (subjectId) {
        const bucket = merged[subjectId] || (merged[subjectId] = {});
        Object.keys(source[subjectId] || {}).forEach(function (promptId) {
          const a = bucket[promptId];
          const b = source[subjectId][promptId] || {};
          if (!a || String(b.updatedAt || "") > String(a.updatedAt || "")) {
            bucket[promptId] = b;
          }
        });
      });
    });
    return merged;
  }

  function usableSitting(value) {
    return Boolean(value && typeof value === "object" && Array.isArray(value.questions) && value.questions.length);
  }

  function sittingKey(sitting) {
    return [sitting.subjectId || "", sitting.kind || "", sitting.key || ""].join("|");
  }

  /* Two devices can each hold a paper in flight. The newest one is the resume
     target; the others stay resumable instead of being overwritten by the
     merge. Keys are subject + paper, so the same paper on both devices keeps
     only the more recent save. */
  function mergeSittings(left, right) {
    const pool = [];
    [left, right].forEach(function (source) {
      if (!source || typeof source !== "object") return;
      if (usableSitting(source.active)) pool.push(source.active);
      (Array.isArray(source.paused) ? source.paused : []).forEach(function (sitting) {
        if (usableSitting(sitting)) pool.push(sitting);
      });
    });
    pool.sort(function (a, b) { return Number(b.savedAt || 0) - Number(a.savedAt || 0); });
    const seen = new Set();
    const kept = [];
    pool.forEach(function (sitting) {
      const key = sittingKey(sitting);
      if (seen.has(key)) return;
      seen.add(key);
      kept.push(sitting);
    });
    return { active: kept[0] || null, paused: kept.slice(1, 1 + MAX_PAUSED) };
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
    const corrected = {};
    [left.corrected || {}, right.corrected || {}].forEach(function (source) {
      Object.keys(source).forEach(function (id) {
        if (!corrected[id] || String(source[id]) > String(corrected[id])) corrected[id] = source[id];
      });
    });
    const mistakes = Array.from(new Set((left.mistakes || []).concat(right.mistakes || [])))
      .filter(isKnownQuestionId)
      .filter(function (id) { return !corrected[id]; });
    const lastStudyDate = [left.lastStudyDate, right.lastStudyDate].filter(Boolean).sort().pop() || null;
    const sittings = mergeSittings(left, right);

    const vocab = {};
    [left.vocab || {}, right.vocab || {}].forEach(function (source) {
      Object.keys(source).forEach(function (subjectId) {
        const bucket = vocab[subjectId] || (vocab[subjectId] = {});
        Object.keys(source[subjectId] || {}).forEach(function (target) {
          const a = bucket[target];
          const b = source[subjectId][target];
          if (!b) return;
          if (!a) {
            bucket[target] = {
              known: Boolean(b.known),
              reps: Number(b.reps) || 0,
              last: b.last || null
            };
            return;
          }
          bucket[target] = {
            known: Boolean(a.known || b.known),
            reps: Math.max(Number(a.reps) || 0, Number(b.reps) || 0),
            last: [a.last, b.last].filter(Boolean).sort().pop() || null
          };
        });
      });
    });

    return {
      version: 1,
      answered: answered,
      vocab: vocab,
      xp: Math.max(Number(left.xp) || 0, Number(right.xp) || 0),
      streak: Math.max(Number(left.streak) || 0, Number(right.streak) || 0),
      bestStreak: Math.max(Number(left.bestStreak) || 0, Number(right.bestStreak) || 0),
      lastStudyDate: lastStudyDate,
      bookmarks: bookmarks,
      mistakes: mistakes,
      corrected: corrected,
      topicStats: mergeTopicStats(left.topicStats, right.topicStats),
      attempts: mergeAttempts(left.attempts, right.attempts),
      active: sittings.active,
      paused: sittings.paused,
      frq: mergeFrq(left.frq, right.frq)
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
    if (!merged.corrected || typeof merged.corrected !== "object") merged.corrected = {};
    merged.mistakes = merged.mistakes.filter(isKnownQuestionId).filter(function (id) {
      return !merged.corrected[id];
    });
    if (!merged.topicStats || typeof merged.topicStats !== "object") merged.topicStats = {};
    if (!Array.isArray(merged.attempts)) merged.attempts = [];
    merged.attempts = mergeAttempts(merged.attempts, []);
    if (!merged.active || typeof merged.active !== "object") merged.active = null;
    merged.paused = (Array.isArray(merged.paused) ? merged.paused : [])
      .filter(usableSitting)
      .filter(function (sitting) { return !merged.active || sittingKey(sitting) !== sittingKey(merged.active); })
      .slice(0, MAX_PAUSED);
    if (!merged.frq || typeof merged.frq !== "object") merged.frq = {};
    if (!merged.vocab || typeof merged.vocab !== "object") merged.vocab = {};
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
    state.decks = {};
    state.attemptId = null;
    state.frqId = null;
    exam = null;
    paper = null;
    pendingTarget = null;
    normalizeStreak();
  }

  function createLocalAccount(name, email, isGuest) {
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
      guest: Boolean(isGuest),
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
    const info = QUESTION_MAP.get(questionId);
    if (info) {
      const tag = (info.question.tags && info.question.tags[0]) || "General";
      const subjectId = info.subject.id;
      const bucket = progress.topicStats[subjectId] || (progress.topicStats[subjectId] = {});
      const row = bucket[tag] || (bucket[tag] = { correct: 0, total: 0 });
      row.total += 1;
      if (isCorrect) row.correct += 1;
    }
    if (!isCorrect && progress.mistakes.indexOf(questionId) < 0) {
      progress.mistakes.push(questionId);
      /* Missed again after a clean retry: it returns to the active queue. */
      delete progress.corrected[questionId];
    }
    /* A miss answered correctly on a later attempt leaves the active queue and
       is filed as "later corrected" so the review tab can show the recovery. */
    if (isCorrect) {
      const index = progress.mistakes.indexOf(questionId);
      if (index >= 0) {
        progress.mistakes.splice(index, 1);
        progress.corrected[questionId] = now;
        const correctedIds = Object.keys(progress.corrected);
        if (correctedIds.length > 200) delete progress.corrected[correctedIds[0]];
      }
    }
    touchStreak();
    saveProgress();
  }

  function reviewMap() {
    const items = new Map();
    progress.mistakes.forEach(function (id) {
      if (QUESTION_MAP.has(id)) items.set(id, { reasons: ["missed"] });
    });
    Object.keys(progress.corrected || {}).forEach(function (id) {
      if (!QUESTION_MAP.has(id) || progress.mistakes.indexOf(id) >= 0) return;
      const item = items.get(id) || { reasons: [] };
      if (item.reasons.indexOf("corrected") < 0) item.reasons.push("corrected");
      items.set(id, item);
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

  function announce(message) {
    pendingAnnounce = message;
    const live = document.getElementById("paper-live") || document.getElementById("exam-live");
    if (live) live.textContent = message;
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
      state.filters[subjectId] = { difficulty: "All", mode: "practice", limit: 20, topic: "" };
    }
    if (!Number(state.filters[subjectId].limit)) state.filters[subjectId].limit = 20;
    if (typeof state.filters[subjectId].topic !== "string") state.filters[subjectId].topic = "";
    return state.filters[subjectId];
  }

  function filteredQuestions(subject, difficulty, topic) {
    let questions = subject.questions.slice();
    if (difficulty && difficulty !== "All") {
      questions = questions.filter(function (question) {
        return question.difficulty === difficulty;
      });
    }
    if (topic) {
      questions = questions.filter(function (question) {
        return (question.tags || []).indexOf(topic) >= 0;
      });
    }
    return questions;
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
     Learning mode — guided path, topic deep dives and video lessons
     -------------------------------------------------------------------------- */

  function subjectTopics(subject) {
    function build(skipOwnName) {
      const topics = new Map();
      subject.questions.forEach(function (question) {
        (question.tags || []).forEach(function (rawTag) {
          const tag = String(rawTag || "").trim();
          /* Skip the course's own name ("Spanish", "Calculus") as a topic. */
          if (!tag) return;
          if (skipOwnName && subject.title.toLowerCase().indexOf(tag.toLowerCase()) >= 0) return;
          const steps = Array.isArray(question.explanation) ? question.explanation.length : 0;
          const current = topics.get(tag);
          if (!current) {
            topics.set(tag, { tag: tag, total: 1, sample: question, steps: steps });
            return;
          }
          current.total += 1;
          if (steps > current.steps) {
            current.sample = question;
            current.steps = steps;
          }
        });
      });
      /* Never show the same worked example twice: use another question on that
         topic, or drop the topic when the bank has no second example. */
      const used = new Set();
      return Array.from(topics.values())
        .sort(function (a, b) { return b.total - a.total || a.tag.localeCompare(b.tag); })
        .filter(function (lesson) {
          if (!used.has(lesson.sample.id)) {
            used.add(lesson.sample.id);
            return true;
          }
          const alternative = subject.questions.find(function (question) {
            return !used.has(question.id) && (question.tags || []).indexOf(lesson.tag) >= 0;
          });
          if (!alternative) return false;
          lesson.sample = alternative;
          used.add(alternative.id);
          return true;
        });
    }

    /* Most subjects keep their curated topic tags. Subjects whose only tag is
       their own discipline name would lose every deep dive, so fall back to
       those tags rather than showing an empty Learn tab. */
    let lessons = build(true);
    if (lessons.length < 2) {
      lessons = build(false).filter(function (lesson) {
        return lesson.tag.toLowerCase() !== subject.title.toLowerCase();
      });
    }
    return lessons.slice(0, 8);
  }

  function youTubeSearch(query) {
    return "https://www.youtube.com/results?search_query=" + encodeURIComponent(query);
  }

  function lessonHTML(entry, topic) {
    const subject = entry.subject;
    const question = topic.sample;
    const steps = Array.isArray(question.explanation) ? question.explanation : [];
    return (
      '<article class="lesson card">' +
      '<div class="lesson-head">' +
      '<span class="lesson-kicker">Deep dive</span>' +
      "<h3>" + esc(topic.tag) + "</h3>" +
      '<span class="lesson-count">' + topic.total + " " + plural(topic.total, "question", "questions") + "</span>" +
      "</div>" +
      '<p class="lesson-prompt">' + esc(question.prompt) + "</p>" +
      '<div class="lesson-answer"><span>Answer</span><strong>' + esc(question.options[question.answer]) + "</strong></div>" +
      '<ol class="steps">' + steps.map(function (step) {
        return '<li class="step"><span class="step-body">' + esc(step) + "</span></li>";
      }).join("") + "</ol>" +
      '<div class="lesson-actions">' +
      '<button type="button" class="btn btn-ghost btn-sm" data-action="focus-question" data-qid="' + esc(question.id) + '" data-subject="' + esc(subject.id) + '"><i data-lucide="target"></i>Practise this card</button>' +
      '<a class="btn btn-ghost btn-sm" href="' + youTubeSearch(subject.title + " " + topic.tag) + '" target="_blank" rel="noopener"><i data-lucide="play"></i>Find a video lesson</a>' +
      "</div></article>"
    );
  }

  function languageDeckSubject(subject) {
    if (subject.track !== "languages") return null;
    return SUBJECTS.find(function (entry) {
      if (!packWords(entry.subject).length) return false;
      const title = entry.subject.title;
      if (subject.title.indexOf(title) >= 0) return true;
      return title.split(" ").some(function (word) {
        return word.length > 3 && subject.title.indexOf(word) >= 0;
      });
    }) || null;
  }

  function learnTabHTML(entry) {
    const subject = entry.subject;
    const topics = subjectTopics(subject);
    const deckEntry = languageDeckSubject(subject);

    const deck = deckEntry
      ? '<div class="vocab-callout card">' +
        '<span class="vocab-callout-icon"><i data-lucide="languages"></i></span>' +
        "<div><h3>Full language deck</h3><p>This course is exam-level, so its questions stay on the exam. The words themselves live in the " + esc(deckEntry.subject.title) + " word bank and flashcards.</p></div>" +
        '<div class="vocab-callout-actions">' +
        '<a class="btn btn-ghost btn-sm" href="#/subject/' + esc(deckEntry.subject.id) + '/words">Open word bank</a>' +
        '<button type="button" class="btn btn-teal btn-sm" data-action="open-flashcards" data-subject="' + esc(deckEntry.subject.id) + '">Flashcards</button>' +
        "</div></div>"
      : "";

    const intro =
      '<div class="learn-intro card">' +
      '<span class="eyebrow">Learning mode</span>' +
      "<h2>Learn " + esc(subject.title) + " properly</h2>" +
      "<p>" + esc(subject.blurb) + "</p>" +
      '<div class="learn-meta">' +
      '<span><b>' + formatCount(questionTotal(subject)) + "</b> questions</span>" +
      '<span><b>' + subject.study.length + "</b> study cards</span>" +
      '<span><b>' + subject.videos.length + "</b> videos</span>" +
      "</div>" +
      (subject.examFormat ? '<p class="learn-format"><i data-lucide="calendar-check"></i>' + esc(subject.examFormat) + "</p>" : "") +
      '<div class="learn-actions">' +
      '<button type="button" class="btn btn-primary" data-action="focus-question" data-qid="' + esc(subject.questions[0] ? subject.questions[0].id : "") + '" data-subject="' + esc(subject.id) + '"><i data-lucide="play"></i>Start practising</button>' +
      '<a class="btn btn-ghost" href="#/subject/' + esc(subject.id) + '/study"><i data-lucide="book-open"></i>Study cards</a>' +
      '<a class="btn btn-ghost" href="' + youTubeSearch("learn " + subject.title) + '" target="_blank" rel="noopener"><i data-lucide="play"></i>Video lessons</a>' +
      "</div></div>";

    const path =
      '<div class="learn-path card">' +
      "<h3>How to work through this subject</h3>" +
      '<ol class="learn-steps">' +
      "<li><strong>Read the study cards.</strong> Get the vocabulary and the two or three rules that do most of the work.</li>" +
      "<li><strong>Read one deep dive.</strong> Each one is a real question with every step of the reasoning spelled out.</li>" +
      "<li><strong>Practise ten questions.</strong> Anything you miss lands in the review queue automatically.</li>" +
      "<li><strong>Watch one video.</strong> Seeing it once fixes the shape of the idea before more practice.</li>" +
      "</ol></div>";

    const detail = topics.length
      ? '<h3 class="learn-heading">Topic deep dives</h3><div class="lesson-grid">' + topics.map(function (topic) {
        return lessonHTML(entry, topic);
      }).join("") + "</div>"
      : "";

    const study =
      '<h3 class="learn-heading">Study cards</h3>' + studyTabHTML(subject);

    const videos = subject.videos.length
      ? '<h3 class="learn-heading">Video lessons</h3>' + videosTabHTML(subject)
      : '<div class="learn-videos-empty card"><h3>No curated video yet</h3><p>Use the video button above: it opens YouTube results for this subject, and every deep dive links to its own topic search.</p></div>';

    return intro + deck + path + detail + study + videos;
  }

  /* --------------------------------------------------------------------------
     Language studio — word decks, pronunciation and flashcards
     -------------------------------------------------------------------------- */

  function languagePack(subject) {
    const packs = window.QuestionaireLanguagePacks;
    return packs && typeof packs.forSubject === "function" ? packs.forSubject(subject) : null;
  }

  function packWords(subject) {
    const pack = languagePack(subject);
    return pack ? pack.words : [];
  }

  function vocabRecord(subjectId, target) {
    const bucket = (progress.vocab && progress.vocab[subjectId]) || {};
    return bucket[target] || null;
  }

  function vocabKnownCount(subject) {
    const bucket = (progress.vocab && progress.vocab[subject.id]) || {};
    let known = 0;
    packWords(subject).forEach(function (word) {
      if (bucket[word.target] && bucket[word.target].known) known += 1;
    });
    return known;
  }

  function markVocabulary(subject, target, known) {
    if (!progress.vocab || typeof progress.vocab !== "object") progress.vocab = {};
    const bucket = progress.vocab[subject.id] || (progress.vocab[subject.id] = {});
    const record = bucket[target] || { known: false, reps: 0, last: null };
    const firstTimeKnown = known && !record.known;
    record.known = known;
    record.reps = (Number(record.reps) || 0) + 1;
    record.last = new Date().toISOString();
    bucket[target] = record;
    progress.xp = (progress.xp || 0) + (firstTimeKnown ? XP_PER_CORRECT : XP_PER_ATTEMPT);
    touchStreak();
    saveProgress();
    return record;
  }

  function speak(text, code, interrupt) {
    if (!window.speechSynthesis || typeof window.SpeechSynthesisUtterance !== "function") {
      toast("This browser has no speech engine — use the pronunciation guide instead.", "is-warn");
      return false;
    }
    try {
      if (interrupt) window.speechSynthesis.cancel();
      const utterance = new window.SpeechSynthesisUtterance(text);
      utterance.lang = code || "en-US";
      utterance.rate = 0.8;
      const prefix = String(utterance.lang).slice(0, 2).toLowerCase();
      const voices = window.speechSynthesis.getVoices();
      const match = voices.find(function (voice) {
        return String(voice.lang || "").toLowerCase().indexOf(prefix) === 0;
      });
      if (match) utterance.voice = match;
      window.speechSynthesis.speak(utterance);
      return true;
    } catch (error) {
      toast("Audio could not play in this browser.", "is-warn");
      return false;
    }
  }

  function speakWord(text, code) {
    if (!text) return;
    speak(text, code, true);
  }

  function speakDeck(subject) {
    const words = packWords(subject);
    const pack = languagePack(subject);
    if (!words.length || !pack) return;
    if (!window.speechSynthesis) {
      speak("", pack.code, true);
      return;
    }
    window.speechSynthesis.cancel();
    words.forEach(function (word) {
      speak(word.target, pack.code, false);
    });
  }

  function shuffledIndices(length) {
    const order = [];
    for (let index = 0; index < length; index += 1) order.push(index);
    for (let index = order.length - 1; index > 0; index -= 1) {
      const swap = Math.floor(Math.random() * (index + 1));
      const value = order[index];
      order[index] = order[swap];
      order[swap] = value;
    }
    return order;
  }

  function vocabDeck(subject) {
    const words = packWords(subject);
    let deck = state.decks[subject.id];
    if (!deck || deck.size !== words.length) {
      deck = state.decks[subject.id] = {
        size: words.length,
        order: shuffledIndices(words.length),
        index: 0,
        revealed: false,
        known: 0,
        again: 0
      };
    }
    return deck;
  }

  function vocabularyCallout(subject) {
    if (!packWords(subject).length) return "";
    return (
      '<div class="vocab-callout card">' +
      '<span class="vocab-callout-icon"><i data-lucide="languages"></i></span>' +
      '<div><h3>Word deck &amp; flashcards</h3>' +
      "<p>Learn the highest-frequency " + esc(subject.title) + " words with pronunciation guides, then drill them as flashcards.</p></div>" +
      '<div class="vocab-callout-actions">' +
      '<a class="btn btn-ghost btn-sm" href="#/subject/' + esc(subject.id) + '/words"><i data-lucide="book-open"></i>Open word bank</a>' +
      '<button type="button" class="btn btn-teal btn-sm" data-action="open-flashcards" data-subject="' + esc(subject.id) + '"><i data-lucide="layers"></i>Flashcards</button>' +
      "</div></div>"
    );
  }

  function wordsTabHTML(entry) {
    const subject = entry.subject;
    const pack = languagePack(subject);
    if (!pack) {
      return emptyState("languages", "No word deck for this subject", "English Language practises grammar, not vocabulary. Practice and study cards still work.", "");
    }
    const words = pack.words;
    const total = words.length;
    const known = vocabKnownCount(subject);
    const pct = total ? Math.round((known / total) * 100) : 0;
    let cursor = 0;

    const themes = pack.groups.map(function (group) {
      const rows = group[1].map(function () {
        const word = words[cursor];
        const index = cursor;
        cursor += 1;
        const record = vocabRecord(subject.id, word.target);
        const isKnown = Boolean(record && record.known);
        return (
          '<li class="word-row' + (isKnown ? " is-known" : "") + '" data-word-row="' + esc(subject.id + "-w-" + index) + '">' +
          '<div class="word-main"><span class="word-target">' + esc(word.target) + "</span>" +
          '<span class="word-pron">' + esc(word.pronunciation) + "</span></div>" +
          '<span class="word-english">' + esc(word.english) + "</span>" +
          '<div class="word-actions">' +
          '<button type="button" class="word-audio" data-action="speak" data-word="' + esc(word.target) + '" data-lang="' + esc(pack.code) + '" aria-label="Listen to ' + esc(word.target) + '" title="Listen">' +
          '<i data-lucide="volume-2"></i><span>Listen</span></button>' +
          '<button type="button" class="word-known" data-action="vocab" data-subject="' + esc(subject.id) + '" data-word="' + esc(word.target) + '" aria-pressed="' + isKnown + '" title="' + (isKnown ? "Send back to practice" : "Mark as known") + '">' +
          '<i data-lucide="' + (isKnown ? "check-circle" : "circle") + '"></i><span>' + (isKnown ? "Known" : "Learn") + "</span></button>" +
          "</div></li>"
        );
      }).join("");
      return (
        '<section class="word-theme">' +
        '<div class="word-theme-head"><h3>' + esc(group[0]) + '</h3><span>' + group[1].length + " words</span></div>" +
        '<ul class="word-list">' + rows + "</ul></section>"
      );
    }).join("");

    return (
      '<div class="wordbank-head card">' +
      '<div class="wordbank-copy">' +
      '<span class="eyebrow">High-frequency starter deck</span>' +
      "<h2>" + esc(subject.title) + " · " + total + " words</h2>" +
      "<p>Everyday words first, each with a plain-English pronunciation guide. Tap Listen, say it out loud, then mark it known. The guides are approximations — trust the audio and a native speaker over the spelling.</p></div>" +
      '<div class="wordbank-score"><strong>' + known + "/" + total + "</strong><span>words known</span></div>" +
      '<div class="wordbank-progress"><div class="progress"><div class="progress-bar" style="width:' + pct + '%"></div></div></div>' +
      '<div class="wordbank-actions">' +
      '<button type="button" class="btn btn-primary" data-action="open-flashcards" data-subject="' + esc(subject.id) + '"><i data-lucide="layers"></i>Start flashcards</button>' +
      '<button type="button" class="btn btn-ghost" data-action="speak-all" data-subject="' + esc(subject.id) + '"><i data-lucide="volume-2"></i>Hear the deck</button>' +
      "</div></div>" +
      '<div class="word-themes">' + themes + "</div>"
    );
  }

  function flashcardsHTML(entry) {
    const subject = entry.subject;
    const words = packWords(subject);
    if (!words.length) {
      return emptyState("layers", "No flashcards for this subject", "Flashcards run on the high-frequency word decks. English Language practises grammar instead.", "");
    }
    const deck = vocabDeck(subject);
    const total = deck.order.length;

    if (deck.index >= total) {
      return (
        '<div class="deck-summary card">' +
        '<span class="eyebrow">Deck complete</span>' +
        "<h2>" + esc(subject.title) + " — " + total + " cards</h2>" +
        '<div class="deck-score">' +
        '<div><strong>' + deck.known + "</strong><span>got it</span></div>" +
        '<div><strong>' + deck.again + "</strong><span>still learning</span></div>" +
        '<div><strong>' + vocabKnownCount(subject) + "/" + words.length + "</strong><span>known overall</span></div>" +
        "</div>" +
        '<div class="deck-actions">' +
        '<button type="button" class="btn btn-primary" data-action="flash-restart" data-subject="' + esc(subject.id) + '"><i data-lucide="shuffle"></i>Shuffle and go again</button>' +
        '<a class="btn btn-ghost" href="#/subject/' + esc(subject.id) + '/words"><i data-lucide="book-open"></i>Word bank</a>' +
        "</div></div>"
      );
    }

    const word = words[deck.order[deck.index]];
    const record = vocabRecord(subject.id, word.target);
    const pct = Math.round((deck.index / total) * 100);
    const back = deck.revealed
      ? '<span class="flash-pron">' + esc(word.pronunciation) + "</span>" +
        '<span class="flash-english">' + esc(word.english) + "</span>"
      : '<span class="flash-reveal">Tap to reveal the meaning</span>';

    return (
      '<div class="deck">' +
      '<div class="deck-head">' +
      '<span class="deck-count">Card ' + (deck.index + 1) + " of " + total + "</span>" +
      '<span class="deck-theme">' + esc(word.theme) + "</span>" +
      '<button type="button" class="btn btn-ghost btn-sm" data-action="flash-restart" data-subject="' + esc(subject.id) + '"><i data-lucide="shuffle"></i>Reshuffle</button>' +
      "</div>" +
      '<div class="progress deck-progress"><div class="progress-bar" style="width:' + pct + '%"></div></div>' +
      '<button type="button" class="flashcard' + (deck.revealed ? " is-revealed" : "") + '" data-action="flip-card" data-subject="' + esc(subject.id) + '" aria-label="' + (deck.revealed ? "Hide the answer" : "Reveal the answer") + '">' +
      '<span class="flash-word">' + esc(word.target) + "</span>" +
      back +
      "</button>" +
      '<div class="deck-actions">' +
      '<button type="button" class="word-audio" data-action="speak" data-word="' + esc(word.target) + '" data-lang="' + esc(languagePack(subject).code) + '" title="Listen">' +
      '<i data-lucide="volume-2"></i>Listen</button>' +
      (deck.revealed
        ? '<button type="button" class="btn btn-ghost" data-action="flash-again" data-subject="' + esc(subject.id) + '"><i data-lucide="rotate-ccw"></i>Still learning</button>' +
          '<button type="button" class="btn btn-teal" data-action="flash-known" data-subject="' + esc(subject.id) + '"><i data-lucide="check"></i>Got it</button>'
        : '<button type="button" class="btn btn-primary" data-action="flip-card" data-subject="' + esc(subject.id) + '"><i data-lucide="eye"></i>Reveal</button>') +
      "</div>" +
      '<p class="deck-note">' +
      esc(record && record.known ? "You already marked this one as known — confirm it or send it back to practice." : "Say it out loud before you reveal. Recall beats recognition.") +
      "</p></div>"
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
      const detail = activeAccount.guest ? "Guest session" : activeAccount.email || "Device profile";
      const syncNote = activeAccount.guest ? "Guest · progress stays in this browser" : "Local profile · offline only";
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
        ? (activeAccount.guest ? "Guest · this browser only" : "Local profile · offline only")
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
      footerMeta.textContent = "Vol. 1 · " + SUBJECTS.length + " subjects · Release " + APP_VERSION + " · Set in Instrument Serif & IBM Plex";
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
      state.decks = {};
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
    if (pendingFocus === "paper-question") {
      pendingFocus = null;
      const target = view.querySelector(".paper-question");
      if (target) target.focus({ preventScroll: false });
    }
    if (pendingAnnounce) {
      const live = document.getElementById("paper-live") || document.getElementById("exam-live");
      if (live) live.textContent = pendingAnnounce;
      pendingAnnounce = "";
    }
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
      '<i data-lucide="search"></i><span>Search subjects, topics, questions or #codes</span><kbd aria-hidden="true">/</kbd></button>' +
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

      '<section class="home-section home-work">' +
      '<div class="home-section-head"><div><span class="eyebrow">Your record, measured</span><h2>Papers &amp; weak spots</h2><p>Every sitting is saved with its answers and topic report. Retake one and the comparison is waiting for you.</p></div>' +
      '<a class="text-link" href="#/review">Review queue<i data-lucide="arrow-right"></i></a></div>' +
      '<div class="work-grid">' + recentAttemptsHTML() + masteryPanelHTML(4) + '</div>' +
      (progress.active || (progress.paused && progress.paused.length) ? activeResumeHTML() + pausedResumeHTML() : "") +
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
      if (tab.id === "words") return packWords(subject).length > 0;
      if (tab.id === "written") return Array.isArray(subject.frq) && subject.frq.length > 0;
      return tab.id !== "videos" || subject.videos.length > 0;
    });

    const tabs = visibleTabs.map(function (tab) {
      let count = 0;
      if (tab.id === "practice") count = subject.questions.length;
      if (tab.id === "written") count = subject.frq.length;
      if (tab.id === "learn") count = subjectTopics(subject).length;
      if (tab.id === "words") count = packWords(subject).length;
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
    if (state.route.tab === "written") panel = frqTabHTML(entry);
    else if (state.route.tab === "learn") panel = learnTabHTML(entry);
    else if (state.route.tab === "words") panel = wordsTabHTML(entry);
    else if (state.route.tab === "study") panel = studyTabHTML(subject);
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
      '<button type="button" class="btn btn-ghost" data-action="open-papers" data-subject="' + esc(subject.id) + '"><i data-lucide="file-stack"></i>Test papers</button>' +
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
    const questions = filteredQuestions(subject, filters.difficulty, filters.topic);
    const deckSize = packWords(subject).length;
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
      (deckSize
        ? '<button type="button" class="mode-btn ' + (filters.mode === "flashcards" ? "active" : "") + '" data-action="mode" data-subject="' + esc(subject.id) + '" data-mode="flashcards">' +
          '<i data-lucide="layers"></i>Flashcards</button>'
        : "") +
      '<button type="button" class="mode-btn ' + (filters.mode === "exam" ? "active" : "") + '" data-action="mode" data-subject="' + esc(subject.id) + '" data-mode="exam">' +
      '<i data-lucide="timer"></i>Exam</button>' +
      '<button type="button" class="mode-btn ' + (filters.mode === "papers" ? "active" : "") + '" data-action="mode" data-subject="' + esc(subject.id) + '" data-mode="papers">' +
      '<i data-lucide="file-stack"></i>Papers</button>' +
      "</div></div>";

    const topicNote = filters.topic
      ? '<p class="practice-note topic-note"><i data-lucide="filter"></i>Focused on <strong>' + esc(filters.topic) + '</strong> ' +
        '<button type="button" class="btn btn-ghost btn-sm" data-action="clear-topic" data-subject="' + esc(subject.id) + '">Clear topic</button></p>'
      : "";

    if (filters.mode === "papers") {
      if (exam && exam.subjectId === subject.id && exam.paperKey) return toolbar + examTabHTML(entry, questions);
      if (paper && paper.subjectId === subject.id) return toolbar + paperRunnerHTML(entry);
      return toolbar + papersTabHTML(entry);
    }

    if (filters.mode === "exam") return toolbar + examTabHTML(entry, questions);
    if (filters.mode === "flashcards") return toolbar + flashcardsHTML(entry);

    if (!questions.length) {
      return toolbar + emptyState("filter", "No questions at this difficulty", "Try another filter — this bank has " + subject.questions.length + " questions in total.", "");
    }

    return (
      toolbar + topicNote +
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

  function codeChipHTML(question) {
    if (!question || !question.displayId) return "";
    return '<button type="button" class="q-code" data-action="copy-code" data-code="' + esc(question.displayId) + '" title="Copy this code — it also works in search" aria-label="Question code ' + esc(question.displayId) + '">' + esc(question.displayId) + "</button>";
  }

  function sourceFor(question) {
    const registry = window.QUESTIONAIRE_SOURCES || {};
    return question && question.source ? registry[question.source] || null : null;
  }

  function questionSourceHTML(question) {
    const source = sourceFor(question);
    if (!source) return "";
    return (
      '<p class="q-source"><i data-lucide="library"></i>Aligned to <a href="' + esc(source.url) + '" target="_blank" rel="noopener">' + esc(source.title) + "</a>" +
      (question.sourceRef ? " · " + esc(question.sourceRef) : "") + " · " + esc(source.licence) + "</p>"
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
      if (reason === "missed") return '<span class="badge badge-advanced"><i data-lucide="circle-x"></i>Missed</span>';
      if (reason === "corrected") return '<span class="badge badge-beginner"><i data-lucide="check"></i>Later corrected</span>';
      return '<span class="badge badge-intermediate"><i data-lucide="star"></i>Starred</span>';
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
      codeChipHTML(question) +
      subjectChip + reasons + tags +
      "</div>" +
      '<div class="q-actions">' +
      '<button type="button" class="icon-btn star-btn ' + (starred ? "is-starred" : "") + '" data-action="bookmark" data-qid="' + esc(question.id) + '" ' +
      'aria-pressed="' + starred + '" aria-label="' + (starred ? "Remove bookmark" : "Bookmark for review") + '" title="Bookmark for review">' +
      '<i data-lucide="star"></i></button>' +
      "</div></div>" +
      '<div class="q-prompt">' + esc(question.prompt) + "</div>" +
      questionSourceHTML(question) +
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
    const missedCount = activeExam.questions.filter(function (question) {
      return activeExam.answers[question.id] !== question.answer;
    }).length;
    const previous = lastAttempt(activeExam.subjectId, activeExam.paperKey || "exam", activeExam.attemptId);
    const delta = previous ? activeExam.score - previous.score : null;
    const visibleQuestions = submitted && activeExam.reviewMisses
      ? activeExam.questions.filter(function (question) { return activeExam.answers[question.id] !== question.answer; })
      : activeExam.questions;

    const bar = submitted
      ? '<div class="exam-result">' +
        '<div class="exam-score">' + activeExam.score + "<small>/" + activeExam.questions.length + "</small></div>" +
        '<div class="exam-result-copy"><strong>' +
        (activeExam.score === activeExam.questions.length ? "Perfect run." : activeExam.score / activeExam.questions.length >= 0.7 ? "Strong pass." : "Review the misses below.") +
        "</strong>You answered " + activeExam.score + " of " + activeExam.questions.length + " correctly. Saved to paper history." +
        (delta === null ? "" : " " + (delta >= 0 ? "+" : "") + delta + " vs your previous sit.") + "</div>" +
        '<div class="exam-result-actions">' +
        (activeExam.paperKey
          ? '<button type="button" class="btn btn-ghost btn-sm" data-action="retake-paper" data-subject="' + esc(subject.id) + '" data-paper="' + esc(activeExam.paperKey) + '"><i data-lucide="rotate-ccw"></i>Retake paper</button>' +
            '<button type="button" class="btn btn-ghost btn-sm" data-action="exit-paper"><i data-lucide="file-stack"></i>All papers</button>'
          : '<button type="button" class="btn btn-ghost btn-sm" data-action="retake-exam" data-subject="' + esc(subject.id) + '"><i data-lucide="rotate-ccw"></i>Retake</button>') +
        (missedCount ? '<button type="button" class="btn btn-teal btn-sm" data-action="exam-retake-misses"><i data-lucide="target"></i>Retake ' + missedCount + " " + plural(missedCount, "miss", "misses") + "</button>" : "") +
        (missedCount ? '<button type="button" class="btn btn-ghost btn-sm ' + (activeExam.reviewMisses ? "" : "is-active") + '" data-action="exam-review-filter" data-value="all">All answers</button>' +
          '<button type="button" class="btn btn-ghost btn-sm ' + (activeExam.reviewMisses ? "is-active" : "") + '" data-action="exam-review-filter" data-value="misses">Only misses</button>' : "") +
        "</div></div>" + examReportHTML(activeExam)
      : '<div class="exam-bar">' +
        '<p class="sr-only" id="exam-live" role="status" aria-live="polite"></p>' +
        '<div class="exam-timer" id="exam-timer-wrap"><i data-lucide="timer"></i><span id="exam-timer">' + formatTime(remaining) + "</span></div>" +
        '<div class="exam-progress"><div class="progress"><div class="progress-bar" id="exam-progress-bar" style="width:' + timePct + '%"></div></div></div>' +
        '<div class="exam-meta">' + answeredCount + " / " + activeExam.questions.length + " answered" +
        ((activeExam.flags || []).length ? " · " + activeExam.flags.length + " marked" : "") + "</div>" +
        '<button type="button" class="btn btn-ghost btn-sm" data-action="exam-review-open"><i data-lucide="clipboard-check"></i>Review</button>' +
        '<button type="button" class="btn btn-teal" data-action="submit-exam"><i data-lucide="check-check"></i>Submit</button>' +
        "</div>";

    return (
      bar +
      (submitted ? "" : examNavigatorHTML(activeExam)) +
      (activeExam.reviewing && !submitted ? examReviewPanelHTML(activeExam) : "") +
      '<div class="card exam-panel">' + visibleQuestions.map(function (question) {
        return examQuestionHTML(question, activeExam.questions.indexOf(question), activeExam, submitted);
      }).join("") + "</div>" +
      (submitted ? "" : '<div class="exam-actions"><button type="button" class="btn btn-teal" data-action="submit-exam"><i data-lucide="check-check"></i>Submit exam</button></div>')
    );
  }

  function examNavigatorHTML(activeExam) {
    return (
      '<div class="card q-nav-card exam-nav">' +
      '<div class="q-nav-head"><span class="eyebrow">Question navigator</span>' +
      '<span class="q-nav-legend"><span class="q-nav-key is-answered"></span>Answered' +
      '<span class="q-nav-key is-flagged"></span>Marked</span></div>' +
      '<div class="q-nav">' + activeExam.questions.map(function (question, index) {
        const done = activeExam.answers[question.id] !== undefined;
        const marked = (activeExam.flags || []).indexOf(question.id) >= 0;
        return '<button type="button" class="q-nav-btn' + (done ? " is-answered" : "") + (marked ? " is-flagged" : "") + '" data-action="exam-goto" data-index="' + index + '" aria-label="Question ' + (index + 1) + (done ? ", answered" : ", blank") + '">' + (index + 1) + "</button>";
      }).join("") + "</div>" +
      '<p class="q-nav-note">Tap a number to jump. Marked questions stay flagged when you submit.</p></div>'
    );
  }

  function examReviewPanelHTML(activeExam) {
    const total = activeExam.questions.length;
    const answered = Object.keys(activeExam.answers).length;
    const blank = total - answered;
    const rows = activeExam.questions.map(function (question, index) {
      const done = activeExam.answers[question.id] !== undefined;
      const marked = (activeExam.flags || []).indexOf(question.id) >= 0;
      return (
        '<button type="button" class="paper-review-row' + (done ? " is-answered" : " is-blank") + (marked ? " is-flagged" : "") + '" data-action="exam-goto" data-index="' + index + '">' +
        '<span class="mono">' + (index + 1) + "</span>" +
        "<span>" + (done ? "Answered" : "Blank") + (marked ? " · marked for review" : "") + "</span>" +
        '<span class="mono">' + (done ? "ABCD".charAt(activeExam.answers[question.id]) : "—") + "</span></button>"
      );
    }).join("");
    return (
      '<div class="card paper-review exam-review">' +
      '<div class="exam-intro-head"><span class="subject-icon accent-amber"><i data-lucide="clipboard-check"></i></span>' +
      "<div><h2>Review before you submit</h2><p>" + answered + " of " + total + " answered · " + blank + " blank · " + (activeExam.flags || []).length + " marked. The clock is still running.</p></div></div>" +
      '<div class="paper-review-list">' + rows + "</div>" +
      '<div class="exam-actions">' +
      '<button type="button" class="btn btn-ghost" data-action="exam-review-close"><i data-lucide="arrow-left"></i>Back to questions</button>' +
      '<button type="button" class="btn btn-teal" data-action="submit-exam"><i data-lucide="check-check"></i>Submit exam</button>' +
      "</div></div>"
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

    const flagged = (activeExam.flags || []).indexOf(question.id) >= 0;
    const missed = submitted && activeExam.answers[question.id] !== question.answer;

    return (
      '<div class="exam-question' + (missed ? " is-missed" : "") + '" id="exam-q-' + index + '">' +
      '<div class="exam-question-head">' +
      '<span class="exam-qnum">' + (index + 1) + "</span>" +
      '<span class="badge ' + badgeClass(question.difficulty) + '">' + esc(question.difficulty) + "</span>" +
      codeChipHTML(question) +
      '<span class="exam-q-tools">' +
      (submitted ? "" : '<button type="button" class="flag-btn ' + (flagged ? "is-flagged" : "") + '" data-action="exam-flag" data-qid="' + esc(question.id) + '" aria-pressed="' + flagged + '" aria-label="Mark for review"><i data-lucide="flag"></i>' + (flagged ? "Marked" : "Mark") + "</button>") +
      '<button type="button" class="icon-btn star-btn ' + (starred ? "is-starred" : "") + '" data-action="bookmark" data-qid="' + esc(question.id) + '" aria-label="Bookmark for review" title="Bookmark for review"><i data-lucide="star"></i></button></span>' +
      "</div>" +
      '<div class="q-prompt">' + esc(question.prompt) + "</div>" +
      questionSourceHTML(question) +
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
    getFilters(subjectId).mode = "exam";
    state.attemptId = null;
    const totalSeconds = questions.length * (test ? test.secondsPerQuestion || SECONDS_PER_QUESTION : SECONDS_PER_QUESTION);
    exam = {
      subjectId: subjectId,
      questions: questions,
      answers: {},
      flags: [],
      submitted: false,
      score: 0,
      reviewing: false,
      reviewMisses: false,
      totalSeconds: totalSeconds,
      endsAt: Date.now() + totalSeconds * 1000,
      startedAt: Date.now()
    };
    saveActiveAttempt();
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
      if (!exam.announced) exam.announced = {};
      [300, 60, 30, 10].forEach(function (mark) {
        if (remaining <= mark && remaining > 0 && !exam.announced[mark]) {
          exam.announced[mark] = true;
          const live = document.getElementById("exam-live");
          if (live) live.textContent = formatTime(mark) + " remaining.";
        }
      });
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
    exam.reviewing = false;
    exam.score = 0;
    exam.questions.forEach(function (question) {
      const correct = exam.answers[question.id] === question.answer;
      if (correct) exam.score += 1;
      recordAnswer(question.id, correct);
    });
    const entry = SUBJECT_MAP.get(exam.subjectId);
    const attempt = archiveAttempt({
      kind: exam.paperKey ? "mock" : "exam",
      subjectId: exam.subjectId,
      subjectTitle: entry ? entry.subject.title : "",
      key: exam.paperKey || "exam",
      label: exam.paperLabel || "Timed exam",
      questions: exam.questions,
      answers: exam.answers,
      flags: exam.flags,
      startedAt: exam.startedAt,
      seconds: Math.min(Number(exam.totalSeconds) || Infinity, (Date.now() - exam.startedAt) / 1000)
    });
    exam.attemptId = attempt.id;
    paint();
    toast(
      (auto ? "Time's up — " : "") + "Exam graded: " + exam.score + "/" + exam.questions.length,
      exam.score / exam.questions.length >= 0.7 ? "" : "is-warn"
    );
  }

  /* --------------------------------------------------------------------------
     Test papers — fixed practice sets and timed mock papers
     -------------------------------------------------------------------------- */

  /* --------------------------------------------------------------------------
     Attempts — one saved record for sets, mock papers and timed exams
     -------------------------------------------------------------------------- */

  function newAttemptId() {
    return "att-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 6);
  }

  function encodeAnswers(questions, answers) {
    return questions.map(function (question) {
      const value = answers[question.id];
      return value === undefined ? "x" : String(value);
    }).join("");
  }

  function decodeAnswers(attempt) {
    const answers = {};
    const raw = String((attempt && attempt.answers) || "");
    ((attempt && attempt.questions) || []).forEach(function (id, index) {
      const value = raw.charAt(index);
      if (value && value !== "x") answers[id] = Number(value);
    });
    return answers;
  }

  function questionObjectsFor(ids, subjectId) {
    const entry = SUBJECT_MAP.get(subjectId);
    if (entry) ensureSubjectBank(entry);
    return (ids || []).map(function (id) {
      const info = QUESTION_MAP.get(id);
      return info ? info.question : null;
    }).filter(Boolean);
  }

  function attemptKindLabel(kind) {
    if (kind === "mock") return "Mock paper";
    if (kind === "exam") return "Timed exam";
    if (kind === "retry") return "Misses retake";
    return "Practice set";
  }

  function attemptWhen(iso) {
    if (!iso) return "—";
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return "—";
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" }) + " · " +
      date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  }

  function attemptById(id) {
    return (progress.attempts || []).find(function (attempt) { return attempt.id === id; }) || null;
  }

  function subjectAttempts(subjectId) {
    return (progress.attempts || []).filter(function (attempt) {
      return attempt.subjectId === subjectId;
    });
  }

  function lastAttempt(subjectId, key, beforeId) {
    return subjectAttempts(subjectId).find(function (attempt) {
      return attempt.paperKey === key && attempt.id !== beforeId;
    }) || null;
  }

  function bestAttempt(subjectId, key) {
    return subjectAttempts(subjectId).filter(function (attempt) {
      return attempt.paperKey === key;
    }).sort(function (a, b) { return b.score / (b.total || 1) - a.score / (a.total || 1); })[0] || null;
  }

  function archiveAttempt(spec) {
    const questions = spec.questions || [];
    const answers = spec.answers || {};
    const score = questions.filter(function (question) {
      return answers[question.id] === question.answer;
    }).length;
    const topics = {};
    topicBreakdown(questions, answers).forEach(function (row) {
      topics[row.tag] = { correct: row.correct, total: row.total };
    });
    const previous = lastAttempt(spec.subjectId, spec.key);
    const attempt = {
      id: newAttemptId(),
      kind: spec.kind || "practice",
      subjectId: spec.subjectId,
      subjectTitle: spec.subjectTitle || "",
      paperKey: spec.key,
      label: spec.label || "Practice set",
      startedAt: Number(spec.startedAt) || Date.now(),
      finishedAt: new Date().toISOString(),
      seconds: Math.max(0, Math.round(Number(spec.seconds) || 0)),
      score: score,
      total: questions.length,
      delta: previous && previous.total === questions.length ? score - previous.score : null,
      deltaBase: previous ? previous.id : null,
      flags: (spec.flags || []).filter(function (id) { return spec.questions.indexOf(id) >= 0; }),
      questions: questions.map(function (question) { return question.id; }),
      answers: encodeAnswers(questions, answers),
      topics: topics
    };
    progress.attempts = [attempt].concat(progress.attempts || []).slice(0, MAX_ATTEMPTS);
    progress.active = null;
    saveProgress();
    return attempt;
  }

  /* Remember the paper in flight so a refresh, a closed tab or a phone call
     does not throw the sitting away. */
  function saveActiveAttempt() {
    const source = paper || exam;
    if (!source || source.submitted) return;
    const isPaper = Boolean(paper);
    const questions = isPaper ? paper.questions : exam.questions;
    const subjectId = isPaper ? paper.subjectId : exam.subjectId;
    const entry = SUBJECT_MAP.get(subjectId);
    progress.active = {
      savedAt: Date.now(),
      kind: isPaper ? paper.kind || "practice" : exam.paperKey ? "mock" : "exam",
      subjectId: subjectId,
      subjectTitle: entry ? entry.subject.title : "",
      key: isPaper ? paper.key : exam.paperKey || "exam",
      label: isPaper ? paper.label : exam.paperLabel || "Timed exam",
      questions: questions.map(function (question) { return question.id; }),
      answers: encodeAnswers(questions, isPaper ? paper.answers : exam.answers),
      flags: (isPaper ? paper.flags : exam.flags) || [],
      index: isPaper ? paper.index : 0,
      startedAt: isPaper ? paper.startedAt : exam.startedAt || Date.now(),
      endsAt: isPaper ? null : exam.endsAt,
      totalSeconds: isPaper ? null : exam.totalSeconds
    };
    saveProgress();
  }

  function activeAttemptFor(subjectId) {
    const active = progress.active;
    if (!active || !subjectId || active.subjectId !== subjectId) return null;
    return active;
  }

  function resumeActiveAttempt() {
    resumeSitting(progress.active);
  }

  function resumeSitting(active) {
    if (!usableSitting(active)) return;
    const entry = SUBJECT_MAP.get(active.subjectId);
    const questions = entry ? questionObjectsFor(active.questions, active.subjectId) : [];
    if (!entry || !questions.length) {
      progress.active = null;
      saveProgress();
      toast("That sitting can no longer be rebuilt.", "is-warn");
      paint();
      return;
    }
    stopExamTimer();
    exam = null;
    paper = null;
    state.attemptId = null;
    getFilters(active.subjectId).mode = "papers";
    const answers = decodeAnswers(active);

    if (active.kind === "practice" || active.kind === "retry") {
      paper = {
        subjectId: active.subjectId,
        key: active.key,
        kind: active.kind,
        label: active.label,
        questions: questions,
        index: Math.min(Number(active.index) || 0, questions.length - 1),
        answers: answers,
        flags: active.flags || [],
        reviewing: false,
        submitted: false,
        startedAt: Number(active.startedAt) || Date.now()
      };
      if (state.route.name === "subject" && state.route.subjectId === active.subjectId && state.route.tab === "practice") paint();
      else go("#/subject/" + active.subjectId + "/practice");
      toast("Set resumed where you left it.");
      return;
    }

    const secondsPer = Number(entry.subject.testConfig && entry.subject.testConfig.secondsPerQuestion) || SECONDS_PER_QUESTION;
    const totalSeconds = Number(active.totalSeconds) || questions.length * secondsPer;
    exam = {
      subjectId: active.subjectId,
      questions: questions,
      answers: answers,
      flags: active.flags || [],
      submitted: false,
      score: 0,
      reviewMisses: false,
      totalSeconds: totalSeconds,
      endsAt: Number(active.endsAt) || Date.now() + totalSeconds * 1000,
      paperKey: active.kind === "mock" ? active.key : null,
      paperLabel: active.kind === "mock" ? active.label : null,
      startedAt: Number(active.startedAt) || Date.now()
    };
    if (state.route.name === "subject" && state.route.subjectId === active.subjectId && state.route.tab === "practice") paint();
    else go("#/subject/" + active.subjectId + "/practice");
    if (remainingSeconds() <= 0) {
      gradeExam(true);
      return;
    }
    startExamTimer();
    toast("Paper resumed — the clock is still running.");
  }

  function resumePausedSitting(index) {
    const paused = Array.isArray(progress.paused) ? progress.paused : [];
    const sitting = paused[index];
    if (!usableSitting(sitting)) {
      progress.paused = paused.filter(function (item, position) { return position !== index; });
      saveProgress();
      paint();
      return;
    }
    const rest = paused.filter(function (item, position) { return position !== index; });
    if (usableSitting(progress.active)) rest.unshift(progress.active);
    progress.active = sitting;
    progress.paused = rest.slice(0, MAX_PAUSED);
    saveProgress();
    resumeSitting(sitting);
  }

  function discardPausedSitting(index) {
    const paused = Array.isArray(progress.paused) ? progress.paused : [];
    if (!paused[index]) return;
    progress.paused = paused.filter(function (item, position) { return position !== index; });
    saveProgress();
    paint();
    toast("Paused sitting discarded.", "is-warn");
  }

  function pausedResumeHTML() {
    const paused = Array.isArray(progress.paused) ? progress.paused : [];
    if (!paused.length) return "";
    return paused.map(function (sitting, index) {
      const entry = SUBJECT_MAP.get(sitting.subjectId);
      if (!entry) return "";
      const total = (sitting.questions || []).length;
      const answered = Object.keys(decodeAnswers(sitting)).length;
      return (
        '<div class="resume-strip card is-paused">' +
        '<div class="resume-copy"><span class="resume-kicker">Paused on another device</span>' +
        "<strong>" + esc(entry.subject.title) + " · " + esc(sitting.label) + "</strong>" +
        '<small>' + answered + " of " + total + " answered · saved " + esc(attemptWhen(new Date(Number(sitting.savedAt) || Date.now()).toISOString())) + "</small></div>" +
        '<div class="resume-actions">' +
        '<button type="button" class="btn btn-ghost btn-sm" data-action="resume-paused" data-index="' + index + '"><i data-lucide="play"></i>Resume</button>' +
        '<button type="button" class="btn btn-ghost btn-sm" data-action="discard-paused" data-index="' + index + '"><i data-lucide="x"></i>Discard</button>' +
        "</div></div>"
      );
    }).join("");
  }

  function activeResumeHTML() {
    const active = progress.active;
    if (!active) return "";
    const entry = SUBJECT_MAP.get(active.subjectId);
    if (!entry) return "";
    const total = (active.questions || []).length;
    const answered = Object.keys(decodeAnswers(active)).length;
    return (
      '<div class="resume-strip card">' +
      '<div class="resume-copy"><span class="resume-kicker">Unfinished sitting</span>' +
      "<strong>" + esc(entry.subject.title) + " · " + esc(active.label) + "</strong>" +
      '<small>' + answered + " of " + total + " answered" + (active.kind === "mock" ? " · timed" : " · untimed") + "</small></div>" +
      '<div class="resume-actions">' +
      '<button type="button" class="btn btn-primary btn-sm" data-action="resume-attempt"><i data-lucide="play"></i>Resume</button>' +
      '<button type="button" class="btn btn-ghost btn-sm" data-action="discard-attempt"><i data-lucide="x"></i>Discard</button>' +
      "</div></div>"
    );
  }

  function deltaHTML(attempt) {
    if (!attempt || !attempt.deltaBase) return '<span class="attempt-delta is-first">first sit</span>';
    const delta = attempt.delta;
    if (delta === null || delta === undefined || !Number.isFinite(Number(delta))) {
      return '<span class="attempt-delta" title="A different number of questions, so scores are not comparable">—</span>';
    }
    if (Number(delta) === 0) return '<span class="attempt-delta">level</span>';
    const up = Number(delta) > 0;
    return '<span class="attempt-delta ' + (up ? "is-up" : "is-down") + '">' + (up ? "+" : "") + delta + "</span>";
  }

  function attemptRowHTML(attempt, showSubject) {
    const pct = attempt.total ? Math.round((attempt.score / attempt.total) * 100) : 0;
    return (
      '<div class="attempt-row">' +
      '<span class="attempt-date mono">' + esc(attemptWhen(attempt.finishedAt)) + '</span>' +
      '<span class="attempt-label"><strong>' + esc(attempt.label) + "</strong>" +
      '<small>' + (showSubject && attempt.subjectTitle ? esc(attempt.subjectTitle) + " · " : "") + esc(attemptKindLabel(attempt.kind)) + "</small></span>" +
      '<span class="attempt-score mono">' + attempt.score + "<small>/" + attempt.total + "</small></span>" +
      '<span class="attempt-pct mono">' + pct + "%</span>" +
      deltaHTML(attempt) +
      '<button type="button" class="btn btn-ghost btn-sm" data-action="open-attempt" data-attempt="' + esc(attempt.id) + '"><i data-lucide="list-checks"></i>Review</button>' +
      "</div>"
    );
  }

  function attemptHistoryHTML(subjectId) {
    const all = subjectAttempts(subjectId);
    if (!all.length) return "";
    return (
      '<div class="card attempt-history">' +
      '<div class="attempt-history-head"><div><span class="eyebrow">Paper history</span><h3>Every sitting is kept</h3></div>' +
      '<span class="attempt-history-count mono">' + all.length + " " + plural(all.length, "sitting", "sittings") + "</span></div>" +
      '<div class="attempt-table">' + all.slice(0, 8).map(function (attempt) {
        return attemptRowHTML(attempt, false);
      }).join("") + "</div>" +
      (all.length > 8 ? '<p class="attempt-history-more">Showing the latest 8. Older sittings stay in your record.</p>' : "") +
      "</div>"
    );
  }

  function recentAttemptsHTML() {
    const attempts = (progress.attempts || []).slice(0, 5);
    if (!attempts.length) {
      return (
        '<div class="card attempt-history attempt-history-empty">' +
        '<div class="attempt-history-head"><div><span class="eyebrow">Paper history</span><h3>No papers sat yet</h3></div></div>' +
        '<p class="paper-copy">Open any subject, choose <strong>Test papers</strong>, and sit a practice set or a timed mock. The score, the topic breakdown and every answer are saved here.</p>' +
        "</div>"
      );
    }
    return (
      '<div class="card attempt-history">' +
      '<div class="attempt-history-head"><div><span class="eyebrow">Paper history</span><h3>Recent sittings</h3></div>' +
      '<span class="attempt-history-count mono">' + (progress.attempts || []).length + " saved</span></div>" +
      '<div class="attempt-table">' + attempts.map(function (attempt) {
        return attemptRowHTML(attempt, true);
      }).join("") + "</div></div>"
    );
  }

  function topicMasteryRows(subjectId) {
    const bucket = progress.topicStats[subjectId] || {};
    return Object.keys(bucket).map(function (tag) {
      const row = bucket[tag] || {};
      const total = Number(row.total) || 0;
      const correct = Number(row.correct) || 0;
      return {
        subjectId: subjectId,
        tag: tag,
        correct: correct,
        total: total,
        pct: total ? Math.round((correct / total) * 100) : 0
      };
    }).filter(function (row) { return row.total >= 2; });
  }

  function weakestTopics(limit, subjectId) {
    const rows = [];
    const subjectIds = subjectId ? [subjectId] : Object.keys(progress.topicStats || {});
    subjectIds.forEach(function (id) {
      const entry = SUBJECT_MAP.get(id);
      if (!entry) return;
      topicMasteryRows(id).forEach(function (row) {
        row.subjectTitle = entry.subject.title;
        rows.push(row);
      });
    });
    return rows
      .sort(function (a, b) { return a.pct - b.pct || b.total - a.total; })
      .slice(0, limit || 4);
  }

  function masteryPanelHTML(limit, subjectId) {
    const rows = weakestTopics(limit || 4, subjectId);
    if (!rows.length) return "";
    return (
      '<div class="card mastery-panel">' +
      '<div class="attempt-history-head"><div><span class="eyebrow">Topic mastery</span><h3>Where the next points are</h3></div>' +
      '<span class="attempt-history-count mono">' + rows.length + " weak " + plural(rows.length, "topic", "topics") + "</span></div>" +
      '<div class="mastery-rows">' + rows.map(function (row) {
        return (
          '<div class="mastery-row">' +
          '<span class="mastery-topic"><strong>' + esc(row.tag) + "</strong><small>" + esc(row.subjectTitle) + "</small></span>" +
          '<span class="progress mastery-bar"><span class="progress-bar" style="width:' + row.pct + '%"></span></span>' +
          '<span class="mastery-pct mono">' + row.correct + "/" + row.total + "</span>" +
          '<button type="button" class="btn btn-ghost btn-sm" data-action="practice-topic" data-subject="' + esc(row.subjectId) + '" data-topic="' + esc(row.tag) + '"><i data-lucide="target"></i>Drill</button>' +
          "</div>"
        );
      }).join("") + "</div></div>"
    );
  }

  function finishPaper() {
    if (!paper || paper.submitted) return;
    paper.submitted = true;
    paper.reviewing = false;
    const entry = SUBJECT_MAP.get(paper.subjectId);
    const attempt = archiveAttempt({
      kind: paper.kind || "practice",
      subjectId: paper.subjectId,
      subjectTitle: entry ? entry.subject.title : "",
      key: paper.key,
      label: paper.label,
      questions: paper.questions,
      answers: paper.answers,
      flags: paper.flags,
      startedAt: paper.startedAt,
      seconds: (Date.now() - paper.startedAt) / 1000
    });
    paper.attemptId = attempt.id;
    paint();
    toast("Saved: " + attempt.score + "/" + attempt.total + " · " + paper.label, attempt.score / (attempt.total || 1) >= 0.7 ? "" : "is-warn");
  }

  function sitAgain(attempt) {
    if (!attempt) return;
    state.attemptId = null;
    state.attemptFilter = "all";
    if (attempt.kind === "mock") {
      startMockPaper(attempt.subjectId, attempt.paperKey);
      return;
    }
    if (attempt.kind === "exam") {
      startExam(attempt.subjectId);
      return;
    }
    startPracticePaper(attempt.subjectId, attempt.paperKey);
  }

  function startMissesRetake(subjectId, questions) {
    if (!questions.length) {
      toast("No misses to retake — clean paper.", "");
      return;
    }
    stopExamTimer();
    exam = null;
    state.attemptId = null;
    getFilters(subjectId).mode = "papers";
    paper = {
      subjectId: subjectId,
      key: "misses",
      kind: "retry",
      label: "Misses retake (" + questions.length + ")",
      questions: questions,
      index: 0,
      answers: {},
      flags: [],
      reviewing: false,
      submitted: false,
      startedAt: Date.now()
    };
    saveActiveAttempt();
    paint();
  }

  function attemptMisses(attempt) {
    const answers = decodeAnswers(attempt);
    return questionObjectsFor(attempt.questions, attempt.subjectId).filter(function (question) {
      return answers[question.id] !== question.answer;
    });
  }

  function attemptReviewHTML(attempt) {
    const questions = questionObjectsFor(attempt.questions, attempt.subjectId);
    const answers = decodeAnswers(attempt);
    const misses = questions.filter(function (question) { return answers[question.id] !== question.answer; });
    const filter = state.attemptFilter === "misses" ? "misses" : "all";
    const shown = filter === "misses" ? misses : questions;
    const rows = topicBreakdown(questions, answers);
    const pct = attempt.total ? Math.round((attempt.score / attempt.total) * 100) : 0;

    const list = shown.map(function (question) {
      const picked = answers[question.id];
      const correct = picked === question.answer;
      const number = attempt.questions.indexOf(question.id) + 1;
      const pickedText = picked === undefined
        ? "Left blank"
        : String.fromCharCode(65 + picked) + " · " + question.options[picked];
      const correctText = String.fromCharCode(65 + question.answer) + " · " + question.options[question.answer];
      const steps = Array.isArray(question.explanation) ? question.explanation : [];
      return (
        '<article class="attempt-q ' + (correct ? "is-correct" : "is-wrong") + '">' +
        '<div class="attempt-q-head"><span class="attempt-q-num mono">' + String(number).padStart(2, "0") + '</span>' +
        '<span class="badge ' + badgeClass(question.difficulty) + '">' + esc(question.difficulty) + "</span>" +
        codeChipHTML(question) +
        '<span class="attempt-q-topic">' + esc((question.tags && question.tags[0]) || "General") + "</span>" +
        '<span class="attempt-q-mark ' + (correct ? "is-correct" : "is-wrong") + '">' + (correct ? "Correct" : "Missed") + "</span></div>" +
        '<p class="attempt-q-prompt">' + esc(question.prompt) + "</p>" +
        questionSourceHTML(question) +
        '<div class="attempt-q-rows">' +
        '<div class="attempt-q-row"><span>Your answer</span><strong class="' + (correct ? "is-correct" : "is-wrong") + '">' + esc(pickedText) + "</strong></div>" +
        (correct ? "" : '<div class="attempt-q-row"><span>Correct</span><strong class="is-correct">' + esc(correctText) + "</strong></div>") +
        "</div>" +
        (steps.length
          ? '<details class="attempt-q-steps"><summary>Steps</summary><ol class="steps">' + steps.map(function (step) {
              return '<li class="step"><span class="step-body">' + esc(step) + "</span></li>";
            }).join("") + "</ol></details>"
          : "") +
        "</article>"
      );
    }).join("");

    return (
      '<div class="attempt-review">' +
      '<div class="card attempt-review-head">' +
      '<div class="attempt-review-copy"><span class="eyebrow">Saved attempt · ' + esc(attemptWhen(attempt.finishedAt)) + '</span>' +
      "<h2>" + esc(attempt.label) + "</h2>" +
      "<p>" + esc(attempt.subjectTitle || "") + " · " + esc(attemptKindLabel(attempt.kind)) + " · " +
      formatTime(attempt.seconds) + " on the clock · " + pct + "% accuracy</p></div>" +
      '<div class="attempt-review-score">' + attempt.score + "<small>/" + attempt.total + "</small></div>" +
      "</div>" +
      '<div class="card exam-report"><div class="exam-report-head"><div><span class="eyebrow">Score report</span><h3>Mastery by topic</h3></div>' +
      '<strong class="mono">' + attempt.score + "/" + attempt.total + "</strong></div>" +
      reportRowsHTML(rows) + weakestTopicHTML(rows, attempt.subjectId) + "</div>" +
      '<div class="toolbar card attempt-toolbar">' +
      '<div class="review-filters" role="group" aria-label="Filter answers">' +
      '<span class="filter-label">Show</span>' +
      '<button type="button" class="chip ' + (filter === "all" ? "active" : "") + '" data-action="attempt-filter" data-value="all">All ' + questions.length + "</button>" +
      '<button type="button" class="chip ' + (filter === "misses" ? "active" : "") + '" data-action="attempt-filter" data-value="misses">Misses ' + misses.length + "</button>" +
      "</div>" +
      '<div class="review-actions">' +
      '<button type="button" class="btn btn-teal btn-sm" data-action="retake-misses" data-attempt="' + esc(attempt.id) + '"><i data-lucide="target"></i>Retake ' + misses.length + " " + plural(misses.length, "miss", "misses") + "</button>" +
      '<button type="button" class="btn btn-ghost btn-sm" data-action="retake-attempt" data-attempt="' + esc(attempt.id) + '"><i data-lucide="rotate-ccw"></i>Sit again</button>' +
      '<button type="button" class="btn btn-ghost btn-sm" data-action="attempt-back" data-subject="' + esc(attempt.subjectId) + '"><i data-lucide="arrow-left"></i>All papers</button>' +
      "</div></div>" +
      '<div class="attempt-list">' + (shown.length ? list : emptyState("check-check", "No misses on this one", "Every question was correct, so there is nothing to review.", "")) + "</div>" +
      "</div>"
    );
  }

  function paperSeed(value) {
    let hash = 2166136261;
    String(value).split("").forEach(function (character) {
      hash ^= character.charCodeAt(0);
      hash = Math.imul(hash, 16777619);
    });
    return hash >>> 0;
  }

  function paperQuestions(subject, kind, key) {
    const offset = kind === "practice" ? key.charCodeAt(0) - 65 : Number(key) || 0;
    const pool = subject.questions.map(function (question) {
      return { question: question, rank: (paperSeed(question.id) + offset * 2654435761) >>> 0 };
    });
    pool.sort(function (a, b) { return a.rank - b.rank; });
    const limit = kind === "practice"
      ? 20
      : Math.min(25, Number(subject.testConfig && subject.testConfig.questions) || 25);
    return pool.slice(0, limit).map(function (item) { return item.question; });
  }

  function papersTabHTML(entry) {
    const subject = entry.subject;
    if (state.attemptId) {
      const saved = attemptById(state.attemptId);
      if (saved && saved.subjectId === subject.id) return attemptReviewHTML(saved);
      state.attemptId = null;
    }
    const total = subject.questions.length;
    if (!total) {
      return emptyState("filter", "No questions to build papers from", "This bank is empty at the moment.", "");
    }
    const practiceCount = Math.min(20, total);
    const mockCount = Math.min(25, Number(subject.testConfig && subject.testConfig.questions) || 25, total);
    const secondsPer = Number(subject.testConfig && subject.testConfig.secondsPerQuestion) || SECONDS_PER_QUESTION;
    const mockMinutes = Math.max(1, Math.ceil((mockCount * secondsPer) / 60));

    function card(kind, key, title, copy, meta) {
      const best = bestAttempt(subject.id, key);
      const active = activeAttemptFor(subject.id);
      const resumable = active && active.key === key && ((kind === "practice" && active.kind !== "mock" && active.kind !== "exam") || (kind === "mock" && active.kind === "mock"));
      return (
        '<article class="paper-card card">' +
        '<div class="paper-card-head"><span class="paper-kicker">' + (kind === "practice" ? "Practice set" : "Mock paper") + '</span>' +
        '<span class="badge ' + (kind === "practice" ? "badge-beginner" : "badge-advanced") + '">' + esc(key) + '</span></div>' +
        "<h3>" + esc(title) + "</h3>" +
        '<p class="paper-copy">' + esc(copy) + "</p>" +
        '<div class="paper-meta"><span><i data-lucide="list-checks"></i>' + meta.count + ' questions</span>' +
        '<span><i data-lucide="' + (kind === "practice" ? "zap" : "timer") + '"></i>' + esc(meta.time) + "</span>" +
        (best ? '<span class="paper-best"><i data-lucide="award"></i>Best ' + best.score + "/" + best.total + "</span>" : "") + "</div>" +
        '<button type="button" class="btn ' + (resumable ? "btn-primary" : kind === "practice" ? "btn-primary" : "btn-teal") + ' btn-sm" data-action="' +
        (resumable ? "resume-attempt" : kind === "practice" ? "start-practice-paper" : "start-mock-paper") + '" data-subject="' + esc(subject.id) + '" data-paper="' + esc(key) + '">' +
        (resumable ? "Resume" : kind === "practice" ? (best ? "Sit again" : "Start set") : best ? "Sit again" : "Sit paper") + '<i data-lucide="arrow-right"></i></button></article>'
      );
    }

    const practiceCards = ["A", "B", "C"].map(function (key) {
      return card("practice", key, "Practice Set " + key, "A fixed mixed-difficulty set with instant feedback, hints and step-by-step explanations.", {
        count: practiceCount, time: "Untimed"
      });
    }).join("");

    const mockCards = ["1", "2", "3"].map(function (key) {
      return card("mock", key, "Mock Paper " + key, "Exam conditions: no feedback, a question navigator and a review screen before submission.", {
        count: mockCount, time: mockMinutes + " min"
      });
    }).join("");

    return (
      activeResumeHTML() +
      '<div class="card papers-intro">' +
      '<div class="exam-intro-head"><span class="subject-icon accent-amber"><i data-lucide="file-stack"></i></span>' +
      '<div><h2>Test papers</h2><p>Six fixed papers per subject — three practice sets and three timed mocks. Each paper draws the same questions every time, so retakes measure progress rather than luck.</p></div></div>' +
      '<ul class="settings-list">' +
      "<li><strong>Practice sets</strong> grade instantly and unlock explanations.</li>" +
      "<li><strong>Mock papers</strong> run on a deadline with flags, a navigator and a review screen.</li>" +
      "<li>Every sitting is saved with its score, answers and topic report — leave and resume any time.</li>" +
      "<li>Every answer feeds XP, accuracy, topic mastery and your streak.</li>" +
      "</ul></div>" +
      '<h3 class="paper-group-title">Practice sets</h3>' +
      '<div class="paper-grid">' + practiceCards + "</div>" +
      '<h3 class="paper-group-title">Mock exam papers</h3>' +
      '<div class="paper-grid">' + mockCards + "</div>" +
      attemptHistoryHTML(subject.id) +
      masteryPanelHTML(4, subject.id)
    );
  }

  function startPracticePaper(subjectId, key) {
    const entry = SUBJECT_MAP.get(subjectId);
    if (!entry || !key) return;
    const questions = paperQuestions(entry.subject, "practice", key);
    if (!questions.length) {
      toast("This bank has no questions yet.", "is-warn");
      return;
    }
    if (progress.active && !window.confirm("Discard the unfinished sitting in this profile and start a new one?")) return;
    stopExamTimer();
    exam = null;
    focusQid = null;
    state.attemptId = null;
    getFilters(subjectId).mode = "papers";
    paper = {
      subjectId: subjectId,
      key: key,
      kind: "practice",
      label: "Practice Set " + key,
      questions: questions,
      index: 0,
      answers: {},
      flags: [],
      reviewing: false,
      submitted: false,
      startedAt: Date.now()
    };
    saveActiveAttempt();
    paint();
  }

  function startMockPaper(subjectId, key) {
    const entry = SUBJECT_MAP.get(subjectId);
    if (!entry || !key) return;
    const questions = paperQuestions(entry.subject, "mock", key);
    if (!questions.length) {
      toast("This bank has no questions yet.", "is-warn");
      return;
    }
    if (progress.active && !window.confirm("Discard the unfinished sitting in this profile and start a new paper?")) return;
    stopExamTimer();
    paper = null;
    const secondsPer = Number(entry.subject.testConfig && entry.subject.testConfig.secondsPerQuestion) || SECONDS_PER_QUESTION;
    const totalSeconds = questions.length * secondsPer;
    exam = {
      subjectId: subjectId,
      questions: questions,
      answers: {}, flags: [],
      submitted: false,
      score: 0,
      reviewMisses: false,
      totalSeconds: totalSeconds,
      endsAt: Date.now() + totalSeconds * 1000,
      paperKey: key,
      paperLabel: "Mock Paper " + key,
      startedAt: Date.now()
    };
    getFilters(subjectId).mode = "papers";
    focusQid = null;
    state.attemptId = null;
    saveActiveAttempt();
    paint();
    startExamTimer();
  }

  function paperRunnerHTML(entry) {
    const subject = entry.subject;
    const total = paper.questions.length;
    const answeredCount = Object.keys(paper.answers).length;

    if (paper.submitted) {
      const score = paper.questions.filter(function (question) {
        return paper.answers[question.id] === question.answer;
      }).length;
      const accuracy = total ? Math.round((score / total) * 100) : 0;
      const previous = lastAttempt(paper.subjectId, paper.key, paper.attemptId);
      const misses = paper.questions.filter(function (question) {
        return paper.answers[question.id] !== question.answer;
      }).length;
      return (
        '<div class="card paper-summary">' +
        '<span class="eyebrow">' + esc(paper.label) + " · saved to history</span>" +
        '<div class="paper-score">' + score + "<small>/" + total + "</small></div>" +
        '<p class="paper-summary-copy">' + accuracy + "% accuracy · " + formatTime((Date.now() - paper.startedAt) / 1000) + " on the clock." +
        (previous ? " " + (score - previous.score >= 0 ? "+" : "") + (score - previous.score) + " vs your previous sit." : "") + "</p>" +
        '<div class="exam-actions paper-summary-actions">' +
        '<button type="button" class="btn btn-teal" data-action="review-current-paper"><i data-lucide="list-checks"></i>Review answers</button>' +
        (misses ? '<button type="button" class="btn btn-ghost" data-action="retake-current-misses"><i data-lucide="target"></i>Retake ' + misses + " " + plural(misses, "miss", "misses") + "</button>" : "") +
        '<button type="button" class="btn btn-ghost" data-action="paper-retry" data-subject="' + esc(subject.id) + '"><i data-lucide="rotate-ccw"></i>Retake set</button>' +
        '<button type="button" class="btn btn-ghost" data-action="paper-new" data-subject="' + esc(subject.id) + '"><i data-lucide="file-stack"></i>All papers</button>' +
        "</div>" +
        '<h3 class="paper-group-title">Mastery by topic</h3>' +
        reportRowsHTML(topicBreakdown(paper.questions, paper.answers)) +
        weakestTopicHTML(topicBreakdown(paper.questions, paper.answers), subject.id) +
        "</div>"
      );
    }

    const question = paper.questions[paper.index];
    const selected = paper.answers[question.id];
    const answered = selected !== undefined;
    const correct = answered && selected === question.answer;
    const starred = progress.bookmarks.indexOf(question.id) >= 0;
    const steps = Array.isArray(question.explanation) ? question.explanation : [];

    const options = question.options.map(function (option, index) {
      let className = "option";
      let icon = "";
      if (answered) {
        if (index === question.answer) {
          className += " is-correct";
          icon = '<i data-lucide="check" class="option-icon"></i>';
        } else if (index === selected) {
          className += " is-wrong";
          icon = '<i data-lucide="x" class="option-icon"></i>';
        } else {
          className += " is-dim";
        }
      }
      return (
        '<button type="button" class="' + className + '" data-action="paper-answer" data-qid="' + esc(question.id) + '" data-index="' + index + '"' +
        (answered ? " disabled" : "") + ">" +
        '<span class="option-key">' + String.fromCharCode(65 + index) + "</span>" +
        '<span class="option-text">' + esc(option) + "</span>" + icon + "</button>"
      );
    }).join("");

    const flagged = paper.flags.indexOf(question.id) >= 0;

    if (paper.reviewing) return paperReviewScreenHTML();

    return (
      '<p class="sr-only" id="paper-live" role="status" aria-live="polite"></p>' +
      '<div class="card paper-runner-head">' +
      '<div><span class="badge badge-intermediate">' + esc(paper.label) + '</span>' +
      "<h2>Question " + (paper.index + 1) + " of " + total + "</h2></div>" +
      '<div class="paper-run-meta"><span class="mono">' + answeredCount + "/" + total + " answered</span>" +
      (paper.flags.length ? '<span class="mono paper-flag-count">' + paper.flags.length + " marked</span>" : "") +
      '<button type="button" class="btn btn-ghost btn-sm" data-action="paper-new" data-subject="' + esc(subject.id) + '"><i data-lucide="x"></i>Exit</button></div>' +
      '<div class="progress paper-progress"><div class="progress-bar" style="width:' + Math.round(((paper.index + (answered ? 1 : 0)) / total) * 100) + '%"></div></div></div>' +
      paperNavigatorHTML() +

      '<article class="question-card card paper-question" tabindex="-1" aria-label="Question ' + (paper.index + 1) + ' of ' + total + '">' +
      '<div class="q-head"><div class="q-badges"><span class="badge ' + badgeClass(question.difficulty) + '">' + esc(question.difficulty) + "</span>" +
      codeChipHTML(question) +
      (question.tags || []).slice(0, 2).map(function (tag) { return '<span class="tag">' + esc(tag) + "</span>"; }).join("") +
      '</div><div class="q-head-tools"><button type="button" class="flag-btn ' + (flagged ? "is-flagged" : "") + '" data-action="paper-flag" data-qid="' + esc(question.id) + '" aria-pressed="' + flagged + '" aria-label="Mark for review"><i data-lucide="flag"></i>' + (flagged ? "Marked" : "Mark") + '</button>' +
      '<button type="button" class="icon-btn star-btn ' + (starred ? "is-starred" : "") + '" data-action="bookmark" data-qid="' + esc(question.id) + '" aria-label="Bookmark for review"><i data-lucide="star"></i></button></div></div>' +
      '<div class="q-prompt">' + esc(question.prompt) + "</div>" +
      questionSourceHTML(question) +
      '<div class="q-options">' + options + "</div>" +
      '<details class="paper-hint"><summary>Need a hint?</summary><p>' + esc(question.hint) + "</p></details>" +
      (answered
        ? '<div class="explanation"><div class="explanation-head"><i data-lucide="route"></i>' +
          (correct ? "Correct — here is the reasoning" : "Not quite — trace the steps") + "</div><ol class=\"steps\">" +
          steps.map(function (step) { return '<li class="step"><span class="step-body">' + esc(step) + "</span></li>"; }).join("") + "</ol></div>"
        : "") +
      '<div class="exam-actions paper-actions">' +
      '<button type="button" class="btn btn-ghost" data-action="paper-prev"' + (paper.index === 0 ? " disabled" : "") + '><i data-lucide="arrow-left"></i>Previous</button>' +
      '<button type="button" class="btn btn-ghost" data-action="paper-review-open"><i data-lucide="clipboard-check"></i>Review</button>' +
      (answered
        ? '<button type="button" class="btn btn-primary" data-action="paper-next">' + (paper.index + 1 >= total ? "Finish set" : "Next question") + '<i data-lucide="arrow-right"></i></button>'
        : '<button type="button" class="btn btn-ghost" data-action="paper-finish"><i data-lucide="check-check"></i>Finish set</button>') +
      "</div></article>"
    );
  }

  function paperNavigatorHTML() {
    if (!paper) return "";
    return (
      '<div class="card q-nav-card">' +
      '<div class="q-nav-head"><span class="eyebrow">Question navigator</span>' +
      '<span class="q-nav-legend"><span class="q-nav-key is-answered"></span>Answered' +
      '<span class="q-nav-key is-flagged"></span>Marked</span></div>' +
      '<div class="q-nav" role="group" aria-label="Jump to a question">' + paper.questions.map(function (question, index) {
        const done = paper.answers[question.id] !== undefined;
        const marked = paper.flags.indexOf(question.id) >= 0;
        return '<button type="button" class="q-nav-btn' + (done ? " is-answered" : "") + (marked ? " is-flagged" : "") + (index === paper.index ? " is-current" : "") + '" data-action="paper-goto" data-index="' + index + '"' + (index === paper.index ? ' aria-current="true"' : "") + ' aria-label="Question ' + (index + 1) + (done ? ", answered" : ", blank") + (marked ? ", marked" : "") + '">' + (index + 1) + "</button>";
      }).join("") + "</div></div>"
    );
  }

  function paperReviewScreenHTML() {
    const total = paper.questions.length;
    const answered = Object.keys(paper.answers).length;
    const blank = total - answered;
    const rows = paper.questions.map(function (question, index) {
      const done = paper.answers[question.id] !== undefined;
      const marked = paper.flags.indexOf(question.id) >= 0;
      return (
        '<button type="button" class="paper-review-row' + (done ? " is-answered" : " is-blank") + (marked ? " is-flagged" : "") + '" data-action="paper-goto" data-index="' + index + '">' +
        '<span class="mono">' + (index + 1) + "</span>" +
        "<span>" + (done ? "Answered" : "Blank") + (marked ? " · marked for review" : "") + "</span>" +
        '<span class="mono">' + (done ? "ABCD".charAt(paper.answers[question.id]) : "—") + "</span></button>"
      );
    }).join("");
    return (
      '<div class="card paper-review">' +
      '<div class="exam-intro-head"><span class="subject-icon accent-amber"><i data-lucide="clipboard-check"></i></span>' +
      "<div><h2>Review before you finish</h2><p>" + answered + " of " + total + " answered · " + blank + " blank · " + paper.flags.length + " marked. Nothing is graded until you finish.</p></div></div>" +
      '<div class="paper-review-list">' + rows + "</div>" +
      '<div class="exam-actions">' +
      '<button type="button" class="btn btn-ghost" data-action="paper-review-close"><i data-lucide="arrow-left"></i>Back to questions</button>' +
      '<button type="button" class="btn btn-primary" data-action="paper-submit"><i data-lucide="check-check"></i>Finish and grade</button>' +
      "</div></div>"
    );
  }

  function topicBreakdown(questions, answers) {
    const rows = new Map();
    questions.forEach(function (question) {
      const tag = (question.tags && question.tags[0]) || "General";
      const row = rows.get(tag) || { tag: tag, correct: 0, total: 0 };
      row.total += 1;
      if (answers[question.id] === question.answer) row.correct += 1;
      rows.set(tag, row);
    });
    return Array.from(rows.values()).sort(function (a, b) {
      return a.correct / a.total - b.correct / b.total || a.tag.localeCompare(b.tag);
    });
  }

  function reportRowsHTML(rows) {
    if (!rows.length) return "";
    return '<div class="report-rows">' + rows.map(function (row) {
      const pct = row.total ? Math.round((row.correct / row.total) * 100) : 0;
      return '<div class="report-row"><span class="report-topic">' + esc(row.tag) + "</span>" +
        '<span class="report-count mono">' + row.correct + "/" + row.total + "</span>" +
        '<span class="progress report-bar"><span class="progress-bar" style="width:' + pct + '%"></span></span>' +
        '<span class="report-pct mono">' + pct + "%</span></div>";
    }).join("") + "</div>";
  }

  function weakestTopicHTML(rows, subjectId) {
    if (!rows.length) return "";
    const weakest = rows[0];
    const perfect = rows.every(function (row) { return row.correct === row.total; });
    return (
      '<div class="report-weakest">' +
      '<div><span>Weakest topic</span><strong>' + esc(weakest.tag) + "</strong></div>" +
      (perfect
        ? '<span class="badge badge-beginner"><i data-lucide="check"></i>No weak spots</span>'
        : '<button type="button" class="btn btn-teal btn-sm" data-action="practice-topic" data-subject="' + esc(subjectId) + '" data-topic="' + esc(weakest.tag) + '"><i data-lucide="target"></i>Practise this topic</button>') +
      "</div>"
    );
  }

  function examReportHTML(activeExam) {
    const rows = topicBreakdown(activeExam.questions, activeExam.answers);
    const total = activeExam.questions.length;
    return (
      '<div class="card exam-report">' +
      '<div class="exam-report-head"><div><span class="eyebrow">Score report</span><h3>Mastery by topic</h3></div>' +
      '<strong class="mono">' + activeExam.score + "/" + total + "</strong></div>" +
      reportRowsHTML(rows) +
      weakestTopicHTML(rows, activeExam.subjectId) +
      "</div>"
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
      vocabularyCallout(subject) +
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

  /* --------------------------------------------------------------------------
     Written answers — FRQ prompts with a self-graded rubric
     -------------------------------------------------------------------------- */

  function frqRecord(subjectId, promptId) {
    const bucket = progress.frq[subjectId] || {};
    return bucket[promptId] || null;
  }

  function frqScore(record) {
    if (!record || !record.scores) return 0;
    return Object.keys(record.scores).reduce(function (sum, key) {
      return sum + (Number(record.scores[key]) || 0);
    }, 0);
  }

  function frqTotal(prompt) {
    return (prompt.criteria || []).reduce(function (sum, criterion) {
      return sum + (Number(criterion.max) || 0);
    }, 0);
  }

  function frqTabHTML(entry) {
    const subject = entry.subject;
    const prompts = subject.frq || [];
    if (state.frqId) {
      const prompt = prompts.find(function (item) { return item.id === state.frqId; });
      if (prompt) return frqPromptHTML(entry, prompt);
      state.frqId = null;
    }

    const cards = prompts.map(function (prompt) {
      const record = frqRecord(subject.id, prompt.id);
      const graded = record && record.gradedAt;
      return (
        '<article class="card frq-card">' +
        '<div class="frq-card-head"><span class="paper-kicker">Free response</span>' +
        '<span class="badge badge-advanced">' + frqTotal(prompt) + " pts</span></div>" +
        "<h3>" + esc(prompt.title) + "</h3>" +
        '<p class="frq-preview">' + esc(prompt.prompt).slice(0, 190) + "…</p>" +
        '<div class="frq-meta"><span>' + (prompt.criteria || []).length + " criteria</span>" +
        (graded
          ? '<span class="frq-last">Last self-grade ' + frqScore(record) + "/" + frqTotal(prompt) + "</span>"
          : record ? '<span class="frq-last is-draft">Draft saved</span>' : "") +
        "</div>" +
        '<button type="button" class="btn btn-primary btn-sm" data-action="open-frq" data-subject="' + esc(subject.id) + '" data-frq="' + esc(prompt.id) + '">' +
        (record && record.answer ? "Continue answer" : "Write answer") + '<i data-lucide="arrow-right"></i></button></article>'
      );
    }).join("");

    return (
      '<div class="card papers-intro">' +
      '<div class="exam-intro-head"><span class="subject-icon accent-amber"><i data-lucide="pen-line"></i></span>' +
      '<div><h2>Written answers</h2><p>Free-response prompts with the rubric shown up front. Write your answer, score it against each criterion yourself, then compare with the model answer. Drafts and grades stay with your profile.</p></div></div>' +
      '<ul class="settings-list">' +
      "<li>Write first, grade second — the model answer stays hidden until you have scored your own response.</li>" +
      "<li>Every prompt is graded out of a fixed rubric, so a retake is comparable.</li>" +
      "<li>Drafts save as you type and follow your profile, not the tab.</li>" +
      "</ul></div>" +
      '<div class="frq-grid">' + cards + "</div>"
    );
  }

  function frqPromptHTML(entry, prompt) {
    const subject = entry.subject;
    const record = frqRecord(subject.id, prompt.id);
    const graded = Boolean(record && record.gradedAt);
    const scores = (record && record.scores) || {};
    const total = frqTotal(prompt);
    const earned = frqScore(record);

    const rubric = (prompt.criteria || []).map(function (criterion) {
      const value = Number(scores[criterion.id]) || 0;
      const options = [];
      for (let mark = 0; mark <= criterion.max; mark += 1) {
        options.push('<option value="' + mark + '"' + (mark === value ? " selected" : "") + ">" + mark + " / " + criterion.max + "</option>");
      }
      return (
        '<div class="frq-criterion">' +
        '<div class="frq-criterion-head"><strong>' + esc(criterion.label) + '</strong>' +
        '<label class="frq-score-field"><span>Your score</span><select data-frq-criterion="' + esc(criterion.id) + '" data-descriptors="' + esc(JSON.stringify(criterion.descriptors || {})) + '" aria-label="Score for ' + esc(criterion.label) + '">' + options.join("") + "</select></label></div>" +
        '<p class="frq-descriptor">' + esc((criterion.descriptors && criterion.descriptors[value]) || "") + "</p>" +
        "</div>"
      );
    }).join("");

    const model = graded
      ? '<div class="card frq-model"><span class="eyebrow">Model answer</span>' +
        (prompt.model || []).map(function (paragraph) { return "<p>" + esc(paragraph) + "</p>"; }).join("") +
        '<p class="frq-guidance"><i data-lucide="compass"></i>' + esc(prompt.guidance || "") + "</p></div>"
      : '<div class="card frq-locked"><i data-lucide="lock"></i><p>The model answer unlocks after you score your own response against the rubric.</p></div>';

    return (
      '<div class="frq-prompt-view">' +
      '<button type="button" class="back-link" data-action="frq-back" data-subject="' + esc(subject.id) + '"><i data-lucide="arrow-left"></i>All written prompts</button>' +
      '<div class="card frq-head"><div><span class="eyebrow">Free response · ' + total + ' points</span>' +
      "<h2>" + esc(prompt.title) + "</h2></div>" +
      (graded ? '<span class="badge badge-beginner">Self-graded ' + earned + "/" + total + "</span>" : '<span class="badge badge-intermediate">Not graded yet</span>') + "</div>" +
      '<div class="card frq-question"><div class="q-prompt">' + esc(prompt.prompt) + "</div>" +
      '<label class="frq-answer-label" for="frq-answer">Your answer</label>' +
      '<textarea id="frq-answer" class="frq-answer" rows="9" data-frq-input data-subject="' + esc(subject.id) + '" data-frq="' + esc(prompt.id) + '" placeholder="Write the full response you would hand in. Show your reasoning step by step.">' + esc((record && record.answer) || "") + "</textarea>" +
      '<div class="frq-answer-meta"><span data-frq-status>' + (record && record.answer ? "Draft saved" : "Not started") + "</span><span data-frq-count>" + String((record && record.answer) || "").length + " characters</span></div></div>" +
      '<div class="card frq-rubric"><div class="exam-report-head"><div><span class="eyebrow">Self-grading</span><h3>Score each criterion honestly</h3></div>' +
      '<strong class="mono" data-frq-total data-frq-max="' + total + '">' + earned + "/" + total + "</strong></div>" +
      rubric +
      '<div class="exam-actions"><button type="button" class="btn btn-primary" data-action="frq-grade" data-subject="' + esc(subject.id) + '" data-frq="' + esc(prompt.id) + '"><i data-lucide="check-check"></i>' + (graded ? "Update grade" : "Save grade") + "</button>" +
      (record && record.answer ? '<button type="button" class="btn btn-ghost" data-action="frq-clear" data-subject="' + esc(subject.id) + '" data-frq="' + esc(prompt.id) + '"><i data-lucide="trash-2"></i>Clear answer</button>' : "") +
      "</div></div>" +
      model +
      "</div>"
    );
  }

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
    const correctedCount = Array.from(items.values()).filter(function (item) {
      return item.reasons.indexOf("corrected") >= 0;
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
      '<button type="button" class="chip ' + (filter === "corrected" ? "active" : "") + '" data-action="review-filter" data-value="corrected">Later corrected ' + correctedCount + "</button>" +
      "</div>" +
      '<div class="review-actions">' + actions.join("") + "</div>" +
      "</div>" +
      (missedCount || correctedCount ? masteryPanelHTML(4) : "") +
      (groups.length ? groupsHTML : empty) +
      "</div>";
  }

  /* --------------------------------------------------------------------------
     Sign in
     -------------------------------------------------------------------------- */

  function loginProfileRow(account) {
    const active = activeAccount && activeAccount.id === account.id;
    const detail = account.guest ? "Guest session" : account.email || "Device profile";
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
      (hasIdentity()
        ? ""
        : '<div class="guest-block">' +
          '<button type="button" class="account-btn" data-action="guest-signin"><i data-lucide="user-round"></i>Continue as guest</button>' +
          '<p class="account-note">Guest mode keeps progress in this browser only — no password, no sync. Create a profile or sign in whenever you want to keep it.</p>' +
          "</div>") +
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

  function sourcesPanelHTML() {
    const registry = window.QUESTIONAIRE_SOURCES || {};
    const ids = Object.keys(registry);
    if (!ids.length) return "";
    return (
      '<section class="settings-card card">' +
      "<h2>Question sources</h2>" +
      '<p>Open education banks whose scope shaped these drills. Items marked with a source are original questions aligned to that chapter or task, not copied text.</p>' +
      '<div class="source-list">' + ids.map(function (id) {
        const source = registry[id];
        return (
          '<div class="source-row">' +
          '<a href="' + esc(source.url) + '" target="_blank" rel="noopener"><strong>' + esc(source.title) + '</strong><i data-lucide="external-link"></i></a>' +
          '<span class="source-licence mono">' + esc(source.licence) + "</span>" +
          "<small>" + esc(source.note) + "</small></div>"
        );
      }).join("") + "</div></section>"
    );
  }

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
      "<li>The student-facing <code>#CODE</code> is generated from the id — never add it to the data.</li>" +
      "<li>LaTeX goes between <code>$…$</code> inline or <code>$$…$$</code> block.</li>" +
      "<li><code>answer</code> is the zero-based index of the correct option.</li>" +
      "<li>Videos use the 11-character YouTube id.</li>" +
      "</ul></section>" +

      '<section class="settings-card card">' +
      "<h2>Shortcuts &amp; storage</h2>" +
      '<div class="settings-row"><span>Focus search</span><span><kbd>/</kbd></span></div>' +
      '<div class="settings-row"><span>Close search / drawer</span><span><kbd>Esc</kbd></span></div>' +
      '<div class="settings-row"><span>Open first result</span><span><kbd>Enter</kbd></span></div>' +
      '<div class="settings-row"><span>Question code</span><span class="mono">#Q8X49P</span></div>' +
      '<p style="margin-top:10px">Clearing site data resets the record but never the study content. Theme preference is stored separately.</p>' +
      '<p style="margin-top:8px"><a class="section-link" href="https://pages.github.com/" target="_blank" rel="noopener"><i data-lucide="external-link"></i>GitHub Pages docs</a></p>' +
      "</section>" +

      sourcesPanelHTML() +
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
    /* Stamp and index every question loaded so far, including lazily sampled
       banks, so a code typed into search resolves from the first keystroke. */
    buildIdLookup(SUBJECTS.reduce(function (all, entry) {
      return all.concat(entry.subject.questions);
    }, []));
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
      packWords(subject).forEach(function (word, index) {
        entries.push({
          type: "Word",
          icon: "languages",
          subjectId: subject.id,
          tab: "words",
          wordId: subject.id + "-w-" + index,
          title: word.target + " — " + word.english,
          text: word.target + " " + word.english + " " + word.pronunciation + " " + word.theme,
          tags: [word.theme, "vocabulary"]
        });
      });
      subject.questions.forEach(function (question) {
        entries.push({
          type: "Question",
          icon: "circle-help",
          subjectId: subject.id,
          tab: "practice",
          qid: question.id,
          code: question.displayId || getDisplayId(question.id),
          title: plain(question.prompt),
          text: plain(question.prompt) + " " + question.options.map(plain).join(" ") + " " + question.tags.join(" ") + " " + plain(question.hint) + " " + (question.displayId || ""),
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
      const haystack = (entry.title + " " + entry.text + " " + (entry.code || "") + " " + entry.tags.join(" ")).toLowerCase();
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

  function codeFromQuery(raw) {
    const text = String(raw || "").trim();
    const value = text.toUpperCase().replace(/^#/, "");
    if (!/^[0-9A-Z]{6}$/.test(value)) return null;
    /* A bare six-letter word is only a code when it actually resolves; a
       leading # always means "look this code up". */
    if (!text.startsWith("#") && !ID_LOOKUP[value]) return null;
    return value;
  }

  function codeSearchEntries(code) {
    const bucket = ID_LOOKUP[code] || [];
    return bucket.map(function (question) {
      const info = QUESTION_MAP.get(question.id);
      if (!info) return null;
      return {
        type: "Question code",
        icon: "hash",
        subjectId: info.subject.id,
        tab: "practice",
        qid: question.id,
        code: question.displayId,
        title: plain(question.prompt),
        text: "",
        tags: question.tags || []
      };
    }).filter(Boolean);
  }

  function renderSearch(rawQuery) {
    const query = rawQuery.trim();
    if (!query) {
      closeSearch(false);
      return;
    }
    const code = codeFromQuery(query);
    const fromCode = code ? codeSearchEntries(code) : [];
    const results = fromCode.concat(performSearch(query).filter(function (entry) {
      return !fromCode.some(function (match) { return match.qid && match.qid === entry.qid; });
    }));
    searchResults = results;

    if (!results.length) {
      searchResultsPanel.innerHTML = code
        ? '<div class="search-empty">No question carries the code <strong>#' + esc(code) + '</strong>. Check the six characters, or search by the question text instead.</div>'
        : '<div class="search-empty">No matches for “' + esc(query) + '”. Try a tag like <strong>fractions</strong>, <strong>chain rule</strong> or <strong>ATP</strong>, or a question code like <strong>#Q8X49P</strong>.</div>';
    } else {
      searchResultsPanel.innerHTML = results.map(function (entry, index) {
        const subject = SUBJECT_MAP.get(entry.subjectId);
        return (
          '<button type="button" class="search-result" role="option" data-search-index="' + index + '">' +
          '<span class="search-result-icon"><i data-lucide="' + esc(entry.icon) + '"></i></span>' +
          '<span class="search-result-body">' +
          '<span class="search-result-title">' + highlight(entry.title, query) + "</span>" +
          '<span class="search-result-meta"><span class="search-type">' + esc(entry.type) + "</span>" +
          "<span>" + esc(subject ? subject.subject.title : "") + "</span>" +
          (entry.code ? '<span class="search-code mono">' + esc(entry.code) + "</span>" : "") + "</span>" +
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
    } else if (result.wordId) pendingTarget = '[data-word-row="' + result.wordId + '"]';
    else if (result.studyId) pendingTarget = '[data-study="' + result.studyId + '"]';
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

    if (action === "guest-signin") {
      createLocalAccount("Guest", "", true);
      if (activeAccount) resumeAfterAuth();
      return;
    }

    if (action === "open-frq" && subjectId) {
      state.frqId = trigger.getAttribute("data-frq");
      paint();
      window.scrollTo(0, 0);
      return;
    }

    if (action === "frq-back") {
      state.frqId = null;
      paint();
      return;
    }

    if (action === "frq-grade" && subjectId) {
      const entry = SUBJECT_MAP.get(subjectId);
      if (!entry) return;
      const prompt = (entry.subject.frq || []).find(function (item) {
        return item.id === trigger.getAttribute("data-frq");
      });
      if (!prompt) return;
      const scores = {};
      view.querySelectorAll("[data-frq-criterion]").forEach(function (select) {
        scores[select.getAttribute("data-frq-criterion")] = Number(select.value) || 0;
      });
      const bucket = progress.frq[subjectId] || (progress.frq[subjectId] = {});
      const record = bucket[prompt.id] || { answer: "" };
      record.scores = scores;
      record.gradedAt = new Date().toISOString();
      record.updatedAt = record.gradedAt;
      bucket[prompt.id] = record;
      saveProgress();
      paint();
      toast("Saved " + frqScore(record) + "/" + frqTotal(prompt) + " — model answer unlocked.");
      return;
    }

    if (action === "frq-clear" && subjectId) {
      const promptId = trigger.getAttribute("data-frq");
      if (!window.confirm("Clear this written answer and its self-grade?")) return;
      if (progress.frq[subjectId]) delete progress.frq[subjectId][promptId];
      saveProgress();
      paint();
      toast("Written answer cleared.", "is-warn");
      return;
    }

    if (action === "focus-question" && questionId && subjectId) {
      const filters = getFilters(subjectId);
      filters.mode = "practice";
      filters.difficulty = "All";
      filters.limit = 40;
      focusQid = questionId;
      stopExamTimer();
      exam = null;
      pendingTarget = '[data-card="' + questionId + '"]';
      go("#/subject/" + subjectId + "/practice");
      return;
    }

    if (action === "speak") {
      speakWord(trigger.getAttribute("data-word"), trigger.getAttribute("data-lang"));
      return;
    }

    if (action === "speak-all" && subjectId) {
      const info = SUBJECT_MAP.get(subjectId);
      if (info) speakDeck(info.subject);
      return;
    }

    if (action === "vocab" && subjectId) {
      const info = SUBJECT_MAP.get(subjectId);
      const word = trigger.getAttribute("data-word");
      if (!info || !word) return;
      const record = vocabRecord(subjectId, word);
      const nowKnown = !(record && record.known);
      markVocabulary(info.subject, word, nowKnown);
      paint();
      toast(nowKnown ? "Marked as known — +" + XP_PER_CORRECT + " XP." : "Back in the learning pile.", nowKnown ? "" : "is-warn");
      return;
    }

    if (action === "open-flashcards" && subjectId) {
      const filters = getFilters(subjectId);
      filters.mode = "flashcards";
      filters.limit = 20;
      focusQid = null;
      stopExamTimer();
      exam = null;
      go("#/subject/" + subjectId + "/practice");
      return;
    }

    if (action === "flip-card" && subjectId) {
      const deck = state.decks[subjectId];
      if (!deck) return;
      deck.revealed = !deck.revealed;
      paint();
      return;
    }

    if ((action === "flash-known" || action === "flash-again") && subjectId) {
      const info = SUBJECT_MAP.get(subjectId);
      const deck = state.decks[subjectId];
      if (!info || !deck) return;
      const word = packWords(info.subject)[deck.order[deck.index]];
      if (!word) return;
      markVocabulary(info.subject, word.target, action === "flash-known");
      if (action === "flash-known") deck.known += 1;
      else deck.again += 1;
      deck.index += 1;
      deck.revealed = false;
      paint();
      return;
    }

    if (action === "flash-restart" && subjectId) {
      delete state.decks[subjectId];
      paint();
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

    if (action === "copy-code") {
      const code = trigger.getAttribute("data-code") || "";
      if (!code) return;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(code).then(function () {
          toast("Copied " + code + " — paste it into search to jump back here.");
        }).catch(function () {
          toast(code + " · copy blocked by the browser", "is-warn");
        });
      } else {
        toast(code + " · copy blocked by the browser", "is-warn");
      }
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

    if (action === "open-papers" && subjectId) {
      const filters = getFilters(subjectId);
      filters.mode = "papers";
      filters.topic = "";
      focusQid = null;
      stopExamTimer();
      exam = null;
      paper = null;
      state.attemptId = null;
      state.attemptFilter = "all";
      paint();
      return;
    }

    if (action === "start-practice-paper" && subjectId) {
      startPracticePaper(subjectId, trigger.getAttribute("data-paper"));
      return;
    }

    if (action === "start-mock-paper" && subjectId) {
      startMockPaper(subjectId, trigger.getAttribute("data-paper"));
      return;
    }

    if (action === "paper-answer" && questionId) {
      if (!paper || paper.submitted) return;
      if (paper.answers[questionId] !== undefined) return;
      const info = QUESTION_MAP.get(questionId);
      if (!info) return;
      const index = Number(trigger.getAttribute("data-index"));
      paper.answers[questionId] = index;
      recordAnswer(questionId, index === info.question.answer);
      saveActiveAttempt();
      announce(
        "Question " + (paper.index + 1) + ": answer " + "ABCD".charAt(index) + " recorded. " +
        (index === info.question.answer ? "Correct." : "Not correct.") +
        (paper.index + 1 < paper.questions.length ? " Press Enter for the next question." : "")
      );
      paint();
      return;
    }

    if (action === "paper-next") {
      if (!paper) return;
      if (paper.index + 1 >= paper.questions.length) {
        finishPaper();
        return;
      }
      paper.index += 1;
      saveActiveAttempt();
      pendingFocus = "paper-question";
      announce("Question " + (paper.index + 1) + " of " + paper.questions.length + ".");
      paint();
      return;
    }

    if (action === "paper-prev") {
      if (!paper || paper.index === 0) return;
      paper.index -= 1;
      saveActiveAttempt();
      pendingFocus = "paper-question";
      announce("Question " + (paper.index + 1) + " of " + paper.questions.length + ".");
      paint();
      return;
    }

    if (action === "paper-finish") {
      if (!paper) return;
      const unanswered = paper.questions.length - Object.keys(paper.answers).length;
      if (unanswered > 0 && !window.confirm(unanswered + " " + plural(unanswered, "question is", "questions are") + " unanswered. Finish the set anyway?")) return;
      finishPaper();
      return;
    }

    if (action === "paper-goto") {
      if (!paper) return;
      const index = Number(trigger.getAttribute("data-index"));
      if (Number.isNaN(index) || !paper.questions[index]) return;
      paper.index = index;
      paper.reviewing = false;
      saveActiveAttempt();
      paint();
      return;
    }

    if (action === "paper-flag" && questionId) {
      if (!paper) return;
      const at = paper.flags.indexOf(questionId);
      if (at >= 0) paper.flags.splice(at, 1);
      else paper.flags.push(questionId);
      saveActiveAttempt();
      announce(at >= 0 ? "Mark removed." : "Question " + (paper.index + 1) + " marked for review.");
      paint();
      return;
    }

    if (action === "paper-review-open") {
      if (!paper) return;
      paper.reviewing = true;
      paint();
      return;
    }

    if (action === "paper-review-close") {
      if (!paper) return;
      paper.reviewing = false;
      paint();
      return;
    }

    if (action === "paper-submit") {
      finishPaper();
      return;
    }

    if (action === "review-current-paper") {
      if (!paper || !paper.attemptId) return;
      state.attemptId = paper.attemptId;
      state.attemptFilter = "all";
      paper = null;
      paint();
      return;
    }

    if (action === "retake-current-misses") {
      if (!paper) return;
      const misses = paper.questions.filter(function (question) {
        return paper.answers[question.id] !== question.answer;
      });
      startMissesRetake(paper.subjectId, misses);
      return;
    }

    if (action === "resume-attempt") {
      resumeActiveAttempt();
      return;
    }

    if (action === "discard-attempt") {
      if (!window.confirm("Discard the unfinished sitting? It will not be saved.")) return;
      const next = (Array.isArray(progress.paused) ? progress.paused : [])[0] || null;
      progress.active = next;
      progress.paused = next ? progress.paused.slice(1) : [];
      saveProgress();
      paint();
      toast("Unfinished sitting discarded.", "is-warn");
      return;
    }

    if (action === "resume-paused") {
      resumePausedSitting(Number(trigger.getAttribute("data-index")) || 0);
      return;
    }

    if (action === "discard-paused") {
      if (!window.confirm("Discard that paused sitting? It will not be saved.")) return;
      discardPausedSitting(Number(trigger.getAttribute("data-index")) || 0);
      return;
    }

    if (action === "open-attempt") {
      const attempt = attemptById(trigger.getAttribute("data-attempt"));
      if (!attempt) return;
      stopExamTimer();
      exam = null;
      paper = null;
      state.attemptId = attempt.id;
      state.attemptFilter = "all";
      getFilters(attempt.subjectId).mode = "papers";
      go("#/subject/" + attempt.subjectId + "/practice");
      return;
    }

    if (action === "attempt-filter") {
      state.attemptFilter = trigger.getAttribute("data-value") === "misses" ? "misses" : "all";
      paint();
      return;
    }

    if (action === "attempt-back") {
      state.attemptId = null;
      state.attemptFilter = "all";
      paint();
      return;
    }

    if (action === "retake-misses") {
      const attempt = attemptById(trigger.getAttribute("data-attempt"));
      if (!attempt) return;
      startMissesRetake(attempt.subjectId, attemptMisses(attempt));
      return;
    }

    if (action === "retake-attempt") {
      sitAgain(attemptById(trigger.getAttribute("data-attempt")));
      return;
    }

    if (action === "exam-flag" && questionId) {
      if (!exam || exam.submitted) return;
      const at = exam.flags.indexOf(questionId);
      if (at >= 0) exam.flags.splice(at, 1);
      else exam.flags.push(questionId);
      saveActiveAttempt();
      paint();
      return;
    }

    if (action === "exam-goto") {
      const index = Number(trigger.getAttribute("data-index"));
      const target = document.getElementById("exam-q-" + index);
      if (target) target.scrollIntoView({ block: "start", behavior: "smooth" });
      return;
    }

    if (action === "exam-review-open") {
      if (!exam) return;
      exam.reviewing = true;
      paint();
      return;
    }

    if (action === "exam-review-close") {
      if (!exam) return;
      exam.reviewing = false;
      paint();
      return;
    }

    if (action === "exam-review-filter") {
      if (!exam) return;
      exam.reviewMisses = trigger.getAttribute("data-value") === "misses";
      paint();
      return;
    }

    if (action === "exam-retake-misses") {
      if (!exam || !exam.submitted) return;
      const misses = exam.questions.filter(function (question) {
        return exam.answers[question.id] !== question.answer;
      });
      startMissesRetake(exam.subjectId, misses);
      return;
    }

    if (action === "paper-retry" && subjectId) {
      if (paper) startPracticePaper(subjectId, paper.key);
      return;
    }

    if (action === "paper-new") {
      paper = null;
      if (exam && exam.paperKey) exam = null;
      stopExamTimer();
      state.attemptId = null;
      state.attemptFilter = "all";
      paint();
      return;
    }

    if (action === "retake-paper" && subjectId) {
      startMockPaper(subjectId, trigger.getAttribute("data-paper") || (exam && exam.paperKey) || "1");
      return;
    }

    if (action === "exit-paper") {
      paper = null;
      exam = null;
      stopExamTimer();
      paint();
      return;
    }

    if (action === "practice-topic" && subjectId) {
      const filters = getFilters(subjectId);
      filters.mode = "practice";
      filters.difficulty = "All";
      filters.topic = trigger.getAttribute("data-topic") || "";
      filters.limit = 20;
      focusQid = null;
      stopExamTimer();
      exam = null;
      paper = null;
      go("#/subject/" + subjectId + "/practice");
      return;
    }

    if (action === "clear-topic" && subjectId) {
      getFilters(subjectId).topic = "";
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
      saveActiveAttempt();
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
      if (!window.confirm("Clear the entire mistake bank, including questions marked later corrected?")) return;
      progress.mistakes = [];
      progress.corrected = {};
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
      state.attemptId = null;
      state.attemptFilter = "all";
      exam = null;
      paper = null;
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

  view.addEventListener("input", function (event) {
    const field = event.target.closest("[data-frq-input]");
    if (!field) return;
    const subjectId = field.getAttribute("data-subject");
    const promptId = field.getAttribute("data-frq");
    const status = view.querySelector("[data-frq-status]");
    const count = view.querySelector("[data-frq-count]");
    if (count) count.textContent = field.value.length + " characters";
    if (status) status.textContent = "Saving…";
    window.clearTimeout(frqSaveTimer);
    frqSaveTimer = window.setTimeout(function () {
      const bucket = progress.frq[subjectId] || (progress.frq[subjectId] = {});
      const record = bucket[promptId] || { answer: "" };
      record.answer = field.value;
      record.updatedAt = new Date().toISOString();
      bucket[promptId] = record;
      saveProgress();
      if (status) status.textContent = "Draft saved";
    }, 450);
  });

  view.addEventListener("change", function (event) {
    const select = event.target.closest("[data-frq-criterion]");
    if (!select) return;
    const promptView = select.closest(".frq-prompt-view");
    if (!promptView) return;
    const criterion = select.closest(".frq-criterion");
    const descriptor = criterion ? criterion.querySelector(".frq-descriptor") : null;
    let descriptors = {};
    try {
      descriptors = JSON.parse(select.getAttribute("data-descriptors") || "{}");
    } catch (error) {
      descriptors = {};
    }
    if (descriptor) {
      descriptor.textContent = descriptors[select.value] || "";
      typeset(criterion);
    }
    const total = promptView.querySelector("[data-frq-total]");
    if (total) {
      const sum = Array.from(promptView.querySelectorAll("[data-frq-criterion]")).reduce(function (acc, element) {
        return acc + (Number(element.value) || 0);
      }, 0);
      total.textContent = sum + "/" + (total.getAttribute("data-frq-max") || "0");
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

    /* Paper runner keyboard pass: A–D / 1–4 answer, Enter advances,
       arrows move, F marks, R opens the review screen. */
    if (!typing && paper && !paper.submitted && !paper.reviewing) {
      const onControl = event.target && event.target.closest && event.target.closest("button, a, select, summary, [role='button']");
      if (onControl) return;
      const key = String(event.key || "").toLowerCase();
      const question = paper.questions[paper.index];
      if (!question) return;
      const letterAt = "abcd".indexOf(key);
      const numberAt = ["1", "2", "3", "4"].indexOf(key);
      const choice = letterAt >= 0 ? letterAt : numberAt;
      if (choice >= 0) {
        if (question.options[choice] === undefined || paper.answers[question.id] !== undefined) return;
        event.preventDefault();
        paper.answers[question.id] = choice;
        recordAnswer(question.id, choice === question.answer);
        saveActiveAttempt();
        announce(
          "Question " + (paper.index + 1) + ": answer " + "ABCD".charAt(choice) + " recorded. " +
          (choice === question.answer ? "Correct." : "Not correct.") +
          (paper.index + 1 < paper.questions.length ? " Press Enter for the next question." : "")
        );
        paint();
        return;
      }
      if (key === "enter") {
        event.preventDefault();
        if (paper.answers[question.id] === undefined) {
          announce("Choose an answer first — A, B, C or D.");
          return;
        }
        if (paper.index + 1 >= paper.questions.length) {
          paper.reviewing = true;
          announce("Last question. Review screen open.");
          paint();
          return;
        }
        paper.index += 1;
        saveActiveAttempt();
        pendingFocus = "paper-question";
        announce("Question " + (paper.index + 1) + " of " + paper.questions.length + ".");
        paint();
        return;
      }
      if (key === "arrowright" || key === "arrowleft") {
        const next = paper.index + (key === "arrowright" ? 1 : -1);
        if (next < 0 || next >= paper.questions.length) return;
        event.preventDefault();
        paper.index = next;
        saveActiveAttempt();
        pendingFocus = "paper-question";
        announce("Question " + (paper.index + 1) + " of " + paper.questions.length + ".");
        paint();
        return;
      }
      if (key === "f") {
        event.preventDefault();
        const at = paper.flags.indexOf(question.id);
        if (at >= 0) paper.flags.splice(at, 1);
        else paper.flags.push(question.id);
        saveActiveAttempt();
        announce(at >= 0 ? "Mark removed." : "Question " + (paper.index + 1) + " marked for review.");
        paint();
        return;
      }
      if (key === "r") {
        event.preventDefault();
        paper.reviewing = true;
        announce("Review screen open.");
        paint();
      }
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

  /* Offline shell: cached on first visit, then the app and its question banks
     stay available without a connection. Registration is best-effort. */
  if ("serviceWorker" in navigator && /^https?:$/.test(window.location.protocol)) {
    navigator.serviceWorker.register("sw.js").catch(function () {
      /* The app works normally without a service worker (private mode, old browser). */
    });
  }

  window.addEventListener("offline", function () {
    toast("Offline — the cached shell, question banks and saved papers still work.", "is-warn");
  });
  window.addEventListener("online", function () {
    toast("Back online — syncing progress.");
  });

  boot();
})();
