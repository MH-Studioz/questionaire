/* ============================================================================
   QUESTIONAIRE — questions/humanities/philosophy.js
   Logic, ethics, epistemology, metaphysics and political philosophy.
   ========================================================================== */

(function () {
  "use strict";

  window.QuestionairePools.register({
    id: "philosophy",
    area: "humanities",
    title: "Philosophy",
    subjects: ["philosophy"],
    facts: [
      ["What is a valid argument?", "One whose conclusion follows from its premises", ["One whose premises are true", "One that persuades most people", "One with no premises"], "Validity concerns structure, not the truth of the premises."],
      ["What is a sound argument?", "A valid argument with true premises", ["Any persuasive argument", "An argument with a false conclusion", "An argument from authority"], "Soundness adds truth to validity."],
      ["What is a deductive argument?", "One whose premises are meant to guarantee the conclusion", ["One that makes the conclusion probable", "One based on testimony", "One with no conclusion"], "Deduction aims at certainty, induction at probability."],
      ["What is an inductive argument?", "One whose premises make the conclusion probable", ["One whose conclusion follows with certainty", "One that begs the question", "One that appeals to emotion"], "Induction generalises from evidence."],
      ["What is a premise?", "A statement offered as support for a conclusion", ["The claim being argued for", "A rhetorical question", "A conclusion's restatement"], "Premises are the reasons in an argument."],
      ["What form is 'If P then Q; P; therefore Q'?", "Modus ponens", ["Modus tollens", "Affirming the consequent", "Denying the antecedent"], "Affirming the antecedent is valid."],
      ["What form is 'If P then Q; not Q; therefore not P'?", "Modus tollens", ["Modus ponens", "Affirming the consequent", "Disjunctive syllogism"], "Denying the consequent is valid."],
      ["What is the fallacy of affirming the consequent?", "If P then Q; Q; therefore P", ["If P then Q; P; therefore Q", "If P then Q; not Q; therefore not P", "P or Q; not P; therefore Q"], "Q can have other causes besides P."],
      ["What is the fallacy of denying the antecedent?", "If P then Q; not P; therefore not Q", ["If P then Q; not Q; therefore not P", "If P then Q; P; therefore Q", "P or Q; not P; therefore Q"], "Without P, Q may still occur for another reason."],
      ["What is a straw man fallacy?", "Misrepresenting an opponent's position to refute it", ["Attacking a person instead of the argument", "Appealing to popularity", "Assuming the conclusion"], "It replaces the real claim with a weaker one."],
      ["What is an ad hominem fallacy?", "Attacking the person rather than the argument", ["Attacking a weakened version of the argument", "Appealing to expert opinion", "Drawing a false dilemma"], "The character of a speaker is irrelevant to a claim's truth."],
      ["What is an appeal to authority?", "Accepting a claim because a figure said it, without relevant expertise", ["Citing a relevant expert's evidence", "Testing a claim experimentally", "Refuting a claim with evidence"], "Authority supports a claim only when the expertise is relevant and evidence is offered."],
      ["What is an appeal to popularity?", "Treating widespread belief as proof of truth", ["Citing survey data as evidence", "Appealing to a relevant expert", "Refuting a claim with a counterexample"], "Popularity does not establish truth."],
      ["What is a false dilemma?", "Presenting two options when more exist", ["Choosing between two equal goods", "Refusing to choose", "Combining two arguments"], "The dilemma omits available alternatives."],
      ["What is a slippery slope fallacy?", "Claiming one step must lead to an extreme outcome without support", ["Predicting an outcome from evidence", "Rejecting a chain of reasoning", "Appealing to consequences"], "The causal chain is asserted rather than shown."],
      ["What is begging the question?", "Assuming the conclusion among the premises", ["Asking a rhetorical question", "Changing the subject", "Appealing to authority"], "The premise already contains the conclusion."],
      ["What is equivocation?", "Using one word in two different senses", ["Repeating a premise", "Using ambiguous pronouns", "Arguing in a circle"], "The argument's validity depends on the shift in meaning."],
      ["What is Occam's razor?", "Prefer the explanation with fewer assumptions", ["Prefer the newest explanation", "Prefer the most popular explanation", "Prefer the simplest conclusion to be true"], "It is a heuristic for theory choice, not proof."],
      ["What is empiricism?", "Knowledge derives from experience", ["Knowledge derives from reason alone", "Knowledge is innate only", "Knowledge is impossible"], "Locke and Hume treat experience as the source of ideas."],
      ["What is rationalism?", "Reason is the primary source of knowledge", ["Experience is the only source", "Custom explains belief", "All knowledge is relative"], "Descartes, Spinoza and Leibniz trusted reason."],
      ["What is a priori knowledge?", "Knowledge independent of experience", ["Knowledge from experiment", "Knowledge from testimony", "Knowledge from memory"], "Mathematical and logical truths are usually a priori."],
      ["What is a posteriori knowledge?", "Knowledge gained from experience", ["Knowledge independent of experience", "Knowledge from pure reason", "Knowledge that cannot be doubted"], "Empirical claims are a posteriori."],
      ["What does 'cogito, ergo sum' assert?", "Thinking proves the thinker exists", ["God guarantees knowledge", "The senses are reliable", "The mind is the brain"], "Descartes found one indubitable starting point."],
      ["What is dualism in philosophy of mind?", "Mind and body are distinct kinds of thing", ["Only matter exists", "Only minds exist", "Mind is identical to behaviour"], "Descartes held a substance dualism."],
      ["What is materialism in philosophy of mind?", "Mental states are physical states", ["Mind and body are separate substances", "Only minds exist", "Mind is an illusion with no physical basis"], "Materialism denies a separate mental substance."],
      ["What is the problem of induction?", "Past observations do not logically guarantee future ones", ["Induction is always invalid", "Experiments cannot be repeated", "Theories cannot be tested"], "Hume noted that induction needs an unproven uniformity assumption."],
      ["What is Hume's view of causation?", "We observe constant conjunction, not necessary connection", ["Causes are logically necessary", "Causes are known a priori", "Causation is an illusion with no regularity"], "Custom leads us to expect the effect."],
      ["What are Plato's Forms?", "Perfect, non-physical models that particular things imitate", ["Physical atoms", "Mental images", "Political constitutions"], "Particular things are imperfect instances of the Forms."],
      ["What is Aristotle's doctrine of the mean?", "Virtue lies between excess and deficiency", ["Virtue is maximising pleasure", "Virtue follows universal law", "Virtue is obeying the state"], "Courage sits between recklessness and cowardice."],
      ["What is eudaimonia for Aristotle?", "Human flourishing achieved through virtuous activity", ["Pleasure without limit", "Wealth and honour", "Freedom from all desire"], "Eudaimonia is the highest good."],
      ["What is the categorical imperative?", "Act only on maxims you could will as universal law", ["Maximise pleasure for the greatest number", "Seek the mean between extremes", "Obey the strongest power"], "Kant tests maxims for universalisability."],
      ["What is the principle of utility?", "Act to maximise overall happiness", ["Act only from duty", "Follow the golden mean", "Obey the sovereign"], "Bentham and Mill judge actions by their consequences."],
      ["What distinguishes act utilitarianism from rule utilitarianism?", "Act judges each action; rule judges general rules", ["Act ignores consequences", "Rule rejects happiness", "Act follows duty; rule follows consequences"], "Rule utilitarianism asks which rules maximise welfare."],
      ["What is deontological ethics?", "Morality is grounded in duties and rules", ["Morality is grounded only in outcomes", "Morality is grounded in character", "Morality is grounded in custom"], "Kantian ethics is the central example."],
      ["What is virtue ethics centred on?", "The character of the agent", ["The consequences of acts", "The rules followed", "The social contract"], "Aristotle asks what a good person would do."],
      ["What is care ethics?", "Moral life centres on relationships and responsiveness", ["Moral life centres on maximising utility", "Moral life centres on universal rules", "Moral life centres on self-interest"], "Gilligan and Noddings emphasise relational responsibility."],
      ["What is a social contract theory?", "Political authority derives from agreement among people", ["Authority derives from divine right", "Authority derives from force alone", "Authority derives from tradition alone"], "Hobbes, Locke and Rousseau argue from agreement."],
      ["What is the veil of ignorance used to justify?", "Fair principles of justice", ["Absolute monarchy", "Religious authority", "Free markets without rules"], "Rawls asks what principles people would choose without knowing their place."],
      ["What is existentialism's central claim?", "People create meaning through choices in an absurd world", ["Meaning is fixed by nature", "Reason alone determines ethics", "History follows laws"], "Sartre argues existence precedes essence."],
      ["What is determinism?", "Every event is necessitated by prior causes", ["Some events are uncaused", "Free will is impossible to discuss", "Only mental events cause action"], "Determinism challenges libertarian free will."],
      ["What is compatibilism?", "Free will is compatible with determinism", ["Free will requires indeterminism", "Freedom is an illusion", "Determinism is false"], "Compatibilists redefine freedom as acting on one's own desires."],
      ["What is stoicism's central advice?", "Focus on what is within your control", ["Maximise pleasure", "Avoid all relationships", "Pursue political power"], "Epictetus separates what is up to us from what is not."],
      ["What is the problem of evil?", "An omnipotent, good God would not permit evil", ["Evil does not exist", "God is not omnipotent", "Goodness requires evil"], "The argument challenges traditional theism."],
      ["What is pragmatism?", "Truth is tested by practical consequences", ["Truth is correspondence to Forms", "Truth is what authority declares", "Truth is unattainable"], "Peirce, James and Dewey focus on inquiry's practical results."],
      ["What is skepticism?", "Knowledge claims should be suspended where justification fails", ["Knowledge is impossible in every case", "All beliefs are equally true", "Only science gives knowledge"], "Skepticism demands adequate justification."]
    ]
  });
})();
