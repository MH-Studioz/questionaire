/* ============================================================================
   QUESTIONAIRE — ap-courses.js
   ----------------------------------------------------------------------------
   The 42 AP courses listed by College Board for the 2026-27 school year.
   Each course gets a compact, exam-focused pack: two questions, two study
   cards and two tips. AP Networking is not included because it launches in
   Fall 2027; it is a pilot in 2026-27, not a current catalog course.

   This file appends the AP category to window.STUDY_DATA, so it must load
   after database.js and before app.js.
   ========================================================================== */

(function () {
  "use strict";

  const q = function (prompt, options, hint, explanation) {
    return { prompt: prompt, options: options, answer: 0, hint: hint, explanation: explanation };
  };

  const COURSES = [
    /* ----------------------------------------------------------------------
       ARTS
       ---------------------------------------------------------------------- */
    {
      id: "ap-2d-art-design",
      title: "AP 2-D Art and Design",
      group: "Arts",
      track: "arts",
      icon: "shapes",
      accent: "rose",
      blurb: "Build a portfolio around sustained inquiry, material experimentation and thoughtful revision in two dimensions.",
      tags: ["portfolio", "sustained investigation", "composition", "revision", "documentation"],
      format: "Portfolio assessment · 5 Selected Works + 10 Sustained Investigation works",
      units: ["Selected Works: five works showing synthesis", "Sustained Investigation: ten works exploring one inquiry", "Materials, processes and visual evidence", "Revision, reflection and written commentary"],
      questions: [
        q("What is the main purpose of the Sustained Investigation section?", ["To show a body of work exploring one question through repeated practice and revision", "To copy five works by established artists", "To prove that every work uses the same medium", "To present only finished, exhibition-ready pieces"], "The word 'sustained' is the clue: the work should develop over time.", ["The Sustained Investigation is a sustained body of work, not a random portfolio.", "It should show an inquiry question, experimentation, and evidence of revision.", "Judges look for growth and decision-making, not technical perfection alone."]),
        q("How many works belong in the Sustained Investigation section of an AP Art and Design portfolio?", ["10", "5", "15", "20"], "The total portfolio is 15 works, split between Selected Works and Sustained Investigation.", ["AP Art and Design portfolios contain 15 works in total.", "Five of those are Selected Works.", "The remaining ten form the Sustained Investigation."])
      ]
    },
    {
      id: "ap-3d-art-design",
      title: "AP 3-D Art and Design",
      group: "Arts",
      track: "arts",
      icon: "boxes",
      accent: "rose",
      blurb: "Create three-dimensional work that shows spatial thinking, craft and a sustained investigation of form.",
      tags: ["3-D design", "volume", "materials", "portfolio", "documentation"],
      format: "Portfolio assessment · 5 Selected Works + 10 Sustained Investigation works",
      units: ["Selected Works: five works showing synthesis", "Sustained Investigation: ten works exploring one inquiry", "Form, mass, scale and site", "Documentation from multiple viewpoints"],
      questions: [
        q("Which concern is most specific to three-dimensional art?", ["How mass, volume and space are organised", "How pigment absorbs light", "How a single viewpoint frames a subject", "How a poem uses line breaks"], "Think about what a sculpture has that a drawing does not.", ["Three-dimensional work occupies real space, so mass and volume are central.", "Viewers can move around it, which makes multiple viewpoints part of the work.", "Surface and colour still matter, but they are not the defining spatial concern."]),
        q("Why should 3-D portfolio documentation include more than one view?", ["Multiple views communicate form and scale that a single photograph cannot", "The rubric requires exactly four photographs per work", "Judges only look at the back of a work", "It proves the work was made digitally"], "Imagine judging a sculpture from one flat image.", ["A single photograph can hide depth, thickness and negative space.", "Several views show how the work changes as the viewer moves.", "Scale cues and detail shots help judges understand the object and its making."])
      ]
    },
    {
      id: "ap-drawing",
      title: "AP Drawing",
      group: "Arts",
      track: "arts",
      icon: "pen-line",
      accent: "rose",
      blurb: "Develop drawing as a way of thinking — mark, value, composition and a sustained visual inquiry.",
      tags: ["drawing", "mark-making", "value", "composition", "portfolio"],
      format: "Portfolio assessment · 5 Selected Works + 10 Sustained Investigation works",
      units: ["Selected Works: five works showing synthesis", "Sustained Investigation: ten works exploring one inquiry", "Line, value, texture and composition", "Process documentation and reflection"],
      questions: [
        q("What does 'mark-making' describe in drawing?", ["The range of marks an artist uses to build form, texture and emphasis", "The price of the paper", "The number of works in a portfolio", "The title written under a work"], "It is about the physical evidence of the drawing tool.", ["Marks can be broad or fine, dry or wet, blended or abrupt.", "Their size, direction and density create texture, value and focus.", "A sustained investigation often develops by changing how marks are made."]),
        q("A strong Selected Works section should primarily show...", ["synthesis of materials, processes and ideas", "the earliest sketches only", "works copied from photographs", "a single medium used identically every time"], "Selected Works are the five strongest examples of what you can do.", ["Selected Works demonstrate your best synthesis of technique and concept.", "Variety is useful when it supports the through-line of the portfolio.", "The section is curated, not a chronological sketchbook dump."])
      ]
    },
    {
      id: "ap-art-history",
      title: "AP Art History",
      group: "Arts",
      track: "arts",
      icon: "landmark",
      accent: "rose",
      blurb: "Read works of art across cultures and periods, connecting form, context, function and meaning.",
      tags: ["art history", "context", "form", "function", "comparison"],
      format: "3 hours · 80 multiple-choice questions + 6 written responses",
      units: ["Global prehistory and the ancient Mediterranean", "Early Europe and the colonial Americas", "Indigenous Americas, Africa and Asia", "The Pacific and global contemporary art"],
      questions: [
        q("Which work is a famous marble sculpture of the Italian Renaissance?", ["Michelangelo's David", "Rodin's The Thinker", "Munch's The Scream", "Picasso's Guernica"], "The artist also painted the Sistine Chapel ceiling.", ["Michelangelo carved David in marble between 1501 and 1504.", "The work exemplifies Renaissance interest in classical proportion and the human body.", "The other works are modern or late nineteenth-century, not Italian Renaissance."]),
        q("A contextual analysis of an artwork should explain...", ["how its function, patron and historical setting shape its meaning", "only the names of its colours", "whether the artist was famous", "the price it would fetch today"], "Context is about the world around the object, not just its appearance.", ["Formal analysis describes what you see; contextual analysis explains why it was made.", "Patronage, religion, politics and viewing space all affect meaning.", "The strongest responses connect specific visual evidence to that context."])
      ]
    },
    {
      id: "ap-music-theory",
      title: "AP Music Theory",
      group: "Arts",
      track: "arts",
      icon: "waves",
      accent: "rose",
      blurb: "Hear, write and analyse music through intervals, harmony, voice leading, form and sight-singing.",
      tags: ["intervals", "harmony", "voice leading", "sight-singing", "form"],
      format: "2 hours 40 minutes · 75 multiple-choice questions + 7 written and ear-training tasks",
      units: ["Fundamentals and musicianship", "Harmony and voice leading", "Form and analysis", "Sight-singing and composition"],
      questions: [
        q("What note is a perfect fifth above C?", ["G", "F", "A", "E"], "Count five letter names from C, then check the semitone distance.", ["A perfect fifth spans seven semitones.", "Counting C-D-E-F-G gives the fifth letter, G.", "C to G is seven semitones, so it is a perfect fifth."]),
        q("In C major, which Roman numeral represents the dominant chord?", ["V", "I", "IV", "vi"], "The dominant is built on the fifth scale degree.", ["C major's scale degrees are C, D, E, F, G, A, B.", "The fifth degree is G, so the dominant chord is built on G.", "In Roman numerals, that chord is V."])
      ]
    },

    /* ----------------------------------------------------------------------
       ENGLISH
       ---------------------------------------------------------------------- */
    {
      id: "ap-english-language",
      title: "AP English Language and Composition",
      group: "English",
      track: "english",
      icon: "file-text",
      accent: "amber",
      blurb: "Analyse how writers make choices for audiences and purposes, then build your own evidence-based arguments.",
      tags: ["rhetoric", "argument", "synthesis", "style", "evidence"],
      format: "3 hours 15 minutes · 45 multiple-choice questions + 3 essays",
      units: ["The rhetorical situation", "Claims, evidence and commentary", "Style, syntax and tone", "Argument, synthesis and timed essays"],
      questions: [
        q("Which set best describes the rhetorical situation?", ["Speaker, audience, purpose, context and message", "Plot, setting, rhyme and meter", "Thesis, evidence, citation and bibliography", "Subject, predicate, object and modifier"], "It is the set of conditions that shapes any act of communication.", ["The rhetorical situation frames why and how a text persuades.", "A speaker addresses an audience for a purpose in a context.", "The message is shaped by all of those pressures, not chosen in isolation."]),
        q("What is a concession in an argument?", ["Acknowledging a valid point from the opposing side before answering it", "Repeating the thesis in the conclusion", "Removing all evidence that weakens the claim", "Changing the topic to avoid disagreement"], "Strong arguments show they have considered the other side.", ["A concession grants something to the opposition.", "It builds credibility because the writer appears fair and informed.", "A strong response then qualifies or rebuts that point rather than ignoring it."])
      ]
    },
    {
      id: "ap-english-literature",
      title: "AP English Literature and Composition",
      group: "English",
      track: "english",
      icon: "book-open",
      accent: "amber",
      blurb: "Close-read poetry, prose and drama, then write arguments about how literary choices create meaning.",
      tags: ["close reading", "poetry", "prose", "drama", "literary argument"],
      format: "3 hours · 55 multiple-choice questions + 3 essays",
      units: ["Character, setting and structure", "Figurative language and poetic form", "Comparison and literary argument", "Open-response essay planning"],
      questions: [
        q("What is free indirect discourse?", ["Third-person narration that blends a character's thoughts and voice into the narrator's report", "A poem with no rhyme or meter", "Dialogue printed without quotation marks", "A play performed without a set"], "The narration sounds like the character without becoming first person.", ["Free indirect discourse keeps third-person grammar but adopts a character's idiom or judgement.", "It lets readers move between external narration and inner perspective.", "Austen and Flaubert are common examples."]),
        q("The best poetry essay should...", ["make a claim about how specific poetic choices create meaning", "paraphrase the poem line by line", "list every metaphor without connecting them", "summarise the poet's biography"], "Analysis answers 'how' and 'why', not just 'what happens'.", ["A literary argument needs a defensible interpretation.", "Evidence should be quoted briefly and explained in relation to the claim.", "Paraphrase describes content; analysis explains the effect of technique."])
      ]
    },

    /* ----------------------------------------------------------------------
       HISTORY AND SOCIAL SCIENCES
       ---------------------------------------------------------------------- */
    {
      id: "ap-african-american-studies",
      title: "AP African American Studies",
      group: "History & Social Sciences",
      track: "history",
      icon: "landmark",
      accent: "orange",
      blurb: "Study African American history, culture and politics from early diasporas to the present.",
      tags: ["African diaspora", "slavery", "civil rights", "culture", "historiography"],
      format: "3 hours · 60 multiple-choice questions + 4 short-answer responses",
      units: ["Origins and early diasporas", "Slavery and freedom", "Reconstruction to civil rights", "Contemporary movements and culture"],
      questions: [
        q("What was the Great Migration?", ["The movement of millions of Black Americans from the rural South to Northern and Western cities", "The forced removal of Native nations from the Southeast", "The migration of Europeans to the Americas", "The postwar migration to the suburbs"], "It happened mainly across the twentieth century.", ["The Great Migration reshaped Black life and American cities.", "Push factors included racial violence and limited opportunity in the South.", "Pull factors included industrial jobs and greater political freedom, though racism persisted."]),
        q("W. E. B. Du Bois's concept of 'double consciousness' describes...", ["the experience of measuring oneself through the eyes of a hostile society", "the division between state and federal power", "the conflict between science and religion", "the separation of church and state"], "It is about seeing yourself both as you are and as others see you.", ["Du Bois introduced the idea in The Souls of Black Folk.", "It names the psychological tension created by racism and excluded citizenship.", "The concept connects individual identity to structural history."])
      ]
    },
    {
      id: "ap-comparative-government",
      title: "AP Comparative Government and Politics",
      group: "History & Social Sciences",
      track: "history",
      icon: "scale",
      accent: "orange",
      blurb: "Compare six political systems — China, Iran, Mexico, Nigeria, Russia and the UK — using shared concepts.",
      tags: ["comparative politics", "regimes", "institutions", "policy", "sovereignty"],
      format: "2 hours 30 minutes · 55 multiple-choice questions + 4 free-response questions",
      units: ["Political systems and regimes", "Executives and legislatures", "Judiciaries and civil society", "Public policy in six countries"],
      questions: [
        q("Which AP Comparative Government country is best described as a theocracy?", ["Iran", "Mexico", "Nigeria", "The United Kingdom"], "Religious authority plays a formal constitutional role.", ["Iran combines elected institutions with clerical oversight.", "The Supreme Leader holds ultimate authority and religious qualifications shape eligibility.", "The other three are not formally theocratic systems."]),
        q("Corporatist interest-group systems typically...", ["incorporate state-recognised groups into policymaking", "ban all organised groups", "rely only on decentralized grassroots movements", "separate parties completely from the state"], "Think about institutionalised access rather than pluralist competition.", ["Corporatism channels interest representation through recognised bodies.", "Those bodies may receive legal privileges in exchange for cooperation.", "This differs from pluralist systems with many competing groups."])
      ]
    },
    {
      id: "ap-european-history",
      title: "AP European History",
      group: "History & Social Sciences",
      track: "history",
      icon: "scroll-text",
      accent: "orange",
      blurb: "Trace European politics, culture and society from the Renaissance through the late twentieth century.",
      tags: ["Renaissance", "Reformation", "revolution", "industrialization", "world wars"],
      format: "3 hours 15 minutes · 55 multiple-choice questions + SAQ, DBQ and LEQ",
      units: ["Renaissance and Reformation", "Absolutism and Enlightenment", "Revolution and industrialization", "World wars and postwar Europe"],
      questions: [
        q("The Peace of Westphalia (1648) is associated with...", ["ending the Thirty Years' War and strengthening the sovereign state system", "starting the French Revolution", "creating the European Union", "ending the Cold War"], "It reorganised European politics after a devastating religious war.", ["The treaties ended the Thirty Years' War in the Holy Roman Empire.", "They recognised territorial sovereignty and reduced papal authority in politics.", "The settlement is often cited as a foundation of the modern state system."]),
        q("Which combination best explains Britain's early industrialization?", ["Coal, capital, colonial markets and agricultural productivity", "A lack of cities and limited trade", "State ownership of all factories", "The absence of a legal system"], "Industrialization needed energy, money, markets and food surplus.", ["Coal provided cheap energy for steam power.", "Capital from trade and empire financed machinery and infrastructure.", "Agricultural improvements freed labour and supported growing cities."])
      ]
    },
    {
      id: "ap-human-geography",
      title: "AP Human Geography",
      group: "History & Social Sciences",
      track: "history",
      icon: "map",
      accent: "orange",
      blurb: "Explain how people, culture, agriculture, cities and economies shape the surface of the Earth.",
      tags: ["population", "migration", "culture", "agriculture", "urbanization"],
      format: "2 hours 15 minutes · 60 multiple-choice questions + 3 free-response questions",
      units: ["Thinking geographically", "Population and migration", "Culture, politics and agriculture", "Urbanization and economic development"],
      questions: [
        q("The von Thünen model explains agricultural land use mainly through...", ["distance to market and the perishability of products", "the number of languages spoken in a region", "the shape of political borders", "average annual rainfall alone"], "Transport cost is the key variable.", ["Farmers choose products based on how far they are from market.", "Perishable goods such as dairy are located closer to the market.", "The model predicts rings of land use around a central market."]),
        q("Which is a push factor in migration?", ["A drought that destroys local crops", "A higher-paying job in another city", "A university with a strong programme", "A milder climate"], "Push factors drive people away from a place.", ["Push factors make the origin less attractive or livable.", "Drought, famine and conflict are classic examples.", "Jobs, schools and climate amenities are pull factors."])
      ]
    },
    {
      id: "ap-macroeconomics",
      title: "AP Macroeconomics",
      group: "History & Social Sciences",
      track: "history",
      icon: "trending-up",
      accent: "orange",
      blurb: "Model whole economies: output, inflation, unemployment, money and stabilization policy.",
      tags: ["GDP", "inflation", "unemployment", "monetary policy", "fiscal policy"],
      format: "2 hours 10 minutes · 60 multiple-choice questions + 3 free-response questions",
      units: ["Basic economic concepts", "Economic indicators and the business cycle", "National income and price determination", "Financial sector and stabilization"],
      questions: [
        q("Which action is expansionary monetary policy?", ["The central bank buys government bonds", "The government raises taxes", "The central bank raises the reserve requirement", "The government cuts spending"], "Expansionary policy increases the money supply and lowers interest rates.", ["Buying bonds injects reserves into the banking system.", "More reserves can support lower interest rates and more lending.", "Tax increases and spending cuts are contractionary fiscal policy."]),
        q("Using the expenditure approach, GDP equals...", ["C + I + G + (X - M)", "C + I + G + (M - X)", "C + T + G + X", "I + G + T - M"], "Consumption, investment, government spending, and net exports.", ["C is household consumption and I is investment.", "G is government purchases, not transfers.", "Net exports are exports minus imports, so X - M."])
      ]
    },
    {
      id: "ap-microeconomics",
      title: "AP Microeconomics",
      group: "History & Social Sciences",
      track: "history",
      icon: "coins",
      accent: "orange",
      blurb: "Study choices by households and firms: supply, demand, costs, market structure and market failure.",
      tags: ["supply and demand", "elasticity", "costs", "market structure", "market failure"],
      format: "2 hours 10 minutes · 60 multiple-choice questions + 3 free-response questions",
      units: ["Basic concepts and supply/demand", "Production, cost and perfect competition", "Imperfect competition", "Factor markets and market failure"],
      questions: [
        q("A binding price ceiling set below equilibrium causes...", ["a shortage because quantity demanded exceeds quantity supplied", "a surplus because supply exceeds demand", "no change because price controls are neutral", "an increase in equilibrium quantity"], "At a lower price, buyers want more and sellers offer less.", ["A price ceiling is a legal maximum price.", "Below equilibrium, the quantity demanded rises and quantity supplied falls.", "The gap between them is a shortage."]),
        q("Demand is elastic when...", ["quantity demanded responds strongly to a change in price", "quantity demanded does not change at all", "supply is perfectly vertical", "price equals marginal cost"], "Elasticity measures responsiveness.", ["Elastic demand means a small price change produces a large quantity change.", "Elasticity is often higher when close substitutes exist.", "Total revenue falls when price rises if demand is elastic."])
      ]
    },
    {
      id: "ap-psychology",
      title: "AP Psychology",
      group: "History & Social Sciences",
      track: "history",
      icon: "brain",
      accent: "orange",
      blurb: "Explain behaviour and mental processes through biology, learning, development, personality and social context.",
      tags: ["learning", "memory", "development", "personality", "research methods"],
      format: "2 hours · 100 multiple-choice questions + 2 free-response questions",
      units: ["Biological bases", "Cognition, memory and learning", "Development and personality", "Clinical, social and research methods"],
      questions: [
        q("In classical conditioning, what is the neutral stimulus called after it reliably predicts the unconditioned stimulus?", ["The conditioned stimulus", "The unconditioned response", "The operant response", "The negative reinforcer"], "It starts neutral and acquires the power to trigger a response.", ["A neutral stimulus is paired repeatedly with an unconditioned stimulus.", "After learning, it becomes the conditioned stimulus.", "The learned response to it is the conditioned response."]),
        q("A slot machine paying out after an unpredictable number of pulls is reinforced on which schedule?", ["Variable ratio", "Fixed interval", "Fixed ratio", "Variable interval"], "The number of responses varies, and the reinforcement is based on responses.", ["Ratio schedules depend on the number of responses.", "Variable means the required number changes unpredictably.", "Variable-ratio schedules produce persistent, high-rate behaviour."])
      ]
    },
    {
      id: "ap-us-government",
      title: "AP United States Government and Politics",
      group: "History & Social Sciences",
      track: "history",
      icon: "landmark",
      accent: "orange",
      blurb: "Understand the Constitution, institutions, civil liberties and the way Americans participate in politics.",
      tags: ["Constitution", "federalism", "branches", "civil rights", "elections"],
      format: "3 hours · 55 multiple-choice questions + 4 free-response questions",
      units: ["Foundations and Constitution", "Branches and federalism", "Civil liberties and rights", "Political participation and elections"],
      questions: [
        q("Which clause has been used to apply most of the Bill of Rights to the states?", ["The Due Process Clause of the Fourteenth Amendment", "The Commerce Clause", "The Necessary and Proper Clause", "The Full Faith and Credit Clause"], "Incorporation runs through the Fourteenth Amendment.", ["The Supreme Court has used selective incorporation.", "It applies fundamental protections against state governments.", "The vehicle is the Fourteenth Amendment's Due Process Clause."]),
        q("Gerrymandering is best defined as...", ["drawing district boundaries to advantage a party or group", "requiring voters to show identification", "limiting the number of terms a legislator may serve", "counting electoral votes in Congress"], "It is about the shape and composition of districts.", ["State legislatures redraw districts after the census.", "The line-drawing can pack or crack opposing voters.", "Courts have struggled with how to police partisan and racial gerrymanders."])
      ]
    },
    {
      id: "ap-us-history",
      title: "AP United States History",
      group: "History & Social Sciences",
      track: "history",
      icon: "history",
      accent: "orange",
      blurb: "Analyse American history from encounter and colonization through the modern United States.",
      tags: ["Reconstruction", "industrialization", "reform", "Cold War", "civil rights"],
      format: "3 hours 15 minutes · 55 multiple-choice questions + SAQ, DBQ and LEQ",
      units: ["Colonial and revolutionary era", "Civil War and Reconstruction", "Industrialization and reform", "Modern America and the Cold War"],
      questions: [
        q("The Fourteenth Amendment (1868) established...", ["citizenship, due process and equal protection against state action", "the direct election of senators", "women's suffrage", "the abolition of slavery in all states"], "It is the Reconstruction amendment most used in modern civil-rights cases.", ["The amendment defines national and state citizenship.", "It guarantees due process and equal protection.", "It has been central to incorporation and equality litigation."]),
        q("Which factor most directly contributed to U.S. entry into the Spanish-American War?", ["U.S. sympathy for Cuban independence and the sinking of the USS Maine", "The attack on Pearl Harbor", "The Zimmermann Telegram", "The Gulf of Tonkin incident"], "It happened in 1898.", ["Cuban revolutionaries fought Spanish rule, and U.S. newspapers covered the conflict intensely.", "The USS Maine exploded in Havana harbour in 1898.", "Pressure from the public and political leaders pushed the United States into war."])
      ]
    },
    {
      id: "ap-world-history",
      title: "AP World History: Modern",
      group: "History & Social Sciences",
      track: "history",
      icon: "map",
      accent: "orange",
      blurb: "Connect global networks, empires, revolutions and conflicts from 1200 to the present.",
      tags: ["trade networks", "empires", "revolutions", "decolonization", "globalization"],
      format: "3 hours 15 minutes · 55 multiple-choice questions + SAQ, DBQ and LEQ",
      units: ["1200-1450 networks", "1450-1750 exploration and empires", "1750-1900 revolutions and industry", "1900-present global conflict"],
      questions: [
        q("The Columbian Exchange refers to...", ["the transfer of plants, animals, people and diseases between the Americas and Afro-Eurasia", "the exchange of diplomats during the Cold War", "the Silk Road trade in luxury goods", "the migration of Europeans to Australia"], "It began after 1492 and transformed diets and populations on both sides.", ["Crops such as maize and potatoes moved to Afro-Eurasia.", "Wheat, horses and diseases moved to the Americas.", "The exchange had profound demographic and environmental consequences."]),
        q("Which combination best explains decolonization after 1945?", ["Weakened European empires, organized nationalist movements and Cold War pressure", "The complete disappearance of nationalism", "A united Europe refusing to trade with colonies", "The Industrial Revolution"], "Several pressures converged after the Second World War.", ["European powers were economically and militarily exhausted.", "Nationalist leaders mobilized mass movements for independence.", "The United States and Soviet Union competed for influence in newly independent states."])
      ]
    },

    /* ----------------------------------------------------------------------
       MATH AND COMPUTER SCIENCE
       ---------------------------------------------------------------------- */
    {
      id: "ap-calculus-ab",
      title: "AP Calculus AB",
      group: "Math & Computer Science",
      track: "math-cs",
      icon: "calculator",
      accent: "indigo",
      blurb: "Limits, derivatives, integrals and the Fundamental Theorem — change and accumulation in one variable.",
      tags: ["limits", "derivatives", "integrals", "FTC", "applications"],
      format: "3 hours 15 minutes · 45 multiple-choice questions + 6 free-response questions",
      units: ["Limits and continuity", "Differentiation", "Integration and the FTC", "Differential equations and applications"],
      questions: [
        q("What is the derivative of f(x) = x² at x = 3?", ["6", "9", "3", "0"], "Use the power rule, then substitute.", ["The power rule gives f'(x) = 2x.", "At x = 3, f'(3) = 6.", "That is the slope of the tangent line at (3, 9)."]),
        q("Evaluate the definite integral of 2x from 0 to 2.", ["4", "2", "8", "0"], "An antiderivative of 2x is x².", ["The antiderivative is x².", "Evaluate at 2 and 0: 2² - 0².", "The result is 4."])
      ]
    },
    {
      id: "ap-calculus-bc",
      title: "AP Calculus BC",
      group: "Math & Computer Science",
      track: "math-cs",
      icon: "infinity",
      accent: "indigo",
      blurb: "All of Calculus AB plus advanced integration, sequences, series, parametric and polar curves.",
      tags: ["series", "integration", "parametric", "polar", "convergence"],
      format: "3 hours 15 minutes · 45 multiple-choice questions + 6 free-response questions",
      units: ["AB foundations", "Advanced integration", "Sequences and series", "Parametric, polar and vector functions"],
      questions: [
        q("What is the sum of the infinite geometric series 1 + 1/2 + 1/4 + ...?", ["2", "1", "3/2", "It diverges"], "The ratio is 1/2, so use a/(1 - r).", ["The first term is 1 and the ratio is 1/2.", "The sum is 1 / (1 - 1/2).", "That simplifies to 2."]),
        q("What is the derivative of ln(x² + 1)?", ["2x / (x² + 1)", "1 / (x² + 1)", "2x(x² + 1)", "ln(2x)"], "Use the chain rule with the inside function x² + 1.", ["The derivative of ln(u) is u'/u.", "Here u = x² + 1, so u' = 2x.", "The result is 2x / (x² + 1)."])
      ]
    },
    {
      id: "ap-computer-science-a",
      title: "AP Computer Science A",
      group: "Math & Computer Science",
      track: "math-cs",
      icon: "cpu",
      accent: "indigo",
      blurb: "Write and reason about Java: objects, control flow, arrays, methods, inheritance and recursion.",
      tags: ["Java", "objects", "arrays", "recursion", "algorithms"],
      format: "3 hours · 40 multiple-choice questions + 4 free-response questions",
      units: ["Primitive types and objects", "Boolean logic and conditionals", "Iteration and arrays", "Methods, classes and recursion"],
      questions: [
        q("How many times does the loop body run? for (int i = 0; i < 5; i++)", ["5", "4", "6", "0"], "Count the values of i that satisfy the condition.", ["i starts at 0 and runs while i < 5.", "The values are 0, 1, 2, 3 and 4.", "That is five iterations."]),
        q("What must every recursive method have to avoid infinite recursion?", ["A base case that stops the recursion", "A while loop", "A static variable", "A String parameter"], "Without a stopping condition, the calls never end.", ["Recursion solves a problem by calling a smaller version of itself.", "The base case handles the smallest input directly.", "Each recursive call must move toward that base case."])
      ]
    },
    {
      id: "ap-computer-science-principles",
      title: "AP Computer Science Principles",
      group: "Math & Computer Science",
      track: "math-cs",
      icon: "workflow",
      accent: "indigo",
      blurb: "Explore algorithms, data, networks and the social impact of computing while building a create task.",
      tags: ["algorithms", "data", "networks", "impact", "create task"],
      format: "2 hours · 70 multiple-choice questions + Create performance task",
      units: ["Creative development and algorithms", "Data and programming", "Computing networks and the internet", "Impact, privacy and create task"],
      questions: [
        q("Which best defines an algorithm?", ["A finite sequence of steps that solves a problem or performs a task", "Any program written in Java", "A physical computer component", "A permanent internet connection"], "It does not have to be code, but it must terminate.", ["An algorithm is a procedure, not a specific programming language.", "It takes inputs, follows unambiguous steps and produces outputs.", "It must finish after a finite number of steps."]),
        q("Lossless compression...", ["preserves all original data so it can be reconstructed exactly", "removes data permanently to save space", "only works on images", "always makes a file larger"], "The name tells you nothing is lost.", ["Lossless methods exploit redundancy while keeping every detail.", "The original file can be rebuilt exactly.", "Lossy compression discards some data and cannot reconstruct it perfectly."])
      ]
    },
    {
      id: "ap-precalculus",
      title: "AP Precalculus",
      group: "Math & Computer Science",
      track: "math-cs",
      icon: "chart-line",
      accent: "indigo",
      blurb: "Functions, trigonometry and modelling — the bridge from algebra to calculus.",
      tags: ["functions", "trigonometry", "exponential", "logarithm", "modelling"],
      format: "3 hours · 40 multiple-choice questions + 4 free-response questions",
      units: ["Polynomial and rational functions", "Exponential and logarithmic functions", "Trigonometric functions", "Parametric, polar and matrices"],
      questions: [
        q("What is the horizontal asymptote of f(x) = (2x + 1) / (x - 3)?", ["y = 2", "y = 0", "y = 3", "x = 3"], "Compare the leading coefficients when degrees are equal.", ["The numerator and denominator both have degree 1.", "The ratio of leading coefficients is 2/1.", "So the horizontal asymptote is y = 2."]),
        q("Solve 2^x = 16.", ["x = 4", "x = 8", "x = 2", "x = 16"], "Write 16 as a power of 2.", ["16 equals 2⁴.", "So 2^x = 2⁴.", "Exponential functions are one-to-one, giving x = 4."])
      ]
    },
    {
      id: "ap-statistics",
      title: "AP Statistics",
      group: "Math & Computer Science",
      track: "math-cs",
      icon: "chart-column",
      accent: "indigo",
      blurb: "Design studies, model variation and draw defensible conclusions from data.",
      tags: ["inference", "probability", "sampling", "regression", "significance"],
      format: "3 hours · 40 multiple-choice questions + 6 free-response questions",
      units: ["Exploring data", "Sampling and experiments", "Probability and random variables", "Inference and significance tests"],
      questions: [
        q("A p-value is...", ["the probability of observing data at least as extreme as the sample, assuming the null hypothesis is true", "the probability that the null hypothesis is true", "the probability that the alternative hypothesis is false", "the size of the sample"], "It is a conditional probability about the data, not about the hypothesis.", ["The p-value is calculated under the null model.", "It measures how unusual the observed result would be.", "A small p-value is evidence against the null, not proof that it is false."]),
        q("A Type I error occurs when...", ["a true null hypothesis is rejected", "a false null hypothesis is not rejected", "the sample is too large", "the confidence level is 100%"], "Think 'false positive'.", ["Type I error means rejecting H0 when H0 is actually true.", "Its probability is the significance level alpha.", "A Type II error is failing to reject a false null."])
      ]
    },

    /* ----------------------------------------------------------------------
       SCIENCES
       ---------------------------------------------------------------------- */
    {
      id: "ap-biology",
      title: "AP Biology",
      group: "Sciences",
      track: "sciences",
      icon: "dna",
      accent: "teal",
      blurb: "Cells, energy, genetics, evolution and ecology — with experimental design woven through.",
      tags: ["cells", "energetics", "genetics", "evolution", "ecology"],
      format: "3 hours 15 minutes · 60 multiple-choice questions + 6 free-response questions",
      units: ["Chemistry of life and cells", "Cellular energetics", "Genetics and information transfer", "Evolution and ecology"],
      questions: [
        q("Which organelle produces most of the ATP in a eukaryotic cell?", ["The mitochondrion", "The nucleus", "The ribosome", "The Golgi apparatus"], "It is the site of oxidative phosphorylation.", ["Mitochondria host the electron transport chain and chemiosmosis.", "Those processes generate most ATP during aerobic respiration.", "Ribosomes make proteins; the nucleus stores DNA."]),
        q("Independent assortment of chromosomes occurs during...", ["meiosis I", "mitosis", "meiosis II", "DNA replication"], "Homologous pairs separate before sister chromatids do.", ["Homologous chromosomes line up and separate in meiosis I.", "Their orientation is random, producing new combinations.", "Meiosis II separates sister chromatids."])
      ]
    },
    {
      id: "ap-chemistry",
      title: "AP Chemistry",
      group: "Sciences",
      track: "sciences",
      icon: "flask-conical",
      accent: "teal",
      blurb: "Atomic structure, bonding, reactions, kinetics, thermodynamics and equilibrium at the AP level.",
      tags: ["atomic structure", "bonding", "equilibrium", "thermodynamics", "electrochemistry"],
      format: "3 hours 15 minutes · 60 multiple-choice questions + 7 free-response questions",
      units: ["Atomic structure and properties", "Molecular bonds and reactions", "Kinetics and thermodynamics", "Equilibrium and electrochemistry"],
      questions: [
        q("What is the pH of a 0.01 M HCl solution?", ["2", "1", "12", "0.01"], "HCl is a strong acid, so it dissociates completely.", ["[H+] equals 0.01 M, or 10⁻² M.", "pH = -log(10⁻²).", "That gives pH = 2."]),
        q("Which bond is polar covalent?", ["H-Cl", "Cl-Cl", "H-H", "Na-Cl"], "Look for a difference in electronegativity between two nonmetals.", ["Polar covalent bonds share electrons unequally.", "Chlorine is more electronegative than hydrogen.", "H-Cl therefore has a dipole; Cl-Cl and H-H are nonpolar, and Na-Cl is ionic."])
      ]
    },
    {
      id: "ap-environmental-science",
      title: "AP Environmental Science",
      group: "Sciences",
      track: "sciences",
      icon: "droplets",
      accent: "teal",
      blurb: "Ecosystems, resources, land use, energy and pollution — science for a crowded planet.",
      tags: ["ecosystems", "biodiversity", "energy", "pollution", "climate"],
      format: "2 hours 40 minutes · 80 multiple-choice questions + 3 free-response questions",
      units: ["Ecosystems and biodiversity", "Populations and resources", "Land and water use", "Energy, pollution and climate"],
      questions: [
        q("Which is a renewable energy resource?", ["Solar energy", "Coal", "Natural gas", "Petroleum"], "Renewable resources are replenished on human timescales.", ["Solar energy arrives continuously from the Sun.", "Coal, gas and oil are fossil fuels formed over millions of years.", "Fossil fuels are finite and release stored carbon."]),
        q("Eutrophication is primarily caused by...", ["excess nutrients such as nitrogen and phosphorus entering water", "too little sunlight in a lake", "the complete absence of algae", "acid rain lowering soil pH"], "Nutrients fertilise algae, and decomposition then consumes oxygen.", ["Runoff from fertiliser and waste adds nutrients.", "Algal blooms grow, then die and decompose.", "Decomposition depletes dissolved oxygen, harming aquatic life."])
      ]
    },
    {
      id: "ap-physics-1",
      title: "AP Physics 1: Algebra-Based",
      group: "Sciences",
      track: "sciences",
      icon: "magnet",
      accent: "teal",
      blurb: "Mechanics, energy, momentum, waves and simple circuits using algebra and trigonometry.",
      tags: ["kinematics", "forces", "energy", "momentum", "circuits"],
      format: "3 hours · 40 multiple-choice questions + 4 free-response questions",
      units: ["Kinematics", "Forces and energy", "Momentum and rotation", "Waves and simple circuits"],
      questions: [
        q("An object has zero net force acting on it. What must be true?", ["Its velocity is constant", "It must be at rest", "It must be accelerating", "Its mass is zero"], "Newton's first law applies.", ["Zero net force means zero acceleration.", "Zero acceleration means velocity does not change.", "Constant velocity includes both rest and uniform motion."]),
        q("For a projectile in free flight, what is the horizontal acceleration?", ["Zero", "9.8 m/s²", "Equal to the vertical acceleration", "It depends on the launch angle"], "Ignore air resistance, as AP Physics 1 usually does.", ["Gravity acts vertically, not horizontally.", "With no horizontal force, horizontal acceleration is zero.", "Horizontal velocity therefore stays constant during flight."])
      ]
    },
    {
      id: "ap-physics-2",
      title: "AP Physics 2: Algebra-Based",
      group: "Sciences",
      track: "sciences",
      icon: "waves",
      accent: "teal",
      blurb: "Thermodynamics, electricity, magnetism, optics and modern physics.",
      tags: ["thermodynamics", "electricity", "magnetism", "optics", "modern physics"],
      format: "3 hours · 40 multiple-choice questions + 4 free-response questions",
      units: ["Thermodynamics", "Electric fields and circuits", "Magnetism and electromagnetism", "Optics and modern physics"],
      questions: [
        q("Ohm's law relates voltage, current and resistance as...", ["V = IR", "V = I/R", "I = VR", "R = VI"], "Voltage drives current through resistance.", ["Current is proportional to voltage for an ohmic device.", "Resistance is the constant of proportionality.", "Rearranging gives V = IR."]),
        q("The speed of a wave equals...", ["frequency times wavelength", "frequency divided by wavelength", "wavelength divided by amplitude", "amplitude times period"], "Units are metres per second.", ["Frequency is cycles per second and wavelength is metres per cycle.", "Multiplying gives metres per second.", "The equation is v = f lambda."])
      ]
    },
    {
      id: "ap-physics-c-mechanics",
      title: "AP Physics C: Mechanics",
      group: "Sciences",
      track: "sciences",
      icon: "orbit",
      accent: "teal",
      blurb: "Calculus-based mechanics: motion, forces, energy, momentum, rotation and gravitation.",
      tags: ["calculus", "mechanics", "rotation", "energy", "gravitation"],
      format: "1 hour 30 minutes · 35 multiple-choice questions + 3 free-response questions",
      units: ["Kinematics and Newton's laws", "Work, energy and momentum", "Rotation and oscillations", "Gravitation"],
      questions: [
        q("The work-energy theorem states that net work equals...", ["the change in kinetic energy", "the change in momentum", "the change in potential energy only", "the applied force"], "Work is force over a displacement, and it changes motion.", ["Net work is the sum of all work done on an object.", "That work changes the object's kinetic energy.", "The theorem is W_net = delta K."]),
        q("An object's moment of inertia depends on...", ["mass and how that mass is distributed about the axis", "only its total mass", "only its angular velocity", "only the net torque"], "Two objects with the same mass can resist rotation differently.", ["Moment of inertia measures resistance to angular acceleration.", "Mass farther from the axis contributes more.", "The axis chosen changes the value."])
      ]
    },
    {
      id: "ap-physics-c-electricity-magnetism",
      title: "AP Physics C: Electricity and Magnetism",
      group: "Sciences",
      track: "sciences",
      icon: "zap",
      accent: "teal",
      blurb: "Calculus-based electrostatics, circuits, magnetic fields, induction and Maxwell's equations.",
      tags: ["electrostatics", "circuits", "magnetic fields", "induction", "Maxwell"],
      format: "1 hour 30 minutes · 35 multiple-choice questions + 3 free-response questions",
      units: ["Electrostatics", "Circuits and capacitors", "Magnetic fields", "Induction and Maxwell"],
      questions: [
        q("In electrostatic equilibrium, the electric field inside a conductor is...", ["zero", "maximum at the centre", "equal to the surface field", "always pointing outward"], "Free charges rearrange until they stop moving.", ["If a field remained inside, free charges would move.", "They redistribute on the surface until the internal field cancels.", "The field is zero inside and perpendicular to the surface outside."]),
        q("The magnetic force on a moving charge is given by...", ["q v × B", "q E", "I R", "m g"], "It depends on velocity and magnetic field, with a cross product.", ["The force is perpendicular to both velocity and field.", "Its magnitude is qvB sin(theta).", "The vector form is F = q v × B."])
      ]
    },

    /* ----------------------------------------------------------------------
       WORLD LANGUAGES
       ---------------------------------------------------------------------- */
    {
      id: "ap-chinese",
      title: "AP Chinese Language and Culture",
      group: "World Languages",
      track: "languages",
      icon: "quote",
      accent: "sky",
      blurb: "Interpersonal, interpretive and presentational Chinese, with culture woven through every task.",
      tags: ["Mandarin", "interpersonal", "interpretive", "presentational", "culture"],
      format: "2 hours 15 minutes · listening, reading, writing and speaking tasks",
      units: ["Interpersonal speaking", "Interpretive reading and listening", "Presentational writing", "Cultural comparison"],
      questions: [
        q("What does 你叫什么名字？ mean?", ["What is your name?", "How old are you?", "Where do you live?", "What time is it?"], "叫 is the verb 'to be called'.", ["你 means you and 什么 means what.", "叫 means to be called, and 名字 means name.", "Together the question asks 'What is your name?'"]),
        q("Which measure word completes 三___书 (three books)?", ["本", "张", "只", "杯"], "Books take a specific measure word.", ["本 (běn) is used for books and bound volumes.", "张 is for flat objects, 只 for many animals, and 杯 for cups.", "So 三本书 means three books."])
      ]
    },
    {
      id: "ap-french",
      title: "AP French Language and Culture",
      group: "World Languages",
      track: "languages",
      icon: "feather",
      accent: "sky",
      blurb: "Communicate across French-speaking cultures through listening, reading, writing and speaking.",
      tags: ["French", "interpersonal", "interpretive", "presentational", "francophone"],
      format: "2 hours 15 minutes · listening, reading, writing and speaking tasks",
      units: ["Interpersonal speaking", "Interpretive reading and listening", "Presentational writing", "Cultural comparison"],
      questions: [
        q("Which auxiliary verb forms the passé composé of aller?", ["être", "avoir", "faire", "venir"], "Aller is a movement verb.", ["Aller uses être as its auxiliary.", "The past participle is allé.", "A female subject writes 'je suis allée'."]),
        q("What does 'Je voudrais' mean?", ["I would like", "I will have", "I am having", "I used to have"], "The conditional softens a request.", ["Vouloir is 'to want'.", "The conditional je voudrais means 'I would like'.", "It is the polite form used when ordering or requesting."])
      ]
    },
    {
      id: "ap-german",
      title: "AP German Language and Culture",
      group: "World Languages",
      track: "languages",
      icon: "layers",
      accent: "sky",
      blurb: "Interpret and produce German while comparing cultural products, practices and perspectives.",
      tags: ["German", "cases", "interpersonal", "presentational", "culture"],
      format: "2 hours 15 minutes · listening, reading, writing and speaking tasks",
      units: ["Interpersonal speaking", "Interpretive reading and listening", "Presentational writing", "Cultural comparison"],
      questions: [
        q("Complete the sentence: Ich helfe ___ Mann.", ["dem", "den", "der", "das"], "Helfen takes the dative case.", ["The verb helfen governs the dative.", "Mann is masculine singular.", "The masculine dative article is dem."]),
        q("In a German main clause, the finite verb normally stands...", ["in second position", "at the end", "in first position", "after the direct object"], "Even if a time phrase begins the sentence, the verb stays put.", ["German is a verb-second language in main clauses.", "Ich lerne heute Deutsch has the verb in second position.", "Heute lerne ich Deutsch keeps the verb second."])
      ]
    },
    {
      id: "ap-italian",
      title: "AP Italian Language and Culture",
      group: "World Languages",
      track: "languages",
      icon: "quote",
      accent: "sky",
      blurb: "Build Italian communication skills through contemporary culture, texts, audio and conversation.",
      tags: ["Italian", "interpersonal", "interpretive", "presentational", "culture"],
      format: "2 hours 15 minutes · listening, reading, writing and speaking tasks",
      units: ["Interpersonal speaking", "Interpretive reading and listening", "Presentational writing", "Cultural comparison"],
      questions: [
        q("What does 'Come stai?' mean?", ["How are you?", "What is your name?", "Where are you from?", "How old are you?"], "It is the informal 'tu' form.", ["Come means how and stai is the tu form of stare.", "The formal version is 'Come sta?'", "A reply might be 'Sto bene, grazie'."]),
        q("Which is the passato prossimo of andare for 'io'?", ["sono andato", "ho andato", "sono andare", "ho andato via"], "Movement verbs often take essere.", ["Andare takes essere in the passato prossimo.", "The past participle is andato.", "A male speaker says 'sono andato'; a female speaker says 'sono andata'."])
      ]
    },
    {
      id: "ap-japanese",
      title: "AP Japanese Language and Culture",
      group: "World Languages",
      track: "languages",
      icon: "pen-line",
      accent: "sky",
      blurb: "Use Japanese in interpersonal, interpretive and presentational modes while exploring culture.",
      tags: ["Japanese", "particles", "interpersonal", "presentational", "culture"],
      format: "2 hours 15 minutes · listening, reading, writing and speaking tasks",
      units: ["Interpersonal speaking", "Interpretive reading and listening", "Presentational writing", "Cultural comparison"],
      questions: [
        q("Which particle marks the topic of a Japanese sentence?", ["は", "を", "に", "で"], "It is pronounced 'wa' when used as a particle.", ["は marks what the sentence is about.", "を marks the direct object, に direction or time, and で location or means.", "In 私は学生です, は marks 'I' as the topic."]),
        q("What does ありがとう mean?", ["Thank you", "Good morning", "Excuse me", "Goodbye"], "The polite form is ありがとうございます.", ["ありがとう is the casual 'thank you'.", "Use ありがとうございます in polite contexts.", "おはよう means good morning and さようなら means goodbye."])
      ]
    },
    {
      id: "ap-latin",
      title: "AP Latin",
      group: "World Languages",
      track: "languages",
      icon: "scroll-text",
      accent: "sky",
      blurb: "Read Caesar and Vergil in Latin, analyse syntax and write about literary technique.",
      tags: ["Latin", "Caesar", "Vergil", "translation", "syntax"],
      format: "2 hours 30 minutes · 50 multiple-choice questions + 5 free-response questions",
      units: ["Sight reading and translation", "Caesar and Vergil selections", "Grammar and syntax", "Literary analysis and essay"],
      questions: [
        q("What is the accusative singular of puella?", ["puellam", "puellae", "puella", "puellis"], "Puella is a first-declension feminine noun.", ["First-declension nouns take -am in the accusative singular.", "Puella becomes puellam.", "The genitive and dative singular are puellae."]),
        q("A purpose clause in Latin is normally introduced by...", ["ut or ne plus the subjunctive", "quod plus the indicative", "dum plus the present tense", "sed plus the imperative"], "Purpose answers 'in order that'.", ["Positive purpose clauses use ut.", "Negative purpose clauses use ne.", "The verb is subjunctive because the purpose is intended rather than asserted."])
      ]
    },
    {
      id: "ap-spanish-language",
      title: "AP Spanish Language and Culture",
      group: "World Languages",
      track: "languages",
      icon: "quote",
      accent: "sky",
      blurb: "Communicate confidently in Spanish across cultural topics, texts, audio and real conversation.",
      tags: ["Spanish", "subjunctive", "interpersonal", "presentational", "culture"],
      format: "2 hours 15 minutes · listening, reading, writing and speaking tasks",
      units: ["Interpersonal speaking", "Interpretive reading and listening", "Presentational writing", "Cultural comparison"],
      questions: [
        q("Complete the sentence: Espero que ___ (venir) mañana.", ["vengas", "vienes", "vendrás", "viniste"], "Espero que triggers the subjunctive.", ["Expressions of wish or emotion take the subjunctive in the dependent clause.", "The subjunctive form of venir for tú is vengas.", "The indicative vienes would state a fact, not a wish."]),
        q("Which sentence correctly states origin with ser?", ["Soy de México.", "Estoy de México.", "Tengo de México.", "Hago de México."], "Origin is treated as identity.", ["Ser is used for origin and nationality.", "The first-person form is soy.", "Estar would describe a temporary location or state."])
      ]
    },
    {
      id: "ap-spanish-literature",
      title: "AP Spanish Literature and Culture",
      group: "World Languages",
      track: "languages",
      icon: "book-open",
      accent: "sky",
      blurb: "Read Spanish and Latin American literature from the medieval period to the present.",
      tags: ["literature", "poetry", "narrative", "drama", "literary analysis"],
      format: "3 hours · 65 multiple-choice questions + 4 free-response questions",
      units: ["Medieval and Golden Age", "19th-century realism", "20th-century poetry and prose", "Contemporary voices"],
      questions: [
        q("Who wrote Don Quijote de la Mancha?", ["Miguel de Cervantes", "Federico García Lorca", "Gabriel García Márquez", "Sor Juana Inés de la Cruz"], "The novel was published in two parts in the early seventeenth century.", ["Cervantes published Part One in 1605 and Part Two in 1615.", "The novel parodies chivalric romances.", "It is one of the foundational works of the Spanish literary canon."]),
        q("Which author is closely associated with magical realism?", ["Gabriel García Márquez", "Miguel de Cervantes", "Antonio Machado", "Rosalía de Castro"], "The author wrote Cien años de soledad.", ["García Márquez is famous for Cien años de soledad.", "Magical realism presents extraordinary events as ordinary.", "The mode is associated with Latin American fiction."])
      ]
    },

    /* ----------------------------------------------------------------------
       AP CAPSTONE
       ---------------------------------------------------------------------- */
    {
      id: "ap-research",
      title: "AP Research",
      group: "AP Capstone",
      track: "capstone",
      icon: "search",
      accent: "violet",
      blurb: "Design and carry out an independent research project, then defend it in an academic paper and presentation.",
      tags: ["research question", "method", "literature review", "academic paper", "defense"],
      format: "Academic paper (4,000-5,000 words) + presentation and oral defense",
      units: ["Research question and method", "Literature review and sources", "Analysis and argument", "Paper, presentation and defense"],
      questions: [
        q("What is the required length of the AP Research academic paper?", ["4,000-5,000 words", "1,000-1,500 words", "8,000-10,000 words", "Exactly 2,000 words"], "It is a substantial paper, but not a dissertation.", ["The paper must be 4,000-5,000 words.", "It presents the research question, method, analysis and conclusion.", "The presentation and oral defense are separate components."]),
        q("The strongest AP Research project begins with...", ["a focused, defensible research question", "a list of every source the student has read", "a conclusion written before the research", "a topic chosen only because it is easy"], "Everything else follows from the question.", ["A research question defines the scope and method.", "It must be answerable through evidence, not just opinion.", "A narrow question is easier to investigate rigorously."])
      ]
    },
    {
      id: "ap-seminar",
      title: "AP Seminar",
      group: "AP Capstone",
      track: "capstone",
      icon: "file-text",
      accent: "violet",
      blurb: "Investigate real-world questions, evaluate competing arguments and present a team solution.",
      tags: ["inquiry", "argument", "credibility", "team project", "presentation"],
      format: "Two performance tasks + end-of-course exam",
      units: ["Question and explore", "Understand and analyze arguments", "Evaluate multiple perspectives", "Synthesize and present"],
      questions: [
        q("Which pair of components belongs to the AP Seminar team project?", ["Individual Research Report and Team Multimedia Presentation", "Document-Based Question and Long Essay", "Selected Works and Sustained Investigation", "Create Performance Task and Written Response"], "One component is individual, one is collaborative.", ["The IRR is researched and written individually.", "The TMP is designed and presented by the team.", "Both are assessed through the performance task rubric."]),
        q("Which source is generally the most credible for an academic argument?", ["A peer-reviewed journal article", "An anonymous social-media post", "A sponsored product page", "A meme with no citation"], "Look for expert review and transparent methods.", ["Peer review means experts have evaluated the methods and claims.", "Academic articles usually cite evidence and disclose limitations.", "Anonymous or sponsored sources lack comparable accountability."])
      ]
    },

    /* ----------------------------------------------------------------------
       AP CAREER KICKSTART
       ---------------------------------------------------------------------- */
    {
      id: "ap-business-personal-finance",
      title: "AP Business with Personal Finance",
      group: "AP Career Kickstart",
      track: "career",
      icon: "coins",
      accent: "emerald",
      blurb: "Apply business and personal-finance reasoning to real decisions, from budgeting to entrepreneurship.",
      tags: ["business", "personal finance", "opportunity cost", "credit", "entrepreneurship"],
      format: "Multiple-choice questions + scenario-based free response · first exam May 2027",
      units: ["Business models and markets", "Money management and budgeting", "Credit, investing and risk", "Entrepreneurship and financial decisions"],
      questions: [
        q("Opportunity cost is best defined as...", ["the value of the next-best alternative given up when making a choice", "the money actually paid for a good", "the total cost of all available options", "the interest rate on a loan"], "It is what you give up, not what you spend.", ["Every choice means forgoing alternatives.", "Opportunity cost measures the value of the best forgone option.", "It includes non-monetary costs such as time."]),
        q("Compound interest differs from simple interest because it...", ["earns interest on both principal and previously accumulated interest", "is charged only on the principal", "never changes the account balance", "applies only to loans, not savings"], "Interest begins to earn interest.", ["Simple interest is calculated only on the original principal.", "Compound interest is added to the balance, so future interest is larger.", "Over time, compounding accelerates growth or debt."])
      ]
    },
    {
      id: "ap-cybersecurity",
      title: "AP Cybersecurity",
      group: "AP Career Kickstart",
      track: "career",
      icon: "cpu",
      accent: "emerald",
      blurb: "Protect data, devices and networks through risk analysis, secure design and incident response.",
      tags: ["security", "risk", "networks", "data protection", "incident response"],
      format: "Multiple-choice questions + scenario-based tasks · first exam May 2027",
      units: ["Security fundamentals and risk", "Networks and systems", "Data protection and access control", "Incident response and ethics"],
      questions: [
        q("Phishing is best described as...", ["a deceptive message that tricks a person into revealing credentials or clicking a malicious link", "a physical lock on a server room", "a method of encrypting a hard drive", "a firewall rule that blocks all traffic"], "It targets the person, not the machine.", ["Phishing uses social engineering and a convincing pretext.", "The goal is often credentials, payment or malware installation.", "Defences include verification, training and multi-factor authentication."]),
        q("The CIA triad in security stands for...", ["Confidentiality, Integrity and Availability", "Control, Identity and Access", "Cryptography, Inspection and Authentication", "Compliance, Isolation and Auditing"], "It names the three core security goals.", ["Confidentiality limits unauthorized disclosure.", "Integrity prevents unauthorized modification.", "Availability keeps systems usable when needed."])
      ]
    }
  ];

  function build(course) {
    const study = [
      {
        id: course.id + "-s1",
        title: "Exam at a glance",
        icon: "clipboard-check",
        summary: course.format,
        points: [
          course.format,
          "The exam is scored 1-5. Most colleges award credit for 3 or higher, but each school sets its own policy.",
          course.id.indexOf("art-design") >= 0 || course.id === "ap-drawing" || course.id === "ap-research" ? "Portfolio and performance work is judged against a rubric, so evidence of process and revision matters." : "Multiple choice rewards precise recall; free response rewards a clear claim supported by specific evidence.",
          "Use the official course and exam description (CED) as the syllabus for what can be tested."
        ]
      },
      {
        id: course.id + "-s2",
        title: "Core units to review",
        icon: "list-ordered",
        summary: "The four buckets to cycle through when you plan revision.",
        points: course.units
      }
    ];

    const tips = [
      {
        title: "Audit the CED",
        icon: "target",
        body: "Open the official course and exam description and tick every unit you can explain without notes. Study the unticked units first; rereading familiar material feels productive but rarely moves a score."
      },
      {
        title: "Practise the exam's verbs",
        icon: "pencil-line",
        body: "AP questions ask you to identify, explain, compare, justify or evaluate. Answer with the verb in mind: a definition is not an explanation, and an explanation without evidence is not a justification."
      },
      {
        title: "Keep a unit error log",
        icon: "repeat-2",
        body: "After each practice set, record the unit, the exact mistake and the correct reasoning in one line. Reattempt those items after two days and again after a week."
      }
    ];

    const mistakes = [
      "Memorising isolated terms without connecting them to a unit question or an exam task.",
      "Rereading notes instead of answering questions and correcting the reasoning.",
      "Writing free responses without a clear claim, specific evidence and explicit commentary.",
      "Ignoring time limits until the week before the exam."
    ];

    return {
      id: course.id,
      title: course.title,
      icon: course.icon,
      accent: course.accent,
      level: "Advanced",
      track: course.track,
      trackLabel: course.group,
      examFormat: course.format,
      blurb: course.blurb,
      tags: course.tags,
      questions: course.questions.map(function (question, index) {
        return {
          id: course.id + "-" + (index + 1),
          difficulty: "Advanced",
          tags: course.tags.slice(0, 2),
          prompt: question.prompt,
          options: question.options,
          answer: question.answer,
          hint: question.hint,
          explanation: question.explanation
        };
      }),
      study: study,
      mistakes: mistakes,
      tips: tips,
      videos: []
    };
  }

  if (!window.STUDY_DATA || !Array.isArray(window.STUDY_DATA.categories)) return;

  window.STUDY_DATA.categories.unshift({
    id: "ap-courses",
    title: "AP Courses",
    tagline: "Every current College Board AP course, with exam-focused practice and quick reviews.",
    icon: "landmark",
    accent: "orange",
    subjects: COURSES.map(build)
  });
})();
