/* ============================================================================
   QUESTIONAIRE — new-subjects.js
   ----------------------------------------------------------------------------
   Additional subjects added for the expanded catalogue. Each one starts with
   two curated anchor questions, two study cards and three tips. The lazy bank
   builder in subject-banks.js fills it to 1,000 practice questions.
   ========================================================================== */

(function () {
  "use strict";

  const DATA = window.STUDY_DATA;
  if (!DATA || !Array.isArray(DATA.categories)) return;

  function q(id, prompt, correct, wrongs, hint, explanation, tags, difficulty) {
    return {
      id: id,
      difficulty: difficulty || "Intermediate",
      tags: tags,
      prompt: prompt,
      options: [correct].concat(wrongs),
      answer: 0,
      hint: hint,
      explanation: explanation
    };
  }

  function study(id, title, icon, summary, points) {
    return { id: id, title: title, icon: icon, summary: summary, points: points };
  }

  function tip(title, icon, body) {
    return { title: title, icon: icon, body: body };
  }

  function subject(categoryId, spec) {
    const category = DATA.categories.find(function (item) { return item.id === categoryId; });
    if (!category) return;
    category.subjects.push({
      id: spec.id,
      title: spec.title,
      icon: spec.icon,
      accent: spec.accent,
      level: spec.level,
      blurb: spec.blurb,
      tags: spec.tags,
      trackLabel: "New for 2026-27",
      questions: spec.questions,
      study: spec.study,
      mistakes: spec.mistakes,
      tips: spec.tips,
      videos: []
    });
  }

  /* --------------------------------------------------------------------------
     Mathematics
     -------------------------------------------------------------------------- */

  subject("mathematics", {
    id: "geometry",
    title: "Geometry",
    icon: "shapes",
    accent: "indigo",
    level: "Beginner",
    blurb: "Angles, polygons, circles and coordinate geometry — the visual side of mathematics.",
    tags: ["geometry", "angles", "polygons", "circles", "area", "volume", "coordinates"],
    questions: [
      q("geometry-1", "What is the sum of the interior angles of a triangle?", "180°", ["90°", "270°", "360°"], "Every triangle can be split by a line parallel to one side, producing a straight angle.", ["The three interior angles form a straight angle.", "A straight angle measures 180°."], ["angles", "triangles"]),
      q("geometry-2", "What is the area of a circle with radius 3?", "9π", ["3π", "6π", "18π"], "Area is πr², not 2πr.", ["Square the radius: 3² = 9.", "Multiply by π: 9π."], ["circles", "area"])
    ],
    study: [
      study("geometry-s1", "Angles & Polygons", "triangle", "Interior angles, exterior angles and the formulas that connect them.", ["A triangle's interior angles sum to 180°.", "A quadrilateral's interior angles sum to 360°.", "For an n-gon, the interior sum is (n - 2) × 180°.", "An exterior angle of a triangle equals the sum of the two opposite interior angles."]),
      study("geometry-s2", "Circles & Area", "circle", "Radius, diameter, circumference and area are four views of the same shape.", ["Diameter = 2r.", "Circumference = 2πr.", "Area = πr².", "A sector's area is (central angle / 360) × πr²."])
    ],
    mistakes: ["Using the diameter where the formula calls for the radius.", "Confusing circumference with area.", "Assuming every quadrilateral has 360° of exterior angle.", "Forgetting square units in an area answer."],
    tips: [
      tip("Draw Before You Solve", "pencil-line", "Sketch the figure, label every known length and angle, and mark the quantity the question asks for. A clear diagram removes most geometry errors."),
      tip("Name the Formula", "sigma", "Before calculating, say the formula aloud or write it down. Most mistakes are formula-selection mistakes, not arithmetic mistakes."),
      tip("Check the Units", "ruler", "Area is square units and volume is cubic units. If the answer choices mix units, eliminate by dimension before doing the math.")
    ]
  });

  subject("mathematics", {
    id: "trigonometry",
    title: "Trigonometry",
    icon: "triangle",
    accent: "teal",
    level: "Intermediate",
    blurb: "Sine, cosine, tangent, identities and the unit circle, from right triangles to waves.",
    tags: ["trigonometry", "sine", "cosine", "tangent", "unit circle", "identities", "waves"],
    questions: [
      q("trig-1", "What is sin 30°?", "1/2", ["√3/2", "1", "1/√2"], "Use the 30-60-90 triangle: the side opposite 30° is half the hypotenuse.", ["In a 30-60-90 triangle the short leg is half the hypotenuse.", "sin = opposite / hypotenuse = 1/2."], ["sine", "special angles"]),
      q("trig-2", "Which identity is always true?", "sin²θ + cos²θ = 1", ["sinθ + cosθ = 1", "tanθ = sinθ cosθ", "sin²θ - cos²θ = 1"], "This is the Pythagorean identity from the unit circle.", ["On the unit circle, (cosθ, sinθ) lies on x² + y² = 1.", "Substitute to get cos²θ + sin²θ = 1."], ["identities", "unit circle"])
    ],
    study: [
      study("trig-s1", "The Unit Circle", "circle", "The unit circle turns angles into coordinates and makes signs predictable.", ["A point at angle θ has coordinates (cosθ, sinθ).", "Quadrant I is (+, +), II is (-, +), III is (-, -), IV is (+, -).", "Sine is the y-coordinate; cosine is the x-coordinate.", "Tangent is sinθ / cosθ."]),
      study("trig-s2", "Right-Triangle Ratios", "triangle", "SOH-CAH-TOA still works whenever the triangle has a right angle.", ["sinθ = opposite / hypotenuse.", "cosθ = adjacent / hypotenuse.", "tanθ = opposite / adjacent.", "The inverse functions recover an angle from a ratio."])
    ],
    mistakes: ["Mixing up opposite and adjacent sides.", "Forgetting that tangent is undefined at 90°.", "Using degrees and radians interchangeably.", "Assuming sin²θ means sin(θ²)."],
    tips: [
      tip("Sketch the Triangle", "pencil-line", "Label the angle, the opposite side, the adjacent side and the hypotenuse before choosing a ratio."),
      tip("Check the Quadrant", "compass", "The sign of sine and cosine depends on the quadrant. A calculator answer alone may be incomplete."),
      tip("Memorize the Core Trio", "layers", "Know sin²θ + cos²θ = 1, tanθ = sinθ/cosθ, and the two Pythagorean variants. Most identities follow from them.")
    ]
  });

  subject("mathematics", {
    id: "linear-algebra",
    title: "Linear Algebra",
    icon: "grid-3x3",
    accent: "violet",
    level: "Advanced",
    blurb: "Vectors, matrices, transformations and the algebra behind systems of equations.",
    tags: ["linear algebra", "vectors", "matrices", "determinants", "eigenvalues", "transformations"],
    questions: [
      q("lin-1", "What is the identity matrix multiplied by any compatible matrix A?", "A", ["0", "2A", "A transpose"], "The identity matrix leaves a matrix unchanged under multiplication.", ["I has 1s on the diagonal and 0s elsewhere.", "IA = A and AI = A."], ["matrices", "identity"]),
      q("lin-2", "What is the dot product of (1, 2) and (3, 4)?", "11", ["7", "10", "14"], "Multiply matching components and add.", ["1 × 3 = 3.", "2 × 4 = 8.", "3 + 8 = 11."], ["vectors", "dot product"])
    ],
    study: [
      study("lin-s1", "Vectors & Dot Products", "arrow-up-right", "A vector carries direction and magnitude; the dot product measures alignment.", ["The dot product of (a, b) and (c, d) is ac + bd.", "A zero dot product means the vectors are perpendicular.", "The magnitude of (a, b) is √(a² + b²).", "The dot product is commutative."]),
      study("lin-s2", "Matrices as Transformations", "grid-3x3", "A matrix is a function that maps vectors to vectors.", ["Matrix multiplication is associative but not commutative.", "The determinant measures area or volume scaling.", "A zero determinant means the transformation collapses dimension.", "The identity matrix leaves every vector unchanged."])
    ],
    mistakes: ["Multiplying matrices in the wrong order.", "Adding matrices of different dimensions.", "Forgetting that AB is not usually BA.", "Treating a determinant as a vector."],
    tips: [
      tip("Track Dimensions", "ruler", "Write the dimensions beside every matrix. If the inner dimensions do not match, the product is undefined."),
      tip("Test with Simple Vectors", "flask-conical", "Plug in (1, 0) and (0, 1) to see what a transformation does to the axes."),
      tip("Connect Geometry", "shapes", "Determinants, eigenvectors and dot products all have geometric meanings. Pictures make the algebra stick.")
    ]
  });

  subject("mathematics", {
    id: "data-science",
    title: "Data Science",
    icon: "bar-chart-3",
    accent: "sky",
    level: "Intermediate",
    blurb: "Descriptive statistics, data cleaning, visualisation and the difference between signal and noise.",
    tags: ["data science", "statistics", "data visualization", "bias", "sampling", "correlation"],
    questions: [
      q("data-1", "Which measure is most resistant to extreme outliers?", "Median", ["Mean", "Range", "Standard deviation"], "The median depends on position, not the size of every value.", ["Sort the values and take the middle one.", "A single huge value does not move the median much."], ["statistics", "outliers"]),
      q("data-2", "What does correlation not establish?", "Causation", ["Association", "A linear pattern", "A relationship between variables"], "Two variables can move together because a third variable drives both.", ["Correlation measures association.", "Only a controlled design can support a causal claim."], ["correlation", "causation"])
    ],
    study: [
      study("data-s1", "Describe Before You Model", "chart-no-axes-combined", "Distributions, center, spread and outliers tell you what a model should expect.", ["Mean and median describe center.", "Range and standard deviation describe spread.", "Skewness means the mean is pulled toward a tail.", "Always plot before choosing a summary."]),
      study("data-s2", "Sampling & Bias", "users", "A model is only as good as the data-generating process behind it.", ["A random sample reduces selection bias.", "Survivorship bias hides the cases that did not make it into the data.", "Convenience samples rarely represent a population.", "Missing data can bias every summary."])
    ],
    mistakes: ["Reporting a mean for a heavily skewed distribution.", "Treating correlation as causation.", "Ignoring missing values.", "Choosing a chart that hides the spread."],
    tips: [
      tip("Plot First", "chart-no-axes-combined", "Make a histogram and a scatter plot before calculating a single summary. Patterns that formulas miss become obvious."),
      tip("Ask Who Is Missing", "users", "For every dataset, ask who or what is absent. Missing groups are often the most important finding."),
      tip("Separate Exploration from Confirmation", "split", "Explore freely, then test your conclusion on a held-out sample. This reduces the chance of fooling yourself.")
    ]
  });

  /* --------------------------------------------------------------------------
     Sciences
     -------------------------------------------------------------------------- */

  subject("sciences", {
    id: "anatomy-physiology",
    title: "Anatomy & Physiology",
    icon: "heart-pulse",
    accent: "rose",
    level: "Intermediate",
    blurb: "How the body is built and how its systems keep the internal environment stable.",
    tags: ["anatomy", "physiology", "organ systems", "homeostasis", "circulation", "respiration"],
    questions: [
      q("anatomy-1", "Where does gas exchange primarily occur in the lungs?", "Alveoli", ["Bronchi", "Trachea", "Pleura"], "The alveoli are tiny air sacs surrounded by capillaries.", ["Bronchi conduct air.", "Alveoli provide the thin surface for diffusion."], ["respiratory system", "alveoli"]),
      q("anatomy-2", "Which chamber pumps oxygenated blood to the body?", "Left ventricle", ["Right ventricle", "Left atrium", "Right atrium"], "The left ventricle has the thickest wall and drives systemic circulation.", ["The right side sends blood to the lungs.", "The left ventricle sends blood through the aorta."], ["circulation", "heart"])
    ],
    study: [
      study("anatomy-s1", "Homeostasis", "activity", "Physiology is the study of how the body keeps conditions within workable limits.", ["Negative feedback reverses a deviation.", "Positive feedback amplifies a change until an endpoint.", "The nervous and endocrine systems coordinate most feedback.", "Failure of homeostasis is a common route to disease."]),
      study("anatomy-s2", "Systems in Sequence", "layers", "Organ systems rarely work alone: respiration, circulation and metabolism are linked.", ["The respiratory system brings oxygen in and removes carbon dioxide.", "The circulatory system transports gases, nutrients and wastes.", "The kidneys regulate water, pH and electrolytes.", "The liver processes nutrients and detoxifies blood."])
    ],
    mistakes: ["Mixing up the left and right sides of the heart.", "Thinking alveoli are muscles.", "Treating homeostasis as a fixed constant rather than a range.", "Forgetting that diffusion drives gas exchange."],
    tips: [
      tip("Trace the Path", "arrow-right", "Follow a red blood cell from the vena cava through the heart, lungs and aorta. The sequence explains most circulation questions."),
      tip("Use the Feedback Loop", "repeat-2", "For every hormone or reflex, identify the sensor, control center and effector. The loop makes the answer predictable."),
      tip("Draw the Membrane", "pencil-line", "Sketch a capillary and alveolus together. The thin barrier is easier to remember as a picture.")
    ]
  });

  subject("sciences", {
    id: "microbiology",
    title: "Microbiology",
    icon: "microscope",
    accent: "emerald",
    level: "Intermediate",
    blurb: "Bacteria, viruses, fungi and the immune battles that shape health and ecosystems.",
    tags: ["microbiology", "bacteria", "viruses", "fungi", "immune system", "antibiotics"],
    questions: [
      q("micro-1", "Which statement best distinguishes bacteria from viruses?", "Bacteria are living cells; viruses require a host to replicate.", ["Bacteria are always harmful; viruses are always harmless.", "Viruses are larger than bacteria.", "Bacteria cannot reproduce."], "Viruses lack the machinery to reproduce on their own.", ["Bacteria have cells and metabolism.", "Viruses use host cells to copy themselves."], ["bacteria", "viruses"]),
      q("micro-2", "Why do antibiotics not treat viral infections?", "Antibiotics target bacterial structures that viruses lack.", ["Viruses are too large for antibiotics.", "Antibiotics only work on fungi.", "Viruses have no genetic material."], "Antibiotics act on bacterial cell walls, ribosomes or pathways.", ["Viruses are not cells.", "A drug that targets bacterial ribosomes has nothing to attack in a virus."], ["antibiotics", "viruses"])
    ],
    study: [
      study("micro-s1", "The Microbial Cast", "microscope", "Bacteria, archaea, fungi, protists and viruses differ in structure and replication.", ["Bacteria are prokaryotes with no membrane-bound nucleus.", "Fungi are eukaryotes and often grow as filaments.", "Viruses are obligate intracellular parasites.", "Archaea often live in extreme environments."]),
      study("micro-s2", "Antibiotic Resistance", "shield-alert", "Resistance evolves when susceptible bacteria die and resistant variants survive.", ["Resistance can arise from mutation or horizontal gene transfer.", "Finishing a prescribed course reduces the chance of relapse.", "Antibiotic use in agriculture contributes to resistance.", "Resistance is a population phenomenon, not a personal one."])
    ],
    mistakes: ["Calling viruses bacteria.", "Assuming antibiotics are harmless.", "Forgetting that not all bacteria cause disease.", "Treating resistance as something a single person develops."],
    tips: [
      tip("Compare Structures", "columns-2", "Make a three-column table for bacteria, viruses and fungi: nucleus, replication, treatment. Most questions reduce to that table."),
      tip("Follow the Dose", "pill", "Antibiotic questions often turn on concentration, duration and target. Ask whether the drug reaches the infection and whether the pathogen has the target."),
      tip("Think in Populations", "users", "Resistance is selection acting on a population. A few resistant cells can dominate after treatment.")
    ]
  });

  subject("sciences", {
    id: "environmental-science",
    title: "Environmental Science",
    icon: "leaf",
    accent: "emerald",
    level: "Intermediate",
    blurb: "Ecosystems, energy, pollution and the human systems that depend on them.",
    tags: ["environmental science", "ecology", "climate", "biodiversity", "pollution", "sustainability"],
    questions: [
      q("env-1", "Which source of energy is renewable?", "Solar", ["Coal", "Natural gas", "Petroleum"], "Renewable sources are replenished on human timescales.", ["Sunlight is continuously available.", "Coal, gas and oil are finite fossil fuels."], ["energy", "renewables"]),
      q("env-2", "What is biodiversity?", "The variety of life in an area", ["The total number of rocks", "The average temperature", "The depth of the ocean"], "Biodiversity includes species, genetic and ecosystem variety.", ["It is not a single count.", "Variety at several levels makes ecosystems resilient."], ["biodiversity", "ecology"])
    ],
    study: [
      study("env-s1", "Energy Flow", "sun", "Energy enters most ecosystems as sunlight and moves through food webs.", ["Producers capture light energy.", "Consumers transfer energy with loss at each trophic level.", "Decomposers recycle nutrients.", "Only a fraction of energy reaches top predators."]),
      study("env-s2", "Human Impact", "factory", "Pollution, land use and climate change alter ecosystems at every scale.", ["Burning fossil fuels adds carbon dioxide to the atmosphere.", "Habitat fragmentation reduces gene flow.", "Eutrophication follows nutrient runoff.", "Sustainable systems keep resource use within renewal rates."])
    ],
    mistakes: ["Confusing weather with climate.", "Assuming all renewable energy is harmless.", "Ignoring energy loss between trophic levels.", "Treating biodiversity as only the number of species."],
    tips: [
      tip("Follow the Energy", "sun", "Trace energy from the sun to producers to consumers. Questions about biomass and trophic levels usually follow the same path."),
      tip("Separate Local and Global", "globe", "A local pollution problem and a global climate problem have different scales, feedbacks and solutions."),
      tip("Use the Carbon Cycle", "repeat-2", "Most climate questions are carbon-cycle questions. Identify the source, sink and timescale.")
    ]
  });

  /* --------------------------------------------------------------------------
     Humanities
     -------------------------------------------------------------------------- */

  subject("humanities", {
    id: "philosophy",
    title: "Philosophy",
    icon: "scale",
    accent: "amber",
    level: "Advanced",
    blurb: "Arguments, ethics, knowledge and the questions that resist a quick answer.",
    tags: ["philosophy", "ethics", "logic", "epistemology", "metaphysics", "arguments"],
    questions: [
      q("phil-1", "What makes an argument valid?", "The conclusion follows necessarily from the premises", ["The premises are popular", "The conclusion is true", "The speaker is an expert"], "Validity is about structure, not the actual truth of the premises.", ["A valid argument cannot have true premises and a false conclusion.", "Truth and validity are different questions."], ["logic", "validity"]),
      q("phil-2", "Which ethical theory focuses on maximizing overall happiness?", "Utilitarianism", ["Deontology", "Virtue ethics", "Divine command theory"], "Utilitarianism evaluates actions by their consequences for total welfare.", ["It is a consequentialist theory.", "It asks which action produces the greatest good."], ["ethics", "utilitarianism"])
    ],
    study: [
      study("phil-s1", "Arguments & Validity", "scale", "An argument is a set of premises offered in support of a conclusion.", ["Deductive arguments aim at certainty.", "Inductive arguments aim at probability.", "Validity concerns form; soundness adds true premises.", "A counterexample can show an argument form is invalid."]),
      study("phil-s2", "Ethical Frameworks", "compass", "Consequentialist, deontological and virtue approaches answer different questions.", ["Consequentialism focuses on outcomes.", "Deontology focuses on duties and rules.", "Virtue ethics focuses on character.", "Each framework can criticize the blind spots of the others."])
    ],
    mistakes: ["Confusing validity with truth.", "Attacking a person instead of an argument.", "Assuming one ethical theory answers every question.", "Treating a strong feeling as a proof."],
    tips: [
      tip("Map the Argument", "list-tree", "Write premises and conclusion on separate lines. Missing links become obvious."),
      tip("Steelman First", "shield", "State the strongest version of the view you disagree with before criticizing it. It sharpens your own argument."),
      tip("Name the Framework", "tags", "Decide whether a question is about consequences, duties or character. The framework narrows the answer.")
    ]
  });

  subject("humanities", {
    id: "psychology",
    title: "Psychology",
    icon: "brain",
    accent: "violet",
    level: "Intermediate",
    blurb: "Learning, memory, development, social behaviour and the methods behind the claims.",
    tags: ["psychology", "memory", "learning", "development", "social psychology", "research"],
    questions: [
      q("psych-1", "In classical conditioning, what is a neutral stimulus that comes to elicit a response called?", "Conditioned stimulus", ["Unconditioned stimulus", "Reinforcer", "Operant response"], "After pairing, the neutral stimulus acquires meaning.", ["Food naturally elicits salivation (unconditioned).", "A bell paired with food becomes the conditioned stimulus."], ["classical conditioning", "learning"]),
      q("psych-2", "Which memory store holds a small amount of information briefly while it is used?", "Working memory", ["Long-term memory", "Procedural memory", "Implicit memory"], "Working memory is the active workspace for current tasks.", ["It is limited in capacity.", "It supports reasoning and comprehension."], ["memory", "working memory"])
    ],
    study: [
      study("psych-s1", "Learning", "repeat-2", "Classical and operant conditioning describe different routes to learned behaviour.", ["Classical conditioning pairs stimuli.", "Operant conditioning shapes behaviour through consequences.", "Reinforcement increases behaviour; punishment decreases it.", "Extinction weakens a learned response when reinforcement stops."]),
      study("psych-s2", "Memory", "brain", "Encoding, storage and retrieval are separate stages, and each can fail.", ["Working memory is limited and active.", "Long-term memory has a very large capacity.", "Retrieval cues improve recall.", "Reconsolidation can alter a memory after retrieval."])
    ],
    mistakes: ["Calling every change in behaviour learning.", "Confusing negative reinforcement with punishment.", "Assuming correlation proves causation.", "Treating memory as a video recording."],
    tips: [
      tip("Use the Three Stages", "layers", "For any memory question, ask whether the problem is encoding, storage or retrieval. The stage narrows the answer."),
      tip("Distinguish Reinforcement", "plus-circle", "Reinforcement increases a behaviour, even when it removes something unpleasant. Punishment decreases it."),
      tip("Check the Method", "clipboard-check", "Before accepting a psychology claim, identify the design: experiment, correlation, case study or survey.")
    ]
  });

  subject("humanities", {
    id: "applied-economics",
    title: "Applied Economics",
    icon: "trending-up",
    accent: "amber",
    level: "Intermediate",
    blurb: "Scarcity, markets, incentives, macro policy and the trade-offs behind every choice.",
    tags: ["economics", "microeconomics", "macroeconomics", "supply", "demand", "inflation"],
    questions: [
      q("applied-econ-1", "What is opportunity cost?", "The value of the next best alternative given up", ["The money paid in taxes", "The total cost of production", "The price of a stock"], "Every choice has a forgone alternative.", ["It is about what you give up.", "It includes non-monetary alternatives."], ["opportunity cost", "scarcity"]),
      q("applied-econ-2", "What usually happens to price when demand rises and supply is fixed?", "Price rises", ["Price falls", "Price stays exactly the same", "Price becomes zero"], "Buyers compete for a limited quantity.", ["Demand shifts right.", "At the old price there is a shortage, which pushes price up."], ["supply and demand", "price"])
    ],
    study: [
      study("applied-econ-s1", "Markets", "trending-up", "Prices coordinate choices by transmitting information about scarcity.", ["Demand curves slope downward.", "Supply curves usually slope upward.", "Equilibrium is where quantity demanded equals quantity supplied.", "A price ceiling below equilibrium creates a shortage."]),
      study("applied-econ-s2", "Macro Policy", "landmark", "Fiscal and monetary policy affect growth, employment and inflation with lags.", ["Fiscal policy uses taxes and spending.", "Monetary policy uses interest rates and money supply.", "Inflation reduces purchasing power.", "Policy trade-offs often involve short-run versus long-run effects."])
    ],
    mistakes: ["Confusing a change in demand with a change in quantity demanded.", "Treating opportunity cost as only money.", "Assuming correlation proves causation.", "Ignoring lags in policy."],
    tips: [
      tip("Shift vs Move", "arrows-left-right", "A change in price moves along the curve; a change in a determinant shifts the curve. Label which one the question describes."),
      tip("Name the Trade-off", "scale", "Every policy choice has a cost. Write both sides before choosing an answer."),
      tip("Draw the Graph", "chart-no-axes-combined", "A quick supply-and-demand sketch often answers the question faster than a paragraph.")
    ]
  });

  subject("humanities", {
    id: "sociology",
    title: "Sociology",
    icon: "users",
    accent: "rose",
    level: "Intermediate",
    blurb: "Socialization, institutions, inequality and the patterns that shape group life.",
    tags: ["sociology", "socialization", "institutions", "inequality", "culture", "groups"],
    questions: [
      q("soc-1", "What is socialization?", "The process of learning the norms and values of a society", ["The study of rocks", "A type of economic policy", "A biological reflex"], "Socialization turns newcomers into participating members of a society.", ["It happens through family, school, peers and media.", "It continues throughout life."], ["socialization", "culture"]),
      q("soc-2", "Which is an example of a social institution?", "Public education", ["A single friendship", "A thunderstorm", "A DNA sequence"], "Institutions are enduring patterns of social organization.", ["They organize repeated activities.", "Schools, governments and families are institutions."], ["institutions", "society"])
    ],
    study: [
      study("soc-s1", "Socialization", "users", "We learn roles, norms and values through interaction and institutions.", ["Primary socialization happens early, often in families.", "Secondary socialization happens through school, work and peers.", "Roles carry expectations that can conflict.", "Agents of socialization include media, religion and peers."]),
      study("soc-s2", "Structure & Inequality", "layers", "Social structure shapes opportunities beyond individual choices.", ["Stratification ranks groups by access to resources.", "Social mobility is movement between positions.", "Institutional discrimination can persist without individual intent.", "Culture and structure interact."])
    ],
    mistakes: ["Explaining every outcome by individual choice.", "Confusing a social institution with a building.", "Treating culture as fixed.", "Ignoring how roles change across contexts."],
    tips: [
      tip("Use the Sociological Imagination", "eye", "Connect a personal trouble to a public pattern. Ask what social arrangement makes the outcome common."),
      tip("Separate Structure and Agency", "columns-2", "Ask how much of an outcome is shaped by rules, resources and norms, and how much by individual action."),
      tip("Define the Institution", "landmark", "If an answer names an institution, check that it is an enduring pattern of roles, not a single person or event.")
    ]
  });

  subject("humanities", {
    id: "political-science",
    title: "Political Science",
    icon: "landmark",
    accent: "sky",
    level: "Intermediate",
    blurb: "Power, institutions, constitutions, elections and the comparative study of governments.",
    tags: ["political science", "government", "constitutions", "elections", "federalism", "power"],
    questions: [
      q("pol-1", "What does separation of powers do?", "Divides authority among branches of government", ["Creates a single ruling party", "Abolishes courts", "Ends all taxation"], "Separate branches can check one another.", ["Legislative, executive and judicial powers are distinct.", "Each branch has some ability to limit the others."], ["separation of powers", "institutions"]),
      q("pol-2", "What is federalism?", "A system that shares power between national and regional governments", ["A system with only one level of government", "A type of monarchy", "A rule that only judges can make law"], "Federal systems divide authority across levels.", ["Both levels have constitutionally protected powers.", "The balance varies by country."], ["federalism", "government"])
    ],
    study: [
      study("pol-s1", "Institutions", "landmark", "Constitutions create offices, assign powers and set limits.", ["Legislatures make law.", "Executives implement law.", "Judiciaries interpret law.", "Institutions shape incentives and outcomes."]),
      study("pol-s2", "Comparative Politics", "globe", "Comparing systems reveals that similar offices can work very differently.", ["Presidential and parliamentary systems differ in executive selection.", "Electoral rules shape party systems.", "Federal and unitary systems distribute power differently.", "Authoritarian and democratic systems differ in accountability."])
    ],
    mistakes: ["Confusing federalism with separation of powers.", "Assuming every democracy uses the same institutions.", "Treating a constitution as a complete description of practice.", "Ignoring electoral rules."],
    tips: [
      tip("Map the Institutions", "list-tree", "Draw the branches and the arrows of accountability. Most questions ask where a power sits or who can check whom."),
      tip("Compare, Don't Label", "columns-2", "When comparing countries, use criteria such as executive selection, party system and federalism."),
      tip("Follow the Power", "arrow-right", "Ask who can hire, fire, veto, fund or overrule whom. Formal titles can be misleading.")
    ]
  });

  /* --------------------------------------------------------------------------
     Languages
     -------------------------------------------------------------------------- */

  subject("languages", {
    id: "korean",
    title: "Korean",
    icon: "languages",
    accent: "violet",
    level: "Beginner",
    blurb: "Hangul, greetings, word order and the honorific habits that shape everyday Korean.",
    tags: ["Korean", "Hangul", "greetings", "SOV", "honorifics", "vocabulary"],
    questions: [
      q("korean-1", "What is the typical Korean sentence order?", "Subject–object–verb", ["Subject–verb–object", "Verb–subject–object", "Object–verb–subject"], "Korean usually places the verb at the end.", ["The predicate comes last.", "Particles mark the grammatical roles."], ["word order", "grammar"]),
      q("korean-2", "What does 안녕하세요 mean?", "Hello", ["Goodbye only", "Thank you", "Please"], "It is the standard polite greeting.", ["It literally relates to peace and wellbeing.", "Use it when meeting someone."], ["greetings", "vocabulary"])
    ],
    study: [
      study("korean-s1", "Hangul", "languages", "Hangul is a featural alphabet organized into syllable blocks.", ["Consonants and vowels combine into blocks.", "The block is read left to right and top to bottom.", "Hangul is not character-based like Chinese.", "Batchim are final consonants in a syllable."]),
      study("korean-s2", "Politeness", "users", "Verb endings and vocabulary change with social distance and formality.", ["The polite ending -요 is common in everyday speech.", "Formal endings are used in formal settings.", "Honorifics can raise the subject.", "Age and role influence which form is appropriate."])
    ],
    mistakes: ["Using English word order word-for-word.", "Ignoring honorifics.", "Reading Hangul as individual letters rather than blocks.", "Using informal speech with strangers."],
    tips: [
      tip("Learn in Blocks", "grid-3x3", "Read Hangul one syllable block at a time, not letter by letter."),
      tip("Match the Relationship", "users", "Choose a politeness level based on who you are speaking to, not just what you want to say."),
      tip("Listen for the Ending", "ear", "The verb ending carries tense, politeness and mood. Train your ear to wait for it.")
    ]
  });

  subject("languages", {
    id: "russian",
    title: "Russian",
    icon: "languages",
    accent: "sky",
    level: "Beginner",
    blurb: "Cyrillic, cases, verb aspect and the patterns behind Russian sentence structure.",
    tags: ["Russian", "Cyrillic", "cases", "verb aspect", "vocabulary", "grammar"],
    questions: [
      q("russian-1", "Which alphabet does Russian use?", "Cyrillic", ["Latin", "Arabic", "Devanagari"], "Russian is written in the Cyrillic alphabet.", ["Cyrillic was developed in the medieval Slavic world.", "It has letters that resemble but do not always sound like Latin letters."], ["alphabet", "Cyrillic"]),
      q("russian-2", "What is the main role of grammatical case in Russian?", "It marks a noun's role in the sentence", ["It marks the speaker's mood", "It changes the alphabet", "It sets the verb tense"], "Cases use endings to show subject, object, possession and more.", ["Word order is flexible because endings carry meaning.", "Different prepositions take different cases."], ["cases", "grammar"])
    ],
    study: [
      study("russian-s1", "Cyrillic", "languages", "Learn the letters that differ most from Latin first, then the false friends.", ["Some letters look like Latin but sound different.", "Hard and soft signs do not represent full vowels.", "Cursive is common in handwriting.", "Practice reading aloud from the first day."]),
      study("russian-s2", "Cases & Aspect", "layers", "Russian nouns change form by role, and verbs encode whether an action is complete.", ["Nominative marks the subject.", "Accusative marks a direct object.", "Genitive often marks possession or absence.", "Perfective verbs view an action as complete."])
    ],
    mistakes: ["Pronouncing Cyrillic letters as their Latin lookalikes.", "Ignoring case endings.", "Treating aspect as the same thing as tense.", "Assuming English word order is always natural."],
    tips: [
      tip("Read Aloud Daily", "volume-2", "Cyrillic becomes familiar through sound. Read a short paragraph aloud every day."),
      tip("Learn Nouns with Cases", "layers", "Memorize a noun with its genitive or accusative form, not just the dictionary form."),
      tip("Ask Complete or Ongoing", "check-check", "For every verb, decide whether the action is viewed as complete or ongoing. That choice drives aspect.")
    ]
  });

  /* --------------------------------------------------------------------------
     Study vault
     -------------------------------------------------------------------------- */

  subject("vault", {
    id: "research-methods",
    title: "Research Methods",
    icon: "flask-conical",
    accent: "teal",
    level: "Intermediate",
    blurb: "Variables, sampling, validity and the difference between a finding and a claim.",
    tags: ["research methods", "variables", "sampling", "validity", "reliability", "experiments"],
    questions: [
      q("research-1", "What is an independent variable?", "The factor the researcher deliberately changes", ["The factor measured as an outcome", "The factor held constant", "A random error"], "The independent variable is the proposed cause or input.", ["It is manipulated or selected.", "The dependent variable is measured."], ["variables", "experiments"]),
      q("research-2", "What does internal validity ask?", "Whether the study supports a causal claim", ["Whether the sample is large", "Whether the results are popular", "Whether the paper is well written"], "Internal validity concerns confounding and alternative explanations.", ["It is about the logic of the design.", "Random assignment helps."], ["validity", "causation"])
    ],
    study: [
      study("research-s1", "Variables & Designs", "flask-conical", "A design connects an input, an outcome and the alternatives that could explain the outcome.", ["Independent variables are manipulated.", "Dependent variables are measured.", "Control variables are held constant.", "Random assignment reduces confounding."]),
      study("research-s2", "Sampling & Validity", "users", "A result is only as trustworthy as the sample and the measurement behind it.", ["Random sampling supports generalization.", "Reliability is consistency; validity is accuracy.", "Demand characteristics can bias participants.", "Replication strengthens confidence."])
    ],
    mistakes: ["Confusing correlation with causation.", "Calling a convenience sample random.", "Confusing reliability with validity.", "Ignoring confounding variables."],
    tips: [
      tip("Draw the Design", "pencil-line", "Sketch the independent variable, dependent variable and control group. Missing pieces become obvious."),
      tip("Ask What Else Changed", "search", "For every causal claim, list alternative explanations. A good design rules them out."),
      tip("Separate Consistency from Truth", "scale", "A reliable scale can still be wrong. Ask whether the measure captures the concept.")
    ]
  });

  subject("vault", {
    id: "financial-literacy",
    title: "Financial Literacy",
    icon: "wallet",
    accent: "emerald",
    level: "Beginner",
    blurb: "Budgeting, interest, credit, taxes and the decisions that compound over a lifetime.",
    tags: ["financial literacy", "budgeting", "interest", "credit", "taxes", "investing"],
    questions: [
      q("finance-1", "What does compound interest do?", "It earns interest on both the principal and previously earned interest", ["It charges a fixed fee once", "It reduces the principal every year", "It only applies to cash"], "Compounding grows the balance faster than simple interest.", ["Interest is added to the balance.", "Future interest is calculated on the larger balance."], ["interest", "compounding"]),
      q("finance-2", "What is an emergency fund for?", "Covering unexpected expenses without high-interest debt", ["Buying luxury goods", "Paying taxes only", "Replacing all insurance"], "An emergency fund protects a budget from shocks.", ["It is usually held in a liquid account.", "It reduces the need to borrow at high rates."], ["budgeting", "saving"])
    ],
    study: [
      study("finance-s1", "Budgets & Cash Flow", "wallet", "A budget is a plan for money coming in and going out.", ["Track fixed and variable expenses separately.", "Pay yourself first by saving before discretionary spending.", "An emergency fund covers unexpected costs.", "A budget should be reviewed as income changes."]),
      study("finance-s2", "Interest & Credit", "percent", "Interest can work for you when saving and against you when borrowing.", ["Compound interest grows savings faster over time.", "Credit card balances often carry high annual percentage rates.", "Minimum payments extend repayment and increase total interest.", "A credit score reflects borrowing history and reliability."])
    ],
    mistakes: ["Carrying a credit-card balance while saving at a lower rate.", "Ignoring fees in an investment.", "Treating a budget as a one-time task.", "Borrowing for routine expenses without a repayment plan."],
    tips: [
      tip("Automate the Boring Part", "repeat-2", "Set automatic transfers for savings and bills. Consistency beats willpower."),
      tip("Compare the Rate", "percent", "Before borrowing or saving, compare the after-tax, after-fee rate. Small differences compound."),
      tip("Name the Goal", "target", "Give every savings account a purpose. Named goals are harder to raid.")
    ]
  });
})();
