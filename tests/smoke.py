"""Questionaire smoke suite — the flows that were previously checked by hand.

Run against a static server:

    python -m http.server 4173 --bind 127.0.0.1
    python tests/smoke.py

BASE_URL can override the default (http://127.0.0.1:4173).
"""

import os
import sys

from playwright.sync_api import sync_playwright

BASE = os.environ.get("BASE_URL", "http://127.0.0.1:4173").rstrip("/")
SUBJECT = "calculus"
PAPER_SIZE = 20


def log(message):
    print("  · " + message, flush=True)


def fail(message):
    print("FAIL: " + message, file=sys.stderr, flush=True)
    sys.exit(1)


def wait_ready(page):
    page.wait_for_selector("main", timeout=20000)


def ensure_guest(page):
    """A fresh browser lands on the sign-in page; use the device-local guest."""
    page.goto(BASE + "/index.html", wait_until="domcontentloaded")
    page.wait_for_timeout(600)
    if page.locator('[data-action="guest-signin"]').count():
        page.locator('[data-action="guest-signin"]').first.click()
    wait_ready(page)


def open_papers(page):
    page.goto(BASE + "/index.html#/subject/%s/papers" % SUBJECT, wait_until="domcontentloaded")
    page.wait_for_selector('[data-action="open-papers"]', timeout=15000)
    page.locator('[data-action="open-papers"]').first.click()
    page.wait_for_selector('[data-action="start-practice-paper"]', timeout=15000)


def start_paper(page, index=0):
    page.locator('[data-action="start-practice-paper"]').nth(index).click()
    page.wait_for_selector(".paper-question", timeout=15000)


def answer_with_keyboard(page, key):
    page.keyboard.press(key)
    page.wait_for_selector(".paper-question .option.is-correct, .paper-question .option.is-wrong", timeout=5000)


def submit_paper(page):
    page.keyboard.press("Enter")  # last question opens the review screen
    page.wait_for_selector('[data-action="paper-submit"]', timeout=8000)
    page.locator('[data-action="paper-submit"]').click()
    page.wait_for_selector('[data-action="review-current-paper"]', timeout=15000)


def open_attempt_review(page):
    page.locator('[data-action="review-current-paper"]').click()
    page.wait_for_selector(".attempt-review", timeout=15000)


def miss_map(page):
    """Code -> correct letter, read from the saved attempt review."""
    misses = {}
    for article in page.locator(".attempt-q.is-wrong").all():
        code = article.locator(".q-code").first.inner_text().strip()
        for row in article.locator(".attempt-q-row").all():
            if "correct" in row.inner_text().lower():
                letter = row.locator("strong").first.inner_text().strip()[:1]
                if code and letter in "ABCD":
                    misses[code] = letter
    return misses


def test_submit_and_history(page):
    log("submit a paper, then find its row in paper history")
    open_papers(page)
    start_paper(page)

    for index in range(PAPER_SIZE):
        # Alternate keys so the sitting is guaranteed to contain misses even when
        # a generated bank places its correct option first.
        answer_with_keyboard(page, "a" if index % 2 == 0 else "d")
        page.keyboard.press("Enter")

    submit_paper(page)
    open_attempt_review(page)

    if page.locator(".attempt-review-score").count() == 0:
        fail("attempt review has no score")

    open_papers(page)
    rows = page.locator(".attempt-history .attempt-row")
    rows.first.wait_for(timeout=8000)
    if rows.count() < 1:
        fail("paper history did not show the submitted sitting")

    log("history row present (%d sitting(s))" % rows.count())


def test_resume(page):
    log("start a paper, reload, resume it from the dashboard")
    open_papers(page)
    start_paper(page, 1)
    first_code = page.locator(".paper-question .q-code").first.inner_text().strip()
    answer_with_keyboard(page, "b")

    page.reload(wait_until="domcontentloaded")
    page.goto(BASE + "/index.html#/dashboard", wait_until="domcontentloaded")
    page.wait_for_selector(".resume-strip", timeout=15000)
    page.locator('[data-action="resume-attempt"]').click()
    page.wait_for_selector(".paper-question", timeout=15000)

    if page.locator("text=Unfinished sitting").count() and page.locator(".paper-question").count() == 0:
        fail("resume did not reopen the runner")

    answered = page.locator(".paper-question .option.is-correct, .paper-question .option.is-wrong").count()
    if not answered:
        fail("resumed paper lost the saved answer")
    log("resumed the same sitting (%s, answer kept)" % first_code)


def test_misses_retake_and_corrected(page):
    log("retake misses and answer them correctly, then check the corrected badge")
    open_papers(page)
    page.locator('.attempt-history [data-action="open-attempt"]').first.click()
    page.wait_for_selector(".attempt-review", timeout=15000)

    misses = miss_map(page)
    if not misses:
        fail("the first sitting recorded no misses, so the retake cannot be checked")
    log("%d misses to retake" % len(misses))

    page.locator('[data-action="retake-misses"]').first.click()
    page.wait_for_selector(".paper-question", timeout=15000)

    answered = 0
    for _ in range(len(misses)):
        page.wait_for_selector(".paper-question .q-code", timeout=8000)
        code = page.locator(".paper-question .q-code").first.inner_text().strip()
        letter = misses.get(code)
        if not letter:
            fail("retake question %s was not in the saved misses" % code)
        page.evaluate(
            """(letter) => {
                const button = [...document.querySelectorAll('.paper-question .option')]
                    .find((element) => element.querySelector('.option-key').textContent.trim() === letter);
                if (!button) throw new Error('option ' + letter + ' not found');
                button.click();
            }""",
            letter,
        )
        page.wait_for_selector(".paper-question .option.is-correct", timeout=5000)
        page.locator('[data-action="paper-next"]').click()
        answered += 1
        page.wait_for_timeout(150)

    if answered != len(misses):
        fail("answered %d of %d retake questions" % (answered, len(misses)))

    page.wait_for_selector('[data-action="review-current-paper"]', timeout=15000)

    page.goto(BASE + "/index.html#/review", wait_until="domcontentloaded")
    page.wait_for_selector('[data-action="review-filter"]', timeout=15000)
    page.locator('[data-action="review-filter"][data-value="corrected"]').click()
    page.wait_for_timeout(300)
    corrected = page.locator(".badge", has_text="Later corrected").count()
    if corrected < 1:
        fail("no Later corrected badge after a successful misses retake")
    log("%d corrected badge(s) in the review queue" % corrected)


def main():
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch()
        context = browser.new_context(viewport={"width": 1280, "height": 900})
        page = context.new_page()
        page.on("dialog", lambda dialog: dialog.accept())
        errors = []
        page.on("pageerror", lambda error: errors.append(str(error)))

        try:
            ensure_guest(page)
            test_submit_and_history(page)
            test_resume(page)
            test_misses_retake_and_corrected(page)
            if errors:
                fail("page errors: " + " | ".join(errors[:3]))
            print("OK: 3 smoke flows passed", flush=True)
        finally:
            browser.close()


if __name__ == "__main__":
    main()
