import test from 'node:test';
import assert from 'node:assert/strict';

import {
  createViewportState,
  pan,
  resetViewportState,
  setLocked,
  zoomAt,
} from '../src/viewport-state.js';

test('pans and zooms around the supplied anchor', () => {
  const panned = pan(createViewportState(), 24, -12);
  const zoomed = zoomAt(panned, 2, 100, 100);

  assert.deepEqual(panned, { scale: 1, x: 24, y: -12, locked: false });
  assert.deepEqual(zoomed, { scale: 2, x: -52, y: -124, locked: false });
});

test('preserves locked state when reset and ignores pan while locked', () => {
  const panned = pan(createViewportState(), 24, -12);
  const locked = setLocked(panned, true);

  assert.deepEqual(pan(locked, 9, 7), locked);
  assert.deepEqual(resetViewportState(locked), { scale: 1, x: 0, y: 0, locked: true });
});
