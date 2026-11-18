# Questionaire 2.0.0 — Real accounts release

Released 18 November 2026.

This release turns the previous guest-first prototype into a real account system. Firebase email/password and Google authentication are wired through the Firebase Web SDK, with offline profiles as the fallback when Firebase is unavailable or not configured.

## Highlights

- **Email/password authentication** — create an account, sign in, and reset a forgotten password.
- **Google authentication** — one-click Google sign-in through `signInWithPopup`.
- **No guest accounts** — anonymous Firebase auth, guest profiles and the guest progress record are removed.
- **Identity gate** — study routes redirect to `#/login` until a cloud account or offline profile exists.
- **Offline fallback** — local profiles still work with no Firebase config and keep separate progress per profile.
- **Per-account offline cache** — every cloud UID has its own local progress record before Firestore sync.
- **One-time migration** — an old guest record is imported into the first identity and the guest key is deleted.

## Authentication and accounts

### Cloud accounts

- Email/password sign-up with display name, email and password.
- Email/password sign-in.
- Password-reset email.
- Google popup sign-in.
- Sign-out.
- Friendly errors for disabled providers, unauthorized domains, blocked popups, weak passwords, wrong credentials, duplicate emails, rate limits, network failures and Firestore permission errors.
- Existing anonymous Firebase sessions are signed out automatically.
- Owner-only Firestore document at `users/{uid}`.
- Progress merge on sign-in: union questions/bookmarks/mistakes, maximum XP, latest study date, best streak.
- Cloud progress cache key: `questionaire.progress.v1.cloud.<uid>`.

### Offline profiles

- Create a profile with a display name and optional email.
- Separate progress, XP, streak, bookmarks and mistakes per profile.
- Switch profiles, sign out, and delete a profile with its stored progress.
- Explicit warning that offline profiles are device-local and not password protected.
- Profile list key: `questionaire.accounts.v1`.
- Profile progress key: `questionaire.progress.v1.account.<id>`.
- Offline profiles are hidden while a cloud account is active; sign out of the cloud account to use them.

### Guest removal and migration

- The old guest key `questionaire.progress.v1` is no longer loaded as active progress.
- Its data is read once as migration input and deleted when the first offline profile or first cloud account is created.
- After migration, no guest identity or guest fallback remains.
- Signing out now returns to `#/login`, not to a guest record.
- Resetting progress only clears the active identity.

## Study catalogue

- **443 subjects** across 11 sections.
- **443,000-question target**, with 1,000 questions per subject generated lazily.
- **47 languages**, including Spanish, French, German, Portuguese, Hindi, Mandarin Chinese, Japanese, Arabic, English Language, Korean, Russian, Italian, Somali, Vietnamese, Turkish, Swahili, Polish, Dutch, Greek, Bengali, Urdu, Persian, Thai, Indonesian, Tagalog, Swedish, Norwegian, Danish, Finnish, Czech, Ukrainian, Romanian, Hungarian, Bulgarian, Serbian, Croatian, Catalan, Amharic, Zulu, Hausa, Yoruba, Igbo, Hebrew, Latin, Ancient Greek, Afrikaans and Icelandic.
- **42 AP courses** with curated questions, study cards, tips and generated banks.
- **5 exam-prep banks**: SAT, ACT, PSAT/NMSQT, GED and GRE, each with 1,000 deterministic questions and a timed section.
- Advanced mathematics, sciences, engineering, medicine, arts, humanities, social sciences, law, business and the Universal Study Vault.
- Stable generated ids (`<subject-id>-g0001`) so progress survives before a lazy bank is materialised.
- Curated anchor questions appear before generated practice.

## Learning and interface

- Practice, study-bank, tips and video tabs.
- Timed exam mode with deadline-based countdown.
- Unified review queue for bookmarks and mistakes.
- Global search with subject, topic and question results.
- Paper, Ink and OLED themes.
- Responsive sidebar, mobile quick navigation and account panel.
- Local XP, levels, streaks and progress summaries.
- 20-card pagination for large subject banks.
- KaTeX formula rendering and Lucide icons.

## Fixes and review changes

- Removed the guest-first account panel and replaced it with cloud/offline identity states.
- Removed anonymous Firebase auth and `linkWithPopup` guest upgrading.
- Fixed first-profile progress ownership by migrating the old guest record once.
- Fixed profile switching so it persists the outgoing profile before loading the next one.
- Added separate cloud cache keys so different Firebase accounts do not share local progress.
- Added a route gate so direct study links cannot bypass login.
- Preserved the intended route across login and resumed it after authentication.
- Repainted the login page when Firebase auth state changes.
- Added email/password and Google error messages instead of generic failures.
- Updated the README and Firebase setup instructions for Email/Password + Google.
- Removed stale guest wording from the dashboard, sidebar, footer and account panel.

## Upgrade notes

1. Existing guest progress is migrated into the first offline profile or cloud account; the old guest key is then deleted.
2. Existing offline profiles keep their `questionaire.progress.v1.account.<id>` records.
3. Cloud accounts use `questionaire.progress.v1.cloud.<uid>` caches.
4. If Firebase is unconfigured, no cloud forms are shown; offline profiles are the only identity path.

## Firebase setup

1. Create a Firebase project.
2. Enable **Email/Password** and **Google** under Authentication → Sign-in method.
3. Create Firestore in production mode and deploy `firestore.rules`.
4. Add `mh-studioz.github.io` (and `localhost`) as authorized OAuth domains.
5. Paste the public `apiKey`, `authDomain`, `projectId` and `appId` into `firebase-config.js`.
6. Deploy rules with `firebase deploy --only firestore:rules`.
7. Test sign-up, sign-in, password reset, Google popup, Firestore write, reload and merge on the live origin.

## Verification

Verified locally:

- Unconfigured Firebase state shows offline profiles and no cloud forms.
- Direct `#/dashboard` navigation redirects to `#/login`.
- Offline profile creation imports the old guest record once and removes the guest key.
- Offline profile sign-out returns to login with no guest fallback.
- Profile switching restores the correct separate XP record.
- Profile deletion removes its progress key.
- No console errors beyond the existing Tailwind CDN warning.

Not verified here:

- Real Firebase email/password sign-up and sign-in.
- Real Google popup sign-in.
- Password-reset email delivery.
- Firestore reads/writes and cross-device merge.

Those require a real Firebase project, enabled providers, authorized OAuth domains, deployed rules and the public config.
