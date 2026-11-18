/* ============================================================================
   QUESTIONAIRE — firebase-sync.js
   ----------------------------------------------------------------------------
   Optional cloud layer. The module does nothing until the public config in
   firebase-config.js is filled in. It signs guests in anonymously, upgrades
   that anonymous account to Google in place where possible, and stores one
   owner-only document at users/{uid}.

   The app still treats localStorage as the offline source of truth. This file
   only mirrors the merged record and never stores a service-account key.
   ========================================================================== */

(function () {
  "use strict";

  const CONFIG = window.FIREBASE_CONFIG || {};
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
  let started = false;
  let suppressAnonymous = false;
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
    return {
      uid: value.uid,
      isAnonymous: Boolean(value.isAnonymous),
      displayName: value.displayName || "",
      email: value.email || "",
      photoURL: value.photoURL || ""
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
      return "This sign-in provider is disabled in Firebase Authentication.";
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
    if (code === "auth/credential-already-in-use" || code === "auth/email-already-in-use") {
      return "That Google account already has a record. Sign-in was used instead of linking.";
    }
    if (code === "permission-denied") {
      return "Firestore denied the write. Check the owner-only rules and deploy them.";
    }
    if (code === "unavailable") {
      return "Cloud sync is offline. Your progress is still saved on this device.";
    }
    return (caught && caught.message) || "Cloud sync could not start.";
  }

  function fail(caught) {
    error = friendlyError(caught);
    state.status = "error";
    operation = null;
    publish();
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

  async function start() {
    if (!CONFIGURED || started) return;
    started = true;
    state.status = "loading";
    publish();
    try {
      const loaded = await loadSdk();
      app = loaded.app.initializeApp(CONFIG);
      auth = loaded.auth.getAuth(app);
      db = loaded.firestore.getFirestore(app);

      try {
        await loaded.auth.setPersistence(auth, loaded.auth.browserLocalPersistence);
      } catch (persistenceError) {
        /* Persistence is best-effort; session auth still works. */
      }

      loaded.auth.onAuthStateChanged(auth, async function (nextUser) {
        if (nextUser) {
          user = nextUser;
          error = null;
          state.status = "signed-in";
          publish();
          return;
        }

        user = null;
        if (suppressAnonymous) {
          state.status = "signed-out";
          publish();
          return;
        }

        state.status = "signing-in";
        publish();
        try {
          operation = "anonymous";
          publish();
          await loaded.auth.signInAnonymously(auth);
        } catch (anonymousError) {
          fail(anonymousError);
        } finally {
          operation = null;
        }
      });
    } catch (startupError) {
      fail(startupError);
    }
  }

  async function signInGoogle() {
    if (!CONFIGURED) {
      error = "Add the public Firebase web config before signing in.";
      state.status = "unconfigured";
      publish();
      return;
    }
    if (!auth) {
      await start();
      if (!auth) return;
    }

    suppressAnonymous = false;
    operation = "google";
    error = null;
    state.status = "signing-in";
    publish();

    const provider = new sdk.auth.GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });

    try {
      if (auth.currentUser && auth.currentUser.isAnonymous) {
        try {
          await sdk.auth.linkWithPopup(auth.currentUser, provider);
        } catch (linkError) {
          if (
            linkError &&
            (linkError.code === "auth/credential-already-in-use" ||
              linkError.code === "auth/email-already-in-use")
          ) {
            await sdk.auth.signInWithPopup(auth, provider);
          } else {
            throw linkError;
          }
        }
      } else if (!auth.currentUser) {
        await sdk.auth.signInWithPopup(auth, provider);
      }
      state.status = "signed-in";
      error = null;
    } catch (signInError) {
      fail(signInError);
    } finally {
      operation = null;
      publish();
    }
  }

  async function signOutUser() {
    if (!auth) return;
    suppressAnonymous = true;
    operation = "sign-out";
    error = null;
    try {
      await sdk.auth.signOut(auth);
      state.status = "signed-out";
    } catch (signOutError) {
      suppressAnonymous = false;
      fail(signOutError);
    } finally {
      operation = null;
      publish();
    }
  }

  async function loadProgress() {
    if (!CONFIGURED || !db || !auth || !auth.currentUser) return null;
    try {
      const reference = sdk.firestore.doc(db, "users", auth.currentUser.uid);
      const result = await sdk.firestore.getDoc(reference);
      if (!result.exists()) return null;
      const data = result.data();
      return data && data.progress && typeof data.progress === "object" ? data.progress : null;
    } catch (loadError) {
      fail(loadError);
      return null;
    }
  }

  async function saveProgress(progress) {
    if (!CONFIGURED || !db || !auth || !auth.currentUser) return false;
    try {
      const reference = sdk.firestore.doc(db, "users", auth.currentUser.uid);
      await sdk.firestore.setDoc(
        reference,
        {
          progress: progress,
          updatedAt: sdk.firestore.serverTimestamp()
        },
        { merge: true }
      );
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
