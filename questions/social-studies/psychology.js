/* ============================================================================
   QUESTIONAIRE — questions/social-studies/psychology.js
   ========================================================================== */

(function () {
  "use strict";

  window.QuestionairePools.register({
    id: "psychology",
    area: "social-studies",
    title: "Psychology",
    subjects: ["ap-psychology", "psychology"],
    facts: [
      ["What is classical conditioning?", "Learning by pairing a neutral stimulus with an unconditioned stimulus", ["Learning by consequences", "Learning by observation alone", "Learning by insight"], "Pavlov paired a bell with food."],
      ["What is operant conditioning?", "Learning shaped by reinforcement and punishment", ["Learning by pairing stimuli", "Learning without experience", "Learning by memory alone"], "Skinner studied consequences of behaviour."],
      ["What is negative reinforcement?", "Removing an unpleasant stimulus to increase a behaviour", ["Adding a punishment", "Removing a reward", "Punishing a response"], "Reinforcement always increases behaviour."],
      ["Which schedule produces the most persistent behaviour?", "Variable ratio", ["Fixed interval", "Fixed ratio", "Continuous reinforcement"], "Unpredictable rewards resist extinction."],
      ["What is working memory?", "A limited system that holds information briefly for use", ["Permanent storage of facts", "Procedural memory for skills", "Memory for personal events"], "Its capacity is small and short-lived."],
      ["What did Piaget argue about cognitive development?", "Children progress through stages of thinking", ["Development is entirely learned", "Children think like adults from birth", "Intelligence is fixed at birth"], "Stages include sensorimotor and concrete operational."],
      ["What is attachment in developmental psychology?", "An emotional bond between infant and caregiver", ["A learned reflex", "A type of conditioning", "A personality trait"], "Bowlby and Ainsworth studied attachment patterns."],
      ["What is a neurotransmitter?", "A chemical that carries signals across a synapse", ["An electrical impulse", "A hormone released into blood", "A structural protein"], "Dopamine and serotonin are examples."],
      ["What is the difference between sensation and perception?", "Sensation is detection; perception is interpretation", ["They are identical processes", "Perception happens first", "Sensation is learned"], "Perception organises sensory input."],
      ["What did Asch's line study demonstrate?", "Conformity to a group's incorrect judgement", ["Obedience to authority", "Bystander apathy", "Learned helplessness"], "Participants often agreed with a clearly wrong majority."],
      ["What did Milgram's study examine?", "Obedience to authority", ["Conformity to peers", "Memory span", "Attachment styles"], "Participants followed instructions to administer shocks."],
      ["What is the bystander effect?", "People are less likely to help when others are present", ["People help more in groups", "Groups make better decisions", "Helping is purely genetic"], "Diffusion of responsibility reduces intervention."],
      ["What is confirmation bias?", "Seeking information that supports existing beliefs", ["Remembering recent events better", "Judging people by first impressions", "Overestimating others' agreement"], "It skews evidence gathering."],
      ["What is the fundamental attribution error?", "Overweighting personality and underweighting situation for others", ["Overweighting situation for oneself", "Judging groups by stereotypes", "Remembering only vivid events"], "We explain others' behaviour by character."],
      ["What are the Big Five personality traits?", "Openness, conscientiousness, extraversion, agreeableness, neuroticism", ["Id, ego, superego, libido, thanatos", "Sanguine, choleric, melancholic, phlegmatic", "Verbal, logical, spatial, musical, social"], "The five-factor model is widely used."],
      ["What is the id in Freud's model?", "The instinctual drives seeking immediate satisfaction", ["The moral conscience", "The rational planner", "The social mask"], "The ego mediates between id and superego."],
      ["What is correlation?", "A statistical association between two variables", ["Proof that one variable causes another", "A controlled experiment", "A random sample"], "Correlation does not establish causation."],
      ["What is the difference between a cross-sectional and longitudinal study?", "Cross-sectional compares groups now; longitudinal follows the same people over time", ["Both follow the same people", "Both compare different ages once", "Neither measures change"], "Longitudinal designs track individual change."]
    ]
  });
})();
