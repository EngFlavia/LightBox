import test from 'node:test';
import assert from 'node:assert/strict';

import { createStatusPresenter } from '../src/status-presenter.js';

test('shows the status message and hides it after two seconds', () => {
  const classes = new Set();
  const element = {
    textContent: '',
    classList: {
      add: (className) => classes.add(className),
      remove: (className) => classes.delete(className),
    },
  };
  let scheduledCallback;
  let scheduledDelay;
  const presenter = createStatusPresenter(element, {
    setTimeout: (callback, delay) => {
      scheduledCallback = callback;
      scheduledDelay = delay;
      return 1;
    },
    clearTimeout: () => {},
  });

  presenter.show('Imagem salva em PNG.');

  assert.equal(element.textContent, 'Imagem salva em PNG.');
  assert.equal(classes.has('is-visible'), true);
  assert.equal(scheduledDelay, 2000);

  scheduledCallback();

  assert.equal(classes.has('is-visible'), false);
});
