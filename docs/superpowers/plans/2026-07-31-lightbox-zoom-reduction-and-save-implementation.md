# LightBox Zoom Reduction and Save Implementation Plan

**Goal:** permit a 10% zoom and save a separate transparent PNG which bakes the screen composition.

## Global Constraints

- Zoom is clamped to 0.1–5; lock blocks pan and zoom.
- Never overwrite or change the source image.
- The saved file is a new PNG with transparent empty margins and its current pan, zoom, grayscale, sepia, and contrast.
- Reopening on the same phone and orientation fits the same composition.

### Task 1: Clamp viewport zoom at 10%

**Files:** Modify `src/viewport-state.js`, `tests/viewport-state.test.js`.

Add a test showing `zoomAt(createViewportState(), 0.1, 100, 100)` returns `{ scale: 0.1, x: 90, y: 90, locked: false }`, and that 0.01 clamps to 0.1. Run it failing first. Change only the lower clamp from 1 to 0.1. Run focused and full tests, then commit.

### Task 2: Render the current composition to a transparent canvas

**Files:** Create `src/image-export.js`, `tests/image-export.test.js`.

Create `createComposition({ viewportWidth, viewportHeight, imageWidth, imageHeight, x, y })` returning viewport size and an unscaled centered source origin plus pan. Create `renderComposition({ canvas, image, viewportWidth, viewportHeight, imageWidth, imageHeight, viewportState, transformState, pixelRatio })`: size canvas at device pixels, clear it without background paint, apply `toCssFilter(transformState)`, use canvas transform `pixelRatio * viewportState.scale` and scaled composition origin, draw the image, restore, and return canvas. Tests must use a recording context for filter, transform and drawing, including pixelRatio 2. TDD: each new behavior test must fail before implementation. Run full suite and commit.

### Task 3: Add save button and download behavior

**Files:** Modify `index.html`, `src/app.js`, `styles.css`, `tests/app.test.js`, `TESTING.md`.

Add disabled `#save-button` which is enabled after a successful load. Export and test `exportFileName(name)` (`photo.jpg` → `photo-lightbox.png`) and `canExportImage(image)`. On click validate source, render a new canvas with client sizes and devicePixelRatio, generate a PNG Blob, download it through a temporary URL and revoke only that temporary URL. Do not mutate `objectUrl`, source, or state. Report localized success or failure. Update CSS wrapping and test manual checklist for 0.1–5 zoom, transparency, filters, re-open alignment, lock, and null Blob. Follow TDD, test, commit.

### Task 4: Final verification

Run all tests, manual mobile checks in `TESTING.md`, `git diff --check`, and inspect status.
