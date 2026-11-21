"""Firestore emulator check for the cloud progress document.

Runs the real app in Chromium against the Firebase Auth + Firestore emulators
with the production profile shape, and measures:

  * merge of two devices signed into one account
  * an unfinished sitting saved on each device
  * stored document sizes against Firestore's 1 MiB per-document limit
  * a legacy single-document profile still loading
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

from playwright.sync_api import sync_playwright

BASE_URL = os.environ.get("BASE_URL", "http://127.0.0.1:5173")
PROJECT = os.environ.get("EMULATOR_PROJECT", "questionaire-emulator")
FIRESTORE = os.environ.get("FIRESTORE_EMULATOR", "http://127.0.0.1:8080")
AUTH = os.environ.get("AUTH_EMULATOR", "http://127.0.0.1:9099")
API_KEY = "demo-questionaire"
LIMIT = 1024 * 1024  # Firestore per-document limit, 1,048,576 bytes

PASSWORD = "questionaire-dev"
RUN = str(int(time.time()))[-6:]
EMAIL_A = "device-a-" + RUN + "@example.test"
EMAIL_C = "size-" + RUN + "@example.test"
EMAIL_D = "heavy-" + RUN + "@example.test"

failures = []


def fail(message):
    print("FAIL: " + message)
    failures.append(message)


def ok(message):
    print("ok: " + message)


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


def doc_url(uid, chunk=None):
    url = FIRESTORE + "/v1/projects/" + PROJECT + "/databases/(default)/documents/users/" + uid
    if chunk is not None:
        url += "/items/chunk-" + str(chunk)
    return url


def firestore_doc(uid, chunk=None):
    status, payload = request_json(doc_url(uid, chunk))
    return payload if status == 200 else None


def wait_for_doc(uid, predicate, timeout=30):
    deadline = time.time() + timeout
    while time.time() < deadline:
        doc = firestore_doc(uid)
        if doc and predicate(doc):
            return doc
        time.sleep(0.4)
    return firestore_doc(uid)


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


def document_bytes(doc):
    return len(json.dumps(doc, separators=(",", ":")).encode("utf-8"))


def id_token(email, password):
    status, payload = request_json(
        AUTH + "/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=" + API_KEY,
        method="POST",
        body={"email": email, "password": password, "returnSecureToken": True},
        token="",
    )
    if status != 200:
        return None
    return payload.get("idToken")


def cloud_config():
    return {
        "apiKey": API_KEY,
        "authDomain": PROJECT + ".firebaseapp.com",
        "projectId": PROJECT,
        "appId": "1:1:web:emulator",
        "emulator": {"host": "127.0.0.1", "authPort": 9099, "firestorePort": 8080},
    }


def open_app(browser):
    context = browser.new_context(service_workers="block", viewport={"width": 1280, "height": 900})
    page = context.new_page()

    def serve_config(route):
        route.fulfill(
            status=200,
            content_type="application/javascript",
            body="window.FIREBASE_CONFIG = " + json.dumps(cloud_config()) + ";",
        )

    page.route("**/firebase-config.js*", serve_config)
    page.goto(BASE_URL + "/index.html", wait_until="load")
    page.wait_for_function("window.QuestionaireCloud && window.QuestionaireCloud.configured", timeout=20000)
    return context, page


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


def build_profile(ids, tag, answered_count, attempt_count, saved_at, per_attempt=25):
    """A profile in the exact shape app.js persists."""
    answered = {}
    offset = 0 if tag == "A" else 7000
    for index in range(answered_count):
        question_id = ids[(offset + index) % len(ids)]
        answered[question_id] = {
            "attempts": 1 + (index % 3),
            "correct": 1 + (index % 2),
            "firstCorrect": "2026-11-0%dT10:%02d:00.000Z" % (1 + (index % 9), index % 60),
            "last": "2026-11-1%dT10:%02d:00.000Z" % (index % 9, index % 60),
        }

    attempts = []
    for index in range(attempt_count):
        questions = [ids[(index * per_attempt + step) % len(ids)] for step in range(per_attempt)]
        answers = "".join("x" if step % 7 == 0 else str(step % 4) for step in range(per_attempt))
        attempts.append(
            {
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
                "deltaBase": "%s-%03d" % (tag.lower(), index + 1) if index < attempt_count - 1 else None,
                "flags": questions[:2],
                "questions": questions,
                "answers": answers,
                "topics": {"Algebra": {"correct": 4, "total": 6}, "Reading": {"correct": 3, "total": 5}},
            }
        )

    sitting_questions = ids[:25]
    active = {
        "savedAt": saved_at,
        "kind": "mock",
        "subjectId": "biology" if tag == "A" else "chemistry",
        "subjectTitle": "Biology" if tag == "A" else "Chemistry",
        "key": "S%d" % saved_at,
        "label": "Device %s unfinished paper" % tag,
        "questions": sitting_questions,
        "answers": "".join("x" if step % 3 else str(step % 4) for step in range(len(sitting_questions))),
        "flags": sitting_questions[:2],
        "index": 4,
        "startedAt": saved_at - 600000,
        "endsAt": saved_at + 1800000,
        "totalSeconds": 1500,
    }

    vocab = {}
    for index in range(120):
        subject = "spanish" if index % 2 == 0 else "french"
        vocab.setdefault(subject, {})["word-%03d" % index] = {
            "known": index % 3 == 0,
            "reps": 1 + index % 5,
            "last": "2026-11-10T09:00:00.000Z",
        }

    topic_stats = {}
    for subject in ("sat", "act", "bio", "chem", "calc"):
        topic_stats[subject] = {}
        for tag_name in ("Algebra", "Reading", "Geometry", "Data", "Writing"):
            topic_stats[subject][tag_name] = {"correct": 12, "total": 20}

    corrected = {}
    for index in range(200):
        corrected[ids[(index * 3) % len(ids)]] = "2026-11-0%dT11:00:00.000Z" % (1 + index % 9)

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
        "active": active,
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


def sign_in(page, email, password, display_name=None):
    script = "([email, password, name]) => window.QuestionaireCloud." + (
        "signUpEmail(name, email, password)" if display_name else "signInEmail(email, password)"
    )
    page.evaluate(script, [email, password, display_name])
    page.wait_for_function("window.QuestionaireCloud.state.status === 'signed-in'", timeout=25000)
    return page.evaluate("window.QuestionaireCloud.state.user.uid")


def seed_local(page, profile):
    page.evaluate(
        "profile => localStorage.setItem('questionaire.progress.v1', JSON.stringify(profile))", profile
    )
    page.reload(wait_until="load")
    page.wait_for_function("window.QuestionaireCloud && window.QuestionaireCloud.configured", timeout=20000)


def read_answered(uid, doc=None):
    """Reassemble the per-item records the app splits into chunk documents."""
    progress = progress_of(doc or firestore_doc(uid))
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


def stored_payload(page, uid):
    return page.evaluate("key => localStorage.getItem(key)", "questionaire.progress.v1.cloud." + uid)


def main():
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch()

        # ------------------------------------------------------------- devices A
        context_a, page_a = open_app(browser)
        ids = question_ids(page_a)
        print("catalogue questions: %d" % len(ids))
        if len(ids) < 500:
            fail("catalogue did not load, only %d question ids" % len(ids))

        profile_a = build_profile(ids, "A", 900, 40, 1763000000000)
        seed_local(page_a, profile_a)
        uid = sign_in(page_a, EMAIL_A, PASSWORD, display_name="Device A")
        print("device A uid: %s" % uid)
        first = wait_for_doc(uid, lambda doc: bool(fields_of(doc).get("progress")))
        if not first:
            fail("device A never wrote a progress document")
        else:
            ok("device A saved its profile")

        # ------------------------------------------------------------- device B
        context_b, page_b = open_app(browser)
        profile_b = build_profile(ids, "B", 600, 20, 1763100000000)
        seed_local(page_b, profile_b)
        uid_b = sign_in(page_b, EMAIL_A, PASSWORD)
        if uid_b != uid:
            fail("device B signed into a different account")
        doc = wait_for_doc(
            uid, lambda value: int(progress_of(value).get("itemCount") or 0) >= 1480, timeout=40
        )
        merged = progress_of(doc)
        answered = read_answered(uid, doc)
        print("merged answered ids: %d" % len(answered))
        print("merged attempts: %d" % len(merged.get("attempts", [])))

        expected = len(profile_a["answered"]) + len(profile_b["answered"])
        if len(answered) < expected * 0.98:
            fail("answered records did not merge: %d stored, %d expected" % (len(answered), expected))
        else:
            ok("answered records from both devices merged (%d of %d)" % (len(answered), expected))

        if len(merged.get("attempts", [])) != 60:
            fail("attempt history did not merge (%d rows, expected 60)" % len(merged.get("attempts", [])))
        else:
            ok("attempt history holds 60 sittings from both devices")

        active = merged.get("active") or {}
        paused = merged.get("paused") or []
        if active.get("savedAt") != 1763100000000:
            fail("the newer unfinished sitting is not the resume target")
        else:
            ok("newer unfinished sitting is the resume target (device B)")
        paused_labels = [item.get("label") for item in paused]
        print("paused sittings: %s" % paused_labels)
        if "Device A unfinished paper" not in paused_labels:
            fail("device A's unfinished sitting was dropped by the merge")
        else:
            ok("device A's sitting is kept and resumable (paused list)")

        stored = stored_payload(page_b, uid)
        if not stored:
            fail("device B has no cached cloud payload")
        else:
            size = len(stored.encode("utf-8"))
            print("merged payload: %d bytes (%.1f KiB)" % (size, size / 1024))

        page_b.goto(BASE_URL + "/index.html#/dashboard", wait_until="load")
        page_b.wait_for_selector(".attempt-history", timeout=20000)
        if page_b.locator(".resume-strip.is-paused").count() >= 1:
            ok("dashboard shows the paused sitting from the other device")
        else:
            fail("dashboard does not show the paused sitting")

        # Resume the paused paper: it becomes the active sitting and opens.
        page_b.locator('.resume-strip.is-paused [data-action="resume-paused"]').first.click()
        try:
            page_b.wait_for_selector(".paper-question, .exam-question", timeout=20000)
            target = page_b.evaluate("location.hash")
            if "/practice" in target:
                ok("paused sitting resumes into the runner (%s)" % target)
            else:
                fail("paused sitting resumed to an unexpected route (%s)" % target)
        except Exception:
            fail("paused sitting did not resume into the runner")

        # ------------------------------------------------- full-catalogue profile
        context_c, page_c = open_app(browser)
        heavy = build_profile(ids, "A", len(ids), 60, 1763000000000)
        seed_local(page_c, heavy)
        uid_c = sign_in(page_c, EMAIL_C, PASSWORD, display_name="Size probe")
        doc_c = wait_for_doc(uid_c, lambda value: progress_of(value).get("itemCount", 0) > 0, timeout=60)
        if not doc_c:
            fail("full-catalogue profile was never written")
            chunk_count = 0
        else:
            meta = progress_of(doc_c)
            chunk_count = int(meta.get("itemChunks") or 0)
            item_count = int(meta.get("itemCount") or 0)
            main_size = document_bytes(doc_c)
            chunk_sizes = [document_bytes(firestore_doc(uid_c, index)) for index in range(chunk_count)]
            largest = max(chunk_sizes) if chunk_sizes else 0
            print(
                "full catalogue: %d answered -> %d chunk docs; main %d B (%.1f KiB), "
                "largest chunk %d B (%.1f KiB), largest document headroom %.1f KiB"
                % (
                    item_count,
                    chunk_count,
                    main_size,
                    main_size / 1024,
                    largest,
                    largest / 1024,
                    (LIMIT - max(main_size, largest)) / 1024,
                )
            )
            if item_count != len(ids):
                fail("per-item records were lost: %d stored of %d" % (item_count, len(ids)))
            else:
                ok("every answered question is stored (%d records over %d chunks)" % (item_count, chunk_count))
            if max(main_size, largest) >= LIMIT:
                fail("a written document is over the 1 MiB limit")
            else:
                ok("largest written document leaves %.1f KiB of headroom" % ((LIMIT - max(main_size, largest)) / 1024))

            # The emulator only rejects a single oversized value, so prove the
            # ceiling is real before trusting the client-side budget below.
            status, payload = request_json(
                doc_url("oversize-probe") + "?updateMask.fieldPaths=blob",
                method="PATCH",
                body={"fields": {"blob": {"stringValue": "x" * (LIMIT + 9000)}}},
            )
            if status == 400:
                ok("emulator rejects an oversized value (%s)" % payload.get("error", {}).get("status"))
            else:
                fail("emulator accepted an oversized value (%d)" % status)

            # ------------------------------------------------ legacy inline profile
            legacy_ids = ids[-2:]
            legacy_answers = {}
            for legacy_id in legacy_ids:
                legacy_answers[legacy_id] = {
                    "mapValue": {"fields": {
                        "attempts": {"integerValue": "3"},
                        "correct": {"integerValue": "2"},
                    }}
                }
            status, _ = request_json(
                doc_url(uid_c) + "?updateMask.fieldPaths=progress",
                method="PATCH",
                body={"fields": {"progress": {"mapValue": {"fields": {
                    "version": {"integerValue": "1"},
                    "xp": {"integerValue": "777"},
                    "answered": {"mapValue": {"fields": legacy_answers}},
                }}}}},
            )
            if status != 200:
                fail("could not write a legacy single-document profile (%d)" % status)
            else:
                page_c.reload(wait_until="load")
                page_c.wait_for_function(
                    "window.QuestionaireCloud && window.QuestionaireCloud.configured", timeout=20000
                )
                page_c.wait_for_timeout(4000)
                after = progress_of(firestore_doc(uid_c) or {})
                restored = read_answered(uid_c)
                if int(after.get("itemChunks") or 0) < 2 or legacy_ids[0] not in restored:
                    fail("legacy inline profile was not merged and re-chunked")
                else:
                    ok("legacy inline profile loads and is re-chunked (%d chunks)" % after.get("itemChunks"))

        # ------------------------------------------------- mixed version clients
            # A 0.7.1 client still writes answer records inline. Loading must
            # union them with the chunks and fold them in on the next save.
            mixed_id = ids[-3]
            mixed_answer = {
                mixed_id: {"mapValue": {"fields": {
                    "attempts": {"integerValue": "50"},
                    "correct": {"integerValue": "40"},
                    "firstCorrect": {"stringValue": "2026-01-02T03:04:05.000Z"},
                }}}
            }
            status, _ = request_json(
                doc_url(uid_c) + "?updateMask.fieldPaths=progress.answered",
                method="PATCH",
                body={"fields": {"progress": {"mapValue": {"fields": {
                    "answered": {"mapValue": {"fields": mixed_answer}},
                }}}}},
            )
            if status != 200:
                fail("could not simulate an inline write from a 0.7.1 client (%d)" % status)
            else:
                page_c.reload(wait_until="load")
                page_c.wait_for_function(
                    "window.QuestionaireCloud && window.QuestionaireCloud.configured", timeout=20000
                )
                deadline = time.time() + 30
                stored_mixed = None
                while time.time() < deadline:
                    stored_mixed = progress_of(firestore_doc(uid_c) or {})
                    if "answered" not in stored_mixed and int(stored_mixed.get("itemCount") or 0) >= 13760:
                        break
                    time.sleep(0.5)
                record = read_answered(uid_c).get(mixed_id, {})
                if int(record.get("attempts") or 0) < 50:
                    fail("inline 0.7.1 answer record was lost (attempts=%r)" % record.get("attempts"))
                elif stored_mixed is not None and "answered" in stored_mixed:
                    fail("inline answer records were not folded into the chunks")
                else:
                    ok("mixed-version inline records union into the chunks and are cleared")

        # ------------------------------------- oversized main-document guard
        context_d, page_d = open_app(browser)
        guard_profile = build_profile(ids, "A", 50, 60, 1763000000000, per_attempt=1200)
        guard_bytes = len(json.dumps(guard_profile).encode("utf-8"))
        print("guard probe local payload: %d bytes (%.1f KiB)" % (guard_bytes, guard_bytes / 1024))
        seed_local(page_d, guard_profile)
        uid_d = sign_in(page_d, EMAIL_D, PASSWORD, display_name="Heavy profile")
        doc_d = wait_for_doc(uid_d, lambda value: bool(fields_of(value).get("progress")), timeout=45)
        if not doc_d:
            fail("oversized profile never reached Firestore")
        else:
            core_d = progress_of(doc_d)
            main_d = document_bytes(doc_d)
            print("guarded main document: %d bytes (%.1f KiB), syncTrimmed=%r" % (
                main_d, main_d / 1024, core_d.get("syncTrimmed")))
            if main_d >= LIMIT:
                fail("main document is over the 1 MiB limit")
            elif core_d.get("syncTrimmed") is not True:
                fail("oversized main document was not trimmed")
            else:
                ok("oversized profile is trimmed to %.1f KiB before upload" % (main_d / 1024))
            local_d = json.loads(stored_payload(page_d, uid_d) or "{}")
            if len(local_d.get("attempts", [])) != 60:
                fail("cloud trimming changed the local attempt history")
            else:
                ok("local history keeps all 60 sittings after cloud trimming")

        # ------------------------------------------------------------------ rules
        token = id_token(EMAIL_A, PASSWORD)
        if not token:
            fail("could not mint an ID token for the rules check")
        else:
            status, _ = request_json(
                doc_url("someone-else"),
                method="PATCH",
                body={"fields": {"progress": {"mapValue": {"fields": {}}}}},
                token=token,
            )
            if status in (401, 403):
                ok("rules deny writing another account's document (%d)" % status)
            else:
                fail("rules allowed a foreign write (%d)" % status)
            status, _ = request_json(doc_url(uid, 0), token=token)
            if status == 200:
                ok("rules allow reading your own chunk documents")
            else:
                fail("owner could not read their own chunk document (%d)" % status)

        for context in (context_a, context_b, context_c, context_d):
            context.close()
        browser.close()

    if failures:
        print("\n%d emulator checks failed" % len(failures))
        sys.exit(1)
    print("\nOK: emulator merge, two-device sitting, size and rules checks passed")


if __name__ == "__main__":
    main()
