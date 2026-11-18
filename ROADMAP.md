# Questionaire roadmap

This is the next-steps backlog after the 0.6-alpha release. The alpha is usable with offline profiles today; live cloud login still needs a real Firebase project.

## Before beta

### 1. Prove the Firebase path against a real project

- Create a Firebase project with Email/Password and Google enabled.
- Add `mh-studioz.github.io` and `localhost` as authorized domains.
- Deploy `firestore.rules`.
- Test sign-up → verification → sign-in → reload → save → second device → sign-out.
- Test wrong password, duplicate email, reset email, blocked popup and Firestore permission failure.
- Decide whether unverified email addresses may study or sync.

### 2. Deepen language banks

The current language banks are generated from 8–10 core words per language, so a 1,000-question vocabulary bank repeats 34–43 prompt templates (English grammar has 66). It is useful vocabulary drilling, not a full language course.

- Expand each dictionary to 24–40 high-frequency words with parts of speech.
- Add numbers, colours, family, food, days and common verbs.
- Add a non-repeating question id strategy: word × prompt form × context.
- Add reading passages and short translations for intermediate levels.
- Add script/transliteration fields for non-Latin languages.
- Add audio or pronunciation only after licensing and file-size review.
- Keep AP language courses separate from beginner vocabulary; AP Spanish Literature is already classified as concept practice rather than vocabulary.

### 3. Finish account lifecycle

- Account deletion and data export.
- Email verification and resend controls.
- Change password / reauthenticate.
- Link Google and email/password to one account where Firebase allows it.
- Show sync state and last successful save time.
- Queue failed Firestore writes and retry when online.
- Add Firebase App Check before opening registration widely.

### 4. Automated checks

- Add Playwright smoke tests for the identity gate, local profile lifecycle, practice answer, review queue and language bank shape.
- Add a Firebase Emulator Suite test for sign-up, sign-in and Firestore rules.
- Add a static content check for 443 unique ids, 1,000 targets, duplicate prompts and malformed options.
- Run the checks in CI on every push.

## Next

- **Progress portability:** export/import a JSON progress file; move an offline profile into a cloud account deliberately.
- **Offline installation:** service worker and PWA manifest; cache the app shell and selected banks.
- **Accessibility:** keyboard review of the full practice flow, focus management in the sidebar and login forms, reduced-motion support, contrast audit in all three themes.
- **Performance:** measure first interaction on mobile, lazy-load large data files, cache generated banks and cap memory.
- **Study quality:** per-topic mastery, spaced-repetition scheduling, confidence ratings and “why this answer is wrong” explanations.
- **Search:** ranking, recent searches, keyboard navigation through results and subject aliases.
- **Content QA:** duplicate/near-duplicate detection across generated banks; answer-option sanity checks; subject-specific review queues.
- **Local profile protection:** optional PIN or passphrase (still device-local, not a replacement for a real account).
- **Timezone-safe streaks:** store a timezone offset or UTC day key so travel does not reset the streak.

## Later / not discussed yet

- Teacher or classroom spaces with assignments and read-only progress dashboards.
- Shareable study packs and a public subject catalogue without sharing private progress.
- Full UI localization and right-to-left layout support.
- AI-generated explanations or tutoring with an owner-funded key, strict model allowlists, per-user limits and clear cost controls.
- Privacy controls: analytics opt-in, retention policy, account deletion and a plain-language data map.
- Social features only after moderation and privacy design; no public profiles by default.
- Native mobile shell if browser offline support is not enough.

## Known alpha limitations

- Live Firebase auth and Firestore sync are implemented but not verified against a real project in this repository.
- Language banks repeat templates; they are drills, not a complete curriculum.
- Offline profiles are not password protected.
- No Firebase account deletion or email verification gate yet.
- No automated test suite yet; verification is browser smoke testing plus static checks.
- The app still depends on CDN-hosted fonts, icons, KaTeX and Tailwind.
