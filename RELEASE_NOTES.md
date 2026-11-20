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

## Catalogue

- **443 subjects**, 443 unique ids.
- **443,000-question target**: 1,000 questions per subject.
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
- Updated the README, release notes and cache versions.

## Verification

Verified in the browser and static checks:

- 443 subjects, 443 unique ids, 11 categories.
- Every subject reports a 1,000-question target.
- All subjects have study cards and tips.
- 47 language subjects; 46 vocabulary decks; all 1,000-question banks materialize.
- All 46 vocabulary subjects resolve a deck; English Language resolves none, as designed.
- 920 words total, every one with an English gloss, a pronunciation guide and a theme.
- 45,900 generated language questions (46 banks × 998) checked: four non-empty, distinct options and a valid answer index every time; at least 90 distinct prompt templates per language.
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

Asset query strings were bumped to `0.6.1-alpha` so browsers pick up the new language studio; the release itself is still **0.6-alpha**.

Existing offline profiles keep their ids. Existing guest progress is migrated once. Old guest progress keys are removed after the first identity is created. Vocabulary mastery is merged on sign-in like any other progress.

## Next steps

See [`ROADMAP.md`](ROADMAP.md) for the prioritized beta backlog: live Firebase proof, deeper language dictionaries, non-repeating language generators, account deletion/export, email verification, sync retry, Playwright + Firebase Emulator tests, accessibility, PWA offline support and content QA.
