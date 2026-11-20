/* ============================================================================
   QUESTIONAIRE — questions/registry.js
   ----------------------------------------------------------------------------
   Question pools live under questions/<area>/<pool>.js. Each pool file calls
   QuestionairePools.register({...}) with the subject ids it owns and its facts.

   A fact is [prompt, correct, wrongs, explanation].

   Resolution is by subject id, never by keyword guessing, so a subject cannot
   inherit another discipline's questions. A pool may also expose
   generate(random, index) for parametric items (music intervals and keys).

   Load order: this file, then every pool file, then subject-banks.js.
   ========================================================================== */

(function () {
  "use strict";

  const pools = {};
  const bySubject = {};

  const api = {
    pools: pools,
    bySubject: bySubject,

    register: function (spec) {
      if (!spec || !spec.id) throw new Error("A pool needs an id.");
      const pool = {
        id: spec.id,
        area: spec.area || "general",
        title: spec.title || spec.id,
        subjects: (spec.subjects || []).slice(),
        facts: spec.facts || [],
        generate: typeof spec.generate === "function" ? spec.generate : null
      };
      pools[pool.id] = pool;
      pool.subjects.forEach(function (id) {
        if (bySubject[id]) {
          console.warn("Questionaire: subject " + id + " was claimed twice (" + bySubject[id].id + ", " + pool.id + ").");
        }
        bySubject[id] = pool;
      });
      return pool;
    },

    forSubject: function (subject) {
      return (subject && bySubject[subject.id]) || null;
    },

    facts: function (poolId) {
      const pool = pools[poolId];
      return pool ? pool.facts : [];
    },

    /* Which subjects still have no pool of their own. Anything listed here
       falls back to tag-based concept questions instead of borrowing another
       field's facts, but it should be empty except for the domains that use
       the numeric generators (math, physics, computing, languages, concept). */
    audit: function (subjects) {
      return (subjects || []).filter(function (subject) {
        return !bySubject[subject.id];
      }).map(function (subject) {
        return subject.id;
      });
    },

    summary: function () {
      return Object.keys(pools).map(function (id) {
        return { id: id, area: pools[id].area, subjects: pools[id].subjects.length, facts: pools[id].facts.length, generate: Boolean(pools[id].generate) };
      });
    }
  };

  window.QuestionairePools = api;
})();
