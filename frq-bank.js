/* ============================================================================
   QUESTIONAIRE — frq-bank.js
   ----------------------------------------------------------------------------
   Free-response prompts with a three-criterion rubric, descriptors for every
   score and a model answer. Subject ids must already exist in the catalogue.

   Shape:
     id, title, prompt, criteria: [{ id, label, max, descriptors: {0,1,2} }],
     model: ["paragraph", ...], guidance: "one line on what separates the bands"
   ========================================================================== */

window.QUESTIONAIRE_FRQ_BANK = {
  "calculus": [
    {
      id: "calc-frq-1",
      title: "Justify a derivative with the chain rule",
      prompt: "A classmate writes: “The derivative of $f(x) = (3x^2 + 1)^4$ is $4(3x^2 + 1)^3$.” Explain what is missing, give the correct derivative, and state the general chain-rule rule behind the correction. Then use your result to find the slope of the tangent line at $x = 1$.",
      criteria: [
        {
          id: "identify",
          label: "Identifies the missing inner derivative",
          max: 2,
          descriptors: {
            0: "Says only that the answer is wrong.",
            1: "Names the chain rule but does not point to the inner derivative.",
            2: "States that the derivative of the inside, $6x$, is missing and explains why."
          }
        },
        {
          id: "compute",
          label: "Correct derivative and tangent slope",
          max: 2,
          descriptors: {
            0: "No correct expression for $f'(x)$.",
            1: "Correct derivative but no slope, or the slope is evaluated incorrectly.",
            2: "Gives $f'(x) = 24x(3x^2 + 1)^3$ and evaluates $f'(1) = 768$."
          }
        },
        {
          id: "generalise",
          label: "States the general rule precisely",
          max: 2,
          descriptors: {
            0: "No general rule.",
            1: "States “multiply by the derivative of the inside” without defining the composition.",
            2: "Writes $\\frac{d}{dx}f(g(x)) = f'(g(x))g'(x)$ and maps it onto this example."
          }
        }
      ],
      model: [
        "The answer differentiates the outside function but forgets to multiply by the derivative of the inside. For a composition $f(g(x))$, the chain rule says $\\frac{d}{dx}f(g(x)) = f'(g(x))\\,g'(x)$.",
        "Here $g(x) = 3x^2 + 1$, so $g'(x) = 6x$. The outer derivative is $4(3x^2 + 1)^3$, giving $f'(x) = 4(3x^2 + 1)^3 \\cdot 6x = 24x(3x^2 + 1)^3$.",
        "At $x = 1$: $f'(1) = 24(1)(3 + 1)^3 = 24 \\cdot 64 = 768$, so the tangent line has slope $768$."
      ],
      guidance: "The middle band is the most common: a correct rule quoted but not applied to the inner function. Full marks require naming $g'(x)$ explicitly."
    }
  ],

  "biology": [
    {
      id: "bio-frq-1",
      title: "Explain semiconservative replication",
      prompt: "Describe how DNA replication produces two daughter molecules, and explain precisely why the process is called semiconservative. Include the roles of helicase, complementary base pairing and DNA polymerase in your answer.",
      criteria: [
        {
          id: "mechanism",
          label: "Unwinding and templating",
          max: 2,
          descriptors: {
            0: "Confuses replication with transcription.",
            1: "Mentions unwinding but not that each strand is a template.",
            2: "Explains helicase unwinding the helix and each parental strand serving as a template."
          }
        },
        {
          id: "pairing",
          label: "Complementary base pairing and polymerase",
          max: 2,
          descriptors: {
            0: "No mention of base pairing.",
            1: "States A–T and G–C pairing but not the polymerase role.",
            2: "Explains DNA polymerase adding nucleotides matched to the template by A–T and G–C pairing."
          }
        },
        {
          id: "semiconservative",
          label: "Meaning of semiconservative",
          max: 2,
          descriptors: {
            0: "Says both strands are new, or both are old.",
            1: "Says “half is conserved” without identifying the strands.",
            2: "States each daughter molecule contains one parental strand and one newly synthesised strand, and links this to the observed banding evidence."
          }
        }
      ],
      model: [
        "Helicase separates the two strands of the double helix, producing two single-stranded templates. Each template is read in the 3′ to 5′ direction while DNA polymerase adds nucleotides to a growing strand.",
        "Polymerase can only add a nucleotide that pairs with the template base — adenine with thymine, guanine with cytosine — so the new strand is complementary rather than identical to its template.",
        "Each daughter double helix therefore keeps one parental strand and gains one new strand. That is what semiconservative means: half of each original molecule is conserved, which the Meselson–Stahl density experiment confirmed."
      ],
      guidance: "The word “semiconservative” must be defined by the fate of the strands, not by a percentage of the molecule."
    }
  ],

  "chemistry": [
    {
      id: "chem-frq-1",
      title: "Find Ka from a measured pH",
      prompt: "A $0.10\\,\\text{M}$ solution of a weak monoprotic acid has pH $3.00$ at 25 °C. Calculate $K_a$ for the acid, state any approximation you use, and explain whether the approximation is justified here.",
      criteria: [
        {
          id: "hydrogen",
          label: "Convert pH to hydrogen-ion concentration",
          max: 2,
          descriptors: {
            0: "Uses pH directly as a concentration.",
            1: "Writes the conversion but slips on the power of ten.",
            2: "Gives $[\\text{H}^+] = 10^{-3.00} = 1.0 \\times 10^{-3}\\,\\text{M}$."
          }
        },
        {
          id: "ka",
          label: "Set up and evaluate Ka",
          max: 2,
          descriptors: {
            0: "No equilibrium expression.",
            1: "Correct expression but arithmetic error.",
            2: "Writes $K_a = \\frac{[\\text{H}^+][\\text{A}^-]}{[\\text{HA}]}$ and computes $1.0 \\times 10^{-5}$."
          }
        },
        {
          id: "assumption",
          label: "Justify the approximation",
          max: 2,
          descriptors: {
            0: "Makes no assumption explicit.",
            1: "States the approximation without testing it.",
            2: "Assumes $[\\text{HA}] \\approx 0.10\\,\\text{M}$ because ionisation is about 1%, then checks that 1% is small enough."
          }
        }
      ],
      model: [
        "From the pH, $[\\text{H}^+] = 10^{-\\text{pH}} = 10^{-3.00} = 1.0 \\times 10^{-3}\\,\\text{M}$. For a monoprotic acid, $[\\text{A}^-]$ equals $[\\text{H}^+]$ at equilibrium.",
        "The equilibrium expression is $K_a = \\frac{[\\text{H}^+][\\text{A}^-]}{[\\text{HA}]}$. Approximating $[\\text{HA}]$ by the initial $0.10\\,\\text{M}$ gives $K_a \\approx \\frac{(1.0 \\times 10^{-3})^2}{0.10} = 1.0 \\times 10^{-5}$.",
        "The approximation is justified: ionisation is $\\frac{1.0 \\times 10^{-3}}{0.10} = 1\\%$, which is below the usual 5% threshold, so the change in $[\\text{HA}]$ is negligible."
      ],
      guidance: "The calculation is only half the marks; the third criterion rewards checking the approximation rather than assuming it."
    }
  ]
};
