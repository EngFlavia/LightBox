const assert = require('assert/strict');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const readProjectFile = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

function test(name, verify) {
  try {
    verify();
    console.log(`ok - ${name}`);
  } catch (error) {
    console.error(`not ok - ${name}`);
    throw error;
  }
}

test('build metadata generates a strictly increasing Android versionCode', () => {
  const buildFile = readProjectFile('android/app/build.gradle');
  const versioningFile = readProjectFile('android/versioning.gradle');

  assert.match(buildFile, /apply from: '\.\.\/versioning\.gradle'/);
  assert.match(buildFile, /versionCode lightBoxVersionCode/);
  assert.match(versioningFile, /System\.currentTimeMillis\(\)/);
  assert.match(versioningFile, /previousVersion \+ 1L/);
  assert.doesNotMatch(buildFile, /versionCode\s+1\b/);
});

test('native update handling clears only the disposable WebView cache once per version', () => {
  const activity = readProjectFile('android/app/src/main/java/com/engflavia/lightbox/MainActivity.java');

  assert.match(activity, /getSharedPreferences\(/);
  assert.match(activity, /lastVersionCode == installedVersionCode/);
  assert.match(activity, /clearCache\(true\)/);
  assert.match(activity, /clearHistory\(\)/);
  assert.doesNotMatch(activity, /WebStorage/);
  assert.doesNotMatch(activity, /deleteAllData\(/);
});
