/* ============================================================================
   QUESTIONAIRE — questions/exams/sat.js
   The SAT subject has its own 1,000-question curated bank; this pool exists so
   the subject is never routed to another discipline's facts if its bank grows.
   ========================================================================== */

(function () {
  "use strict";

  window.QuestionairePools.register({
    id: "sat",
    area: "exams",
    title: "SAT",
    subjects: ["sat"],
    facts: [
      ["How is the digital SAT scored?", "400 to 1600 across two sections", ["0 to 100", "200 to 800 in total", "1 to 36"], "Reading and Writing and Math each contribute 200–800."],
      ["Which two sections make up the digital SAT?", "Reading and Writing, and Math", ["English, Math, Reading and Science", "Verbal and Analytical Writing", "Math, Science and Social Studies"], "The essay was discontinued."],
      ["Is there a penalty for guessing on the SAT?", "No, there is no penalty", ["Yes, a quarter point", "Yes, half a point", "Only on Math"], "Unanswered questions simply score zero."],
      ["How long is the digital SAT?", "About two hours and fourteen minutes", ["About four hours", "About one hour", "About three hours"], "It is shorter than the paper test was."],
      ["What does the SAT Reading and Writing section test?", "Comprehension, grammar and rhetorical use of evidence", ["Calculus and trigonometry", "Scientific experimental design", "Essay writing only"], "Questions are passage-based."],
      ["Are calculators allowed on the SAT Math section?", "Yes, a calculator is allowed throughout", ["No, never", "Only on the second module", "Only for geometry"], "The digital SAT includes a built-in calculator."],
      ["How many modules does each SAT section have?", "Two", ["One", "Three", "Four"], "Each section has two adaptive modules."],
      ["What is the best use of a practice test?", "Diagnose weak skills, then review every error", ["Memorise the questions", "Measure how fast you type", "Replace all other study"], "Review turns a score into a study plan."]
    ]
  });
})();
