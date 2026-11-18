/* ============================================================================
   QUESTIONAIRE — expanded-humanities.js
   History, philosophy, literature, linguistics and social sciences.
   ========================================================================== */

(function () {
  "use strict";

  const add = window.QuestionaireExpanded && window.QuestionaireExpanded.add;
  if (!add) return;

  add("humanities", [
    ["european-history", "European History", "Intermediate", "Political, social and cultural change in Europe.", ["Reformation", "Enlightenment", "French Revolution", "industrialisation", "European integration"]],
    ["us-history", "US History", "Intermediate", "Colonial origins, the American state and social change.", ["Constitution", "Civil War", "Reconstruction", "civil rights", "American presidency"]],
    ["ancient-history", "Ancient History", "Intermediate", "Mesopotamia, Greece, Rome and the ancient Mediterranean.", ["city-states", "Roman Republic", "empires", "primary sources", "classical civilisation"]],
    ["medieval-history", "Medieval History", "Intermediate", "Feudalism, religion, trade and medieval states.", ["feudalism", "manorialism", "Crusades", "medieval Church", "trade routes"]],
    ["modern-history", "Modern History", "Intermediate", "Revolution, empire, world war and the contemporary order.", ["nationalism", "imperialism", "world wars", "Cold War", "decolonisation"]],
    ["historiography", "Historiography", "Advanced", "Historical methods, interpretation and the history of history.", ["primary sources", "historical method", "interpretation", "bias", "schools of history"]],
    ["archaeology", "Archaeology", "Intermediate", "Material remains, excavation, dating and past lifeways.", ["excavation", "stratigraphy", "artefacts", "radiocarbon dating", "context"]],
    ["classics", "Classics & Classical Civilization", "Advanced", "Greek and Roman texts, language, history and reception.", ["Greek texts", "Latin texts", "classical reception", "mythology", "ancient philosophy"]],
    ["ethics-aesthetics", "Ethics & Aesthetics", "Advanced", "Moral theory, value, beauty and artistic judgement.", ["normative ethics", "virtue ethics", "utilitarianism", "beauty", "taste"]],
    ["epistemology-metaphysics", "Epistemology & Metaphysics", "Advanced", "Knowledge, justification, existence and reality.", ["knowledge", "justification", "scepticism", "causation", "ontology"]],
    ["political-philosophy", "Political Philosophy", "Advanced", "Justice, authority, liberty and the justification of the state.", ["justice", "legitimacy", "liberty", "social contract", "equality"]],
    ["philosophy-of-science-mind", "Philosophy of Science & Mind", "Advanced", "Scientific method, explanation, consciousness and mental states.", ["falsification", "paradigms", "consciousness", "intentionality", "reductionism"]],
    ["religious-studies", "Religious Studies", "Intermediate", "Belief, practice, sacred texts and comparative religion.", ["sacred texts", "ritual", "myth", "ethics", "comparative religion"]],
    ["theology-comparative-religion", "Theology & Comparative Religion", "Advanced", "Doctrine, interpretation and comparison across traditions.", ["doctrine", "hermeneutics", "monotheism", "religious experience", "interfaith comparison"]],
    ["world-comparative-literature", "World & Comparative Literature", "Advanced", "Literature across languages, cultures and traditions.", ["comparative reading", "translation", "world literature", "genre", "postcolonial literature"]],
    ["literary-theory-criticism", "Literary Theory & Criticism", "Advanced", "Critical schools, interpretation and the analysis of texts.", ["formalism", "structuralism", "post-structuralism", "psychoanalytic criticism", "reader response"]],
    ["rhetoric-composition", "Rhetoric & Composition", "Intermediate", "Argument, audience, style and the craft of prose.", ["ethos", "pathos", "logos", "argument", "revision"]],
    ["linguistics", "Linguistics", "Intermediate", "Language structure, sound, meaning and use.", ["phonology", "morphology", "syntax", "semantics", "pragmatics"]],
    ["phonetics-phonology", "Phonetics & Phonology", "Advanced", "Speech sounds, features, syllables and sound systems.", ["IPA", "articulation", "phonemes", "allophones", "sound change"]],
    ["morphology-syntax", "Morphology & Syntax", "Advanced", "Word structure, phrase structure and grammatical relations.", ["morphemes", "inflection", "phrase structure", "constituency", "agreement"]],
    ["semantics-pragmatics", "Semantics & Pragmatics", "Advanced", "Meaning, reference, implicature and context.", ["reference", "truth conditions", "implicature", "speech acts", "presupposition"]],
    ["sociolinguistics-psycholinguistics", "Sociolinguistics & Psycholinguistics", "Advanced", "Language in society and the mind.", ["dialect", "code-switching", "language acquisition", "language attitudes", "processing"]],
    ["latin-ancient-greek", "Latin & Ancient Greek", "Advanced", "Classical languages, grammar, translation and reading.", ["Latin grammar", "Greek grammar", "translation", "case system", "classical prose"]]
  ]);

  add("social-sciences", [
    ["criminology", "Sociology & Criminology", "Intermediate", "Crime, deviance, social control and justice.", ["crime", "deviance", "social control", "punishment", "victimology"]],
    ["anthropology", "Anthropology", "Intermediate", "Culture, human variation, language and ethnographic method.", ["ethnography", "cultural relativism", "kinship", "ritual", "human variation"]],
    ["microeconomics", "Microeconomics", "Intermediate", "Households, firms, markets and strategic choice.", ["supply and demand", "elasticity", "market structures", "utility", "market failure"]],
    ["macroeconomics", "Macroeconomics", "Intermediate", "Growth, inflation, unemployment and macroeconomic policy.", ["GDP", "inflation", "unemployment", "fiscal policy", "monetary policy"]],
    ["econometrics", "Econometrics", "Advanced", "Statistical estimation of economic relationships.", ["regression", "endogeneity", "instrumental variables", "panel data", "causal inference"]],
    ["behavioral-economics", "Behavioral & Development Economics", "Advanced", "Bounded rationality, incentives and development policy.", ["heuristics", "biases", "nudges", "poverty traps", "field experiments"]],
    ["finance-accounting", "Finance & Accounting", "Intermediate", "Financial statements, valuation, risk and capital.", ["balance sheet", "cash flow", "valuation", "risk", "capital budgeting"]],
    ["business-administration", "Business Administration & Management", "Intermediate", "Strategy, operations, organisations and leadership.", ["strategy", "operations", "organisational behaviour", "leadership", "competitive advantage"]],
    ["marketing-entrepreneurship", "Marketing & Entrepreneurship", "Intermediate", "Customers, markets, brands and new ventures.", ["segmentation", "value proposition", "brand", "market research", "startup"]],
    ["international-relations", "Political Science & International Relations", "Advanced", "Power, diplomacy, institutions and global order.", ["sovereignty", "diplomacy", "international institutions", "balance of power", "global governance"]],
    ["comparative-politics", "Comparative Politics & Public Policy", "Advanced", "Political systems, institutions and policy outcomes.", ["electoral systems", "executives", "federalism", "policy analysis", "comparative method"]],
    ["public-policy", "Public Policy", "Advanced", "Agenda setting, policy design, implementation and evaluation.", ["agenda setting", "policy instruments", "implementation", "evaluation", "stakeholders"]],
    ["law", "Law", "Advanced", "Legal reasoning, constitutional, criminal and international law.", ["legal reasoning", "precedent", "constitution", "criminal law", "international law"]],
    ["human-geography", "Human Geography", "Intermediate", "Population, cities, economy and spatial inequality.", ["population", "urbanisation", "migration", "economic geography", "place"]],
    ["physical-geography", "Physical Geography", "Intermediate", "Climate, landforms, biomes and environmental systems.", ["climate", "landforms", "biomes", "hydrology", "soils"]],
    ["urban-planning-demography", "Urban Planning & Demography", "Advanced", "Cities, land use, housing and population change.", ["land use", "zoning", "housing", "population change", "transport planning"]],
    ["gender-studies", "Gender & Cultural Studies", "Advanced", "Gender, identity, power and cultural representation.", ["gender", "intersectionality", "representation", "identity", "power"]],
    ["cultural-studies", "Cultural Studies", "Advanced", "Culture, media, ideology and everyday meaning.", ["culture", "ideology", "popular culture", "representation", "subculture"]],
    ["communication-studies", "Communication Studies", "Intermediate", "Messages, audiences, media and persuasive communication.", ["audience", "message", "media effects", "persuasion", "public speaking"]],
    ["education-pedagogy", "Education & Pedagogy", "Intermediate", "Learning theory, curriculum, assessment and teaching.", ["curriculum", "assessment", "learning theory", "differentiation", "feedback"]],
    ["developmental-psychology", "Developmental Psychology", "Advanced", "Change across the lifespan, attachment and cognitive growth.", ["attachment", "Piaget", "lifespan", "socialisation", "development"]],
    ["cognitive-psychology", "Cognitive Psychology", "Advanced", "Attention, memory, language, reasoning and decision.", ["working memory", "attention", "language", "problem solving", "heuristics"]],
    ["social-psychology", "Social Psychology", "Advanced", "Groups, attitudes, conformity and social influence.", ["conformity", "attitudes", "group identity", "obedience", "persuasion"]],
    ["clinical-psychology", "Clinical Psychology", "Advanced", "Assessment, formulation, therapy and psychopathology.", ["assessment", "formulation", "CBT", "diagnosis", "therapeutic alliance"]]
  ]);
})();
