export function createStatusPresenter(element, {
  setTimeout: schedule = globalThis.setTimeout,
  clearTimeout: cancel = globalThis.clearTimeout,
} = {}) {
  let hideTimer;

  function show(message) {
    if (hideTimer) cancel(hideTimer);

    element.textContent = message;
    element.classList.add('is-visible');
    hideTimer = schedule(() => {
      element.classList.remove('is-visible');
      hideTimer = undefined;
    }, 2000);
  }

  return { show };
}
