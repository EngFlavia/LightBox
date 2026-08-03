import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('ships a service worker that immediately replaces the cached v1 shell', async () => {
  const serviceWorker = await readFile(new URL('../sw.js', import.meta.url), 'utf8');

  assert.match(serviceWorker, /lightbox-shell-v2/);
  assert.match(serviceWorker, /skipWaiting\(\)/);
  assert.match(serviceWorker, /clients\.claim\(\)/);
});

test('registers the replacement service worker when the app starts', async () => {
  const app = await readFile(new URL('../src/app.js', import.meta.url), 'utf8');

  assert.match(app, /serviceWorker\.register\('\.\/sw\.js'\)/);
});
