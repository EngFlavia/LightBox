import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { createWebServer } from '../scripts/web-server.mjs';

test('serves the application shell from the local project directory', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'lightbox-web-'));
  await writeFile(join(directory, 'index.html'), '<h1>LightBox</h1>');
  const server = createWebServer({ rootDirectory: directory });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address();
  const response = await fetch(`http://127.0.0.1:${port}/`);

  assert.equal(response.status, 200);
  assert.equal(await response.text(), '<h1>LightBox</h1>');
  await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
});
