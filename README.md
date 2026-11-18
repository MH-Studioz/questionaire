# Questionaire

A static study annual for the browser: every current AP course, SAT/ACT/PSAT/GED/GRE practice, plus question banks, cheat sheets, memory notes and video lessons across maths, sciences, humanities and languages. Progress is stored locally by default; optional Google sync mirrors it to a private Firestore record when the public Firebase config is filled in.

**Live:** https://mh-studioz.github.io/questionaire/

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

## Files

| File | Purpose |
| --- | --- |
| `index.html` | Page shell, fonts, CDN scripts |
| `styles.css` | Paper, Ink and OLED themes plus layout |
| `app.js` | Routing, practice, exam timer, review, search, localStorage, cloud merge |
| `database.js` | Categories, subjects, questions, study cards, tips, videos |
| `ap-courses.js` | All 42 AP course packs and their exam-focused content |
| `exam-prep.js` | SAT, ACT, PSAT, GED and GRE banks (1,000 questions per exam) |
| `new-subjects.js` | Sixteen additional Mathematics, Science, Humanities, Language and Study Vault subjects |
| `expanded-core.js` | Factory and new categories for the large subject catalogue |
| `expanded-*.js` | Mathematics, science, engineering, health, arts, humanities, social-science and language catalogue data |
| `subject-banks.js` | Lazy 1,000-question generator that fills every subject bank |
| `firebase-config.js` | Public Firebase web config (blank until the project exists) |
| `firebase-sync.js` | Anonymous/Google auth, owner-only Firestore reads and writes |
| `firestore.rules` | `users/{uid}` owner-only rules |

## Content

Eleven sections: AP Courses, Exam Prep, Mathematics, Sciences, Humanities, Engineering & Computing, Health & Medicine, Creative Arts, Social Sciences & Law, Languages and the Universal Study Vault. The catalogue has 443 subjects and a 443,000-question target: 1,000 questions per subject.

Every subject keeps its curated anchor questions first. The remaining questions are built lazily by `subject-banks.js` when a subject is opened or pulled into the review queue, so the static page does not boot all 443,000 cards at once. Search indexes a 20-question sample per subject. Generated ids use the stable `<subject-id>-g0001` format, which lets progress, bookmarks and mistakes survive before that subject's bank is materialised. The generated items are subject-specific practice drills rather than official exam questions.

The AP shelf covers all 42 courses in the College Board catalogue for 2026-27: the Arts, English, History and Social Sciences, Math and Computer Science, Sciences, World Languages, AP Capstone and the two AP Career Kickstart courses. Each AP course has two curated exam-style questions, two study cards and two tips, and its bank is expanded to 1,000 questions by the shared generator. AP Networking is not included because it is a 2026-27 pilot and does not join the catalog until Fall 2027.

**Exam prep** adds five exam subjects with 1,000 deterministic practice questions each:

| Exam | Section coverage | Timed section |
| --- | --- | --- |
| SAT | Algebra 240, Advanced Math 240, Problem Solving & Data 120, Geometry & Trigonometry 100, Reading & Writing 300 | 22 questions / 28 min |
| ACT | English 250, Math 300, Reading 250, Science 200 | 20 questions / 17 min |
| PSAT/NMSQT | Algebra 240, Advanced Math 220, Problem Solving & Data 140, Geometry 100, Reading & Writing 300 | 20 questions / 24 min |
| GED | Math 300, Language Arts 300, Science 200, Social Studies 200 | 20 questions / 22 min |
| GRE | Verbal 400, Quant 400, Analytical Writing 200 | 20 questions / 30 min |

The banks are generated from seeded item families and are stable across reloads, so progress ids do not change. They are practice drills, not official College Board, ACT, GED or ETS questions. Official full-length tests should still be taken through the testing companies.

Every language has curated anchor questions, study cards and tips; the headline languages also have vocabulary drills built into their banks.

The expansion covers advanced mathematics from set theory and topology to analysis, combinatorics and mathematical finance; physics, chemistry, biology, Earth science, astronomy, medicine and engineering; music, visual art, film and design; history, philosophy, literature, linguistics, law, business and social science; and a much larger world-language shelf.

The language shelf now includes Spanish, French, German, Portuguese, Hindi, Mandarin Chinese, Japanese, Arabic, English Language, Korean, Russian, Italian, Somali, Vietnamese, Turkish, Swahili, Polish, Dutch, Greek, Bengali, Urdu, Persian, Thai, Indonesian, Tagalog, Swedish, Norwegian, Danish, Finnish, Czech, Ukrainian, Romanian, Hungarian, Bulgarian, Serbian, Croatian, Catalan, Amharic, Zulu, Hausa, Yoruba, Igbo, Hebrew, Latin, Ancient Greek, Afrikaans and Icelandic.

To add a subject, copy a block in `database.js` or `new-subjects.js`, or add a compact spec to the relevant `expanded-*.js` file. Give it a unique `id`, and prefix every question id with the subject id. The schema is documented at the top of `database.js`.

## Navigation

The home page starts with search, a progress summary, recommended subjects, the AP shelf and the SAT/ACT/PSAT/GED/GRE shelf. **Browse all subjects** opens the full catalogue with section filters; the AP shelf adds subject-area filters. On phones, the bottom bar keeps Home, Browse, AP, Review and Search one tap away. Large subject banks render 20 cards at a time with a **Load 20 more** control, and every Exam tab samples a timed section instead of trying to run all 1,000 questions.

## Accounts and cloud sync

Guest progress lives in `localStorage` under `questionaire.progress.v1`. The Firebase client and merge logic are implemented but **dormant until the public web config is filled in**. With the config blank, the sidebar and Settings show **Guest record / Cloud sync is not configured yet** and guest mode works normally.

**How guest progress survives sign-in**

1. On first visit with a valid config, the visitor is signed in anonymously. That creates a stable UID without showing a login screen.
2. `localStorage` remains the offline source of truth, and progress is mirrored to `users/{uid}`.
3. **Continue with Google** calls `linkWithPopup(currentUser, new GoogleAuthProvider())`, upgrading the anonymous account in place so the UID and cloud record survive.
4. If that Google account already has a record, the code falls back to `signInWithPopup` and merges the two progress records instead of failing.
5. On later visits, Google sign-in reads the cloud document and merges it with local progress before writing the result back.

**Merge policy**

- Questions: union by question id; keep the highest attempt count and the first correct timestamp.
- Bookmarks and mistakes: union the id sets, dropping ids that are no longer valid; generated `<subject-id>-g0001` ids survive before their lazy bank is loaded.
- XP: merge with `max(local, cloud)` so replaying a question cannot double-count it.
- Streak: keep the latest study date and the best streak; the current streak is normalized on load.
- Theme and last route: local preference wins.

**Firebase setup**

1. Create a Firebase project and enable **Anonymous** and **Google** under Authentication → Sign-in method.
2. Create a Firestore database in production mode and deploy `firestore.rules` (or paste the rule below):

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

3. Add `mh-studioz.github.io` as an authorized OAuth domain. Add `localhost` too if you want to test the popup locally.
4. Copy the public web config from Project settings → Your apps → Web app into `firebase-config.js`:

```js
window.FIREBASE_CONFIG = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  appId: "..."
};
```

These four values are public and safe to commit. Do **not** add a service-account key or client secret.
5. Deploy the rules with `firebase deploy --only firestore:rules`, then test the popup on the live origin. The full Google popup → Firestore write → reload → merge flow cannot be verified until the config and OAuth domain exist.

The live site intentionally does not show a broken sign-in button before step 4. The account panel switches to **Continue with Google** as soon as `firebase-config.js` contains all four keys.
