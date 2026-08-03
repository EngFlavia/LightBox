# LightBox Zoom Reduction and Save Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Allow 10% zoom and download a separate transparent PNG containing the current composition.

**Architecture:** Viewport state owns zoom bounds. An image-export module renders the loaded image to a transparent canvas using the current pan, zoom, and filter state. The DOM controller downloads the canvas PNG and never modifies the source file.

**Tech Stack:** Native ES modules, Canvas 2D, Pointer Events, Node built-in test runner.

## Global Constraints

- Minimum zoom: exactly 10% of initial fitted scale; existing maximum remains 5x.
- Source files are never overwritten, changed, or re-encoded in place.
- Exports are new PNG files, with transparent empty margins.
- The export flattens current zoom, position, grayscale, sepia, and contrast.
- On the same phone and orientation, reopening it fits the composition without adjustment.
- Lock blocks panning and both zoom directions, but not saving or filters.

---

### Task 1: Clamp viewport zoom at 10%

**Files:** Modify: `src/viewport-state.js`, `tests/viewport-state.test.js`

**Interfaces:** `zoomAt(state, nextScale, anchorX, anchorY)` returns state with scale clamped to `[0.1, 5]`; it returns the original object when locked.

- [ ] **Step 1: Write the failing test**

```js
test('reduces zoom to 10 percent and clamps lower values', () => {
  const reduced = zoomAt(createViewportState(), 0.1, 100, 100);
  const clamped = zoomAt(createViewportState(), 0.01, 100, 100);
  assert.deepEqual(reduced, { scale: 0.1, x: 90, y: 90, locked: false });
  assert.equal(clamped.scale, 0.1);
});
```

- [ ] **Step 2: Run `npm test -- tests/viewport-state.test.js`; expect the new test to fail because the lower bound is 1.**

- [ ] **Step 3: Implement the minimal change**

```js
const scale = Math.max(0.1, Math.min(5, nextScale));
```

- [ ] **Step 4: Run `npm test -- tests/viewport-state.test.js`; expect PASS.**

- [ ] **Step 5: Commit**

```bash
git add src/viewport-state.js tests/viewport-state.test.js
git commit -m "feat: allow reducing image zoom"
```

### Task 2: Build and test transparent canvas rendering

**Files:** Create: `src/image-export.js`, `tests/image-export.test.js`

**Interfaces:** `createComposition({ viewportWidth, viewportHeight, imageWidth, imageHeight, x, y })` returns `{ width, height, sourceX, sourceY, sourceWidth, sourceHeight }`. `renderComposition({ canvas, image, viewportWidth, viewportHeight, imageWidth, imageHeight, viewportState, transformState, pixelRatio })` returns the rendered canvas.

- [ ] **Step 1: Write failing geometry tests**

```js
test('centers source in export and preserves transparent margins', () => {
  assert.deepEqual(createComposition({ viewportWidth: 400, viewportHeight: 600, imageWidth: 200, imageHeight: 100, x: -30, y: 40 }),
    { width: 400, height: 600, sourceX: 70, sourceY: 290, sourceWidth: 200, sourceHeight: 100 });
});
```

- [ ] **Step 2: Run `npm test -- tests/image-export.test.js`; expect `ERR_MODULE_NOT_FOUND`.**

- [ ] **Step 3: Implement `createComposition`**

```js
export function createComposition({ viewportWidth, viewportHeight, imageWidth, imageHeight, x, y }) {
  return { width: viewportWidth, height: viewportHeight, sourceX: (viewportWidth - imageWidth) / 2 + x, sourceY: (viewportHeight - imageHeight) / 2 + y, sourceWidth: imageWidth, sourceHeight: imageHeight };
}
```

- [ ] **Step 4: Add a recording-context test for `renderComposition`: it must clear the canvas, set `filter` to `toCssFilter(transformState)`, call `setTransform(pixelRatio * scale, 0, 0, pixelRatio * scale, pixelRatio * sourceX, pixelRatio * sourceY)`, and `drawImage(image, 0, 0, imageWidth, imageHeight)`. Include a `pixelRatio: 2` case verifying an 800×1200 canvas.**

- [ ] **Step 5: Implement the renderer: set device-pixel canvas dimensions, clear without painting a background, save context, apply `toCssFilter`, set the transform above, draw, restore, and return canvas.**

- [ ] **Step 6: Run `npm test -- tests/image-export.test.js`; expect PASS.**

- [ ] **Step 7: Commit**

```bash
git add src/image-export.js tests/image-export.test.js
git commit -m "feat: render current composition for PNG export"
```

### Task 3: Provide saving and browser download

**Files:** Modify: `index.html`, `src/app.js`, `styles.css`, `tests/app.test.js`, `TESTING.md`

**Interfaces:** `exportFileName(name)` returns `${basename}-lightbox.png`; `canExportImage(image)` returns true only for complete images with natural dimensions. `#save-button` becomes enabled once a source is loaded.

- [ ] **Step 1: Add failing `app.test.js` tests:** `exportFileName("photo.jpg") === "photo-lightbox.png"`, `exportFileName("untitled") === "untitled-lightbox.png"`, and incomplete images fail `canExportImage`.

- [ ] **Step 2: Run `npm test -- tests/app.test.js`; expect failure because helpers do not exist.**

- [ ] **Step 3: Export the two pure helpers from `app.js`, then add disabled `<button id="save-button">Salvar imagem</button>` beside the open control and include it in the existing `controls` collection.**

- [ ] **Step 4: On save, validate the image, create a canvas, call `renderComposition` with viewport client size, image client size, both states, and `window.devicePixelRatio || 1`. Convert it with `canvas.toBlob(..., "image/png")`, download a temporary object URL with the derived filename, remove the link, revoke only that temporary URL, and show success or localized failure status. Retain `objectUrl`, `image.src`, and application state. Add responsive topbar wrapping if required.**

- [ ] **Step 5: Update `TESTING.md`: zoom range is `0.1x to 5x`; test a new transparent PNG, unchanged source, filters/pan/zoom rendered, alignment after re-open on the same phone/orientation, save availability while locked, and null-blob failure.**

- [ ] **Step 6: Run `npm test`; expect PASS. Perform each manual test on a mobile browser.**

- [ ] **Step 7: Commit**

```bash
git add index.html styles.css src/app.js tests/app.test.js TESTING.md
git commit -m "feat: save composed image as PNG"
```

### Task 4: Final verification

**Files:** Modify: none

- [ ] **Step 1: Run `npm test`; expect all viewport, transform, export, and app tests to pass.**
- [ ] **Step 2: Execute the complete updated mobile checklist in `TESTING.md`.**
- [ ] **Step 3: Run `git status --short` and `git diff --check`; confirm no unexpected files or whitespace errors.**
