/* ============================================================================
   QUESTIONAIRE — questions/academic-skills/research.js
   ========================================================================== */

(function () {
  "use strict";

  window.QuestionairePools.register({
    id: "research",
    area: "academic-skills",
    title: "Research methods",
    subjects: ["ap-research", "research-methods"],
    facts: [
      ["What is a controlled variable?", "A factor kept the same across trials", ["The factor changed", "The factor measured", "A random error"], "Control variables make comparisons fair."],
      ["What is random assignment used for?", "Reducing confounding between groups", ["Increasing the sample size", "Making the study cheaper", "Guaranteeing a positive result"], "Random assignment balances unknown differences."],
      ["What is reliability?", "Consistency of a measurement", ["Accuracy of a claim", "Size of a sample", "Popularity of a study"], "Reliable measures produce similar results on repeat."],
      ["What is validity?", "Whether a measure or design supports the intended claim", ["Whether a measure is consistent", "Whether a sample is large", "Whether a result is significant"], "Validity concerns accuracy and inference."],
      ["What is a confounding variable?", "An alternative explanation for an observed relationship", ["A variable held constant", "The dependent variable", "A random error"], "Confounders can create spurious associations."],
      ["What is a null hypothesis?", "A statement of no effect or no relationship", ["The expected result", "The research question", "A proven conclusion"], "Null hypotheses are tested against data."],
      ["What is a p-value?", "The probability of data at least as extreme if the null were true", ["The probability the hypothesis is true", "The size of the effect", "The sample mean"], "A p-value is not the probability that the null is true."],
      ["What is generalisability?", "The extent to which findings apply beyond the sample", ["The consistency of a measure", "The size of a dataset", "The number of variables"], "Random sampling supports generalisability."],
      ["What is an observational study?", "A study that observes without manipulating the independent variable", ["A randomised experiment", "A laboratory assay", "A meta-analysis"], "Observational studies show association, not causation."],
      ["What is a literature review for?", "Situating a study in existing evidence", ["Replacing the methods section", "Collecting data", "Proving a hypothesis"], "Reviews identify gaps and justify the research."],
      ["What is informed consent?", "Voluntary agreement after understanding risks and benefits", ["A signed contract for payment", "A court order", "A random selection"], "Consent protects autonomy."],
      ["What is an operational definition?", "A precise description of how a variable is measured", ["A dictionary definition", "A theoretical claim", "A research question"], "Operational definitions make replication possible."],
      ["What is replication?", "Repeating a study to check the result", ["Copying a paper", "Changing the hypothesis", "Increasing the sample"], "Replication strengthens confidence."],
      ["What is selection bias?", "A sample that differs systematically from the population", ["A random error", "A measurement error", "A statistical test"], "Non-random selection can distort estimates."],
      ["What is a peer-reviewed source?", "Work assessed by independent experts before publication", ["Any website", "A vendor brochure", "An unpublished draft"], "Peer review filters obvious errors and weak claims."],
      ["What is a placebo control?", "A treatment with no active ingredient used for comparison", ["A second experimental treatment", "A larger dose", "A random sample"], "Placebos isolate the treatment effect."]
    ]
  });
})();
