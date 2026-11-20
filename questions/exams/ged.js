/* ============================================================================
   QUESTIONAIRE — questions/exams/ged.js
   ========================================================================== */

(function () {
  "use strict";

  window.QuestionairePools.register({
    id: "ged",
    area: "exams",
    title: "GED",
    subjects: ["ged"],
    facts: [
      ["Which four tests make up the GED?", "Reasoning Through Language Arts, Mathematical Reasoning, Science and Social Studies", ["English, Math, Reading and Science", "Verbal, Quantitative and Writing", "Math, Science and a foreign language"], "All four must be passed to earn the credential."],
      ["What score is required to pass a GED subject test?", "145 out of 200", ["100 out of 200", "160 out of 200", "70 out of 100"], "Each subject is scored 100–200."],
      ["What does the GED credential represent?", "High school equivalency", ["A college degree", "A trade licence", "A graduate admission score"], "It is accepted by many employers and colleges."],
      ["Does the GED Language Arts test include an essay?", "Yes, an extended response", ["No written response", "Only multiple choice", "Only a listening section"], "The extended response is scored on evidence and organisation."],
      ["Is a calculator allowed on GED Math?", "Yes, a permitted calculator is provided", ["No calculator at all", "Only a phone calculator", "Only for algebra"], "Part of the test allows the supplied calculator."],
      ["What does the GED Science test emphasise?", "Reading and reasoning with data and experiments", ["Memorising scientific vocabulary", "Laboratory practical work", "Calculus"], "Questions use passages, tables and graphs."],
      ["What does the GED Social Studies test cover?", "Civics, government, history, economics and geography", ["Only U.S. history", "Only economics", "Only world geography"], "It also includes document-based questions."],
      ["Can the GED tests be taken separately?", "Yes, each subject test can be scheduled on its own", ["No, all four must be taken in one day", "Only two at a time", "Only in a school setting"], "Partial credit is tracked across attempts."]
    ]
  });
})();
