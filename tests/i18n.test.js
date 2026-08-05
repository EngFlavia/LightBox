import test from 'node:test';
import assert from 'node:assert/strict';

import { createI18n } from '../src/i18n.js';

function createStorage(initial = {}) {
  const values = new Map(Object.entries(initial));
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
  };
}

test('defaults to Portuguese and looks up visible text immediately', () => {
  const i18n = createI18n({ storage: createStorage() });

  assert.equal(i18n.language, 'pt');
  assert.equal(i18n.t('openImage'), 'Carregar Imagem');
  assert.equal(i18n.t('gesturesUnlocked'), 'Gestos liberados.');
});

test('changes lookup immediately between Portuguese, Spanish and English', () => {
  const i18n = createI18n({ storage: createStorage() });

  i18n.setLanguage('es');
  assert.equal(i18n.t('openImage'), 'Cargar Imagen');
  assert.equal(i18n.t('imageSaved'), 'Imagen guardada en PNG.');

  i18n.setLanguage('en');
  assert.equal(i18n.t('openImage'), 'Load Image');
  assert.equal(i18n.t('imageSaved'), 'Image saved as PNG.');
});

test('restores the language selected in local storage', () => {
  const storage = createStorage({ 'lightbox-language': 'es' });
  const i18n = createI18n({ storage });

  assert.equal(i18n.language, 'es');

  i18n.setLanguage('en');
  assert.equal(storage.getItem('lightbox-language'), 'en');
});
