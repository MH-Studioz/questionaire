/* ============================================================================
   QUESTIONAIRE — sw.js
   ----------------------------------------------------------------------------
   Offline shell. The catalogue is generated in the browser, so once the shell
   scripts are cached a subject bank, paper and mock exam can be sat without a
   connection. Deadlines are absolute timestamps, so resuming stays sound.

   Bump CACHE whenever app files ship; the old cache is deleted on activate.
   ========================================================================== */

const CACHE = "questionaire-shell-0.7.1-alpha-r2";

const SHELL = [
  "./",
  "./index.html",
  "./styles.css",
  "./manifest.webmanifest",
  "./icon.svg",
  "./sources.js",
  "./database.js",
  "./open-bank.js",
  "./frq-bank.js",
  "./ap-courses.js",
  "./exam-prep.js",
  "./new-subjects.js",
  "./expanded-core.js",
  "./expanded-math.js",
  "./expanded-physical.js",
  "./expanded-life-earth.js",
  "./expanded-health-engineering.js",
  "./expanded-arts.js",
  "./expanded-humanities.js",
  "./expanded-languages.js",
  "./expanded-build.js",
  "./language-packs.js",
  "./questions/registry.js",
  "./subject-banks.js",
  "./firebase-config.js",
  "./firebase-sync.js",
  "./app.js"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() =>
          caches.match(request).then((hit) => hit || caches.match("./index.html"))
        )
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((hit) => {
      if (hit) return hit;
      return fetch(request).then((response) => {
        if (response && response.ok) {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(request, copy));
        }
        return response;
      });
    })
  );
});
