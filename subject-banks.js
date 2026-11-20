/* ============================================================================
   QUESTIONAIRE — subject-banks.js
   ----------------------------------------------------------------------------
   Every subject gets a 1,000-question target. Curated questions stay first;
   the rest are built lazily from subject-specific seeds and domain pools when
   a subject is opened or searched. This keeps the static page from booting
   ~443,000 cards at once while preserving stable generated question ids.

   Generated ids use `<subject-id>-g0001` onwards. Progress and review counts
   can therefore survive before a bank is materialized in memory.
   ========================================================================== */

(function () {
  "use strict";

  const DATA = window.STUDY_DATA;
  if (!DATA || !Array.isArray(DATA.categories)) return;

  const TARGET = 1000;
  const AP_TARGET = 2000;
  const CONTENT = window.ExamPrepContent || {};

  function hash(value) {
    let result = 2166136261;
    String(value).split("").forEach(function (character) {
      result ^= character.charCodeAt(0);
      result = Math.imul(result, 16777619);
    });
    return result >>> 0;
  }

  function rng(seed) {
    let value = seed >>> 0;
    return function () {
      value += 0x6d2b79f5;
      let result = value;
      result = Math.imul(result ^ (result >>> 15), result | 1);
      result ^= result + Math.imul(result ^ (result >>> 7), result | 61);
      return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
    };
  }

  function ri(random, min, max) {
    return min + Math.floor(random() * (max - min + 1));
  }

  function pick(random, array) {
    return array[Math.floor(random() * array.length)];
  }

  function uniqueWrongs(correct, wrongs) {
    const result = [];
    wrongs.forEach(function (wrong) {
      const text = String(wrong);
      if (text && text !== String(correct) && result.indexOf(text) < 0) result.push(text);
    });
    ["None of the above", "Cannot be determined", "Not enough information"].forEach(function (fallback) {
      if (result.length < 3 && result.indexOf(fallback) < 0 && fallback !== String(correct)) result.push(fallback);
    });
    return result.slice(0, 3);
  }

  function placeOptions(correct, wrongs, target) {
    const distractors = uniqueWrongs(correct, wrongs);
    const options = [];
    let cursor = 0;
    for (let index = 0; index < 4; index += 1) {
      options.push(index === target ? String(correct) : distractors[cursor++]);
    }
    return { options: options, answer: target };
  }

  /* --------------------------------------------------------------------------
     Domain pools
     -------------------------------------------------------------------------- */

  function normaliseFact(fact, tags) {
    return {
      prompt: fact[0],
      correct: String(fact[1]),
      wrongs: fact[2],
      explanation: Array.isArray(fact[3]) ? fact[3].join(" ") : String(fact[3]),
      tags: tags || []
    };
  }

  const SCIENCE = (CONTENT.SCIENCE || []).map(function (fact) { return normaliseFact(fact, ["science"]); });
  const SOCIAL = (CONTENT.SOCIAL || []).map(function (fact) { return normaliseFact(fact, ["social studies"]); });
  const VOCAB = (CONTENT.VOCAB || []).map(function (entry) {
    return {
      prompt: "What is the closest meaning of \"" + entry[0] + "\"?",
      correct: entry[1],
      wrongs: entry[2],
      explanation: "\"" + entry[0] + "\" means " + entry[1] + ".",
      tags: ["vocabulary", entry[0]]
    };
  });

  const ARTS = [
    ["Which element of art describes a continuous mark with length and direction?", "Line", ["Value", "Texture", "Shape"], "Line is one of the foundational elements of art."],
    ["Which principle of design creates a focal point?", "Emphasis", ["Balance", "Rhythm", "Unity"], "Emphasis draws the viewer's attention to a particular area."],
    ["What is the term for the lightness or darkness of a colour?", "Value", ["Hue", "Saturation", "Texture"], "Value describes relative lightness or darkness."],
    ["Which colour scheme uses colours opposite each other on the colour wheel?", "Complementary", ["Analogous", "Monochromatic", "Triadic"], "Complementary pairs sit across the wheel."],
    ["What is a fresco?", "Painting on wet plaster", ["Painting on canvas", "A carved relief", "A mosaic"], "Pigment is applied to wet lime plaster and bonds as it dries."],
    ["Which artist painted the Mona Lisa?", "Leonardo da Vinci", ["Michelangelo", "Raphael", "Caravaggio"], "Leonardo painted the portrait in the early sixteenth century."],
    ["What is the primary purpose of a museum catalogue?", "Document and interpret a collection", ["Sell tickets", "Replace the artworks", "Train guards"], "Catalogues record provenance, context and interpretation."],
    ["What is the vanishing point?", "The point where parallel lines appear to converge in perspective", ["The centre of a canvas", "The darkest part of a painting", "The edge of a frame"], "Linear perspective uses vanishing points to create depth."],
    ["Which art movement emphasized spontaneous gesture and the unconscious?", "Abstract Expressionism", ["Neoclassicism", "Impressionism", "Baroque"], "Abstract Expressionism emerged in mid-twentieth-century New York."],
    ["Which medium uses melted wax and pigment?", "Encaustic", ["Watercolour", "Gouache", "Tempera"], "Encaustic paints use beeswax as a binder."],
    ["What is the rule of thirds used for?", "Composition", ["Colour mixing", "Perspective", "Printmaking"], "The rule of thirds places key elements near intersection points."]
  ].map(function (fact) { return normaliseFact(fact, ["visual arts"]); });

  /* Music subjects get their own pool: a colour-value question inside AP Music
     Theory is a bug, not a hard question. */
  const MUSIC = [
    ["How many semitones are in an octave?", "Twelve", ["Eight", "Seven", "Ten"], "Equal temperament divides the octave into twelve semitones."],
    ["Which clef do most high voices and instruments read?", "Treble clef", ["Bass clef", "Alto clef", "Tenor clef"], "The treble clef curls around the G above middle C."],
    ["How many sharps does D major have?", "Two", ["One", "Three", "Four"], "D major uses F sharp and C sharp."],
    ["What is the relative minor of C major?", "A minor", ["E minor", "G minor", "D minor"], "Relative minors share a key signature."],
    ["Which cadence moves from V to I?", "Authentic cadence", ["Plagal cadence", "Deceptive cadence", "Half cadence"], "A V-I close is an authentic cadence."],
    ["Which cadence moves from IV to I?", "Plagal cadence", ["Authentic cadence", "Deceptive cadence", "Half cadence"], "The IV-I close is the plagal, or amen, cadence."],
    ["What is the leading tone in C major?", "B", ["A", "D", "G"], "Scale degree seven sits a semitone below the tonic."],
    ["What is the dominant chord in G major?", "D major", ["C major", "A minor", "E minor"], "The dominant is built on the fifth degree, D."],
    ["What does a key signature tell a performer?", "Which sharps or flats apply throughout the piece", ["The tempo of the piece", "The metre of the piece", "The instrumentation of the piece"], "It fixes the accidentals of the tonic."],
    ["What is a triad?", "A chord of three notes stacked in thirds", ["A rhythm of three beats", "A three-part form", "A scale of three notes"], "Root, third and fifth make the triad."],
    ["What is it called when the third of a chord is in the bass?", "First inversion", ["Root position", "Second inversion", "Third inversion"], "First inversion puts the third in the lowest voice."],
    ["What is counterpoint?", "Two or more independent melodic lines sounding together", ["A single unaccompanied melody", "Chords played in block rhythms", "A repeated bass pattern"], "Counterpoint sets melodic lines against one another."],
    ["Which interval is the tritone?", "Augmented fourth", ["Perfect fourth", "Minor third", "Major sixth"], "Six semitones span an augmented fourth or diminished fifth."],
    ["What does 'piano' mean as a dynamic marking?", "Soft", ["Loud", "Fast", "Detached"], "Piano (p) marks a soft dynamic."],
    ["What does 'allegro' indicate?", "A fast tempo", ["A slow tempo", "A moderate tempo", "A gradual slowdown"], "Allegro is a quick, lively tempo."],
    ["What is syncopation?", "Emphasis on a weak beat or between beats", ["A steady accent on every beat", "A gradual change of key", "A repeated rhythmic pattern"], "Syncopation displaces the expected accent."],
    ["What is timbre?", "The tone colour of an instrument or voice", ["The loudness of a note", "The length of a note", "The pitch of a note"], "Timbre separates a flute from a violin on the same note."],
    ["Which form has an exposition, development and recapitulation?", "Sonata form", ["Rondo form", "Strophic form", "Through-composed form"], "Sonata form organises a movement around those sections."],
    ["What is modulation?", "A change of key within a piece", ["A change of tempo", "A change of metre", "A change of instrumentation"], "Modulation moves the tonal centre."],
    ["What is an ostinato?", "A short repeated musical pattern", ["A solo cadenza", "A sudden dynamic change", "A type of cadence"], "Ostinati repeat beneath changing material."],
    ["What does staccato indicate?", "Notes played short and detached", ["Notes held for their full value", "Notes played louder", "Notes played slower"], "Staccato shortens articulation."],
    ["What is the circle of fifths used for?", "Showing the relationships between keys", ["Counting beats in a bar", "Tuning a drum", "Writing lyrics"], "Adjacent keys on the circle are a fifth apart."],
    ["What is a hemiola?", "The feel of two beats against three", ["A three-part canon", "A perfect cadence", "A slow trill"], "Hemiola shifts the perceived grouping."],
    ["What does 'a cappella' mean?", "Singing without instrumental accompaniment", ["Singing with an orchestra", "Singing in unison only", "Singing in a round"], "A cappella is unaccompanied vocal music."],
    ["Which texture sets a melody against chordal accompaniment?", "Homophony", ["Polyphony", "Monophony", "Heterophony"], "Homophony moves the parts together under a melody."],
    ["What is the subdominant chord in C major?", "F major", ["G major", "A minor", "D minor"], "The subdominant is built on the fourth degree, F."],
    ["What is transposition?", "Shifting music to a different key", ["Changing the tempo", "Changing the metre", "Changing the instrumentation"], "Transposition keeps intervals but changes pitch level."],
    ["What is a sequence in music?", "A motif repeated at a different pitch level", ["A chord progression that ends a phrase", "A change of instrumentation", "A type of ornament"], "Sequences repeat a pattern higher or lower."],
    ["Which term describes a melody that moves mostly by small steps?", "Conjunct motion", ["Disjunct motion", "Syncopation", "Ostinato"], "Conjunct motion moves stepwise."],
    ["What is a fermata?", "A sign that holds a note longer than its written value", ["A sign to play softer", "A sign to repeat a section", "A sign to speed up"], "The performer sustains the note."],
    ["What is a motif in music?", "A short recurring musical idea", ["A type of instrument", "A concert hall", "A tuning system"], "Motifs are repeated and developed."],
    ["Which musical texture is a single unaccompanied melodic line?", "Monophony", ["Polyphony", "Homophony", "Heterophony"], "Monophony has one melodic line without accompaniment."],
    ["What does 'forte' mean in music?", "Loud", ["Soft", "Fast", "Slow"], "Forte is a dynamic marking meaning loud."],
    ["Which interval spans eight diatonic notes?", "Octave", ["Fifth", "Third", "Seventh"], "An octave spans eight letter names."]
  ].map(function (fact) { return normaliseFact(fact, ["music theory"]); });

  /* Philosophy is its own discipline; it used to fall into the physics pool
     through the word "metaphysics" and then into the generic pool. */
  const PHILOSOPHY = [
    ["What is a valid argument?", "One whose conclusion follows from its premises", ["One whose premises are true", "One that persuades most people", "One with no premises"], "Validity concerns structure, not the truth of the premises."],
    ["What is a sound argument?", "A valid argument with true premises", ["Any persuasive argument", "An argument with a false conclusion", "An argument from authority"], "Soundness adds truth to validity."],
    ["What is the principle of utility in utilitarianism?", "Act to maximise overall happiness", ["Act only from duty", "Follow the golden mean", "Obey the sovereign"], "Bentham and Mill judge actions by their consequences."],
    ["What is Kant's categorical imperative?", "Act only on maxims you could will as universal law", ["Maximise pleasure for the greatest number", "Seek the mean between extremes", "Obey the strongest power"], "Kant tests maxims for universalisability."],
    ["What is virtue ethics centred on?", "The character of the agent", ["The consequences of acts", "The rules followed", "The social contract"], "Aristotle asks what a good person would do."],
    ["What is the veil of ignorance used to justify?", "Fair principles of justice", ["Absolute monarchy", "Religious authority", "Free markets without rules"], "Rawls asks what principles people would choose without knowing their place."],
    ["What does 'cogito, ergo sum' assert?", "Thinking proves the thinker exists", ["God guarantees knowledge", "The senses are reliable", "The mind is the brain"], "Descartes found one indubitable starting point."],
    ["What is empiricism?", "Knowledge derives from experience", ["Knowledge derives from reason alone", "Knowledge is innate only", "Knowledge is impossible"], "Locke and Hume treat experience as the source of ideas."],
    ["What is rationalism?", "Reason is the primary source of knowledge", ["Experience is the only source", "Custom explains belief", "All knowledge is relative"], "Descartes, Spinoza and Leibniz trusted reason."],
    ["What is the problem of induction?", "Past observations do not logically guarantee future ones", ["Induction is always invalid", "Experiments cannot be repeated", "Theories cannot be tested"], "Hume noted that induction needs an unproven uniformity assumption."],
    ["What is a straw man fallacy?", "Misrepresenting an opponent's position to refute it", ["Attacking a person instead of the argument", "Appealing to popularity", "Assuming the conclusion"], "It replaces the real claim with a weaker one."],
    ["What is begging the question?", "Assuming the conclusion among the premises", ["Asking a rhetorical question", "Changing the subject", "Appealing to authority"], "The argument's premise already contains its conclusion."],
    ["What is Occam's razor?", "Prefer the explanation with fewer assumptions", ["Prefer the newest explanation", "Prefer the most popular explanation", "Prefer the simplest conclusion to be true"], "It is a heuristic for theory choice, not proof."],
    ["What is a social contract theory?", "Political authority derives from agreement among people", ["Authority derives from divine right", "Authority derives from force alone", "Authority derives from tradition alone"], "Hobbes, Locke and Rousseau argue from agreement."],
    ["What is dualism in philosophy of mind?", "Mind and body are distinct kinds of thing", ["Only matter exists", "Only minds exist", "Mind is identical to behaviour"], "Descartes held a substance dualism."],
    ["What is existentialism's central claim?", "People create meaning through choices in an absurd world", ["Meaning is fixed by nature", "Reason alone determines ethics", "History follows laws"], "Sartre argues existence precedes essence."]
  ].map(function (fact) { return normaliseFact(fact, ["philosophy"]); });

  const STAGE = [
    ["What is blocking in theatre?", "The planned movement and positioning of actors", ["The order of the play's scenes", "The lighting design", "The rehearsal schedule"], "Blocking fixes where actors move and stand."],
    ["What is a soliloquy?", "A speech revealing a character's thoughts while alone on stage", ["A conversation between two characters", "A song in a musical", "A stage direction"], "The character speaks their private thoughts aloud."],
    ["What is dramatic irony?", "When the audience knows something a character does not", ["When a character lies to another character", "When the ending is happy", "When the play has no narrator"], "The gap between audience knowledge and character knowledge creates the effect."],
    ["What is a thrust stage?", "A stage with the audience on three sides", ["A stage with a proscenium arch", "A stage in the round", "A raised platform at the back"], "A thrust projects into the auditorium."],
    ["What is the fourth wall?", "The invisible boundary between performers and the audience", ["The back wall of the set", "The curtain line", "The lighting bar"], "Acknowledging the audience breaks the fourth wall."],
    ["What is a cue in theatre?", "A signal for a line, action or technical change", ["A type of costume", "A seating area", "A rehearsal warm-up"], "Cues synchronise performance and crew."],
    ["What does a dramaturg do?", "Researches script, context and production ideas", ["Operates the lighting desk", "Sells the tickets", "Builds the set"], "Dramaturgs support textual and contextual work."],
    ["What is diegetic sound in film?", "Sound that originates within the story world", ["Music only the audience hears", "Narration added in post", "Sound recorded off set"], "A radio in the scene is diegetic; a score is not."],
    ["What does mise-en-scene cover?", "Everything placed within the frame", ["Only the dialogue", "Only the editing", "Only the soundtrack"], "Setting, costume, lighting and staging all belong to it."],
    ["What is a jump cut?", "An abrupt cut between shots of similar framing", ["A slow dissolve", "A cut to black", "A match cut on movement"], "The discontinuity of time or position is deliberate."],
    ["What is a storyboard?", "A shot-by-shot visual plan", ["A script revision", "A lighting diagram", "A budget sheet"], "Storyboards plan framing and action before shooting."],
    ["What is cross-cutting?", "Alternating between two actions happening at the same time", ["Cutting to a flashback", "Cutting on a musical beat", "Cutting to a title card"], "Cross-cutting builds comparison or tension."],
    ["What does a gaffer do?", "Runs the lighting department", ["Operates the camera", "Edits the film", "Manages the budget"], "The gaffer executes the cinematographer's lighting plan."],
    ["What is a montage?", "A sequence of short shots compressing time or meaning", ["A single long take", "A silent scene", "A closing credit roll"], "Montage condenses action into a brief sequence."],
    ["In dance, what is a canon?", "The same movement performed by dancers in sequence", ["All dancers moving in unison", "A solo performed in silence", "A repeated floor pattern"], "A canon staggers the same phrase across dancers."],
    ["What is a leitmotif in film music?", "A recurring theme associated with a character or idea", ["A song played over the credits", "A temporary scratch track", "A type of microphone"], "Leitmotifs link music to narrative meaning."]
  ].map(function (fact) { return normaliseFact(fact, ["theatre and film"]); });

  const CS_FACTS = [
    ["What does CPU stand for?", "Central Processing Unit", ["Computer Personal Unit", "Central Program Utility", "Control Processing User"], "The CPU executes instructions and coordinates other components."],
    ["What is the binary representation of decimal 5?", "101", ["111", "100", "110"], "4 + 1 = 5, so the bits are 101."],
    ["Which data structure uses first-in, first-out order?", "Queue", ["Stack", "Tree", "Graph"], "A queue removes the oldest item first."],
    ["What does an array index of 0 mean?", "The first element", ["The last element", "An empty array", "An error"], "Many languages use zero-based indexing."],
    ["What is the time complexity of binary search on a sorted array?", "O(log n)", ["O(n)", "O(n²)", "O(1)"], "Each comparison halves the search space."],
    ["Which principle gives users only the access they need?", "Least privilege", ["Open access", "Fail open", "Security through obscurity"], "Least privilege limits the damage from a compromised account."],
    ["What does HTTPS add to HTTP?", "Encryption and authentication", ["Faster downloads", "Larger files", "A database"], "TLS protects data in transit and authenticates the server."],
    ["What is a variable in programming?", "A named storage location", ["A fixed constant", "A type of loop", "A network protocol"], "Variables hold values that can change."],
    ["Which sorting algorithm repeatedly selects the smallest remaining item?", "Selection sort", ["Merge sort", "Quick sort", "Bubble sort"], "Selection sort finds the minimum and places it next."],
    ["What is a function?", "A reusable block of code that performs a task", ["A hardware component", "A database table", "A network cable"], "Functions package behaviour behind a name."],
    ["What does SQL primarily manage?", "Relational data", ["Images", "Network routing", "Operating systems"], "SQL queries and manipulates relational databases."],
    ["What is a hash function used for?", "Mapping data to a fixed-size value", ["Encrypting every message", "Rendering graphics", "Compiling code"], "Hashes support lookup, integrity checks and signatures."],
    ["What is a bug?", "An error in a program", ["A feature", "A type of hardware", "A secure protocol"], "Bugs cause incorrect or unexpected behaviour."],
    ["Which protocol resolves domain names to IP addresses?", "DNS", ["FTP", "SMTP", "SSH"], "DNS translates names such as example.com into addresses."],
    ["What is the purpose of version control?", "Track changes to files over time", ["Speed up the CPU", "Encrypt the disk", "Design user interfaces"], "Version control records history and supports collaboration."],
    ["What is an API?", "A defined interface for software to interact", ["A physical port", "A database engine", "A programming language"], "APIs specify requests, responses and contracts."],
    ["What is a loop used for?", "Repeating instructions", ["Storing constants", "Encrypting data", "Drawing pixels only"], "Loops repeat a block while a condition holds."],
    ["What does a firewall do?", "Filter network traffic", ["Compile code", "Store files", "Render fonts"], "Firewalls allow or block traffic according to rules."],
    ["What is phishing?", "A deceptive attempt to steal credentials or install malware", ["A network cable", "A type of encryption", "A backup strategy"], "Phishing targets people through convincing messages."],
    ["What is the cloud?", "Remote computing and storage accessed over a network", ["A weather system", "A local hard drive", "A programming language"], "Cloud services run on provider infrastructure."]
  ].map(function (fact) { return normaliseFact(fact, ["computer science"]); });

  const ENGLISH = [
    ["Which sentence uses the active voice?", "The committee approved the plan.", ["The plan was approved by the committee.", "The plan had been approved.", "The plan is being approved."], "In active voice the subject performs the action."],
    ["Which sentence is a fragment?", "Because the team revised the report.", ["The team revised the report.", "The report was revised.", "The team met after lunch."], "A fragment lacks an independent clause."],
    ["Which punctuation joins two independent clauses correctly?", "; however,", [", however,", " however,", "; however"], "Use a semicolon before the conjunctive adverb and a comma after it."],
    ["Which sentence uses commas correctly?", "She bought apples, pears, and figs.", ["She bought apples pears and figs.", "She bought, apples, pears, and figs.", "She bought apples, pears and, figs."], "Commas separate items in a series."],
    ["Which word is the subject of the sentence 'The list of names is long'?", "list", ["names", "long", "The"], "The head noun of the subject is 'list'."],
    ["Which sentence is most concise?", "The team met to discuss the budget.", ["The team met in order to discuss the budget.", "The team met for the purpose of discussing the budget.", "The team held a meeting for the discussion of the budget."], "Prefer the shortest version that preserves meaning."],
    ["Which pronoun correctly completes 'Between you and ___, the choice is difficult'?", "me", ["I", "myself", "mine"], "A pronoun after a preposition takes the object form."],
    ["Which is a complete sentence?", "The rain stopped.", ["After the rain stopped.", "Stopping the rain.", "The rain, which stopped."], "Only the first option has an independent clause."],
    ["Which sentence uses a semicolon correctly?", "The rain stopped; we continued the hike.", ["The rain stopped, we continued the hike.", "The rain stopped we continued the hike.", "The rain stopped, and we continued, the hike."], "A semicolon can join two independent clauses."],
    ["Which word is an adjective in 'The quiet library was warm'?", "quiet", ["library", "was", "warm"], "Adjectives modify nouns."],
    ["Which sentence uses the past perfect correctly?", "By the time we arrived, the film had started.", ["By the time we arrived, the film has started.", "By the time we arrived, the film starts.", "By the time we arrived, the film start."], "Past perfect marks an earlier past action."],
    ["What is the purpose of a thesis statement?", "To state the central claim of an essay", ["To list every source", "To define every word", "To conclude the essay"], "A thesis guides the argument."],
    ["Which sentence avoids a dangling modifier?", "Walking to the station, Maya noticed the clouds.", ["Walking to the station, the clouds were noticed.", "Walking to the station, the rain began.", "Walking to the station, the train was missed."], "The opening phrase must describe the subject of the main clause."],
    ["Which word is a conjunction in 'We waited because the train was late'?", "because", ["waited", "train", "late"], "Conjunctions connect clauses or words."],
    ["What is tone?", "The author's attitude toward the subject", ["The length of a sentence", "The number of paragraphs", "The source's publication date"], "Tone is conveyed through word choice and detail."],
    ["Which sentence uses a colon correctly?", "She packed three things: a notebook, a pen, and a ruler.", ["She packed three things; a notebook, a pen, and a ruler.", "She packed three things, a notebook, a pen, and a ruler.", "She packed: three things a notebook, a pen, and a ruler."], "A colon introduces a list after a complete clause."],
    ["Which is the best revision of 'The reason is because it rained'?", "The reason is that it rained.", ["The reason is because it rained.", "The reason is due to rain.", "The reason is being it rained."], "Avoid the redundant 'reason is because'."],
    ["Which sentence uses parallel structure?", "The course teaches drafting, revising, and editing.", ["The course teaches drafting, revising, and to edit.", "The course teaches drafting, to revise, and editing.", "The course teaches to draft, revising, and editing."], "Items in a list should share grammatical form."],
    ["Which sentence is a run-on?", "The rain stopped we continued the hike.", ["The rain stopped; we continued the hike.", "The rain stopped, and we continued the hike.", "The rain stopped. We continued the hike."], "Two independent clauses need punctuation or a conjunction."],
    ["Which word is a pronoun in 'She gave him the book'?", "She", ["gave", "book", "the"], "Pronouns stand in for nouns."]
  ].map(function (fact) { return normaliseFact(fact, ["English"]); });

  const RESEARCH = [
    ["What is a controlled variable?", "A factor kept the same across trials", ["The factor changed", "The factor measured", "A random error"], "Control variables make comparisons fair."],
    ["What is random assignment used for?", "Reducing confounding between groups", ["Increasing the sample size", "Making the study cheaper", "Guaranteeing a positive result"], "Random assignment balances unknown differences."],
    ["What is reliability?", "Consistency of a measurement", ["Accuracy of a claim", "Size of a sample", "Popularity of a study"], "Reliable measures produce similar results on repeat."],
    ["What is validity?", "Whether a measure or design supports the intended claim", ["Whether a measure is consistent", "Whether a sample is large", "Whether a result is statistically significant"], "Validity concerns accuracy and inference."],
    ["What is a confounding variable?", "An alternative explanation for an observed relationship", ["A variable held constant", "The dependent variable", "A random error"], "Confounders can create spurious associations."],
    ["What is a null hypothesis?", "A statement of no effect or no relationship", ["The expected result", "The research question", "A proven conclusion"], "Null hypotheses are tested against data."],
    ["What is a p-value?", "The probability of data at least as extreme if the null hypothesis were true", ["The probability the hypothesis is true", "The size of the effect", "The sample mean"], "A p-value is not the probability that the null is true."],
    ["What is generalizability?", "The extent to which findings apply beyond the sample", ["The consistency of a measure", "The size of a dataset", "The number of variables"], "Random sampling supports generalizability."],
    ["What is an observational study?", "A study that observes without manipulating the independent variable", ["A randomized experiment", "A laboratory assay", "A meta-analysis"], "Observational studies can show association, not causation."],
    ["What is a literature review for?", "Situating a study in existing evidence", ["Replacing the methods section", "Collecting data", "Proving a hypothesis"], "Reviews identify gaps and justify the research."],
    ["What is informed consent?", "Voluntary agreement after understanding risks and benefits", ["A signed contract for payment", "A court order", "A random selection"], "Consent protects autonomy."],
    ["What is an operational definition?", "A precise description of how a variable is measured", ["A dictionary definition", "A theoretical claim", "A research question"], "Operational definitions make replication possible."],
    ["What is replication?", "Repeating a study to check the result", ["Copying a paper", "Changing the hypothesis", "Increasing the sample"], "Replication strengthens confidence."],
    ["What is selection bias?", "A sample that differs systematically from the population", ["A random error", "A measurement error", "A statistical test"], "Non-random selection can distort estimates."]
  ].map(function (fact) { return normaliseFact(fact, ["research"]); });

  const FINANCE = [
    ["What is compound interest?", "Interest earned on principal and previously earned interest", ["A one-time fee", "A tax on savings", "Interest paid only on the principal"], "Compounding grows the balance over time."],
    ["What is a budget?", "A plan for income and expenses", ["A type of loan", "A credit score", "A tax form"], "Budgets allocate money to priorities."],
    ["What is an emergency fund?", "Savings for unexpected expenses", ["A retirement account", "A stock portfolio", "A credit card limit"], "It reduces reliance on high-interest debt."],
    ["What does APR stand for?", "Annual Percentage Rate", ["Annual Payment Record", "Automatic Payment Rate", "Adjusted Principal Return"], "APR expresses the yearly cost of borrowing."],
    ["What is diversification?", "Spreading investments to reduce risk", ["Putting all money in one stock", "Borrowing more", "Closing an account"], "Different assets do not move identically."],
    ["What is a credit score?", "A number summarizing creditworthiness", ["A bank balance", "A tax rate", "A stock price"], "Scores reflect borrowing and repayment history."],
    ["What is the difference between a need and a want?", "Needs are essential; wants are optional", ["Needs are expensive; wants are cheap", "Needs are taxed; wants are not", "There is no difference"], "Prioritizing needs protects essentials."],
    ["What is inflation?", "A general rise in prices", ["A fall in wages", "A rise in unemployment only", "A tax on imports"], "Inflation reduces purchasing power."],
    ["What is a deductible?", "The amount paid before insurance covers a claim", ["A monthly premium", "A tax credit", "A savings rate"], "Higher deductibles usually lower premiums."],
    ["What is the time value of money?", "Money available now is worth more than the same amount later", ["Money loses value when saved", "Interest is always negative", "Cash cannot be invested"], "Earlier money can earn a return."],
    ["What is a mutual fund?", "A pooled investment managed for many investors", ["A single stock", "A bank loan", "A tax refund"], "Funds spread risk across many holdings."],
    ["What is net worth?", "Assets minus liabilities", ["Income minus taxes", "Savings plus debt", "Monthly expenses"], "Net worth measures financial position."],
    ["What is a fixed expense?", "A cost that stays roughly the same each month", ["A cost that changes with usage", "A one-time purchase", "An unexpected bill"], "Rent and insurance are common fixed expenses."],
    ["What is liquidity?", "How easily an asset can be converted to cash", ["The interest rate on a loan", "The value of a stock", "The length of an investment"], "Cash is highly liquid; a house is not."],
    ["What is a tax deduction?", "An expense that reduces taxable income", ["A tax payment", "A tax refund", "A penalty"], "Deductions lower the income on which tax is calculated."]
  ].map(function (fact) { return normaliseFact(fact, ["finance"]); });


  /* --------------------------------------------------------------------------
     Classification
     -------------------------------------------------------------------------- */

  function classify(subject) {
    const text = (subject.id + " " + subject.title + " " + (subject.tags || []).join(" ")).toLowerCase();
    const nameText = (subject.id + " " + subject.title).toLowerCase();
    if (subject.id === "english-language") return "english";
    if (/finance|financial|business/.test(text)) return "finance";
    if (/research methods|research/.test(text) && !/research science/.test(text)) return "research";
    if (/cyber|network|computer|programming|algorithm|coding/.test(text)) return "cs";
    if (/literature/.test(nameText)) return "concept";
    if (/korean|russian|italian|hebrew|spanish|french|german|portuguese|hindi|chinese|mandarin|japanese|arabic|latin/.test(nameText)) return "language";
    /* Keep disciplines apart: a music course must not draw art-history facts. */
    if (/music|ear training|orchestr|conduct|harmony|counterpoint|ethnomusic|acoustics|audio engineering|music production/.test(nameText)) return "music";
    if (/theat|theater|drama|acting|film|cinema|screenwriting|dance|choreograph|animation|media studies/.test(nameText)) return "stage";
    if (/writing|journalism|rhetoric/.test(nameText)) return "english";
    if (/\bart\b|\barts\b|drawing|design|photograph|sculpture|ceramics|architecture|illustration|fashion/.test(text)) return "arts";
    if (/philosoph|ethic|epistemolog|metaphys/.test(nameText)) return "philosophy";
    if (/quantum|relativity|nuclear/.test(nameText)) return "physics";
    if (/\bphysics\b/.test(text)) return "physics";
    if (/calculus/.test(text)) return "calculus";
    if (/statistic|probability|data science|data analysis/.test(text)) return "data";
    if (/algebra|geometry|trigonometry|precalculus|mathematics|math|linear|discrete/.test(text)) return "math";
    if (/history|government|economic|psychology|sociology|political|geography|civics|social|studies/.test(text)) return "social";
    if (/biology|chemistry|astronomy|anatomy|microbiology|environmental|science|engineering/.test(text)) return "science";
    if (/english|literature|writing|reading|seminar/.test(text)) return "english";
    return "generic";
  }

  function poolFor(domain) {
    if (domain === "science") return SCIENCE;
    if (domain === "social") return SOCIAL;
    if (domain === "arts") return ARTS;
    if (domain === "music") return MUSIC;
    if (domain === "stage") return STAGE;
    if (domain === "philosophy") return PHILOSOPHY;
    if (domain === "cs") return CS_FACTS;
    if (domain === "english") return ENGLISH;
    if (domain === "research") return RESEARCH;
    if (domain === "finance") return FINANCE;
    if (domain === "language") return VOCAB;
    return ENGLISH.concat(SCIENCE, SOCIAL);
  }

  /* --------------------------------------------------------------------------
     Numeric generators
     -------------------------------------------------------------------------- */

  function mathFamilies(subject) {
    if (subject.id === "calculus" || /calculus/.test(subject.title.toLowerCase())) return CALCULUS;
    if (/geometry|trigonometry/.test(subject.id + " " + subject.title.toLowerCase())) return CONTENT.MATH_GEO || CONTENT.MATH_ALL || MATH_FALLBACK;
    if (/statistic|probability|data science/.test(subject.id + " " + subject.title.toLowerCase())) return CONTENT.MATH_DATA || CONTENT.MATH_ALL || MATH_FALLBACK;
    if (/algebra|precalculus/.test(subject.id + " " + subject.title.toLowerCase())) return CONTENT.MATH_ADV || CONTENT.MATH_ALL || MATH_FALLBACK;
    return CONTENT.MATH_ALL || MATH_FALLBACK;
  }

  function linear(random) {
    const a = ri(random, 2, 9), x = ri(random, 2, 16), b = ri(random, 1, 20);
    return { prompt: "Solve for x: " + a + "x + " + b + " = " + (a * x + b) + ".", correct: x, wrongs: [x + 1, x - 1, x + 2], hint: "Subtract the constant, then divide by the coefficient.", explanation: ["Subtract " + b + " from both sides.", "Divide by " + a + " to get x = " + x + "."], tags: ["algebra"] };
  }

  function percent(random) {
    const price = ri(random, 4, 20) * 10, discount = pick(random, [10, 20, 25, 30]);
    return { prompt: "A " + price + " dollar item is discounted by " + discount + "%. What is the sale price?", correct: price * (1 - discount / 100), wrongs: [price - discount, price * (1 + discount / 100), price * discount / 100], hint: "Pay the complement of the discount.", explanation: ["The customer pays " + (100 - discount) + "% of the price.", price + " × " + (1 - discount / 100) + " = " + (price * (1 - discount / 100)) + "."], tags: ["percent"] };
  }

  function ratio(random) {
    const a = ri(random, 2, 5), b = ri(random, 2, 5), total = (a + b) * ri(random, 3, 10);
    const larger = Math.max((total * a) / (a + b), (total * b) / (a + b));
    return { prompt: "A " + total + "-item group is split in the ratio " + a + ":" + b + ". What is the larger share?", correct: larger, wrongs: [(total * a) / (a + b), (total * b) / (a + b), total / 2], hint: "Add the ratio parts and give each part its fraction.", explanation: ["There are " + (a + b) + " parts.", "The larger share is " + larger + "."], tags: ["ratios"] };
  }

  function probability(random) {
    const red = ri(random, 2, 7), blue = ri(random, 2, 8);
    return { prompt: "A bag has " + red + " red and " + blue + " blue marbles. What is the probability of red?", correct: red + "/" + (red + blue), wrongs: [blue + "/" + (red + blue), red + "/" + blue, (red + blue) + "/" + red], hint: "Favorable outcomes over total outcomes.", explanation: ["Favorable = " + red + ", total = " + (red + blue) + "."], tags: ["probability"] };
  }

  function mean(random) {
    const values = [ri(random, 2, 15), ri(random, 2, 15), ri(random, 2, 15), ri(random, 2, 15)];
    const last = ri(random, 2, 15);
    values.push(last);
    const total = values.reduce(function (a, b) { return a + b; }, 0);
    return { prompt: "What is the mean of " + values.join(", ") + "?", correct: total / 5, wrongs: [total / 4, total / 5 + 1, Math.max.apply(null, values)], hint: "Add and divide by the number of values.", explanation: ["Sum = " + total + ".", "Divide by 5 to get " + (total / 5) + "."], tags: ["statistics"] };
  }

  function rectangle(random) {
    const width = ri(random, 3, 12), height = ri(random, 4, 15);
    return { prompt: "A rectangle is " + width + " cm by " + height + " cm. What is its area?", correct: width * height + " cm²", wrongs: [2 * (width + height) + " cm²", width + height + " cm²", width * height + " cm"], hint: "Area = length × width.", explanation: [width + " × " + height + " = " + (width * height) + " cm²."], tags: ["geometry"] };
  }

  function slope(random) {
    const x1 = ri(random, 1, 6), dx = ri(random, 2, 6), m = ri(random, 2, 6), y1 = ri(random, 1, 10);
    return { prompt: "What is the slope through (" + x1 + ", " + y1 + ") and (" + (x1 + dx) + ", " + (y1 + m * dx) + ")?", correct: m, wrongs: [-m, m + 1, 1 / m], hint: "Change in y over change in x.", explanation: ["The rise is " + (m * dx) + " and the run is " + dx + "."], tags: ["slope"] };
  }

  function quadratic(random) {
    const r1 = ri(random, 1, 6), r2 = ri(random, 7, 12);
    return { prompt: "The equation (x - " + r1 + ")(x - " + r2 + ") = 0 has which solutions?", correct: "x = " + r1 + " or x = " + r2, wrongs: ["x = -" + r1 + " or x = -" + r2, "x = " + (r1 + r2) + " only", "x = " + (r2 - r1) + " only"], hint: "A product is zero when either factor is zero.", explanation: ["Set each factor to zero.", "x = " + r1 + " or x = " + r2 + "."], tags: ["quadratics"] };
  }

  function derivative(random) {
    const a = ri(random, 2, 9), n = ri(random, 2, 5);
    return { prompt: "What is the derivative of " + a + "x^" + n + "?", correct: (a * n) + "x^" + (n - 1), wrongs: [a + "x^" + (n - 1), (a * n) + "x^" + n, (a / n) + "x^" + (n + 1)], hint: "Use the power rule: d/dx ax^n = anx^(n-1).", explanation: ["Multiply by the exponent.", "Subtract one from the exponent."], tags: ["derivatives"] };
  }

  function integral(random) {
    const a = ri(random, 2, 8), n = ri(random, 1, 4);
    return { prompt: "What is the integral of " + a + "x^" + n + " dx?", correct: (a / (n + 1)) + "x^" + (n + 1) + " + C", wrongs: [(a * n) + "x^" + (n - 1) + " + C", a + "x^" + (n + 1) + " + C", (a / n) + "x^" + n + " + C"], hint: "Add one to the exponent and divide by the new exponent.", explanation: ["Increase the exponent by one.", "Divide by " + (n + 1) + "."], tags: ["integrals"] };
  }

  function limit(random) {
    const a = ri(random, 2, 6), b = ri(random, 1, 8);
    return { prompt: "What is lim x→" + a + " of (" + b + "x + " + a + ")?", correct: b * a + a, wrongs: [b + a, b * a, a * a], hint: "A polynomial is continuous, so substitute the limit point.", explanation: ["Substitute x = " + a + ".", "The value is " + (b * a + a) + "."], tags: ["limits"] };
  }

  function chain(random) {
    const a = ri(random, 2, 5), b = ri(random, 2, 6);
    return { prompt: "What is the derivative of (" + a + "x + " + b + ")^3?", correct: "3(" + a + "x + " + b + ")^2 × " + a, wrongs: ["3(" + a + "x + " + b + ")^2", a + "(" + a + "x + " + b + ")^2", "3(" + a + "x + " + b + ")^3"], hint: "Use the chain rule: outer derivative times inner derivative.", explanation: ["The outer derivative is 3(... )².", "The inner derivative is " + a + "."], tags: ["chain rule"] };
  }

  function definite(random) {
    const a = ri(random, 1, 3), b = a + ri(random, 1, 3);
    return { prompt: "What is the definite integral of 2x from " + a + " to " + b + "?", correct: b * b - a * a, wrongs: [b - a, b * b + a * a, 2 * (b - a)], hint: "The antiderivative of 2x is x².", explanation: ["Evaluate x² at the bounds.", b + "² - " + a + "² = " + (b * b - a * a) + "."], tags: ["definite integrals"] };
  }

  const MATH_FALLBACK = [linear, percent, ratio, probability, mean, rectangle, slope, quadratic];
  const CALCULUS = [derivative, integral, limit, chain, definite, slope];

  function physicsQuestion(random, index) {
    const family = index % 8;
    if (family === 0) {
      const d = ri(random, 20, 120), t = ri(random, 2, 8);
      return { prompt: "A car travels " + d + " m in " + t + " s. What is its average speed?", correct: (d / t).toFixed(1) + " m/s", wrongs: [(d * t) + " m/s", (t / d).toFixed(2) + " m/s", (d + t) + " m/s"], hint: "Speed = distance / time.", explanation: [d + " ÷ " + t + " = " + (d / t).toFixed(1) + " m/s."], tags: ["kinematics"] };
    }
    if (family === 1) {
      const m = ri(random, 2, 20), a = ri(random, 2, 6);
      return { prompt: "What force is needed to accelerate a " + m + " kg object at " + a + " m/s²?", correct: m * a + " N", wrongs: [m + a + " N", (m / a).toFixed(1) + " N", (a / m).toFixed(1) + " N"], hint: "F = ma.", explanation: [m + " × " + a + " = " + (m * a) + " N."], tags: ["forces"] };
    }
    if (family === 2) {
      const f = ri(random, 10, 80), d = ri(random, 2, 10);
      return { prompt: "How much work is done by a " + f + " N force over " + d + " m?", correct: f * d + " J", wrongs: [f + d + " J", (f / d).toFixed(1) + " J", (f * d) / 2 + " J"], hint: "Work = force × distance.", explanation: [f + " × " + d + " = " + (f * d) + " J."], tags: ["work"] };
    }
    if (family === 3) {
      const w = ri(random, 20, 100), t = ri(random, 2, 8);
      return { prompt: "What power is used to do " + w + " J of work in " + t + " s?", correct: (w / t).toFixed(1) + " W", wrongs: [w * t + " W", (t / w).toFixed(2) + " W", w + t + " W"], hint: "Power = work / time.", explanation: [w + " ÷ " + t + " = " + (w / t).toFixed(1) + " W."], tags: ["power"] };
    }
    if (family === 4) {
      const m = ri(random, 2, 20), v = ri(random, 1, 8);
      return { prompt: "What is the density of a " + m + " g object with volume " + v + " cm³?", correct: (m / v).toFixed(2) + " g/cm³", wrongs: [(m * v) + " g/cm³", (v / m).toFixed(2) + " g/cm³", m + v + " g/cm³"], hint: "Density = mass / volume.", explanation: [m + " ÷ " + v + " = " + (m / v).toFixed(2) + " g/cm³."], tags: ["density"] };
    }
    if (family === 5) {
      const i = ri(random, 1, 6), r = ri(random, 2, 12);
      return { prompt: "What voltage is needed to drive " + i + " A through " + r + " Ω?", correct: i * r + " V", wrongs: [i + r + " V", (r / i).toFixed(1) + " V", (i / r).toFixed(2) + " V"], hint: "Ohm's law: V = IR.", explanation: [i + " × " + r + " = " + (i * r) + " V."], tags: ["circuits"] };
    }
    if (family === 6) {
      const f = ri(random, 2, 12), lambda = ri(random, 2, 10);
      return { prompt: "A wave has frequency " + f + " Hz and wavelength " + lambda + " m. What is its speed?", correct: f * lambda + " m/s", wrongs: [f + lambda + " m/s", (f / lambda).toFixed(1) + " m/s", (lambda / f).toFixed(1) + " m/s"], hint: "Wave speed = frequency × wavelength.", explanation: [f + " × " + lambda + " = " + (f * lambda) + " m/s."], tags: ["waves"] };
    }
    const m = ri(random, 2, 12), v = ri(random, 2, 9);
    return { prompt: "What is the kinetic energy of a " + m + " kg object moving at " + v + " m/s?", correct: (0.5 * m * v * v) + " J", wrongs: [m * v + " J", (m * v * v) + " J", (0.5 * m * v) + " J"], hint: "KE = ½mv².", explanation: ["Square the speed, multiply by mass, then halve."], tags: ["energy"] };
  }

  function csQuestion(random, index) {
    const family = index % 8;
    if (family === 0) {
      const values = [ri(random, 1, 7), ri(random, 0, 1), ri(random, 0, 1), ri(random, 0, 1)];
      const decimal = values[0] * 8 + values[1] * 4 + values[2] * 2 + values[3];
      return { prompt: "What is the decimal value of binary " + values.join("") + "?", correct: decimal, wrongs: [decimal + 1, decimal - 1, decimal + 4], hint: "Use place values 8, 4, 2 and 1.", explanation: [values.join("") + " = " + decimal + "."], tags: ["binary"] };
    }
    if (family === 1) {
      const n = ri(random, 1, 15);
      return { prompt: "Which binary string represents decimal " + n + "?", correct: n.toString(2).padStart(4, "0"), wrongs: [(n + 1).toString(2).padStart(4, "0"), (n - 1).toString(2).padStart(4, "0"), (n + 4).toString(2).padStart(4, "0")], hint: "Convert by repeatedly dividing by 2.", explanation: [n + " in binary is " + n.toString(2) + "."], tags: ["binary"] };
    }
    if (family === 2) {
      const a = ri(random, 5, 30), b = ri(random, 3, 9);
      return { prompt: "What is " + a + " mod " + b + "?", correct: a % b, wrongs: [(a % b) + 1, Math.floor(a / b), b], hint: "The modulus is the remainder after division.", explanation: [a + " ÷ " + b + " leaves remainder " + (a % b) + "."], tags: ["modulo"] };
    }
    if (family === 3) {
      const values = [true, false, true, false];
      const a = values[ri(random, 0, 1)], b = values[ri(random, 2, 3)];
      return { prompt: "What is " + a + " AND " + b + "?", correct: String(a && b), wrongs: [String(a || b), String(!a), String(!b)], hint: "AND is true only when both inputs are true.", explanation: ["AND requires both operands to be true."], tags: ["boolean logic"] };
    }
    if (family === 4) {
      const index = ri(random, 0, 5);
      return { prompt: "In a zero-based array, which index holds the " + (index + 1) + "th element?", correct: index, wrongs: [index + 1, index - 1, index + 2], hint: "Zero-based arrays start counting at 0.", explanation: ["The first element is at index 0, so the " + (index + 1) + "th is at index " + index + "."], tags: ["arrays"] };
    }
    if (family === 5) {
      const options = ["O(n)", "O(n²)", "O(1)"];
      return { prompt: "What is the time complexity of binary search on a sorted array?", correct: "O(log n)", wrongs: options, hint: "Each step halves the search space.", explanation: ["Halving repeatedly is logarithmic."], tags: ["algorithms"] };
    }
    if (family === 6) {
      const fact = pick(random, CS_FACTS);
      return { prompt: fact.prompt, correct: fact.correct, wrongs: fact.wrongs, hint: "Recall the core definition and eliminate unrelated terms.", explanation: [fact.explanation], tags: fact.tags };
    }
    const fact = pick(random, CS_FACTS);
    return { prompt: "Which statement is accurate in computing? \"" + fact.explanation + "\"", correct: fact.correct, wrongs: fact.wrongs, hint: "Match the definition to the correct term.", explanation: [fact.explanation], tags: fact.tags };
  }

  /* --------------------------------------------------------------------------
     Generic seeded generator
     -------------------------------------------------------------------------- */

  function seedFacts(subject) {
    return (subject._seedQuestions || subject.questions).map(function (question) {
      return {
        prompt: question.prompt,
        correct: question.options[question.answer],
        wrongs: question.options.filter(function (option, index) { return index !== question.answer; }),
        explanation: (question.explanation && question.explanation[0]) || question.hint || "Review the key idea.",
        tags: question.tags || [subject.title]
      };
    });
  }

  function poolQuestion(subject, index, pool, seedList) {
    const fact = pool.length ? pool[index % pool.length] : seedList[index % seedList.length];
    const seed = seedList[index % seedList.length];
    const mode = Math.floor(index / (pool.length || seedList.length || 1)) % 6;
    const topic = (fact.tags && fact.tags[0]) || subject.title;
    if (mode === 0 && pool.length) {
      return { prompt: fact.prompt, correct: fact.correct, wrongs: fact.wrongs, hint: "Recall the definition and eliminate choices that belong to another concept.", explanation: [fact.explanation], tags: [subject.title].concat(fact.tags || []) };
    }
    if (mode === 1 && pool.length) {
      const wrongs = pool.filter(function (item) { return item !== fact; }).slice(0, 3).map(function (item) { return item.explanation; });
      return { prompt: "Which statement about " + topic + " is most accurate?", correct: fact.explanation, wrongs: wrongs, hint: "Choose the statement that is true for this topic, not merely related to the subject.", explanation: ["The other statements describe different concepts."], tags: [subject.title].concat(fact.tags || []) };
    }
    if (mode === 2 && pool.length) {
      const wrongs = pool.filter(function (item) { return item !== fact; }).slice(0, 3).map(function (item) { return item.correct; });
      return { prompt: "Which term best matches this description? " + fact.explanation, correct: fact.correct, wrongs: wrongs, hint: "Match the description to the term, not to the subject title.", explanation: ["The description defines " + fact.correct + "."], tags: [subject.title].concat(fact.tags || []) };
    }
    if (mode === 3 && pool.length) {
      const wrongs = pool.filter(function (item) { return item !== fact; }).slice(0, 3).map(function (item) { return item.explanation; });
      return { prompt: "Which statement about " + topic + " is correct?", correct: fact.explanation, wrongs: wrongs, hint: "Check the claim against the definition, not just the topic name.", explanation: [fact.explanation], tags: [subject.title].concat(fact.tags || []) };
    }
    if (mode === 4 && pool.length) {
      const wrongs = pool.filter(function (item) { return item !== fact; }).slice(0, 3).map(function (item) { return item.correct; });
      return { prompt: "Which term belongs with " + topic + "?", correct: fact.correct, wrongs: wrongs, hint: "Match the term to its topic rather than to a neighbouring field.", explanation: [fact.explanation], tags: [subject.title].concat(fact.tags || []) };
    }
    if (mode === 5 && pool.length) {
      const wrongs = pool.filter(function (item) { return item !== fact; }).slice(0, 3).map(function (item) { return item.correct; });
      return { prompt: "Which choice matches this description? \"" + fact.explanation + "\"", correct: fact.correct, wrongs: wrongs, hint: "Use the description to identify the term.", explanation: [fact.explanation], tags: [subject.title].concat(fact.tags || []) };
    }
    if (mode === 3) {
      const wrongs = pool.slice(0, 3).map(function (item) { return item.explanation; });
      return { prompt: "A student is reviewing " + subject.title + ". Which claim is correct?", correct: seed.explanation, wrongs: wrongs, hint: "Use the curated course idea rather than a generic statement.", explanation: ["This claim comes from the subject's curated study material."], tags: [subject.title].concat(seed.tags || []) };
    }
    if (mode === 4) {
      return { prompt: seed.prompt, correct: seed.correct, wrongs: seed.wrongs, hint: "Return to the core definition and check each option.", explanation: [seed.explanation], tags: [subject.title].concat(seed.tags || []) };
    }
    const wrongs = pool.slice(0, 3).map(function (item) { return item.correct; });
    return { prompt: "Which choice is most closely associated with " + subject.title + "?", correct: seed.correct, wrongs: wrongs, hint: "Choose the term that belongs to this subject rather than a neighbouring field.", explanation: ["This is a core idea from " + subject.title + "."], tags: [subject.title].concat(seed.tags || []) };
  }

  /* --------------------------------------------------------------------------
     Concept generator for specialised subjects
     -------------------------------------------------------------------------- */

  function pickConcepts(pool, correct, seed, count) {
    const result = [];
    if (!pool.length) return result;
    let cursor = Math.abs(seed) % pool.length;
    for (let step = 0; step < pool.length * 2 && result.length < count; step += 1) {
      const candidate = pool[cursor % pool.length];
      cursor += 1;
      if (candidate && candidate !== correct && result.indexOf(candidate) < 0) result.push(candidate);
    }
    return result;
  }

  function conceptQuestion(subject, index) {
    const terms = (subject._terms || [subject.title]).filter(Boolean);
    const peerTerms = subject._peerTerms || [];
    const peerTitles = subject._peerTitles || [];
    const term = terms[index % terms.length];
    const companion = terms[(index + 1) % terms.length];
    const modes = subject._conceptModes || [0, 1, 2, 3, 4, 5];
    const mode = modes[Math.floor(index / terms.length) % modes.length];
    const wrongTerms = pickConcepts(peerTerms, term, index * 7 + 3, 5);
    const wrongTitles = pickConcepts(peerTitles, subject.title, index * 5 + 1, 5);
    let draft;

    if (mode === 0) {
      draft = {
        prompt: "Which idea belongs to " + subject.title + " alongside \"" + companion + "\"?",
        correct: term,
        wrongs: wrongTerms,
        hint: "Choose the idea that belongs to this field, not a neighbouring one.",
        explanation: ["\"" + term + "\" is a working concept in " + subject.title + "."],
        tags: [subject.title, term]
      };
    } else if (mode === 1) {
      draft = {
        prompt: "Which field includes the idea \"" + term + "\"?",
        correct: subject.title,
        wrongs: wrongTitles,
        hint: "Match the concept to the field that studies it.",
        explanation: [term + " belongs to " + subject.title + "."],
        tags: [subject.title, term]
      };
    } else if (mode === 2) {
      draft = {
        prompt: "Which term belongs with \"" + companion + "\" in " + subject.title + "?",
        correct: term,
        wrongs: wrongTerms,
        hint: "Use the field's vocabulary, not a generic word from another subject.",
        explanation: [term + " is one of the concepts used in " + subject.title + "."],
        tags: [subject.title, term]
      };
    } else if (mode === 3) {
      draft = {
        prompt: "Which subject would cover \"" + term + "\"?",
        correct: subject.title,
        wrongs: wrongTitles,
        hint: "Identify the discipline rather than a nearby specialism.",
        explanation: [term + " is studied within " + subject.title + "."],
        tags: [subject.title, term]
      };
    } else if (mode === 4) {
      draft = {
        prompt: "In " + subject.title + ", which term is paired with \"" + term + "\"?",
        correct: companion,
        wrongs: wrongTerms,
        hint: "Pick the partner term from the same course, not a neighbouring field.",
        explanation: [companion + " and " + term + " are both studied in " + subject.title + "."],
        tags: [subject.title, companion]
      };
    } else {
      const peerTerm = wrongTerms[0] || "a neighbouring idea";
      const peerTitle = wrongTitles[0] || "a neighbouring field";
      const otherTitle = wrongTitles[1] || "another field";
      const otherTerm = wrongTerms[1] || "another idea";
      draft = {
        prompt: "Which field and idea pair is correctly matched?",
        correct: subject.title + " — " + term,
        wrongs: [
          subject.title + " — " + peerTerm,
          peerTitle + " — " + term,
          otherTitle + " — " + otherTerm
        ],
        hint: "Both halves of the pair must belong together.",
        explanation: [subject.title + " uses the concept " + term + "."],
        tags: [subject.title, term]
      };
    }
    return draft;
  }

  /* --------------------------------------------------------------------------
     Build a question
     -------------------------------------------------------------------------- */

  /* Language decks live in language-packs.js, the single source of truth for
     the word bank, the flashcards and these questions. Entries are
     [target, english, pronunciation]. */
  function languageWords(subject) {
    const packs = window.QuestionaireLanguagePacks;
    const pack = packs && typeof packs.forSubject === "function" ? packs.forSubject(subject) : null;
    if (!pack || !pack.words.length) return null;
    return pack.words.map(function (word) {
      return [word.target, word.english, word.pronunciation || ""];
    });
  }

  function generateQuestion(subject, index, domain) {
    const random = rng(hash(subject.id + ":" + index));
    let draft;
    if (domain === "concept") {
      draft = conceptQuestion(subject, index);
    } else if (domain === "math" || domain === "data" || domain === "calculus") {
      const families = mathFamilies(subject);
      draft = families[index % families.length](random, index);
    } else if (domain === "physics") {
      draft = physicsQuestion(random, index);
    } else if (domain === "cs") {
      draft = csQuestion(random, index);
    } else if (domain === "language") {
      const words = languageWords(subject);
      if (!words) {
        draft = conceptQuestion(subject, index);
      } else {
        const withPronunciation = words.filter(function (item) { return item[2]; });
        const forms = withPronunciation.length > 3 ? 5 : 4;
        const entry = words[Math.floor(index / forms) % words.length];
        const form = index % forms;
        const otherWords = words.filter(function (item) { return item !== entry; });
        const meaningWrongs = otherWords.slice(0, 3).map(function (item) { return item[1]; });
        const wordWrongs = otherWords.slice(0, 3).map(function (item) { return item[0]; });
        if (form === 0) {
          draft = { prompt: "What does \"" + entry[0] + "\" mean?", correct: entry[1], wrongs: meaningWrongs, hint: "Recall the core vocabulary item.", explanation: ["\"" + entry[0] + "\" means " + entry[1] + "."], tags: [subject.title, "vocabulary"] };
        } else if (form === 1) {
          draft = { prompt: "Which word means \"" + entry[1] + "\"?", correct: entry[0], wrongs: wordWrongs, hint: "Match the meaning to the target-language word.", explanation: ["\"" + entry[1] + "\" is " + entry[0] + "."], tags: [subject.title, "vocabulary"] };
        } else if (form === 2) {
          draft = { prompt: "Which " + subject.title + " word means \"" + entry[1] + "\"?", correct: entry[0], wrongs: wordWrongs, hint: "Choose the target-language term, not the English meaning.", explanation: ["\"" + entry[1] + "\" is " + entry[0] + "."], tags: [subject.title, "vocabulary"] };
        } else if (form === 3) {
          draft = { prompt: "In " + subject.title + ", what does \"" + entry[0] + "\" mean?", correct: entry[1], wrongs: meaningWrongs, hint: "Translate the target-language word into English.", explanation: ["\"" + entry[0] + "\" means " + entry[1] + "."], tags: [subject.title, "vocabulary"] };
        } else {
          const pronunciationWrongs = withPronunciation
            .filter(function (item) { return item !== entry; })
            .slice(0, 3)
            .map(function (item) { return item[2]; });
          draft = { prompt: "How do you say \"" + entry[0] + "\" out loud?", correct: entry[2], wrongs: pronunciationWrongs, hint: "Match the stressed syllable to the target word.", explanation: ["\"" + entry[0] + "\" is pronounced " + entry[2] + ", and it means \"" + entry[1] + "\"."], tags: [subject.title, "pronunciation"] };
        }
      }
    } else {
      const pool = poolFor(domain);
      draft = poolQuestion(subject, index, pool, seedFacts(subject));
    }

    const target = index % 4;
    const placed = placeOptions(draft.correct, draft.wrongs, target);
    const number = String(index + 1).padStart(4, "0");
    return {
      id: subject.id + "-g" + number,
      difficulty: index % 9 === 0 ? "Advanced" : index % 4 === 0 ? "Beginner" : "Intermediate",
      tags: (draft.tags || [subject.title]).slice(0, 4),
      prompt: draft.prompt,
      options: placed.options,
      answer: placed.answer,
      hint: draft.hint,
      explanation: Array.isArray(draft.explanation) ? draft.explanation : [String(draft.explanation)]
    };
  }

  /* AP world-language courses are exam courses. They drill their own course
     terms (task types, literary periods, set texts) rather than beginner
     vocabulary, so they get concept practice with peer-course distractors. */
  function isApLanguageCourse(subject) {
    return /^ap-/.test(subject.id) && subject.track === "languages";
  }

  function apLanguageTerms(subject) {
    const terms = [];
    const languageName = String((subject.tags || [])[0] || "").toLowerCase();
    const add = function (value) {
      const term = String(value || "").trim();
      if (!term) return;
      if (term.toLowerCase() === subject.title.toLowerCase()) return;
      if (languageName && term.toLowerCase() === languageName) return;
      if (terms.indexOf(term) >= 0) return;
      terms.push(term);
    };
    (subject.tags || []).slice(1).forEach(add);
    (subject._seedQuestions || []).forEach(function (question) {
      (question.tags || []).forEach(add);
    });
    return terms.length ? terms : [subject.title];
  }

  const apLanguageCourses = [];

  DATA.categories.forEach(function (category) {
    category.subjects.forEach(function (subject) {
      subject._seedQuestions = subject.questions.slice();
      subject._curatedCount = subject.questions.length;
      subject.questionTarget = Math.max(/^ap-/.test(subject.id) ? AP_TARGET : TARGET, subject.questions.length);
      if (isApLanguageCourse(subject)) {
        subject._bankDomain = "concept";
        subject._terms = apLanguageTerms(subject);
        /* Course terms such as "culture" are shared by every AP language, so
           "which field covers this term" would have several right answers.
           Keep the term-in-course modes only. */
        subject._conceptModes = [0, 2, 4];
        apLanguageCourses.push(subject);
      }
      subject.bankDomain = subject._bankDomain || classify(subject);
      if (!subject.testConfig) {
        subject.testConfig = { questions: 20, secondsPerQuestion: 60, label: "Timed practice section" };
      }
    });
  });

  apLanguageCourses.forEach(function (subject) {
    const peerTerms = [];
    const peerTitles = [];
    apLanguageCourses.forEach(function (other) {
      if (other === subject) return;
      other._terms.forEach(function (term) {
        if (subject._terms.indexOf(term) >= 0) return;
        if (peerTerms.indexOf(term) < 0) peerTerms.push(term);
      });
      if (peerTitles.indexOf(other.title) < 0) peerTitles.push(other.title);
    });
    subject._peerTerms = peerTerms;
    subject._peerTitles = peerTitles;
  });

  function ensure(subject) {
    if (!subject || subject.questions.length >= subject.questionTarget) return subject;
    const domain = subject.bankDomain || classify(subject);
    while (subject.questions.length < subject.questionTarget) {
      const index = subject.questions.length - subject._curatedCount;
      subject.questions.push(generateQuestion(subject, index, domain));
    }
    return subject;
  }

  function ensureSample(subject, count) {
    if (!subject) return subject;
    const wanted = Math.min(subject.questionTarget || TARGET, Math.max(subject.questions.length, count));
    if (subject.questions.length < wanted) {
      const domain = subject.bankDomain || classify(subject);
      while (subject.questions.length < wanted) {
        const index = subject.questions.length - subject._curatedCount;
        subject.questions.push(generateQuestion(subject, index, domain));
      }
    }
    return subject;
  }

  function ensureForIds(ids) {
    const set = new Set(ids || []);
    DATA.categories.forEach(function (category) {
      category.subjects.forEach(function (subject) {
        const prefix = subject.id + "-g";
        if (Array.from(set).some(function (id) { return String(id).indexOf(prefix) === 0; })) ensure(subject);
      });
    });
  }

  window.QuestionaireBanks = {
    target: TARGET,
    sample: ensureSample,
    ensure: ensure,
    ensureForIds: ensureForIds,
    classify: classify
  };
})();
