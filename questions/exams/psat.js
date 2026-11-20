/* ============================================================================
   QUESTIONAIRE — questions/exams/psat.js
   ========================================================================== */

(function () {
  "use strict";

  window.QuestionairePools.register({
    id: "psat",
    area: "exams",
    title: "PSAT/NMSQT",
    subjects: ["psat"],
    facts: [
      ["What is the PSAT/NMSQT?", "A practice SAT that also qualifies students for National Merit", ["A college admissions test used instead of the SAT", "A subject test in mathematics only", "An exam for graduate school"], "Scores can lead to National Merit recognition."],
      ["How is the PSAT/NMSQT scored?", "320 to 1520", ["400 to 1600", "1 to 36", "200 to 800"], "It is scored on the same scale family as the SAT but lower."],
      ["Which sections does the PSAT/NMSQT contain?", "Reading and Writing, and Math", ["English, Math, Reading and Science", "Verbal and Analytical Writing", "Math and Science only"], "It mirrors the digital SAT structure."],
      ["Who is eligible for National Merit consideration?", "High-scoring students in the eleventh grade", ["Any ninth-grade student", "Only twelfth graders", "Students who take the SAT first"], "Eligibility also requires meeting programme rules."],
      ["Does the PSAT count for college admissions?", "No, it is a practice and scholarship qualifier", ["Yes, colleges use it directly", "Only for international students", "Only for engineering programmes"], "Colleges consider the SAT or ACT."],
      ["Is there a penalty for guessing on the PSAT?", "No penalty", ["A quarter-point penalty", "A half-point penalty", "Only in Math"], "Leave nothing blank if time is short."],
      ["How many modules does each PSAT section have?", "Two", ["One", "Three", "Four"], "Both sections are adaptive."],
      ["What is the best preparation for the PSAT?", "Take a timed practice test and review errors", ["Memorise the score scale", "Skip the essay section", "Study only vocabulary"], "The PSAT is a diagnostic for the SAT."]
    ]
  });
})();
