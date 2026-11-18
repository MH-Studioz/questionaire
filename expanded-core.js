/* ============================================================================
   QUESTIONAIRE — expanded-core.js
   ----------------------------------------------------------------------------
   Builds the large subject catalogue from compact specs. Every subject gets
   curated anchor questions, study cards and tips; subject-banks.js expands it
   to 1,000 questions lazily. Duplicate ids are ignored.
   ========================================================================== */

(function () {
  "use strict";

  const DATA = window.STUDY_DATA;
  if (!DATA || !Array.isArray(DATA.categories)) return;

  const CATEGORIES = [
    {
      id: "engineering",
      title: "Engineering & Computing",
      tagline: "Systems, machines, software and the mathematics that holds them together.",
      icon: "cpu",
      accent: "orange"
    },
    {
      id: "health",
      title: "Health & Medicine",
      tagline: "The science of the body, disease, treatment and public health.",
      icon: "heart-pulse",
      accent: "rose"
    },
    {
      id: "creative-arts",
      title: "Creative Arts",
      tagline: "Music, image, performance and the crafts of making.",
      icon: "palette",
      accent: "violet"
    },
    {
      id: "social-sciences",
      title: "Social Sciences & Law",
      tagline: "People, institutions, markets, law and the patterns of collective life.",
      icon: "scale",
      accent: "teal"
    }
  ];

  const DEFAULTS = {
    mathematics: "concept",
    sciences: "concept",
    engineering: "concept",
    health: "concept",
    "creative-arts": "concept",
    humanities: "concept",
    "social-sciences": "concept",
    languages: "language"
  };

  const pending = [];
  let finished = false;

  function ensureCategory(def) {
    let category = DATA.categories.find(function (item) { return item.id === def.id; });
    if (category) return category;
    category = Object.assign({}, def, { subjects: [] });
    const vaultIndex = DATA.categories.findIndex(function (item) { return item.id === "vault"; });
    DATA.categories.splice(vaultIndex < 0 ? DATA.categories.length : vaultIndex, 0, category);
    return category;
  }

  CATEGORIES.forEach(ensureCategory);

  function add(categoryId, specs) {
    (specs || []).forEach(function (spec) {
      pending.push({ categoryId: categoryId, spec: spec });
    });
  }

  function uniqueWrongs(correct, wrongs) {
    const result = [];
    (wrongs || []).forEach(function (wrong) {
      const text = String(wrong);
      if (text && text !== String(correct) && result.indexOf(text) < 0) result.push(text);
    });
    ["None of these", "A neighbouring field", "Not covered here"].forEach(function (fallback) {
      if (result.length < 3 && result.indexOf(fallback) < 0 && fallback !== String(correct)) result.push(fallback);
    });
    return result.slice(0, 3);
  }

  function placeOptions(correct, wrongs, seed) {
    const distractors = uniqueWrongs(correct, wrongs);
    const target = Math.abs(seed) % 4;
    const options = [];
    let cursor = 0;
    for (let index = 0; index < 4; index += 1) {
      options.push(index === target ? String(correct) : distractors[cursor++]);
    }
    return { options: options, answer: target };
  }

  function pickWrongs(pool, correct, seed, count) {
    const result = [];
    if (!pool.length) return result;
    let cursor = Math.abs(seed) % pool.length;
    for (let step = 0; step < pool.length * 2 && result.length < (count || 3); step += 1) {
      const candidate = pool[cursor % pool.length];
      cursor += 1;
      if (candidate && candidate !== correct && result.indexOf(candidate) < 0) result.push(candidate);
    }
    return result;
  }

  function anchor(subjectId, prompt, correct, wrongs, seed, tags, hint, explanation) {
    const placed = placeOptions(correct, wrongs, seed);
    return {
      id: subjectId + "-" + (seed + 1),
      difficulty: seed % 3 === 0 ? "Advanced" : seed % 3 === 1 ? "Beginner" : "Intermediate",
      tags: tags,
      prompt: prompt,
      options: placed.options,
      answer: placed.answer,
      hint: hint,
      explanation: explanation
    };
  }

  function build(item, index, peerTerms, peerTitles) {
    const spec = item.spec;
    const id = String(spec[0]);
    const title = String(spec[1]);
    const level = spec[2] || "Intermediate";
    const blurb = spec[3] || ("Core ideas, methods and practice in " + title + ".");
    const rawTerms = (spec[4] && spec[4].length ? spec[4] : [title]).filter(Boolean);
    const terms = [];
    rawTerms.forEach(function (term) {
      if (terms.indexOf(term) < 0) terms.push(term);
    });
    const category = DATA.categories.find(function (entry) { return entry.id === item.categoryId; });
    if (!category) return null;
    const domain = spec[5] || DEFAULTS[item.categoryId] || "concept";
    const wrongTerms = pickWrongs(peerTerms, terms[0], index * 7 + 3, 5);
    const wrongTitles = pickWrongs(peerTitles, title, index * 5 + 1, 5);
    const conceptTerms = peerTerms.filter(function (term) { return terms.indexOf(term) < 0; });
    const conceptTitles = peerTitles.filter(function (peerTitle) { return peerTitle !== title; });

    const questions = [
      anchor(
        id,
        "Which of these is a core concept in " + title + "?",
        terms[0],
        wrongTerms,
        index,
        [title].concat(terms.slice(0, 3)),
        "Choose the idea that belongs to this field rather than a neighbouring one.",
        ["The other options belong to different fields.", terms[0] + " is a core idea in " + title + "."]
      ),
      anchor(
        id,
        "Which field includes the idea \"" + (terms[1] || terms[0]) + "\"?",
        title,
        wrongTitles,
        index + 1,
        [title].concat(terms.slice(0, 3)),
        "Match the idea to the field that studies it.",
        ["The correct field is " + title + ".", (terms[1] || terms[0]) + " is one of its working ideas."]
      )
    ];

    return {
      id: id,
      title: title,
      icon: category.icon,
      accent: category.accent,
      level: level,
      blurb: blurb,
      tags: [title].concat(terms).slice(0, 6),
      trackLabel: "Expanded catalogue",
      questions: questions,
      study: [
        {
          id: id + "-s1",
          title: "Core concepts",
          icon: "layers",
          summary: blurb,
          points: terms.slice(0, 4).map(function (term) {
            return "Define " + term + " in your own words and connect it to " + title + ".";
          })
        },
        {
          id: id + "-s2",
          title: "How to practise",
          icon: "repeat-2",
          summary: "Build recall around the vocabulary, then test it with examples and comparisons.",
          points: [
            "Write a one-line definition for each core term without looking.",
            "Work one example and one counterexample for the central idea.",
            "Explain the topic aloud as if teaching a classmate.",
            "Return to missed questions after a day and again after a week."
          ]
        }
      ],
      mistakes: [
        "Memorising labels without being able to define them.",
        "Confusing this field with a neighbouring specialism.",
        "Skipping worked examples and relying on recognition.",
        "Treating a single example as a general rule."
      ],
      tips: [
        {
          title: "Build a term map",
          icon: "network",
          body: "Put the core terms on one page and draw the relationships between them."
        },
        {
          title: "Explain it aloud",
          icon: "message-circle",
          body: "A topic is not learned until you can explain it without reading the notes."
        },
        {
          title: "Retrieve, don't reread",
          icon: "brain",
          body: "Close the page and write what you remember. Then check what you missed."
        }
      ],
      videos: [],
      _terms: terms,
      _peerTerms: conceptTerms,
      _peerTitles: conceptTitles,
      _bankDomain: domain
    };
  }

  function finish() {
    if (finished) return;
    finished = true;

    const existingIds = new Set();
    const existingTitles = [];
    const existingTerms = [];
    DATA.categories.forEach(function (category) {
      category.subjects.forEach(function (subject) {
        existingIds.add(subject.id);
        existingTitles.push(subject.title);
        (subject.tags || []).forEach(function (tag) { existingTerms.push(tag); });
      });
    });

    const items = [];
    const seen = new Set();
    pending.forEach(function (item) {
      const id = String(item.spec[0]);
      if (seen.has(id) || existingIds.has(id)) return;
      seen.add(id);
      items.push(item);
    });

    const peerTerms = [];
    const peerTitles = existingTitles.slice();
    items.forEach(function (item) {
      peerTitles.push(String(item.spec[1]));
      (item.spec[4] || []).forEach(function (term) {
        if (peerTerms.indexOf(term) < 0) peerTerms.push(term);
      });
    });
    existingTerms.forEach(function (term) {
      if (peerTerms.indexOf(term) < 0) peerTerms.push(term);
    });

    items.forEach(function (item, index) {
      const subject = build(item, index, peerTerms, peerTitles);
      if (!subject) return;
      const category = DATA.categories.find(function (entry) { return entry.id === item.categoryId; });
      category.subjects.push(subject);
    });
  }

  window.QuestionaireExpanded = { add: add, finish: finish };
})();
