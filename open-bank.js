/* ============================================================================
   QUESTIONAIRE — open-bank.js
   ----------------------------------------------------------------------------
   Original drills written for Questionaire and aligned to open education
   sources. Each item names the source it follows (`source`) and the chapter or
   task family (`sourceRef`); see sources.js for licences.

   These are not copied items. They exist to give the open banks a visible,
   attributed place in the catalogue without misrepresenting copyrighted or
   mixed-licence material as our own.
   ========================================================================== */

window.QUESTIONAIRE_OPEN_BANK = {
  "calculus": [
    {
      id: "calc-os-1",
      difficulty: "Beginner",
      tags: ["derivatives", "power rule"],
      prompt: "Differentiate $f(x) = 5x^4 - 2x$.",
      options: ["$20x^3$", "$5x^3 - 2$", "$20x^3 - 2$", "$20x^4 - 2$"],
      answer: 2,
      hint: "Differentiate each term on its own with the power rule.",
      explanation: [
        "The power rule gives $\\frac{d}{dx}(5x^4) = 20x^3$.",
        "The derivative of $-2x$ is $-2$.",
        "Add the term-by-term results: $f'(x) = 20x^3 - 2$."
      ],
      source: "openstax",
      sourceRef: "Calculus Volume 1, §3.3"
    },
    {
      id: "calc-os-2",
      difficulty: "Intermediate",
      tags: ["limits", "factoring"],
      prompt: "Evaluate $\\displaystyle\\lim_{x \\to 3} \\frac{x^2 - 9}{x - 3}$.",
      options: ["$6$", "$0$", "$3$", "The limit does not exist"],
      answer: 0,
      hint: "Factor the numerator as a difference of squares before substituting.",
      explanation: [
        "Factor: $x^2 - 9 = (x - 3)(x + 3)$.",
        "Cancel the common factor $(x - 3)$ for $x \\ne 3$.",
        "The expression becomes $x + 3$, and as $x \\to 3$ that tends to $6$."
      ],
      source: "openstax",
      sourceRef: "Calculus Volume 1, §2.3"
    },
    {
      id: "calc-os-3",
      difficulty: "Intermediate",
      tags: ["definite integrals", "natural log", "fundamental theorem"],
      prompt: "Evaluate $\\displaystyle\\int_1^{e} \\frac{1}{x}\\,dx$.",
      options: ["$e - 1$", "$e$", "$0$", "$1$"],
      answer: 3,
      hint: "An antiderivative of $1/x$ is $\\ln x$.",
      explanation: [
        "On $x > 0$, $\\frac{d}{dx}\\ln x = \\frac{1}{x}$, so $\\ln x$ is an antiderivative.",
        "Apply the Fundamental Theorem: $\\left[\\ln x\\right]_1^e = \\ln e - \\ln 1$.",
        "Since $\\ln e = 1$ and $\\ln 1 = 0$, the value is $1$."
      ],
      source: "openstax",
      sourceRef: "Calculus Volume 1, §5.6"
    },
    {
      id: "calc-os-4",
      difficulty: "Intermediate",
      tags: ["chain rule", "derivatives"],
      prompt: "Differentiate $f(x) = \\sin(3x)$.",
      options: ["$3\\cos(3x)$", "$\\cos(3x)$", "$-3\\cos(3x)$", "$3\\sin(3x)$"],
      answer: 0,
      hint: "The outer function is sine and the inner function is $3x$.",
      explanation: [
        "The derivative of $\\sin u$ is $\\cos u$.",
        "The inner function $3x$ contributes a factor of $3$ by the chain rule.",
        "So $f'(x) = 3\\cos(3x)$."
      ],
      source: "openstax",
      sourceRef: "Calculus Volume 1, §3.6"
    },
    {
      id: "calc-os-5",
      difficulty: "Intermediate",
      tags: ["optimization", "quadratics"],
      prompt: "A rectangle has perimeter $20$. What is its largest possible area?",
      options: ["$25$", "$20$", "$100$", "$40$"],
      answer: 0,
      hint: "Write the sides as $x$ and $10 - x$, then maximize the product.",
      explanation: [
        "The two sides satisfy $x + y = 10$, so $y = 10 - x$.",
        "Area $A(x) = x(10 - x) = 10x - x^2$.",
        "This parabola peaks at $x = 5$, giving $A = 5 \\cdot 5 = 25$."
      ],
      source: "openstax",
      sourceRef: "Calculus Volume 1, §4.7"
    },
    {
      id: "calc-os-6",
      difficulty: "Beginner",
      tags: ["definite integrals", "power rule"],
      prompt: "Evaluate $\\displaystyle\\int_0^2 3x^2\\,dx$.",
      options: ["$8$", "$12$", "$6$", "$4$"],
      answer: 0,
      hint: "An antiderivative of $3x^2$ is $x^3$.",
      explanation: [
        "By the power rule, $\\int 3x^2\\,dx = x^3$.",
        "Apply the Fundamental Theorem: $\\left[x^3\\right]_0^2$.",
        "That is $2^3 - 0^3 = 8$."
      ],
      source: "openstax",
      sourceRef: "Calculus Volume 1, §5.3"
    }
  ],

  "precalculus-trig": [
    {
      id: "pre-os-1",
      difficulty: "Intermediate",
      tags: ["exponential equations", "logarithms"],
      prompt: "Solve $2^{x+1} = 32$ for $x$.",
      options: ["$5$", "$4$", "$6$", "$16$"],
      answer: 1,
      hint: "Write $32$ as a power of $2$.",
      explanation: [
        "Since $32 = 2^5$, the equation is $2^{x+1} = 2^5$.",
        "Equal bases force equal exponents: $x + 1 = 5$.",
        "Therefore $x = 4$."
      ],
      source: "openstax",
      sourceRef: "Precalculus 2e, §4.6"
    },
    {
      id: "pre-os-2",
      difficulty: "Intermediate",
      tags: ["trigonometric graphs", "amplitude", "period"],
      prompt: "For $y = 3\\sin(2x)$, what are the amplitude and period?",
      options: ["Amplitude 3, period $\\pi$", "Amplitude 3, period $2\\pi$", "Amplitude 6, period $\\pi$", "Amplitude 2, period $3\\pi$"],
      answer: 0,
      hint: "For $y = A\\sin(Bx)$, amplitude is $|A|$ and period is $\\frac{2\\pi}{|B|}$.",
      explanation: [
        "The coefficient in front of sine is $A = 3$, so the amplitude is $3$.",
        "The coefficient of $x$ is $B = 2$.",
        "Period $= \\frac{2\\pi}{2} = \\pi$."
      ],
      source: "openstax",
      sourceRef: "Precalculus 2e, §6.1"
    },
    {
      id: "pre-os-3",
      difficulty: "Beginner",
      tags: ["logarithms", "exponents"],
      prompt: "Evaluate $\\log_2 32$.",
      options: ["$16$", "$2$", "$5$", "$32$"],
      answer: 2,
      hint: "Ask which exponent on $2$ gives $32$.",
      explanation: [
        "A logarithm answers the exponent question: $2^{?} = 32$.",
        "Repeated doubling gives $2^5 = 32$.",
        "Therefore $\\log_2 32 = 5$."
      ],
      source: "openstax",
      sourceRef: "Precalculus 2e, §4.3"
    },
    {
      id: "pre-os-4",
      difficulty: "Beginner",
      tags: ["unit circle", "trigonometric values"],
      prompt: "What is $\\sin\\left(\\frac{\\pi}{3}\\right)$?",
      options: ["$\\frac{\\sqrt{3}}{2}$", "$\\frac{1}{2}$", "$\\frac{\\sqrt{2}}{2}$", "$1$"],
      answer: 0,
      hint: "At $\\frac{\\pi}{3}$ the reference triangle is half of an equilateral triangle.",
      explanation: [
        "$\\frac{\\pi}{3}$ is $60^{\\circ}$, whose reference triangle has sides $1$ and $\\sqrt{3}$ with hypotenuse $2$.",
        "Sine is opposite over hypotenuse.",
        "The opposite side is $\\sqrt{3}$, so $\\sin\\left(\\frac{\\pi}{3}\\right) = \\frac{\\sqrt{3}}{2}$."
      ],
      source: "openstax",
      sourceRef: "Precalculus 2e, §5.2"
    },
    {
      id: "pre-os-5",
      difficulty: "Beginner",
      tags: ["geometric sequences"],
      prompt: "A geometric sequence begins $2, 6, 18, \\ldots$ What is the next term?",
      options: ["$54$", "$24$", "$36$", "$48$"],
      answer: 0,
      hint: "Find the constant ratio between consecutive terms.",
      explanation: [
        "Each term is three times the one before: $6 \\div 2 = 3$ and $18 \\div 6 = 3$.",
        "A geometric sequence multiplies by a fixed ratio, here $r = 3$.",
        "The next term is $18 \\times 3 = 54$."
      ],
      source: "openstax",
      sourceRef: "Precalculus 2e, §11.3"
    },
    {
      id: "pre-os-6",
      difficulty: "Intermediate",
      tags: ["trigonometric identities"],
      prompt: "If $\\cos\\theta = 0.6$ and $\\theta$ is acute, what is $\\sin\\theta$?",
      options: ["$0.8$", "$0.4$", "$0.6$", "$1.0$"],
      answer: 0,
      hint: "Use $\\sin^2\\theta + \\cos^2\\theta = 1$.",
      explanation: [
        "$\\cos^2\\theta = 0.36$.",
        "So $\\sin^2\\theta = 1 - 0.36 = 0.64$.",
        "An acute angle has a positive sine, so $\\sin\\theta = 0.8$."
      ],
      source: "openstax",
      sourceRef: "Precalculus 2e, §5.3"
    }
  ],

  "algebra-geometry": [
    {
      id: "alg-os-1",
      difficulty: "Beginner",
      tags: ["linear equations", "distributing"],
      prompt: "Solve $3(x - 2) = 2x + 5$.",
      options: ["$1$", "$-11$", "$7$", "$11$"],
      answer: 3,
      hint: "Distribute first, then collect $x$ on one side.",
      explanation: [
        "Distribute the left side: $3x - 6 = 2x + 5$.",
        "Subtract $2x$ from both sides: $x - 6 = 5$.",
        "Add $6$: $x = 11$."
      ],
      source: "illustrative-math",
      sourceRef: "Algebra 1, linear equations task family"
    },
    {
      id: "alg-os-2",
      difficulty: "Beginner",
      tags: ["slope", "linear equations"],
      prompt: "What is the slope of the line through $(2, 1)$ and $(6, 9)$?",
      options: ["$\\frac{1}{2}$", "$2$", "$4$", "$8$"],
      answer: 1,
      hint: "Slope is rise over run: $\\frac{y_2 - y_1}{x_2 - x_1}$.",
      explanation: [
        "Subtract the $y$-values: $9 - 1 = 8$.",
        "Subtract the $x$-values: $6 - 2 = 4$.",
        "Slope $= \\frac{8}{4} = 2$."
      ],
      source: "illustrative-math",
      sourceRef: "Algebra 1, interpreting linear functions"
    },
    {
      id: "alg-os-3",
      difficulty: "Beginner",
      tags: ["Pythagoras", "triangles"],
      prompt: "A right triangle has legs of length $6$ and $8$. How long is the hypotenuse?",
      options: ["$10$", "$14$", "$12$", "$48$"],
      answer: 0,
      hint: "Use $a^2 + b^2 = c^2$.",
      explanation: [
        "Square the legs: $6^2 = 36$ and $8^2 = 64$.",
        "Add: $36 + 64 = 100$.",
        "The hypotenuse is $\\sqrt{100} = 10$."
      ],
      source: "illustrative-math",
      sourceRef: "Geometry, Pythagorean theorem task family"
    },
    {
      id: "alg-os-4",
      difficulty: "Beginner",
      tags: ["systems of equations", "linear equations"],
      prompt: "Solve the system $x + y = 7$ and $x - y = 1$.",
      options: ["$x = 4,\\; y = 3$", "$x = 3,\\; y = 4$", "$x = 5,\\; y = 2$", "$x = 6,\\; y = 1$"],
      answer: 0,
      hint: "Adding the two equations eliminates $y$.",
      explanation: [
        "Add the equations: $(x + y) + (x - y) = 7 + 1$, so $2x = 8$.",
        "Therefore $x = 4$.",
        "Substitute back: $4 + y = 7$, so $y = 3$."
      ],
      source: "illustrative-math",
      sourceRef: "Algebra 1, systems of equations task family"
    },
    {
      id: "alg-os-5",
      difficulty: "Beginner",
      tags: ["quadratics", "factoring"],
      prompt: "What are the solutions of $x^2 - 5x + 6 = 0$?",
      options: ["$x = 2$ and $x = 3$", "$x = -2$ and $x = -3$", "$x = 1$ and $x = 6$", "$x = -1$ and $x = -6$"],
      answer: 0,
      hint: "Find two numbers that multiply to $6$ and add to $-5$.",
      explanation: [
        "The factors must be $-2$ and $-3$ because $(-2)(-3) = 6$ and $-2 + (-3) = -5$.",
        "Rewrite as $(x - 2)(x - 3) = 0$.",
        "A product is zero when a factor is zero, so $x = 2$ or $x = 3$."
      ],
      source: "illustrative-math",
      sourceRef: "Algebra 1, quadratic equations task family"
    },
    {
      id: "alg-os-6",
      difficulty: "Beginner",
      tags: ["circles", "area"],
      prompt: "A circle has radius $5$. What is its area?",
      options: ["$25\\pi$", "$10\\pi$", "$5\\pi$", "$50\\pi$"],
      answer: 0,
      hint: "Area uses the radius squared, not the radius.",
      explanation: [
        "The area formula is $A = \\pi r^2$.",
        "Substitute $r = 5$: $A = \\pi \\cdot 25$.",
        "$10\\pi$ would be the circumference, not the area."
      ],
      source: "illustrative-math",
      sourceRef: "Geometry, circles task family"
    }
  ],

  "biology": [
    {
      id: "bio-os-1",
      difficulty: "Beginner",
      tags: ["cell structure", "cellular respiration"],
      prompt: "Which organelle produces most of a eukaryotic cell's ATP during aerobic respiration?",
      options: ["Ribosome", "Golgi apparatus", "Mitochondrion", "Lysosome"],
      answer: 2,
      hint: "This organelle has a double membrane and its own DNA.",
      explanation: [
        "Ribosomes build proteins; they do not generate ATP.",
        "The Golgi apparatus modifies and packages proteins, and lysosomes digest material.",
        "The mitochondrion runs the electron transport chain and oxidative phosphorylation, which supply most cellular ATP."
      ],
      source: "openstax",
      sourceRef: "Biology 2e, ch. 7"
    },
    {
      id: "bio-os-2",
      difficulty: "Intermediate",
      tags: ["photosynthesis", "Calvin cycle"],
      prompt: "Which products of the light reactions are used by the Calvin cycle?",
      options: ["ATP and NADPH", "Glucose and oxygen", "Carbon dioxide and water", "ADP and NADP$^+$"],
      answer: 0,
      hint: "The Calvin cycle needs energy and reducing power, not sugar.",
      explanation: [
        "The light reactions split water, release oxygen and store energy in ATP and NADPH.",
        "The Calvin cycle uses that ATP and NADPH to reduce carbon dioxide into sugar.",
        "ADP, NADP$^+$ and oxygen are outputs on the other side of the cycle."
      ],
      source: "openstax",
      sourceRef: "Biology 2e, ch. 8"
    },
    {
      id: "bio-os-3",
      difficulty: "Intermediate",
      tags: ["DNA replication", "molecular biology"],
      prompt: "DNA replication is described as semiconservative because:",
      options: [
        "Both strands of each new molecule are newly made",
        "Each new molecule keeps one original strand and one new strand",
        "Both strands of each new molecule are original",
        "Only RNA is copied"
      ],
      answer: 1,
      hint: "Think about what happens to the two original strands.",
      explanation: [
        "The double helix unwinds and each original strand acts as a template.",
        "A new complementary strand is built against each template.",
        "Each daughter molecule therefore has one conserved strand and one new strand — half conserved."
      ],
      source: "openstax",
      sourceRef: "Biology 2e, ch. 14"
    },
    {
      id: "bio-os-4",
      difficulty: "Beginner",
      tags: ["mitosis", "cell division"],
      prompt: "During which phase of mitosis do sister chromatids separate?",
      options: ["Anaphase", "Prophase", "Metaphase", "Telophase"],
      answer: 0,
      hint: "The name comes from the Greek for \"carrying back\".",
      explanation: [
        "In prophase the chromosomes condense, and in metaphase they line up on the spindle equator.",
        "Anaphase is when the spindle fibres pull the sister chromatids apart toward opposite poles.",
        "Telophase then rebuilds the nuclei around the separated sets."
      ],
      source: "openstax",
      sourceRef: "Biology 2e, ch. 10"
    },
    {
      id: "bio-os-5",
      difficulty: "Beginner",
      tags: ["enzymes", "metabolism"],
      prompt: "What effect does an enzyme have on a reaction's activation energy?",
      options: ["It lowers the activation energy", "It raises the activation energy", "It removes the need for activation energy entirely", "It has no effect on activation energy"],
      answer: 0,
      hint: "Enzymes speed up reactions without being consumed.",
      explanation: [
        "Activation energy is the energy barrier reactants must clear to react.",
        "An enzyme binds the reactants and stabilises the transition state, lowering that barrier.",
        "A lower barrier means more molecules react per unit time, but the enzyme is unchanged afterwards."
      ],
      source: "openstax",
      sourceRef: "Biology 2e, ch. 6"
    },
    {
      id: "bio-os-6",
      difficulty: "Intermediate",
      tags: ["genetics", "Mendelian ratios"],
      prompt: "Two heterozygous parents ($Aa \\times Aa$) are crossed for a completely dominant trait. What phenotype ratio is expected?",
      options: ["$3:1$", "$1:1$", "$9:3:3:1$", "$1:2:1$"],
      answer: 0,
      hint: "Draw a four-square Punnett square.",
      explanation: [
        "Each parent passes $A$ or $a$ with equal probability, giving $AA$, $Aa$, $Aa$ and $aa$.",
        "Three of the four genotypes carry at least one $A$ and show the dominant phenotype.",
        "The phenotype ratio is $3:1$; $1:2:1$ is the genotype ratio."
      ],
      source: "openstax",
      sourceRef: "Biology 2e, ch. 12"
    }
  ],

  "chemistry": [
    {
      id: "chem-os-1",
      difficulty: "Beginner",
      tags: ["moles", "molar mass"],
      prompt: "How many moles are in $18.0\\,\\text{g}$ of water? Use $M(\\text{H}_2\\text{O}) = 18.02\\,\\text{g/mol}$.",
      options: ["$18.0\\,\\text{mol}$", "$0.500\\,\\text{mol}$", "$6.02\\,\\text{mol}$", "$1.00\\,\\text{mol}$"],
      answer: 3,
      hint: "Moles = mass divided by molar mass.",
      explanation: [
        "Use $n = \\frac{m}{M}$.",
        "Substitute: $n = \\frac{18.0}{18.02}$.",
        "The result is about $0.999$, which rounds to $1.00\\,\\text{mol}$."
      ],
      source: "openstax",
      sourceRef: "Chemistry 2e, ch. 3"
    },
    {
      id: "chem-os-2",
      difficulty: "Intermediate",
      tags: ["acids and bases", "pH"],
      prompt: "What is the pH of a $0.010\\,\\text{M}$ solution of HCl?",
      options: ["$2.00$", "$1.00$", "$12.00$", "$0.010$"],
      answer: 0,
      hint: "HCl is a strong acid, so $[\\text{H}^+] equals the concentration of the acid.",
      explanation: [
        "HCl dissociates completely, so $[\\text{H}^+] = 0.010\\,\\text{M} = 10^{-2}\\,\\text{M}$.",
        "pH $= -\\log_{10}[\\text{H}^+]$.",
        "pH $= -\\log_{10}(10^{-2}) = 2.00$."
      ],
      source: "openstax",
      sourceRef: "Chemistry 2e, ch. 14"
    },
    {
      id: "chem-os-3",
      difficulty: "Intermediate",
      tags: ["oxidation states", "redox"],
      prompt: "What is the oxidation state of sulfur in $\\text{H}_2\\text{SO}_4$?",
      options: ["$+4$", "$-2$", "$+6$", "$+2$"],
      answer: 2,
      hint: "Hydrogen is $+1$, oxygen is $-2$, and the molecule is neutral.",
      explanation: [
        "Two hydrogens contribute $2(+1) = +2$.",
        "Four oxygens contribute $4(-2) = -8$.",
        "For a neutral molecule, $+2 + S - 8 = 0$, so $S = +6$."
      ],
      source: "openstax",
      sourceRef: "Chemistry 2e, ch. 4"
    },
    {
      id: "chem-os-4",
      difficulty: "Intermediate",
      tags: ["stoichiometry", "moles"],
      prompt: "For $2\\text{H}_2 + \\text{O}_2 \\to 2\\text{H}_2\\text{O}$, how many moles of $\\text{O}_2$ react with $2\\,$mol of $\\text{H}_2$?",
      options: ["$1\\,$mol", "$2\\,$mol", "$0.5\\,$mol", "$4\\,$mol"],
      answer: 0,
      hint: "Read the coefficients in front of each formula.",
      explanation: [
        "The balanced equation uses two moles of $\\text{H}_2$ for every one mole of $\\text{O}_2$.",
        "That is a $2:1$ ratio.",
        "So $2\\,$mol of $\\text{H}_2$ consumes $1\\,$mol of $\\text{O}_2$."
      ],
      source: "openstax",
      sourceRef: "Chemistry 2e, ch. 4"
    },
    {
      id: "chem-os-5",
      difficulty: "Beginner",
      tags: ["gas laws", "pressure"],
      prompt: "At constant temperature, doubling the volume of a fixed amount of gas does what to its pressure?",
      options: ["Halves it", "Doubles it", "Leaves it unchanged", "Quadruples it"],
      answer: 0,
      hint: "Boyle's law relates pressure and volume inversely.",
      explanation: [
        "Boyle's law states $P_1V_1 = P_2V_2$ at constant temperature.",
        "If $V_2 = 2V_1$, then $P_2 = P_1 \\cdot \\frac{V_1}{2V_1}$.",
        "The pressure halves because the same molecules strike the walls half as often."
      ],
      source: "openstax",
      sourceRef: "Chemistry 2e, ch. 9"
    },
    {
      id: "chem-os-6",
      difficulty: "Beginner",
      tags: ["periodic trends", "atomic radius"],
      prompt: "Which atom has the larger radius, sodium or chlorine?",
      options: ["Sodium", "Chlorine", "They are equal", "It cannot be predicted"],
      answer: 0,
      hint: "Both are in period 3; think about effective nuclear charge.",
      explanation: [
        "Across a period the nuclear charge grows while electrons stay in the same shell.",
        "The stronger pull contracts the electron cloud, so radius decreases left to right.",
        "Sodium sits to the left of chlorine in period 3, so sodium is larger."
      ],
      source: "openstax",
      sourceRef: "Chemistry 2e, ch. 6"
    }
  ],

  "astronomy": [
    {
      id: "astro-os-1",
      difficulty: "Beginner",
      tags: ["stars", "nuclear fusion"],
      prompt: "What is the Sun's primary fuel?",
      options: ["Hydrogen", "Helium", "Carbon", "Uranium"],
      answer: 0,
      hint: "The Sun fuses the lightest element into the next one up.",
      explanation: [
        "The core fuses hydrogen nuclei into helium through the proton-proton chain.",
        "Helium is the product of that reaction, not the fuel.",
        "The Sun has converted only a small fraction of its hydrogen so far."
      ],
      source: "openstax",
      sourceRef: "Astronomy 2e, ch. 16"
    },
    {
      id: "astro-os-2",
      difficulty: "Intermediate",
      tags: ["spectra", "stellar atmospheres"],
      prompt: "Why does a star's spectrum contain dark absorption lines?",
      options: [
        "Cooler gas in the outer layers absorbs specific wavelengths",
        "The core emits only those wavelengths",
        "Interstellar dust removes all blue light",
        "The telescope adds them as an artefact"
      ],
      answer: 0,
      hint: "The photosphere radiates a continuous spectrum through the chromosphere.",
      explanation: [
        "The hot, dense photosphere emits a continuous spectrum.",
        "Gas above it is cooler, so its atoms absorb exactly the wavelengths that match their energy levels.",
        "Those missing wavelengths appear as dark lines and identify the elements present."
      ],
      source: "openstax",
      sourceRef: "Astronomy 2e, ch. 17"
    },
    {
      id: "astro-os-3",
      difficulty: "Advanced",
      tags: ["white dwarfs", "degeneracy pressure"],
      prompt: "What prevents a white dwarf from collapsing under its own gravity?",
      options: ["Electron degeneracy pressure", "Hydrogen fusion", "Radiation pressure from fission", "Its magnetic field"],
      answer: 0,
      hint: "The electrons are packed so tightly that quantum rules resist further compression.",
      explanation: [
        "Fusion has stopped, so thermal pressure cannot hold the star up.",
        "Packing electrons into a tiny volume forces them into higher momentum states.",
        "That quantum resistance is electron degeneracy pressure, and it supports the white dwarf."
      ],
      source: "openstax",
      sourceRef: "Astronomy 2e, ch. 23"
    }
  ],

  "statistics-probability": [
    {
      id: "stat-os-1",
      difficulty: "Beginner",
      tags: ["probability", "equally likely outcomes"],
      prompt: "A fair six-sided die is rolled once. What is the probability of an even number?",
      options: ["$\\frac{1}{2}$", "$\\frac{1}{3}$", "$\\frac{2}{3}$", "$\\frac{1}{6}$"],
      answer: 0,
      hint: "Count the even faces out of the six possible faces.",
      explanation: [
        "The even faces are $2$, $4$ and $6$, so there are three favourable outcomes.",
        "All six faces are equally likely.",
        "$P = \\frac{3}{6} = \\frac{1}{2}$."
      ],
      source: "openstax",
      sourceRef: "Introductory Statistics 2e, ch. 3"
    },
    {
      id: "stat-os-2",
      difficulty: "Beginner",
      tags: ["descriptive statistics", "median"],
      prompt: "What does the median of a data set describe?",
      options: ["The middle value when the data are ordered", "The most frequent value", "The arithmetic average", "The difference between the largest and smallest values"],
      answer: 0,
      hint: "It splits the ordered data into two halves.",
      explanation: [
        "Sort the values, then take the middle one, or the mean of the two middle values for an even count.",
        "The most frequent value is the mode and the average is the mean.",
        "The range is largest minus smallest."
      ],
      source: "openstax",
      sourceRef: "Introductory Statistics 2e, ch. 2"
    },
    {
      id: "stat-os-3",
      difficulty: "Intermediate",
      tags: ["probability", "independence"],
      prompt: "If $P(A) = 0.3$, $P(B) = 0.4$ and $A$ and $B$ are independent, what is $P(A \\cap B)$?",
      options: ["$0.12$", "$0.70$", "$0.10$", "$0.58$"],
      answer: 0,
      hint: "Independence lets you multiply the probabilities.",
      explanation: [
        "For independent events, $P(A \\cap B) = P(A)\\,P(B)$.",
        "Multiply: $0.3 \\times 0.4 = 0.12$.",
        "Adding the probabilities would double count and is not the intersection rule."
      ],
      source: "openstax",
      sourceRef: "Introductory Statistics 2e, ch. 3"
    }
  ],

  "world-history": [
    {
      id: "wh-os-1",
      difficulty: "Beginner",
      tags: ["ancient Egypt", "river valleys"],
      prompt: "Which river valley supported the earliest Egyptian civilisation?",
      options: ["The Nile", "The Tigris", "The Indus", "The Yellow River"],
      answer: 0,
      hint: "Its annual flood deposited the silt that made farming possible.",
      explanation: [
        "Egyptian settlements clustered along the Nile because the floodplain renewed fertile soil each year.",
        "The Tigris and Euphrates belong to Mesopotamia, and the Indus and Yellow River to other civilisations.",
        "The Nile also served as the main transport route along the kingdom."
      ],
      source: "openstax",
      sourceRef: "World History Volume 1, ch. 3"
    },
    {
      id: "wh-os-2",
      difficulty: "Intermediate",
      tags: ["Silk Roads", "trade"],
      prompt: "What was the main historical significance of the Silk Roads?",
      options: [
        "They carried goods, technology and ideas between Asia, the Middle East and Europe",
        "They were a single road built by one empire",
        "They were an irrigation system in China",
        "They connected Europe to the Americas"
      ],
      answer: 0,
      hint: "The network moved far more than silk.",
      explanation: [
        "The Silk Roads were a network of overland and maritime routes, not one road.",
        "Merchants exchanged silk, spices and metals, and with them religions, technologies and diseases.",
        "That exchange linked East Asia, Central Asia, the Middle East and Europe."
      ],
      source: "openstax",
      sourceRef: "World History Volume 1, ch. 9"
    },
    {
      id: "wh-os-3",
      difficulty: "Beginner",
      tags: ["Persian Empire", "Cyrus the Great"],
      prompt: "Which empire was founded by Cyrus the Great?",
      options: ["The Achaemenid Persian Empire", "The Roman Empire", "The Mauryan Empire", "The Mongol Empire"],
      answer: 0,
      hint: "It was centred on Persia and later fought the Greek city-states.",
      explanation: [
        "Cyrus the Great united the Persian tribes and founded the Achaemenid Empire in the sixth century BCE.",
        "His successors expanded it to Egypt and the borders of Greece.",
        "The Roman, Mauryan and Mongol empires arose later and in other regions."
      ],
      source: "openstax",
      sourceRef: "World History Volume 1, ch. 6"
    }
  ],

  "organic-chemistry": [
    {
      id: "org-os-1",
      difficulty: "Intermediate",
      tags: ["hybridisation", "alkenes"],
      prompt: "What is the hybridisation of each carbon atom in ethene ($\\text{C}_2\\text{H}_4$)?",
      options: ["$sp^2$", "$sp^3$", "$sp$", "$sp^3d$"],
      answer: 0,
      hint: "Count the electron domains around each carbon: two hydrogens and one double bond.",
      explanation: [
        "Each carbon is bonded to two hydrogens and one other carbon, giving three electron domains.",
        "Three domains correspond to $sp^2$ hybridisation.",
        "The remaining $p$ orbital on each carbon forms the $\\pi$ bond of the double bond."
      ],
      source: "openstax",
      sourceRef: "Organic Chemistry, ch. 1"
    },
    {
      id: "org-os-2",
      difficulty: "Beginner",
      tags: ["functional groups", "carboxylic acids"],
      prompt: "Which functional group defines a carboxylic acid?",
      options: ["$-\\text{COOH}$", "$-\\text{OH}$", "$-\\text{CHO}$", "$-\\text{NH}_2$"],
      answer: 0,
      hint: "It combines a carbonyl and a hydroxyl on the same carbon.",
      explanation: [
        "A carboxyl group is a carbonyl ($C{=}O$) and a hydroxyl ($-OH$) on one carbon.",
        "That combination is acidic because the $O{-}H$ bond can lose a proton.",
        "$-\\text{OH}$ alone is an alcohol and $-\\text{CHO}$ an aldehyde."
      ],
      source: "openstax",
      sourceRef: "Organic Chemistry, ch. 3"
    },
    {
      id: "org-os-3",
      difficulty: "Beginner",
      tags: ["alkanes", "nomenclature"],
      prompt: "How many carbon atoms does butane contain?",
      options: ["$4$", "$3$", "$5$", "$2$"],
      answer: 0,
      hint: "The prefix \"but-\" gives the count.",
      explanation: [
        "Alkane prefixes run meth-, eth-, prop-, but-, pent- for one to five carbons.",
        "\"But-\" is the fourth prefix in that series.",
        "Butane therefore has four carbon atoms, $\\text{C}_4\\text{H}_{10}$."
      ],
      source: "openstax",
      sourceRef: "Organic Chemistry, ch. 3"
    }
  ]
};
