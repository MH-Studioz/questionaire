/* ============================================================================
   QUESTIONAIRE — sources.js
   ----------------------------------------------------------------------------
   Attribution registry for the external banks whose scope shaped Questionaire's
   aligned drills. `source` on a question points at a key here.

   Rules for adding a source:
   - Link the canonical home page, not a scraped mirror.
   - State the licence exactly. "Mixed" means check the individual page.
   - Never claim a question is copied from a source unless it is, and only when
     the licence allows redistribution with attribution.
   ========================================================================== */

window.QUESTIONAIRE_SOURCES = {
  "openstax": {
    title: "OpenStax",
    url: "https://openstax.org/subjects",
    licence: "CC BY 4.0",
    note: "Peer-reviewed open textbooks from Rice University. Used as a chapter-level scope map for aligned calculus, precalculus, biology and chemistry drills; the items themselves are original."
  },
  "illustrative-math": {
    title: "Illustrative Mathematics",
    url: "https://tasks.illustrativemathematics.org/",
    licence: "CC BY 4.0",
    note: "Open K-12 task library. Used as a task-style reference for the algebra and geometry drills, which are written for this site rather than copied."
  },
  "libretexts": {
    title: "LibreTexts Commons",
    url: "https://commons.libretexts.org/homework",
    licence: "Mixed CC licences",
    note: "Community homework library with a licence on every page. Useful for supplementary reading and homework ideas; nothing is reproduced here because the licences vary by page."
  },
  "college-board-sat": {
    title: "College Board SAT Suite Question Bank",
    url: "https://satsuiteeducatorquestionbank.collegeboard.org/",
    licence: "Proprietary — reference only",
    note: "The official educator question bank is copyrighted and not openly licensed. It is linked for teacher reference and item-style study only; no College Board items are copied into Questionaire."
  }
};
