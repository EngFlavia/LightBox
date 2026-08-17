import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

import {
  createEditPanelState,
  lockIconMarkup,
  resetImageAdjustments,
  resolveProjectWriter,
  toggleEditPanel,
} from '../src/app.js';

test('starts with the edit panel closed and toggles it through Editar', () => {
  const closed = createEditPanelState();

  assert.deepEqual(closed, { open: false });
  assert.deepEqual(toggleEditPanel(closed), { open: true });
  assert.deepEqual(toggleEditPanel({ open: true }), { open: false });
});

test('renders the original yellow lock icons for locked and unlocked states', () => {
  assert.equal(lockIconMarkup(true), '🔒');
  assert.equal(lockIconMarkup(false), '🔓');
});

test('uses the native ProjectFile bridge exposed by Capacitor', () => {
  const writer = { write() {}, list() {} };
  assert.equal(resolveProjectWriter({ Capacitor: { Plugins: { ProjectFile: writer } } }), writer);
});

test('Original restores both the viewport and image filters', () => {
  const restored = resetImageAdjustments({ scale: 0.4, x: 48, y: -30, locked: true }, {
    grayscale: true,
    sepia: true,
    contrast: 60,
  });

  assert.deepEqual(restored, {
    viewportState: { scale: 1, x: 0, y: 0, locked: true },
    transformState: { grayscale: false, sepia: false, contrast: 0 },
  });
});

test('uses a Carregar menu with image, projects and save actions', async () => {
  const root = new URL('../', import.meta.url);
  const markup = await readFile(new URL('index.html', root), 'utf8');
  const controls = markup.match(/<div id="transform-controls"[\s\S]*?<\/div>/)?.[0] ?? '';

  assert.match(markup, /<button id="open-button"[^>]*>Carregar<\/button>/);
  assert.match(markup, /<button id="open-image-button"[^>]*>Carregar Imagem<\/button>/);
  assert.match(markup, /<button id="open-project-button"[^>]*>Projetos salvos<\/button>/);
  assert.match(markup, /<label class="language-selector"[\s\S]*?<\/label>\s*<button id="save-button"[^>]*>💾<\/button>/);
  assert.doesNotMatch(markup, /id="export-button"/);
  assert.match(controls, /<button id="original-button"[^>]*>Original<\/button>[\s\S]*<button id="grayscale-button"[^>]*>Escala De Cinza<\/button>/);
});
