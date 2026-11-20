/* ============================================================================
   QUESTIONAIRE — database.js
   ----------------------------------------------------------------------------
   Every subject, question, cheat sheet, tip and video lives here.
   The app (app.js) reads this object and renders everything.

   SCHEMA
   ------
   STUDY_DATA = {
     meta: { ... },
     categories: [
       {
         id, title, tagline, icon, accent,
         subjects: [
           {
             id, title, icon, accent, level, blurb,
             tags: ["..."],
             questions: [
               {
                 id, difficulty: "Beginner" | "Intermediate" | "Advanced",
                 tags: ["..."],
                 // `id` is the internal slug. The student-facing #CODE is derived
                 // at runtime by getDisplayId() in app.js and is never stored.
                 // Optional: source + sourceRef point at a key in sources.js.
                 prompt: "LaTeX allowed: $x^2$",
                 options: ["...", "...", "...", "..."],
                 answer: 0,            // zero-based index of the correct option
                 hint: "Shown when the student taps 'Need a hint?'",
                 explanation: [        // revealed one step at a time
                   "Step 1 ...",
                   "Step 2 ..."
                 ]
               }
             ],
             study:  [{ id, title, icon, summary, points: ["..."] }],
             mistakes: ["Common mistake ..."],
             tips:   [{ title, icon, body }],
             videos: [{ youtube: "VIDEO_ID", title, channel, takeaways: ["..."] }]
           }
         ]
       }
     ]
   }

   HOW TO ADD A PACK
   -----------------
   Copy any subject block, give it a new unique `id` (used in the URL and in
   localStorage), and drop it into the matching category's `subjects` array.
   Question ids must be unique across the whole file — prefix them with the
   subject id (e.g. "bio-5"). LaTeX goes between $...$ (inline) or $$...$$
   (display). Nothing else needs to change.

   IDS
   ---
   Every question has one internal slug (`id`) that is stable forever. The
   six-character code students see and can search (#Q8X49P) is derived from it
   by getDisplayId() in app.js, so it never needs to be written here and adding
   a question cannot renumber another. See README → Question codes.
   ========================================================================== */

const STUDY_DATA = {
  meta: {
    title: "Questionaire",
    tagline: "A printed study annual for serious practice.",
    version: "1.5.1",
    updated: "2026-11-18"
  },

  categories: [
    /* ======================================================================
       MATHEMATICS
       ====================================================================== */
    {
      id: "mathematics",
      title: "Mathematics",
      tagline: "Patterns, structure, and proof — from fractions to integrals.",
      icon: "sigma",
      accent: "indigo",
      subjects: [
        /* ------------------------------------------------------------------
           1. ELEMENTARY MATH
           ------------------------------------------------------------------ */
        {
          id: "elementary-math",
          title: "Elementary Math",
          icon: "calculator",
          accent: "indigo",
          level: "Beginner",
          blurb: "Fractions, order of operations, percentages and the word problems that hide them.",
          tags: ["fractions", "order of operations", "PEMDAS", "percentages", "word problems", "ratios", "arithmetic"],
          questions: [
            {
              id: "em-1",
              difficulty: "Beginner",
              tags: ["fractions", "addition", "common denominator"],
              prompt: "What is $\\frac{3}{4} + \\frac{5}{6}$?",
              options: [
                "$\\frac{8}{10}$",
                "$\\frac{19}{12}$",
                "$\\frac{15}{24}$",
                "$\\frac{7}{10}$"
              ],
              answer: 1,
              hint: "Fractions can only be added when the denominators match. The least common multiple of $4$ and $6$ is $12$.",
              explanation: [
                "Find a common denominator. The LCM of $4$ and $6$ is $12$, so rewrite both fractions over $12$.",
                "Multiply the numerator and denominator by the same number: $\\frac{3}{4} = \\frac{9}{12}$ and $\\frac{5}{6} = \\frac{10}{12}$.",
                "Add the numerators and keep the denominator: $\\frac{9}{12} + \\frac{10}{12} = \\frac{19}{12}$.",
                "$\\frac{19}{12}$ is already in lowest terms, and as a mixed number it is $1\\frac{7}{12}$."
              ]
            },
            {
              id: "em-2",
              difficulty: "Beginner",
              tags: ["order of operations", "PEMDAS", "exponents"],
              prompt: "Evaluate $8 + 2 \\times (5 - 3)^2$.",
              options: ["$40$", "$16$", "$24$", "$100$"],
              answer: 1,
              hint: "Work inside the parentheses first, then apply the exponent, then multiply, then add.",
              explanation: [
                "Parentheses first: $5 - 3 = 2$, so the expression becomes $8 + 2 \\times 2^2$.",
                "Exponents next: $2^2 = 4$, giving $8 + 2 \\times 4$.",
                "Multiplication before addition: $2 \\times 4 = 8$, giving $8 + 8$.",
                "Finally, $8 + 8 = 16$."
              ]
            },
            {
              id: "em-3",
              difficulty: "Intermediate",
              tags: ["percentages", "discount", "word problems", "tax"],
              prompt: "A jacket is priced at $\\$80$. It is discounted by $25\\%$, and then $10\\%$ sales tax is added to the discounted price. What is the final cost?",
              options: ["$\\$66$", "$\\$60$", "$\\$72$", "$\\$64$"],
              answer: 0,
              hint: "After a $25\\%$ discount you pay $75\\%$ of the original price. The tax is charged on the new, lower price.",
              explanation: [
                "A $25\\%$ discount means the customer pays $100\\% - 25\\% = 75\\%$ of $\\$80$.",
                "Discounted price: $80 \\times 0.75 = \\$60$.",
                "Sales tax is $10\\%$ of $\\$60$: $60 \\times 0.10 = \\$6$.",
                "Final cost: $60 + 6 = \\$66$. Equivalently, $60 \\times 1.10 = \\$66$."
              ]
            },
            {
              id: "em-4",
              difficulty: "Advanced",
              tags: ["fractions", "ratios", "scaling", "word problems"],
              prompt: "A recipe for $6$ people uses $\\frac{3}{4}$ cup of oil. How much oil is needed for $10$ people?",
              options: [
                "$1\\frac{1}{4}$ cups",
                "$\\frac{5}{6}$ cup",
                "$1\\frac{1}{2}$ cups",
                "$\\frac{3}{5}$ cup"
              ],
              answer: 0,
              hint: "Find the oil per person first: divide $\\frac{3}{4}$ by $6$. Then multiply by $10$.",
              explanation: [
                "Oil per person: $\\frac{3}{4} \\div 6 = \\frac{3}{4} \\times \\frac{1}{6} = \\frac{3}{24} = \\frac{1}{8}$ cup.",
                "For $10$ people: $\\frac{1}{8} \\times 10 = \\frac{10}{8} = \\frac{5}{4}$ cups.",
                "Convert to a mixed number: $\\frac{5}{4} = 1\\frac{1}{4}$ cups.",
                "Check by scaling the whole recipe: $\\frac{3}{4} \\times \\frac{10}{6} = \\frac{30}{24} = \\frac{5}{4}$. Same answer."
              ]
            }
          ],
          study: [
            {
              id: "em-s1",
              title: "Fraction Toolkit",
              icon: "divide",
              summary: "A fraction is a division problem wearing a costume. Every operation has one reliable move.",
              points: [
                "Add / subtract: rewrite over a common denominator, then combine numerators. $\\frac{a}{b} + \\frac{c}{d} = \\frac{ad + bc}{bd}$.",
                "Multiply: straight across. $\\frac{a}{b} \\times \\frac{c}{d} = \\frac{ac}{bd}$.",
                "Divide: multiply by the reciprocal. $\\frac{a}{b} \\div \\frac{c}{d} = \\frac{a}{b} \\times \\frac{d}{c}$.",
                "Simplify by cancelling common factors — never by cancelling terms across a plus sign."
              ]
            },
            {
              id: "em-s2",
              title: "Order of Operations (PEMDAS)",
              icon: "list-ordered",
              summary: "One agreed reading order so that $8 + 2 \\times 3$ means the same thing to everyone.",
              points: [
                "Parentheses → Exponents → Multiplication / Division (left to right) → Addition / Subtraction (left to right).",
                "Multiplication and division have equal priority; so do addition and subtraction. Go left to right within a level.",
                "Worked example: $8 + 2 \\times (5-3)^2 = 8 + 2 \\times 4 = 8 + 8 = 16$.",
                "Fraction bars and radicals act like invisible parentheses: evaluate the entire top and bottom first."
              ]
            },
            {
              id: "em-s3",
              title: "Percentages That Actually Make Sense",
              icon: "percent",
              summary: "A percent is just a fraction with denominator $100$ — and a multiplier you can chain.",
              points: [
                "Base relationship: $\\text{part} = \\text{percent} \\times \\text{whole}$, so $\\text{percent} = \\frac{\\text{part}}{\\text{whole}}$.",
                "Use multipliers: a $25\\%$ discount means paying $0.75$; $10\\%$ tax means multiplying by $1.10$.",
                "Percent change: $\\frac{\\text{new} - \\text{old}}{\\text{old}} \\times 100\\%$. Always divide by the original value.",
                "A $20\\%$ decrease followed by a $20\\%$ increase is not break-even: $0.8 \\times 1.2 = 0.96$, a $4\\%$ loss."
              ]
            }
          ],
          mistakes: [
            "Adding denominators: $\\frac{3}{4} + \\frac{5}{6} \\neq \\frac{8}{10}$. Rewrite over a common denominator first.",
            "Doing multiplication before parentheses — $8 + 2 \\times (5-3)^2$ is $16$, not $40$.",
            "Applying a percent change to the wrong base, e.g. taking tax on the original price instead of the discounted price.",
            "Cancelling across addition: $\\frac{x+2}{2} \\neq x$. Only factors can be cancelled."
          ],
          tips: [
            {
              title: "The 10% Anchor",
              icon: "anchor",
              body: "Need $15\\%$ of a number? Take $10\\%$ (shift the decimal one place) and add half of it. $15\\%$ of $\\$48$: $4.80 + 2.40 = \\$7.20$. Works mentally for any $5\\%$ increment."
            },
            {
              title: "Benchmark Fractions",
              icon: "ruler",
              body: "Keep these memorised: $\\frac{1}{8}=12.5\\%$, $\\frac{1}{4}=25\\%$, $\\frac{1}{3}\\approx33.3\\%$, $\\frac{1}{2}=50\\%$, $\\frac{2}{3}\\approx66.7\\%$, $\\frac{3}{4}=75\\%$. Most percent problems become instant comparisons."
            },
            {
              title: "Units Before Numbers",
              icon: "tag",
              body: "In word problems, write the units next to every number before calculating. If the units do not cancel into the answer's units, your operation is wrong — this catches most setup errors without any algebra."
            }
          ],
          videos: [
            {
              youtube: "kZzoVCmUyKg",
              title: "Introduction to fractions",
              channel: "Khan Academy",
              takeaways: [
                "A fraction describes equal parts of a whole.",
                "The denominator counts the parts in one whole; the numerator counts how many you have.",
                "Equivalent fractions are the same number written with different denominators."
              ]
            },
            {
              youtube: "piIcRV2dx7E",
              title: "Order of operations: PEMDAS",
              channel: "Khan Academy",
              takeaways: [
                "Parentheses first, then exponents.",
                "Multiplication and division share one priority level and are evaluated left to right.",
                "Addition and subtraction share the final level, also left to right."
              ]
            }
          ]
        },

        /* ------------------------------------------------------------------
           2. ALGEBRA & GEOMETRY
           ------------------------------------------------------------------ */
        {
          id: "algebra-geometry",
          title: "Algebra & Geometry",
          icon: "shapes",
          accent: "indigo",
          level: "Intermediate",
          blurb: "Linear equations, systems, slopes and the geometry formulas that show up on every exam.",
          tags: ["algebra", "geometry", "linear equations", "slope", "systems", "Pythagoras", "triangles", "circles"],
          questions: [
            {
              id: "ag-1",
              difficulty: "Beginner",
              tags: ["linear equations", "solving for x"],
              prompt: "Solve for $x$: $3x + 7 = 22$.",
              options: ["$x = 5$", "$x = 15$", "$x = 7$", "$x = \\frac{29}{3}$"],
              answer: 0,
              hint: "Undo the addition first, then undo the multiplication. Whatever you do to one side, do to the other.",
              explanation: [
                "Subtract $7$ from both sides: $3x = 15$.",
                "Divide both sides by $3$: $x = 5$.",
                "Check: $3(5) + 7 = 15 + 7 = 22$. ✓"
              ]
            },
            {
              id: "ag-2",
              difficulty: "Intermediate",
              tags: ["slope", "coordinate geometry", "lines"],
              prompt: "What is the slope of the line through $(2, 3)$ and $(6, 11)$?",
              options: ["$2$", "$\\frac{1}{2}$", "$-2$", "$4$"],
              answer: 0,
              hint: "Slope is rise over run: $m = \\frac{y_2 - y_1}{x_2 - x_1}$.",
              explanation: [
                "Label the points: $(x_1, y_1) = (2, 3)$ and $(x_2, y_2) = (6, 11)$.",
                "Apply the slope formula: $m = \\frac{11 - 3}{6 - 2}$.",
                "Simplify: $m = \\frac{8}{4} = 2$.",
                "A slope of $2$ means the line rises $2$ units for every $1$ unit to the right."
              ]
            },
            {
              id: "ag-3",
              difficulty: "Intermediate",
              tags: ["systems of equations", "elimination", "substitution"],
              prompt: "Solve the system: $2x + y = 11$ and $x - y = 1$.",
              options: [
                "$(4, 3)$",
                "$(3, 4)$",
                "$(5, 1)$",
                "$(2, 7)$"
              ],
              answer: 0,
              hint: "The $y$ terms have opposite signs — add the two equations to eliminate $y$.",
              explanation: [
                "Add the equations: $(2x + y) + (x - y) = 11 + 1$.",
                "The $y$ terms cancel: $3x = 12$, so $x = 4$.",
                "Substitute back into $x - y = 1$: $4 - y = 1$, so $y = 3$.",
                "Check in the first equation: $2(4) + 3 = 11$. ✓ The solution is $(4, 3)$."
              ]
            },
            {
              id: "ag-4",
              difficulty: "Advanced",
              tags: ["geometry", "circles", "right triangles", "Pythagoras"],
              prompt: "A right triangle has legs of length $6$ and $8$. What is the radius of its circumscribed circle?",
              options: ["$5$", "$4$", "$10$", "$6$"],
              answer: 0,
              hint: "For a right triangle, the hypotenuse is a diameter of the circumcircle. Find the hypotenuse first.",
              explanation: [
                "Pythagoras: hypotenuse $c = \\sqrt{6^2 + 8^2} = \\sqrt{36 + 64} = \\sqrt{100} = 10$.",
                "A right angle subtends a semicircle, so the hypotenuse is a diameter of the circumcircle.",
                "Radius $= \\frac{\\text{diameter}}{2} = \\frac{10}{2} = 5$."
              ]
            }
          ],
          study: [
            {
              id: "ag-s1",
              title: "Linear Equations & Slope",
              icon: "trending-up",
              summary: "Every line is the same object in three costumes: slope-intercept, point-slope, standard form.",
              points: [
                "Slope-intercept: $y = mx + b$, where $m$ is the slope and $b$ the $y$-intercept.",
                "Point-slope: $y - y_1 = m(x - x_1)$ — the fastest route when you know a point and a slope.",
                "Slope: $m = \\frac{y_2 - y_1}{x_2 - x_1}$. Parallel lines share $m$; perpendicular slopes multiply to $-1$.",
                "Solve linear equations by undoing operations in reverse order and keeping both sides balanced."
              ]
            },
            {
              id: "ag-s2",
              title: "Systems of Equations",
              icon: "layers",
              summary: "Two lines either cross once, never, or everywhere. Algebra finds which.",
              points: [
                "Substitution: solve one equation for a variable, then plug it into the other.",
                "Elimination: multiply equations so a variable's coefficients are opposites, then add.",
                "One solution = intersecting lines; no solution = parallel lines; infinitely many = the same line.",
                "Always substitute your answer back into the original equations to catch sign errors."
              ]
            },
            {
              id: "ag-s3",
              title: "Geometry Formula Bank",
              icon: "shapes",
              summary: "The formulas that appear on nearly every standardized test.",
              points: [
                "Pythagoras: $a^2 + b^2 = c^2$. Common triples: $3$-$4$-$5$, $5$-$12$-$13$, $8$-$15$-$17$.",
                "Triangle area: $A = \\frac{1}{2}bh$; circle area $A = \\pi r^2$; circumference $C = 2\\pi r$.",
                "Volume: cylinder $V = \\pi r^2 h$; sphere $V = \\frac{4}{3}\\pi r^3$; cone $V = \\frac{1}{3}\\pi r^2 h$.",
                "Angles: a straight line is $180^\\circ$, a triangle's interior angles sum to $180^\\circ$, a circle is $360^\\circ$."
              ]
            }
          ],
          mistakes: [
            "Dropping a negative sign when distributing: $-2(x - 3) = -2x + 6$, not $-2x - 6$.",
            "Computing slope upside down — it is change in $y$ over change in $x$.",
            "Forgetting to multiply the entire equation when clearing denominators.",
            "Assuming a triangle is right-angled: Pythagoras only applies when there is a $90^\\circ$ angle."
          ],
          tips: [
            {
              title: "Keep the Balance",
              icon: "scale",
              body: "Think of an equation as a balance scale. Every operation must be applied to the whole of both sides. Writing each step on its own line makes sign errors obvious."
            },
            {
              title: "Rise Over Run, Always",
              icon: "move-up-right",
              body: "Read slope as a walking instruction: positive $m$ walks uphill to the right, negative walks downhill. A vertical line has undefined slope; a horizontal line has slope $0$."
            },
            {
              title: "Recognise Special Triangles",
              icon: "triangle",
              body: "Spot $3$-$4$-$5$ and $5$-$12$-$13$ multiples instantly instead of using Pythagoras. For $45^\\circ$-$45^\\circ$-$90^\\circ$ the sides are $x, x, x\\sqrt{2}$; for $30^\\circ$-$60^\\circ$-$90^\\circ$ they are $x, x\\sqrt{3}, 2x$."
            }
          ],
          videos: [
            {
              youtube: "_y_Q3_B2Vh8",
              title: "Solving two-step equations",
              channel: "Khan Academy",
              takeaways: [
                "Undo addition or subtraction before multiplication or division.",
                "Perform the same operation on both sides to preserve equality.",
                "Substitute the result back to verify it."
              ]
            },
            {
              youtube: "EshVND1JesY",
              title: "GED Math Formula Sheet Explained",
              channel: "Purely Persistent — GED and HiSET Prep",
              takeaways: [
                "Which formulas are provided on the reference sheet versus memorised.",
                "How to substitute values into area, volume and slope formulas.",
                "A walkthrough of the formulas most often tested."
              ]
            }
          ]
        },

        /* ------------------------------------------------------------------
           3. PRE-CALCULUS & TRIGONOMETRY
           ------------------------------------------------------------------ */
        {
          id: "precalculus-trig",
          title: "Pre-Calculus & Trigonometry",
          icon: "waves",
          accent: "indigo",
          level: "Advanced",
          blurb: "The unit circle, identities, exponentials and logarithms — the bridge into calculus.",
          tags: ["precalculus", "trigonometry", "unit circle", "radians", "identities", "logarithms", "functions", "period"],
          questions: [
            {
              id: "pc-1",
              difficulty: "Beginner",
              tags: ["radians", "degrees", "unit circle"],
              prompt: "Convert $150^\\circ$ to radians.",
              options: [
                "$\\frac{5\\pi}{6}$",
                "$\\frac{2\\pi}{3}$",
                "$\\frac{3\\pi}{4}$",
                "$\\frac{7\\pi}{6}$"
              ],
              answer: 0,
              hint: "Multiply degrees by $\\frac{\\pi}{180}$ and simplify the fraction.",
              explanation: [
                "Use the conversion factor $\\frac{\\pi}{180^\\circ}$: $150^\\circ \\times \\frac{\\pi}{180^\\circ}$.",
                "Simplify $\\frac{150}{180} = \\frac{5}{6}$.",
                "So $150^\\circ = \\frac{5\\pi}{6}$ radians, which sits in quadrant II."
              ]
            },
            {
              id: "pc-2",
              difficulty: "Beginner",
              tags: ["unit circle", "sine", "exact values"],
              prompt: "What is $\\sin\\left(\\frac{\\pi}{6}\\right)$?",
              options: [
                "$\\frac{1}{2}$",
                "$\\frac{\\sqrt{3}}{2}$",
                "$\\frac{\\sqrt{2}}{2}$",
                "$0$"
              ],
              answer: 0,
              hint: "$\\frac{\\pi}{6}$ radians is $30^\\circ$. In a $30^\\circ$-$60^\\circ$-$90^\\circ$ triangle, the side opposite $30^\\circ$ is half the hypotenuse.",
              explanation: [
                "$\\frac{\\pi}{6}$ radians equals $30^\\circ$, a standard unit-circle angle.",
                "The coordinates of the unit-circle point at $30^\\circ$ are $\\left(\\frac{\\sqrt{3}}{2}, \\frac{1}{2}\\right)$.",
                "Sine is the $y$-coordinate, so $\\sin\\left(\\frac{\\pi}{6}\\right) = \\frac{1}{2}$."
              ]
            },
            {
              id: "pc-3",
              difficulty: "Intermediate",
              tags: ["logarithms", "exponents", "solving"],
              prompt: "Solve for $x$: $2^x = 32$.",
              options: ["$x = 5$", "$x = 4$", "$x = 6$", "$x = 16$"],
              answer: 0,
              hint: "Write $32$ as a power of $2$, then compare exponents.",
              explanation: [
                "Recognise that $32 = 2^5$.",
                "The equation becomes $2^x = 2^5$.",
                "Exponential functions are one-to-one, so $x = 5$.",
                "Taking logs gives the same result: $x = \\log_2 32 = \\frac{\\ln 32}{\\ln 2} = 5$."
              ]
            },
            {
              id: "pc-4",
              difficulty: "Advanced",
              tags: ["trigonometry", "amplitude", "period", "transformations"],
              prompt: "For $y = 3\\sin(2x - \\pi) + 1$, what are the amplitude and period?",
              options: [
                "Amplitude $3$, period $\\pi$",
                "Amplitude $2$, period $3\\pi$",
                "Amplitude $3$, period $2\\pi$",
                "Amplitude $1$, period $\\pi$"
              ],
              answer: 0,
              hint: "For $y = A\\sin(Bx - C) + D$, the amplitude is $|A|$ and the period is $\\frac{2\\pi}{|B|}$.",
              explanation: [
                "Match to $y = A\\sin(B(x - C/B)) + D$: here $A = 3$, $B = 2$, $D = 1$.",
                "Amplitude $= |A| = |3| = 3$.",
                "Period $= \\frac{2\\pi}{|B|} = \\frac{2\\pi}{2} = \\pi$.",
                "The $+1$ is a vertical shift, not part of the amplitude. The graph oscillates between $-2$ and $4$."
              ]
            }
          ],
          study: [
            {
              id: "pc-s1",
              title: "The Unit Circle, Decoded",
              icon: "circle-dot",
              summary: "Every special angle is a point $(\\cos\\theta, \\sin\\theta)$ on the circle $x^2 + y^2 = 1$.",
              points: [
                "Sine is the $y$-coordinate, cosine is the $x$-coordinate, and $\\tan\\theta = \\frac{\\sin\\theta}{\\cos\\theta}$.",
                "Know the quadrant signs: ASTC — All positive in QI, Sine in QII, Tangent in QIII, Cosine in QIV.",
                "Special values: $\\sin 30^\\circ = \\frac{1}{2}$, $\\sin 45^\\circ = \\frac{\\sqrt{2}}{2}$, $\\sin 60^\\circ = \\frac{\\sqrt{3}}{2}$.",
                "Radians and degrees: $\\pi = 180^\\circ$, so multiply degrees by $\\frac{\\pi}{180}$."
              ]
            },
            {
              id: "pc-s2",
              title: "Identities Worth Memorising",
              icon: "equal",
              summary: "Most trig problems collapse once you spot the right identity.",
              points: [
                "Pythagorean identity: $\\sin^2\\theta + \\cos^2\\theta = 1$, and $1 + \\tan^2\\theta = \\sec^2\\theta$.",
                "Double angle: $\\sin 2\\theta = 2\\sin\\theta\\cos\\theta$; $\\cos 2\\theta = \\cos^2\\theta - \\sin^2\\theta$.",
                "Sum formulas: $\\sin(a \\pm b) = \\sin a\\cos b \\pm \\cos a\\sin b$.",
                "Reciprocals: $\\csc\\theta = \\frac{1}{\\sin\\theta}$, $\\sec\\theta = \\frac{1}{\\cos\\theta}$, $\\cot\\theta = \\frac{\\cos\\theta}{\\sin\\theta}$."
              ]
            },
            {
              id: "pc-s3",
              title: "Exponentials & Logarithms",
              icon: "square-function",
              summary: "Logs are exponents in disguise; every log rule is an exponent rule read backwards.",
              points: [
                "Definition: $\\log_b x = y \\iff b^y = x$, with $b > 0$, $b \\neq 1$, $x > 0$.",
                "Rules: $\\log_b(xy) = \\log_b x + \\log_b y$ and $\\log_b\\left(\\frac{x}{y}\\right) = \\log_b x - \\log_b y$.",
                "Power rule: $\\log_b(x^p) = p\\log_b x$ — the workhorse for solving $2^x = 32$.",
                "Growth and decay: $A(t) = A_0 e^{kt}$; positive $k$ grows, negative $k$ decays."
              ]
            }
          ],
          mistakes: [
            "Writing $\\sin(a + b) = \\sin a + \\sin b$ — trig functions are not linear; use the sum formula.",
            "Forgetting that $\\log(x + y) \\neq \\log x + \\log y$; the product rule applies to multiplication, not addition.",
            "Using degrees in calculus-mode formulas: derivatives and integrals of trig functions assume radians.",
            "Misreading amplitude as $A + D$ — the vertical shift does not change the amplitude."
          ],
          tips: [
            {
              title: "The Hand Trick",
              icon: "hand",
              body: "For $\\sin 0^\\circ, 30^\\circ, 45^\\circ, 60^\\circ, 90^\\circ$, write $\\frac{\\sqrt{0}}{2}, \\frac{\\sqrt{1}}{2}, \\frac{\\sqrt{2}}{2}, \\frac{\\sqrt{3}}{2}, \\frac{\\sqrt{4}}{2}$. Cosine runs the same list backwards."
            },
            {
              title: "ASTC: All Students Take Calculus",
              icon: "compass",
              body: "Quadrant I: all trig functions positive. QII: sine only. QIII: tangent only. QIV: cosine only. Sketch the angle before evaluating a sign-sensitive expression."
            },
            {
              title: "Logs Undo Exponentials",
              icon: "undo-2",
              body: "When a variable sits in an exponent, take the log of both sides. When a variable sits inside a log, exponentiate both sides. The operation that frees the variable is always the inverse."
            }
          ],
          videos: [
            {
              youtube: "1m9p9iubMLU",
              title: "Introduction to the unit circle",
              channel: "Khan Academy",
              takeaways: [
                "How the unit circle defines sine and cosine for all angles.",
                "Why the coordinates of special angles take the values they do.",
                "How radians measure arc length on the unit circle."
              ]
            },
            {
              youtube: "UfY72qdxnvk",
              title: "Analyzing horizontal asymptotes of rational functions",
              channel: "Khan Academy",
              takeaways: [
                "Compare numerator and denominator degrees to find end behaviour.",
                "When degrees are equal, the asymptote is the ratio of leading coefficients.",
                "How rational functions behave as $x \\to \\pm\\infty$."
              ]
            }
          ]
        },

        /* ------------------------------------------------------------------
           4. CALCULUS
           ------------------------------------------------------------------ */
        {
          id: "calculus",
          title: "Calculus",
          icon: "infinity",
          accent: "indigo",
          level: "Advanced",
          blurb: "Derivatives, the chain rule, and definite integrals — change measured exactly.",
          tags: ["calculus", "derivatives", "chain rule", "integrals", "limits", "FTC", "product rule", "optimization"],
          questions: [
            {
              id: "calc-1",
              difficulty: "Beginner",
              tags: ["derivatives", "power rule"],
              prompt: "Differentiate $f(x) = x^3 + 2x$.",
              options: [
                "$f'(x) = 3x^2 + 2$",
                "$f'(x) = 3x^2$",
                "$f'(x) = x^2 + 2$",
                "$f'(x) = 3x^3 + 2x$"
              ],
              answer: 0,
              hint: "Apply the power rule to each term separately: $\\frac{d}{dx}x^n = nx^{n-1}$.",
              explanation: [
                "Differentiate term by term: $\\frac{d}{dx}(x^3) = 3x^2$.",
                "The derivative of $2x$ is $2$, since $\\frac{d}{dx}x = 1$.",
                "The derivative of a sum is the sum of derivatives: $f'(x) = 3x^2 + 2$.",
                "Sanity check: at $x = 0$ the slope is $2$, matching the linear term's visible tilt."
              ]
            },
            {
              id: "calc-2",
              difficulty: "Intermediate",
              tags: ["chain rule", "trigonometry", "composite functions"],
              prompt: "Find $\\frac{d}{dx}\\left[\\sin(3x^2)\\right]$.",
              options: [
                "$6x\\cos(3x^2)$",
                "$\\cos(3x^2)$",
                "$6x\\sin(3x^2)$",
                "$3x^2\\cos(3x^2)$"
              ],
              answer: 0,
              hint: "The outer function is sine and the inner function is $3x^2$. Multiply the outer derivative by the inner derivative.",
              explanation: [
                "Let $u = 3x^2$, so the function is $\\sin u$.",
                "Outer derivative: $\\frac{d}{du}\\sin u = \\cos u$.",
                "Inner derivative: $\\frac{du}{dx} = 6x$.",
                "Chain rule: $\\frac{dy}{dx} = \\cos(3x^2) \\cdot 6x = 6x\\cos(3x^2)$."
              ]
            },
            {
              id: "calc-3",
              difficulty: "Intermediate",
              tags: ["definite integrals", "fundamental theorem", "power rule"],
              prompt: "Evaluate $\\displaystyle\\int_0^2 3x^2\\,dx$.",
              options: ["$8$", "$6$", "$12$", "$4$"],
              answer: 0,
              hint: "Find an antiderivative, then evaluate it at the upper limit minus the lower limit.",
              explanation: [
                "An antiderivative of $3x^2$ is $x^3$, since $\\frac{d}{dx}x^3 = 3x^2$.",
                "By the Fundamental Theorem of Calculus: $\\left[x^3\\right]_0^2 = 2^3 - 0^3$.",
                "Compute: $8 - 0 = 8$.",
                "Geometrically this is the area under $y = 3x^2$ from $0$ to $2$."
              ]
            },
            {
              id: "calc-4",
              difficulty: "Advanced",
              tags: ["product rule", "derivatives", "exponential"],
              prompt: "Find $\\frac{d}{dx}\\left[x^2 e^x\\right]$.",
              options: [
                "$e^x(x^2 + 2x)$",
                "$2xe^x$",
                "$x^2e^x$",
                "$e^x(x^2 - 2x)$"
              ],
              answer: 0,
              hint: "Use the product rule: $(uv)' = u'v + uv'$. Let $u = x^2$ and $v = e^x$.",
              explanation: [
                "Identify the factors: $u = x^2$ and $v = e^x$.",
                "Derivatives: $u' = 2x$ and $v' = e^x$.",
                "Product rule: $(uv)' = u'v + uv' = 2x e^x + x^2 e^x$.",
                "Factor out $e^x$: $\\frac{d}{dx}\\left[x^2e^x\\right] = e^x(x^2 + 2x)$."
              ]
            }
          ],
          study: [
            {
              id: "calc-s1",
              title: "Derivative Rules Table",
              icon: "table",
              summary: "Almost every derivative on an exam is one of six rules applied in sequence.",
              points: [
                "Power: $\\frac{d}{dx}x^n = nx^{n-1}$. Constant: $\\frac{d}{dx}c = 0$.",
                "Product: $(uv)' = u'v + uv'$. Quotient: $\\left(\\frac{u}{v}\\right)' = \\frac{u'v - uv'}{v^2}$.",
                "Chain: $\\frac{d}{dx}f(g(x)) = f'(g(x))\\,g'(x)$.",
                "Core functions: $\\frac{d}{dx}e^x = e^x$, $\\frac{d}{dx}\\ln x = \\frac{1}{x}$, $\\frac{d}{dx}\\sin x = \\cos x$, $\\frac{d}{dx}\\cos x = -\\sin x$."
              ]
            },
            {
              id: "calc-s2",
              title: "The Chain Rule in Plain English",
              icon: "link",
              summary: "Derivative of the outside, times derivative of the inside — repeat for every layer.",
              points: [
                "For $y = f(g(x))$, work outside-in: differentiate $f$, keep $g(x)$ untouched, then multiply by $g'(x)$.",
                "Example: $\\frac{d}{dx}(2x + 1)^5 = 5(2x+1)^4 \\cdot 2 = 10(2x+1)^4$.",
                "Example: $\\frac{d}{dx}e^{x^2} = e^{x^2} \\cdot 2x$.",
                "The most common error is forgetting the inner derivative — always ask 'what is inside?'."
              ]
            },
            {
              id: "calc-s3",
              title: "Definite Integrals & the FTC",
              icon: "area-chart",
              summary: "Integration accumulates; the Fundamental Theorem says accumulation is reversed differentiation.",
              points: [
                "FTC Part 2: $\\displaystyle\\int_a^b f(x)\\,dx = F(b) - F(a)$, where $F' = f$.",
                "Indefinite integrals need $+C$; definite integrals are numbers.",
                "Area below the $x$-axis counts as negative, so split integrals where the graph crosses the axis.",
                "Useful antiderivatives: $\\int x^n\\,dx = \\frac{x^{n+1}}{n+1} + C$, $\\int e^x\\,dx = e^x + C$, $\\int \\frac{1}{x}\\,dx = \\ln|x| + C$."
              ]
            }
          ],
          mistakes: [
            "Forgetting the inner derivative in the chain rule: $\\frac{d}{dx}\\sin(3x^2) \\neq \\cos(3x^2)$.",
            "Dropping $+C$ on indefinite integrals.",
            "Differentiating a product term by term: $(uv)' \\neq u'v'$.",
            "Treating $\\frac{dy}{dx}$ as a fraction to cancel in arbitrary contexts — it is a limit, not a ratio of numbers."
          ],
          tips: [
            {
              title: "Rewrite Before You Differentiate",
              icon: "pencil",
              body: "Convert roots and fractions into powers: $\\frac{1}{\\sqrt{x}} = x^{-1/2}$. The power rule then handles what looked like a quotient rule problem."
            },
            {
              title: "Name the Inside Function",
              icon: "braces",
              body: "For any chain-rule problem, literally write '$u = \\ldots$' at the top of your work. Then differentiate $f(u)$ and multiply by $du/dx$. This removes almost all chain-rule errors under time pressure."
            },
            {
              title: "Check by Integrating",
              icon: "refresh-ccw",
              body: "A derivative answer can be verified by integrating it back. If $\\int f'(x)\\,dx$ returns the original $f(x)$ (up to a constant), your differentiation is correct."
            }
          ],
          videos: [
            {
              youtube: "WUvTyaaNkzM",
              title: "The essence of calculus",
              channel: "3Blue1Brown",
              takeaways: [
                "Derivatives measure sensitivity: a tiny input change scaled by the slope.",
                "Integrals accumulate infinitely many tiny pieces into an area.",
                "The two ideas are inverse processes, which is the core of the Fundamental Theorem."
              ]
            },
            {
              youtube: "rfG8ce4nNh0",
              title: "Integration and the fundamental theorem of calculus",
              channel: "3Blue1Brown",
              takeaways: [
                "Why the area function's derivative returns the original curve.",
                "How to read $\\int_a^b f(x)\\,dx$ as a signed accumulation.",
                "Why antiderivatives let us compute areas exactly."
              ]
            }
          ]
        },

        /* ------------------------------------------------------------------
           5. STATISTICS & PROBABILITY
           ------------------------------------------------------------------ */
        {
          id: "statistics-probability",
          title: "Statistics & Probability",
          icon: "chart-column",
          accent: "indigo",
          level: "Intermediate",
          blurb: "Averages, spread, probability rules and the normal curve — reading evidence without the guesswork.",
          tags: ["statistics", "probability", "mean", "median", "normal distribution", "standard deviation", "z-score"],
          questions: [
            {
              id: "stat-1",
              difficulty: "Beginner",
              tags: ["mean", "averages"],
              prompt: "What is the mean of the data set $4,\; 8,\; 6,\; 10,\; 2$?",
              options: ["$6$", "$5$", "$7.5$", "$30$"],
              answer: 0,
              hint: "Add all the values, then divide by how many there are.",
              explanation: [
                "Add the values: $4 + 8 + 6 + 10 + 2 = 30$.",
                "Count the values: there are $5$ numbers.",
                "Divide: $\bar{x} = \frac{30}{5} = 6$.",
                "The mean is $6$, which sits in the middle of the sorted data $2, 4, 6, 8, 10$."
              ]
            },
            {
              id: "stat-2",
              difficulty: "Intermediate",
              tags: ["median", "ordering"],
              prompt: "What is the median of $3,\; 7,\; 9,\; 12,\; 15,\; 20$?",
              options: ["$10.5$", "$9$", "$12$", "$11$"],
              answer: 0,
              hint: "The data is already sorted. With an even number of values, average the two middle ones.",
              explanation: [
                "The data is sorted, and there are $6$ values — an even count.",
                "The two middle values are the $3$rd and $4$th: $9$ and $12$.",
                "Median $= \frac{9 + 12}{2} = \frac{21}{2} = 10.5$.",
                "Half the data lies below $10.5$ and half above it."
              ]
            },
            {
              id: "stat-3",
              difficulty: "Intermediate",
              tags: ["probability", "dice", "sample space"],
              prompt: "Two fair six-sided dice are rolled. What is the probability that the sum is $7$?",
              options: ["$\frac{1}{6}$", "$\frac{1}{12}$", "$\frac{1}{9}$", "$\frac{5}{36}$"],
              answer: 0,
              hint: "There are $36$ equally likely outcomes. Count the pairs that sum to $7$.",
              explanation: [
                "Each die has $6$ outcomes, so the sample space has $6 \times 6 = 36$ equally likely pairs.",
                "Pairs summing to $7$: $(1,6), (2,5), (3,4), (4,3), (5,2), (6,1)$ — six of them.",
                "Probability $= \frac{6}{36} = \frac{1}{6}$.",
                "That is about $16.7\%$, the most likely sum for two dice."
              ]
            },
            {
              id: "stat-4",
              difficulty: "Advanced",
              tags: ["normal distribution", "empirical rule", "z-score"],
              prompt: "Exam scores are normally distributed with mean $100$ and standard deviation $15$. Approximately what percentage of scores are above $115$?",
              options: ["$16\%$", "$32\%$", "$2.5\%$", "$50\%$"],
              answer: 0,
              hint: "Use the empirical rule: about $68\%$ of values lie within one standard deviation of the mean.",
              explanation: [
                "The score $115$ is exactly one standard deviation above the mean: $100 + 15$.",
                "About $68\%$ of scores lie between $85$ and $115$, leaving $32\%$ outside that interval.",
                "The normal curve is symmetric, so half of that $32\%$ lies above $115$: $16\%$.",
                "Equivalently, $P(Z > 1) \approx 0.1587$, about $16\%$."
              ]
            }
          ],
          study: [
            {
              id: "stat-s1",
              title: "Center, Spread & Outliers",
              icon: "chart-column",
              summary: "One number never describes data. Pair a measure of center with a measure of spread.",
              points: [
                "Mean: $\bar{x} = \frac{\sum x}{n}$ — the balance point, sensitive to outliers.",
                "Median: the middle value of sorted data; robust when the data is skewed.",
                "Standard deviation measures typical distance from the mean; variance is its square, $\sigma^2$.",
                "Report center and spread together — a mean without a standard deviation hides how variable the data is."
              ]
            },
            {
              id: "stat-s2",
              title: "Probability Rules",
              icon: "dice-5",
              summary: "Most probability questions are one of four rules in disguise.",
              points: [
                "Complement: $P(\text{not } A) = 1 - P(A)$.",
                "Addition: $P(A \cup B) = P(A) + P(B) - P(A \cap B)$.",
                "Multiplication: $P(A \cap B) = P(A)\,P(B \mid A)$; simplify to $P(A)P(B)$ only when independent.",
                "Conditional: $P(B \mid A) = \frac{P(A \cap B)}{P(A)}$."
              ]
            },
            {
              id: "stat-s3",
              title: "The Normal Curve",
              icon: "bell",
              summary: "The empirical rule turns any normal problem into a picture.",
              points: [
                "About $68\%$ of values fall within $1\sigma$ of the mean, $95\%$ within $2\sigma$, and $99.7\%$ within $3\sigma$.",
                "A $z$-score says how many standard deviations a value sits from the mean: $z = \frac{x - \mu}{\sigma}$.",
                "The standard normal has mean $0$ and standard deviation $1$; tables and software report areas under it.",
                "Because the curve is symmetric, $P(Z > 1) = P(Z < -1) \approx 0.16$."
              ]
            }
          ],
          mistakes: [
            "Using the mean for heavily skewed data such as incomes — the median is more representative.",
            "Taking a median without sorting the data first.",
            "Applying $P(A \cap B) = P(A)P(B)$ to dependent events.",
            "Confusing standard deviation with range, or reporting $\pm 1\sigma$ as $95\%$ instead of about $68\%$."
          ],
          tips: [
            {
              title: "Compare Center to Spread",
              icon: "scan",
              body: "If the mean and median are close, the data is roughly symmetric. If they diverge, look at a histogram before choosing which average to report."
            },
            {
              title: "Count the Complement",
              icon: "undo-2",
              body: "When a question says 'at least one', compute $1 - P(\text{none})$ instead. It is almost always the shorter calculation."
            },
            {
              title: "Standardise with z",
              icon: "move-horizontal",
              body: "Convert any normal value to a $z$-score, then use the empirical rule. $z = 2$ means 'two standard deviations above the mean', which immediately gives a tail area of about $2.5\%$."
            }
          ],
          videos: [
            {
              youtube: "k3aKKasOmIw",
              title: "Finding mean, median, and mode",
              channel: "Khan Academy",
              takeaways: [
                "How to compute each measure of center.",
                "When the median describes data better than the mean.",
                "What the mode tells you about repeated values."
              ]
            },
            {
              youtube: "OyddY7DlV58",
              title: "Probability Part 1: Rules and Patterns — Crash Course Statistics #13",
              channel: "CrashCourse",
              takeaways: [
                "Why probabilities are long-run frequencies.",
                "The addition and multiplication rules in practice.",
                "How conditional probability changes a sample space."
              ]
            }
          ]
        }
      ]
    },

    /* ======================================================================
       SCIENCES
       ====================================================================== */
    {
      id: "sciences",
      title: "Sciences",
      tagline: "From the cell to the quantum — how the universe actually runs.",
      icon: "atom",
      accent: "teal",
      subjects: [
        /* ------------------------------------------------------------------
           5. BIOLOGY
           ------------------------------------------------------------------ */
        {
          id: "biology",
          title: "Biology",
          icon: "dna",
          accent: "teal",
          level: "Intermediate",
          blurb: "Cellular respiration, the central dogma, and the two ways cells divide.",
          tags: ["biology", "cellular respiration", "ATP", "DNA", "transcription", "translation", "mitosis", "meiosis", "genetics"],
          questions: [
            {
              id: "bio-1",
              difficulty: "Beginner",
              tags: ["cellular respiration", "ATP", "equations"],
              prompt: "Which equation summarises aerobic cellular respiration?",
              options: [
                "$\\mathrm{C_6H_{12}O_6 + 6O_2 \\rightarrow 6CO_2 + 6H_2O + \\text{ATP}}$",
                "$\\mathrm{6CO_2 + 6H_2O \\rightarrow C_6H_{12}O_6 + 6O_2}$",
                "$\\mathrm{C_6H_{12}O_6 \\rightarrow 2C_3H_6O_3 + \\text{ATP}}$",
                "$\\mathrm{6O_2 + 6H_2O \\rightarrow 12H_2O}$"
              ],
              answer: 0,
              hint: "Respiration burns glucose with oxygen and releases carbon dioxide, water and usable energy.",
              explanation: [
                "Aerobic respiration consumes one glucose and six oxygen molecules.",
                "It produces six carbon dioxide molecules, six water molecules, and ATP.",
                "The reverse reaction, $\\mathrm{6CO_2 + 6H_2O \\rightarrow C_6H_{12}O_6 + 6O_2}$, is photosynthesis.",
                "ATP is the energy currency: the equation is exergonic overall, releasing energy that drives ATP synthesis."
              ]
            },
            {
              id: "bio-2",
              difficulty: "Intermediate",
              tags: ["cellular respiration", "glycolysis", "organelles"],
              prompt: "Where does glycolysis take place in a eukaryotic cell?",
              options: [
                "In the cytoplasm",
                "In the mitochondrial matrix",
                "On the inner mitochondrial membrane",
                "In the nucleus"
              ],
              answer: 0,
              hint: "Glycolysis is the one respiration stage that does not require membrane-bound organelles — or oxygen.",
              explanation: [
                "Glycolysis splits glucose into two pyruvate molecules in the cytosol (cytoplasm).",
                "It is anaerobic: it produces a net $2$ ATP and $2$ NADH without oxygen.",
                "Pyruvate then enters the mitochondrion for the Krebs cycle, which occurs in the matrix.",
                "The electron transport chain and chemiosmosis occur on the inner mitochondrial membrane."
              ]
            },
            {
              id: "bio-3",
              difficulty: "Intermediate",
              tags: ["transcription", "RNA polymerase", "central dogma"],
              prompt: "Which enzyme synthesises the mRNA transcript during transcription?",
              options: [
                "RNA polymerase",
                "DNA polymerase",
                "Helicase",
                "The ribosome"
              ],
              answer: 0,
              hint: "Transcription copies DNA into RNA. Look for the enzyme named after the product.",
              explanation: [
                "RNA polymerase binds the promoter and unwinds the DNA locally.",
                "It reads the template strand $3' \\to 5'$ and builds mRNA $5' \\to 3'$.",
                "It uses uracil instead of thymine when pairing with adenine.",
                "DNA polymerase is for replication; the ribosome performs translation, not transcription."
              ]
            },
            {
              id: "bio-4",
              difficulty: "Advanced",
              tags: ["meiosis", "mitosis", "chromosomes", "gametes"],
              prompt: "A diploid human cell with $46$ chromosomes completes meiosis. What does each resulting gamete contain?",
              options: [
                "$23$ chromosomes, each consisting of one chromatid",
                "$46$ chromosomes, each consisting of two chromatids",
                "$23$ chromosomes, each consisting of two chromatids",
                "$92$ chromosomes, each consisting of one chromatid"
              ],
              answer: 0,
              hint: "Meiosis halves the chromosome number, and a second division separates the sister chromatids.",
              explanation: [
                "Meiosis I separates homologous chromosomes: the chromosome number drops from $2n = 46$ to $n = 23$, but each chromosome still has two sister chromatids.",
                "Meiosis II separates those sister chromatids, producing haploid cells with single-chromatid chromosomes.",
                "Four haploid gametes result, each with $23$ chromosomes and one chromatid per chromosome.",
                "Mitosis, by contrast, produces two genetically identical diploid cells with $46$ chromosomes."
              ]
            }
          ],
          study: [
            {
              id: "bio-s1",
              title: "Cellular Respiration: The ATP Assembly Line",
              icon: "battery-charging",
              summary: "Glucose is dismantled in stages, and the energy released pumps protons to build ATP.",
              points: [
                "Glycolysis (cytoplasm): glucose → $2$ pyruvate, net $2$ ATP, $2$ NADH. No oxygen needed.",
                "Pyruvate oxidation + Krebs cycle (matrix): produces $\\mathrm{CO_2}$, $2$ ATP, NADH and FADH$_2$.",
                "Electron transport chain (inner membrane): NADH and FADH$_2$ donate electrons, pumping $\\mathrm{H^+}$ into the intermembrane space.",
                "Chemiosmosis: protons flow back through ATP synthase, producing roughly $26$–$28$ ATP — a total of about $30$–$32$ ATP per glucose."
              ]
            },
            {
              id: "bio-s2",
              title: "Transcription & Translation",
              icon: "arrow-right-left",
              summary: "DNA → RNA → protein: the central dogma, with RNA as the working copy.",
              points: [
                "Transcription: RNA polymerase binds a promoter, reads the template strand $3'\\to5'$, and builds mRNA $5'\\to3'$.",
                "In RNA, uracil replaces thymine; the coding strand has the same sequence as the mRNA (with T instead of U).",
                "Eukaryotic mRNA is processed: a $5'$ cap, a poly-A tail, and splicing out introns.",
                "Translation: the ribosome reads codons $5'\\to3'$, tRNA delivers amino acids, and the chain folds into a protein."
              ]
            },
            {
              id: "bio-s3",
              title: "Mitosis vs. Meiosis",
              icon: "split",
              summary: "Same machinery, different goal: copy the cell or shuffle the genome.",
              points: [
                "Mitosis: one division → $2$ genetically identical diploid cells; for growth and repair.",
                "Meiosis: two divisions → $4$ genetically unique haploid gametes; for sexual reproduction.",
                "Crossing over in prophase I and independent assortment in metaphase I create genetic variation.",
                "Homologous chromosomes separate in meiosis I; sister chromatids separate in meiosis II."
              ]
            }
          ],
          mistakes: [
            "Saying transcription produces protein — transcription makes RNA; translation makes protein.",
            "Confusing the template strand with the coding strand when writing an mRNA sequence.",
            "Claiming meiosis produces two cells — it produces four haploid cells.",
            "Quoting a fixed '38 ATP' figure: modern estimates are about $30$–$32$ ATP per glucose because of transport costs."
          ],
          tips: [
            {
              title: "PMAT for the Stages",
              icon: "list",
              body: "Prophase, Metaphase, Anaphase, Telophase. In meiosis add 'I' and 'II'. Memory hook: 'PMAT — Please Make Another Two' for mitosis."
            },
            {
              title: "Follow the Carbon",
              icon: "route",
              body: "In respiration, trace carbon: glucose ($6$C) → $2$ pyruvate ($3$C each) → acetyl-CoA ($2$C) → $\\mathrm{CO_2}$ released in the Krebs cycle. Oxygen is the final electron acceptor, not an input to the Krebs cycle."
            },
            {
              title: "Read Codons Like Words",
              icon: "book-open",
              body: "Translate mRNA $5'\\to3'$ in non-overlapping triplets starting at AUG. Use the codon table from the inside out: first base, second base, third base."
            }
          ],
          videos: [
            {
              youtube: "00jbG_cfGuQ",
              title: "ATP & Respiration: Crash Course Biology #7",
              channel: "CrashCourse",
              takeaways: [
                "Why ATP is the cell's rechargeable energy currency.",
                "How glycolysis, the Krebs cycle and the electron transport chain connect.",
                "Where each stage happens and how much ATP it yields."
              ]
            },
            {
              youtube: "j6YaOqKORYY",
              title: "Transcription: How mRNA Helped Save Lives — Crash Course Biology #34",
              channel: "CrashCourse",
              takeaways: [
                "How RNA polymerase copies a DNA template into mRNA.",
                "Why mRNA vaccines were possible once transcription was understood.",
                "The difference between the template and coding strands."
              ]
            },
            {
              youtube: "zrKdz93WlVk",
              title: "Mitosis vs. Meiosis: Side by Side Comparison",
              channel: "Amoeba Sisters",
              takeaways: [
                "Mitosis produces identical diploid cells; meiosis produces unique haploid gametes.",
                "Crossing over and independent assortment generate variation.",
                "How chromosome number changes across the two meiotic divisions."
              ]
            }
          ]
        },

        /* ------------------------------------------------------------------
           6. CHEMISTRY
           ------------------------------------------------------------------ */
        {
          id: "chemistry",
          title: "Chemistry",
          icon: "flask-conical",
          accent: "teal",
          level: "Intermediate",
          blurb: "Moles, balanced equations, stoichiometry and the pH scale.",
          tags: ["chemistry", "moles", "stoichiometry", "balancing equations", "pH", "acids", "bases", "molar mass"],
          questions: [
            {
              id: "chem-1",
              difficulty: "Beginner",
              tags: ["moles", "molar mass", "water"],
              prompt: "How many moles are in $36\\,\\mathrm{g}$ of water? ($M_{\\mathrm{H_2O}} = 18\\,\\mathrm{g\\,mol^{-1}}$)",
              options: ["$2\\,\\mathrm{mol}$", "$1\\,\\mathrm{mol}$", "$18\\,\\mathrm{mol}$", "$0.5\\,\\mathrm{mol}$"],
              answer: 0,
              hint: "Moles $= \\frac{\\text{mass}}{\\text{molar mass}}$.",
              explanation: [
                "Use $n = \\frac{m}{M}$.",
                "Substitute: $n = \\frac{36\\,\\mathrm{g}}{18\\,\\mathrm{g\\,mol^{-1}}}$.",
                "Divide: $n = 2\\,\\mathrm{mol}$.",
                "That is $2 \\times 6.022\\times10^{23} \\approx 1.2\\times10^{24}$ water molecules."
              ]
            },
            {
              id: "chem-2",
              difficulty: "Beginner",
              tags: ["balancing equations", "combustion", "coefficients"],
              prompt: "Balance the equation $\\mathrm{H_2 + O_2 \\rightarrow H_2O}$. Which coefficients are correct (in order)?",
              options: ["$2,\\;1,\\;2$", "$1,\\;1,\\;1$", "$1,\\;2,\\;1$", "$2,\\;2,\\;2$"],
              answer: 0,
              hint: "Oxygen comes in pairs on the left. Start by making two water molecules so the oxygen atoms match.",
              explanation: [
                "Right side has $1$ oxygen per water; left side has $2$ oxygen per $\\mathrm{O_2}$ molecule.",
                "Place a $2$ in front of $\\mathrm{H_2O}$ to balance oxygen: $\\mathrm{H_2 + O_2 \\rightarrow 2H_2O}$.",
                "Now the right side has $4$ hydrogens, so place a $2$ in front of $\\mathrm{H_2}$.",
                "Balanced: $\\mathrm{2H_2 + O_2 \\rightarrow 2H_2O}$ — coefficients $2, 1, 2$."
              ]
            },
            {
              id: "chem-3",
              difficulty: "Intermediate",
              tags: ["pH", "acids", "logarithms"],
              prompt: "What is the pH of a $0.010\\,\\mathrm{M}$ solution of $\\mathrm{HCl}$?",
              options: ["$2$", "$1$", "$12$", "$0.01$"],
              answer: 0,
              hint: "$\\mathrm{HCl}$ is a strong acid, so it dissociates completely: $[\\mathrm{H^+}] = 0.010\\,\\mathrm{M}$. Then use $\\mathrm{pH} = -\\log[\\mathrm{H^+}]$.",
              explanation: [
                "$\\mathrm{HCl}$ dissociates completely: $[\\mathrm{H^+}] = 1.0\\times10^{-2}\\,\\mathrm{M}$.",
                "$\\mathrm{pH} = -\\log(1.0\\times10^{-2})$.",
                "$\\log(10^{-2}) = -2$, so $\\mathrm{pH} = 2$.",
                "A pH of $2$ is strongly acidic; each factor-of-ten increase in concentration lowers pH by one unit."
              ]
            },
            {
              id: "chem-4",
              difficulty: "Advanced",
              tags: ["stoichiometry", "limiting reactant", "molar mass"],
              prompt: "Using $\\mathrm{2H_2 + O_2 \\rightarrow 2H_2O}$, how many grams of water form when $4\\,\\mathrm{mol}$ of $\\mathrm{H_2}$ react with excess $\\mathrm{O_2}$? ($M_{\\mathrm{H_2O}} = 18\\,\\mathrm{g\\,mol^{-1}}$)",
              options: ["$72\\,\\mathrm{g}$", "$36\\,\\mathrm{g}$", "$18\\,\\mathrm{g}$", "$144\\,\\mathrm{g}$"],
              answer: 0,
              hint: "Use the mole ratio from the balanced equation, then convert moles of water to grams.",
              explanation: [
                "Mole ratio: $2\\,\\mathrm{mol\\ H_2}$ produce $2\\,\\mathrm{mol\\ H_2O}$ — a $1:1$ ratio.",
                "So $4\\,\\mathrm{mol\\ H_2}$ produce $4\\,\\mathrm{mol\\ H_2O}$.",
                "Convert to mass: $m = nM = 4 \\times 18$.",
                "$m = 72\\,\\mathrm{g}$ of water."
              ]
            }
          ],
          study: [
            {
              id: "chem-s1",
              title: "The Mole Map",
              icon: "map",
              summary: "Every stoichiometry problem travels through moles — mass, particles and gas volume all convert to it.",
              points: [
                "$n = \\frac{m}{M}$ (mass ÷ molar mass); $N = nN_A$ with $N_A = 6.022\\times10^{23}\\,\\mathrm{mol^{-1}}$.",
                "At STP, $1\\,\\mathrm{mol}$ of ideal gas occupies $22.4\\,\\mathrm{L}$.",
                "Molarity: $M = \\frac{n}{V}$ with $V$ in litres.",
                "Route everything through moles: given → moles → mole ratio → target."
              ]
            },
            {
              id: "chem-s2",
              title: "Balancing Equations",
              icon: "scale",
              summary: "Atoms are conserved. Coefficients change, subscripts never do.",
              points: [
                "Balance by inspection: start with the most complex molecule, then do hydrogen, then oxygen last.",
                "Use the smallest whole-number coefficients.",
                "Fractions can be used as intermediates, then multiplied through.",
                "Check every element on both sides before moving on."
              ]
            },
            {
              id: "chem-s3",
              title: "Acids, Bases & pH",
              icon: "droplets",
              summary: "pH is a logarithmic concentration scale — one unit means a factor of ten.",
              points: [
                "$\\mathrm{pH} = -\\log[\\mathrm{H^+}]$ and $\\mathrm{pOH} = -\\log[\\mathrm{OH^-}]$.",
                "At $25^\\circ\\mathrm{C}$: $\\mathrm{pH} + \\mathrm{pOH} = 14$.",
                "Strong acids and bases dissociate completely; weak ones reach an equilibrium described by $K_a$ or $K_b$.",
                "A change of one pH unit is a tenfold change in $[\\mathrm{H^+}]$."
              ]
            }
          ],
          mistakes: [
            "Confusing coefficients with subscripts when balancing — changing a subscript changes the substance.",
            "Using grams directly in a mole ratio; convert to moles first.",
            "Forgetting that pH is logarithmic: pH $3$ is ten times more acidic than pH $4$.",
            "Assuming the limiting reactant is the one with the smallest mass — it depends on moles and the balanced ratio."
          ],
          tips: [
            {
              title: "Mole Map First",
              icon: "workflow",
              body: "Before touching numbers, sketch: mass → moles → ratio → moles → mass. Every stoichiometry question becomes a walk along that path, and the units cancel as you go."
            },
            {
              title: "Balance Metals, Then Nonmetals, Then H and O",
              icon: "list-ordered",
              body: "Leave hydrogen and oxygen for last — they appear in the most places, so balancing them early forces rework. Treat polyatomic ions as single units when they appear unchanged on both sides."
            },
            {
              title: "pH Shortcut",
              icon: "zap",
              body: "For $[\\mathrm{H^+}] = 1\\times10^{-n}$, pH is simply $n$. For $0.01\\,\\mathrm{M}$ strong acid, pH $=2$. For $0.001\\,\\mathrm{M}$, pH $=3$. Reserve the calculator for non-power-of-ten concentrations."
            }
          ],
          videos: [
            {
              youtube: "UL1jmJaUkaQ",
              title: "Stoichiometry — Chemistry for Massive Creatures: Crash Course Chemistry #6",
              channel: "CrashCourse",
              takeaways: [
                "How balanced equations encode mole ratios.",
                "Converting between mass, moles and particles.",
                "Why stoichiometry is the accountant's toolkit of chemistry."
              ]
            },
            {
              youtube: "uVFCOfSuPTo",
              title: "The Nucleus: Crash Course Chemistry #1",
              channel: "CrashCourse",
              takeaways: [
                "How protons, neutrons and electrons build every atom.",
                "What atomic number and mass number represent.",
                "Why the nucleus determines an element's identity."
              ]
            }
          ]
        },

        /* ------------------------------------------------------------------
           7. CLASSICAL PHYSICS
           ------------------------------------------------------------------ */
        {
          id: "classical-physics",
          title: "Classical Physics",
          icon: "magnet",
          accent: "teal",
          level: "Intermediate",
          blurb: "Kinematics, Newton's laws and energy conservation — the mechanics of everyday motion.",
          tags: ["physics", "kinematics", "Newton's laws", "energy", "motion", "acceleration", "forces", "conservation"],
          questions: [
            {
              id: "phys-1",
              difficulty: "Beginner",
              tags: ["kinematics", "acceleration", "velocity"],
              prompt: "A car starts from rest and accelerates at $2\\,\\mathrm{m/s^2}$ for $5\\,\\mathrm{s}$. What is its final velocity?",
              options: ["$10\\,\\mathrm{m/s}$", "$5\\,\\mathrm{m/s}$", "$20\\,\\mathrm{m/s}$", "$2\\,\\mathrm{m/s}$"],
              answer: 0,
              hint: "Use $v = u + at$, with initial velocity $u = 0$.",
              explanation: [
                "List the knowns: $u = 0$, $a = 2\\,\\mathrm{m/s^2}$, $t = 5\\,\\mathrm{s}$.",
                "Apply $v = u + at$: $v = 0 + (2)(5)$.",
                "$v = 10\\,\\mathrm{m/s}$.",
                "Units check: $(\\mathrm{m/s^2})(\\mathrm{s}) = \\mathrm{m/s}$. ✓"
              ]
            },
            {
              id: "phys-2",
              difficulty: "Beginner",
              tags: ["Newton's second law", "force", "acceleration"],
              prompt: "A net force of $20\\,\\mathrm{N}$ acts on a $4\\,\\mathrm{kg}$ mass. What is the acceleration?",
              options: ["$5\\,\\mathrm{m/s^2}$", "$80\\,\\mathrm{m/s^2}$", "$0.2\\,\\mathrm{m/s^2}$", "$24\\,\\mathrm{m/s^2}$"],
              answer: 0,
              hint: "Newton's second law: $F = ma$. Divide the force by the mass.",
              explanation: [
                "Start from $F = ma$.",
                "Rearrange: $a = \\frac{F}{m}$.",
                "Substitute: $a = \\frac{20\\,\\mathrm{N}}{4\\,\\mathrm{kg}}$.",
                "$a = 5\\,\\mathrm{m/s^2}$ in the direction of the net force."
              ]
            },
            {
              id: "phys-3",
              difficulty: "Intermediate",
              tags: ["free fall", "kinematics", "gravity"],
              prompt: "A ball is dropped from rest from a height of $45\\,\\mathrm{m}$. Using $g = 10\\,\\mathrm{m/s^2}$, how long does it take to reach the ground?",
              options: ["$3\\,\\mathrm{s}$", "$4.5\\,\\mathrm{s}$", "$9\\,\\mathrm{s}$", "$2\\,\\mathrm{s}$"],
              answer: 0,
              hint: "Use $s = ut + \\frac{1}{2}at^2$ with $u = 0$ and $a = g$.",
              explanation: [
                "With $u = 0$, the displacement equation reduces to $s = \\frac{1}{2}gt^2$.",
                "Substitute: $45 = \\frac{1}{2}(10)t^2 = 5t^2$.",
                "Solve: $t^2 = 9$, so $t = 3\\,\\mathrm{s}$ (take the positive root).",
                "Check: in $3\\,\\mathrm{s}$ the ball reaches $v = gt = 30\\,\\mathrm{m/s}$, and the average velocity $15\\,\\mathrm{m/s}$ over $3\\,\\mathrm{s}$ covers $45\\,\\mathrm{m}$. ✓"
              ]
            },
            {
              id: "phys-4",
              difficulty: "Advanced",
              tags: ["conservation of energy", "potential energy", "kinetic energy"],
              prompt: "A cart at rest at the top of a frictionless $20\\,\\mathrm{m}$ hill rolls to the bottom. Using $g = 10\\,\\mathrm{m/s^2}$, what is its speed at the bottom?",
              options: ["$20\\,\\mathrm{m/s}$", "$10\\,\\mathrm{m/s}$", "$40\\,\\mathrm{m/s}$", "$14\\,\\mathrm{m/s}$"],
              answer: 0,
              hint: "All gravitational potential energy converts to kinetic energy: $mgh = \\frac{1}{2}mv^2$.",
              explanation: [
                "Energy conservation: $mgh = \\frac{1}{2}mv^2$.",
                "Mass cancels: $gh = \\frac{1}{2}v^2$, so $v = \\sqrt{2gh}$.",
                "Substitute: $v = \\sqrt{2(10)(20)} = \\sqrt{400}$.",
                "$v = 20\\,\\mathrm{m/s}$. The result is independent of mass and of the hill's shape, as long as it is frictionless."
              ]
            }
          ],
          study: [
            {
              id: "phys-s1",
              title: "The Kinematics Equations",
              icon: "gauge",
              summary: "For constant acceleration, five quantities and four equations cover every problem.",
              points: [
                "$v = u + at$ (no displacement).",
                "$s = ut + \\frac{1}{2}at^2$ (no final velocity).",
                "$v^2 = u^2 + 2as$ (no time).",
                "$s = \\frac{u + v}{2}\\,t$ (no acceleration).",
                "Choose the equation that omits the quantity you neither know nor need."
              ]
            },
            {
              id: "phys-s2",
              title: "Newton's Three Laws",
              icon: "arrow-down-up",
              summary: "Forces explain changes in motion, not motion itself.",
              points: [
                "First law: without a net force, an object keeps its velocity — at rest or moving uniformly.",
                "Second law: $F_{\\text{net}} = ma$; acceleration points the same way as the net force.",
                "Third law: forces come in equal and opposite pairs acting on different objects.",
                "Weight is a force, $W = mg$, measured in newtons; mass is not a force."
              ]
            },
            {
              id: "phys-s3",
              title: "Work, Energy & Power",
              icon: "zap",
              summary: "Energy bookkeeping often replaces force analysis entirely.",
              points: [
                "Work: $W = Fd\\cos\\theta$; only the component along the displacement does work.",
                "Kinetic energy: $KE = \\frac{1}{2}mv^2$; gravitational potential energy: $PE = mgh$.",
                "Conservation: $KE_i + PE_i = KE_f + PE_f$ when only conservative forces act.",
                "Power: $P = \\frac{W}{t}$, measured in watts."
              ]
            }
          ],
          mistakes: [
            "Dropping the vector nature of velocity and acceleration: direction matters, so signs must be consistent.",
            "Using $s = ut + \\frac{1}{2}at^2$ when acceleration is not constant.",
            "Confusing mass with weight: $4\\,\\mathrm{kg}$ on the Moon still has $4\\,\\mathrm{kg}$ of mass but only about $6.5\\,\\mathrm{N}$ of weight.",
            "Forgetting that the normal force is not always equal to $mg$ — on an incline it is $mg\\cos\\theta$."
          ],
          tips: [
            {
              title: "Let Units Check Your Work",
              icon: "check-check",
              body: "Carry units through every line. If the left side ends in $\\mathrm{m/s}$ and the right side ends in $\\mathrm{m}$, the equation is wrong regardless of the arithmetic."
            },
            {
              title: "Pick a Positive Direction",
              icon: "arrow-up-narrow-wide",
              body: "At the start of a problem, declare 'up is positive'. Then gravity is $-g$ and every sign follows automatically. Most kinematics errors are really sign errors."
            },
            {
              title: "Energy Ledger",
              icon: "notebook-pen",
              body: "Write 'before' and 'after' columns with $KE$ and $PE$. Energy is never created or destroyed, only moved between rows — the ledger balances even when forces are complicated."
            }
          ],
          videos: [
            {
              youtube: "ZM8ECpBuQYE",
              title: "Motion in a Straight Line: Crash Course Physics #1",
              channel: "CrashCourse",
              takeaways: [
                "How position, velocity and acceleration relate.",
                "Reading motion graphs: slope is velocity, curvature is acceleration.",
                "How to apply the constant-acceleration equations."
              ]
            },
            {
              youtube: "kKKM8Y-u7ds",
              title: "Newton's Laws: Crash Course Physics #5",
              channel: "CrashCourse",
              takeaways: [
                "Inertia and why motion needs no force to continue.",
                "$F = ma$ as the cause-and-effect rule for motion.",
                "Why action–reaction pairs never cancel on the same object."
              ]
            },
            {
              youtube: "TLUZnCvuGBk",
              title: "Conservation of energy",
              channel: "Khan Academy",
              takeaways: [
                "How potential energy converts into kinetic energy.",
                "Why mass cancels in many energy equations.",
                "Using energy conservation to skip force calculations."
              ]
            }
          ]
        },

        /* ------------------------------------------------------------------
           8. QUANTUM MECHANICS
           ------------------------------------------------------------------ */
        {
          id: "quantum-mechanics",
          title: "Quantum Mechanics",
          icon: "atom",
          accent: "teal",
          level: "Advanced",
          blurb: "Wave–particle duality, the Schrödinger equation and the limits of certainty.",
          tags: ["quantum mechanics", "wave-particle duality", "Schrödinger equation", "Heisenberg", "uncertainty principle", "photons", "wavefunction", "quantization"],
          questions: [
            {
              id: "qm-1",
              difficulty: "Beginner",
              tags: ["photons", "energy", "wavelength"],
              prompt: "What is the energy of a photon with wavelength $500\\,\\mathrm{nm}$? (Use $hc \\approx 1240\\,\\mathrm{eV\\cdot nm}$.)",
              options: [
                "$2.48\\,\\mathrm{eV}$",
                "$1.24\\,\\mathrm{eV}$",
                "$4.96\\,\\mathrm{eV}$",
                "$0.50\\,\\mathrm{eV}$"
              ],
              answer: 0,
              hint: "Photon energy is $E = \\frac{hc}{\\lambda}$. With $\\lambda$ in nanometres, $hc = 1240\\,\\mathrm{eV\\cdot nm}$ gives the answer directly in eV.",
              explanation: [
                "Start with $E = hf = \\frac{hc}{\\lambda}$.",
                "Substitute $hc = 1240\\,\\mathrm{eV\\cdot nm}$ and $\\lambda = 500\\,\\mathrm{nm}$.",
                "$E = \\frac{1240}{500} = 2.48\\,\\mathrm{eV}$.",
                "In joules: $2.48\\times1.602\\times10^{-19} \\approx 3.97\\times10^{-19}\\,\\mathrm{J}$, which is the energy of green light."
              ]
            },
            {
              id: "qm-2",
              difficulty: "Intermediate",
              tags: ["de Broglie", "matter waves", "momentum"],
              prompt: "What is the de Broglie wavelength of an electron with momentum $1.0\\times10^{-24}\\,\\mathrm{kg\\,m/s}$? ($h = 6.63\\times10^{-34}\\,\\mathrm{J\\,s}$)",
              options: [
                "$6.6\\times10^{-10}\\,\\mathrm{m}$",
                "$6.6\\times10^{-34}\\,\\mathrm{m}$",
                "$1.5\\times10^{-9}\\,\\mathrm{m}$",
                "$6.6\\times10^{-24}\\,\\mathrm{m}$"
              ],
              answer: 0,
              hint: "Matter waves obey $\\lambda = \\frac{h}{p}$.",
              explanation: [
                "Use the de Broglie relation $\\lambda = \\frac{h}{p}$.",
                "Substitute: $\\lambda = \\frac{6.63\\times10^{-34}}{1.0\\times10^{-24}}$.",
                "Divide the coefficients and subtract exponents: $6.63\\times10^{-10}\\,\\mathrm{m}$.",
                "That is about $0.66\\,\\mathrm{nm}$ — comparable to atomic spacing, which is why electron diffraction works."
              ]
            },
            {
              id: "qm-3",
              difficulty: "Intermediate",
              tags: ["Heisenberg", "uncertainty principle", "momentum"],
              prompt: "If the position uncertainty $\\Delta x$ of a particle is halved, what happens to the minimum momentum uncertainty $\\Delta p$?",
              options: [
                "It doubles.",
                "It halves.",
                "It stays the same.",
                "It quadruples."
              ],
              answer: 0,
              hint: "Heisenberg's relation is $\\Delta x\\,\\Delta p \\geq \\frac{\\hbar}{2}$. The product has a fixed lower bound.",
              explanation: [
                "The uncertainty principle requires $\\Delta x\\,\\Delta p \\geq \\frac{\\hbar}{2}$.",
                "If $\\Delta x$ becomes $\\frac{\\Delta x}{2}$, then the product constraint forces $\\Delta p \\geq \\frac{\\hbar}{2} \\cdot \\frac{2}{\\Delta x}$.",
                "The new minimum is twice the old minimum, so $\\Delta p$ doubles.",
                "This is not a measurement flaw — it is a property of quantum states themselves."
              ]
            },
            {
              id: "qm-4",
              difficulty: "Advanced",
              tags: ["particle in a box", "quantization", "energy levels"],
              prompt: "For a particle in a one-dimensional box, the energy levels are $E_n = \\frac{n^2h^2}{8mL^2}$. How many times larger is $E_2$ than $E_1$?",
              options: ["$4$", "$2$", "$8$", "$\\sqrt{2}$"],
              answer: 0,
              hint: "The energy depends on $n^2$. Compare $2^2$ with $1^2$.",
              explanation: [
                "Write the ratio: $\\frac{E_2}{E_1} = \\frac{2^2h^2/(8mL^2)}{1^2h^2/(8mL^2)}$.",
                "All constants cancel, leaving $\\frac{E_2}{E_1} = \\frac{4}{1}$.",
                "So $E_2 = 4E_1$.",
                "The $n^2$ spacing is a direct consequence of fitting whole half-wavelengths inside the box."
              ]
            }
          ],
          study: [
            {
              id: "qm-s1",
              title: "Wave–Particle Duality",
              icon: "waves",
              summary: "Light and matter behave as waves when you look for interference, and as particles when you look for clicks.",
              points: [
                "Photoelectric effect: light arrives in photons of energy $E = hf$; below the threshold frequency, no electrons are emitted regardless of intensity.",
                "Double-slit experiment: single particles build up an interference pattern, one detection at a time.",
                "de Broglie: every particle has a wavelength $\\lambda = \\frac{h}{p}$, observable for electrons and atoms.",
                "Complementarity: wave and particle descriptions are both required, but never in the same measurement."
              ]
            },
            {
              id: "qm-s2",
              title: "The Schrödinger Equation",
              icon: "square-function",
              summary: "The wavefunction $\\psi$ encodes everything measurable about a quantum system.",
              points: [
                "Time-dependent form: $i\\hbar\\frac{\\partial\\psi}{\\partial t} = -\\frac{\\hbar^2}{2m}\\frac{\\partial^2\\psi}{\\partial x^2} + V(x)\\psi$.",
                "Time-independent form: $-\\frac{\\hbar^2}{2m}\\frac{d^2\\psi}{dx^2} + V\\psi = E\\psi$ — an eigenvalue problem.",
                "$|\\psi(x)|^2$ is the probability density of finding the particle at $x$.",
                "Boundary conditions (like $\\psi = 0$ at a box wall) quantise the allowed energies."
              ]
            },
            {
              id: "qm-s3",
              title: "Heisenberg Uncertainty Principle",
              icon: "scan",
              summary: "Certain pairs of properties cannot both be sharp at the same time.",
              points: [
                "$\\Delta x\\,\\Delta p \\geq \\frac{\\hbar}{2}$ and $\\Delta E\\,\\Delta t \\geq \\frac{\\hbar}{2}$.",
                "$\\hbar = \\frac{h}{2\\pi} \\approx 1.055\\times10^{-34}\\,\\mathrm{J\\,s}$.",
                "The effect is negligible for everyday objects but dominant for electrons confined to atomic scales.",
                "It is a statement about state preparation and measurement statistics, not about clumsy instruments."
              ]
            }
          ],
          mistakes: [
            "Treating $\\psi$ itself as a probability — the measurable quantity is $|\\psi|^2$.",
            "Describing the uncertainty principle as a measurement-error problem rather than a fundamental limit.",
            "Forgetting that photons have zero rest mass but nonzero momentum, $p = \\frac{h}{\\lambda}$.",
            "Assuming energy is continuous inside a bound system — confinement is exactly what produces discrete levels."
          ],
          tips: [
            {
              title: "Memorise hc = 1240 eV·nm",
              icon: "zap",
              body: "This single constant converts wavelength to photon energy instantly. $500\\,\\mathrm{nm}$ → $2.48\\,\\mathrm{eV}$; $1240\\,\\mathrm{nm}$ → $1\\,\\mathrm{eV}$. Most photoelectric problems become one division."
            },
            {
              title: "Quantisation Scales as n²",
              icon: "trending-up",
              body: "In a box or a hydrogen atom, energy gaps grow as $n^2$ (box) or $-1/n^2$ (hydrogen). Write the ratio first, cancel constants, then plug in numbers — it saves arithmetic and reveals the physics."
            },
            {
              title: "Normalise Before You Interpret",
              icon: "check-check",
              body: "A valid wavefunction must satisfy $\\int|\\psi|^2\\,dx = 1$. Check normalisation before computing probabilities; an unnormalised $\\psi$ gives impossible answers greater than $100\\%$."
            }
          ],
          videos: [
            {
              youtube: "DfQH3o6dKss",
              title: "Wave Particle Duality Explained",
              channel: "Perimeter Institute for Theoretical Physics",
              takeaways: [
                "Why the double-slit experiment forces both wave and particle descriptions.",
                "How single-particle interference builds up over time.",
                "What complementarity means for measurement."
              ]
            },
            {
              youtube: "LFC2HsT6Bh4",
              title: "The True Meaning of Schrödinger's Equation",
              channel: "The Science Asylum",
              takeaways: [
                "What the wavefunction represents physically.",
                "Why the equation is a statement about energy conservation.",
                "How probability density connects to measurement."
              ]
            },
            {
              youtube: "PZIoFD_Z73M",
              title: "Heisenberg uncertainty principle",
              channel: "Khan Academy Organic Chemistry",
              takeaways: [
                "The meaning of $\\Delta x\\,\\Delta p \\geq \\frac{\\hbar}{2}$.",
                "Why confined particles must have momentum spread.",
                "How the principle limits what can be known simultaneously."
              ]
            }
          ]
        },

        /* ------------------------------------------------------------------
           9. ASTRONOMY
           ------------------------------------------------------------------ */
        {
          id: "astronomy",
          title: "Astronomy",
          icon: "telescope",
          accent: "teal",
          level: "Beginner",
          blurb: "Orbits, starlight and an expanding universe — the physics of everything above us.",
          tags: ["astronomy", "solar system", "Kepler", "stars", "redshift", "cosmology", "light-year"],
          questions: [
            {
              id: "astro-1",
              difficulty: "Beginner",
              tags: ["orbits", "gravity"],
              prompt: "Which force keeps the planets in orbit around the Sun?",
              options: ["Gravity", "Magnetism", "Friction", "The strong nuclear force"],
              answer: 0,
              hint: "It is the same force that pulls an apple toward the ground.",
              explanation: [
                "Gravity is an attractive force between masses; the Sun's mass dominates the solar system.",
                "A planet's tangential velocity keeps it from falling straight in, producing an orbit.",
                "Magnetism acts on charged particles and moving charges, not on neutral planetary bulk.",
                "Friction and the strong force act on microscopic or nuclear scales and cannot hold a planet in orbit."
              ]
            },
            {
              id: "astro-2",
              difficulty: "Beginner",
              tags: ["units", "light-year", "distance"],
              prompt: "A light-year is a unit of what?",
              options: ["Distance", "Time", "Brightness", "Mass"],
              answer: 0,
              hint: "It is defined as the distance light travels in one year.",
              explanation: [
                "One light-year is the distance light covers in a vacuum in one Julian year.",
                "Numerically: $c \times t = (3.0\times10^8\,\mathrm{m/s})(3.156\times10^7\,\mathrm{s}) \approx 9.46\times10^{15}\,\mathrm{m}$.",
                "It is a distance, despite containing the word 'year'.",
                "The nearest star system, Alpha Centauri, is about $4.37$ light-years away."
              ]
            },
            {
              id: "astro-3",
              difficulty: "Intermediate",
              tags: ["stars", "fusion", "Sun"],
              prompt: "The Sun produces energy mainly through which process?",
              options: [
                "Nuclear fusion of hydrogen into helium",
                "Chemical combustion of hydrogen and oxygen",
                "Nuclear fission of uranium",
                "Gravitational contraction alone"
              ],
              answer: 0,
              hint: "The core is hot enough for protons to overcome electrostatic repulsion and fuse.",
              explanation: [
                "In the core, temperatures near $15$ million kelvin let protons fuse despite electrostatic repulsion.",
                "The proton–proton chain converts hydrogen into helium, releasing energy as $E = mc^2$.",
                "The mass of the products is slightly less than the reactants; the missing mass becomes energy.",
                "Chemical burning could sustain the Sun for only thousands of years, not billions."
              ]
            },
            {
              id: "astro-4",
              difficulty: "Advanced",
              tags: ["cosmology", "redshift", "Hubble"],
              prompt: "Hubble's law states that the recession speed of a distant galaxy is proportional to its what?",
              options: ["Distance from us", "Mass", "Luminosity", "Surface temperature"],
              answer: 0,
              hint: "The farther away a galaxy is, the faster it appears to recede.",
              explanation: [
                "Hubble's law is $v = H_0 d$, where $H_0$ is the Hubble constant.",
                "The relationship is observed through redshift: light from receding galaxies is stretched to longer wavelengths.",
                "It does not mean we are at the centre; space expands everywhere, so every observer sees the same pattern.",
                "The slope $H_0$ gives an estimate of the age of the universe, roughly $1/H_0$."
              ]
            }
          ],
          study: [
            {
              id: "astro-s1",
              title: "Kepler's Three Laws",
              icon: "orbit",
              summary: "Planetary motion is geometry plus gravity, and three laws describe it completely.",
              points: [
                "First law: orbits are ellipses with the Sun at one focus.",
                "Second law: a line from the Sun to a planet sweeps equal areas in equal times — planets move faster near perihelion.",
                "Third law: $T^2 \propto a^3$, where $T$ is the orbital period and $a$ the semi-major axis.",
                "Newton later showed all three follow from an inverse-square gravitational force."
              ]
            },
            {
              id: "astro-s2",
              title: "The Life Cycle of a Star",
              icon: "sparkles",
              summary: "A star is a balance between gravity pulling in and fusion pushing out.",
              points: [
                "Nebula → protostar → main sequence, where hydrogen fusion sustains the star.",
                "Sun-like stars become red giants, then shed their outer layers into a planetary nebula, leaving a white dwarf.",
                "Massive stars become supergiants, then supernovae, leaving neutron stars or black holes.",
                "Mass decides the path: more massive stars burn hotter and die younger."
              ]
            },
            {
              id: "astro-s3",
              title: "Redshift & the Expanding Universe",
              icon: "move-up-right",
              summary: "Stretching light is the main evidence that space itself is expanding.",
              points: [
                "Redshift: spectral lines shift toward longer wavelengths when a source recedes.",
                "Hubble's law: $v = H_0d$, with $H_0 \approx 70\,\mathrm{km\,s^{-1}\,Mpc^{-1}}$.",
                "The cosmic microwave background is relic radiation from the hot early universe, now cooled to about $2.7\,\mathrm{K}$.",
                "Looking far away is looking back in time, because light takes time to reach us."
              ]
            }
          ],
          mistakes: [
            "Treating a light-year as a time — it is a distance.",
            "Explaining seasons by Earth's distance from the Sun; the axial tilt is the cause.",
            "Calling the Sun's energy 'burning' — it is nuclear fusion, not combustion.",
            "Thinking redshift means galaxies move through static space; space itself is expanding."
          ],
          tips: [
            {
              title: "Know Your Distance Ladders",
              icon: "ruler",
              body: "$1\,\mathrm{AU}$ is Earth–Sun, $1\,\mathrm{ly} \approx 9.46\times10^{15}\,\mathrm{m}$, and $1\,\mathrm{pc} \approx 3.26\,\mathrm{ly}$. Convert everything to metres before comparing."
            },
            {
              title: "OBAFGKM for Stellar Classes",
              icon: "thermometer",
              body: "From hottest to coolest: O, B, A, F, G, K, M. Mnemonic: 'Oh Be A Fine Guy, Kiss Me.' The Sun is a G-type star."
            },
            {
              title: "Lookback Time",
              icon: "history",
              body: "A galaxy $100$ million light-years away is seen as it was $100$ million years ago. Use distance in light-years as a direct clock for the past."
            }
          ],
          videos: [
            {
              youtube: "0rHUDWjR5gg",
              title: "Introduction to Astronomy: Crash Course Astronomy #1",
              channel: "CrashCourse",
              takeaways: [
                "How astronomers measure distance and light.",
                "Why the night sky is a map of the past.",
                "The scale of the solar system compared with the galaxy."
              ]
            },
            {
              youtube: "9B7Ix2VQEGo",
              title: "The Big Bang, Cosmology part 1: Crash Course Astronomy #42",
              channel: "CrashCourse",
              takeaways: [
                "The evidence for an expanding universe.",
                "How redshift and the cosmic microwave background fit together.",
                "What the Big Bang did and did not claim."
              ]
            }
          ]
        },

        /* ------------------------------------------------------------------
           10. ORGANIC CHEMISTRY
           ------------------------------------------------------------------ */
        {
          id: "organic-chemistry",
          title: "Organic Chemistry",
          icon: "hexagon",
          accent: "teal",
          level: "Advanced",
          blurb: "Carbon skeletons, functional groups and the reaction families that build molecules.",
          tags: ["organic chemistry", "functional groups", "isomers", "hybridization", "alkenes", "reactions"],
          questions: [
            {
              id: "org-1",
              difficulty: "Beginner",
              tags: ["functional groups", "alcohols"],
              prompt: "Which functional group defines an alcohol?",
              options: ["$\mathrm{-OH}$ (hydroxyl)", "$\mathrm{-COOH}$ (carboxyl)", "$\mathrm{-NH_2}$ (amino)", "$\mathrm{C=O}$ (carbonyl)"],
              answer: 0,
              hint: "The name 'alcohol' comes from the hydroxyl group attached to a carbon.",
              explanation: [
                "An alcohol contains an $-\mathrm{OH}$ group bonded to an $sp^3$ carbon.",
                "Examples: methanol $\mathrm{CH_3OH}$, ethanol $\mathrm{CH_3CH_2OH}$.",
                "A carboxyl group ($\mathrm{-COOH}$) defines a carboxylic acid; an amino group defines an amine.",
                "A carbonyl alone ($\mathrm{C=O}$) belongs to aldehydes or ketones."
              ]
            },
            {
              id: "org-2",
              difficulty: "Intermediate",
              tags: ["isomers", "structure"],
              prompt: "What are structural isomers?",
              options: [
                "Compounds with the same molecular formula but different connectivity",
                "Compounds with identical structures but different names",
                "Compounds with the same connectivity but different molecular formulas",
                "Atoms of the same element with different neutron counts"
              ],
              answer: 0,
              hint: "The formula stays the same; the way the atoms are connected changes.",
              explanation: [
                "Isomers share a molecular formula but differ in how the atoms are bonded.",
                "Structural (constitutional) isomers differ in connectivity — for example $n$-butane and isobutane, both $\mathrm{C_4H_{10}}$.",
                "Stereoisomers share connectivity but differ in spatial arrangement, such as cis and trans alkenes.",
                "Isotopes, by contrast, differ in neutron number, not bonding."
              ]
            },
            {
              id: "org-3",
              difficulty: "Advanced",
              tags: ["hybridization", "alkenes", "bonding"],
              prompt: "What is the hybridization of each carbon atom in ethene, $\mathrm{C_2H_4}$?",
              options: ["$sp^2$", "$sp^3$", "$sp$", "$sp^3d$"],
              answer: 0,
              hint: "Ethene has a double bond, so each carbon uses three sigma bonds and one pi bond.",
              explanation: [
                "Ethene is planar with a $\mathrm{C=C}$ double bond and $120^\circ$ bond angles.",
                "Each carbon forms three sigma bonds — two to hydrogens, one to the other carbon.",
                "Three electron domains mean three $sp^2$ hybrid orbitals; the remaining $p$ orbitals form the pi bond.",
                "In contrast, methane's four single bonds make each carbon $sp^3$."
              ]
            },
            {
              id: "org-4",
              difficulty: "Advanced",
              tags: ["reactions", "alkenes", "addition"],
              prompt: "Which reaction type is characteristic of alkenes?",
              options: ["Electrophilic addition", "Electrophilic substitution", "Nucleophilic substitution", "Elimination"],
              answer: 0,
              hint: "The carbon–carbon double bond provides electron density that attracts an electrophile.",
              explanation: [
                "The $\pi$ bond in an alkene is electron-rich and attacks electrophiles.",
                "Addition breaks the $\pi$ bond and adds atoms across the double bond, converting it to a single bond.",
                "Benzene, an aromatic ring, undergoes substitution because addition would destroy its aromatic stability.",
                "Elimination is the reverse: it forms a double bond by removing atoms from a saturated molecule."
              ]
            }
          ],
          study: [
            {
              id: "org-s1",
              title: "Functional Groups Cheat Sheet",
              icon: "table",
              summary: "A functional group is the reactive part of a molecule — and its name predicts its behaviour.",
              points: [
                "Hydroxyl $-\mathrm{OH}$: alcohols; hydrogen bonding raises boiling points.",
                "Carbonyl $\mathrm{C=O}$: aldehydes and ketones; nucleophiles attack the carbon.",
                "Carboxyl $-\mathrm{COOH}$: carboxylic acids; donate $\mathrm{H^+}$ and form esters with alcohols.",
                "Amino $-\mathrm{NH_2}$: amines; act as bases and nucleophiles. Ester $-\mathrm{COO{-}}$: pleasant-smelling derivatives of acids."
              ]
            },
            {
              id: "org-s2",
              title: "Isomerism",
              icon: "git-branch",
              summary: "Same formula, different molecule — connectivity first, then geometry.",
              points: [
                "Structural isomers differ in connectivity: chains, branches, or different functional groups.",
                "Geometric (cis–trans) isomers differ in arrangement around a double bond or ring; cis has like groups on the same side.",
                "Enantiomers are non-superimposable mirror images; they rotate plane-polarised light in opposite directions.",
                "Count degrees of unsaturation to know how many rings or $\pi$ bonds a formula can hold."
              ]
            },
            {
              id: "org-s3",
              title: "Reaction Families",
              icon: "repeat-2",
              summary: "Organic reactions are electron bookkeeping: where do electrons flow, and what leaves?",
              points: [
                "A nucleophile donates an electron pair; an electrophile accepts one. Arrow-pushing always starts at the nucleophile.",
                "Addition: two reactants become one product; typical of alkenes and alkynes.",
                "Substitution: one group replaces another; typical of alkanes (radical) and aromatic rings (electrophilic).",
                "Elimination: removes atoms to form a $\pi$ bond; often competes with substitution."
              ]
            }
          ],
          mistakes: [
            "Reading a condensed formula as proof of one structure — $\mathrm{C_4H_{10}}$ has two isomers.",
            "Predicting addition for benzene; aromatic substitution preserves the ring's stability.",
            "Mixing up $sp^2$ and $sp^3$ carbons — double bonds imply $sp^2$.",
            "Forgetting Markovnikov's rule: in $\mathrm{HX}$ addition, $\mathrm{H}$ goes to the carbon with more hydrogens."
          ],
          tips: [
            {
              title: "Degrees of Unsaturation",
              icon: "hash",
              body: "For $\mathrm{C_aH_bN_cX_d}$, degrees of unsaturation $= a - \frac{b + d - c}{2} + 1$. Each ring or double bond counts as one; a triple bond counts as two."
            },
            {
              title: "Follow the Electrons",
              icon: "zap",
              body: "Before naming a mechanism, identify the nucleophile (electron-rich, often with lone pairs or a negative charge) and the electrophile (electron-poor, often a carbonyl carbon). Arrows run from nucleophile to electrophile."
            },
            {
              title: "Learn the Homologous Series",
              icon: "list",
              body: "Alkanes $\mathrm{C_nH_{2n+2}}$, alkenes $\mathrm{C_nH_{2n}}$, alkynes $\mathrm{C_nH_{2n-2}}$, alcohols $\mathrm{C_nH_{2n+1}OH}$. The formula immediately tells you the bonding pattern."
            }
          ],
          videos: [
            {
              youtube: "PmvLB5dIEp8",
              title: "What Is Organic Chemistry?: Crash Course Organic Chemistry #1",
              channel: "CrashCourse",
              takeaways: [
                "Why carbon forms such a wide variety of molecules.",
                "How to read skeletal structures.",
                "The idea of functional groups as reactivity patterns."
              ]
            },
            {
              youtube: "FYTfo4y91TI",
              title: "Alkanes, cycloalkanes, and functional groups",
              channel: "Khan Academy",
              takeaways: [
                "How to name simple alkanes and cycloalkanes.",
                "How functional groups change a molecule's properties.",
                "Why the same formula can describe different structures."
              ]
            }
          ]
        },

        /* ------------------------------------------------------------------
           16. COMPUTER SCIENCE
           ------------------------------------------------------------------ */
        {
          id: "computer-science",
          title: "Computer Science",
          icon: "cpu",
          accent: "sky",
          level: "Intermediate",
          blurb: "Algorithms, data structures and the real cost of a computation — without the jargon.",
          tags: ["algorithms", "big-o", "binary search", "data structures", "recursion", "hash tables", "computer science"],
          questions: [
            {
              id: "cs-1",
              difficulty: "Beginner",
              tags: ["big-o", "binary search", "complexity"],
              prompt: "A sorted array of n items is searched with binary search. What is the worst-case running time?",
              options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
              answer: 1,
              hint: "Each comparison discards half of the remaining items.",
              explanation: [
                "Binary search compares the target with the middle item.",
                "If it is not the target, the search continues in one half and discards the other half entirely.",
                "The number of halvings needed to reach a single item is log base 2 of n.",
                "So the worst-case running time is O(log n), far better than the O(n) of linear search."
              ]
            },
            {
              id: "cs-2",
              difficulty: "Intermediate",
              tags: ["hash tables", "lookup", "data structures"],
              prompt: "Which data structure gives average O(1) lookup by key?",
              options: ["Sorted array", "Hash table", "Linked list", "Stack"],
              answer: 1,
              hint: "A hash function turns a key into an index, so the table can jump straight to a bucket.",
              explanation: [
                "A hash table applies a hash function to each key to compute a bucket index.",
                "On average the bucket holds few entries, so lookup, insertion and deletion take constant time.",
                "A sorted array supports O(log n) search; a linked list and a stack require O(n) search.",
                "The O(1) bound is an average. Poor hashing or many collisions can degrade it toward O(n)."
              ]
            },
            {
              id: "cs-3",
              difficulty: "Intermediate",
              tags: ["recursion", "base case", "stack overflow"],
              prompt: "What happens when a recursive function has no base case?",
              options: [
                "It returns the last value automatically",
                "It runs until the call stack overflows",
                "It silently becomes iterative",
                "It runs in O(1) time"
              ],
              answer: 1,
              hint: "Every recursive call adds a frame to the call stack.",
              explanation: [
                "A recursive function needs a base case that stops further calls.",
                "Without one, each call invokes another call with no termination condition.",
                "Every call consumes a stack frame, and the stack has finite memory.",
                "Eventually the runtime raises a stack-overflow error; no value is returned automatically."
              ]
            }
          ],
          study: [
            {
              id: "cs-s1",
              title: "Complexity in Plain Terms",
              icon: "gauge",
              summary: "Big-O describes how work grows with input size, not how fast a particular machine is.",
              points: [
                "Big-O ignores constants and lower-order terms: O(2n + 5) is simply O(n).",
                "O(1) constant: an array index or an average hash lookup.",
                "O(log n) logarithmic: binary search over sorted data.",
                "O(n) linear: one pass through a list. O(n log n) is typical of good sorting; O(n²) usually means nested loops."
              ]
            },
            {
              id: "cs-s2",
              title: "Searching and Sorting",
              icon: "search",
              summary: "The fastest search depends on whether the data is sorted and on what you can afford to store.",
              points: [
                "Binary search requires sorted data. Each step halves the range, so a million items take about twenty comparisons.",
                "Merge sort splits, sorts and merges: O(n log n) time, O(n) extra space, and it is stable.",
                "Quicksort averages O(n log n) but degrades to O(n²) with bad pivots.",
                "Linear search is O(n) but works on unsorted data and needs no extra space."
              ]
            },
            {
              id: "cs-s3",
              title: "Data Structures as Trade-offs",
              icon: "boxes",
              summary: "Every structure buys speed somewhere and pays for it somewhere else.",
              points: [
                "Array: O(1) index, O(n) insertion or deletion in the middle, compact memory.",
                "Linked list: O(1) insertion at a known node, O(n) search, extra memory for pointers.",
                "Hash table: average O(1) lookup, no ordering, and collisions still need a strategy.",
                "Balanced tree: O(log n) search, insert and delete while keeping keys ordered."
              ]
            }
          ],
          mistakes: [
            "Treating O(log n) as constant time — it still grows, just very slowly.",
            "Running binary search on unsorted data; the halving argument no longer holds.",
            "Counting only time and ignoring extra memory such as merge sort's temporary array.",
            "Assuming a hash table preserves insertion order; most do not."
          ],
          tips: [
            {
              title: "Trace the Loop",
              icon: "repeat-2",
              body: "When a complexity question looks ambiguous, write the loop bounds and count iterations for n = 1, 2, 4 and 8. The growth pattern usually becomes obvious before the algebra does."
            },
            {
              title: "Name the Operation",
              icon: "mouse-pointer-2",
              body: "Access, search, insert and delete have different costs. Say which one the question is asking about before comparing structures — the right answer often changes."
            },
            {
              title: "Measure Before Optimising",
              icon: "timer",
              body: "A theoretically faster algorithm can lose on small inputs because of overhead. Time the real workload first, then optimise the part that actually dominates."
            }
          ],
          videos: [
            {
              youtube: "jZzyERW7h1A",
              title: "CS50x 2024 — Lecture 3 — Algorithms",
              channel: "CS50",
              takeaways: [
                "Linear and binary search compared on real data.",
                "How Big-O describes running time.",
                "Selection sort, bubble sort, recursion and merge sort."
              ]
            },
            {
              youtube: "aV8LlSmd1E8",
              title: "CS50x 2025 — Lecture 5 — Data Structures",
              channel: "CS50",
              takeaways: [
                "Stacks, queues and linked lists.",
                "Trees, hash tables and tries.",
                "How the choice of structure changes the cost of an operation."
              ]
            }
          ]
        }
      ]
    },

    /* ======================================================================
       HUMANITIES
       ====================================================================== */
    {
      id: "humanities",
      title: "Humanities",
      tagline: "History, economies and close reading — the arguments behind the facts.",
      icon: "landmark",
      accent: "violet",
      subjects: [
        /* ------------------------------------------------------------------
           17. WORLD HISTORY
           ------------------------------------------------------------------ */
        {
          id: "world-history",
          title: "World History",
          icon: "landmark",
          accent: "amber",
          level: "Beginner",
          blurb: "Trade routes, revolutions and the skill of reading a source instead of merely repeating it.",
          tags: ["world history", "silk road", "french revolution", "columbian exchange", "sources", "trade", "empire"],
          questions: [
            {
              id: "hist-1",
              difficulty: "Beginner",
              tags: ["silk road", "trade", "afro-eurasia"],
              prompt: "What was the Silk Road?",
              options: [
                "A network of Afro-Eurasian trade routes carrying goods, ideas and disease",
                "A single paved road built by the Roman Empire",
                "A maritime route used only by Chinese merchants",
                "A religious pilgrimage route to Mecca"
              ],
              answer: 0,
              hint: "It was never one road, and it carried far more than silk.",
              explanation: [
                "The Silk Road was a shifting network of overland and maritime routes linking China, Central Asia, India, the Middle East and Europe.",
                "Caravans moved silk, spices, metals and horses, while caravanserais provided water, rest and markets.",
                "Ideas, religions, technologies and epidemics travelled the same routes; the Black Death moved along them in the 14th century.",
                "Calling it a single road obscures the many local routes and middlemen who made long-distance trade possible."
              ]
            },
            {
              id: "hist-2",
              difficulty: "Intermediate",
              tags: ["french revolution", "fiscal crisis", "estates"],
              prompt: "Which combination is a central cause of the French Revolution?",
              options: [
                "The collapse of the Roman Empire",
                "A fiscal crisis worsened by unequal taxation and poor harvests",
                "The invention of the steam engine",
                "The signing of the Treaty of Versailles in 1919"
              ],
              answer: 1,
              hint: "The state was short of money, and the groups best able to pay were largely exempt.",
              explanation: [
                "France faced a severe fiscal crisis after costly wars and accumulated debt.",
                "The estate system placed the clergy and nobility above the vast majority, and much of the tax burden fell on commoners.",
                "Poor harvests raised bread prices and sharpened urban hardship in the late 1780s.",
                "Enlightenment ideas and the example of the American Revolution shaped how critics imagined an alternative, but the immediate trigger was a state that could not pay its bills."
              ]
            },
            {
              id: "hist-3",
              difficulty: "Beginner",
              tags: ["columbian exchange", "1492", "disease"],
              prompt: "Which statement best describes the Columbian Exchange?",
              options: [
                "The transfer of plants, animals, people and diseases between the Americas and Afro-Eurasia after 1492",
                "The exchange of silver for silk along the Silk Road",
                "The migration of Europeans to Australia in the 18th century",
                "The trade in spices between India and China"
              ],
              answer: 0,
              hint: "It began with sustained contact between the hemispheres, and it went in both directions.",
              explanation: [
                "After 1492, sustained contact connected the Americas with Europe, Africa and Asia.",
                "Crops such as maize and potatoes moved east; wheat, horses and cattle moved west.",
                "People were forcibly moved through the Atlantic slave trade, and diseases such as smallpox devastated Indigenous populations.",
                "The exchange reshaped diets, economies and demographics on both sides of the Atlantic."
              ]
            }
          ],
          study: [
            {
              id: "hist-s1",
              title: "Trade Routes and Exchange",
              icon: "route",
              summary: "Long-distance trade moved beliefs and microbes as readily as silk and silver.",
              points: [
                "The Silk Road was a network of land and sea routes, not a single road; local merchants carried goods between overlapping segments.",
                "Caravanserais offered water, shelter and markets, turning waypoints into cosmopolitan trading towns.",
                "Goods travelled with technologies, religions, languages and diseases, including plague.",
                "Indian Ocean trade depended on monsoon winds; trans-Saharan routes moved gold and salt."
              ]
            },
            {
              id: "hist-s2",
              title: "Revolutions and Legitimacy",
              icon: "landmark",
              summary: "Revolutions are rarely one cause and rarely one moment; they are struggles over who may rule.",
              points: [
                "The French Revolution began in 1789 amid a fiscal crisis, food scarcity and resentment of aristocratic privilege.",
                "The Declaration of the Rights of Man and Citizen asserted universal rights while excluding many people in practice.",
                "The Revolution moved through constitutional monarchy, republic, the Terror and eventually Napoleon's rule.",
                "Historians distinguish long-term structural causes, short-term triggers and contingent choices made by individuals."
              ]
            },
            {
              id: "hist-s3",
              title: "Reading Sources Critically",
              icon: "scroll-text",
              summary: "A source is evidence of someone's perspective, not a transparent window onto the past.",
              points: [
                "Primary sources were produced in the period; secondary sources interpret it later. Both can be useful and both can be biased.",
                "Ask who wrote a source, for whom, when, and with what purpose or constraint.",
                "Corroborate claims across independent sources rather than trusting a single vivid account.",
                "Notice silences: whose voices are missing, and what does the source take for granted?"
              ]
            }
          ],
          mistakes: [
            "Treating the Silk Road as one road or one culture rather than a shifting network.",
            "Explaining a revolution with a single cause and ignoring long-term and short-term factors.",
            "Reading a primary source as neutral testimony instead of a situated account.",
            "Using modern categories to judge past actors without explaining the difference in context."
          ],
          tips: [
            {
              title: "Build a Timeline Spine",
              icon: "calendar-range",
              body: "Memorise a short spine of dates and, more importantly, what happened between them. A cause-and-effect story is easier to recall than an isolated list of years."
            },
            {
              title: "Follow the Silver",
              icon: "coins",
              body: "Trace one commodity through a system — silver from Potosí to Manila to China, for example. Following a single thread reveals how distant regions were connected."
            },
            {
              title: "Ask Who Wrote It",
              icon: "pencil-line",
              body: "Before extracting a quote, identify the author's position, audience and purpose. The same event looks different in a court chronicle, a merchant's ledger and a letter from a soldier."
            }
          ],
          videos: [
            {
              youtube: "vfe-eNq-Qyg",
              title: "The Silk Road and Ancient Trade — Crash Course World History #9",
              channel: "CrashCourse",
              takeaways: [
                "Why the Silk Road was a network rather than a single route.",
                "How goods, ideas and disease moved together.",
                "How long-distance trade shaped ordinary consumption."
              ]
            },
            {
              youtube: "lTTvKwCylFY",
              title: "The French Revolution — Crash Course World History #29",
              channel: "CrashCourse",
              takeaways: [
                "The fiscal and social pressures behind 1789.",
                "The shift from constitutional monarchy to republic and Terror.",
                "How revolutionary ideals spread beyond France."
              ]
            }
          ]
        },

        /* ------------------------------------------------------------------
           18. ECONOMICS
           ------------------------------------------------------------------ */
        {
          id: "economics",
          title: "Economics",
          icon: "chart-line",
          accent: "emerald",
          level: "Beginner",
          blurb: "Scarcity, incentives, prices and inflation — the grammar of everyday trade-offs.",
          tags: ["economics", "supply and demand", "opportunity cost", "inflation", "markets", "incentives", "gdp"],
          questions: [
            {
              id: "econ-1",
              difficulty: "Beginner",
              tags: ["demand", "price", "law of demand"],
              prompt: "All else equal, what happens to quantity demanded when the price of a good rises?",
              options: ["It falls", "It rises", "It stays exactly the same", "The demand curve shifts right"],
              answer: 0,
              hint: "The law of demand describes an inverse relationship between price and quantity demanded.",
              explanation: [
                "The law of demand says that, all else equal, a higher price leads buyers to purchase less.",
                "This is a movement along the demand curve, not a shift of the curve.",
                "A shift would require a change in something other than the good's own price, such as income or tastes.",
                "The inverse relationship reflects both substitution toward alternatives and the income effect of a higher price."
              ]
            },
            {
              id: "econ-2",
              difficulty: "Beginner",
              tags: ["opportunity cost", "scarcity", "choice"],
              prompt: "What is the opportunity cost of a choice?",
              options: [
                "The money actually spent on the choice",
                "The value of the next-best alternative given up",
                "The total cost of every alternative available",
                "The price of the good after tax"
              ],
              answer: 1,
              hint: "It is about what you did not do, not only what you paid.",
              explanation: [
                "Scarcity means choosing one use of a resource means giving up another.",
                "The opportunity cost is the value of the best alternative you forgo, not the sum of all alternatives.",
                "Money paid is part of the cost, but forgone time, income or enjoyment can matter just as much.",
                "Because the next-best option differs between people, so does the opportunity cost of the same choice."
              ]
            },
            {
              id: "econ-3",
              difficulty: "Intermediate",
              tags: ["inflation", "price level", "purchasing power"],
              prompt: "Which is the best definition of inflation?",
              options: [
                "A sustained rise in the general price level",
                "A one-off increase in the price of oil",
                "An increase in the money supply only",
                "A fall in nominal wages"
              ],
              answer: 0,
              hint: "Inflation is about the general price level over time, not one price or one month.",
              explanation: [
                "Inflation is a sustained increase in the average price of goods and services in an economy.",
                "A single price rise, such as an oil shock, is not inflation unless it spreads into the general price level.",
                "Inflation reduces the purchasing power of money: the same nominal amount buys fewer goods.",
                "Statistical agencies estimate it using price indices such as the consumer price index."
              ]
            }
          ],
          study: [
            {
              id: "econ-s1",
              title: "Scarcity and Choice",
              icon: "scale",
              summary: "Economics begins with limited means and unlimited wants, then studies how choices are made.",
              points: [
                "Scarcity is not the same as shortage: it is the gap between limited resources and competing wants.",
                "Every choice has an opportunity cost — the value of the next-best option given up.",
                "Marginal thinking compares the extra benefit of one more unit with its extra cost.",
                "Incentives change behaviour, and policies change incentives whether or not that was the intention."
              ]
            },
            {
              id: "econ-s2",
              title: "Supply, Demand, Equilibrium",
              icon: "chart-line",
              summary: "Prices coordinate buyers and sellers; curves summarise the plans behind those decisions.",
              points: [
                "Demand curves slope downward and supply curves slope upward, all else equal.",
                "A change in the good's own price moves along a curve; a change in income, tastes, technology or input costs shifts the curve.",
                "Equilibrium is the price at which quantity supplied equals quantity demanded.",
                "A price ceiling below equilibrium creates a shortage; a price floor above it creates a surplus."
              ]
            },
            {
              id: "econ-s3",
              title: "Inflation and Measurement",
              icon: "trending-up",
              summary: "Nominal numbers can mislead; real values adjust for the changing value of money.",
              points: [
                "Inflation is a sustained rise in the general price level, not a rise in one price.",
                "The consumer price index tracks a basket of household goods and services over time.",
                "Nominal wages are measured in current money; real wages adjust for inflation and show purchasing power.",
                "Unexpected inflation tends to hurt lenders and savers and help borrowers, because debts are repaid in cheaper money."
              ]
            }
          ],
          mistakes: [
            "Confusing a movement along a demand curve with a shift of the curve.",
            "Treating price as the same thing as value, or cost as the same thing as opportunity cost.",
            "Ignoring opportunity cost when a choice looks free in money terms.",
            "Comparing nominal wages across years without adjusting for inflation."
          ],
          tips: [
            {
              title: "Think at the Margin",
              icon: "target",
              body: "Ask what one more unit adds to benefit and to cost. Decisions are rarely all-or-nothing; the useful question is usually whether the next unit is worth it."
            },
            {
              title: "Name the Alternative",
              icon: "list",
              body: "Whenever you identify a cost, write down the best thing you gave up instead. If you cannot name it, you have not yet found the opportunity cost."
            },
            {
              title: "Real vs Nominal",
              icon: "percent",
              body: "Before comparing money across time, adjust for inflation. A raise smaller than inflation is a pay cut in real terms, even though the nominal number rose."
            }
          ],
          videos: [
            {
              youtube: "g9aDizJpd_s",
              title: "Supply and Demand — Crash Course Economics #4",
              channel: "CrashCourse",
              takeaways: [
                "How demand and supply curves are built.",
                "Why equilibrium prices coordinate buyers and sellers.",
                "How shortages and surpluses appear."
              ]
            },
            {
              youtube: "T8-85cZRI9o",
              title: "Inflation and Bubbles and Tulips — Crash Course Economics #7",
              channel: "CrashCourse",
              takeaways: [
                "How inflation is measured.",
                "Why asset bubbles form and burst.",
                "What tulip mania does and does not prove."
              ]
            }
          ]
        },

        /* ------------------------------------------------------------------
           19. ENGLISH LITERATURE
           ------------------------------------------------------------------ */
        {
          id: "english-literature",
          title: "English Literature",
          icon: "feather",
          accent: "rose",
          level: "Intermediate",
          blurb: "Close reading, figurative language and narration — how a text makes meaning line by line.",
          tags: ["literature", "close reading", "metaphor", "poetry", "narrator", "point of view", "analysis"],
          questions: [
            {
              id: "lit-1",
              difficulty: "Beginner",
              tags: ["figurative language", "metaphor"],
              prompt: "“The classroom was a zoo” is an example of which figure of speech?",
              options: ["Metaphor", "Simile", "Personification", "Hyperbole"],
              answer: 0,
              hint: "It states that one thing is another, without using like or as.",
              explanation: [
                "A metaphor asserts that one thing is another: the classroom is a zoo.",
                "A simile makes the comparison explicit with like or as: the classroom was like a zoo.",
                "Personification would give the classroom human qualities; hyperbole would exaggerate for effect.",
                "The metaphor works by transferring the noise and disorder associated with a zoo onto the classroom."
              ]
            },
            {
              id: "lit-2",
              difficulty: "Intermediate",
              tags: ["narrator", "point of view", "unreliable"],
              prompt: "Why can a first-person narrator's account be limited?",
              options: [
                "Because the narrator knows every character's thoughts",
                "Because the narrator is always the author",
                "Because the account is filtered through one character's knowledge and bias",
                "Because first-person narration cannot describe events"
              ],
              answer: 2,
              hint: "The reader only knows what this character knows, and only as they choose to tell it.",
              explanation: [
                "A first-person narrator speaks as 'I' and can report only what that character perceives, remembers or chooses to reveal.",
                "Their account is shaped by their knowledge, assumptions and interests, which may differ from the author's.",
                "This does not make the account false by default, but it does make it partial.",
                "Writers can exploit that limitation to create irony or an unreliable narrator."
              ]
            },
            {
              id: "lit-3",
              difficulty: "Advanced",
              tags: ["poetry", "enjambment", "form"],
              prompt: "What is enjambment in poetry?",
              options: [
                "A pause in the middle of a line",
                "The continuation of a sentence across a line break without end punctuation",
                "The repetition of initial consonant sounds",
                "A two-line stanza with rhyming couplets"
              ],
              answer: 1,
              hint: "The sentence runs past the end of the line instead of stopping with the line.",
              explanation: [
                "Enjambment occurs when a sentence or clause continues across a line break without punctuation.",
                "It can speed the reader forward or create tension between the line's rhythm and its syntax.",
                "A pause within a line is a caesura; repeated initial consonants are alliteration.",
                "A closed line, by contrast, ends with punctuation and a syntactic stop."
              ]
            }
          ],
          study: [
            {
              id: "lit-s1",
              title: "Close Reading, Line by Line",
              icon: "feather",
              summary: "Meaning lives in particular words, line breaks and turns — not only in the plot summary.",
              points: [
                "Read once for sense, then again with a pencil, marking repetitions, oppositions and surprising word choices.",
                "Track shifts: changes in tense, address, tone, setting or line length often mark the poem's turn.",
                "Notice repetitions and contrasts; what the text keeps returning to is rarely accidental.",
                "Attend to syntax and punctuation. A semicolon, a short line or a missing full stop changes the pace and the emphasis."
              ]
            },
            {
              id: "lit-s2",
              title: "Figurative Language",
              icon: "quote",
              summary: "A device is not the point; the point is what the comparison lets you see.",
              points: [
                "A metaphor asserts that one thing is another; a simile makes the comparison explicit with like or as.",
                "Personification gives human qualities to non-human things; metonymy substitutes an attribute or associated object for the whole.",
                "Identify the device, then explain its effect: what does the comparison make visible, and what does it obscure?",
                "Avoid device-spotting as an end in itself. A list of techniques without interpretation is not an argument."
              ]
            },
            {
              id: "lit-s3",
              title: "Narration and Point of View",
              icon: "eye",
              summary: "Who tells the story, and what they cannot know, shapes what the reader can believe.",
              points: [
                "First person is filtered through a narrator's knowledge and bias; the reader sees the world from inside that perspective.",
                "Third-person limited stays close to one character; omniscient moves between minds; objective reports only what can be observed.",
                "Unreliable narrators invite readers to read against the account rather than simply accept it.",
                "Free indirect discourse blends a character's voice with the narrator's, blurring the boundary between them."
              ]
            }
          ],
          mistakes: [
            "Identifying a device without explaining its effect on meaning.",
            "Calling every comparison a simile, even when the text says one thing is another.",
            "Confusing the author with the narrator, especially in first-person fiction.",
            "Ignoring form — line breaks, stanza shape and syntax — when interpreting a poem."
          ],
          tips: [
            {
              title: "Quote, Then Zoom",
              icon: "quote",
              body: "Choose the shortest quotation that supports your point, then examine one or two specific words in it. Close attention to diction is more persuasive than a long block quote."
            },
            {
              title: "Track the Turn",
              icon: "route",
              body: "In a poem or passage, find the moment the argument or mood changes. The turn is often where the meaning is concentrated, and it gives your paragraph a structure."
            },
            {
              title: "Write the So-What",
              icon: "pen-line",
              body: "After every observation, write one sentence beginning 'This matters because…'. If you cannot finish it, the observation is not yet analysis."
            }
          ],
          videos: [
            {
              youtube: "MSYw502dJNY",
              title: "How and Why We Read — Crash Course English Literature #1",
              channel: "CrashCourse",
              takeaways: [
                "Why critical reading is a form of communication.",
                "The difference between authorial intent and reader interpretation.",
                "How to read for empathy and evidence."
              ]
            },
            {
              youtube: "acURl_KBiRI",
              title: "What is Point of View? — A Literary Guide",
              channel: "OSU School of Writing, Literature and Film",
              takeaways: [
                "How first-person and third-person perspectives differ.",
                "What a narrator can and cannot know.",
                "How point of view shapes a reader's trust."
              ]
            }
          ]
        }
      ]
    },

    /* ======================================================================
       UNIVERSAL STUDY VAULT
       ====================================================================== */
    {
      id: "vault",
      title: "Universal Study Vault",
      tagline: "Exam strategy, memory systems and the formula sheets worth memorising.",
      icon: "archive",
      accent: "amber",
      subjects: [
        /* ------------------------------------------------------------------
           9. EXAM HACKS
           ------------------------------------------------------------------ */
        {
          id: "exam-hacks",
          title: "Exam Hacks",
          icon: "timer",
          accent: "amber",
          level: "Beginner",
          blurb: "Time budgeting, question triage and the test-taking moves that protect your score.",
          tags: ["exam strategy", "time management", "test taking", "revision", "practice exams"],
          questions: [
            {
              id: "ex-1",
              difficulty: "Beginner",
              tags: ["spaced practice", "revision", "planning"],
              prompt: "You have ten days until a major exam. Which revision plan is best supported by memory research?",
              options: [
                "Short daily sessions with retrieval practice, spaced across the ten days",
                "One eight-hour cram session the night before",
                "Reading the textbook three times in two days",
                "Highlighting every definition in your notes"
              ],
              answer: 0,
              hint: "Two effects matter most: spacing and the testing effect.",
              explanation: [
                "Spacing distributes study across days, so each review happens as memory begins to fade — the moment that strengthens it most.",
                "Retrieval practice (quizzing yourself) produces stronger, more durable learning than rereading.",
                "Cramming and highlighting feel productive but rely on recognition, which transfers poorly to exams.",
                "The best plan combines both: short daily sessions, each starting with recall before notes."
              ]
            },
            {
              id: "ex-2",
              difficulty: "Beginner",
              tags: ["time management", "exam strategy", "triage"],
              prompt: "Mid-exam, you have spent four minutes on a one-point question and are still stuck. What should you do?",
              options: [
                "Flag it, move on, and return with the time you save elsewhere",
                "Keep going until it is solved, regardless of time",
                "Guess immediately and stop thinking about it",
                "Restart the entire section from the beginning"
              ],
              answer: 0,
              hint: "Points per minute is the metric that matters, not completion order.",
              explanation: [
                "Exams reward total points, not perfect completion in order.",
                "A one-point question is worth far less per minute than the questions you have not yet attempted.",
                "Flagging preserves your progress and lets your subconscious work on the problem while you earn easier points.",
                "Return at the end with remaining time; a fresh look often solves it in seconds."
              ]
            },
            {
              id: "ex-3",
              difficulty: "Intermediate",
              tags: ["practice exams", "error analysis"],
              prompt: "What is the most effective way to use a practice exam?",
              options: [
                "Sit it under real conditions, then analyse every error by cause",
                "Read the questions and answers without timing yourself",
                "Do only the questions you find easy to build confidence",
                "Take it once and file it away"
              ],
              answer: 0,
              hint: "The value is in the diagnosis after the test, not the score itself.",
              explanation: [
                "Simulating conditions trains timing, stamina and decision-making under pressure.",
                "Afterwards, classify each error: content gap, misread question, calculation slip, or time pressure.",
                "Each category needs a different fix — rereading notes only helps the first.",
                "Repeat the same exam a week later; the repeat reveals whether the fixes worked."
              ]
            }
          ],
          study: [
            {
              id: "ex-s1",
              title: "The Two-Pass Exam Method",
              icon: "list-checks",
              summary: "Bank the easy points first, then spend the remaining time where it pays.",
              points: [
                "Pass 1: answer everything you can do quickly; flag anything that stalls for more than 60–90 seconds.",
                "Pass 2: return to flagged questions with the time banked from pass 1.",
                "Reserve the final 10% of exam time for checking names, units and answer formats.",
                "Never leave a blank on a no-penalty multiple-choice exam."
              ]
            },
            {
              id: "ex-s2",
              title: "Active Recall Beats Rereading",
              icon: "brain",
              summary: "Testing yourself is a learning event, not just a measurement.",
              points: [
                "Close the book and write everything you remember about a topic, then check.",
                "Turn headings into questions and answer them aloud.",
                "Use flashcards for facts, but explain concepts in full sentences.",
                "Space reviews: 1 day, 3 days, 7 days, 21 days."
              ]
            },
            {
              id: "ex-s3",
              title: "Exam-Day Checklist",
              icon: "clipboard-check",
              summary: "Logistics are part of preparation — remove every avoidable distraction.",
              points: [
                "Night before: pack ID, calculator, spare pens, water; confirm the room and start time.",
                "Sleep 7–9 hours; a tired brain loses more marks than one extra hour of revision gains.",
                "In the first two minutes, write down formulae or mnemonics you are afraid of forgetting.",
                "Read each question twice and underline what it is actually asking."
              ]
            }
          ],
          mistakes: [
            "Spending disproportionate time on high-difficulty low-mark questions while easy marks remain.",
            "Rereading and highlighting as the main revision method — it creates familiarity, not recall.",
            "Leaving answers blank on exams without a wrong-answer penalty.",
            "Changing a first answer without a concrete reason; evidence favours sticking unless you find a real error."
          ],
          tips: [
            {
              title: "The 90-Second Rule",
              icon: "timer",
              body: "If a question resists for 90 seconds, flag it and move. You can always come back, but you cannot recover time already spent."
            },
            {
              title: "Brain Dump on Arrival",
              icon: "notebook-pen",
              body: "As soon as the exam starts, write down formulas, dates and mnemonics in the margin. This frees working memory for the actual problems."
            },
            {
              title: "Keep an Error Log",
              icon: "bug",
              body: "After every practice test, record the question, your answer, the correct answer and the cause. Review the log before the next test — patterns appear fast."
            }
          ],
          videos: [
            {
              youtube: "jYWfiP7w5w0",
              title: "10 Study Tips for Earning an A on Your Next Exam",
              channel: "Thomas Frank",
              takeaways: [
                "Why active recall outperforms passive review.",
                "How to plan revision sessions around spacing.",
                "Practical routines for the days before an exam."
              ]
            },
            {
              youtube: "eVajQPuRmk8",
              title: "The Most Powerful Way to Remember What You Study",
              channel: "Thomas Frank",
              takeaways: [
                "How spaced repetition schedules reviews at the right moment.",
                "Why testing yourself is more effective than rereading.",
                "A simple system for tracking review intervals."
              ]
            }
          ]
        },

        /* ------------------------------------------------------------------
           10. MEMORY TRICKS
           ------------------------------------------------------------------ */
        {
          id: "memory-tricks",
          title: "Memory Tricks",
          icon: "brain",
          accent: "amber",
          level: "Beginner",
          blurb: "Memory palaces, mnemonics and spacing systems that make facts stick.",
          tags: ["memory", "mnemonics", "spaced repetition", "memory palace", "chunking", "study skills"],
          questions: [
            {
              id: "mem-1",
              difficulty: "Beginner",
              tags: ["method of loci", "memory palace", "spatial memory"],
              prompt: "The method of loci (memory palace) works by attaching information to what?",
              options: [
                "A familiar sequence of spatial locations",
                "A random list of numbers",
                "The alphabet in reverse order",
                "The rhythm of a song"
              ],
              answer: 0,
              hint: "Think of walking through a place you know extremely well and placing items along the route.",
              explanation: [
                "The method of loci links each item to a landmark along a familiar route, such as rooms in your home.",
                "Spatial memory is exceptionally durable, so the route acts as a retrieval scaffold.",
                "Recall means mentally walking the route and 'seeing' each item in place.",
                "It is most effective when images are vivid, exaggerated or emotionally odd."
              ]
            },
            {
              id: "mem-2",
              difficulty: "Beginner",
              tags: ["retrieval practice", "testing effect", "rereading"],
              prompt: "Which study behaviour produces the strongest long-term retention?",
              options: [
                "Retrieval practice — testing yourself without looking",
                "Rereading the chapter until it feels familiar",
                "Copying notes neatly a second time",
                "Highlighting key sentences"
              ],
              answer: 0,
              hint: "The effort of pulling information out of memory is what strengthens the memory.",
              explanation: [
                "Retrieval practice forces active reconstruction, strengthening the memory trace.",
                "Rereading and highlighting create fluency — the material feels easy without being retrievable.",
                "The 'testing effect' is one of the most replicated findings in learning science.",
                "Best practice: attempt recall first, then check the source and correct errors."
              ]
            },
            {
              id: "mem-3",
              difficulty: "Intermediate",
              tags: ["interleaving", "blocking", "practice"],
              prompt: "What is interleaving?",
              options: [
                "Mixing different problem types or topics within one practice session",
                "Studying one topic for an entire day before switching",
                "Reviewing material only immediately before the exam",
                "Rewriting notes in a different colour"
              ],
              answer: 0,
              hint: "It is the opposite of blocked practice, where you drill one type repeatedly.",
              explanation: [
                "Interleaving alternates between related topics or problem types in a single session.",
                "It forces you to choose a strategy, not just execute a rehearsed one — closer to exam conditions.",
                "Initial performance feels worse than blocked practice, but transfer and retention improve.",
                "Keep the topics related: mixing calculus with French vocabulary is just distraction."
              ]
            }
          ],
          study: [
            {
              id: "mem-s1",
              title: "Build a Memory Palace",
              icon: "landmark",
              summary: "Use a place you can walk in your mind as a filing cabinet for facts.",
              points: [
                "Choose a familiar route with 10 distinct stops — your home, your school, a daily walk.",
                "Place one vivid image per stop; make it absurd, moving or interactive.",
                "Rehearse the route forward and backward until recall is automatic.",
                "Reuse the same palace for a new topic only after the old material is secure."
              ]
            },
            {
              id: "mem-s2",
              title: "Spaced Repetition Schedule",
              icon: "calendar-clock",
              summary: "Review just as forgetting begins — that is when review does the most work.",
              points: [
                "First review: within 24 hours.",
                "Second review: 3 days later; third: 1 week; fourth: 3 weeks.",
                "Each successful recall lengthens the next interval; a failure shortens it.",
                "Apps help, but a simple calendar with five review dates works just as well."
              ]
            },
            {
              id: "mem-s3",
              title: "Mnemonics That Actually Work",
              icon: "puzzle",
              summary: "Compress arbitrary lists into structures your brain already handles well.",
              points: [
                "Acronyms: PEMDAS, PMAT, ASTC — first letters of an ordered list.",
                "Acrostics: 'My Very Educated Mother Just Served Us Noodles' for planet order.",
                "Chunking: break $31415926535$ into $314$-$159$-$265$-$35$.",
                "Story method: weave items into one narrative with cause and effect."
              ]
            }
          ],
          mistakes: [
            "Building a memory palace with too many stops, so the route itself becomes hard to recall.",
            "Using mnemonics for everything — they are for arbitrary lists, not for understanding mechanisms.",
            "Reviewing only when material feels forgotten; spacing works best just before that point.",
            "Confusing familiarity with mastery: recognising a page is not the same as reproducing its content."
          ],
          tips: [
            {
              title: "Make Images Weird",
              icon: "sparkles",
              body: "Ordinary images fade; bizarre ones stick. If you need to remember that mitochondria produce ATP, picture a tiny power plant inside your ear canal, humming loudly enough to shake your head."
            },
            {
              title: "Dual Coding",
              icon: "git-branch",
              body: "Pair verbal material with a diagram you draw yourself. Two independent memory routes — words and pictures — make retrieval far more robust than either alone."
            },
            {
              title: "Sleep Is a Study Session",
              icon: "moon",
              body: "Consolidation happens during sleep. Reviewing before bed and testing yourself the next morning takes advantage of the brain's overnight filing system."
            }
          ],
          videos: [
            {
              youtube: "eVajQPuRmk8",
              title: "The Most Powerful Way to Remember What You Study",
              channel: "Thomas Frank",
              takeaways: [
                "Why spaced repetition outperforms massed practice.",
                "How to schedule reviews for maximum retention.",
                "A practical routine for building the habit."
              ]
            },
            {
              youtube: "jYWfiP7w5w0",
              title: "10 Study Tips for Earning an A on Your Next Exam",
              channel: "Thomas Frank",
              takeaways: [
                "Active recall techniques you can start today.",
                "How to structure a study session around retrieval.",
                "Why testing yourself beats rereading notes."
              ]
            }
          ]
        },

        /* ------------------------------------------------------------------
           11. MASTER FORMULA SHEETS
           ------------------------------------------------------------------ */
        {
          id: "master-formula-sheets",
          title: "Master Formula Sheets",
          icon: "file-text",
          accent: "amber",
          level: "Intermediate",
          blurb: "The high-yield formulas from algebra, geometry, trigonometry and physics in one place.",
          tags: ["formula sheet", "formulas", "algebra", "geometry", "trigonometry", "constants", "reference"],
          questions: [
            {
              id: "fs-1",
              difficulty: "Beginner",
              tags: ["quadratic", "discriminant", "roots"],
              prompt: "For a quadratic $ax^2 + bx + c = 0$, which condition guarantees two distinct real roots?",
              options: [
                "$b^2 - 4ac > 0$",
                "$b^2 - 4ac = 0$",
                "$b^2 - 4ac < 0$",
                "$b^2 + 4ac > 0$"
              ],
              answer: 0,
              hint: "The discriminant is the part under the square root in the quadratic formula.",
              explanation: [
                "The quadratic formula is $x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$.",
                "The discriminant is $\\Delta = b^2 - 4ac$.",
                "If $\\Delta > 0$, the square root is a positive real number and the $\\pm$ produces two distinct real roots.",
                "If $\\Delta = 0$ there is one repeated root; if $\\Delta < 0$ the roots are complex conjugates."
              ]
            },
            {
              id: "fs-2",
              difficulty: "Beginner",
              tags: ["quadratic formula", "algebra"],
              prompt: "Which is the quadratic formula for $ax^2 + bx + c = 0$?",
              options: [
                "$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$",
                "$x = \\frac{b \\pm \\sqrt{b^2 - 4ac}}{2a}$",
                "$x = \\frac{-b \\pm \\sqrt{b^2 + 4ac}}{2}$",
                "$x = \\frac{-b \\pm \\sqrt{4ac - b^2}}{2a}$"
              ],
              answer: 0,
              hint: "The negative $b$ and the denominator $2a$ are the parts students most often get wrong.",
              explanation: [
                "Starting from $ax^2 + bx + c = 0$, divide by $a$ and complete the square.",
                "This yields $\\left(x + \\frac{b}{2a}\\right)^2 = \\frac{b^2 - 4ac}{4a^2}$.",
                "Take the square root and isolate $x$: $x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$.",
                "The formula works for every quadratic with $a \\neq 0$, real or complex roots."
              ]
            },
            {
              id: "fs-3",
              difficulty: "Intermediate",
              tags: ["geometry", "surface area", "sphere"],
              prompt: "What is the surface area of a sphere of radius $r$?",
              options: [
                "$4\\pi r^2$",
                "$\\frac{4}{3}\\pi r^3$",
                "$2\\pi r^2$",
                "$\\pi r^2$"
              ],
              answer: 0,
              hint: "Surface area is measured in square units; volume is measured in cubic units.",
              explanation: [
                "The surface area of a sphere is $A = 4\\pi r^2$.",
                "$\\frac{4}{3}\\pi r^3$ is the volume, not the surface area.",
                "A useful check: the sphere's surface area equals that of four great circles of radius $r$.",
                "Units confirm the distinction — $r^2$ gives square units."
              ]
            }
          ],
          study: [
            {
              id: "fs-s1",
              title: "Algebra & Functions",
              icon: "square-function",
              summary: "The formulas that unlock most algebra and pre-calculus questions.",
              points: [
                "Quadratic formula: $x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$; discriminant $\\Delta = b^2 - 4ac$.",
                "Slope: $m = \\frac{y_2 - y_1}{x_2 - x_1}$; line: $y - y_1 = m(x - x_1)$.",
                "Exponent rules: $a^m a^n = a^{m+n}$, $(a^m)^n = a^{mn}$, $a^{-n} = \\frac{1}{a^n}$.",
                "Log rules: $\\log_b(xy) = \\log_b x + \\log_b y$, $\\log_b(x^p) = p\\log_b x$."
              ]
            },
            {
              id: "fs-s2",
              title: "Geometry & Trigonometry",
              icon: "shapes",
              summary: "Areas, volumes and the unit-circle values worth having on instant recall.",
              points: [
                "Circle: $A = \\pi r^2$, $C = 2\\pi r$; sphere: $V = \\frac{4}{3}\\pi r^3$, $A = 4\\pi r^2$.",
                "Cylinder: $V = \\pi r^2h$; cone: $V = \\frac{1}{3}\\pi r^2h$; triangle: $A = \\frac{1}{2}bh$.",
                "Right triangles: $a^2 + b^2 = c^2$; $30$-$60$-$90$ sides $x, x\\sqrt{3}, 2x$.",
                "Unit circle: $\\sin 30^\\circ = \\frac{1}{2}$, $\\sin 45^\\circ = \\frac{\\sqrt{2}}{2}$, $\\sin 60^\\circ = \\frac{\\sqrt{3}}{2}$."
              ]
            },
            {
              id: "fs-s3",
              title: "Physics Constants & Units",
              icon: "atom",
              summary: "The numbers and unit conversions that appear throughout mechanics and quantum physics.",
              points: [
                "$g \\approx 9.81\\,\\mathrm{m/s^2}$ (use $10$ for estimates); $G = 6.67\\times10^{-11}\\,\\mathrm{N\\,m^2/kg^2}$.",
                "$h = 6.63\\times10^{-34}\\,\\mathrm{J\\,s}$; $\\hbar = \\frac{h}{2\\pi} \\approx 1.055\\times10^{-34}\\,\\mathrm{J\\,s}$; $c = 3.00\\times10^8\\,\\mathrm{m/s}$.",
                "$hc \\approx 1240\\,\\mathrm{eV\\cdot nm}$; $1\\,\\mathrm{eV} = 1.602\\times10^{-19}\\,\\mathrm{J}$.",
                "Kinematics: $v = u + at$, $s = ut + \\frac{1}{2}at^2$, $v^2 = u^2 + 2as$; energy: $KE = \\frac{1}{2}mv^2$, $PE = mgh$."
              ]
            }
          ],
          mistakes: [
            "Mixing up surface area and volume — check that the units are squared or cubed.",
            "Using the quadratic formula with the wrong sign on $b$: it is $-b$, not $b$.",
            "Forgetting that the discriminant sits under a square root when predicting the number of roots.",
            "Substituting degrees into formulas derived for radians (derivatives, arc length, angular velocity)."
          ],
          tips: [
            {
              title: "Derive, Don't Memorise",
              icon: "pencil",
              body: "If you can rebuild a formula in three steps, you never truly lose it. The quadratic formula comes from completing the square; the sphere volume comes from integrating shells."
            },
            {
              title: "Dimensional Analysis",
              icon: "ruler",
              body: "Check every formula by its units. Velocity must be $\\mathrm{m/s}$; energy must be $\\mathrm{kg\\,m^2/s^2}$. A formula with the wrong units is wrong, no matter how familiar it looks."
            },
            {
              title: "One Page Per Subject",
              icon: "file-text",
              body: "Compress each subject onto a single page you wrote by hand. The act of deciding what to include is itself a powerful review, and the page becomes your final-night revision."
            }
          ],
          videos: [
            {
              youtube: "EshVND1JesY",
              title: "GED Math Formula Sheet Explained",
              channel: "Purely Persistent — GED and HiSET Prep",
              takeaways: [
                "Which formulas appear on a standard reference sheet.",
                "How to substitute values correctly into each formula.",
                "Common traps in area, volume and slope questions."
              ]
            }
          ]
        },

        /* ------------------------------------------------------------------
           14. STUDY PLANNING
           ------------------------------------------------------------------ */
        {
          id: "study-planning",
          title: "Study Planning",
          icon: "calendar-check",
          accent: "amber",
          level: "Beginner",
          blurb: "Turn a syllabus into a realistic week: outcomes, time blocks and a plan you will actually follow.",
          tags: ["study planning", "time management", "pomodoro", "habits", "prioritisation", "revision"],
          questions: [
            {
              id: "plan-1",
              difficulty: "Beginner",
              tags: ["weekly planning", "priorities"],
              prompt: "Which is the strongest foundation for a weekly study plan?",
              options: [
                "Fixed commitments plus three specific outcomes, with buffer time",
                "A minute-by-minute schedule with no gaps",
                "A long list of every task, ordered by subject",
                "Only the topics you enjoy studying"
              ],
              answer: 0,
              hint: "Good plans start from reality — the time you actually have — and end with a small number of concrete results.",
              explanation: [
                "Begin with immovable commitments: classes, work, sleep and travel.",
                "Choose a few specific outcomes, not vague topics — 'finish 20 calculus problems' beats 'study calculus'.",
                "Leave buffer time: plans that fill every minute collapse after the first unexpected event.",
                "A task list without calendar blocks does not reserve the time those tasks need."
              ]
            },
            {
              id: "plan-2",
              difficulty: "Beginner",
              tags: ["pomodoro", "focus", "breaks"],
              prompt: "What is the main purpose of the Pomodoro technique (25 minutes of focus, then a 5-minute break)?",
              options: [
                "To sustain concentration by making focus blocks short and breaks scheduled",
                "To finish an entire subject in one sitting",
                "To avoid planning and study whatever feels urgent",
                "To replace sleep before an exam"
              ],
              answer: 0,
              hint: "The technique is about starting and protecting attention, not about the timer itself.",
              explanation: [
                "A fixed interval lowers the cost of starting: you commit to 25 minutes, not to an entire subject.",
                "Scheduled breaks reduce fatigue and keep the next block productive.",
                "After four blocks, take a longer break (15–30 minutes).",
                "The timer is a tool for attention; it is not a substitute for sleep or for planning what to study."
              ]
            },
            {
              id: "plan-3",
              difficulty: "Intermediate",
              tags: ["prioritisation", "habits", "deep work"],
              prompt: "What does 'eat the frog' mean in a study context?",
              options: [
                "Do the hardest, most important task first, before the day fills up",
                "Study only the easiest material to build momentum",
                "Alternate subjects every five minutes",
                "Review everything the night before the exam"
              ],
              answer: 0,
              hint: "Willpower and attention are highest early; put the task you are most likely to avoid there.",
              explanation: [
                "The phrase comes from the idea that if you must eat a frog, do it first thing.",
                "Hard tasks benefit most from fresh attention and are most likely to be postponed indefinitely.",
                "Completing the hardest task early also removes the anxiety that drains attention from everything else.",
                "Easier review tasks fit well into lower-energy periods later in the day."
              ]
            }
          ],
          study: [
            {
              id: "plan-s1",
              title: "The Weekly Planning Ritual",
              icon: "calendar-clock",
              summary: "Thirty minutes once a week saves hours of daily indecision.",
              points: [
                "List fixed commitments first, then subtract sleep, meals and travel to see your real capacity.",
                "Pick three outcomes for the week — each one a demonstrable result, not a topic.",
                "Place them into calendar blocks before the week starts; unscheduled work rarely happens.",
                "Plan for about $80\%$ of your available time and leave the rest as buffer."
              ]
            },
            {
              id: "plan-s2",
              title: "Focus Blocks & Pomodoro",
              icon: "timer",
              summary: "Protect attention with short, defined blocks and honest breaks.",
              points: [
                "Choose one task per block and write it down before starting.",
                "Silence notifications and close unrelated tabs for the block's duration.",
                "Take the break away from the screen; scrolling is not recovery.",
                "Track completed blocks — the count is a better progress signal than hours 'studied'."
              ]
            },
            {
              id: "plan-s3",
              title: "Review, Adjust, Repeat",
              icon: "refresh-ccw",
              summary: "A plan that is never reviewed is just a wish list.",
              points: [
                "End the week with a ten-minute review: what got done, what slipped, and why.",
                "Keep an error log for practice tests and revisit it before the next session.",
                "If a task slipped twice, shrink it or schedule it earlier — do not simply repeat the plan.",
                "Adjust next week's capacity instead of borrowing from sleep."
              ]
            }
          ],
          mistakes: [
            "Planning every minute, leaving no room for the unexpected.",
            "Confusing a to-do list with a schedule — tasks need calendar blocks.",
            "Multitasking across subjects in the same block, which increases switching costs.",
            "Treating lost sleep as extra study time; it damages consolidation and recall."
          ],
          tips: [
            {
              title: "Implementation Intentions",
              icon: "target",
              body: "Write plans as 'When X, I will Y at Z': 'When I finish dinner, I will do 20 calculus problems at the kitchen table.' Concrete cues beat vague intentions."
            },
            {
              title: "The Two-Minute Start",
              icon: "play",
              body: "Commit to only two minutes of the task. Starting is the hardest part, and momentum usually carries you past the timer."
            },
            {
              title: "Plan for 80%",
              icon: "gauge",
              body: "A week planned to $100\%$ capacity fails on day one. Leave a fifth of your study time unassigned so the plan survives a bad day."
            }
          ],
          videos: [
            {
              youtube: "jYWfiP7w5w0",
              title: "10 Study Tips for Earning an A on Your Next Exam",
              channel: "Thomas Frank",
              takeaways: [
                "How to structure revision around active recall.",
                "Why spacing beats cramming.",
                "Practical routines for the days before an exam."
              ]
            },
            {
              youtube: "eVajQPuRmk8",
              title: "The Most Powerful Way to Remember What You Study",
              channel: "Thomas Frank",
              takeaways: [
                "How spaced repetition schedules reviews.",
                "Why testing yourself creates durable memory.",
                "A simple system for tracking review intervals."
              ]
            }
          ]
        }
      ]
    },

    /* ======================================================================
       LANGUAGES
       ====================================================================== */
    {
      id: "languages",
      title: "Languages",
      tagline: "Forty-seven languages, one method: hear it, say it, then read the grammar.",
      icon: "quote",
      accent: "sky",
      subjects: [
        /* ------------------------------------------------------------------
           SPANISH
           ------------------------------------------------------------------ */
        {
          id: "spanish",
          title: "Spanish",
          icon: "quote",
          accent: "amber",
          level: "Beginner",
          blurb: "Greetings, gender and the present tense — the three habits that make Spanish start to click.",
          tags: ["Spanish", "greetings", "gender", "present tense", "ser vs estar", "pronunciation"],
          questions: [
            {
              id: "span-1",
              difficulty: "Beginner",
              tags: ["greetings", "vocabulary"],
              prompt: "What does '¿Cómo estás?' mean?",
              options: [
                "What is your name?",
                "Where are you from?",
                "How are you?",
                "How old are you?"
              ],
              answer: 2,
              hint: "It is the question you ask after 'Hola'. The usual reply is 'Bien, gracias'.",
              explanation: [
                "'¿Cómo estás?' is the informal way to ask 'How are you?'.",
                "A natural reply is 'Estoy bien, gracias' or 'Muy bien'.",
                "Use '¿Cómo está usted?' when speaking formally to one person.",
                "'¿Cómo te llamas?' asks for a name, not for wellbeing."
              ]
            },
            {
              id: "span-2",
              difficulty: "Beginner",
              tags: ["gender", "articles", "nouns"],
              prompt: "Which definite article goes with 'libro' (book)?",
              options: ["la", "el", "los", "las"],
              answer: 1,
              hint: "'Libro' is masculine and singular. Spanish articles agree in both gender and number.",
              explanation: [
                "'Libro' is a masculine singular noun, so it takes the masculine singular article 'el'.",
                "The phrase is 'el libro'. Its plural is 'los libros'.",
                "Feminine singular nouns take 'la', as in 'la casa'.",
                "Do not guess from the ending alone: 'el mapa' is masculine and 'la mano' is feminine."
              ]
            },
            {
              id: "span-3",
              difficulty: "Beginner",
              tags: ["present tense", "verb conjugation", "hablar"],
              prompt: "Complete the sentence: 'Ella ___ español.' (hablar)",
              options: ["hablas", "hablo", "hablan", "habla"],
              answer: 3,
              hint: "'Ella' is third-person singular. Regular -ar verbs take -a in that form.",
              explanation: [
                "'Hablar' is a regular -ar verb. Drop -ar to get the stem 'habl-'.",
                "For 'ella' (she), add -a: 'ella habla'.",
                "The full present tense is 'yo hablo, tú hablas, él/ella habla, nosotros hablamos, ellos hablan'.",
                "Spanish often drops the pronoun, but 'ella habla' keeps it for emphasis."
              ]
            }
          ],
          study: [
            {
              id: "span-s1",
              title: "Sounds & Greetings",
              icon: "quote",
              summary: "Spanish spelling is unusually honest: five clean vowels and one silent letter.",
              points: [
                "The five vowels are a, e, i, o, u — each has one short, stable sound. Never glide them into English diphthongs.",
                "The letter h is silent: 'hola' sounds like 'OH-lah'. The letter ñ is a separate letter, as in 'mañana'.",
                "Greet with 'Hola', 'Buenos días' (morning), 'Buenas tardes' (afternoon) and 'Buenas noches' (evening).",
                "Use 'tú' with friends and peers, and 'usted' with strangers, elders or anyone you address formally."
              ]
            },
            {
              id: "span-s2",
              title: "Gender & Articles",
              icon: "layers",
              summary: "Every noun has a gender, and everything attached to it has to agree.",
              points: [
                "Definite articles: 'el' (masculine singular), 'la' (feminine singular), 'los' and 'las' in the plural.",
                "Indefinite articles: 'un' and 'una' mean 'a' or 'an'; 'unos' and 'unas' mean 'some'.",
                "Adjectives agree with the noun: 'el libro nuevo', 'la casa nueva', 'los libros nuevos'.",
                "Use 'ser' for identity, origin and profession, and 'estar' for location, mood and temporary states."
              ]
            },
            {
              id: "span-s3",
              title: "The Present Tense",
              icon: "pencil-line",
              summary: "Three endings — -ar, -er, -ir — cover most verbs you will meet at the start.",
              points: [
                "Regular -ar verbs: hablo, hablas, habla, hablamos, habláis, hablan.",
                "Regular -er verbs: como, comes, come, comemos, coméis, comen.",
                "Regular -ir verbs: vivo, vives, vive, vivimos, vivís, viven.",
                "Learn 'ser', 'ir' and 'tener' early — they are irregular and extremely common."
              ]
            }
          ],
          mistakes: [
            "Pronouncing the h in 'hola' — it is silent.",
            "Assuming every noun ending in -o is masculine; 'la mano' and 'la foto' are common exceptions.",
            "Using 'ser' for temporary states: say 'estoy cansado', not 'soy cansado'.",
            "Translating 'I am hungry' as 'soy hambriento'; Spanish says 'tengo hambre' (I have hunger)."
          ],
          tips: [
            {
              title: "Shadow the Greetings",
              icon: "play",
              body: "Play a 30-second greeting clip, pause after each line and repeat it aloud with the same rhythm. Record yourself once a week and compare — pronunciation improves faster when you hear your own version."
            },
            {
              title: "Learn Verbs in Pairs",
              icon: "repeat-2",
              body: "Study opposites together: comprar/vender, entrar/salir, subir/bajar. Conjugate one pair each day and use both in a sentence, so the endings arrive with a meaning attached."
            },
            {
              title: "Label Your Room",
              icon: "tag",
              body: "Put sticky notes on ten objects with the article included: 'la puerta', 'el escritorio', 'la lámpara'. The article is part of the word, so learn it as one unit."
            }
          ],
          videos: [
            {
              youtube: "SoPiuMh6lnQ",
              title: "Learn Spanish - How to Greet People in Spanish",
              channel: "Learn Spanish with SpanishPod101.com",
              takeaways: [
                "Which greetings fit morning, afternoon and evening.",
                "How formal and informal greetings differ.",
                "A short model conversation you can repeat aloud."
              ]
            },
            {
              youtube: "IIkXK7ezRuA",
              title: "Aprender español: Usos de SER y ESTAR (nivel básico)",
              channel: "Tu escuela de español",
              takeaways: [
                "The core distinction between identity and state.",
                "Common adjectives that change meaning with ser or estar.",
                "Example sentences that make the choice obvious."
              ]
            }
          ]
        },

        /* ------------------------------------------------------------------
           FRENCH
           ------------------------------------------------------------------ */
        {
          id: "french",
          title: "French",
          icon: "feather",
          accent: "rose",
          level: "Beginner",
          blurb: "Greetings, gender and the passé composé — enough grammar to read a short article and say what happened.",
          tags: ["French", "greetings", "gender", "passé composé", "politeness", "liaison"],
          questions: [
            {
              id: "fr-1",
              difficulty: "Beginner",
              tags: ["greetings", "register"],
              prompt: "When is 'Bonsoir' appropriate?",
              options: [
                "Early in the morning",
                "In the evening, when arriving or greeting someone",
                "Only in written French",
                "When saying goodbye at bedtime"
              ],
              answer: 1,
              hint: "It contains 'soir' — evening. 'Bonne nuit' is what you say before sleep.",
              explanation: [
                "'Bonsoir' is used from late afternoon or early evening onward, usually when arriving somewhere.",
                "'Bonjour' covers the daytime; 'bonne nuit' is said when someone is going to bed.",
                "'Salut' is informal and works for both hello and goodbye among friends.",
                "When leaving, 'Au revoir' is the safe general choice."
              ]
            },
            {
              id: "fr-2",
              difficulty: "Beginner",
              tags: ["gender", "articles", "nouns"],
              prompt: "Which article goes with 'maison' (house)?",
              options: ["le", "les", "un", "la"],
              answer: 3,
              hint: "'Maison' is feminine singular. Check the noun's gender before choosing the article.",
              explanation: [
                "'Maison' is feminine singular, so the definite article is 'la': 'la maison'.",
                "The indefinite article is 'une': 'une maison'.",
                "In the plural, both genders use 'les': 'les maisons'.",
                "Noun endings are hints, not rules — 'le musée' ends in -e but is masculine."
              ]
            },
            {
              id: "fr-3",
              difficulty: "Intermediate",
              tags: ["past tense", "passé composé", "auxiliaries"],
              prompt: "'J'ai mangé' is which tense?",
              options: ["Passé composé", "Imparfait", "Futur simple", "Présent"],
              answer: 0,
              hint: "It is built from a present-tense auxiliary plus a past participle.",
              explanation: [
                "'J'ai mangé' uses the auxiliary 'avoir' plus the past participle 'mangé' — that is the passé composé.",
                "It translates as 'I ate' or 'I have eaten', depending on context.",
                "The imparfait would be 'je mangeais'; the futur simple would be 'je mangerai'.",
                "Most verbs take 'avoir'; a small set of movement and reflexive verbs take 'être'."
              ]
            }
          ],
          study: [
            {
              id: "fr-s1",
              title: "Greetings & Politeness",
              icon: "quote",
              summary: "French politeness is grammatical, not optional — the pronoun you choose sets the tone.",
              points: [
                "'Bonjour' is the default daytime greeting; 'bonsoir' replaces it in the evening.",
                "Use 'tu' with friends, family and peers; use 'vous' with strangers, elders, groups and formal situations.",
                "'S'il vous plaît' (formal) and 's'il te plaît' (informal) both mean 'please'.",
                "Liaison links a silent final consonant to a following vowel: 'vous avez' sounds like 'vou-z-avez'."
              ]
            },
            {
              id: "fr-s2",
              title: "Gender & Articles",
              icon: "layers",
              summary: "Learn every noun with its article; the article is the gender label you will reuse everywhere.",
              points: [
                "Definite articles: 'le' (masculine), 'la' (feminine), 'les' (plural). Before a vowel, 'le' and 'la' become 'l''.",
                "Indefinite articles: 'un' (masculine), 'une' (feminine), 'des' (plural).",
                "Common feminine endings include -tion, -té and -ance; common masculine endings include -ment and -age.",
                "Adjectives normally follow the noun and agree: 'un livre intéressant', 'une idée intéressante'."
              ]
            },
            {
              id: "fr-s3",
              title: "The Passé Composé",
              icon: "pencil-line",
              summary: "One auxiliary plus one past participle — the everyday past tense for completed events.",
              points: [
                "Form it with the present tense of 'avoir' or 'être' plus a past participle: 'j'ai parlé', 'je suis allé'.",
                "Regular -er verbs form the participle with -é: parler → parlé; -ir verbs often take -i: finir → fini.",
                "With 'être', the participle agrees with the subject: 'elle est allée', 'ils sont partis'.",
                "Use the imparfait for ongoing or repeated background, and the passé composé for a single completed event."
              ]
            }
          ],
          mistakes: [
            "Using 'tu' with a stranger or a new colleague; default to 'vous' until invited otherwise.",
            "Assuming every noun ending in -e is feminine — 'le musée' and 'le problème' are masculine.",
            "Forgetting agreement with être verbs: write 'elle est allée', not 'elle est allé'.",
            "Using the imparfait for a single finished action instead of the passé composé."
          ],
          tips: [
            {
              title: "Listen for Liaisons",
              icon: "play",
              body: "Pick one short audio clip and mark every liaison you hear: 'les amis', 'vous avez', 'un homme'. Repeating the links makes your speech sound French far faster than perfecting individual vowels."
            },
            {
              title: "One Verb, Six Forms",
              icon: "repeat-2",
              body: "Write the six present-tense forms of one verb each morning and say them aloud. Keep a running list of irregulars — être, avoir, aller, faire — because they carry most everyday conversation."
            },
            {
              title: "Speak from Day One",
              icon: "quote",
              body: "Narrate three things you did yesterday in the passé composé, even if each sentence is only five words. Accuracy grows from repeated attempts, not from waiting until the grammar is complete."
            }
          ],
          videos: [
            {
              youtube: "hd0_GZHHWeE",
              title: "French Greetings (French Essentials Lesson 1)",
              channel: "Learn French With Alexa",
              takeaways: [
                "The standard greetings for different times of day.",
                "How to choose between tu and vous.",
                "Pronunciation of common greeting phrases."
              ]
            },
            {
              youtube: "R7CMGVsanu8",
              title: "Être or Avoir in the Passé Composé in French",
              channel: "Learn French With Alexa",
              takeaways: [
                "How to choose the correct auxiliary verb.",
                "Why être verbs need participle agreement.",
                "A practical list of common être verbs."
              ]
            }
          ]
        },

        /* ------------------------------------------------------------------
           GERMAN
           ------------------------------------------------------------------ */
        {
          id: "german",
          title: "German",
          icon: "layers",
          accent: "sky",
          level: "Beginner",
          blurb: "Cases, word order and noun gender — the three gears behind every German sentence.",
          tags: ["German", "cases", "word order", "noun gender", "accusative", "dative"],
          questions: [
            {
              id: "de-1",
              difficulty: "Beginner",
              tags: ["gender", "articles", "diminutives"],
              prompt: "Which article is correct for 'Mädchen' (girl)?",
              options: ["der", "die", "den", "das"],
              answer: 3,
              hint: "The ending -chen is a diminutive. All German diminutives are neuter, regardless of meaning.",
              explanation: [
                "'Mädchen' ends in the diminutive suffix -chen, and every -chen noun is neuter.",
                "The correct nominative phrase is 'das Mädchen'.",
                "Grammatical gender is not the same as biological gender — this is the standard example.",
                "In the accusative case the article stays 'das': 'Ich sehe das Mädchen'."
              ]
            },
            {
              id: "de-2",
              difficulty: "Beginner",
              tags: ["word order", "main clause", "verb position"],
              prompt: "In a German main clause, where does the finite verb go?",
              options: [
                "In second position",
                "In first position",
                "At the end of the clause",
                "Immediately after the direct object"
              ],
              answer: 0,
              hint: "The rule is often called 'verb second'. If a time phrase starts the sentence, the verb still comes next.",
              explanation: [
                "In a main clause the finite verb occupies the second position: 'Ich lerne heute Deutsch'.",
                "If an element moves to the front, the verb stays second: 'Heute lerne ich Deutsch'.",
                "A yes/no question puts the verb first: 'Lernst du Deutsch?'.",
                "In a subordinate clause the finite verb moves to the end: '..., weil ich Deutsch lerne'."
              ]
            },
            {
              id: "de-3",
              difficulty: "Intermediate",
              tags: ["prepositions", "dative", "contractions"],
              prompt: "Complete the sentence: 'Ich fahre ___ Schule.'",
              options: ["zum", "in", "zur", "auf"],
              answer: 2,
              hint: "'Schule' is feminine. The preposition 'zu' contracts with 'der' in the dative.",
              explanation: [
                "'Schule' is feminine, so the dative article after 'zu' is 'der'.",
                "'Zu' + 'der' contracts to 'zur': 'Ich fahre zur Schule'.",
                "'Zum' is the contraction of 'zu' + 'dem', used with masculine or neuter nouns.",
                "'In die Schule' is also possible when emphasising entering the building, but 'zur Schule' is the idiomatic 'to school'."
              ]
            }
          ],
          study: [
            {
              id: "de-s1",
              title: "Cases at a Glance",
              icon: "layers",
              summary: "German marks the role of a noun with its article — that is what a case is.",
              points: [
                "Nominative: the subject. 'Der Mann liest.'",
                "Accusative: the direct object. 'Ich sehe den Mann.'",
                "Dative: the indirect object or the object of certain prepositions. 'Ich helfe dem Mann.'",
                "Genitive: possession. 'Das Buch des Mannes.' Learn the article changes as a small table, not as isolated facts."
              ]
            },
            {
              id: "de-s2",
              title: "Word Order",
              icon: "route",
              summary: "German word order is a frame: the finite verb holds second place in main clauses.",
              points: [
                "Main clause: subject or another element first, finite verb second, the rest after.",
                "Neutral order inside the clause is time, manner, place: 'Ich fahre morgen mit dem Zug nach Berlin'.",
                "Yes/no questions start with the verb: 'Hast du Zeit?'",
                "Subordinate clauses after 'weil', 'dass' or 'wenn' send the finite verb to the end."
              ]
            },
            {
              id: "de-s3",
              title: "Gendered Nouns",
              icon: "boxes",
              summary: "Three genders, one plural article, and a few endings that reliably predict gender.",
              points: [
                "Every noun is masculine, feminine or neuter: der, die or das. Learn the article with the noun.",
                "Diminutives in -chen and -lein are always neuter: das Mädchen, das Fräulein.",
                "Compound nouns take the gender of their last element: 'die Haustür' from 'die Tür'.",
                "The plural definite article is always 'die', regardless of the noun's gender."
              ]
            }
          ],
          mistakes: [
            "Assuming grammatical gender matches natural gender — 'das Mädchen' is neuter.",
            "Putting the finite verb at the end of a main clause.",
            "Using the nominative after accusative prepositions such as durch, für, gegen, ohne and um.",
            "Forgetting the extra -n in the dative plural: 'mit den Kindern'."
          ],
          tips: [
            {
              title: "Noun + Article, Always",
              icon: "tag",
              body: "Never memorize a noun alone. Write 'der Tisch, die Lampe, das Fenster' and say the article with the word every time. Gender becomes automatic through repetition, not through rules."
            },
            {
              title: "Chunk the Cases",
              icon: "repeat-2",
              body: "Learn whole phrases instead of isolated endings: 'mit der Bahn', 'für den Kurs', 'auf dem Tisch'. The case is carried by the chunk, so you can retrieve it whole under pressure."
            },
            {
              title: "Verb Second Check",
              icon: "check-check",
              body: "Before you say a main-clause sentence, find the finite verb and count its position. If it is not second, move it. This single check fixes most beginner word-order errors."
            }
          ],
          videos: [
            {
              youtube: "iB_sassbnOw",
              title: "German Lesson 1: Learn German for Beginners - German Greetings",
              channel: "Learn German with Anja",
              takeaways: [
                "Essential greetings for different times of day.",
                "How to introduce yourself simply.",
                "Pronunciation of common beginner phrases."
              ]
            },
            {
              youtube: "fd_5Wjsf9xo",
              title: "Learn the Accusative Case in German - Part 1: The Direct Object",
              channel: "lingoni GERMAN",
              takeaways: [
                "Why the accusative case exists.",
                "How masculine articles change in the accusative.",
                "Example sentences with direct objects."
              ]
            }
          ]
        },

        /* ------------------------------------------------------------------
           PORTUGUESE
           ------------------------------------------------------------------ */
        {
          id: "portuguese",
          title: "Portuguese",
          icon: "waves",
          accent: "emerald",
          level: "Beginner",
          blurb: "European and Brazilian foundations: nasal sounds, ser vs estar, and the verbs you will use every day.",
          tags: ["Portuguese", "greetings", "nasal vowels", "ser vs estar", "verb endings", "Brazilian Portuguese"],
          questions: [
            {
              id: "pt-1",
              difficulty: "Beginner",
              tags: ["vocabulary", "agreement", "politeness"],
              prompt: "A male speaker says thank you as...",
              options: ["obrigado", "obrigada", "obrigados", "obrigadinho"],
              answer: 0,
              hint: "The ending agrees with the speaker's gender, not with the person being thanked.",
              explanation: [
                "A male speaker says 'obrigado'; a female speaker says 'obrigada'.",
                "The word behaves like an adjective and agrees with the speaker.",
                "In the plural, use 'obrigados' for a male or mixed group and 'obrigadas' for an all-female group.",
                "'Obrigadinho' is a diminutive and sounds affectionate or informal, not neutral."
              ]
            },
            {
              id: "pt-2",
              difficulty: "Beginner",
              tags: ["ser vs estar", "verbs", "meaning"],
              prompt: "Which verb describes a permanent characteristic?",
              options: ["estar", "ter", "ser", "ficar"],
              answer: 2,
              hint: "Think of identity, origin and profession — the things that define what something is.",
              explanation: [
                "'Ser' describes identity, origin, nationality and generally permanent characteristics: 'Sou brasileiro'.",
                "'Estar' describes temporary states and locations: 'Estou cansado', 'Estou em casa'.",
                "'Ter' means 'to have': 'Tenho um livro'.",
                "'Ficar' means 'to stay' or 'to become': 'Fico em casa'."
              ]
            },
            {
              id: "pt-3",
              difficulty: "Beginner",
              tags: ["present tense", "ser", "nationality"],
              prompt: "Complete the sentence: 'Eu ___ brasileiro.'",
              options: ["estou", "sou", "tenho", "fico"],
              answer: 1,
              hint: "Nationality is treated as identity in Portuguese.",
              explanation: [
                "Nationality takes 'ser': 'Eu sou brasileiro'.",
                "The first-person present form of 'ser' is 'sou'.",
                "'Estou' would describe a temporary state or location, not nationality.",
                "A female speaker says 'Eu sou brasileira'."
              ]
            }
          ],
          study: [
            {
              id: "pt-s1",
              title: "Sounds & Greetings",
              icon: "quote",
              summary: "Portuguese vowels are the hard part; the greetings are the easy win.",
              points: [
                "Nasal vowels are written with a tilde or a following m/n: 'ão', 'ãe', 'õe'. They resonate through the nose.",
                "European Portuguese reduces unstressed vowels sharply; Brazilian Portuguese pronounces them more openly.",
                "Greetings: 'Olá', 'Bom dia', 'Boa tarde', 'Boa noite'. 'Obrigado/obrigada' agrees with the speaker.",
                "Use 'você' in most of Brazil; 'o senhor' and 'a senhora' add formality. Portugal uses 'tu' more readily among peers."
              ]
            },
            {
              id: "pt-s2",
              title: "Ser vs Estar",
              icon: "layers",
              summary: "Two verbs for 'to be', split by identity versus state.",
              points: [
                "'Ser' covers identity, origin, nationality, profession and inherent characteristics.",
                "'Estar' covers temporary states, moods, locations and ongoing actions.",
                "Some adjectives change meaning: 'Ele é bonito' (he is handsome) versus 'Ele está bonito' (he looks handsome today).",
                "Professions normally take 'ser': 'Ela é professora'. Location normally takes 'estar': 'Ela está na escola'."
              ]
            },
            {
              id: "pt-s3",
              title: "Verb Endings",
              icon: "pencil-line",
              summary: "Three infinitive endings, one present-tense pattern, and a very useful future shortcut.",
              points: [
                "Infinitives end in -ar, -er or -ir: falar, comer, viver.",
                "Regular present: eu falo, você fala, nós falamos; eu como, você come; eu vivo, você vive.",
                "For a near future, use 'ir' + infinitive: 'Vou estudar' (I am going to study).",
                "Learn 'ser', 'estar', 'ter' and 'ir' early — they are irregular and appear constantly."
              ]
            }
          ],
          mistakes: [
            "Using 'estar' for nationality or origin instead of 'ser'.",
            "Dropping the plural -s on articles and nouns: 'os livros', not 'o livro' for plural.",
            "Pronouncing every final vowel fully in European Portuguese, where many are reduced.",
            "Saying 'eu é' instead of 'eu sou'."
          ],
          tips: [
            {
              title: "Nasal Drill",
              icon: "waves",
              body: "Practise minimal pairs such as 'pão' versus 'pau' and 'mãe' versus 'mai'. Put a hand near your nose: you should feel vibration on the nasal word. Two minutes a day is enough."
            },
            {
              title: "Ser/Estar Pairs",
              icon: "repeat-2",
              body: "Write five sentences about yourself with 'ser' and five with 'estar'. Then change the temporary ones to permanent and notice how the meaning shifts. The contrast is easier to remember than a rule list."
            },
            {
              title: "Listen to Both Varieties",
              icon: "play",
              body: "Spend one week with Brazilian audio and one with European Portuguese. You do not need to imitate both, but you do need to understand both — the vowel reduction differences are large."
            }
          ],
          videos: [
            {
              youtube: "pgC1ofHxm7s",
              title: "European Portuguese Lessons For Beginners: Greetings and Introductions",
              channel: "Mia Esmeriz Academy",
              takeaways: [
                "Greetings for different times of day.",
                "How to introduce yourself and ask someone's name.",
                "European Portuguese pronunciation of familiar phrases."
              ]
            },
            {
              youtube: "H6UGVnW0nz8",
              title: "The Differences Between Ser & Estar",
              channel: "Speaking Brazilian Language School",
              takeaways: [
                "The identity-versus-state distinction in Brazilian Portuguese.",
                "Adjectives whose meaning changes with the verb.",
                "Everyday example sentences using both verbs."
              ]
            }
          ]
        },

        /* ------------------------------------------------------------------
           HINDI
           ------------------------------------------------------------------ */
        {
          id: "hindi",
          title: "Hindi",
          icon: "scroll-text",
          accent: "amber",
          level: "Beginner",
          blurb: "Devanagari, sentence structure and polite forms — read the script and build your first Hindi sentences.",
          tags: ["Hindi", "Devanagari", "SOV", "postpositions", "politeness", "greetings"],
          questions: [
            {
              id: "hi-1",
              difficulty: "Beginner",
              tags: ["word order", "grammar"],
              prompt: "What is the basic Hindi word order?",
              options: [
                "Subject - Verb - Object",
                "Subject - Object - Verb",
                "Verb - Subject - Object",
                "Object - Verb - Subject"
              ],
              answer: 1,
              hint: "The verb waits until the end of the clause.",
              explanation: [
                "Hindi is an SOV language: the subject comes first, the object next, and the verb last.",
                "'मैं हिंदी पढ़ता हूँ' literally orders as 'I Hindi read'.",
                "English's SVO order sounds wrong in Hindi: 'मैं पढ़ता हूँ हिंदी' is not the neutral order.",
                "Time and place phrases usually sit before the object, but the verb stays final."
              ]
            },
            {
              id: "hi-2",
              difficulty: "Beginner",
              tags: ["greetings", "politeness", "vocabulary"],
              prompt: "What does 'आप कैसे हैं?' mean?",
              options: [
                "What is your name?",
                "Where are you going?",
                "How old are you?",
                "How are you? (formal)"
              ],
              answer: 3,
              hint: "'आप' is the formal 'you'; 'कैसे' asks 'how'.",
              explanation: [
                "'आप कैसे हैं?' means 'How are you?' and uses the formal pronoun 'आप'.",
                "The reply can be 'मैं ठीक हूँ' (I am fine).",
                "'आपका नाम क्या है?' asks someone's name.",
                "With a close friend you might say 'तुम कैसे हो?'; 'आप' is the safe choice with strangers and elders."
              ]
            },
            {
              id: "hi-3",
              difficulty: "Beginner",
              tags: ["postpositions", "grammar", "location"],
              prompt: "Which postposition means 'in' in 'घर में'?",
              options: ["पर", "से", "में", "को"],
              answer: 2,
              hint: "'घर' means house. The word that follows it marks location inside.",
              explanation: [
                "'में' means 'in': 'घर में' = 'in the house'.",
                "'पर' means 'on': 'मेज़ पर' = 'on the table'.",
                "'से' means 'from' or 'by'; 'को' marks a destination or an indirect object.",
                "Hindi postpositions follow the noun, unlike English prepositions."
              ]
            }
          ],
          study: [
            {
              id: "hi-s1",
              title: "Script & Sounds",
              icon: "quote",
              summary: "Devanagari is systematic: consonants carry an inherent vowel, and matras change it.",
              points: [
                "Devanagari is written left to right and has no capital letters.",
                "A consonant letter carries an inherent 'a' sound; vowel signs (matras) attach around it to change the vowel.",
                "Hindi distinguishes aspirated from unaspirated consonants — 'क' (ka) versus 'ख' (kha).",
                "Retroflex consonants (ट, ड, ण) are pronounced with the tongue curled back; English has no exact equivalent."
              ]
            },
            {
              id: "hi-s2",
              title: "Sentence Structure",
              icon: "route",
              summary: "Subject, object, verb — with postpositions trailing their nouns.",
              points: [
                "Neutral order is Subject - Object - Verb: 'मैं चाय पीता हूँ' (I tea drink).",
                "Postpositions follow the noun: 'मेज़ पर' (on the table), 'घर में' (in the house).",
                "Verbs agree with the subject in person, number and gender: 'वह पढ़ता है' (he reads), 'वह पढ़ती है' (she reads).",
                "'है' is singular and 'हैं' plural or formal: 'वे ठीक हैं'."
              ]
            },
            {
              id: "hi-s3",
              title: "Politeness & Pronouns",
              icon: "layers",
              summary: "Hindi has three levels of 'you', and the verb changes with the level you choose.",
              points: [
                "'आप' is formal and respectful; 'तुम' is informal; 'तू' is intimate or deliberately rude outside close relationships.",
                "The verb agrees with the pronoun: 'आप कैसे हैं?', 'तुम कैसे हो?', 'तू कैसा है?'.",
                "The infinitive ends in -ना: पढ़ना (to read), खाना (to eat), जाना (to go).",
                "Requests soften with 'कृपया' (please) and the polite imperative: 'कृपया बैठिए'."
              ]
            }
          ],
          mistakes: [
            "Using English SVO order and placing the verb before the object.",
            "Putting a postposition before its noun, as English does with prepositions.",
            "Mixing 'है' and 'हैं' — plural subjects need 'हैं'.",
            "Using 'तू' with strangers; it sounds confrontational outside intimate contexts."
          ],
          tips: [
            {
              title: "Read Devanagari Aloud",
              icon: "quote",
              body: "Read one line of Devanagari aloud every day, even if you do not know every word. Sounding out the script builds the decoding speed that everything else depends on."
            },
            {
              title: "Postpositions as Chunks",
              icon: "repeat-2",
              body: "Memorize location phrases whole: 'घर में', 'मेज़ पर', 'स्कूल से'. Chunks teach the postposition and the noun together, which is how fluent speech retrieves them."
            },
            {
              title: "Shadow a Scene",
              icon: "play",
              body: "Choose a 30-second dialogue from a film or lesson, play one line, and repeat it with the same intonation. Hindi rhythm and aspiration are easier to copy than to describe."
            }
          ],
          videos: [
            {
              youtube: "zQlQWjr8VxA",
              title: "Learn Hindi - Hindi in Three Minutes - Greetings",
              channel: "Learn Hindi with HindiPod101.com",
              takeaways: [
                "Common greetings for different situations.",
                "How politeness changes the phrase you choose.",
                "Clear pronunciation of everyday expressions."
              ]
            },
            {
              youtube: "GGRZUlVa74c",
              title: "Learn Hindi in 50 Minutes - ALL Basics Every Beginners Need",
              channel: "Learn Hindi with HindiPod101.com",
              takeaways: [
                "A broad tour of beginner vocabulary and phrases.",
                "How basic sentences are assembled.",
                "Listening practice with native-speed speech."
              ]
            }
          ]
        },

        /* ------------------------------------------------------------------
           MANDARIN CHINESE
           ------------------------------------------------------------------ */
        {
          id: "mandarin",
          title: "Mandarin Chinese",
          icon: "sparkles",
          accent: "rose",
          level: "Beginner",
          blurb: "Tones, measure words and word order — the parts of Mandarin that reward daily listening.",
          tags: ["Mandarin", "Chinese", "tones", "pinyin", "measure words", "HSK"],
          questions: [
            {
              id: "zh-1",
              difficulty: "Beginner",
              tags: ["tones", "pronunciation", "pinyin"],
              prompt: "Which tone is 'mā' (妈)?",
              options: ["Second tone — rising", "Third tone — dipping", "Fourth tone — falling", "First tone — high and level"],
              answer: 3,
              hint: "The flat line over the a is the clue.",
              explanation: [
                "The macron in 'mā' marks the first tone: a high, level pitch.",
                "'má' is the second (rising) tone, 'mǎ' the third (dipping), and 'mà' the fourth (falling).",
                "The same syllable with a different tone is a different word: 妈 (mother), 麻 (hemp), 马 (horse), 骂 (scold).",
                "Tones are not decoration; they are part of the pronunciation and must be learned with the word."
              ]
            },
            {
              id: "zh-2",
              difficulty: "Beginner",
              tags: ["measure words", "nouns", "grammar"],
              prompt: "Which measure word goes with '书' (book)?",
              options: ["张", "本", "只", "杯"],
              answer: 1,
              hint: "This measure word is used for books and other bound volumes.",
              explanation: [
                "'本' (běn) is the measure word for books: '一本书' (one book).",
                "'张' is used for flat objects such as paper or tables.",
                "'只' is used for many animals and for one of a pair.",
                "'杯' is used for cups or glasses of liquid."
              ]
            },
            {
              id: "zh-3",
              difficulty: "Intermediate",
              tags: ["aspect", "grammar", "了"],
              prompt: "What does the particle '了' often mark?",
              options: [
                "A completed action or a change of state",
                "A question",
                "A plural noun",
                "A past habit"
              ],
              answer: 0,
              hint: "It is aspect, not tense: it presents an action as completed or a situation as new.",
              explanation: [
                "'了' commonly marks a completed action: '我吃了' (I have eaten).",
                "It can also signal a change of state: '下雨了' (it has started raining).",
                "It is not a past-tense marker — Mandarin does not conjugate verbs for tense.",
                "Questions use '吗' at the end or a question word; '了' does not make a sentence a question."
              ]
            }
          ],
          study: [
            {
              id: "zh-s1",
              title: "Tones & Pinyin",
              icon: "waves",
              summary: "Pinyin is a pronunciation guide; the tone mark is as important as the letters.",
              points: [
                "Four main tones plus a neutral tone: high level, rising, dipping, falling, and light.",
                "Tone marks sit over the main vowel: mā, má, mǎ, mà, ma.",
                "Third tones change before other tones; in natural speech, two third tones often become second + third.",
                "Practise tone pairs, not just single syllables, because real words combine tones."
              ]
            },
            {
              id: "zh-s2",
              title: "Measure Words",
              icon: "hash",
              summary: "Between a number and a noun, Mandarin requires a measure word.",
              points: [
                "The pattern is number/demonstrative + measure word + noun: '三本书' (three books).",
                "'个' is the generic measure word and is acceptable when you do not know the specific one.",
                "'本' is for books, '张' for flat objects, '只' for many animals, '杯' for cups of liquid.",
                "Measure words also appear after '这' and '那': '这本书' (this book)."
              ]
            },
            {
              id: "zh-s3",
              title: "Basic Word Order",
              icon: "route",
              summary: "Subject - verb - object, with time before the verb and no conjugation.",
              points: [
                "Neutral order is SVO: '我学习中文' (I study Chinese).",
                "Time phrases usually come before the verb: '我明天学习中文' (I will study Chinese tomorrow).",
                "'是' links nouns: '我是学生' (I am a student). Adjectives do not need '是'.",
                "Questions can use '吗' at the end: '你是学生吗?' (Are you a student?).",
                "Verbs do not change for person or tense; aspect particles such as '了' and '过' do the work."
              ]
            }
          ],
          mistakes: [
            "Ignoring tones and relying on context to rescue the meaning.",
            "Using '个' for every noun — understandable, but specific measure words sound far more natural.",
            "Inserting '是' before adjectives: say '我很好', not '我是很好'.",
            "Putting a time phrase after the verb instead of before it."
          ],
          tips: [
            {
              title: "Tone Pairs Daily",
              icon: "play",
              body: "Drill five tone pairs a day — first + fourth, second + third, and so on. Record yourself and compare with a native model; single tones are easy, but tone combinations are where learners drift."
            },
            {
              title: "Characters in Context",
              icon: "book-open",
              body: "Learn characters inside words, not from isolated flashcards. '学' is easier to retain in '学生' (student) and '学习' (study) because the meaning and sound have a home."
            },
            {
              title: "Record and Compare",
              icon: "quote",
              body: "Read one sentence aloud, record it, then listen to a native speaker say the same line. Focus on pitch contour rather than individual sounds; Mandarin accuracy is largely a melody problem."
            }
          ],
          videos: [
            {
              youtube: "n_Cj3aOSI1w",
              title: "Master Chinese Tones | Pronunciation Training",
              channel: "Grace Mandarin Chinese",
              takeaways: [
                "The pitch shape of each tone.",
                "Common myths about the third tone.",
                "Practice phrases for building tone accuracy."
              ]
            },
            {
              youtube: "5BNxDj_h9iQ",
              title: "Top 25 Common Measure Words in Chinese (with Examples!)",
              channel: "Grace Mandarin Chinese",
              takeaways: [
                "Why measure words are required in Chinese.",
                "The most useful measure words and the nouns they pair with.",
                "Example phrases you can reuse immediately."
              ]
            }
          ]
        },

        /* ------------------------------------------------------------------
           JAPANESE
           ------------------------------------------------------------------ */
        {
          id: "japanese",
          title: "Japanese",
          icon: "pen-line",
          accent: "violet",
          level: "Beginner",
          blurb: "Kana, particles and polite forms — start reading Japanese and stop translating word by word.",
          tags: ["Japanese", "hiragana", "katakana", "particles", "politeness", "SOV"],
          questions: [
            {
              id: "ja-1",
              difficulty: "Beginner",
              tags: ["particles", "grammar", "topic"],
              prompt: "Which particle marks the topic of a sentence?",
              options: ["は (wa)", "を (wo)", "に (ni)", "で (de)"],
              answer: 0,
              hint: "As a particle it is pronounced 'wa', even though the kana is written 'ha'.",
              explanation: [
                "'は' marks the topic: '私は学生です' (As for me, I am a student).",
                "As a particle it is pronounced 'wa'; elsewhere the same kana is read 'ha'.",
                "'を' marks the direct object, 'に' marks direction or time, and 'で' marks location or means.",
                "Topic and subject are not identical: 'は' highlights what the sentence is about, while 'が' identifies the subject."
              ]
            },
            {
              id: "ja-2",
              difficulty: "Beginner",
              tags: ["vocabulary", "greetings"],
              prompt: "What does 'ありがとう' mean?",
              options: ["Good morning", "Excuse me", "Thank you", "Goodbye"],
              answer: 2,
              hint: "It is one of the first phrases every Japanese learner picks up.",
              explanation: [
                "'ありがとう' (arigatou) means 'thank you' in casual speech.",
                "The polite version is 'ありがとうございます'.",
                "'おはよう' means good morning; 'すみません' means excuse me or sorry; 'さようなら' means goodbye.",
                "Use the polite form with strangers, teachers and anyone senior to you."
              ]
            },
            {
              id: "ja-3",
              difficulty: "Beginner",
              tags: ["verbs", "politeness", "present tense"],
              prompt: "Which is the polite present form of '食べる' (to eat)?",
              options: ["食べた", "食べない", "食べろ", "食べます"],
              answer: 3,
              hint: "Polite verbs end in -ます in the present and future.",
              explanation: [
                "'食べます' (tabemasu) is the polite present/future form: 'I eat' or 'I will eat'.",
                "'食べた' is the casual past, '食べない' the casual negative, and '食べろ' a blunt imperative.",
                "Japanese verbs do not change for person; politeness and tense are the main distinctions.",
                "The casual present is simply '食べる'."
              ]
            }
          ],
          study: [
            {
              id: "ja-s1",
              title: "Kana & Sounds",
              icon: "waves",
              summary: "Japanese is syllable-timed: each kana is one mora, and length matters.",
              points: [
                "Hiragana is used for native words and grammar; katakana for loanwords, names and emphasis.",
                "Each kana represents one mora — a beat. Long vowels and the small 'っ' add beats and change meaning.",
                "The particle 'は' is pronounced 'wa', and the object particle 'を' is pronounced 'o'.",
                "Japanese has pitch accent rather than stress; listen for the rise and fall rather than a loud syllable."
              ]
            },
            {
              id: "ja-s2",
              title: "Particles & Order",
              icon: "route",
              summary: "The verb comes last, and particles label every noun before it.",
              points: [
                "Neutral order is Subject - Object - Verb: '私はパンを食べます' (I eat bread).",
                "'は' marks the topic, 'が' the subject, 'を' the direct object.",
                "'に' marks direction, destination or time; 'で' marks where an action happens or the means used.",
                "The verb is final in a neutral sentence; moving it changes emphasis or sounds unnatural."
              ]
            },
            {
              id: "ja-s3",
              title: "Politeness",
              icon: "layers",
              summary: "Politeness is built into verb endings and vocabulary, not just tone of voice.",
              points: [
                "Polite speech uses 'です' for nouns and adjectives and '-ます' for verbs.",
                "Casual speech uses the plain verb form and is appropriate with close friends and family.",
                "'お願いします' is a versatile polite request meaning 'please' or 'I ask you'.",
                "Honorific prefixes such as 'お-' and 'ご-' raise the register of everyday words."
              ]
            }
          ],
          mistakes: [
            "Reading the topic particle 'は' as 'ha' instead of 'wa'.",
            "Dropping particles because English does not need them.",
            "Using casual forms with strangers, teachers or colleagues.",
            "Assuming Japanese words are separated by spaces; they are not."
          ],
          tips: [
            {
              title: "Read Kana Every Day",
              icon: "book-open",
              body: "Read one short line of hiragana aloud daily until recognition is instant. Do not rush into kanji: kana fluency makes every later textbook page cheaper to read."
            },
            {
              title: "Particles in Sentences",
              icon: "repeat-2",
              body: "Learn each particle through three complete sentences, not a definition. 'に' in '学校に行きます' and 'で' in '学校で勉強します' will stick better than a translation table."
            },
            {
              title: "Shadow Audio",
              icon: "play",
              body: "Play a short line, pause, and repeat it with the same rhythm and pitch. Japanese politeness and particle timing are easier to copy by ear than to assemble from rules."
            }
          ],
          videos: [
            {
              youtube: "M4AU-K5yJRw",
              title: "Level 1 Japanese - Week 8: How to Use Basic Greetings in Japanese",
              channel: "Learn Japanese with JapanesePod101.com",
              takeaways: [
                "Greetings for different times of day.",
                "Formal versus casual greeting choices.",
                "A short model dialogue to repeat."
              ]
            },
            {
              youtube: "GUymRdqBglo",
              title: "Japanese Lesson 1: XはYです, Particles, Absolute Beginner",
              channel: "Japanese Ammo with Misa",
              takeaways: [
                "How the topic particle は works.",
                "Why こんにちは is written with は.",
                "How to build a basic XはYです sentence."
              ]
            }
          ]
        },

        /* ------------------------------------------------------------------
           ARABIC
           ------------------------------------------------------------------ */
        {
          id: "arabic",
          title: "Arabic",
          icon: "notebook-pen",
          accent: "teal",
          level: "Beginner",
          blurb: "The script, the root system and nominal sentences — a reading-first start to Modern Standard Arabic.",
          tags: ["Arabic", "alphabet", "roots", "MSA", "script", "nominal sentences"],
          questions: [
            {
              id: "ar-1",
              difficulty: "Beginner",
              tags: ["script", "reading", "direction"],
              prompt: "In which direction is Arabic written?",
              options: ["Left to right", "Top to bottom", "Right to left", "Alternating by line"],
              answer: 2,
              hint: "The first letter of a word is on the right.",
              explanation: [
                "Arabic is written and read from right to left.",
                "Numbers are a notable exception: they run left to right within the text.",
                "Books open from what English readers would call the back.",
                "Letters join within words, and their shape changes depending on their position."
              ]
            },
            {
              id: "ar-2",
              difficulty: "Beginner",
              tags: ["articles", "grammar", "definiteness"],
              prompt: "What is the Arabic definite article?",
              options: ["ال (al-)", "لا (la)", "من (min)", "في (fi)"],
              answer: 0,
              hint: "It is a prefix attached to the noun, not a separate word.",
              explanation: [
                "'ال' (al-) is the definite article and attaches to the front of the noun: 'الكتاب' (the book).",
                "'لا' means 'no'; 'من' means 'from' or 'who'; 'في' means 'in'.",
                "Arabic has no indefinite article — an unmarked noun is indefinite: 'كتاب' (a book).",
                "The 'l' of 'ال' assimilates to certain 'sun letters', so 'الشمس' sounds like 'ash-shams'."
              ]
            },
            {
              id: "ar-3",
              difficulty: "Beginner",
              tags: ["roots", "vocabulary", "morphology"],
              prompt: "The root ك-ت-ب is associated with...",
              options: ["eating", "writing", "travelling", "sleeping"],
              answer: 1,
              hint: "'كتاب' means book and 'كاتب' means writer.",
              explanation: [
                "The root ك-ت-ب carries the core meaning of writing.",
                "'كتب' (kataba) means 'he wrote'; 'كتاب' (kitāb) means 'book'; 'كاتب' (kātib) means 'writer'.",
                "Arabic builds many words by placing the same root consonants into different patterns.",
                "Learning roots lets you recognise word families instead of memorizing every word separately."
              ]
            }
          ],
          study: [
            {
              id: "ar-s1",
              title: "Script & Sounds",
              icon: "quote",
              summary: "Twenty-eight letters, four positional forms and a right-to-left baseline.",
              points: [
                "Arabic has 28 letters and is written right to left; there are no capital letters.",
                "Most letters change shape depending on whether they are isolated, initial, medial or final.",
                "Short vowels are usually written as diacritics above or below the letters, and are often omitted in everyday text.",
                "'Sun letters' assimilate the 'l' of the definite article; 'moon letters' keep it pronounced."
              ]
            },
            {
              id: "ar-s2",
              title: "Roots & Patterns",
              icon: "layers",
              summary: "Most Arabic vocabulary is built from three-consonant roots fitted into patterns.",
              points: [
                "A triliteral root such as ك-ت-ب supplies the core meaning; the pattern supplies the grammar.",
                "From ك-ت-ب: 'kataba' (he wrote), 'kitāb' (book), 'kātib' (writer), 'maktab' (office or desk).",
                "Modern Standard Arabic is the formal written register; spoken dialects differ substantially.",
                "A dictionary usually lists words by root, so learning to spot roots is a reading skill."
              ]
            },
            {
              id: "ar-s3",
              title: "Nominal Sentences",
              icon: "route",
              summary: "Arabic can say 'the book new' without any word for 'is'.",
              points: [
                "A nominal sentence begins with a noun and needs no present-tense 'to be': 'الكتاب جديد' (the book is new).",
                "Adjectives follow the noun and agree in gender, number and definiteness: 'كتاب جديد' (a new book).",
                "Possession is expressed by putting two nouns together: 'كتاب الطالب' (the student's book).",
                "Questions often begin with 'هل' (hal) for yes/no, or a question word such as 'ما' (what) or 'أين' (where)."
              ]
            }
          ],
          mistakes: [
            "Reading Arabic left to right.",
            "Treating short-vowel diacritics as optional letters; they are markings, and adult texts often omit them.",
            "Mixing dialect forms into formal writing without knowing the register.",
            "Putting adjectives before nouns; Arabic adjectives normally follow the noun."
          ],
          tips: [
            {
              title: "Learn Letter Forms",
              icon: "pencil-line",
              body: "Write each letter in all four positions — isolated, initial, medial, final — on one line. Copying the shapes by hand is faster than recognising them only on a screen."
            },
            {
              title: "Build Root Families",
              icon: "repeat-2",
              body: "Keep a page per root. Add every word you meet that shares it, with the pattern marked. After ten roots, new vocabulary starts to look familiar instead of random."
            },
            {
              title: "Listen to MSA Daily",
              icon: "play",
              body: "Use short news clips or learner dialogues in Modern Standard Arabic. Even five minutes a day trains your ear for the formal register you will read in books and exams."
            }
          ],
          videos: [
            {
              youtube: "QSLtNmRflBU",
              title: "Learn Arabic - Arabic Alphabet Made Easy - Alef and Nun",
              channel: "Learn Arabic with ArabicPod101.com",
              takeaways: [
                "How to write the letters alef and nun.",
                "How letter shapes change by position.",
                "A first written word using the new letters."
              ]
            },
            {
              youtube: "LdqGMcQuf0Y",
              title: "49 Basic Arabic Phrases for ALL Situations to Start as a Beginner",
              channel: "Learn Arabic with ArabicPod101.com",
              takeaways: [
                "A broad set of survival phrases.",
                "Everyday vocabulary for introductions and directions.",
                "Listening practice with native pronunciation."
              ]
            }
          ]
        },

        /* ------------------------------------------------------------------
           ENGLISH LANGUAGE
           ------------------------------------------------------------------ */
        {
          id: "english-language",
          title: "English Language",
          icon: "file-text",
          accent: "sky",
          level: "Intermediate",
          blurb: "Sentence structure, register and punctuation — the editing habits that make written English precise.",
          tags: ["English", "grammar", "syntax", "register", "punctuation", "editing"],
          questions: [
            {
              id: "engl-1",
              difficulty: "Intermediate",
              tags: ["subjunctive", "conditionals", "grammar"],
              prompt: "Which sentence uses the subjunctive correctly?",
              options: [
                "If I was you, I would apologise.",
                "If I am you, I would apologise.",
                "If I were you, I would apologise.",
                "If I be you, I would apologise."
              ],
              answer: 2,
              hint: "In a hypothetical condition that is contrary to fact, formal English uses 'were' for all persons.",
              explanation: [
                "'If I were you' is the standard subjunctive form for an unreal or hypothetical condition.",
                "'If I was you' is common in informal speech but is avoided in formal writing.",
                "The main clause uses 'would' + base verb: 'I would apologise'.",
                "The subjunctive also appears in 'I suggest that he be informed' and 'It is essential that she attend'."
              ]
            },
            {
              id: "engl-2",
              difficulty: "Intermediate",
              tags: ["passive voice", "voice", "syntax"],
              prompt: "'The cake was eaten by Sam' is an example of...",
              options: ["The active voice", "The passive voice", "An imperative", "An interrogative"],
              answer: 1,
              hint: "The subject receives the action rather than performing it.",
              explanation: [
                "In the passive voice, the subject is acted upon: 'The cake was eaten'.",
                "The active version is 'Sam ate the cake', where Sam performs the action.",
                "Passive forms use a form of 'be' plus a past participle.",
                "Use the passive when the actor is unknown, unimportant or deliberately backgrounded."
              ]
            },
            {
              id: "engl-3",
              difficulty: "Intermediate",
              tags: ["register", "politeness", "writing"],
              prompt: "Which is the most formal request?",
              options: [
                "Send the report.",
                "Can you send it?",
                "Gimme the report.",
                "Could you possibly send the report?"
              ],
              answer: 3,
              hint: "Hedging and modal distance raise the register.",
              explanation: [
                "'Could you possibly send the report?' uses a past-modal form and a hedge, making it the most formal.",
                "'Can you send it?' is neutral and conversational.",
                "'Send the report' is a direct imperative and can sound abrupt.",
                "'Gimme the report' is highly informal and inappropriate in professional writing."
              ]
            }
          ],
          study: [
            {
              id: "engl-s1",
              title: "Sentence Structure",
              icon: "route",
              summary: "Every sentence needs a subject and a finite verb; everything else is decoration.",
              points: [
                "A finite clause contains a subject and a verb marked for tense: 'She writes.'",
                "Coordination joins equal clauses with 'and', 'but', 'or'; subordination makes one clause depend on another.",
                "The active voice is usually clearer: 'The team wrote the report' beats 'The report was written by the team'.",
                "A fragment is a group of words punctuated as a sentence but missing a subject, a finite verb or a complete thought."
              ]
            },
            {
              id: "engl-s2",
              title: "Register & Tone",
              icon: "layers",
              summary: "The same idea can be polite, neutral or blunt — register is a deliberate choice.",
              points: [
                "Formal writing avoids contractions, slang and vague fillers; informal writing can use all three.",
                "Modal verbs soften requests and claims: 'could', 'might', 'would'.",
                "Hedging phrases such as 'it appears that' and 'to some extent' create distance from a claim.",
                "Match register to audience: an email to a client is not a message to a friend."
              ]
            },
            {
              id: "engl-s3",
              title: "Punctuation & Clarity",
              icon: "pencil-line",
              summary: "Punctuation is structure made visible; most errors are sentence-boundary errors.",
              points: [
                "A comma splice joins two independent clauses with only a comma; use a full stop, semicolon or conjunction.",
                "A semicolon links closely related independent clauses; a colon introduces an explanation or list.",
                "Apostrophes mark possession ('the student's book') or contraction ('don't'), not plurals.",
                "Keep parallel items in the same grammatical form: 'reading, writing and editing', not 'reading, to write and edits'."
              ]
            }
          ],
          mistakes: [
            "Joining two complete sentences with only a comma (a comma splice).",
            "Writing 'could of' instead of 'could have'.",
            "Shifting tense without a reason: 'She walks in and sat down'.",
            "Overusing the passive voice until the actor disappears from the sentence."
          ],
          tips: [
            {
              title: "Read It Aloud",
              icon: "quote",
              body: "Read your draft aloud and mark every place you run out of breath or stumble. Those marks usually correspond to missing punctuation or an overlong sentence."
            },
            {
              title: "Combine, Then Cut",
              icon: "split",
              body: "Edit in two passes: first combine choppy sentences into clear clauses, then cut every word that does not change the meaning. The result is tighter without sounding clipped."
            },
            {
              title: "Collect Real Sentences",
              icon: "book-open",
              body: "Copy one well-built sentence a day from an article or essay you admire, then label its main clause, subordinate clause and punctuation. Imitating structure is faster than memorizing rules."
            }
          ],
          videos: [
            {
              youtube: "aDKa9MinM2I",
              title: "English Sentence Structure and Word Order in English",
              channel: "English Fluency Journey",
              takeaways: [
                "How English orders subject, verb and object.",
                "Where adverbs and time phrases fit.",
                "Common word-order mistakes and how to fix them."
              ]
            },
            {
              youtube: "nI5zaB6QL-o",
              title: "Present and past passives - 6 Minute Grammar",
              channel: "BBC Learning English",
              takeaways: [
                "How to form present and past passive sentences.",
                "When the passive is clearer than the active.",
                "A short quiz to check the forms."
              ]
            }
          ]
        }
      ]
    }
  ]
};

/* Expose the data for app.js and for quick console inspection. */
window.STUDY_DATA = STUDY_DATA;
