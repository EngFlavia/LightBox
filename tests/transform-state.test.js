import test from 'node:test';
import assert from 'node:assert/strict';

import {
  changeContrast,
  createTransformState,
  toggleGrayscale,
  toggleSepia,
  toCssFilter,
} from '../src/transform-state.js';

test('layers grayscale, sepia, and contrast into the CSS filter', () => {
  const initial = createTransformState();
  const grayscale = toggleGrayscale(initial);
  const sepia = toggleSepia(grayscale);
  const contrasted = changeContrast(sepia, 20);

  assert.deepEqual(initial, { grayscale: false, sepia: false, contrast: 0 });
  assert.equal(toCssFilter(contrasted), 'grayscale(1) sepia(1) contrast(120%)');
});

test('clamps contrast at minus 100', () => {
  const changed = changeContrast(createTransformState(), -150);

  assert.equal(changed.contrast, -100);
});
