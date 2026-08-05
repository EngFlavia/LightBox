# LightBox TR_001 Recovery Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restore the approved TR_001 interface behaviors without changing PNG export.

**Architecture:** Keep image transformation and export logic intact. Add small UI helpers for transient status and localization, and test the state contracts before wiring them into the DOM.

**Tech Stack:** HTML, CSS, browser JavaScript, Node test runner.

## Global Constraints

- Preserve existing save-as-PNG behavior.
- The app must continue to work without a network connection.
- Original resets filters, zoom and position.

---

### Task 1: Restore edit-panel and reset behavior

**Files:**
- Modify: `index.html`, `src/app.js`, `styles.css`
- Test: `tests/app.test.js`

- [ ] Write tests that require the panel to begin closed, toggle through Editar, and require Original to reset viewport and filters.
- [ ] Run the focused test and confirm failure against the current UI contract.
- [ ] Implement the minimal panel toggle and Original reset wiring; remove Redefinir.
- [ ] Run the focused and full test suites.

### Task 2: Restore transient status feedback

**Files:**
- Create: `src/status-presenter.js`
- Modify: `src/app.js`, `styles.css`
- Test: `tests/status-presenter.test.js`

- [ ] Write a failing test that status text becomes visible then hides after two seconds.
- [ ] Implement the smallest status presenter satisfying the timer contract.
- [ ] Use it from app.js for load, lock, save and error feedback.
- [ ] Run the focused and full test suites.

### Task 3: Restore persisted language selection

**Files:**
- Create: `src/i18n.js`
- Modify: `index.html`, `src/app.js`
- Test: `tests/i18n.test.js`

- [ ] Write failing tests for Portuguese default, immediate PT/ES/EN lookup, and saved language restoration.
- [ ] Implement translation lookup and localStorage persistence.
- [ ] Add the language selector and apply translations to visible copy and transient feedback.
- [ ] Run the full test suite.

### Task 4: Validate package

**Files:**
- Modify: `TESTING.md`

- [ ] Run all tests.
- [ ] Build the Android debug APK from this source tree.
- [ ] Verify the APK timestamp and size, then document its path and install test checklist.
