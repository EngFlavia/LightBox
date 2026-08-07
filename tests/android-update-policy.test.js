import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import test from 'node:test';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

async function projectFile(relativePath) {
  return readFile(join(root, relativePath), 'utf8');
}

test('derives the Android versionCode from the build time instead of a fixed value', async () => {
  const buildFile = await projectFile('android/app/build.gradle');
  const versioningFile = await projectFile('android/versioning.gradle');

  assert.match(buildFile, /apply from: '\.\.\/versioning\.gradle'/);
  assert.match(buildFile, /versionCode lightBoxVersionCode/);
  assert.match(versioningFile, /System\.currentTimeMillis\(\)/);
  assert.match(versioningFile, /previousVersion \+ 1L/);
  assert.doesNotMatch(buildFile, /versionCode\s+1\b/);
});

test('clears WebView cache and service-worker storage once when the installed versionCode changes', async () => {
  const activity = await projectFile('android/app/src/main/java/com/engflavia/lightbox/MainActivity.java');

  assert.match(activity, /getSharedPreferences\(/);
  assert.match(activity, /WebStorage\.getInstance\(\)\.deleteAllData\(\)/);
  assert.match(activity, /clearCache\(true\)/);
  assert.match(activity, /clearHistory\(\)/);
});
