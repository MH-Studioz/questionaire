# Questionaire

A static study annual for the browser: every current AP course plus question banks, cheat sheets, memory notes and video lessons across maths, sciences, humanities and languages. Progress is stored locally and nothing is sent to a server.

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
| `app.js` | Routing, practice, exam timer, review, search, localStorage |
| `database.js` | Categories, subjects, questions, study cards, tips, videos |
| `ap-courses.js` | All 42 AP course packs and their exam-focused content |

## Content

Six sections: AP Courses, Mathematics, Sciences, Humanities, Languages and the Universal Study Vault. The catalogue has 70 subjects and 179 questions.

The AP shelf covers all 42 courses in the College Board catalogue for 2026-27: the Arts, English, History and Social Sciences, Math and Computer Science, Sciences, World Languages, AP Capstone and the two AP Career Kickstart courses. Each AP course has two exam-style questions, two study cards and two tips. AP Networking is not included because it is a 2026-27 pilot and does not join the catalog until Fall 2027.

Languages includes Spanish, French, German, Portuguese, Hindi, Mandarin Chinese, Japanese, Arabic and English Language, with three questions, three study cards, three tips and two videos each.

To add a subject, copy a block in `database.js`, give it a unique `id`, and prefix every question id with the subject id. The schema is documented at the top of that file.

## Navigation

The home page starts with search, a progress summary, recommended subjects and the AP shelf. **Browse all subjects** opens the full catalogue with section filters; the AP shelf adds subject-area filters. On phones, the bottom bar keeps Home, Browse, AP, Review and Search one tap away.

## Accounts (scoped, not live yet)

Guest progress currently lives in `localStorage` under `questionaire.progress.v1`. A real Google account option would use Firebase Authentication and Firestore; the site is static, so no server is required.

**How guest progress survives sign-in**

1. On first visit, sign the visitor in anonymously with Firebase. That creates a stable UID without showing a login screen.
2. Keep writing progress to `localStorage` as the offline source of truth.
3. When the visitor chooses **Continue with Google**, complete the Google popup flow and call `linkWithPopup(currentUser, new GoogleAuthProvider())`. Linking upgrades the anonymous account in place; the UID does not change.
4. Push the merged progress to `users/{uid}/progress` in Firestore.
5. On later visits, sign in with Google, read the cloud document, and merge it with any local progress.

**Merge policy**

- Questions: union by question id; keep the highest attempt count and the earliest correct answer.
- Bookmarks and mistakes: union the id sets.
- XP: store the earned total and merge with `max(local, cloud)` so replaying a question cannot double-count it.
- Streak: keep the most recent study date and the best streak, then recompute the current streak from dates.
- Theme and last route: local preference wins.

**Firebase setup required**

- A Firebase project with Google enabled as a sign-in provider.
- Anonymous and Google providers both enabled.
- Firestore in production mode with owner-only rules:

```js
match /users/{uid} {
  allow read, write: if request.auth != null && request.auth.uid == uid;
}
```

- `mh-studioz.github.io` added as an authorized domain for the OAuth client.
- The Firebase web config placed in the page (it is public), with no service-account key in the repository.

**Why it is not enabled in this build:** it needs a Firebase project and Google OAuth client owned by the site owner. Without those credentials a sign-in button would fail at the popup, so the site deliberately ships guest-only until the config exists.
