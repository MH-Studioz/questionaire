# Questionaire

A static study annual for the browser: every current AP course, SAT/ACT/PSAT/GED/GRE practice, plus question banks, cheat sheets, memory notes and video lessons across maths, sciences, humanities and languages.

**Live:** https://mh-studioz.github.io/questionaire/

Progress requires an identity:

- **Cloud account** — Firebase email/password or Google. Progress syncs to the owner-only `users/{uid}` Firestore record.
- **Offline profile** — a device-local profile with no password. It is the fallback when Firebase is not configured or the user chooses not to sign in.

There is also a **guest session**: one click on *Continue as guest* creates a device-local guest record so somebody can try the whole site before signing up. It is not a cloud identity, it is not password protected, and its progress stays in that browser until it is deleted or replaced by a real account.

## Run locally

There is no build step. From the repository root:

```bash
python -m http.server 5173 --bind 127.0.0.1
```

Then open `http://127.0.0.1:5173`.

## Publish

The site is served by GitHub Pages from the `main` branch root. Commit and push; Pages rebuilds automatically.

```bash
git add .
git commit -m "Update study annual"
git push origin main
```

Cloud login only works after the public Firebase config is filled in and the providers are enabled. See [Firebase setup](#firebase-setup).

## Release 0.7.5-alpha

**0.7.5-alpha** takes the tie-breaker for a tombstone conflict away from the device clock. A decision is now stamped with a Firestore server timestamp in `stamp`, and the merge compares that; a device whose clock is hours out can no longer win a merge it should lose. `progress.tombstones` keeps its `{ at, deleted }` shape, so a client still on 0.7.4 reads and writes the same map and simply ignores the extra field.

Only a decision that actually changed on the device gets a fresh server timestamp. Re-stamping the whole map on every save would push an old deletion past an add another device made later, which is the bug the tombstones exist to prevent. The committed stamp is read back once the write lands — one document read, only on saves that carry a new decision — so the next save writes the stamp it was given instead of erasing it with a bare local time. Records written before this release keep ordering by `at` until that decision changes; a legacy entry has no server stamp to compare.

Unifying the comparison also exposed a unit bug: a paused sitting's `savedAt` is epoch milliseconds, and it was being compared as a string against an ISO timestamp, so the string always won. Every `st:` tombstone therefore blocked that paper from ever being resumed. Both sides are normalised to ISO before comparing now.

`tests/emulator.py` covers it: a committed decision must carry a `timestampValue` stamp and a `stringValue` `at`; a later save must not erase that stamp; a legacy tombstone dated in 2039 with a 2020 stamp must lose to the device's newer server stamp; and a tombstone dated 2020 with a 2039 stamp must beat the device's own clock.

## Release 0.7.4-alpha

**0.7.4-alpha** fixes the two sync defects that survived the last round: deletions came back, and a failed save looked exactly like a successful one.

**Deletions are recorded.** A union merge cannot tell "never had it" from "deleted it", so a question un-starred on one device reappeared from the other device's copy, and a discarded sitting came back on the next sign-in. Every removal now writes a timestamped tombstone into `progress.tombstones` (`bm:` bookmark, `mk:` mistake, `co:` later-corrected, `st:` sitting) and the merge keeps the most recent decision per key. Re-adding an item writes an "alive" entry with a later stamp — even on a device that never saw the deletion, where the older tombstone used to win silently — so a re-star survives the merge; a sitting resumed later has a newer `savedAt` and is unaffected. The map is capped at 1,200 entries, oldest first.

**Sync failures are visible.** The account card shows *synced 14:32*, *waiting for the first sync*, *history trimmed to fit*, or *Not synced — … Retrying automatically*, and the sidebar note says when a sync is failing. Saves report `lastSyncedAt`, `syncError` and `syncTrimmed` on `window.QuestionaireCloud.state`, and a failed save retries with backoff from 2 s to 60 s, always with the newest in-memory record. A failed *read* is not retried with a write, and hydration now stops instead of overwriting a cloud copy it could not load. Edits made while the first sync is still running are queued instead of dropped.

**More attributed questions.** `open-bank.js` grows from 15 to 42 drills against the open education sources in `sources.js`: three more each for calculus, precalculus and trigonometry, algebra and geometry, biology and chemistry, plus three each for astronomy, statistics and probability, world history and organic chemistry — 27 new items on new topics such as the chain rule, optimisation, geometric sequences, mitosis, enzymes, Mendelian ratios, stoichiometry, Boyle's law, absorption spectra, white dwarfs, independence, the Silk Roads and hybridisation.

`tests/emulator.py` covers both sync fixes: device B clears every star and discards the paused sitting, device A reloads with both still in memory, and neither may come back; re-starring afterwards must be recorded as alive rather than deleted. A third check denies writes at the emulator: the account card has to read *Not synced — … Retrying automatically* while the session stays signed in, and restoring the rules must be enough for the built-in backoff to clear it and land the save.

## Release 0.7.3-alpha

**0.7.3-alpha** closes the mixed-version gap 0.7.2 left behind. A device still on 0.7.1 writes answer records inline in the main document; 0.7.2 loaded only the chunk documents, so those records were ignored. `loadProgress` now unions the inline records with the chunk records one question at a time (highest attempt and correct counts, earliest first-correct stamp, latest attempt) and the next save folds them into the chunks and deletes the inline map.

`tests/emulator.py` covers the case: it writes an inline record with higher counts into a chunked document, reloads the app and asserts the record survives inside the chunks with the inline field gone. The emulator suite now also runs in CI as its own job, with Node 22 and Temurin JDK 17, starting the Auth and Firestore emulators from `firebase.json` before running `tests/emulator.py`.

## Release 0.7.2-alpha

**0.7.2-alpha** is the first release checked against a real Firestore emulator. `tests/emulator.py` drives the app in Chromium with the Auth and Firestore emulators and asserts the merge, the two-device sitting and the document sizes with the production profile shape (13,760-question catalogue, 60 saved sittings).

| Check | Measured |
| --- | --- |
| Two devices, one account | 900 + 600 answered records merged to 1,500; 60 sittings kept |
| Unfinished sitting on each device | newest is the resume target, the other is kept and resumable |
| Full-catalogue profile | 15 chunk documents; main document 143 KiB, largest chunk 126 KiB |
| Headroom under Firestore's 1 MiB document limit | 880 KiB |
| Legacy single-document profile | loads, merges, then re-chunks |
| Rules | another account's write refused (403), own chunk readable |

Three defects the run exposed are fixed:

- **Cloud init race.** A sign-in clicked while the Firebase SDK was still downloading returned `false` with no message. `start()` now hands every caller the same boot promise, so the click waits for initialization instead of failing silently.
- **The 1 MiB ceiling.** One document cannot hold every per-item record: 5,200 answered questions already reached 682 KB, and the full catalogue needs about 1.9 MB. Records now live in `users/{uid}/items/chunk-N` (about 112 KiB each, capped at 24) and are written in the same batch as the main document, which stays at 143 KiB. Chunks that did not change since the last save are skipped. The local record is never trimmed; if the main document would still exceed 900 KiB, the uploaded copy drops the oldest sittings first.
- **Two devices, two unfinished papers.** The merge kept only the newer sitting and silently dropped the other. Both are kept now: the newer resumes, and up to three others appear on the dashboard as *Paused on another device* with Resume and Discard.

`firestore.rules` adds the owner-only rule for the `items` subcollection. See [Verifying cloud sync](#verifying-cloud-sync) for the emulator commands.

## Release 0.7.1-alpha

**0.7.1-alpha** gives every question two ids: the internal slug stays in the data, while the six-character code students see (`#Q8X49P`) is derived at runtime from the slug, so it never needs storing and adding a question cannot renumber another. Codes work in global search with or without `#`, copy from any question card, paper or review, and resolve to every owner when two questions collide (127 collisions across the full catalogue, none inside a single 1,000-question bank). A **Written** tab adds free-response prompts with a fixed rubric, self-grading and a model answer that unlocks after grading; drafts and grades follow the profile. The app now installs and works offline: a service worker caches the shell and question banks, so a paper can be sat with no connection, and absolute deadlines keep resumed mocks honest. The paper runner has a keyboard and screen-reader pass (A–D to answer, Enter to advance, arrows to move, F to mark, R to review, an announced live region and a focusable navigator). Source attribution for OpenStax, Illustrative Mathematics and LibreTexts sits in Settings, and the College Board SAT bank is linked with an explicit note that its items are proprietary and not copied.

Playwright smoke tests cover paper submit → history, reload → resume, misses retake and the corrected badge; they run in GitHub Actions via `.github/workflows/ci.yml`.

## Release 0.7.0-alpha

The complete release list is in [`RELEASE_NOTES.md`](RELEASE_NOTES.md). It covers the real login system, guest mode, the learning mode, the 443-subject catalogue, 47 languages, the language studio (word decks with pronunciation plus flashcards), AP/exam banks, the `questions/` pool restructure, and the known alpha limitations.

**0.7.0-alpha** turns test papers into a record. Every practice set, mock paper, timed exam and misses retake is saved as a **sitting** with its score, answers, flags and topic report; a **paper history** shows each score and the change since the last sit of the same paper, and an interrupted paper can be **resumed** after a reload with its clock still running. **Topic mastery** is now persisted and surfaced on the dashboard and in the review queue with one-click drills, and every paper ends with **review my misses** plus a **misses-only retake**. Mocks and timed exams gain a question navigator, mark-for-review flags and a review-before-submit screen.

**0.6.1-alpha** added fixed **test papers** to every subject: three practice sets with instant feedback and three timed mock papers, each with a topic-by-topic score report and a one-click jump to practise the weakest topic. The paper/ink interface is unchanged. The unshipped OmniLearn prototype folder was removed.

## Files

| File | Purpose |
| --- | --- |
| `index.html` | Page shell, fonts, CDN scripts |
| `styles.css` | Paper, Ink and OLED themes plus layout |
| `app.js` | Routing, identity gate, practice, test papers, exam timer, review, search, local storage, cloud merge |
| `database.js` | Categories, subjects, questions, study cards, tips, videos |
| `sources.js` | Open education source registry with licences and attribution notes |
| `open-bank.js` | Original drills aligned to OpenStax and Illustrative Mathematics chapters |
| `frq-bank.js` | Free-response prompts with rubrics, descriptors and model answers |
| `sw.js` | Service worker: offline shell and runtime cache |
| `manifest.webmanifest` | Installable web app metadata |
| `icon.svg` | App icon and favicon |
| `tests/smoke.py` | Playwright smoke suite for history, resume, misses and corrected |
| `tests/emulator.py` | Firestore emulator suite: merge, two-device sitting, document sizes, rules |
| `firebase.json` | Firestore rules path and local emulator ports |
| `.github/workflows/ci.yml` | CI job that serves the site and runs the smoke suite |
| `ap-courses.js` | All 42 AP course packs and their exam-focused content |
| `exam-prep.js` | SAT, ACT, PSAT, GED and GRE banks (1,000 questions per exam) |
| `new-subjects.js` | Sixteen additional Mathematics, Science, Humanities, Language and Study Vault subjects |
| `expanded-core.js` | Factory and new categories for the large subject catalogue |
| `expanded-*.js` | Mathematics, science, engineering, health, arts, humanities, social-science and language catalogue data |
| `language-packs.js` | High-frequency word decks with plain-English pronunciation guides for all 46 vocabulary languages |
| `subject-banks.js` | Lazy 1,000-question generator; resolves each subject's pool from `questions/` |
| `questions/registry.js` | Pool registry and subject-id → pool mapping |
| `questions/<area>/<pool>.js` | One question pool per subject family (music, chemistry, history, study skills, each exam…) |
| `firebase-config.js` | Public Firebase web config (blank until the project exists) |
| `firebase-sync.js` | Email/password + Google auth, password reset, owner-only Firestore reads and writes |
| `firestore.rules` | `users/{uid}` owner-only rules |
| `firebase.json` | Hosting config (not required for GitHub Pages) |
| `RELEASE_NOTES.md` | 0.7.0-alpha feature, fix and limitation list |
| `ROADMAP.md` | Prioritized next steps after the alpha |
| `NEXT_STEPS.txt` | Plain-text plan for the work after 0.7.0-alpha, plus a release checklist |
| `.nojekyll` | Stops GitHub Pages running Jekyll over the folder |
| `.gitignore` | OS/editor junk and local Freebuff project markers |

## Question codes and open sources

Every question carries two identifiers:

- **Internal id** (`calc-os-1`, `bio-5`, `sat-g0142`): the human-readable slug used in code, storage keys and debugging. It stays stable forever, so progress, bookmarks and saved papers survive.
- **Display code** (`#Q8X49P`): a deterministic six-character code derived from the internal id with FNV-1a and a 31-character alphabet that omits `0`, `O`, `1`, `I` and `L`. It is generated on registration (`getDisplayId`), never stored in the content files, and can be copied from any question or typed into global search with or without the `#`.

Codes are derived, not assigned: the same internal id always produces the same code on every device, and adding a question cannot renumber another one. Because the space is 31^6, a collision is theoretically possible; the lookup keeps every question that owns a code instead of hiding one. `buildIdLookup` returns the boot-time map, and `registerDisplayId` adds lazily generated bank questions to it as they materialise.

### Open question sources

| Source | Licence | How it is used |
| --- | --- | --- |
| [OpenStax](https://openstax.org/subjects) | CC BY 4.0 | Chapter-level scope map for the aligned calculus, precalculus, biology and chemistry drills in `open-bank.js` |
| [Illustrative Mathematics](https://tasks.illustrativemathematics.org/) | CC BY 4.0 | Task-style reference for the aligned algebra and geometry drills |
| [LibreTexts Commons](https://commons.libretexts.org/homework) | Mixed, per page | Referenced for supplementary homework; nothing is reproduced because licences vary by page |
| [College Board SAT Suite Question Bank](https://satsuiteeducatorquestionbank.collegeboard.org/) | Proprietary | Linked for teacher reference only; no College Board items are copied |

Items in `open-bank.js` are **original questions written for Questionaire** and aligned to the cited chapter or task family. Each one names its source and licence in the question UI and in Settings → Question sources. Original drills never claim to be official exam questions.

The repository is self-contained: every file the page loads is tracked, there is no build step and nothing to install. Two things are deliberately not in it — the real Firebase keys (fill in `firebase-config.js`) and a `LICENSE`, which the owner has to choose.

## Content

Eleven sections: AP Courses, Exam Prep, Mathematics, Sciences, Humanities, Engineering & Computing, Health & Medicine, Creative Arts, Social Sciences & Law, Languages and the Universal Study Vault. The catalogue has 443 subjects and a 485,000-question target: 1,000 questions per subject, and 2,000 for each of the 42 AP courses.

Every subject keeps its curated anchor questions first. The remaining questions are built lazily by `subject-banks.js` when a subject is opened or pulled into the review queue, so the static page does not boot all 485,000 cards at once.

Generated questions come from the subject's own pool under `questions/`, never from a broad "science" or "arts" bucket. `questions/registry.js` maps every subject id to one pool: subject ids are listed explicitly in the pool file, so GED cannot inherit art-history facts and AP World History cannot inherit binary arithmetic. Math, data, calculus, computing, physics and language courses keep their numeric and vocabulary generators; physics mixes its pool with calculation items. Music also generates interval, key-signature, relative-key and scale-degree questions from music theory rather than repeating a short fact list. Search indexes a 20-question sample per subject. Generated ids use the stable `<subject-id>-g0001` format, which lets progress, bookmarks and mistakes survive before that subject's bank is materialised. The generated items are subject-specific practice drills rather than official exam questions.

The AP shelf covers all 42 courses in the College Board catalogue for 2026-27: the Arts, English, History and Social Sciences, Math and Computer Science, Sciences, World Languages, AP Capstone and the two AP Career Kickstart courses. Each AP course has two curated exam-style questions, two study cards and two tips, and its bank is expanded to 2,000 questions by the shared generator. AP world-language courses ask about their own course terms rather than beginner vocabulary. AP Networking is not included because it is a 2026-27 pilot and does not join the catalog until Fall 2027.

**Exam prep** adds five exam subjects with 1,000 deterministic practice questions each:

| Exam | Section coverage | Timed section |
| --- | --- | --- |
| SAT | Algebra 240, Advanced Math 240, Problem Solving & Data 120, Geometry & Trigonometry 100, Reading & Writing 300 | 22 questions / 28 min |
| ACT | English 250, Math 300, Reading 250, Science 200 | 20 questions / 17 min |
| PSAT/NMSQT | Algebra 240, Advanced Math 220, Problem Solving & Data 140, Geometry 100, Reading & Writing 300 | 20 questions / 24 min |
| GED | Math 300, Language Arts 300, Science 200, Social Studies 200 | 20 questions / 22 min |
| GRE | Verbal 400, Quant 400, Analytical Writing 200 | 20 questions / 30 min |

The banks are generated from seeded item families and are stable across reloads, so progress ids do not change. They are practice drills, not official College Board, ACT, GED or ETS questions. Official full-length tests should still be taken through the testing companies.

Every language has curated anchor questions, study cards and tips. All 46 vocabulary languages also have a **language studio**: a word bank of 20 high-frequency words with a plain-English pronunciation guide, a Listen button and per-word mastery, plus a flashcards practice mode that shuffles the deck and tracks what you actually know. The practice bank draws on the same deck and asks meaning, recall, which-word and pronunciation questions. English Language is grammar practice and has no word deck, and AP world-language courses practise their own course terms rather than the beginner deck.

The language shelf includes Spanish, French, German, Portuguese, Hindi, Mandarin Chinese, Japanese, Arabic, English Language, Korean, Russian, Italian, Somali, Vietnamese, Turkish, Swahili, Polish, Dutch, Greek, Bengali, Urdu, Persian, Thai, Indonesian, Tagalog, Swedish, Norwegian, Danish, Finnish, Czech, Ukrainian, Romanian, Hungarian, Bulgarian, Serbian, Croatian, Catalan, Amharic, Zulu, Hausa, Yoruba, Igbo, Hebrew, Latin, Ancient Greek, Afrikaans and Icelandic.

To add a subject, copy a block in `database.js` or `new-subjects.js`, or add a compact spec to the relevant `expanded-*.js` file. Give it a unique `id`, and prefix every question id with the subject id. The schema is documented at the top of `database.js`.

## Navigation

The home page starts with search, a progress summary, recommended subjects, the AP shelf and the SAT/ACT/PSAT/GED/GRE shelf. **Browse all subjects** opens the full catalogue with section filters; the AP shelf adds subject-area filters. Every subject opens with **Practice**, a **Learn** tab (guided study path, topic deep dives using real worked questions, video lessons and a YouTube lesson search), the **Word bank** for languages, **Study bank**, **Tips** and **Video lessons**. On phones, the bottom bar keeps Home, Browse, AP, Review and Search one tap away. Large subject banks render 20 cards at a time with a **Load 20 more** control, and every Exam tab samples a timed section instead of trying to run all 1,000 questions. Test papers keep their own **paper history** and unfinished-sitting **resume** prompt; every saved sitting can be reopened for a question-by-question review.

## Accounts and authentication

### Identity gate

`app.js` checks for a cloud user or an active offline profile before rendering any study route. If neither exists, it redirects to `#/login` and remembers the intended route. After a successful local create or cloud sign-in, the app resumes that route.

### Cloud accounts

`firebase-sync.js` supports:

- **Email/password sign-in** with `signInWithEmailAndPassword`.
- **Account creation** with `createUserWithEmailAndPassword`, followed by a display-name update.
- **Password reset** with `sendPasswordResetEmail`.
- **Google sign-in** with `signInWithPopup`.
- **Sign-out** with `signOut`.

There is no anonymous sign-in and no `linkWithPopup` guest migration. Existing anonymous Firebase sessions are signed out on sight.

Every cloud account gets a separate offline cache under `questionaire.progress.v1.cloud.<uid>`. When a user signs in, local/legacy progress is merged into that cache first, then the Firestore record is merged in and written back.

### Offline profiles

An offline profile stores its own progress, XP, streak, bookmarks, mistakes, saved papers and topic mastery in this browser. It is **not password protected** and is not a security boundary; anyone using this browser can open it.

- Profiles are listed in `questionaire.accounts.v1`.
- Each offline profile stores progress under `questionaire.progress.v1.account.<id>`.
- If no offline profiles exist, the first one imports the old guest record once and then deletes the legacy guest key.
- Signing out of an offline profile returns to the login screen. It does not restore a guest record.
- Switching profiles swaps in that profile's record; deleting a profile removes its stored progress.
- While a cloud account is active, offline profiles are hidden. Sign out of the cloud account to use them.

### Removed guest profiles

The old `questionaire.progress.v1` guest record is no longer an active identity and is never loaded as progress. It is read once as migration input, then deleted when the first offline profile or first cloud account is created. After that there is no guest profile and no guest fallback.

### Merge policy

- Questions: union by question id; keep the highest attempt count and the first correct timestamp.
- Vocabulary: union by subject and word; a word stays known if either side knows it, with the highest repetition count and the latest review date.
- Bookmarks and mistakes: union the id sets, dropping ids that are no longer valid; generated `<subject-id>-g0001` ids survive before their lazy bank is loaded.
- Corrected misses: union the corrected map by question id; a corrected question leaves the active mistake list instead of reappearing.
- Written answers: per subject and prompt, keep the record with the later `updatedAt`; a draft and its self-grade travel together.
- Saved papers: union attempts by attempt id, newest first, capped at the latest 60 sittings per profile.
- Unfinished sittings: the newest save becomes the resume target; up to three others are kept in `progress.paused` and offered on the dashboard. The same paper saved on two devices keeps only the later save.
- Topic mastery: per subject and topic, keep the higher correct and total counts so replaying a topic cannot lower recorded mastery.
- XP: merge with `max(local, cloud)` so replaying a question cannot double-count it.
- Streak: keep the latest study date and the best streak; the current streak is normalized on load.
- Theme and last route: local preference wins.

## Firebase setup

1. Create a Firebase project.
2. Enable **Email/Password** and **Google** under Authentication → Sign-in method.
3. Create a Firestore database in production mode and deploy `firestore.rules` (or paste the rule below):

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;

      // Per-item answer records, split into chunks so the profile never hits
      // the 1 MiB document limit. Same owner-only rule.
      match /items/{chunk} {
        allow read, write: if request.auth != null && request.auth.uid == uid;
      }
    }
  }
}
```

4. Add `mh-studioz.github.io` as an authorized OAuth domain. Add `localhost` too if you want to test the Google popup locally.
5. Copy the public web config from Project settings → Your apps → Web app into `firebase-config.js`:

```js
window.FIREBASE_CONFIG = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  appId: "..."
};
```

These four values are public and safe to commit. Do **not** add a service-account key or client secret.

6. Deploy the rules with `firebase deploy --only firestore:rules`, then test email/password sign-up, sign-in, reset, Google sign-in, Firestore write, reload and merge on the live origin.

With the config blank, the login page says cloud login is unconfigured and offline profiles remain available. Once all four keys are present, the email/password forms and Google button appear automatically.

### Verifying cloud sync

`tests/emulator.py` runs the app against the local Auth and Firestore emulators (ports from `firebase.json`) and asserts the merge, the two-device sitting, the document sizes and the rules:

```bash
firebase emulators:start --only auth,firestore --project questionaire-emulator
python tests/emulator.py          # BASE_URL defaults to http://127.0.0.1:5173
```

The suite intercepts `firebase-config.js` in the browser and answers with an emulator config, so the committed config stays blank. `firebase-sync.js` only connects to an emulator when the config carries `emulator: { host, authPort, firestorePort }`. The `emulator` job in `.github/workflows/ci.yml` runs the same suite on every push and pull request.

The emulator rejects a single oversized value but does not enforce the 1 MiB document limit, which is why the client keeps the main document under 900 KiB on its own.

### Written answers

`frq-bank.js` adds free-response prompts to a subject by id:

```js
window.QUESTIONAIRE_FRQ_BANK = {
  calculus: [{
    id: "calc-frq-1",
    title: "...", prompt: "...",
    criteria: [{ id: "identify", label: "...", max: 2, descriptors: { 0: "...", 1: "...", 2: "..." } }],
    model: ["..."], guidance: "..."
  }]
};
```

The rubric is shown before writing, the model answer only after a grade is saved, and each prompt is scored out of the sum of its criteria. Records live under `progress.frq[subjectId][promptId]` as `{ answer, scores, gradedAt, updatedAt }`; drafts save 450 ms after typing stops.

### Offline and install

`sw.js` precaches the shell and local scripts, then caches same-origin GET responses at runtime (versioned `?v=` URLs included). Navigation is network-first with a cached `index.html` fallback. The catalogue is generated in the browser, so once the shell is cached a subject bank, paper or mock exam opens with no connection; mock deadlines are absolute timestamps, so a resumed timed paper keeps its original clock. Bump `CACHE` in `sw.js` whenever app files change. Registration is best-effort and skipped on `file:` URLs.

### Keyboard and screen readers

In the paper runner, when focus is not in a control: **A–D** or **1–4** answer, **Enter** advances (or opens review on the last question), **←/→** move, **F** marks for review and **R** opens the review screen. Answers, marks and timer thresholds are written to a polite live region, and the current question receives focus after navigation. The navigator marks the current question with `aria-current`.

### Tests

```bash
python -m pip install playwright
python -m playwright install chromium
python -m http.server 4173 --bind 127.0.0.1
BASE_URL=http://127.0.0.1:4173 python tests/smoke.py
```

The suite creates a guest session, answers a full practice set, checks the history row, resumes a sitting after reload, retakes every miss correctly and expects the **Later corrected** badges in the review queue. CI runs the same script.

### Authentication limitations

The Firebase email/password and Google flows are implemented, but they cannot be exercised in this repository until a real Firebase project and public config exist. Offline profile flows and the unconfigured state are testable without Firebase.
