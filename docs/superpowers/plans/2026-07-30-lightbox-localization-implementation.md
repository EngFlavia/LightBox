# LightBox Localization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add persistent PT, ES and EN localization to the Android LightBox APK.

**Architecture:** A pure translation module owns the text catalog and language normalization. The DOM renderer reads the selected language from localStorage, updates visible text and accessibility attributes, and the Android build packages the translated app.

**Tech Stack:** JavaScript ES modules, localStorage, Capacitor Android, Gradle.

## Global Constraints

- Default language is PT when no valid `lightbox-language` value exists.
- PT, ES and EN must update all visible and accessible interface copy immediately.
- Switching language must preserve the selected image and current editing state.

---

### Task 1: Translation state and localized interface

**Files:**
- Create: `src/i18n.js`
- Modify: `index.html`, `src/app.js`, `styles.css`
- Test: `tests/i18n.test.js`

- [ ] Write tests for language normalization, PT fallback, and retrieving translation keys for PT, ES and EN.
- [ ] Implement `src/i18n.js` with immutable catalogs and `getLanguage`, `setLanguage`, and `translate` functions using localStorage key `lightbox-language`.
- [ ] Add a compact PT/ES/EN selector in the top bar, translation attributes on static elements, and render-language logic for texts, aria labels and temporary statuses.
- [ ] Verify language changes preserve current image, viewport, lock and filters.
- [ ] Run tests with the bundled Node runtime.

### Task 2: Package and verify Android APK

**Files:**
- Modify: `www/`, `android/`, `release/LightBox-debug.apk`

- [ ] Sync web assets to `www` and run `npx cap sync android` with bundled Node.
- [ ] Build `android/app/build/outputs/apk/debug/app-debug.apk` with Java 17 and the installed Android SDK.
- [ ] Replace `release/LightBox-debug.apk` with the successful build.
