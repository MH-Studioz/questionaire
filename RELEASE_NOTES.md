# Questionaire 0.6.1-alpha — Test papers release

Released 20 November 2026.

This release keeps the existing paper-and-ink interface and adds fixed assessment papers to every subject. It also removes the unshipped OmniLearn prototype folder from the repository; nothing in the live site linked to it.

## Test papers

- A **Test Papers** button on every subject header opens a fixed paper library.
- **Three practice sets (A, B, C)** per subject: 20 questions, instant grading, hints, bookmarks and the full step-by-step explanation.
- **Three mock papers (1, 2, 3)** per subject: 20 questions on a deadline, no feedback until submission, graded at the end.
- Papers are composed deterministically from the subject bank, so a retake uses the same questions and compares like with like; the A/B/C and 1/2/3 variants draw different questions.
- **Topic score reports** after every practice set, mock paper and ordinary exam: correct/total per topic with mastery bars.
- The **weakest topic** is called out with a **Practise this topic** button that opens practice pre-filtered to that tag, plus a visible filter note and a clear control.
- Paper answers use the existing XP, streak, accuracy, mistake-bank and review-queue pipeline; there is no parallel progression store.
- The ordinary timed exam keeps its existing behaviour and now shows the same topic report.

## Release housekeeping

- Cache-busting query strings in `index.html` are unified under `0.6.1-alpha`.
- The footer shows the release number (`Release 0.6.1-alpha`).
- `omnilearn/` (the standalone prototype built earlier) was deleted.
- No subject, question-bank, account, sync or theme data was changed.

## Known limitations

- Paper sessions and score reports live for the session; they are not stored as a separate paper-history record. Solved counts, accuracy, XP and mistakes persist as before.
- Mock papers draw from the loaded subject bank; very small banks produce shorter papers than the advertised 20.
- Cloud sync, guest sessions and Firebase setup are unchanged from 0.6-alpha.

---

# Questionaire 0.6-alpha — Accounts and catalogue release

Released 18 November 2026.

This is the first alpha with a real identity system. Study routes now require a Firebase account or an offline profile. There is no guest profile and no anonymous Firebase user.

## Release highlights

### Real authentication

- **Email/password sign-in** through Firebase Authentication.
- **Create account** with display name, email and password.
- **Password reset** by email.
- **Google sign-in** through `signInWithPopup`.
- **Sign-out** with local cache retained for the next sign-in.
- **No anonymous auth** and no guest-to-Google upgrade path.
- Friendly messages for weak passwords, wrong credentials, duplicate accounts, disabled providers, unauthorized domains, blocked popups, rate limits, network failures and Firestore permission errors.
- Owner-only Firestore record at `users/{uid}`.
- Per-UID offline cache at `questionaire.progress.v1.cloud.<uid>`.
- Sign-in merges local/legacy progress with the cloud record: union questions, bookmarks and mistakes; maximum XP; latest study date; best streak.

### Offline fallback

- Device-local profiles with separate progress, XP, streak, bookmarks and mistakes.
- Profiles are listed in `questionaire.accounts.v1`.
- Profile progress is stored at `questionaire.progress.v1.account.<id>`.
- Create, switch, sign out and delete profiles.
- Local profiles are explicitly **not password protected**.
- While a cloud account is active, offline profiles are hidden; sign out to use them.

### Guest removal and migration

- Removed the guest-first account panel and guest study path.
- Removed anonymous Firebase auth.
- The old `questionaire.progress.v1` record is never loaded as active progress.
- It is read once as migration input and deleted when the first offline profile or cloud account is created.
- Signing out returns to `#/login`, not to a guest record.
- Direct study routes redirect to the login page until an identity exists. Settings remains reachable so the Firebase setup guide can be opened before signing in.

This build deliberately adds back a **narrow guest session** (one click, device-local, no sync) — not the old guest-first account panel. See [Guest mode](#guest-mode).

### Guest mode

- **Continue as guest** starts a one-click, device-local guest session on the sign-in page.
- A guest is a local record, not a cloud identity: no password, no sync, progress stored under `questionaire.progress.v1.account.<id>`.
- Switching to an offline profile or a cloud account keeps working; signing out returns to the sign-in page.
- The identity gate still holds — nothing renders without a cloud user, an offline profile or a guest session.

### Learning mode

- A new **Learn** tab on all 443 subjects: a guided four-step path, topic deep dives, study cards and video lessons.
- Deep dives come from the subject's own bank — the most common topics, a real question for each, the correct answer and the full step-by-step explanation, plus a jump straight to that card in practice.
- Calculus surfaces derivatives, the chain rule, limits, integrals and definite integrals with worked steps, and plays its curated videos.
- Every deep dive links to a YouTube lesson search for that exact topic; subjects with no curated video get a subject-level lesson search instead.
- AP world-language courses link to the matching full language deck (Spanish, Mandarin Chinese, French, German, Italian, Japanese, Latin).

## Catalogue

- **443 subjects**, 443 unique ids.
- **485,000-question target**: 1,000 questions per subject, 2,000 for each of the 42 AP courses.
- **11 sections**: AP Courses, Exam Prep, Mathematics, Sciences, Humanities, Engineering & Computing, Health & Medicine, Creative Arts, Social Sciences & Law, Languages and the Universal Study Vault.
- **42 AP courses**.
- **5 exam banks**: SAT, ACT, PSAT/NMSQT, GED and GRE, each with 1,000 deterministic questions and a timed section.
- Curated anchor questions stay first; generated practice follows.
- Stable generated ids (`<subject-id>-g0001`) keep progress through lazy bank materialization.
- 20-card pagination for large subject lists.
- KaTeX formulas, Lucide icons, Paper/Ink/OLED themes and responsive navigation.

## Languages

- **47 language subjects**, including Spanish, French, German, Portuguese, Hindi, Mandarin Chinese, Japanese, Arabic, English Language, Korean, Russian, Italian, Somali, Vietnamese, Turkish, Swahili, Polish, Dutch, Greek, Bengali, Urdu, Persian, Thai, Indonesian, Tagalog, Swedish, Norwegian, Danish, Finnish, Czech, Ukrainian, Romanian, Hungarian, Bulgarian, Serbian, Croatian, Catalan, Amharic, Zulu, Hausa, Yoruba, Igbo, Hebrew, Latin, Ancient Greek, Afrikaans and Icelandic.
- **46 vocabulary dictionaries** plus English Language grammar practice.
- Language banks expand to 1,000 questions each.

### Language studio

- A **Word bank** tab on every vocabulary language: 20 high-frequency words, grouped into Greetings, People, Numbers, Everyday and Verbs.
- Every word carries a **plain-English pronunciation guide** with the stressed syllable capitalised (`hola` → `OH-lah`), so a beginner can say it on day one.
- **Listen** speaks the word with the browser's speech engine, choosing a voice that matches the language; **Hear the deck** reads all 20 in order.
- **Mark as known** tracks mastery per word, stores it in progress and merges it across devices.
- **Flashcards** practice mode: shuffled deck, tap to reveal the meaning, then *Still learning* or *Got it*, with a progress bar and an end-of-deck summary. Reshuffling restarts the session without losing mastery.
- The practice bank now asks **five question forms per word**, including *“How do you say … out loud?”* against the pronunciation guide — 100 prompt templates per language instead of 34–43.
- The word bank is linked from the Study tab and indexed by search, so typing `hola` opens that word.
- English Language stays grammar practice and deliberately has no word deck.
- **Ancient Greek now has its own polytonic vocabulary** instead of falling back to modern Greek.
- Language-key matching now chooses the most specific dictionary key, so `ancient-greek` wins over `greek` and `mandarin` wins over `chinese`.
- **All eight AP world-language courses practise their own course terms** (task types, set texts, literary periods) instead of “hola”-level vocabulary. They are concept practice, not beginner decks.
- All generated language options were checked for four non-empty options, valid answer indexes and malformed cards.

### Language alpha limitation

Each deck is a 20-word starter set, so a 1,000-question vocabulary bank repeats 100 prompt templates per language (English Language grammar has 66). Pronunciation guides are English respellings, not IPA or recorded audio, and the Listen button depends on voices installed on the device. This is a real study place for a beginner, not a complete curriculum; growing the decks and adding spaced repetition are the first beta tasks in `ROADMAP.md`.

## Fixes in this release pass

- Removed unused `greeting`, `recommendedEntry`, `statCard` and `subjectCardHTML` functions.
- Removed the unused `SAMPLE` constant.
- Removed dead stat-card and subject-card CSS and its responsive overrides.
- Fixed the missing `chrome` Lucide icon warning by using a supported globe icon.
- Fixed stale anonymous-user wording in `firestore.rules`.
- Fixed the "Nine languages" tagline, which described the pre-expansion catalogue; it now reads 47 languages.
- Moved language vocabulary into one source of truth (`language-packs.js`) and deleted the now-unreachable `LANG_WORDS` table, so the word bank, flashcards and practice bank can never disagree.
- AP world-language banks no longer drill beginner words: they are classified as concept practice with peer-course distractors and their own course terms.
- AP Spanish Literature no longer produces filler options such as “None of the above”: concept questions now draw on the course's own terms and its peers' terms.
- Fixed concept prompts that repeated identical wording with different answers (the term is now named in the question), and made the paired-term form ask the reverse pair instead of a third copy of the same prompt.
- Added a cloud-hydration guard so signing out during an in-flight load cannot write cloud progress into the local fallback.
- Added a setup-guide path that works before login.
- Arts subjects no longer share one pool. Music courses draw music-theory facts, visual-art courses draw art facts, and theatre, film and dance have their own set, so the "lightness or darkness of a colour" question can no longer turn up in AP Music Theory.
- Subject classification now matches whole words: “particle” no longer sends Quantum Mechanics into the art pool, and “metaphysics” no longer sends Philosophy into the physics pool.
- Philosophy has its own bank (validity, soundness, ethics, epistemology, fallacies) instead of borrowed physics or grammar questions.
- Question pools moved out of `subject-banks.js` into `questions/<area>/<pool>.js`, with `questions/registry.js` mapping every subject id to its own pool. The broad "science", "social" and "arts" buckets are gone.
- GED no longer counts as an arts subject, the Universal Study Vault subjects no longer draw grammar questions, AP World History no longer draws computing questions, and Psychology no longer draws research-methods questions.
- Chemistry, biology, astronomy, environmental science and anatomy each have their own pools instead of sharing one general science pool; history, government, economics, psychology, sociology and geography likewise.
- Music and philosophy pools deepened: 85 music facts (notation, keys, intervals, chords, harmony, form, texture, dynamics, tempo, rhythm) plus a theory-driven generator for intervals, key signatures, relative keys and scale degrees; 45 philosophy facts across logic, ethics, epistemology, metaphysics and political philosophy.
- Updated the README, release notes and cache versions.

## Verification

Verified in the browser and static checks:

- 443 subjects, 443 unique ids, 11 categories.
- Every subject reports its target: 1,000 questions, 2,000 for AP courses.
- All subjects have study cards and tips.
- 47 language subjects; 46 vocabulary decks; all 1,000-question banks materialize.
- All 46 vocabulary subjects resolve a deck; English Language resolves none, as designed.
- 920 words total, every one with an English gloss, a pronunciation guide and a theme.
- 45,900 generated language questions (46 banks × 998) checked: four non-empty, distinct options and a valid answer index every time; at least 90 distinct prompt templates per language.
- Pronunciation audit of the ten less common decks (Hausa, Igbo, Yoruba, Amharic, Zulu, Thai, Bengali, Urdu, Somali, Vietnamese) with the misleading respellings corrected.
- Guest mode: one-click session created from the sign-in page, progress written to its own local key, sign-out returns to the gate.
- Learn tab renders for a language, an AP course and calculus, with deep dives, worked steps, video blocks and the AP language-deck link.
- AP banks now report a 2,000-question target and materialise without malformed options.
- Pool audit: all 443 subjects resolve either a registered pool or one of the numeric/vocabulary/concept generators; no subject falls back to another field's facts. 26 pools loaded.
- GED, SAT, ACT, PSAT and GRE are classified as exams; GED shows its own curated math/reading/science/social questions rather than art facts.
- Study Vault subjects (exam hacks, memory tricks, study planning) show retrieval practice, spacing, interleaving and planning questions.
- Variety in the 2,000-question banks: AP Music Theory produces 274 distinct prompts and 361 distinct question option-sets across 2,000 items; philosophy 226 distinct prompts across 1,000. Other AP pools still repeat their ~18–20 facts, which is the known limitation below.
- Discipline routing checked in the browser: AP Music Theory draws music facts only (zero art prompts in 2,000), AP Art History draws art facts only, AP Music Theory's Learn topics are musical, and Philosophy, Quantum Mechanics and the theatre subjects no longer borrow another field's questions.
- All eight AP world-language banks checked: zero filler options, zero beginner-vocabulary questions, 12 distinct prompts each.
- Word bank, Listen fallback, mark-as-known, flashcards reveal/advance/summary and the word-bank search jump were exercised in the browser at 390px and desktop width.
- Ancient Greek now uses Ancient Greek vocabulary; modern Greek remains separate.
- AP Spanish Literature now uses concept practice.
- Login gate: direct `#/dashboard` redirects to `#/login`.
- Offline profile creation, one-time legacy migration, sign-out, switch and delete.
- Unconfigured Firebase shows offline profiles only.
- Fake configured-cloud adapter showed email sign-in, sign-up, reset and Google controls; cloud activation and sign-out fallback worked.
- Login layout checked at 390px with no horizontal overflow.
- Local files referenced by `index.html` all exist.
- No unused function declarations remain in `app.js`; dead CSS removed.
- Console shows only the existing Tailwind CDN warning.

### Pool depth limitation

The pools are accurate but uneven. Music (85 facts plus a generator) and philosophy (45 facts) carry a 2,000- and 1,000-question bank well; the other AP pools hold about 18–20 facts, so their 2,000-question banks repeat the same facts far more often than the music bank. Growing each pool is a content job, not a generator change, and is listed in `NEXT_STEPS.txt`.

## Not verified

- Live Firebase email/password sign-up and sign-in.
- Live Google popup sign-in.
- Password-reset email delivery.
- Firestore reads/writes, cross-device merge and deployed security rules.
- That Listen actually produces audio: it needs a matching voice installed in the operating system, and the automated check only confirmed the button, voice lookup and fallback message.

These require a real Firebase project and public `firebase-config.js` values.

## Upgrade notes

1. Paste the public `apiKey`, `authDomain`, `projectId` and `appId` into `firebase-config.js`.
2. Enable **Email/Password** and **Google** in Firebase Authentication.
3. Add `mh-studioz.github.io` and `localhost` as authorized domains.
4. Deploy `firestore.rules` with `firebase deploy --only firestore:rules`.
5. Test sign-up, sign-in, reset, Google popup, save, reload and merge on the live origin.

Asset query strings were bumped to `0.7.0-alpha` for the `questions/` pool tree, `subject-banks.js` and `app.js`; the release itself is still **0.6-alpha**.

Existing offline profiles keep their ids. Existing guest progress is migrated once. Old guest progress keys are removed after the first identity is created. Vocabulary mastery is merged on sign-in like any other progress.

## Next steps

See [`ROADMAP.md`](ROADMAP.md) for the prioritized beta backlog: live Firebase proof, deeper language dictionaries, non-repeating language generators, account deletion/export, email verification, sync retry, Playwright + Firebase Emulator tests, accessibility, PWA offline support and content QA.
