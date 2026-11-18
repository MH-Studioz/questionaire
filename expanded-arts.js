/* ============================================================================
   QUESTIONAIRE — expanded-arts.js
   Music, visual arts, design, film and performing arts expansion.
   ========================================================================== */

(function () {
  "use strict";

  const add = window.QuestionaireExpanded && window.QuestionaireExpanded.add;
  if (!add) return;

  add("creative-arts", [
    ["music-theory", "Music Theory", "Beginner", "Notation, intervals, scales, chords and harmonic function.", ["staff notation", "intervals", "scales", "chords", "harmonic function"]],
    ["music-composition", "Music Composition", "Advanced", "Motives, form, texture and the craft of writing music.", ["motives", "musical form", "texture", "orchestration", "development"]],
    ["counterpoint-harmony", "Counterpoint & Harmony", "Advanced", "Voice leading, species counterpoint and tonal harmony.", ["voice leading", "species counterpoint", "chord progression", "cadences", "tonal harmony"]],
    ["ear-training", "Ear Training & Aural Skills", "Beginner", "Intervals, chords, rhythm and transcription by ear.", ["interval recognition", "chord quality", "rhythm dictation", "melodic dictation", "solfège"]],
    ["orchestration", "Orchestration", "Advanced", "Instrument ranges, timbre, balance and scoring for ensembles.", ["instrument ranges", "timbre", "doubling", "balance", "score layout"]],
    ["conducting", "Conducting", "Advanced", "Gesture, baton technique, cueing and rehearsal leadership.", ["baton technique", "beat patterns", "cues", "rehearsal", "tempo"]],
    ["ethnomusicology", "Ethnomusicology", "Advanced", "Music in culture, fieldwork and comparative study.", ["fieldwork", "cultural context", "musical ethnography", "tradition", "performance practice"]],
    ["music-history", "Music History & Musicology", "Intermediate", "Styles, periods, composers and the study of musical texts.", ["medieval music", "Baroque", "Classical period", "Romanticism", "musicology"]],
    ["music-production", "Music Production", "Intermediate", "DAWs, arrangement, mixing and the record-making workflow.", ["DAW", "arrangement", "mixing", "signal flow", "mastering"]],
    ["audio-engineering", "Audio Engineering", "Advanced", "Microphones, consoles, acoustics and recorded sound.", ["microphones", "mixing console", "signal chain", "acoustics", "recording"]],
    ["acoustics-sound-design", "Acoustics & Sound Design", "Advanced", "Room acoustics, synthesis and sound for media.", ["room modes", "synthesis", "reverb", "sound design", "spatial audio"]],
    ["fine-art", "Fine Art", "Intermediate", "Concept, material and critical practice across media.", ["concept", "material", "composition", "critique", "exhibition"]],
    ["art-history", "Art History", "Intermediate", "Works, movements, context and visual analysis.", ["visual analysis", "provenance", "movements", "context", "iconography"]],
    ["drawing-painting", "Drawing & Painting", "Beginner", "Line, value, colour, perspective and pictorial composition.", ["line", "value", "colour", "perspective", "composition"]],
    ["sculpture-printmaking", "Sculpture & Printmaking", "Intermediate", "Form in space, relief, etching, lithography and editioning.", ["relief", "casting", "etching", "lithography", "editioning"]],
    ["ceramics", "Ceramics", "Intermediate", "Clay bodies, hand-building, throwing, glazing and firing.", ["clay bodies", "wheel throwing", "glazing", "kiln firing", "hand-building"]],
    ["photography", "Photography", "Beginner", "Exposure, composition, lighting and photographic meaning.", ["exposure", "aperture", "shutter speed", "composition", "lighting"]],
    ["graphic-design", "Graphic Design", "Intermediate", "Typography, layout, identity and visual communication.", ["typography", "grid", "hierarchy", "branding", "layout"]],
    ["illustration-typography", "Illustration & Typography", "Advanced", "Image-making, letterforms and editorial visual language.", ["letterforms", "image-making", "editorial layout", "type pairing", "visual narrative"]],
    ["architecture", "Architecture", "Advanced", "Space, structure, programme and architectural representation.", ["spatial design", "structure", "programme", "site", "architectural drawing"]],
    ["interior-design", "Interior Design", "Intermediate", "Interior space, materials, lighting and human use.", ["space planning", "materials", "lighting", "ergonomics", "interior detail"]],
    ["industrial-product-design", "Industrial & Product Design", "Advanced", "Form, function, manufacturing and user-centred products.", ["form follows function", "prototyping", "manufacturing", "usability", "materials"]],
    ["fashion-textile-design", "Fashion & Textile Design", "Intermediate", "Garment construction, textiles, pattern and fashion context.", ["pattern cutting", "textiles", "garment construction", "draping", "fashion history"]],
    ["film-cinema-studies", "Film & Cinema Studies", "Intermediate", "Film form, genre, authorship and spectatorship.", ["mise-en-scène", "montage", "genre", "authorship", "spectatorship"]],
    ["cinematography", "Cinematography", "Advanced", "Camera, lighting, lenses and visual storytelling.", ["lighting", "lens choice", "camera movement", "exposure", "colour grade"]],
    ["screenwriting", "Screenwriting", "Advanced", "Structure, character, dialogue and visual storytelling.", ["three-act structure", "character arc", "dialogue", "scene", "visual storytelling"]],
    ["theater-arts", "Theater Arts & Drama", "Intermediate", "Performance, dramaturgy, stagecraft and theatre history.", ["stagecraft", "dramaturgy", "rehearsal", "performance", "theatre history"]],
    ["acting-directing", "Acting & Directing", "Advanced", "Character, intention, blocking and rehearsal practice.", ["objectives", "blocking", "given circumstances", "ensemble", "rehearsal"]],
    ["dramaturgy", "Dramaturgy", "Advanced", "Script analysis, dramatic structure and production context.", ["script analysis", "dramatic structure", "production context", "adaptation", "research"]],
    ["dance-choreography", "Dance & Choreography", "Intermediate", "Movement vocabulary, composition, rhythm and performance.", ["movement vocabulary", "choreographic form", "rhythm", "space", "performance"]],
    ["creative-writing", "Creative Writing", "Intermediate", "Poetry, fiction, voice, image and revision.", ["voice", "imagery", "narrative", "revision", "form"]],
    ["journalism", "Journalism", "Intermediate", "Reporting, interviewing, verification and ethical storytelling.", ["reporting", "interviewing", "verification", "news values", "ethics"]],
    ["media-studies", "Media Studies", "Intermediate", "Media texts, audiences, industries and representation.", ["representation", "audience", "media industry", "narrative", "ideology"]],
    ["digital-media-animation", "Digital Media & Animation", "Advanced", "Animation principles, motion, compositing and interactive media.", ["keyframes", "timing", "rigging", "compositing", "storyboard"]],
    ["game-design", "Game Design", "Advanced", "Mechanics, systems, level design and player experience.", ["game mechanics", "level design", "player agency", "feedback loops", "playtesting"]]
  ]);
})();
