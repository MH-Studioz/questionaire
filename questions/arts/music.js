/* ============================================================================
   QUESTIONAIRE — questions/arts/music.js
   Music theory pool: notation, scales, intervals, chords, harmony, form,
   texture, dynamics and rhythm. Also generates interval, key-signature,
   relative-key and scale-degree questions so the 2,000-question AP Music
   Theory bank is not a short list of facts on repeat.
   ========================================================================== */

(function () {
  "use strict";

  const facts = [
    ["How many semitones are in an octave?", "Twelve", ["Eight", "Seven", "Ten"], "Equal temperament divides the octave into twelve semitones."],
    ["Which clef do most high voices and instruments read?", "Treble clef", ["Bass clef", "Alto clef", "Tenor clef"], "The treble clef curls around the G above middle C."],
    ["Which clef do cellos, bassoons and basses usually read?", "Bass clef", ["Treble clef", "Alto clef", "Soprano clef"], "The bass clef marks F below middle C."],
    ["Which clef is used for the viola?", "Alto clef", ["Treble clef", "Bass clef", "Tenor clef"], "The alto clef places middle C on the middle line."],
    ["What is the grand staff?", "Treble and bass staves joined by a brace", ["Two treble staves", "A staff with six lines", "A percussion staff"], "Keyboard music is written on the grand staff."],
    ["What does a key signature show?", "The sharps or flats of the piece's key", ["The tempo", "The metre", "The instrumentation"], "It fixes the accidentals used by the key."],
    ["What does a sharp sign do?", "Raises a note by one semitone", ["Lowers a note by one semitone", "Cancels a previous accidental", "Doubles a note's length"], "A sharp raises pitch by a semitone."],
    ["What does a flat sign do?", "Lowers a note by one semitone", ["Raises a note by one semitone", "Cancels a previous accidental", "Shortens a note"], "A flat lowers pitch by a semitone."],
    ["What does a natural sign do?", "Cancels a previous sharp or flat", ["Raises the pitch", "Lowers the pitch", "Marks a rest"], "Naturals restore the unaltered pitch."],
    ["What does 4/4 time mean?", "Four quarter-note beats per bar", ["Four bars per phrase", "Four eighth-note beats per bar", "Three quarter-note beats per bar"], "The top number gives beats per bar, the bottom the beat value."],
    ["How many beats per bar does 3/4 have?", "Three", ["Two", "Four", "Six"], "3/4 is simple triple time."],
    ["What does a dot after a note do?", "Adds half the note's value", ["Doubles the note's value", "Adds a quarter of the value", "Shortens the note"], "A dotted half note lasts three quarter notes."],
    ["What is a tie?", "A curved line joining two notes of the same pitch", ["A curved line showing legato phrasing", "A repeat sign", "A dynamic mark"], "Ties add the note values together."],
    ["What is a fermata?", "A sign that holds a note longer than written", ["A sign to play softer", "A sign to repeat a section", "A sign to speed up"], "The performer sustains the note at the conductor's discretion."],
    ["What does staccato indicate?", "Notes played short and detached", ["Notes held for full value", "Notes played louder", "Notes played slower"], "Staccato shortens articulation."],
    ["What does legato indicate?", "Notes played smoothly and connected", ["Notes played short and detached", "Notes played louder", "Notes played faster"], "Legato means smooth, connected phrasing."],
    ["How many sharps does D major have?", "Two", ["One", "Three", "Four"], "D major uses F sharp and C sharp."],
    ["How many flats does F major have?", "One", ["Two", "Three", "None"], "F major uses B flat."],
    ["What is the relative minor of C major?", "A minor", ["E minor", "G minor", "D minor"], "Relative keys share a key signature."],
    ["What is the relative major of E minor?", "G major", ["D major", "C major", "A major"], "Both have one sharp."],
    ["What is the circle of fifths used for?", "Showing relationships between keys", ["Counting beats in a bar", "Tuning a drum", "Writing lyrics"], "Adjacent keys on the circle are a fifth apart."],
    ["What is a chromatic scale?", "A scale of twelve semitones", ["A five-note scale", "A scale of whole steps only", "A three-note scale"], "The chromatic scale uses every semitone in the octave."],
    ["What is a whole-tone scale?", "A scale built only from whole steps", ["A scale with alternating half steps", "A five-note scale", "A minor scale with a raised seventh"], "Whole-tone scales divide the octave into six equal steps."],
    ["How many notes does a pentatonic scale have?", "Five", ["Six", "Seven", "Twelve"], "Pentatonic scales use five pitches per octave."],
    ["What distinguishes the harmonic minor scale?", "A raised seventh degree", ["A lowered third degree", "A raised fourth degree", "A lowered sixth degree"], "The raised seventh creates a leading tone."],
    ["What is the leading tone?", "The seventh degree, a semitone below the tonic", ["The fifth degree", "The third degree", "The tonic"], "It pulls strongly toward the tonic."],
    ["What is the tonic?", "The first degree and home key of a piece", ["The fifth degree", "The loudest note", "A type of cadence"], "The tonic is the tonal centre."],
    ["Which chord is built on the fifth scale degree?", "Dominant", ["Tonic", "Subdominant", "Mediant"], "The dominant is the V chord."],
    ["Which chord is built on the fourth scale degree?", "Subdominant", ["Tonic", "Dominant", "Leading-tone chord"], "The subdominant is the IV chord."],
    ["What is modulation?", "A change of key within a piece", ["A change of tempo", "A change of metre", "A change of instrumentation"], "Modulation moves the tonal centre."],
    ["How many semitones are in a perfect fifth?", "Seven", ["Five", "Six", "Eight"], "A perfect fifth spans seven semitones."],
    ["Which interval is the tritone?", "Augmented fourth", ["Perfect fourth", "Minor third", "Major sixth"], "Six semitones span an augmented fourth or diminished fifth."],
    ["How many semitones are in a major third?", "Four", ["Three", "Five", "Seven"], "A major third spans four semitones."],
    ["How many semitones are in a minor third?", "Three", ["Four", "Two", "Five"], "A minor third spans three semitones."],
    ["What is a triad?", "A chord of three notes stacked in thirds", ["A rhythm of three beats", "A three-part form", "A scale of three notes"], "Root, third and fifth make the triad."],
    ["Which intervals form a major triad?", "Major third and perfect fifth above the root", ["Minor third and perfect fifth", "Major third and minor seventh", "Minor third and diminished fifth"], "Root, major third and perfect fifth give the major triad."],
    ["Which intervals form a minor triad?", "Minor third and perfect fifth above the root", ["Major third and perfect fifth", "Minor third and diminished fifth", "Major third and minor seventh"], "Lowering the third of a major triad gives a minor triad."],
    ["Which intervals form a diminished triad?", "Minor third and diminished fifth", ["Major third and perfect fifth", "Minor third and perfect fifth", "Major third and augmented fifth"], "Both the third and fifth are lowered."],
    ["Which intervals form an augmented triad?", "Major third and augmented fifth", ["Minor third and perfect fifth", "Major third and perfect fifth", "Minor third and diminished fifth"], "The fifth is raised by a semitone."],
    ["What is it called when the third of a chord is in the bass?", "First inversion", ["Root position", "Second inversion", "Third inversion"], "First inversion puts the third in the lowest voice."],
    ["What is it called when the fifth of a chord is in the bass?", "Second inversion", ["Root position", "First inversion", "Third inversion"], "Second inversion puts the fifth in the lowest voice."],
    ["How many notes are in a seventh chord?", "Four", ["Three", "Five", "Six"], "Root, third, fifth and seventh."],
    ["What is a dominant seventh chord?", "A major triad with a minor seventh", ["A minor triad with a major seventh", "A diminished triad with a minor seventh", "A major triad with a major seventh"], "The V7 chord drives resolution to the tonic."],
    ["Which cadence moves from V to I?", "Authentic cadence", ["Plagal cadence", "Deceptive cadence", "Half cadence"], "A V–I close is an authentic cadence."],
    ["Which cadence moves from IV to I?", "Plagal cadence", ["Authentic cadence", "Deceptive cadence", "Half cadence"], "The IV–I close is the plagal, or amen, cadence."],
    ["Which cadence ends on the dominant chord?", "Half cadence", ["Authentic cadence", "Plagal cadence", "Deceptive cadence"], "A half cadence pauses on V."],
    ["Which cadence moves from V to vi?", "Deceptive cadence", ["Authentic cadence", "Plagal cadence", "Half cadence"], "The expected tonic is replaced by a substitute chord."],
    ["What is counterpoint?", "Two or more independent melodic lines sounding together", ["A single unaccompanied melody", "Chords in block rhythms", "A repeated bass pattern"], "Counterpoint sets melodic lines against one another."],
    ["Why are parallel fifths avoided in common-practice voice leading?", "They weaken the independence of the voices", ["They are impossible to sing", "They change the key", "They are too quiet"], "Parallel perfect intervals make two voices sound fused."],
    ["What does figured bass show?", "Intervals above the bass note", ["The tempo", "The form", "The key signature"], "Numbers indicate the chord intervals to play above the bass."],
    ["Which sections make up sonata form?", "Exposition, development and recapitulation", ["Verse, chorus and bridge", "Theme, variation and coda", "Prelude, fugue and chorale"], "Sonata form organises a movement around those three sections."],
    ["What is rondo form?", "A recurring main section with contrasting episodes, ABACA", ["Two repeated sections, AABB", "Continuous variation", "A single section, A"], "The refrain returns between episodes."],
    ["What is strophic form?", "The same music for every verse", ["New music for every verse", "Music with no repetition", "A form based on a single chord"], "Strophic songs repeat one musical stanza."],
    ["What is through-composed form?", "New music for each verse, with no repeats", ["The same music for every verse", "A recurring refrain", "A form of theme and variations"], "Through-composed songs avoid strophic repetition."],
    ["What is theme and variations?", "A theme followed by altered restatements", ["Two themes played at once", "A recurring refrain", "A single unaccompanied line"], "Each variation changes rhythm, harmony or texture."],
    ["Which texture is a single unaccompanied melodic line?", "Monophony", ["Polyphony", "Homophony", "Heterophony"], "Monophony has one melodic line without accompaniment."],
    ["Which texture sets a melody against chordal accompaniment?", "Homophony", ["Polyphony", "Monophony", "Heterophony"], "Homophony moves the parts together under a melody."],
    ["Which texture has several independent melodic lines?", "Polyphony", ["Monophony", "Homophony", "Heterophony"], "Polyphony combines independent lines."],
    ["What is a canon?", "A melody imitated by later voices", ["A chord progression", "A type of cadence", "A solo cadenza"], "Each voice enters with the same material."],
    ["What does 'piano' mean as a dynamic marking?", "Soft", ["Loud", "Fast", "Detached"], "Piano (p) marks a soft dynamic."],
    ["What does 'forte' mean as a dynamic marking?", "Loud", ["Soft", "Fast", "Slow"], "Forte (f) marks a loud dynamic."],
    ["What does crescendo mean?", "Gradually louder", ["Gradually softer", "Gradually faster", "Gradually slower"], "The performer increases volume."],
    ["What does diminuendo mean?", "Gradually softer", ["Gradually louder", "Gradually faster", "Suddenly softer"], "The performer decreases volume."],
    ["What does 'allegro' indicate?", "A fast tempo", ["A slow tempo", "A moderate tempo", "A gradual slowdown"], "Allegro is a quick, lively tempo."],
    ["What does 'adagio' indicate?", "A slow tempo", ["A fast tempo", "A moderate tempo", "A gradual speed-up"], "Adagio is a slow, leisurely tempo."],
    ["What does accelerando mean?", "Gradually faster", ["Gradually slower", "Gradually louder", "Immediately faster"], "The tempo increases over time."],
    ["What does ritardando mean?", "Gradually slower", ["Gradually faster", "Gradually softer", "Immediately slower"], "The tempo decreases over time."],
    ["What does 'a tempo' mean?", "Return to the previous tempo", ["Start a new section", "Play louder", "Play in a new key"], "It cancels a tempo change."],
    ["What is syncopation?", "Emphasis on a weak beat or between beats", ["A steady accent on every beat", "A gradual change of key", "A repeated rhythmic pattern"], "Syncopation displaces the expected accent."],
    ["What is a hemiola?", "The feel of two beats against three", ["A three-part canon", "A perfect cadence", "A slow trill"], "Hemiola shifts the perceived grouping."],
    ["What is an ostinato?", "A short repeated musical pattern", ["A solo cadenza", "A sudden dynamic change", "A type of cadence"], "Ostinati repeat beneath changing material."],
    ["What is an anacrusis?", "A pickup note or notes before the first full bar", ["A final chord", "A repeated section", "A tempo marking"], "The anacrusis leads into the downbeat."],
    ["What is a triplet?", "Three notes played in the time of two", ["Two notes played in the time of three", "A three-bar phrase", "A chord of three notes"], "Triplets divide a beat into three."],
    ["What is timbre?", "The tone colour of an instrument or voice", ["The loudness of a note", "The length of a note", "The pitch of a note"], "Timbre separates a flute from a violin on the same note."],
    ["What does 'a cappella' mean?", "Singing without instrumental accompaniment", ["Singing with an orchestra", "Singing in unison only", "Singing in a round"], "A cappella is unaccompanied vocal music."],
    ["What does pizzicato mean for strings?", "Pluck the strings", ["Play with the bow", "Play with a mute", "Play harmonics"], "Pizzicato plucks rather than bows."],
    ["What does arco mean for strings?", "Play with the bow", ["Pluck the strings", "Play in a higher position", "Play a harmonic"], "Arco returns the player to bowing."],
    ["What is vibrato?", "A slight fluctuation of pitch for expression", ["A change of key", "A sudden dynamic", "A type of articulation"], "Vibrato adds warmth and intensity."],
    ["What is transposition?", "Shifting music to a different key", ["Changing the tempo", "Changing the metre", "Changing the instrumentation"], "Transposition keeps intervals but changes pitch level."],
    ["In solfège, which syllable names the tonic?", "Do", ["Sol", "Mi", "La"], "Do is the first scale degree."],
    ["What is melodic dictation?", "Writing down a melody by ear", ["Sight-reading a melody", "Improvising a melody", "Transposing a melody"], "The listener notates what they hear."],
    ["What is sight-singing?", "Singing a melody from notation at first sight", ["Singing from memory", "Improvising over chords", "Singing a harmony by ear"], "Sight-singing reads music without rehearsal."],
    ["What is a sequence in music?", "A motif repeated at a different pitch level", ["A chord progression ending a phrase", "A change of instrumentation", "A type of ornament"], "Sequences repeat a pattern higher or lower."],
    ["Which term describes a melody that moves mostly by small steps?", "Conjunct motion", ["Disjunct motion", "Syncopation", "Ostinato"], "Conjunct motion moves stepwise."],
    ["Which term describes a melody that moves by leaps?", "Disjunct motion", ["Conjunct motion", "Sequential motion", "Oblique motion"], "Disjunct motion uses larger intervals."]
  ];

  /* ------------------------------------------------------------------------
     Parametric generation: intervals, key signatures, relative keys and
     scale degrees. These are computed from music theory, not looked up in a
     small list, so they stay accurate and add real variety.
     ---------------------------------------------------------------------- */

  const LETTERS = ["C", "D", "E", "F", "G", "A", "B"];
  const LETTER_PITCH = [0, 2, 4, 5, 7, 9, 11];

  const INTERVALS = [
    { name: "minor third", semitones: 3, steps: 2 },
    { name: "major third", semitones: 4, steps: 2 },
    { name: "perfect fourth", semitones: 5, steps: 3 },
    { name: "perfect fifth", semitones: 7, steps: 4 },
    { name: "major sixth", semitones: 9, steps: 5 },
    { name: "major seventh", semitones: 11, steps: 6 },
    { name: "octave", semitones: 12, steps: 7 }
  ];

  const MAJOR_KEYS = [
    { key: "C", notes: ["C", "D", "E", "F", "G", "A", "B"] },
    { key: "G", notes: ["G", "A", "B", "C", "D", "E", "F sharp"] },
    { key: "D", notes: ["D", "E", "F sharp", "G", "A", "B", "C sharp"] },
    { key: "A", notes: ["A", "B", "C sharp", "D", "E", "F sharp", "G sharp"] },
    { key: "E", notes: ["E", "F sharp", "G sharp", "A", "B", "C sharp", "D sharp"] },
    { key: "B", notes: ["B", "C sharp", "D sharp", "E", "F sharp", "G sharp", "A sharp"] },
    { key: "F", notes: ["F", "G", "A", "B flat", "C", "D", "E"] },
    { key: "B flat", notes: ["B flat", "C", "D", "E flat", "F", "G", "A"] },
    { key: "E flat", notes: ["E flat", "F", "G", "A flat", "B flat", "C", "D"] },
    { key: "A flat", notes: ["A flat", "B flat", "C", "D flat", "E flat", "F", "G"] },
    { key: "D flat", notes: ["D flat", "E flat", "F", "G flat", "A flat", "B flat", "C"] }
  ];

  const SHARP_KEYS = [
    { key: "G", count: 1 }, { key: "D", count: 2 }, { key: "A", count: 3 },
    { key: "E", count: 4 }, { key: "B", count: 5 }, { key: "F sharp", count: 6 }
  ];
  const FLAT_KEYS = [
    { key: "F", count: 1 }, { key: "B flat", count: 2 }, { key: "E flat", count: 3 },
    { key: "A flat", count: 4 }, { key: "D flat", count: 5 }, { key: "G flat", count: 6 }
  ];

  const NUMBERS = ["One", "Two", "Three", "Four", "Five", "Six", "Seven"];
  const ORDINALS = ["first", "second", "third", "fourth", "fifth", "sixth", "seventh"];

  function pitchOf(name) {
    const match = /^([A-G])( sharp| flat)?$/.exec(name);
    if (!match) return null;
    const base = LETTER_PITCH[LETTERS.indexOf(match[1])];
    const accidental = match[2] === " sharp" ? 1 : match[2] === " flat" ? -1 : 0;
    return (base + accidental + 12) % 12;
  }

  function spelled(root, semitones, steps) {
    const match = /^([A-G])( sharp| flat)?$/.exec(root);
    if (!match) return null;
    const rootIndex = LETTERS.indexOf(match[1]);
    const rootPitch = pitchOf(root);
    const targetPitch = (rootPitch + semitones) % 12;
    const targetIndex = (rootIndex + steps) % 7;
    const difference = (targetPitch - LETTER_PITCH[targetIndex] + 12) % 12;
    if (difference === 0) return LETTERS[targetIndex];
    if (difference === 1) return LETTERS[targetIndex] + " sharp";
    if (difference === 11) return LETTERS[targetIndex] + " flat";
    return null;
  }

  function intervalQuestion(random) {
    const root = LETTERS[Math.floor(random() * LETTERS.length)];
    const interval = INTERVALS[Math.floor(random() * INTERVALS.length)];
    const answer = spelled(root, interval.semitones, interval.steps);
    if (!answer) return null;
    const wrongs = LETTERS.filter(function (letter) { return letter !== answer; })
      .slice(0, 3);
    return {
      prompt: "What note is a " + interval.name + " above " + root + "?",
      correct: answer,
      wrongs: wrongs,
      explanation: "A " + interval.name + " is " + interval.semitones + " semitones above " + root + ", which is " + answer + "."
    };
  }

  function keySignatureQuestion(random) {
    const sharps = random() < 0.5;
    const table = sharps ? SHARP_KEYS : FLAT_KEYS;
    const entry = table[Math.floor(random() * table.length)];
    const answer = NUMBERS[entry.count - 1];
    const wrongs = [];
    [entry.count + 1, entry.count - 1, entry.count + 2].forEach(function (count) {
      if (count >= 1 && count <= 7 && NUMBERS[count - 1] !== answer) wrongs.push(NUMBERS[count - 1]);
    });
    return {
      prompt: "How many " + (sharps ? "sharps" : "flats") + " does " + entry.key + " major have?",
      correct: answer,
      wrongs: wrongs,
      explanation: entry.key + " major has " + entry.count + " " + (sharps ? "sharps" : "flats") + " in its key signature."
    };
  }

  function relativeKeyQuestion(random) {
    const entry = MAJOR_KEYS[Math.floor(random() * MAJOR_KEYS.length)];
    const minorLetter = LETTERS[(LETTERS.indexOf(entry.key.charAt(0)) + 5) % 7];
    const pitch = pitchOf(entry.key);
    const minorPitch = (pitch + 9) % 12;
    let accidental = (minorPitch - LETTER_PITCH[LETTERS.indexOf(minorLetter)] + 12) % 12;
    if (accidental !== 0 && accidental !== 1 && accidental !== 11) return null;
    const minorName = minorLetter + (accidental === 1 ? " sharp" : accidental === 11 ? " flat" : "");
    const answer = minorName + " minor";
    const wrongs = LETTERS.filter(function (letter) {
      return letter !== minorLetter && letter !== "B";
    }).slice(0, 3).map(function (letter) { return letter + " minor"; });
    return {
      prompt: "What is the relative minor of " + entry.key + " major?",
      correct: answer,
      wrongs: wrongs,
      explanation: "The relative minor is a minor third below the tonic and shares the key signature, giving " + answer + "."
    };
  }

  function scaleDegreeQuestion(random) {
    const entry = MAJOR_KEYS[Math.floor(random() * MAJOR_KEYS.length)];
    const degree = Math.floor(random() * 7);
    const answer = entry.notes[degree];
    const wrongs = entry.notes.filter(function (note, index) { return index !== degree; }).slice(0, 3);
    return {
      prompt: "In " + entry.key + " major, which note is scale degree " + (degree + 1) + "?",
      correct: answer,
      wrongs: wrongs,
      explanation: "The " + entry.key + " major scale is " + entry.notes.join(", ") + ", so degree " + (degree + 1) + " is " + answer + "."
    };
  }

  const FAMILIES = [intervalQuestion, keySignatureQuestion, relativeKeyQuestion, scaleDegreeQuestion];

  function generate(random, index) {
    for (let attempt = 0; attempt < 8; attempt += 1) {
      const draft = FAMILIES[(index + attempt) % FAMILIES.length](random);
      if (draft) return draft;
    }
    return null;
  }

  window.QuestionairePools.register({
    id: "music",
    area: "arts",
    title: "Music theory",
    subjects: ["ap-music-theory"],
    facts: facts,
    generate: generate
  });
})();
