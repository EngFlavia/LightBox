import test from 'node:test';
import assert from 'node:assert/strict';

import { dataUrlToBase64, writeFile, writeProjectFile } from '../src/file-writer.js';

test('writes through the native bridge and returns its URI', async () => {
  const nativeWriter = { write: async (request) => ({ uri: 'content://saved', request }) };
  assert.equal((await writeFile({ nativeWriter, base64: 'AA==', fileName: 'flor.lightbox', mimeType: 'application/json', folder: 'documents' })).uri, 'content://saved');
});

test('extracts a base64 payload from a data URL', () => {
  assert.equal(dataUrlToBase64('data:image/png;base64,AA=='), 'AA==');
});

test('writes a project without selecting a MediaStore folder', async () => {
  const requests = [];
  await writeProjectFile({
    nativeWriter: { write: async (request) => { requests.push(request); return { uri: 'content://project' }; } },
    base64: 'e30=',
    fileName: 'teste.lightbox',
  });

  assert.deepEqual(requests, [{ base64: 'e30=', fileName: 'teste.lightbox', mimeType: 'application/json' }]);
});
