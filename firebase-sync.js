/* ============================================================================
   QUESTIONAIRE — firebase-sync.js
   ----------------------------------------------------------------------------
   Optional cloud layer. The module does nothing until the public config in
   firebase-config.js is filled in.

   Supported accounts:
     - Email + password (sign in, create account, password reset)
     - Google popup sign-in

   There is no anonymous/guest Firebase account. One owner-only Firestore
   document is stored at users/{uid}. localStorage remains the offline cache;
   the app keeps a separate local record for each cloud UID.

   This file never stores a service-account key or a client secret.
   ========================================================================== */

(function () {
  "use strict";

  const CONFIG = window.FIREBASE_CONFIG || {};
  /* Local development hook. Set in firebase-config.js only while testing:
       emulator: { host: "127.0.0.1", authPort: 9099, firestorePort: 8080 }
     Production config leaves it out, so the SDK always talks to Firebase. */
  const EMULATOR = CONFIG.emulator && CONFIG.emulator.host ? CONFIG.emulator : null;
  const REQUIRED = ["apiKey", "authDomain", "projectId", "appId"];
  const CONFIGURED = REQUIRED.every(function (key) {
    return typeof CONFIG[key] === "string" && CONFIG[key].trim() && CONFIG[key].indexOf("YOUR_") < 0;
  });

  const SDK_VERSION = "10.13.2";
  const SDK_BASE = "https://www.gstatic.com/firebasejs/" + SDK_VERSION + "/";

  let app = null;
  let auth = null;
  let db = null;
  let sdk = null;
  let startPromise = null;
  let operation = null;
  let error = null;
  let user = null;
  const listeners = new Set();

  const state = {
    configured: CONFIGURED,
    status: CONFIGURED ? "idle" : "unconfigured",
    user: null,
    error: null
  };

  function publicUser(value) {
    if (!value) return null;
    const providers = (value.providerData || [])
      .map(function (provider) { return provider && provider.providerId; })
      .filter(Boolean);
    return {
      uid: value.uid,
      isAnonymous: Boolean(value.isAnonymous),
      displayName: value.displayName || "",
      email: value.email || "",
      photoURL: value.photoURL || "",
      providers: providers,
      provider: providers[0] || (value.email ? "password" : "")
    };
  }

  function snapshot() {
    return {
      configured: state.configured,
      status: state.status,
      user: publicUser(user),
      error: error,
      operation: operation
    };
  }

  function publish() {
    state.user = publicUser(user);
    state.error = error;
    const value = snapshot();
    listeners.forEach(function (listener) {
      try {
        listener(value);
      } catch (listenerError) {
        /* A broken listener must not break auth. */
      }
    });
    try {
      window.dispatchEvent(new CustomEvent("questionaire:cloud-state", { detail: value }));
    } catch (dispatchError) {
      /* CustomEvent is available in all supported browsers. */
    }
  }

  function friendlyError(caught) {
    const code = caught && caught.code ? caught.code : "";
    if (code === "auth/operation-not-allowed") {
      return "This sign-in method is disabled in Firebase Authentication.";
    }
    if (code === "auth/unauthorized-domain") {
      return "This origin is not an authorized Firebase OAuth domain.";
    }
    if (code === "auth/popup-blocked") {
      return "The browser blocked the Google popup. Allow popups for this site and try again.";
    }
    if (code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request") {
      return "Google sign-in was closed before it finished.";
    }
    if (code === "auth/account-exists-with-different-credential") {
      return "That email already uses another sign-in method. Use the method you originally chose.";
    }
    if (code === "auth/credential-already-in-use" || code === "auth/email-already-in-use") {
      return "An account already exists for that email. Sign in instead, or reset the password.";
    }
    if (code === "auth/invalid-email") {
      return "Enter a valid email address.";
    }
    if (code === "auth/missing-password") {
      return "Enter your password.";
    }
    if (code === "auth/weak-password") {
      return "Use at least 6 characters for the password.";
    }
    if (code === "auth/wrong-password" || code === "auth/invalid-credential") {
      return "That email and password do not match an account.";
    }
    if (code === "auth/user-not-found") {
      return "No account exists for that email. Create one first.";
    }
    if (code === "auth/user-disabled") {
      return "This account has been disabled in Firebase Authentication.";
    }
    if (code === "auth/too-many-requests") {
      return "Too many attempts. Wait a minute, then try again.";
    }
    if (code === "auth/network-request-failed") {
      return "Firebase could not be reached. Check your connection and try again.";
    }
    if (code === "auth/requires-recent-login") {
      return "Sign in again before changing this account.";
    }
    if (code === "permission-denied") {
      return "Firestore denied the write. Check the owner-only rules and deploy them.";
    }
    if (code === "unavailable") {
      return "Cloud sync is offline. Your progress is still saved on this device.";
    }
    return (caught && caught.message) || "Cloud sign-in could not start.";
  }

  function fail(caught) {
    error = friendlyError(caught);
    state.status = "error";
    operation = null;
    publish();
    return false;
  }

  async function loadSdk() {
    if (sdk) return sdk;
    const modules = await Promise.all([
      import(SDK_BASE + "firebase-app.js"),
      import(SDK_BASE + "firebase-auth.js"),
      import(SDK_BASE + "firebase-firestore.js")
    ]);
    sdk = { app: modules[0], auth: modules[1], firestore: modules[2] };
    return sdk;
  }

  /* One shared boot promise: a sign-in clicked while the SDK is still
     downloading waits for it instead of returning false with no feedback. */
  function start() {
    if (!CONFIGURED) return Promise.resolve();
    if (!startPromise) startPromise = boot();
    return startPromise;
  }

  async function boot() {
    state.status = "loading";
    publish();
    try {
      const loaded = await loadSdk();
      app = loaded.app.initializeApp(CONFIG);
      auth = loaded.auth.getAuth(app);
      db = loaded.firestore.getFirestore(app);

      if (EMULATOR) {
        const host = String(EMULATOR.host);
        const authPort = Number(EMULATOR.authPort) || 9099;
        const firestorePort = Number(EMULATOR.firestorePort) || 8080;
        try {
          loaded.auth.connectAuthEmulator(auth, "http://" + host + ":" + authPort, { disableWarnings: true });
          loaded.firestore.connectFirestoreEmulator(db, host, firestorePort);
        } catch (emulatorError) {
          /* A second start on the same instance already has the emulator wired. */
        }
      }

      try {
        await loaded.auth.setPersistence(auth, loaded.auth.browserLocalPersistence);
      } catch (persistenceError) {
        /* Persistence is best-effort; session auth still works. */
      }

      loaded.auth.onAuthStateChanged(auth, async function (nextUser) {
        if (nextUser && nextUser.isAnonymous) {
          await loaded.auth.signOut(auth);
          return;
        }
        user = nextUser || null;
        error = null;
        state.status = user ? "signed-in" : "signed-out";
        operation = null;
        publish();
      });
    } catch (startupError) {
      fail(startupError);
    }
  }

  async function ensureAuth() {
    if (!CONFIGURED) {
      error = "Add the public Firebase web config before signing in.";
      state.status = "unconfigured";
      publish();
      return false;
    }
    if (!auth) await start();
    return Boolean(auth);
  }

  function startOperation(name) {
    operation = name;
    error = null;
    state.status = "signing-in";
    publish();
  }

  async function signInGoogle() {
    if (!(await ensureAuth())) return false;
    if (auth.currentUser) return true;

    startOperation("google");
    const provider = new sdk.auth.GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });

    try {
      await sdk.auth.signInWithPopup(auth, provider);
      error = null;
      return true;
    } catch (signInError) {
      return fail(signInError);
    } finally {
      operation = null;
      publish();
    }
  }

  async function signInEmail(email, password) {
    if (!(await ensureAuth())) return false;
    const cleanEmail = String(email || "").trim();
    if (!cleanEmail) {
      error = "Enter your email address.";
      state.status = "error";
      publish();
      return false;
    }
    if (!password) {
      error = "Enter your password.";
      state.status = "error";
      publish();
      return false;
    }

    startOperation("email-signin");
    try {
      await sdk.auth.signInWithEmailAndPassword(auth, cleanEmail, password);
      error = null;
      return true;
    } catch (signInError) {
      return fail(signInError);
    } finally {
      operation = null;
      publish();
    }
  }

  async function signUpEmail(displayName, email, password) {
    if (!(await ensureAuth())) return false;
    const cleanName = String(displayName || "").trim().slice(0, 60);
    const cleanEmail = String(email || "").trim();
    if (!cleanEmail) {
      error = "Enter your email address.";
      state.status = "error";
      publish();
      return false;
    }
    if (!password || String(password).length < 6) {
      error = "Use at least 6 characters for the password.";
      state.status = "error";
      publish();
      return false;
    }

    startOperation("email-signup");
    try {
      const credential = await sdk.auth.createUserWithEmailAndPassword(auth, cleanEmail, password);
      if (cleanName) {
        await sdk.auth.updateProfile(credential.user, { displayName: cleanName });
        user = auth.currentUser;
      }
      error = null;
      return true;
    } catch (signUpError) {
      return fail(signUpError);
    } finally {
      operation = null;
      publish();
    }
  }

  async function resetPassword(email) {
    if (!(await ensureAuth())) return false;
    const cleanEmail = String(email || "").trim();
    if (!cleanEmail) {
      error = "Enter the email address for the reset link.";
      state.status = "error";
      publish();
      return false;
    }

    startOperation("password-reset");
    try {
      await sdk.auth.sendPasswordResetEmail(auth, cleanEmail);
      error = null;
      state.status = auth.currentUser ? "signed-in" : "signed-out";
      return true;
    } catch (resetError) {
      return fail(resetError);
    } finally {
      operation = null;
      publish();
    }
  }

  async function signOutUser() {
    if (!auth) return false;
    operation = "sign-out";
    error = null;
    try {
      await sdk.auth.signOut(auth);
      user = null;
      state.status = "signed-out";
      return true;
    } catch (signOutError) {
      return fail(signOutError);
    } finally {
      operation = null;
      publish();
    }
  }

  /* One Firestore document caps at 1 MiB. Per-item records grow with the
     catalogue (13,760 questions and rising), so they live in chunk documents
     under users/{uid}/items and the main document keeps the rest. Measured on
     the emulator: a full-catalogue profile is ~1.5 MB of per-item records. */
  const ITEMS_CHUNK_BYTES = 112 * 1024;
  const MAX_ITEMS_CHUNKS = 24;
  const MAIN_DOC_BUDGET = 900 * 1024;
  let chunkCache = null;

  function byteLength(text) {
    if (typeof TextEncoder === "function") return new TextEncoder().encode(text).length;
    return unescape(encodeURIComponent(text)).length;
  }

  /* The emulator only rejects a single oversized value, not an oversized
     document, so the client keeps the main document under budget itself.
     Oldest sittings go first, then the bulkier secondary collections. The
     local record is never trimmed. */
  function fitCore(core) {
    if (byteLength(JSON.stringify(core)) <= MAIN_DOC_BUDGET) return core;
    const trimmed = Object.assign({}, core);
    trimmed.syncTrimmed = true;
    const steps = [
      function () { trimmed.attempts = (Array.isArray(trimmed.attempts) ? trimmed.attempts : []).slice(0, 20); },
      function () { trimmed.attempts = (trimmed.attempts || []).slice(0, 5); },
      function () { delete trimmed.topicStats; },
      function () { trimmed.corrected = {}; trimmed.bookmarks = []; trimmed.mistakes = []; },
      function () { trimmed.vocab = {}; trimmed.attempts = []; }
    ];
    for (let index = 0; index < steps.length; index += 1) {
      if (byteLength(JSON.stringify(trimmed)) <= MAIN_DOC_BUDGET) break;
      steps[index]();
    }
    return trimmed;
  }

  function chunkItems(answered) {
    const keys = Object.keys(answered || {});
    const bodies = [];
    let bucket = {};
    let size = 2;
    let count = 0;
    keys.forEach(function (key) {
      const piece = JSON.stringify(key) + ":" + JSON.stringify(answered[key]);
      if (count && size + piece.length + 1 > ITEMS_CHUNK_BYTES) {
        bodies.push(JSON.stringify(bucket));
        bucket = {};
        size = 2;
        count = 0;
      }
      bucket[key] = answered[key];
      size += piece.length + 1;
      count += 1;
    });
    if (count) bodies.push(JSON.stringify(bucket));
    return bodies;
  }

  function itemDoc(uid, index) {
    return sdk.firestore.doc(db, "users", uid, "items", "chunk-" + index);
  }

  /* Same rule the app's merge uses for a question: highest counts, first
     correct stamp, latest attempt. */
  function mergeItemRecord(left, right) {
    if (!left) return right;
    if (!right) return left;
    return {
      attempts: Math.max(Number(left.attempts) || 0, Number(right.attempts) || 0),
      correct: Math.max(Number(left.correct) || 0, Number(right.correct) || 0),
      firstCorrect: [left.firstCorrect, right.firstCorrect].filter(Boolean).sort()[0] || null,
      last: [left.last, right.last].filter(Boolean).sort().pop() || null
    };
  }

  async function loadProgress() {
    if (!CONFIGURED || !db || !auth || !auth.currentUser) return null;
    const uid = auth.currentUser.uid;
    try {
      const reference = sdk.firestore.doc(db, "users", uid);
      const result = await sdk.firestore.getDoc(reference);
      if (!result.exists()) return null;
      const data = result.data();
      if (!data || !data.progress || typeof data.progress !== "object") return null;
      const progress = Object.assign({}, data.progress);
      const count = Math.max(0, Math.min(Number(progress.itemChunks) || 0, MAX_ITEMS_CHUNKS));

      if (count > 0) {
        const snapshots = await Promise.all(
          Array.from({ length: count }, function (_, index) {
            return sdk.firestore.getDoc(itemDoc(uid, index)).catch(function () { return null; });
          })
        );
        /* A device still on 0.7.1 writes answer records inline. Union them with
           the chunk documents so a mixed-version account loses nothing. */
        const answered = {};
        const inline = progress.answered && typeof progress.answered === "object" ? progress.answered : {};
        Object.keys(inline).forEach(function (key) { answered[key] = inline[key]; });
        const bodies = [];
        snapshots.forEach(function (snapshot, index) {
          const body = snapshot && snapshot.exists() ? String((snapshot.data() || {}).body || "") : "";
          bodies[index] = body;
          if (!body) return;
          try {
            const parsed = JSON.parse(body);
            if (parsed && typeof parsed === "object") {
              Object.keys(parsed).forEach(function (key) {
                answered[key] = mergeItemRecord(answered[key], parsed[key]);
              });
            }
          } catch (parseError) {
            /* One damaged chunk must not lose the rest of the profile. */
          }
        });
        progress.answered = answered;
        chunkCache = { uid: uid, bodies: bodies };
      } else {
        /* Profiles written before chunking keep their inline answer records. */
        if (!progress.answered || typeof progress.answered !== "object") progress.answered = {};
        chunkCache = { uid: uid, bodies: [] };
      }

      delete progress.itemChunks;
      delete progress.itemCount;
      delete progress.itemsTruncated;
      return progress;
    } catch (loadError) {
      fail(loadError);
      return null;
    }
  }

  async function saveProgress(progress) {
    if (!CONFIGURED || !db || !auth || !auth.currentUser) return false;
    const uid = auth.currentUser.uid;
    try {
      const core = {};
      Object.keys(progress || {}).forEach(function (key) {
        if (key === "answered") return;
        core[key] = progress[key];
      });

      const answered = (progress && progress.answered) || {};
      const bodies = chunkItems(answered);
      if (bodies.length > MAX_ITEMS_CHUNKS) {
        bodies.length = MAX_ITEMS_CHUNKS;
        core.itemsTruncated = true;
      }
      core.itemChunks = bodies.length;
      core.itemCount = Object.keys(answered).length;
      const bounded = fitCore(core);
      /* Clear inline records an older client may still have written; every
         answer record now lives in a chunk document. */
      bounded.answered = sdk.firestore.deleteField();

      const previous = chunkCache && chunkCache.uid === uid ? chunkCache.bodies : [];
      const batch = sdk.firestore.writeBatch(db);
      batch.set(
        sdk.firestore.doc(db, "users", uid),
        { progress: bounded, updatedAt: sdk.firestore.serverTimestamp() },
        { merge: true }
      );
      bodies.forEach(function (body, index) {
        if (previous[index] === body) return;
        batch.set(itemDoc(uid, index), {
          body: body,
          index: index,
          updatedAt: sdk.firestore.serverTimestamp()
        });
      });
      for (let index = bodies.length; index < previous.length; index += 1) {
        batch.delete(itemDoc(uid, index));
      }

      await batch.commit();
      chunkCache = { uid: uid, bodies: bodies };
      error = null;
      if (state.status === "error") state.status = "signed-in";
      publish();
      return true;
    } catch (saveError) {
      fail(saveError);
      return false;
    }
  }

  const api = {
    configured: CONFIGURED,
    get state() {
      return snapshot();
    },
    onChange: function (listener) {
      if (typeof listener !== "function") return function () {};
      listeners.add(listener);
      listener(snapshot());
      return function () {
        listeners.delete(listener);
      };
    },
    start: start,
    signInGoogle: signInGoogle,
    signInEmail: signInEmail,
    signUpEmail: signUpEmail,
    resetPassword: resetPassword,
    signOut: signOutUser,
    loadProgress: loadProgress,
    saveProgress: saveProgress
  };

  window.QuestionaireCloud = api;

  try {
    window.dispatchEvent(new CustomEvent("questionaire:cloud-ready", { detail: api }));
  } catch (readyError) {
    /* The app also checks window.QuestionaireCloud at boot. */
  }

  if (CONFIGURED) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", start, { once: true });
    } else {
      start();
    }
  } else {
    state.status = "unconfigured";
    publish();
  }
})();
