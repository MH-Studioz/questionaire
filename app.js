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
        subject.questions.forEach(function (question) {
          QUESTION_MAP.set(question.id, {
            question: question,
            subject: subject,
            category: category,
            entry: entry
          });
        });
      });
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

  function loadProgress() {
    let stored = null;
    try {
      stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "null");
    } catch (error) {
      stored = null;
    }
    const merged = Object.assign(defaultProgress(), stored && typeof stored === "object" ? stored : {});
    if (!merged.answered || typeof merged.answered !== "object") merged.answered = {};
    if (!Array.isArray(merged.bookmarks)) merged.bookmarks = [];
    if (!Array.isArray(merged.mistakes)) merged.mistakes = [];
    merged.bookmarks = merged.bookmarks.filter(function (id) { return QUESTION_MAP.has(id); });
    merged.mistakes = merged.mistakes.filter(function (id) { return QUESTION_MAP.has(id); });
    merged.xp = Number(merged.xp) || 0;
    merged.streak = Number(merged.streak) || 0;
    merged.bestStreak = Number(merged.bestStreak) || 0;
    progress = merged;
    normalizeStreak();
  }

  function saveProgress() {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch (error) {
      /* Progress remains in memory if storage is unavailable. */
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
    subject.questions.forEach(function (question) {
      const record = progress.answered[question.id];
      if (!record) return;
      solved += 1;
      attempts += Number(record.attempts) || 0;
      correct += Number(record.correct) || 0;
    });
    const total = subject.questions.length;
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
    record.last = new Date().toISOString();
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
    return reviewMap().size;
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
      state.filters[subjectId] = { difficulty: "All", mode: "practice" };
    }
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

  function updateChrome() {
    const stats = getStats();
    setText("stat-streak", stats.streak);
    setText("stat-xp", stats.xp);
    setText("stat-level", stats.level);
    setText("saved-count", reviewCount());

    const panel = document.getElementById("sidebar-level");
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
              '<span class="nav-subject-level">' + subject.questions.length + "</span></a>"
            );
          })
          .join("");
        return (
          '<div class="nav-group accent-' + esc(category.accent) + '">' +
          '<button class="nav-group-head" type="button" aria-expanded="true">' +
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
    if (parts[0] === "review" || parts[0] === "saved") return { name: "review" };
    if (parts[0] === "settings") return { name: "settings" };
    return { name: "dashboard" };
  }

  function routeKey(route) {
    return route.name + ":" + (route.subjectId || "") + ":" + (route.tab || "");
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
    const key = routeKey(route);
    const changed = key !== state.routeKey;
    state.route = route;
    state.routeKey = key;

    if (changed) state.cards = {};
    if (exam && !examMatches(route)) {
      exam = null;
      stopExamTimer();
    }

    document.title =
      route.name === "subject"
        ? "Questionaire — " + SUBJECT_MAP.get(route.subjectId).subject.title
        : route.name === "review"
        ? "Questionaire — Review queue"
        : route.name === "settings"
        ? "Questionaire — Settings"
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
      case "review":
        renderReview();
        break;
      case "settings":
        renderSettings();
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
      if (entry.subject.questions.some(function (question) { return !progress.answered[question.id]; })) {
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
    return active.length ? active : SUBJECTS.slice(0, 3);
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
    const totalQuestions = QUESTION_MAP.size;
    const nextEntry = recommendedEntry();
    const solvedPct = totalQuestions ? Math.round((stats.solved / totalQuestions) * 100) : 0;
    const vault = SUBJECTS.filter(function (entry) { return entry.category.id === "vault"; });

    const continueHTML = continueEntries().map(function (entry) {
      const entryStats = subjectStats(entry.subject);
      return (
        '<a class="continue-item ' + accentClass(entry) + '" href="#/subject/' + esc(entry.subject.id) + '/practice">' +
        '<span class="continue-icon"><i data-lucide="' + esc(entry.subject.icon) + '"></i></span>' +
        '<span class="continue-body">' +
        '<span class="continue-title">' + esc(entry.subject.title) + "</span>" +
        '<span class="continue-sub">' + entryStats.solved + " of " + entryStats.total + " questions explored</span>" +
        '<span class="continue-progress"><span class="progress"><span class="progress-bar" style="width:' + entryStats.pct + '%"></span></span></span>' +
        "</span>" +
        '<span class="continue-arrow"><i data-lucide="arrow-right"></i></span></a>'
      );
    }).join("");

    const vaultHTML = vault.map(function (entry) {
      return (
        '<a class="vault-mini-card" href="#/subject/' + esc(entry.subject.id) + '/practice">' +
        '<span class="vault-mini-icon"><i data-lucide="' + esc(entry.subject.icon) + '"></i></span>' +
        "<span><span class=\"vault-mini-title\">" + esc(entry.subject.title) + "</span>" +
        '<span class="vault-mini-sub">' + entry.subject.study.length + " cards · " + entry.subject.tips.length + " tips</span></span></a>"
      );
    }).join("");

    const categorySections = window.STUDY_DATA.categories.map(function (category, categoryIndex) {
      return (
        '<section class="dashboard-section accent-' + esc(category.accent) + '">' +
        '<div class="section-head">' +
        '<div class="section-heading">' +
        '<span class="section-index">' + pad2(categoryIndex + 1) + "</span>" +
        "<h2>" + esc(category.title) + "</h2>" +
        "<p>" + esc(category.tagline) + "</p></div>" +
        '<span class="section-count">' + category.subjects.length + " subjects</span>" +
        "</div>" +
        '<div class="subject-grid">' +
        category.subjects.map(function (subject) {
          return subjectCardHTML(SUBJECT_MAP.get(subject.id));
        }).join("") +
        "</div></section>"
      );
    }).join("");

    view.innerHTML =
      '<div class="view-inner">' +
      '<section class="hero">' +
      '<div class="hero-meta"><span>Questionaire</span><span>Study annual</span><span>No. 01</span></div>' +
      '<div class="hero-body">' +
      '<div class="hero-copy">' +
      '<span class="eyebrow">' +
      esc(new Date().toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "short" })) +
      " · Vol. 1</span>" +
      "<h1>" + esc(greeting()) + ".</h1>" +
      "<p>" + SUBJECTS.length + " subjects in this issue. Read the brief, drill the question bank, then sit a timed paper. Nothing leaves this browser.</p>" +
      '<div class="hero-actions">' +
      '<a class="btn btn-primary" href="#/subject/' + esc(nextEntry.subject.id) + '/practice"><span>Begin with ' + esc(nextEntry.subject.title) + '</span><i data-lucide="arrow-right"></i></a>' +
      '<a class="btn btn-ghost" href="#/review">Review queue <span class="btn-count">' + reviewCount() + "</span></a>" +
      "</div></div>" +
      '<aside class="hero-side">' +
      '<div class="mastery-figure"><strong class="mastery-number">' + solvedPct + '%</strong><span class="mastery-caption">of the question bank solved</span></div>' +
      '<div class="hero-side-meta">' +
      '<div class="hero-side-row"><span>Level ' + stats.level + "</span><strong>" + esc(stats.rank) + "</strong></div>" +
      '<div class="hero-side-row"><span>Experience</span><strong>' + stats.xp + " XP</strong></div>" +
      '<div class="hero-side-row"><span>Solved</span><strong>' + stats.solved + "/" + totalQuestions + "</strong></div>" +
      '<div class="hero-side-row"><span>Best streak</span><strong>' + stats.bestStreak + " " + plural(stats.bestStreak, "day", "days") + "</strong></div>" +
      "</div>" +
      '<div class="progress"><div class="progress-bar" style="width:' + stats.levelProgress + '%"></div></div>' +
      '<p class="hero-side-note">Level progress · ' + stats.xpToNext + " XP to next</p>" +
      "</aside></div></section>" +

      '<section class="stats-grid" aria-label="Your statistics">' +
      statCard({
        label: "Questions solved",
        icon: "target",
        accent: "accent-indigo",
        value: stats.solved,
        unit: "of " + totalQuestions,
        foot: stats.attempts + " total " + plural(stats.attempts, "attempt", "attempts")
      }) +
      statCard({
        label: "Accuracy",
        icon: "crosshair",
        accent: "accent-teal",
        value: stats.accuracy + "%",
        foot: stats.correct + " correct of " + stats.attempts
      }) +
      statCard({
        label: "Daily streak",
        icon: "flame",
        accent: "accent-amber",
        value: stats.streak,
        unit: plural(stats.streak, "day", "days"),
        foot: stats.streak > 0 ? "Best: " + stats.bestStreak + " " + plural(stats.bestStreak, "day", "days") : "Answer a question to start"
      }) +
      statCard({
        label: "Level " + stats.level,
        icon: "award",
        accent: "accent-indigo",
        value: stats.xp,
        unit: "XP",
        foot: esc(stats.rank) + " · " + stats.xpToNext + " XP to next"
      }) +
      "</section>" +

      '<div class="dash-bento">' +
      '<section class="dash-panel card">' +
      '<div class="dash-panel-head"><h3><i data-lucide="history"></i>Pick up where you left off</h3><span>progress</span></div>' +
      '<div class="continue-list">' + continueHTML + "</div></section>" +
      '<section class="dash-panel card">' +
      '<div class="dash-panel-head"><h3><i data-lucide="archive"></i>Universal vault</h3><span>non-syllabus</span></div>' +
      '<div class="vault-mini">' + vaultHTML + "</div></section>" +
      "</div>" +
      categorySections +
      "</div>";
  }

  /* --------------------------------------------------------------------------
     Subject workspace
     -------------------------------------------------------------------------- */

  function renderSubject() {
    const entry = SUBJECT_MAP.get(state.route.subjectId);
    const subject = entry.subject;
    const stats = subjectStats(subject);
    const bookmarked = progress.bookmarks.filter(function (id) {
      const info = QUESTION_MAP.get(id);
      return info && info.subject.id === subject.id;
    }).length;

    const tabs = TABS.map(function (tab) {
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
    else if (state.route.tab === "videos") panel = videosTabHTML(subject);
    else panel = practiceTabHTML(entry);

    view.innerHTML =
      '<div class="view-inner">' +
      '<nav class="crumbs" aria-label="Breadcrumb">' +
      '<a href="#/dashboard">Dashboard</a><i data-lucide="chevron-right"></i>' +
      "<span>" + esc(entry.category.title) + "</span></nav>" +
      '<header class="subject-header card ' + accentClass(entry) + '">' +
      '<span class="subject-header-icon"><i data-lucide="' + esc(subject.icon) + '"></i></span>' +
      '<div class="subject-header-body">' +
      '<span class="badge ' + badgeClass(subject.level) + '">' + esc(subject.level) + "</span>" +
      "<h1>" + esc(subject.title) + "</h1>" +
      "<p>" + esc(subject.blurb) + "</p>" +
      '<div class="subject-header-meta">' + subject.tags.map(function (tag) {
        return '<span class="tag">' + esc(tag) + "</span>";
      }).join("") + "</div></div>" +
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
      '<p class="practice-note"><i data-lucide="zap"></i>Instant feedback — answer, then reveal the derivation one step at a time.</p>' +
      '<div class="question-list">' + questions.map(function (question) {
        return questionCardHTML(entry, question, {});
      }).join("") + "</div>"
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
      const minutes = Math.ceil((questions.length * SECONDS_PER_QUESTION) / 60);
      return (
        '<div class="card exam-panel">' +
        '<div class="exam-intro-head">' +
        '<span class="subject-icon accent-amber"><i data-lucide="timer"></i></span>' +
        "<div><h2>Timed exam mode</h2>" +
        "<p>No hints or feedback until you submit. The clock starts when you do.</p></div></div>" +
        '<ul class="settings-list">' +
        "<li><strong>" + questions.length + "</strong> questions at " + esc(getFilters(subject.id).difficulty) + " difficulty</li>" +
        "<li><strong>" + minutes + "</strong> " + plural(minutes, "minute", "minutes") + " on the clock</li>" +
        "<li>Graded at the end with full explanations</li>" +
        "<li>Every answer counts toward XP, accuracy and the mistake bank</li>" +
        "</ul>" +
        '<div class="exam-actions"><button type="button" class="btn btn-teal" data-action="start-exam" data-subject="' + esc(subject.id) + '">' +
        '<i data-lucide="play"></i>Start exam</button></div></div>'
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

  function startExam(subjectId) {
    const entry = SUBJECT_MAP.get(subjectId);
    if (!entry) return;
    const questions = filteredQuestions(entry.subject, getFilters(subjectId).difficulty);
    if (!questions.length) {
      toast("No questions at this difficulty.", "is-warn");
      return;
    }
    stopExamTimer();
    const totalSeconds = questions.length * SECONDS_PER_QUESTION;
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
     Settings
     -------------------------------------------------------------------------- */

  function renderSettings() {
    const stats = getStats();
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
      "<p>No account, no backend. Theme and progress live in this browser's <code>localStorage</code>.</p></div>" +
      '<a class="btn btn-ghost" href="#/dashboard"><i data-lucide="layout-dashboard"></i>Dashboard</a>' +
      "</div>" +
      '<div class="settings-grid">' +

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
      '<div class="settings-row"><span>Questions solved</span><strong>' + stats.solved + " / " + QUESTION_MAP.size + "</strong></div>" +
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

    if (result.qid) pendingTarget = '[data-card="' + result.qid + '"]';
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
      getFilters(subjectId).difficulty = trigger.getAttribute("data-value");
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
        window.localStorage.removeItem(STORAGE_KEY);
      } catch (error) {
        /* ignore */
      }
      saveProgress();
      paint();
      toast("Progress reset. Fresh notebook, same lab.", "is-warn");
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
    loadProgress();
    buildSearchIndex();
    renderSidebar();
    applyTheme(getTheme(), false);
    if (!window.location.hash) {
      window.history.replaceState(null, "", "#/dashboard");
    }
    render();
  }

  boot();
})();
