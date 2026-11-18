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
