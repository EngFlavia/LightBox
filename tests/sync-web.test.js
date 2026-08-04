import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { syncWebFiles } from '../scripts/sync-web.mjs';

test('copies the app shell and source modules to the Capacitor web directory', async () => {
  const root = await mkdtemp(join(tmpdir(), 'lightbox-sync-'));
  const source = join(root, 'source');
  const destination = join(root, 'www');

  try {
    await mkdir(join(source, 'src'), { recursive: true });
    await writeFile(join(source, 'index.html'), '<main>LightBox</main>');
    await writeFile(join(source, 'styles.css'), '.app { color: white; }');
    await writeFile(join(source, 'src', 'app.js'), 'export const app = true;');

    await syncWebFiles(source, destination);

    assert.equal(await readFile(join(destination, 'index.html'), 'utf8'), '<main>LightBox</main>');
    assert.equal(await readFile(join(destination, 'styles.css'), 'utf8'), '.app { color: white; }');
    assert.equal(await readFile(join(destination, 'src', 'app.js'), 'utf8'), 'export const app = true;');
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
