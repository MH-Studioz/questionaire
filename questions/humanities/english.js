/* ============================================================================
   QUESTIONAIRE — questions/humanities/english.js
   Grammar, rhetoric and composition.
   ========================================================================== */

(function () {
  "use strict";

  window.QuestionairePools.register({
    id: "english",
    area: "humanities",
    title: "English language",
    subjects: ["english-language", "ap-english-language", "ap-seminar"],
    facts: [
      ["Which sentence uses the active voice?", "The committee approved the plan.", ["The plan was approved by the committee.", "The plan had been approved.", "The plan is being approved."], "In active voice the subject performs the action."],
      ["Which sentence is a fragment?", "Because the team revised the report.", ["The team revised the report.", "The report was revised.", "The team met after lunch."], "A fragment lacks an independent clause."],
      ["Which punctuation joins two independent clauses correctly?", "; however,", [", however,", " however,", "; however"], "Use a semicolon before the conjunctive adverb and a comma after it."],
      ["Which sentence uses commas correctly?", "She bought apples, pears, and figs.", ["She bought apples pears and figs.", "She bought, apples, pears, and figs.", "She bought apples, pears and, figs."], "Commas separate items in a series."],
      ["Which word is the subject of 'The list of names is long'?", "list", ["names", "long", "The"], "The head noun of the subject is 'list'."],
      ["Which pronoun correctly completes 'Between you and ___, the choice is difficult'?", "me", ["I", "myself", "mine"], "A pronoun after a preposition takes the object form."],
      ["Which sentence uses a semicolon correctly?", "The rain stopped; we continued the hike.", ["The rain stopped, we continued the hike.", "The rain stopped we continued the hike.", "The rain stopped, and we continued, the hike."], "A semicolon can join two independent clauses."],
      ["Which sentence is a run-on?", "The rain stopped we continued the hike.", ["The rain stopped; we continued the hike.", "The rain stopped, and we continued the hike.", "The rain stopped. We continued the hike."], "Two independent clauses need punctuation or a conjunction."],
      ["What is the purpose of a thesis statement?", "To state the central claim of an essay", ["To list every source", "To define every word", "To conclude the essay"], "A thesis guides the argument."],
      ["Which sentence avoids a dangling modifier?", "Walking to the station, Maya noticed the clouds.", ["Walking to the station, the clouds were noticed.", "Walking to the station, the rain began.", "Walking to the station, the train was missed."], "The opening phrase must describe the main clause's subject."],
      ["Which sentence uses parallel structure?", "The course teaches drafting, revising, and editing.", ["The course teaches drafting, revising, and to edit.", "The course teaches drafting, to revise, and editing.", "The course teaches to draft, revising, and editing."], "Items in a list should share grammatical form."],
      ["Which sentence uses a colon correctly?", "She packed three things: a notebook, a pen, and a ruler.", ["She packed three things; a notebook, a pen, and a ruler.", "She packed three things, a notebook, a pen, and a ruler.", "She packed: three things a notebook, a pen, and a ruler."], "A colon introduces a list after a complete clause."],
      ["What is tone?", "The author's attitude toward the subject", ["The length of a sentence", "The number of paragraphs", "The source's publication date"], "Tone is conveyed through word choice and detail."],
      ["What does the rhetorical situation include?", "Speaker, audience, purpose, context and message", ["Plot, setting, rhyme and meter", "Thesis, evidence and citation", "Subject, predicate and object"], "It frames why and how a text persuades."],
      ["What is a concession in an argument?", "Acknowledging a valid opposing point before answering it", ["Repeating the thesis in the conclusion", "Removing evidence that weakens the claim", "Changing the topic"], "Concessions build credibility."],
      ["What is a syllogism?", "A deductive argument with two premises and a conclusion", ["A rhetorical question", "A type of metaphor", "A paragraph structure"], "Aristotle described its form."],
      ["What is anaphora?", "Repetition of a word or phrase at the start of successive clauses", ["Repetition at the end of clauses", "A deliberate understatement", "An implied comparison"], "It creates rhythm and emphasis."],
      ["What is a metaphor?", "An implied comparison without 'like' or 'as'", ["A comparison using 'like' or 'as'", "An exaggeration for effect", "A contradiction in terms"], "Metaphors state one thing is another."],
      ["What is dramatic irony in a text?", "The audience knows more than a character does", ["A character says the opposite of what they mean", "An exaggerated claim", "A repeated image"], "The gap creates tension."]
    ]
  });
})();
