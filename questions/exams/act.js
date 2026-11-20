/* ============================================================================
   QUESTIONAIRE — questions/exams/act.js
   ========================================================================== */

(function () {
  "use strict";

  window.QuestionairePools.register({
    id: "act",
    area: "exams",
    title: "ACT",
    subjects: ["act"],
    facts: [
      ["Which sections does the ACT include?", "English, Math, Reading and Science, with optional Writing", ["Reading and Writing, and Math only", "Verbal, Quantitative and Writing", "Four subject tests chosen by the student"], "The Science section tests reasoning with data, not facts."],
      ["How is the ACT composite scored?", "The average of four section scores, 1 to 36", ["400 to 1600", "0 to 100", "200 to 800"], "Each section is scored 1–36 and averaged."],
      ["Is there a penalty for wrong answers on the ACT?", "No, there is no penalty", ["Yes, a quarter point", "Yes, one point", "Only in Science"], "Guessing is therefore worth it."],
      ["How long is the ACT without Writing?", "About two hours and fifty-five minutes", ["About four hours", "About two hours", "About ninety minutes"], "Writing adds about forty minutes."],
      ["What does the ACT Science section mainly test?", "Data interpretation and experimental reasoning", ["Recall of scientific facts", "Laboratory technique", "Calculus"], "Passages present experiments and results."],
      ["What is the ACT English section about?", "Grammar, punctuation and rhetorical skills", ["Literature analysis", "Essay writing", "Vocabulary only"], "Questions are tied to passages."],
      ["How many questions does ACT Math have?", "60", ["45", "75", "40"], "Sixty questions in sixty minutes."],
      ["What is a good strategy for ACT Reading pacing?", "About eight to nine minutes per passage", ["Two minutes per passage", "Twenty minutes per passage", "No time limit"], "Four passages share thirty-five minutes."]
    ]
  });
})();
