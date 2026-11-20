/* ============================================================================
   QUESTIONAIRE — questions/exams/gre.js
   ========================================================================== */

(function () {
  "use strict";

  window.QuestionairePools.register({
    id: "gre",
    area: "exams",
    title: "GRE",
    subjects: ["gre"],
    facts: [
      ["Which sections does the GRE General Test include?", "Verbal Reasoning, Quantitative Reasoning and Analytical Writing", ["English, Math, Reading and Science", "Reading and Writing, and Math", "Four subject tests"], "The writing section has two tasks."],
      ["What is the GRE Verbal Reasoning score range?", "130 to 170", ["200 to 800", "1 to 36", "0 to 6"], "Verbal and Quantitative each use 130–170."],
      ["What is the GRE Analytical Writing score range?", "0 to 6 in half-point steps", ["130 to 170", "200 to 800", "1 to 36"], "Two essays are averaged."],
      ["How long are GRE scores valid?", "Five years", ["Two years", "Ten years", "They never expire"], "Score reports remain available for five years."],
      ["Is there a penalty for wrong answers on the GRE?", "No penalty", ["A quarter-point penalty", "A half-point penalty", "Only on Quantitative"], "Unanswered questions score zero."],
      ["What are the two GRE Analytical Writing tasks?", "Analyse an issue and analyse an argument", ["Write a personal statement and a summary", "Summarise a lecture and a passage", "Write a lab report and a memo"], "Each task is thirty minutes."],
      ["Is a calculator provided on GRE Quantitative Reasoning?", "Yes, an on-screen calculator is provided", ["No calculator is allowed", "Only a graphing calculator", "Only for geometry questions"], "The calculator is basic by design."],
      ["What does GRE Quantitative Reasoning test?", "Arithmetic, algebra, geometry and data interpretation", ["Calculus and linear algebra", "Statistics proofs only", "Programming"], "Questions emphasise reasoning over computation."]
    ]
  });
})();
