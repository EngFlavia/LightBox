# LightBox Mobile Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an installable mobile/tablet image viewer with touch zoom, panning, interaction lock, and composable visual transformations.

**Architecture:** Create a dependency-free static PWA in `C:\Users\flavi\Documents\Projetos\2026\LightBox`. Keep transformation state and touch math in small ES modules that are unit-testable with Node. The browser entry point coordinates file selection, DOM rendering, controls, Pointer Events, manifest registration, and offline caching.

**Tech Stack:** HTML5, CSS, vanilla ES modules, Pointer Events, CSS filters, Web App Manifest, Service Worker, Node.js built-in test runner.

## Global Constraints

- The application source lives in `C:\Users\flavi\Documents\Projetos\2026\LightBox`.
- The PWA has no server, runtime package dependencies, uploads, or persistent image storage.
- File selection uses `accept="image/*"`; the browser/device determines whether camera, gallery, and Downloads are offered.
- All filter effects are non-destructive CSS rendering; the selected source file is never rewritten.
- Locking blocks only pan/zoom Pointer Events; lock, reset, transform, and original controls remain interactive.
- Transformations must combine grayscale, sepia, and a contrast value clamped from `-100` through `100` in 10-point increments.

---

## File structure

- `C:\Users\flavi\Documents\Projetos\2026\LightBox\index.html` — accessible application shell and controls.
- `C:\Users\flavi\Documents\Projetos\2026\LightBox\styles.css` — mobile-first layout, responsive panel, image viewport, locked state.
- `C:\Users\flavi\Documents\Projetos\2026\LightBox\src\transform-state.js` — pure filter state reducers and CSS filter serialization.
- `C:\Users\flavi\Documents\Projetos\2026\LightBox\src\viewport-state.js` — pure scale/translation state and bounds helpers.
- `C:\Users\flavi\Documents\Projetos\2026\LightBox\src\app.js` — file input, DOM rendering, Pointer Event gesture controller, controls, service-worker registration.
- `C:\Users\flavi\Documents\Projetos\2026\LightBox\manifest.webmanifest` — install metadata.
- `C:\Users\flavi\Documents\Projetos\2026\LightBox\sw.js` — app-shell offline cache.
- `C:\Users\flavi\Documents\Projetos\2026\LightBox\icons\lightbox.svg` — scalable PWA application icon.
- `C:\Users\flavi\Documents\Projetos\2026\LightBox\tests\transform-state.test.js` — transformations unit tests.
- `C:\Users\flavi\Documents\Projetos\2026\LightBox\tests\viewport-state.test.js` — pan, zoom, reset, and locked-state unit tests.
- `C:\Users\flavi\Documents\Projetos\2026\LightBox\package.json` — scripts for Node test runner and static server.
- `C:\Users\flavi\Documents\Projetos\2026\LightBox\.gitignore` — ignores development artifacts only.

### Task 1: Establish testable state modules and project setup

**Files:**
- Create: `C:\Users\flavi\Documents\Projetos\2026\LightBox\package.json`
- Create: `C:\Users\flavi\Documents\Projetos\2026\LightBox\.gitignore`
- Create: `C:\Users\flavi\Documents\Projetos\2026\LightBox\src\transform-state.js`
- Create: `C:\Users\flavi\Documents\Projetos\2026\LightBox\src\viewport-state.js`
- Test: `C:\Users\flavi\Documents\Projetos\2026\LightBox\tests\transform-state.test.js`
- Test: `C:\Users\flavi\Documents\Projetos\2026\LightBox\tests\viewport-state.test.js`

**Interfaces:**
- Produces `createTransformState()`, `toggleGrayscale(state)`, `toggleSepia(state)`, `changeContrast(state, delta)`, `resetTransformState()`, and `toCssFilter(state)`.
- Produces `createViewportState()`, `pan(state, dx, dy)`, `zoomAt(state, nextScale, anchorX, anchorY)`, `resetViewportState()`, and `setLocked(state, locked)`.

- [ ] **Step 1: Write the failing transformation tests**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { createTransformState, toggleGrayscale, toggleSepia, changeContrast, toCssFilter } from '../src/transform-state.js';

test('layers grayscale, sepia, and contrast in one CSS filter', () => {
  let state = createTransformState();
  state = toggleGrayscale(state);
  state = toggleSepia(state);
  state = changeContrast(state, 20);
  assert.equal(toCssFilter(state), 'grayscale(1) sepia(1) contrast(120%)');
});

test('clamps contrast and resets all effects', () => {
  let state = changeContrast(createTransformState(), -150);
  assert.equal(state.contrast, -100);
});
```

- [ ] **Step 2: Run the transformation tests to verify failure**

Run: `npm test -- --test-name-pattern="layers|clamps"`

Expected: FAIL because `src/transform-state.js` does not exist.

- [ ] **Step 3: Write the failing viewport tests**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { createViewportState, pan, zoomAt, resetViewportState, setLocked } from '../src/viewport-state.js';

test('pans and zooms when unlocked', () => {
  let state = createViewportState();
  state = pan(state, 24, -12);
  state = zoomAt(state, 2, 100, 100);
  assert.equal(state.scale, 2);
  assert.notEqual(state.x, 0);
});

test('preserves viewport when locked and restores with reset', () => {
  const moved = pan(createViewportState(), 24, 12);
  const locked = setLocked(moved, true);
  assert.deepEqual(pan(locked, 10, 10), locked);
  assert.deepEqual(resetViewportState(locked), { scale: 1, x: 0, y: 0, locked: true });
});
```

- [ ] **Step 4: Run the viewport tests to verify failure**

Run: `npm test -- --test-name-pattern="pans|preserves"`

Expected: FAIL because `src/viewport-state.js` does not exist.

- [ ] **Step 5: Implement the minimal pure modules and test script**

```js
// src/transform-state.js
export const createTransformState = () => ({ grayscale: false, sepia: false, contrast: 0 });
export const toggleGrayscale = (s) => ({ ...s, grayscale: !s.grayscale });
export const toggleSepia = (s) => ({ ...s, sepia: !s.sepia });
export const changeContrast = (s, delta) => ({ ...s, contrast: Math.max(-100, Math.min(100, s.contrast + delta)) });
export const resetTransformState = () => createTransformState();
export const toCssFilter = (s) => `grayscale(${s.grayscale ? 1 : 0}) sepia(${s.sepia ? 1 : 0}) contrast(${100 + s.contrast}%)`;
```

```js
// src/viewport-state.js
export const createViewportState = () => ({ scale: 1, x: 0, y: 0, locked: false });
export const pan = (s, dx, dy) => s.locked ? s : ({ ...s, x: s.x + dx, y: s.y + dy });
export const zoomAt = (s, scale, anchorX, anchorY) => s.locked ? s : ({ ...s, scale: Math.max(1, Math.min(5, scale)), x: s.x + anchorX * (1 - scale / s.scale), y: s.y + anchorY * (1 - scale / s.scale) });
export const resetViewportState = (s) => ({ scale: 1, x: 0, y: 0, locked: s.locked });
export const setLocked = (s, locked) => ({ ...s, locked });
```

Add `"type": "module"` and `"test": "node --test"` to `package.json`. Add `node_modules/`, `dist/`, `.env`, `.env.local`, `.env.*.local`, `*.log`, and `.vscode/` to `.gitignore`.

- [ ] **Step 6: Run all unit tests to verify success**

Run: `npm test`

Expected: all four tests PASS.

- [ ] **Step 7: Commit**

```powershell
git add -- package.json .gitignore src/transform-state.js src/viewport-state.js tests/transform-state.test.js tests/viewport-state.test.js
git commit -m "feat: add image viewer state modules"
```

### Task 2: Build the accessible responsive viewer interface

**Files:**
- Create: `C:\Users\flavi\Documents\Projetos\2026\LightBox\index.html`
- Create: `C:\Users\flavi\Documents\Projetos\2026\LightBox\styles.css`
- Create: `C:\Users\flavi\Documents\Projetos\2026\LightBox\src\app.js`
- Modify: `C:\Users\flavi\Documents\Projetos\2026\LightBox\package.json`

**Interfaces:**
- Consumes all Task 1 exports.
- Produces a `render()` function that maps viewport and transform state to `img.style.transform`, `img.style.filter`, control labels, and pressed state.

- [ ] **Step 1: Add a failing browser-level smoke test checklist**

Create `C:\Users\flavi\Documents\Projetos\2026\LightBox\TESTING.md` containing these manual checks: opening a JPG/PNG/WEBP from Files/Downloads, canceling the picker, rejecting a non-image, panning, pinch zooming, locking/unlocking, reset, applying simultaneous filters, and Original.

- [ ] **Step 2: Verify the checklist cannot yet pass**

Run: `npx --yes serve .`

Expected: FAIL or no application shell because `index.html` does not exist.

- [ ] **Step 3: Implement the document shell and mobile-first styles**

Create `index.html` with a hidden `<input id="image-input" type="file" accept="image/*">`, a labelled `Abrir imagem` button, full-screen `#viewport` containing `<img id="image">`, status message, reset button, lock toggle, and Transformar button. Include a closed bottom panel with gray-scale and sepia toggles, `− Contraste`, `+ Contraste`, and `Original`; use `aria-pressed` for toggles. 

Use CSS `touch-action: none` on `#viewport`, `object-fit: contain` for the image, fixed safe-area-aware action buttons, a responsive bottom sheet, and a `.is-locked` state that changes the lock button visual state but does not cover control buttons.

- [ ] **Step 4: Implement file selection, rendering, and controls**

In `src/app.js`, import Task 1 interfaces. On successful image-file selection, assign `URL.createObjectURL(file)` to `#image.src`, revoking a previous object URL; show a readable error for other file types and preserve current image when selection is canceled. Implement each control by replacing only its relevant immutable state, then calling `render()`. In `render()`, assign:

```js
image.style.transform = `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.scale})`;
image.style.filter = toCssFilter(transform);
```

Toggle `aria-pressed`, synchronize the lock icon/text, and close/open the transform sheet with the Transformar button.

- [ ] **Step 5: Implement Pointer Event gestures**

Store active pointers in `Map<number, { x: number, y: number }>` only while `viewport.locked` is false. With one pointer, call `pan(viewport, current.x - previous.x, current.y - previous.y)`. With two pointers, compute Euclidean distance and their midpoint; pass `viewport.scale * (currentDistance / startingDistance)` and midpoint coordinates to `zoomAt`. Delete pointers on `pointerup`, `pointercancel`, and `lostpointercapture`; call `setPointerCapture` on pointer down. If locked, return from the viewport handlers before any state mutation.

- [ ] **Step 6: Run the app and complete the manual smoke checklist**

Run: `npx --yes serve .`

Expected: a phone/tablet browser can open the interface, select an image, use all listed controls, and lock/unlock gestures.

- [ ] **Step 7: Commit**

```powershell
git add -- index.html styles.css src/app.js TESTING.md package.json
git commit -m "feat: add touch image viewer interface"
```

### Task 3: Add installability and offline support

**Files:**
- Create: `C:\Users\flavi\Documents\Projetos\2026\LightBox\manifest.webmanifest`
- Create: `C:\Users\flavi\Documents\Projetos\2026\LightBox\sw.js`
- Create: `C:\Users\flavi\Documents\Projetos\2026\LightBox\icons\lightbox.svg`
- Modify: `C:\Users\flavi\Documents\Projetos\2026\LightBox\index.html`
- Modify: `C:\Users\flavi\Documents\Projetos\2026\LightBox\src\app.js`

**Interfaces:**
- Consumes the static app shell from Task 2.
- Produces an installable web manifest and a versioned `lightbox-shell-v1` cache.

- [ ] **Step 1: Add a failing installability test checklist item**

Append to `TESTING.md`: install the app from a Chromium mobile/tablet browser, close it, disable network, open it from the device launcher, and confirm its shell loads.

- [ ] **Step 2: Verify the installability checklist cannot yet pass**

Run: `npx --yes serve .`

Expected: browser DevTools Application panel reports no manifest and no service worker.

- [ ] **Step 3: Implement manifest and service worker**

Create a 512×512 `icons/lightbox.svg` showing a simple white image-frame glyph on the dark `#101114` background. Create `manifest.webmanifest` with `name` and `short_name` of `LightBox`, `display: "standalone"`, `start_url: "./"`, `background_color: "#101114"`, `theme_color: "#101114"`, and an `icons` entry for that SVG with `sizes: "any"` and `type: "image/svg+xml"`. Link it from `index.html`. In `sw.js`, precache `/`, `/index.html`, `/styles.css`, `/src/app.js`, `/src/transform-state.js`, `/src/viewport-state.js`, `/manifest.webmanifest`, and `/icons/lightbox.svg` during install; on fetch, return cache first and update the cache with successful same-origin GET responses.

- [ ] **Step 4: Register the service worker**

Append this guarded browser-only code to `src/app.js`:

```js
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js'));
}
```

- [ ] **Step 5: Run unit tests and the offline installation checklist**

Run: `npm test`

Expected: all unit tests PASS.

Then serve over `http://localhost`, verify manifest/service-worker registration in browser DevTools, install the PWA, turn offline mode on in DevTools, and reload. Expected: the app shell loads offline.

- [ ] **Step 6: Commit**

```powershell
git add -- manifest.webmanifest sw.js icons/lightbox.svg index.html src/app.js TESTING.md
git commit -m "feat: make LightBox installable offline"
```

### Task 4: Final end-to-end verification

**Files:**
- Modify: `C:\Users\flavi\Documents\Projetos\2026\LightBox\TESTING.md`

**Interfaces:**
- Consumes the complete app from Tasks 1–3.
- Produces an evidence-backed completion checklist.

- [ ] **Step 1: Add final acceptance checklist results**

Record each spec criterion and mark it only after verification: chooser availability, touch pan/zoom, lock freeze, unlock, viewport reset, installation/offline shell, filter composition, and original restoration.

- [ ] **Step 2: Run static checks and unit tests**

Run: `node --check src/app.js; node --check src/transform-state.js; node --check src/viewport-state.js; npm test`

Expected: syntax checks exit 0 and all tests PASS.

- [ ] **Step 3: Run the full manual mobile/tablet scenario**

Run: `npx --yes serve .`

Expected: select a downloaded photo, zoom/pan it, lock it and confirm gestures do nothing, unlock and move it, layer black-and-white/sepia/contrast, use Original, reset the viewport, then install and run offline.

- [ ] **Step 4: Commit verification record**

```powershell
git add -- TESTING.md
git commit -m "test: record LightBox acceptance checks"
```
