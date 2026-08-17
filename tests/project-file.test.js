import test from 'node:test';
import assert from 'node:assert/strict';

import { createProjectFile, parseProjectFile } from '../src/project-file.js';

const project = {
  imageDataUrl: 'data:image/png;base64,AA==',
  imageFileName: 'flor.png',
  viewportState: { scale: 1.5, x: 12, y: -8, locked: false },
  transformState: { grayscale: false, sepia: true, contrast: 20 },
  referenceViewport: { width: 360, height: 720 },
};

test('round-trips a versioned image project', () => {
  assert.deepEqual(parseProjectFile(createProjectFile(project)), { version: 1, ...project });
});

test('rejects an invalid project file', () => {
  assert.throws(() => parseProjectFile('{}'), /Projeto LightBox inválido/);
});
