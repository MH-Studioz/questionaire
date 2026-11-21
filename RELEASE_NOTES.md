# Questionaire 0.7.4-alpha — Deletions that stick and a sync you can see

Released 21 November 2026.

## Fixed

- **Deleted items came back from the other device.** The merge was a pure union, so un-starring a question on one device was undone by the copy another device still held; the same applied to cleared mistakes, later-corrected entries and discarded or finished sittings. Removals now write a timestamped tombstone in `progress.tombstones`, and the merge keeps the most recent decision per key (`bm:`, `mk:`, `co:`, `st:`). Re-adding writes an alive entry with a later stamp so a re-star still wins, including on a device that never saw the deletion — the case where the older tombstone used to drop the new star at the next merge. A sitting resumed later carries a newer `savedAt` than the old discard. The map is capped at 1,200 entries, dropping the oldest live stamps before any deletion.
- **A failed save was invisible.** The local record stayed correct while the cloud copy silently fell behind, with no message and no retry. `saveProgress` and `loadProgress` now report `lastSyncedAt`, `syncError` and `syncTrimmed` on the public state; the account card shows the last successful sync time or the failure, and failed saves retry with exponential backoff from 2 s to 60 s using the newest in-memory record.
- **Edits during the first sync were dropped.** `scheduleCloudSave` returned early while `cloudHydrating` was true, and the hydration save had already serialised the older record. The save is now queued and runs when hydration finishes.
- **A failed read was followed by a write.** When `loadProgress` failed, hydration still pushed the local record, which could overwrite answers the device had simply failed to read. Saving now stops for that session and the user is told why.

## Content

- 27 new drills in `open-bank.js`, each aligned to an open source in `sources.js`: calculus (chain rule, optimisation, definite integrals), precalculus and trigonometry (unit circle, geometric sequences, identities), algebra and geometry (systems, quadratics, circle area), biology (mitosis, enzymes, Mendelian ratios), chemistry (stoichiometry, Boyle's law, periodic trends), astronomy (fusion, absorption spectra, degeneracy pressure), statistics and probability (elementary probability, median, independence), world history (Nile, Silk Roads, Achaemenid empire) and organic chemistry (hybridisation, carboxyl group, alkane prefixes). The attributed bank now holds 42 items.

## Tests

- `tests/emulator.py` gains `check_tombstones`: device B clears all stars and discards the paused sitting, device A reloads with both still cached, and neither may reappear; re-starring a tombstoned question must then be stored as alive.

# Questionaire 0.7.3-alpha — Mixed-version merge and emulator CI

Released 21 November 2026.

## Fixed

- **Answer records from a 0.7.1 device were ignored.** Chunking moved every per-item record out of the main document, but `loadProgress` returned only the chunk contents, so a device still on 0.7.1 writing inline `progress.answered` into the same document had its answers dropped. Loading now unions inline records with the chunk records (highest attempts and correct count, earliest first-correct stamp, latest attempt), and the next save folds them into the chunks and deletes the inline map so the two copies cannot drift apart.

## Tests

- `tests/emulator.py` gains the mixed-version case: an inline record with higher counts is written into a chunked document, the app reloads, and the record must survive inside the chunks while the inline field disappears.
- The emulator suite runs in CI as its own `emulator` job: Node 22, Temurin JDK 17, Auth and Firestore emulators started from `firebase.json`, then `tests/emulator.py` against a locally served site. The smoke job is unchanged.

# Questionaire 0.7.2-alpha — Emulator-verified sync and a bounded document

Released 21 November 2026.

A portable Node 22 runtime and Temurin JDK 17 were installed locally so the Firestore emulator could finally be run against the real app. This release reports measured numbers, fixes the three defects that run exposed, and ships the tests that caught them.

## What the emulator run measured

Profile shape: the production catalogue (13,760 questions), 60 saved sittings, 900 answered records on device A and 600 on device B.

| Check | Result |
| --- | --- |
| Merge of two devices on one account | 1,500 answered records, 60 sittings, union of bookmarks, mistakes, corrected, vocabulary and written answers |
| Unfinished sitting saved on both devices | newer save resumes; the older stays in the paused list |
| Main cloud document | 146,709 bytes (143.3 KiB) |
| Largest chunk document | 129,099 bytes (126.1 KiB) |
| Headroom under the 1 MiB limit | 880.7 KiB |
| Legacy single-document profile | loads, merges and is re-chunked into 15 documents |
| Rules | foreign write refused with 403; owner reads own chunk |

For contrast, the pre-release single document held 682,330 bytes at only 5,200 answered questions, and the full catalogue needs roughly 1.9 MB of per-item records — comfortably past the limit, where every write would have failed permanently.

## Fixed

- **Silent sign-in failure on load.** Calling sign-in while the SDK modules were still importing returned `false` without an error, because `start()` had already marked itself started and returned immediately. It now returns one shared boot promise, so the click waits for initialization.
- **Document size ceiling.** Per-item answer records move to `users/{uid}/items/chunk-N` (about 112 KiB each, capped at 24 chunks) written in one batch with the main document. Chunks unchanged since the previous save are skipped. If the main document would still exceed 900 KiB, the uploaded copy drops the oldest sittings first; the local record keeps everything.
- **Lost second unfinished sitting.** `mergeProgress` kept only the newer `active` sitting. It now keeps the newest as the resume target and up to three others in `progress.paused`, shown on the dashboard as *Paused on another device* with Resume and Discard. Discarding the active sitting promotes a paused one instead of leaving an empty slot.
- **Emulator support.** `firebase-sync.js` connects to Auth and Firestore emulators when the public config carries an `emulator` block, so local testing never touches the production project. `firebase.json` pins the ports.
- **Rules.** `firestore.rules` gains the owner-only `users/{uid}/items/{chunk}` match.

## Tests

- `tests/emulator.py` (Playwright, Python) runs the three device flows above plus the size, legacy and rules checks against the emulators; it passed end to end.
- `tests/smoke.py` still covers submit → history, reload → resume, misses retake and the corrected badge.

## Known limitations

- There is still no real Firebase project: the public config is blank, so the live project's rules deployment, Google popup and authorized domains remain untested. The emulator covers merge, sizes and rules only.
- Cloud storage now needs the updated rules deployed before the chunk subcollection can be written by real accounts.

# Questionaire 0.7.1-alpha — Codes, written answers and offline

Released 20 November 2026.

Dual question ids, free-response practice, an installable offline shell and a keyboard pass on the paper runner, on top of 0.7.0's saved sittings. The paper-and-ink interface is unchanged.

## Question codes

- Each question keeps its internal slug in `database.js`. The student-facing code (`#Q8X49P`) is derived from it by `getDisplayId` (FNV-1a, 31 unambiguous characters, six positions) and registered in a lookup as questions load, so no code is stored in content files.
- Codes appear on practice cards, the paper runner, mock questions and attempt reviews, with a copy button that falls back to a text selection where the clipboard is blocked.
- Global search accepts a code with or without `#`, opens the exact card and works for lazily generated banks once they materialise.
- Scanning the whole catalogue found 127 collisions across 443,000 questions and none within any single 1,000-question subject. A colliding code lists every owner rather than hiding one.

## Open question banks

- `sources.js` records the licence and usage note for OpenStax, Illustrative Mathematics, LibreTexts Commons and the College Board SAT Suite Question Bank; Settings lists them.
- `open-bank.js` adds 15 original drills aligned to cited OpenStax chapters and Illustrative Mathematics task families, each with a visible attribution line. College Board items are proprietary and none were copied; LibreTexts licences vary per page, so nothing was reproduced from it.

## Written answers

- A **Written** tab appears on subjects with free-response prompts. Each prompt shows its rubric up front, accepts a draft, self-grades criterion by criterion and unlocks the model answer only after a grade is saved.
- Drafts save shortly after typing stops and live in the profile record (`progress.frq`), so they survive reloads and follow the merge policy.

## Offline shell

- `manifest.webmanifest`, `icon.svg` and `sw.js` make the app installable. The service worker precaches the shell plus the local scripts and caches same-origin GETs at runtime, including versioned asset URLs.
- With the preview server stopped, a reload rendered the full catalogue from cache, confirming a cached subject bank can be opened and sat offline.

## Keyboard and screen readers

- Paper runner: A–D or 1–4 answers, Enter advances, arrows move, F marks, R reviews. Answers, marks and timer thresholds go to a polite live region, focus moves to the current question, and the navigator exposes `aria-current`.

## Tests

- `tests/smoke.py` (Playwright, Python) covers submit → history, reload → resume, misses retake and the corrected badge; it passed locally against a static server.
- `.github/workflows/ci.yml` installs Playwright Chromium, serves the site and runs the suite on pushes and pull requests.

## Known limitations

- Firebase was not exercised this release: the machine has no Node/npm or Firebase CLI, and the installed Java 8 is below the emulator's requirement, so merge, the two-device unfinished-sitting conflict and Firestore document-size headroom remain unverified against the emulator.
- Per-item calibration is not included because it needs a server-side aggregator. The local record already stores per-question attempts and correctness, which is the shape a backend would consume.

# Questionaire 0.7.0-alpha — Saved sittings release

Released 20 November 2026.

This release keeps the paper-and-ink interface and turns the 0.6.1 test papers into a record you can return to. Subject content, question banks, accounts and themes are unchanged.

## Paper and exam history

- Practice sets, mock papers, timed exams and misses retakes now write one **attempt** record: subject, paper, kind, start and finish time, time on the clock, score, total, flags, per-question answers and a topic breakdown.
- The subject's Papers tab lists its **paper history** (latest 8 sittings) and the dashboard shows **Recent sittings** (latest 5) across every subject.
- Each row carries the change since the previous sit of the same paper: `first sit`, `level`, `+N` / `−N`, or `—` when the two sittings had different question counts and raw scores are not comparable.
- The best score for each paper is shown on its card.
- Any sitting reopens as a **full review**: mastery by topic plus every question with your pick, the correct answer and the step-by-step explanation, filtered All / Misses.
- Answers are stored as a compact bitmap string, so a 25-question paper costs about 25 characters rather than 25 objects. History is capped at the latest 60 sittings per profile.

## Resume an unfinished paper

- A sitting is snapshotted on every answer, flag and navigation step, not only at submit.
- The dashboard and Papers tab show an **Unfinished sitting** strip with the paper, answered count and a Resume / Discard pair; the matching paper card switches its button to **Resume**.
- Reloading, closing the tab or navigating away keeps the paper; mock papers keep their original deadline, so a resumed mock is still timed from when it started.
- Resuming a mock whose clock has already run out grades it immediately with the saved answers.
- Starting a paper while another sitting is unfinished asks before discarding the first one.

## Topic mastery

- Correct and total answers are now persisted per subject and topic (`topicStats`) as you answer, across practice, papers and exams.
- A **Topic mastery** panel on the dashboard, on each subject's Papers tab and in the review queue lists the weakest topics with accuracy bars and a **Drill** button that opens practice filtered to that tag.
- Mastery merges across devices by keeping the higher correct and total counts, so replaying a topic cannot lower a recorded score.

## Review my misses

- After a mock paper or timed exam: **Only misses** / **All answers**, misses outlined in the result, and **Retake N misses**.
- After a practice set: **Review answers** and **Retake N misses** alongside the existing retake.
- From any saved sitting: **Retake N misses**, **Sit again**, and **All papers**.
- A misses retake is an untimed practice paper with instant feedback; it is saved as its own sitting and can be resumed like any other.
- A missed question that is answered correctly later leaves the active mistake queue and is filed under **Later corrected** (new review filter and badge); missing it again puts it straight back.

## SAT-style runner additions

- **Question navigator** grid for practice sets, mocks and timed exams: answered, marked and current states, with jump-to-question.
- **Mark for review** flag per question, carried into the saved attempt.
- **Review before you finish/submit** screen listing every question as answered, blank or marked, with jump links, before the paper is graded.

## Storage and sync

- The existing local progress record gains `attempts`, `active`, `topicStats` and `corrected`; older records load without migration steps and unknown fields are ignored.
- Cloud merge handles the new fields: attempts union by id, topic mastery by maximum, corrected misses by id, and an unfinished sitting by latest save time.
- Guests and offline profiles keep their history on the device; clearing site data still removes it.

## Release housekeeping

- App version, footer, cache-busting query strings, README and these notes are on `0.7.0-alpha`.
- New CSS for the history table, review panels, navigator, resume strip and mastery rows in all three themes.
- No changes to subject data, the question pools, Firebase configuration or the package-free build.

## Known limitations

- History keeps the latest 60 sittings per profile and shows the latest 8 per subject; older sittings are discarded rather than exported.
- Mock papers and timed exams remain section-sized (up to 25 questions), not full-length digital SAT modules.
- Score history compares raw scores; there is no score estimate or projected band.
- Cloud sync of the new records is implemented but still unverified against a real Firebase project.
- Papers cannot be printed or exported yet, and the review list is not a separate shareable page.
- Guest sessions and offline profiles remain device-local and are not a security boundary.

---

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
