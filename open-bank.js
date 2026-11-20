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
    }
  ]
};
