export function createStatusPresenter(element, setTimer = setTimeout, clearTimer = clearTimeout) {
  let hideTimer = null;

  function show(message) {
    if (hideTimer !== null) clearTimer(hideTimer);
    element.textContent = message;
    element.hidden = false;
    hideTimer = setTimer(() => {
      element.hidden = true;
      hideTimer = null;
    }, 2000);
  }

  return { show };
}
