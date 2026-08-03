import test from 'node:test';
import assert from 'node:assert/strict';

import { createStatusPresenter } from '../src/status-presenter.js';

test('hides an informational status two seconds after it is shown', () => {
  const element = { textContent: '', hidden: true };
  let scheduled;
  const presenter = createStatusPresenter(element, (callback, delay) => {
    scheduled = { callback, delay };
    return 1;
  }, () => {});

  presenter.show('Imagem salva em PNG.');

  assert.equal(element.textContent, 'Imagem salva em PNG.');
  assert.equal(element.hidden, false);
  assert.equal(scheduled.delay, 2000);

  scheduled.callback();
  assert.equal(element.hidden, true);
});
