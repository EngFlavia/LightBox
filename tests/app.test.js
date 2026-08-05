import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

import {
  createEditPanelState,
  resetImageAdjustments,
  toggleEditPanel,
} from '../src/app.js';

test('starts with the edit panel closed and toggles it through Editar', () => {
  const closed = createEditPanelState();

  assert.deepEqual(closed, { open: false });
  assert.deepEqual(toggleEditPanel(closed), { open: true });
  assert.deepEqual(toggleEditPanel({ open: true }), { open: false });
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

test('uses the approved labels and puts Original before Escala De Cinza', async () => {
  const root = new URL('../', import.meta.url);
  const markup = await readFile(new URL('index.html', root), 'utf8');
  const controls = markup.match(/<div id="transform-controls"[\s\S]*?<\/div>/)?.[0] ?? '';

  assert.match(markup, /<button id="open-button"[^>]*>Carregar Imagem<\/button>/);
  assert.match(controls, /<button id="original-button"[^>]*>Original<\/button>[\s\S]*<button id="grayscale-button"[^>]*>Escala De Cinza<\/button>/);
});
