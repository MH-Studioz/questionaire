"""Firestore emulator checks for the cloud progress document.

Runs the real app in Chromium against the Firebase Auth + Firestore emulators
with the production profile shape, and checks:

  * merge of two devices signed into one account
  * an unfinished sitting saved on each device
  * stored document sizes against Firestore's 1 MiB per-document limit
  * a legacy inline-only profile and a mixed 0.7.1/0.7.2 profile
  * the client-side budget for an oversized main document
  * tombstones: a deletion on one device beats a stale copy on another
  * a refused save showing on the account card and recovering on its own
  * decision stamps coming from Firestore instead of the device clock
  * rules denying another account's documents

Requires the emulators on 127.0.0.1:9099 / :8080 and the app served on
BASE_URL (default http://127.0.0.1:5173).

    python tests/emulator.py
"""

import json
import os
import sys
import time
import urllib.error
import urllib.request
from contextlib import contextmanager
from datetime import datetime

from playwright.sync_api import sync_playwright

BASE_URL = os.environ.get("BASE_URL", "http://127.0.0.1:5173")
PROJECT = os.environ.get("EMULATOR_PROJECT", "questionaire-emulator")
FIRESTORE = os.environ.get("FIRESTORE_EMULATOR", "http://127.0.0.1:8080")
AUTH = os.environ.get("AUTH_EMULATOR", "http://127.0.0.1:9099")
API_KEY = "demo-questionaire"
LIMIT = 1024 * 1024  # Firestore per-document limit, 1,048,576 bytes
PASSWORD = "questionaire-dev"

VIEWPORT = {"width": 1280, "height": 900}
BOOT = "window.QuestionaireCloud && window.QuestionaireCloud.configured"

# Later save on device B, so the merge has a clear winner.
SAVED_A = 1763000000000
SAVED_B = 1763100000000

RUN = str(int(time.time()))[-6:]
EMAIL_A = "device-a-" + RUN + "@example.test"
EMAIL_C = "size-" + RUN + "@example.test"
EMAIL_D = "heavy-" + RUN + "@example.test"
EMAIL_T = "tombstone-" + RUN + "@example.test"
EMAIL_S = "sync-failure-" + RUN + "@example.test"
EMAIL_S2 = "stamp-" + RUN + "@example.test"

failures = []


def fail(message):
    print("FAIL: " + message)
    failures.append(message)


def ok(message):
    print("ok: " + message)


def check(condition, message):
    if condition:
        ok(message)
    else:
        fail(message)


# ---------------------------------------------------------------------------
# Emulator REST helpers
# ---------------------------------------------------------------------------


def request_json(url, method="GET", body=None, token="owner"):
    data = json.dumps(body).encode("utf-8") if body is not None else None
    headers = {"Authorization": "Bearer " + token}
    if data:
        headers["Content-Type"] = "application/json"
    request = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(request, timeout=15) as response:
            return response.status, json.loads(response.read().decode("utf-8") or "{}")
    except urllib.error.HTTPError as error:
        return error.code, json.loads(error.read().decode("utf-8") or "{}")


RULES_URL = FIRESTORE + "/emulator/v1/projects/" + PROJECT + ":securityRules"
RULES_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "firestore.rules"
)
# Denies writes while leaving reads intact, so a signed-in device keeps working.
DENY_WRITES = """rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read: if request.auth != null;
      allow write: if false;
    }
  }
}
"""


def set_rules(content):
    """Swap the emulator's Firestore rules at runtime."""
    body = json.dumps(
        {"rules": {"files": [{"name": "firestore.rules", "content": content}]}}
    ).encode("utf-8")
    request = urllib.request.Request(
        RULES_URL, data=body, headers={"Content-Type": "application/json"}, method="PUT"
    )
    try:
        with urllib.request.urlopen(request, timeout=15) as response:
            return response.status == 200
    except urllib.error.HTTPError:
        return False


def local_rules():
    with open(RULES_PATH, encoding="utf-8") as handle:
        return handle.read()


def doc_url(uid, chunk=None):
    url = FIRESTORE + "/v1/projects/" + PROJECT + "/databases/(default)/documents/users/" + uid
    if chunk is not None:
        url += "/items/chunk-" + str(chunk)
    return url


def firestore_doc(uid, chunk=None):
    status, payload = request_json(doc_url(uid, chunk))
    return payload if status == 200 else None


def as_map(fields):
    return {"mapValue": {"fields": fields}}


def as_int(value):
    return {"integerValue": str(value)}


def as_str(value):
    return {"stringValue": value}


def as_bool(value):
    return {"booleanValue": bool(value)}


def as_ts(value):
    return {"timestampValue": value}


def tombstone_value(uid, key):
    """The raw Firestore value of one decision, so its field types stay visible."""
    progress = fields_of(firestore_doc(uid) or {}).get("progress", {})
    tombstones = progress.get("mapValue", {}).get("fields", {}).get("tombstones", {})
    entry = tombstones.get("mapValue", {}).get("fields", {}).get(key) or {}
    return entry.get("mapValue", {}).get("fields", {})


def patch_fields(uid, fields, mask, token="owner"):
    """PATCH selected field paths on a user document, as the emulator admin."""
    paths = "&updateMask.fieldPaths=".join(part.strip() for part in mask.split(","))
    return request_json(
        doc_url(uid) + "?updateMask.fieldPaths=" + paths,
        method="PATCH",
        body={"fields": fields},
        token=token,
    )


def decode(value):
    """Turn an emulator REST document value into plain Python."""
    if "mapValue" in value:
        return {key: decode(item) for key, item in value["mapValue"].get("fields", {}).items()}
    if "arrayValue" in value:
        return [decode(item) for item in value["arrayValue"].get("values", [])]
    if "stringValue" in value:
        return value["stringValue"]
    if "integerValue" in value:
        return int(value["integerValue"])
    if "doubleValue" in value:
        return float(value["doubleValue"])
    if "booleanValue" in value:
        return bool(value["booleanValue"])
    if "timestampValue" in value:
        return value["timestampValue"]
    if "nullValue" in value:
        return None
    return None


def fields_of(doc):
    return doc.get("fields", {}) if doc else {}


def progress_of(doc):
    return decode(fields_of(doc).get("progress", {}))


def progress_snapshot(uid):
    return progress_of(firestore_doc(uid) or {})


def item_count(uid):
    return int(progress_snapshot(uid).get("itemCount") or 0)


def has_progress(doc):
    return bool(fields_of(doc).get("progress"))


def document_bytes(doc):
    return len(json.dumps(doc, separators=(",", ":")).encode("utf-8"))


def read_answered(uid, doc=None):
    """Reassemble the per-item records the app splits into chunk documents."""
    progress = progress_of(doc) if doc else progress_snapshot(uid)
    count = int(progress.get("itemChunks") or 0)
    if not count:
        return progress.get("answered", {})
    merged = {}
    for index in range(count):
        chunk = firestore_doc(uid, index)
        if not chunk:
            continue
        body = fields_of(chunk).get("body", {}).get("stringValue", "")
        merged.update(json.loads(body or "{}"))
    return merged


def id_token(email, password):
    status, payload = request_json(
        AUTH + "/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=" + API_KEY,
        method="POST",
        body={"email": email, "password": password, "returnSecureToken": True},
        token="",
    )
    return payload.get("idToken") if status == 200 else None


# ---------------------------------------------------------------------------
# Waiting
# ---------------------------------------------------------------------------


def parse_timestamp(value):
    return datetime.fromisoformat(value.replace("Z", "+00:00")).timestamp()


def wait_until(probe, timeout=40, interval=0.25):
    """Poll until probe returns a truthy value; never a fixed sleep."""
    deadline = time.time() + timeout
    value = probe()
    while not value and time.time() < deadline:
        time.sleep(interval)
        value = probe()
    return value


def wait_for_doc(uid, predicate, timeout=40):
    def probe():
        doc = firestore_doc(uid)
        return doc if doc and predicate(doc) else None

    return wait_until(probe, timeout=timeout)


def chunk_total(uid):
    return int(progress_snapshot(uid).get("itemChunks") or 0)


def wait_for_chunks(uid, minimum=1, timeout=40):
    """Wait until the stored profile has at least `minimum` chunk documents."""
    def probe():
        total = chunk_total(uid)
        return total if total >= minimum else None

    return wait_until(probe, timeout=timeout)


# ---------------------------------------------------------------------------
# Browser fixtures
# ---------------------------------------------------------------------------


def cloud_config():
    return {
        "apiKey": API_KEY,
        "authDomain": PROJECT + ".firebaseapp.com",
        "projectId": PROJECT,
        "appId": "1:1:web:emulator",
        "emulator": {"host": "127.0.0.1", "authPort": 9099, "firestorePort": 8080},
    }


def serve_config(route):
    route.fulfill(
        status=200,
        content_type="application/javascript",
        body="window.FIREBASE_CONFIG = " + json.dumps(cloud_config()) + ";",
    )


def wait_for_boot(page):
    page.wait_for_function(BOOT, timeout=20000)


@contextmanager
def device(browser, profile=None, email=None, display_name=None):
    """A fresh browser profile pointed at the emulators.

    With a profile it is seeded as legacy guest progress and the account is
    created (sign-up) or signed into; yields (page, uid), uid None otherwise.
    """
    context = browser.new_context(service_workers="block", viewport=VIEWPORT)
    page = context.new_page()
    page.route("**/firebase-config.js*", serve_config)
    page.goto(BASE_URL + "/index.html", wait_until="load")
    wait_for_boot(page)
    uid = None
    try:
        if profile is not None:
            page.evaluate(
                "profile => localStorage.setItem('questionaire.progress.v1', JSON.stringify(profile))",
                profile,
            )
            page.reload(wait_until="load")
            wait_for_boot(page)
            uid = sign_in(page, email, display_name)
        yield page, uid
    finally:
        context.close()


def sign_in(page, email, display_name=None):
    script = "([email, password, name]) => window.QuestionaireCloud." + (
        "signUpEmail(name, email, password)" if display_name else "signInEmail(email, password)"
    )
    page.evaluate(script, [email, PASSWORD, display_name])
    page.wait_for_function("window.QuestionaireCloud.state.status === 'signed-in'", timeout=25000)
    return page.evaluate("window.QuestionaireCloud.state.user.uid")


def question_ids(page):
    return page.evaluate(
        """() => {
        const ids = [];
        const seen = new Set();
        (window.STUDY_DATA.categories || []).forEach((category) => {
          (category.subjects || []).forEach((subject) => {
            (subject.questions || []).forEach((question) => {
              if (!seen.has(question.id)) { seen.add(question.id); ids.push(question.id); }
            });
          });
        });
        return ids;
      }"""
    )


# ---------------------------------------------------------------------------
# Profile fixture
# ---------------------------------------------------------------------------


def encoded_answers(count, unset_every=7):
    return "".join("x" if step % unset_every == 0 else str(step % 4) for step in range(count))


def build_attempt(ids, index, tag, per_attempt):
    questions = [ids[(index * per_attempt + step) % len(ids)] for step in range(per_attempt)]
    return {
        "id": "%s-%03d" % (tag.lower(), index),
        "kind": "mock" if index % 5 == 0 else "practice",
        "subjectId": "sat" if index % 2 == 0 else "act",
        "subjectTitle": "SAT" if index % 2 == 0 else "ACT",
        "paperKey": "P%d" % (index % 4),
        "label": "Practice Set P%d" % (index % 4),
        "startedAt": 1763000000000 - index * 86400000,
        "finishedAt": "2026-11-%02dT0%d:15:00.000Z" % (1 + (index % 18), index % 9),
        "seconds": 640 + index,
        "score": 12 + (index % 9),
        "total": per_attempt,
        "delta": 1 if index % 3 else None,
        "flags": questions[:2],
        "questions": questions,
        "answers": encoded_answers(per_attempt),
        "topics": {"Algebra": {"correct": 4, "total": 6}, "Reading": {"correct": 3, "total": 5}},
    }


def build_sitting(ids, tag, saved_at):
    """An unfinished paper in the shape saveActiveAttempt writes."""
    questions = ids[:25]
    return {
        "savedAt": saved_at,
        "kind": "mock",
        "subjectId": "biology" if tag == "A" else "chemistry",
        "subjectTitle": "Biology" if tag == "A" else "Chemistry",
        "key": "S%d" % saved_at,
        "label": "Device %s unfinished paper" % tag,
        "questions": questions,
        "answers": encoded_answers(len(questions), unset_every=3),
        "flags": questions[:2],
        "index": 4,
        "startedAt": saved_at - 600000,
        "endsAt": saved_at + 1800000,
        "totalSeconds": 1500,
    }


def build_profile(ids, tag, answered_count, attempt_count, saved_at, per_attempt=25):
    """A profile in the exact shape app.js persists.

    `tag` only separates the two devices' fixtures: it offsets the questions
    they answered, names their sitting and pads the mistake list differently.
    """
    offset = 0 if tag == "A" else 7000
    answered = {}
    for index in range(answered_count):
        answered[ids[(offset + index) % len(ids)]] = {
            "attempts": 1 + (index % 3),
            "correct": 1 + (index % 2),
            "firstCorrect": "2026-11-0%dT10:%02d:00.000Z" % (1 + (index % 9), index % 60),
            "last": "2026-11-1%dT10:%02d:00.000Z" % (index % 9, index % 60),
        }

    attempts = [build_attempt(ids, index, tag, per_attempt) for index in range(attempt_count)]
    for index, attempt in enumerate(attempts):
        attempt["deltaBase"] = attempts[index + 1]["id"] if index < len(attempts) - 1 else None

    vocab = {}
    for index in range(120):
        subject = "spanish" if index % 2 == 0 else "french"
        vocab.setdefault(subject, {})["word-%03d" % index] = {
            "known": index % 3 == 0,
            "reps": 1 + index % 5,
            "last": "2026-11-10T09:00:00.000Z",
        }

    topic_stats = {
        subject: {
            tag_name: {"correct": 12, "total": 20}
            for tag_name in ("Algebra", "Reading", "Geometry", "Data", "Writing")
        }
        for subject in ("sat", "act", "bio", "chem", "calc")
    }

    corrected = {
        ids[(index * 3) % len(ids)]: "2026-11-0%dT11:00:00.000Z" % (1 + index % 9)
        for index in range(200)
    }

    return {
        "version": 1,
        "answered": answered,
        "vocab": vocab,
        "xp": 18400 + (0 if tag == "A" else 900),
        "streak": 9,
        "bestStreak": 21,
        "lastStudyDate": "2026-11-20",
        "bookmarks": [ids[(i * 5) % len(ids)] for i in range(40)],
        "mistakes": [ids[(i * 7 + 3) % len(ids)] for i in range(35 if tag == "A" else 20)],
        "corrected": corrected,
        "topicStats": topic_stats,
        "attempts": attempts,
        "active": build_sitting(ids, tag, saved_at),
        "paused": [],
        "frq": {
            "calc": {
                "calc-frq-1": {
                    "updatedAt": "2026-11-12T12:00:00.000Z",
                    "responses": {"a": "Device %s answer" % tag, "b": "", "c": ""},
                    "scores": {"a": 2},
                    "draft": "working",
                    "graded": False,
                }
            }
        },
    }


# ---------------------------------------------------------------------------
# Checks
# ---------------------------------------------------------------------------


def check_two_device_merge(browser, ids):
    """Same account on two devices: answers, sittings and both papers survive."""
    profile_a = build_profile(ids, "A", answered_count=900, attempt_count=40, saved_at=SAVED_A)
    with device(browser, profile_a, EMAIL_A, "Device A") as (page_a, uid):
        check(bool(wait_for_doc(uid, has_progress)), "device A saved its profile")

        profile_b = build_profile(ids, "B", answered_count=600, attempt_count=20, saved_at=SAVED_B)
        with device(browser, profile_b, EMAIL_A) as (page_b, uid_b):
            check(uid_b == uid, "device B signs into the same account")

            expr = lambda value: int(progress_of(value).get("itemCount") or 0) >= 1480
            doc = wait_for_doc(uid, expr, timeout=60)
            merged = progress_of(doc)
            answered = read_answered(uid, doc)
            expected = len(profile_a["answered"]) + len(profile_b["answered"])
            print("merged answered ids: %d" % len(answered))
            print("merged attempts: %d" % len(merged.get("attempts", [])))
            check(
                len(answered) >= expected * 0.98,
                "answered records from both devices merged (%d of %d)" % (len(answered), expected),
            )
            check(
                len(merged.get("attempts", [])) == 60,
                "attempt history holds 60 sittings from both devices (%d rows)"
                % len(merged.get("attempts", [])),
            )

            active = merged.get("active") or {}
            paused_labels = [item.get("label") for item in merged.get("paused") or []]
            print("paused sittings: %s" % paused_labels)
            check(
                active.get("savedAt") == SAVED_B,
                "newer unfinished sitting is the resume target (device B)",
            )
            check(
                "Device A unfinished paper" in paused_labels,
                "device A's sitting is kept and resumable (paused list)",
            )

            stored = page_b.evaluate(
                "key => localStorage.getItem(key)", "questionaire.progress.v1.cloud." + uid
            )
            if stored:
                size = len(stored.encode("utf-8"))
                print("merged payload: %d bytes (%.1f KiB)" % (size, size / 1024))
            else:
                fail("device B has no cached cloud payload")

            page_b.goto(BASE_URL + "/index.html#/dashboard", wait_until="load")
            page_b.wait_for_selector(".attempt-history", timeout=20000)
            check(
                page_b.locator(".resume-strip.is-paused").count() >= 1,
                "dashboard shows the paused sitting from the other device",
            )

            page_b.locator('.resume-strip.is-paused [data-action="resume-paused"]').first.click()
            try:
                page_b.wait_for_selector(".paper-question, .exam-question", timeout=20000)
                target = page_b.evaluate("location.hash")
            except Exception:
                target = ""
            check("/practice" in target, "paused sitting resumes into the runner (%s)" % target)
            return uid


def check_sizes(browser, ids):
    """Full-catalogue profile: chunking, document sizes and the size ceiling."""
    full = build_profile(ids, "A", answered_count=len(ids), attempt_count=60, saved_at=SAVED_A)
    with device(browser, full, EMAIL_C, "Size probe") as (page, uid):
        doc = wait_for_doc(uid, lambda value: int(progress_of(value).get("itemCount") or 0) > 0, timeout=90)
        if not doc:
            fail("full-catalogue profile was never written")
            return

        meta = progress_of(doc)
        chunks = int(meta.get("itemChunks") or 0)
        items = int(meta.get("itemCount") or 0)
        main_size = document_bytes(doc)
        chunk_sizes = [document_bytes(firestore_doc(uid, index)) for index in range(chunks)]
        largest = max(chunk_sizes) if chunk_sizes else 0
        print(
            "full catalogue: %d answered -> %d chunk docs; main %d B (%.1f KiB), "
            "largest chunk %d B (%.1f KiB), largest document headroom %.1f KiB"
            % (
                items,
                chunks,
                main_size,
                main_size / 1024,
                largest,
                largest / 1024,
                (LIMIT - max(main_size, largest)) / 1024,
            )
        )
        check(items == len(ids), "every answered question is stored (%d of %d)" % (items, len(ids)))
        check(
            max(main_size, largest) < LIMIT,
            "largest written document leaves %.1f KiB of headroom"
            % ((LIMIT - max(main_size, largest)) / 1024),
        )

        # The emulator only rejects a single oversized value, so prove the
        # ceiling is real before trusting the client-side budget.
        status, payload = patch_fields(
            "oversize-probe", {"blob": as_str("x" * (LIMIT + 9000))}, "blob"
        )
        check(
            status == 400,
            "emulator rejects an oversized value (%s)"
            % payload.get("error", {}).get("status"),
        )

        check_legacy_profile(page, uid, ids)
        check_mixed_profile(page, uid, ids)


def check_legacy_profile(page, uid, ids):
    """A 0.7.1-only profile (inline answers, no chunks) still loads."""
    legacy_ids = ids[-2:]
    legacy_answers = {
        question_id: as_map({"attempts": as_int(3), "correct": as_int(2)})
        for question_id in legacy_ids
    }
    status, _ = patch_fields(
        uid,
        {"progress": as_map({
            "version": as_int(1),
            "xp": as_int(777),
            "answered": as_map(legacy_answers),
        })},
        "progress",
    )
    if status != 200:
        fail("could not write a legacy single-document profile (%d)" % status)
        return

    page.reload(wait_until="load")
    wait_for_boot(page)
    wait_for_chunks(uid, minimum=2)
    after = progress_snapshot(uid)
    restored = read_answered(uid)
    check(
        int(after.get("itemChunks") or 0) >= 2 and legacy_ids[0] in restored,
        "legacy inline profile loads and is re-chunked (%s chunks)" % after.get("itemChunks"),
    )


def check_mixed_profile(page, uid, ids):
    """A 0.7.1 device writes inline records into a document that already has chunks."""
    mixed_id = ids[-3]
    status, _ = patch_fields(
        uid,
        {"progress": as_map({
            "answered": as_map({
                mixed_id: as_map({
                    "attempts": as_int(50),
                    "correct": as_int(40),
                    "firstCorrect": as_str("2026-01-02T03:04:05.000Z"),
                })
            })
        })},
        "progress.answered",
    )
    if status != 200:
        fail("could not simulate an inline write from a 0.7.1 client (%d)" % status)
        return

    page.reload(wait_until="load")
    wait_for_boot(page)

    def folded():
        progress = progress_snapshot(uid)
        if "answered" in progress:
            return None
        return progress if int(progress.get("itemCount") or 0) >= len(ids) else None

    stored = wait_until(folded, timeout=45)
    record = read_answered(uid).get(mixed_id, {})
    check(
        int(record.get("attempts") or 0) >= 50,
        "inline 0.7.1 answer record survives the load (attempts=%r)" % record.get("attempts"),
    )
    check(bool(stored), "inline answer records are folded into the chunks and cleared")


def check_oversize_guard(browser, ids):
    """An oversized profile is trimmed for upload but kept intact locally."""
    profile = build_profile(ids, "A", answered_count=50, attempt_count=60, saved_at=SAVED_A, per_attempt=1200)
    payload = len(json.dumps(profile).encode("utf-8"))
    print("guard probe local payload: %d bytes (%.1f KiB)" % (payload, payload / 1024))

    with device(browser, profile, EMAIL_D, "Heavy profile") as (page, uid):
        doc = wait_for_doc(uid, has_progress, timeout=90)
        if not doc:
            fail("oversized profile never reached Firestore")
            return

        core = progress_of(doc)
        main_size = document_bytes(doc)
        print(
            "guarded main document: %d bytes (%.1f KiB), syncTrimmed=%r"
            % (main_size, main_size / 1024, core.get("syncTrimmed"))
        )
        check(main_size < LIMIT, "oversized profile stays under the 1 MiB limit")
        check(core.get("syncTrimmed") is True, "oversized main document is trimmed before upload")

        local = json.loads(
            page.evaluate("key => localStorage.getItem(key)", "questionaire.progress.v1.cloud." + uid)
            or "{}"
        )
        check(
            len(local.get("attempts", [])) == 60,
            "local history keeps all 60 sittings after cloud trimming (%d)"
            % len(local.get("attempts", [])),
        )


def check_tombstones(browser, ids):
    """A deletion must beat the copy the other device still holds.

    Device B clears every star and discards the paused sitting, then the stale
    device A reloads. A plain union merge would bring both back. The re-star at
    the end proves a later addition still beats the tombstone.
    """
    profile = build_profile(ids, "A", answered_count=30, attempt_count=2, saved_at=SAVED_A)
    profile["paused"] = [build_sitting(ids, "B", SAVED_A - 5000)]
    # The practice tab opens on this question, so the re-star below lands on a
    # question that definitely has a tombstone.
    if "bio-1" in ids:
        profile["bookmarks"].append("bio-1")

    with device(browser, profile, EMAIL_T, "Tombstones") as (page_a, uid):
        check(bool(wait_for_doc(uid, has_progress)), "tombstone device saved its profile")

        with device(browser, profile, EMAIL_T) as (page_b, uid_b):
            check(uid_b == uid, "second device joins for the tombstone check")
            page_b.on("dialog", lambda dialog: dialog.accept())

            page_b.goto(BASE_URL + "/index.html#/review", wait_until="load")
            page_b.wait_for_selector('[data-action="clear-bookmarks"]', timeout=20000)
            page_b.click('[data-action="clear-bookmarks"]')
            check(
                bool(wait_until(lambda: not (progress_snapshot(uid).get("bookmarks") or []), timeout=45)),
                "clearing stars empties the cloud bookmark list",
            )
            tombstones = progress_snapshot(uid).get("tombstones") or {}
            tombstoned = {str(key)[3:] for key in tombstones if str(key).startswith("bm:")}
            check(
                len(tombstoned) >= 40,
                "clearing stars records bookmark tombstones (%d entries)" % len(tombstoned),
            )

            page_b.goto(BASE_URL + "/index.html#/dashboard", wait_until="load")
            page_b.wait_for_selector('[data-action="discard-paused"]', timeout=20000)
            page_b.click('[data-action="discard-paused"]')
            check(
                bool(wait_until(lambda: not (progress_snapshot(uid).get("paused") or []), timeout=45)),
                "discarding a paused sitting empties the paused list",
            )

            # Device A still has both in memory and in its own cache.
            page_a.reload(wait_until="load")
            wait_for_boot(page_a)

            def clean():
                stored = json.loads(
                    page_a.evaluate(
                        "key => localStorage.getItem(key)", "questionaire.progress.v1.cloud." + uid
                    )
                    or "{}"
                )
                if stored.get("bookmarks") or stored.get("paused"):
                    return None
                return stored

            check(bool(wait_until(clean, timeout=45)), "a stale device does not resurrect deleted items")

            # Re-starring on the stale device must survive the merge with the
            # tombstone it just received.
            page_a.goto(BASE_URL + "/index.html#/subject/biology/practice", wait_until="load")
            try:
                page_a.wait_for_selector('[data-action="bookmark"]', timeout=20000)
                starred = page_a.eval_on_selector(
                    '[data-action="bookmark"]', "element => element.getAttribute('data-qid')"
                )
                page_a.click('[data-action="bookmark"]')
            except Exception:
                starred = None
            if not starred:
                fail("no practice question was available to re-star")
                return

            def restored():
                state = progress_snapshot(uid)
                return None if starred not in (state.get("bookmarks") or []) else state

            check(
                bool(wait_until(restored, timeout=45)),
                "re-starring after a merge keeps the bookmark (%s)" % starred,
            )
            entry = (progress_snapshot(uid).get("tombstones") or {}).get("bm:" + starred) or {}
            if starred in tombstoned:
                check(
                    entry.get("deleted") is False,
                    "the re-starred bookmark is recorded as alive, not deleted (%r)"
                    % entry.get("deleted"),
                )
            else:
                ok("re-starred %s was not tombstoned; the bookmark is stored anyway" % starred)

            if starred not in tombstoned:
                return

            # A device that never saw the deletion. The guest profile stars the
            # question without any tombstone in its record, then signs in; its
            # add is newer than the deletion, so it must survive the merge.
            page_a.goto(BASE_URL + "/index.html#/subject/biology/practice", wait_until="load")
            page_a.wait_for_selector('[data-action="bookmark"]', timeout=20000)
            page_a.click('[data-action="bookmark"]')
            check(
                bool(
                    wait_until(
                        lambda: starred not in (progress_snapshot(uid).get("bookmarks") or []),
                        timeout=45,
                    )
                ),
                "un-starring on a synced device records a fresh deletion (%s)" % starred,
            )

            with device(browser) as (page_c, _):
                page_c.wait_for_selector('[data-action="guest-signin"]', timeout=20000)
                page_c.click('[data-action="guest-signin"]')
                page_c.goto(BASE_URL + "/index.html#/subject/biology/practice", wait_until="load")
                page_c.wait_for_selector('[data-action="bookmark"]', timeout=20000)
                page_c.click('[data-action="bookmark"]')
                sign_in(page_c, EMAIL_T)

                def revived():
                    state = progress_snapshot(uid)
                    entry = (state.get("tombstones") or {}).get("bm:" + starred) or {}
                    if entry.get("deleted") is not False:
                        return None
                    return state if starred in (state.get("bookmarks") or []) else None

                check(
                    bool(wait_until(revived, timeout=45)),
                    "a device that never saw the deletion keeps its re-star (%s)" % starred,
                )


def check_server_stamps(browser, ids):
    """Decisions are ordered by Firestore server stamps, not device clocks.

    The map keeps the old `at`/`deleted` shape a 0.7.4 client reads, but the
    merge compares `stamp`. A legacy tombstone dated in the future — what a
    device with a broken clock writes — must lose to the newer server stamp,
    and a newer server stamp must beat this device's own clock.
    """
    profile = build_profile(ids, "A", answered_count=10, attempt_count=1, saved_at=SAVED_A)
    with device(browser, profile, EMAIL_S2, "Server stamps") as (page, uid):
        check(bool(wait_for_doc(uid, has_progress)), "stamp device saved its profile")

        page.goto(BASE_URL + "/index.html#/subject/biology/practice", wait_until="load")
        page.wait_for_selector('[data-action="bookmark"]', timeout=20000)
        starred = page.eval_on_selector(
            '[data-action="bookmark"]', "element => element.getAttribute('data-qid')"
        )
        page.click('[data-action="bookmark"]')
        key = "bm:" + starred

        check(
            bool(wait_until(lambda: "stamp" in tombstone_value(uid, key), timeout=45)),
            "the committed decision carries a stamp",
        )
        fields = tombstone_value(uid, key)
        check("timestampValue" in fields.get("stamp", {}), "the stamp is a Firestore server timestamp")
        check("stringValue" in fields.get("at", {}), "the legacy at string is still written")

        cache_key = "questionaire.progress.v1.cloud." + uid

        def stored():
            return json.loads(page.evaluate("key => localStorage.getItem(key)", cache_key) or "{}")

        def adopted():
            entry = (stored().get("tombstones") or {}).get(key) or {}
            return entry if entry.get("stamp") and not entry.get("pending") else None

        # The stamp the server assigned has to land in the record this device
        # keeps; without it the next save rewrites the decision with a bare
        # local time and loses the ordering.
        check(bool(wait_until(adopted, timeout=30)), "the device keeps the server stamp it was given")
        decision = bool((adopted() or {}).get("deleted"))
        stamp_before = tombstone_value(uid, key).get("stamp", {}).get("timestampValue") or ""

        # A second decision rewrites the whole map: the first stamp must keep
        # its place rather than being re-stamped or dropped.
        time.sleep(2)
        page.goto(BASE_URL + "/index.html#/subject/chemistry/practice", wait_until="load")
        page.wait_for_selector('[data-action="bookmark"]', timeout=20000)
        second = page.eval_on_selector(
            '[data-action="bookmark"]', "element => element.getAttribute('data-qid')"
        )
        page.click('[data-action="bookmark"]')
        check(
            bool(wait_until(lambda: "stamp" in tombstone_value(uid, "bm:" + second), timeout=45)),
            "a later decision is stamped too",
        )
        stamp_after = tombstone_value(uid, key).get("stamp", {}).get("timestampValue") or ""
        check(
            bool(stamp_before and stamp_after)
            and abs(parse_timestamp(stamp_after) - parse_timestamp(stamp_before)) < 0.5,
            "the earlier server stamp keeps its place in a later save",
        )

        def bookmarked():
            return key[3:] in (progress_snapshot(uid).get("bookmarks") or [])

        def patch_opposite(at_iso, stamp_iso, expect_present):
            """Write the opposite decision with a hand-made clock and stamp.

            The document's bookmark list is written against the expected
            outcome, so the check cannot pass before the app rewrites it.
            """
            values = [] if expect_present else [as_str(key[3:])]
            status, _ = patch_fields(
                uid,
                {
                    "progress": as_map(
                        {
                            "bookmarks": {"arrayValue": {"values": values}},
                            "tombstones": as_map(
                                {
                                    key: as_map(
                                        {
                                            "at": as_str(at_iso),
                                            "deleted": as_bool(not decision),
                                            "stamp": as_ts(stamp_iso),
                                        }
                                    )
                                }
                            ),
                        }
                    )
                },
                "progress.bookmarks,progress.tombstones",
            )
            return status

        # A device clock far in the future must not outrank the server stamp.
        expect = not decision
        status = patch_opposite("2039-01-01T00:00:00.000Z", "2020-01-01T00:00:00Z", expect)
        check(status == 200, "a contradictory decision dated in the future is written (%d)" % status)
        page.reload(wait_until="load")
        wait_for_boot(page)
        check(
            bool(wait_until(lambda: bookmarked() == expect, timeout=60)),
            "a server stamp outranks a tombstone dated in the future",
        )

        # A newer server stamp must still win when this device's clock is ahead.
        expect = decision
        status = patch_opposite("2020-01-01T00:00:00.000Z", "2039-01-01T00:00:00Z", expect)
        check(status == 200, "a contradictory decision dated in the past is written (%d)" % status)
        page.reload(wait_until="load")
        wait_for_boot(page)
        check(
            bool(wait_until(lambda: bookmarked() == expect, timeout=60)),
            "a newer server stamp beats this device's clock",
        )


def check_sync_failure(browser, ids):
    """A refused save must surface on the account card and recover by itself.

    Writes are denied at the emulator and a star is saved: the card has to say
    the sync failed without losing the session. Restoring the rules is then the
    only thing that changes, so the built-in backoff retry has to clear it.
    """
    profile = build_profile(ids, "A", answered_count=20, attempt_count=1, saved_at=SAVED_A)
    with device(browser, profile, EMAIL_S, "Sync failure") as (page, uid):
        check(bool(wait_for_doc(uid, has_progress)), "failure device saved its profile")
        page.wait_for_selector("#account-panel", timeout=20000)

        restored = local_rules()
        try:
            check(set_rules(DENY_WRITES), "the emulator refuses writes")
            time.sleep(1)
            page.goto(BASE_URL + "/index.html#/subject/biology/practice", wait_until="load")
            page.wait_for_selector('[data-action="bookmark"]', timeout=20000)
            page.click('[data-action="bookmark"]')

            check(
                bool(wait_until(lambda: page.evaluate("window.QuestionaireCloud.state.syncError"), timeout=40)),
                "a refused save reports a sync error",
            )
            card = page.inner_text("#account-panel").lower()
            check("not synced" in card, "the account card says it is not synced")
            check(
                "retrying automatically" in card,
                "the account card promises the automatic retry",
            )
            check(
                "cloud sync failed" in page.inner_text("#sidebar-note").lower(),
                "the sidebar marks the sync as failing",
            )
            check(
                page.evaluate("window.QuestionaireCloud.state.status") == "signed-in",
                "a failed save leaves the account signed in",
            )
            check(
                page.evaluate("window.QuestionaireCloud.state.lastSyncedAt") is not None,
                "the last good sync stamp survives the failure",
            )
            local = json.loads(
                page.evaluate(
                    "key => localStorage.getItem(key)", "questionaire.progress.v1.cloud." + uid
                )
                or "{}"
            )
            expected = sorted(local.get("bookmarks") or [])
        finally:
            check(set_rules(restored), "the emulator rules are restored")

        def recovered():
            return page.evaluate(
                "() => !window.QuestionaireCloud.state.syncError && "
                "Boolean(window.QuestionaireCloud.state.lastSyncedAt)"
            )

        check(bool(wait_until(recovered, timeout=90)), "the backoff retry clears the failure")
        card = page.inner_text("#account-panel").lower()
        check("not synced" not in card and "synced" in card, "the account card shows a synced state again")
        check(
            bool(
                wait_until(
                    lambda: sorted(progress_snapshot(uid).get("bookmarks") or []) == expected,
                    timeout=40,
                )
            ),
            "the retried save reaches the cloud copy",
        )


def check_rules(uid):
    """Owner-only rules: foreign writes refused, own chunks readable."""
    token = id_token(EMAIL_A, PASSWORD)
    if not token:
        fail("could not mint an ID token for the rules check")
        return

    status, _ = patch_fields("someone-else", {"progress": as_map({})}, "progress", token=token)
    check(status in (401, 403), "rules deny writing another account's document (%d)" % status)

    status, _ = request_json(doc_url(uid, 0), token=token)
    check(status == 200, "rules allow reading your own chunk documents (%d)" % status)


def main():
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch()
        try:
            with device(browser) as (page, _):
                ids = question_ids(page)
            print("catalogue questions: %d" % len(ids))
            check(len(ids) >= 500, "catalogue loaded (%d question ids)" % len(ids))

            uid = check_two_device_merge(browser, ids)
            check_sizes(browser, ids)
            check_oversize_guard(browser, ids)
            check_tombstones(browser, ids)
            check_sync_failure(browser, ids)
            check_server_stamps(browser, ids)
            if uid:
                check_rules(uid)
            else:
                fail("no account to check the rules against")
        finally:
            browser.close()

    if failures:
        print("\n%d emulator checks failed" % len(failures))
        sys.exit(1)
    print(
        "\nOK: emulator merge, two-device sitting, size, tombstone, sync "
        "failure, server stamp and rules checks passed"
    )


if __name__ == "__main__":
    main()
