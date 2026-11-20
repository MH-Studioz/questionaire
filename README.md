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

## Release 0.6-alpha

The complete release list is in [`RELEASE_NOTES.md`](RELEASE_NOTES.md). It covers the real login system, removal of guest profiles, offline fallback, the 443-subject catalogue, 47 languages, the language studio (word decks with pronunciation plus flashcards), AP/exam banks, language-bank fixes, dead-code cleanup, and the known alpha limitations.

## Files

| File | Purpose |
| --- | --- |
| `index.html` | Page shell, fonts, CDN scripts |
| `styles.css` | Paper, Ink and OLED themes plus layout |
| `app.js` | Routing, identity gate, practice, exam timer, review, search, local storage, cloud merge |
| `database.js` | Categories, subjects, questions, study cards, tips, videos |
| `ap-courses.js` | All 42 AP course packs and their exam-focused content |
| `exam-prep.js` | SAT, ACT, PSAT, GED and GRE banks (1,000 questions per exam) |
| `new-subjects.js` | Sixteen additional Mathematics, Science, Humanities, Language and Study Vault subjects |
| `expanded-core.js` | Factory and new categories for the large subject catalogue |
| `expanded-*.js` | Mathematics, science, engineering, health, arts, humanities, social-science and language catalogue data |
| `language-packs.js` | High-frequency word decks with plain-English pronunciation guides for all 46 vocabulary languages |
| `subject-banks.js` | Lazy 1,000-question generator that fills every subject bank |
| `firebase-config.js` | Public Firebase web config (blank until the project exists) |
| `firebase-sync.js` | Email/password + Google auth, password reset, owner-only Firestore reads and writes |
| `firestore.rules` | `users/{uid}` owner-only rules |
| `firebase.json` | Hosting config (not required for GitHub Pages) |
| `RELEASE_NOTES.md` | 0.6-alpha feature, fix and limitation list |
| `ROADMAP.md` | Prioritized next steps after the alpha |
| `NEXT_STEPS.txt` | Plain-text plan for the work after 0.6-alpha, plus a release checklist |
| `.nojekyll` | Stops GitHub Pages running Jekyll over the folder |
| `.gitignore` | OS/editor junk and local Freebuff project markers |

The repository is self-contained: every file the page loads is tracked, there is no build step and nothing to install. Two things are deliberately not in it — the real Firebase keys (fill in `firebase-config.js`) and a `LICENSE`, which the owner has to choose.

## Content

Eleven sections: AP Courses, Exam Prep, Mathematics, Sciences, Humanities, Engineering & Computing, Health & Medicine, Creative Arts, Social Sciences & Law, Languages and the Universal Study Vault. The catalogue has 443 subjects and a 485,000-question target: 1,000 questions per subject, and 2,000 for each of the 42 AP courses.

Every subject keeps its curated anchor questions first. The remaining questions are built lazily by `subject-banks.js` when a subject is opened or pulled into the review queue, so the static page does not boot all 485,000 cards at once. Search indexes a 20-question sample per subject. Generated ids use the stable `<subject-id>-g0001` format, which lets progress, bookmarks and mistakes survive before that subject's bank is materialised. The generated items are subject-specific practice drills rather than official exam questions.

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

The home page starts with search, a progress summary, recommended subjects, the AP shelf and the SAT/ACT/PSAT/GED/GRE shelf. **Browse all subjects** opens the full catalogue with section filters; the AP shelf adds subject-area filters. Every subject opens with **Practice**, a **Learn** tab (guided study path, topic deep dives using real worked questions, video lessons and a YouTube lesson search), the **Word bank** for languages, **Study bank**, **Tips** and **Video lessons**. On phones, the bottom bar keeps Home, Browse, AP, Review and Search one tap away. Large subject banks render 20 cards at a time with a **Load 20 more** control, and every Exam tab samples a timed section instead of trying to run all 1,000 questions.

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

An offline profile stores its own progress, XP, streak, bookmarks and mistakes in this browser. It is **not password protected** and is not a security boundary; anyone using this browser can open it.

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

### Authentication limitations

The Firebase email/password and Google flows are implemented, but they cannot be exercised in this repository until a real Firebase project and public config exist. Offline profile flows and the unconfigured state are testable without Firebase.
