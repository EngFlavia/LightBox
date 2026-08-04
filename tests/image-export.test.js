import test from 'node:test';
import assert from 'node:assert/strict';

import { canExportImage, createComposition, exportFileName, renderComposition } from '../src/image-export.js';

test('derives a PNG export name from the selected image name', () => {
  assert.equal(exportFileName('photo.jpg'), 'photo-lightbox.png');
  assert.equal(exportFileName('holiday.snapshot.jpeg'), 'holiday.snapshot-lightbox.png');
  assert.equal(exportFileName('untitled'), 'untitled-lightbox.png');
});

test('uses a stable fallback export name for an absent or extension-only name', () => {
  assert.equal(exportFileName(''), 'image-lightbox.png');
  assert.equal(exportFileName('.png'), 'image-lightbox.png');
});

test('allows export only after a decoded image has visible dimensions', () => {
  assert.equal(canExportImage(null), false);
  assert.equal(canExportImage({ complete: false, naturalWidth: 400, naturalHeight: 300, clientWidth: 400, clientHeight: 300 }), false);
  assert.equal(canExportImage({ complete: true, naturalWidth: 0, naturalHeight: 300, clientWidth: 400, clientHeight: 300 }), false);
  assert.equal(canExportImage({ complete: true, naturalWidth: 400, naturalHeight: 300, clientWidth: 0, clientHeight: 300 }), false);
  assert.equal(canExportImage({ complete: true, naturalWidth: 400, naturalHeight: 300, clientWidth: 400, clientHeight: 300 }), true);
});

test('creates an unscaled centered image origin with pan applied', () => {
  const composition = createComposition({
    viewportWidth: 400,
    viewportHeight: 300,
    imageWidth: 200,
    imageHeight: 100,
    x: 20,
    y: -10,
  });

  assert.deepEqual(composition, {
    width: 400,
    height: 300,
    originX: 120,
    originY: 90,
  });
});

test('renders the scaled, panned, filtered composition on a transparent device-pixel canvas', () => {
  const calls = [];
  const context = {
    clearRect: (...args) => calls.push(['clearRect', ...args]),
    save: () => calls.push(['save']),
    setTransform: (...args) => calls.push(['setTransform', ...args]),
    drawImage: (...args) => calls.push(['drawImage', ...args]),
    restore: () => calls.push(['restore']),
  };
  Object.defineProperty(context, 'filter', {
    set: (value) => calls.push(['filter', value]),
  });
  const canvas = {
    width: 0,
    height: 0,
    getContext: () => context,
  };
  const image = { id: 'source' };

  const rendered = renderComposition({
    canvas,
    image,
    viewportWidth: 400,
    viewportHeight: 300,
    imageWidth: 200,
    imageHeight: 100,
    viewportState: { scale: 0.5, x: 20, y: -10 },
    transformState: { grayscale: true, sepia: false, contrast: 20 },
    pixelRatio: 2,
  });

  assert.strictEqual(rendered, canvas);
  assert.equal(canvas.width, 800);
  assert.equal(canvas.height, 600);
  assert.deepEqual(calls, [
    ['clearRect', 0, 0, 800, 600],
    ['save'],
    ['filter', 'grayscale(1) sepia(0) contrast(120%)'],
    ['setTransform', 1, 0, 0, 1, 240, 180],
    ['drawImage', image, 0, 0, 200, 100],
    ['restore'],
  ]);
});
