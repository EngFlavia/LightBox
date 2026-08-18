import test from 'node:test';
import assert from 'node:assert/strict';

import { getScreenBrightness, setScreenBrightness } from '../src/screen-brightness.js';

test('clamps native screen brightness to the full 0 to 100 range', async () => {
  const levels = [];
  await setScreenBrightness({ set: async ({ level }) => levels.push(level) }, 140);
  await setScreenBrightness({ set: async ({ level }) => levels.push(level) }, -10);

  assert.deepEqual(levels, [100, 0]);
});

test('reads the current physical screen brightness before editing', async () => {
  const level = await getScreenBrightness({ get: async () => ({ level: 62 }) });

  assert.equal(level, 62);
});
