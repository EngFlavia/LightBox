import { changeContrast, createTransformState, resetTransformState, toCssFilter, toggleGrayscale, toggleSepia } from './transform-state.js';
import { getScreenBrightness, setScreenBrightness } from './screen-brightness.js';
import { canExportImage, exportFileName } from './image-export.js';
import { dataUrlToBase64, writeProjectFile } from './file-writer.js';
import { createI18n } from './i18n.js';
import { createProjectFile, parseProjectFile } from './project-file.js';
import { createStatusPresenter } from './status-presenter.js';
import { createViewportState, pan, resetViewportState, setLocked, zoomAt } from './viewport-state.js';

export function createEditPanelState() {
  return { open: false };
}

export function toggleEditPanel(state) {
  return { open: !state.open };
}

export function resetImageAdjustments(viewportState, transformState) {
  return {
    viewportState: resetViewportState(viewportState),
    transformState: resetTransformState(transformState),
  };
}

export function isImageFile(file) {
  return Boolean(file && file.type && file.type.startsWith('image/'));
}

export function pointerDistance(first, second) {
  return Math.hypot(second.x - first.x, second.y - first.y);
}

export function createHeldAction({ action, setDelay = setTimeout, clearDelay = clearTimeout, initialDelay = 350, repeatDelay = 90 }) {
  let active = false;
  let timer = null;
  const repeat = () => {
    if (!active) return;
    action();
    timer = setDelay(repeat, repeatDelay);
  };
  return {
    start() {
      if (active) return;
      active = true;
      action();
      timer = setDelay(repeat, initialDelay);
    },
    stop() {
      active = false;
      if (timer) clearDelay(timer);
      timer = null;
    },
  };
}

export function lockIconMarkup(locked) {
  return locked ? '🔒' : '🔓';
}

export function resolveProjectWriter(globalObject) {
  return resolveNativePlugin(globalObject, 'ProjectFile');
}

export function resolveNativePlugin(globalObject, pluginName) {
  const capacitor = globalObject?.Capacitor;
  return capacitor?.Plugins?.[pluginName]
    ?? (capacitor?.isNativePlatform?.() ? capacitor.registerPlugin?.(pluginName) : null)
    ?? null;
}

export function errorMessage(error) {
  return error?.message || String(error || '');
}

if (typeof document !== 'undefined') {
  const byId = (id) => document.getElementById(id);
  const image = byId('image');
  const viewport = byId('viewport');
  const emptyState = byId('empty-state');
  const status = byId('status');
  const i18n = createI18n();
  const statusPresenter = createStatusPresenter(status);
  const fileInput = byId('file-input');
  const languageSelect = byId('language-select');
  const nativeProjectWriter = resolveProjectWriter(window);
  const nativeScreenBrightness = resolveNativePlugin(window, 'ScreenBrightness');
  const controls = ['lock-button', 'grayscale-button', 'sepia-button', 'contrast-down-button', 'contrast-up-button', 'brightness-down-button', 'brightness-up-button', 'original-button'].map(byId);
  const activePointers = new Map();
  let viewportState = createViewportState();
  let transformState = createTransformState();
  let editPanelState = createEditPanelState();
  let objectUrl = null;
  let imageFileName = '';
  let pinch = null;
  let screenBrightnessLevel = 100;

  function hasImage() { return Boolean(objectUrl); }
  function setStatus(message) { statusPresenter.show(message); }
  getScreenBrightness(nativeScreenBrightness).then((level) => { screenBrightnessLevel = level; render(); }).catch(() => {});
  function translatePage() {
    document.documentElement.lang = i18n.language === 'pt' ? 'pt-BR' : i18n.language;
    document.querySelectorAll('[data-i18n]').forEach((element) => { element.textContent = i18n.t(element.dataset.i18n); });
    document.querySelectorAll('[data-i18n-aria-label]').forEach((element) => { element.setAttribute('aria-label', i18n.t(element.dataset.i18nAriaLabel)); });
    document.querySelectorAll('[data-i18n-alt]').forEach((element) => { element.alt = i18n.t(element.dataset.i18nAlt); });
    languageSelect.value = i18n.language;
  }
  function render() {
    image.style.transform = `translate(${viewportState.x}px, ${viewportState.y}px) scale(${viewportState.scale})`;
    image.style.filter = toCssFilter(transformState);
    byId('lock-button').setAttribute('aria-pressed', String(viewportState.locked));
    byId('lock-button').setAttribute('aria-label', i18n.t(viewportState.locked ? 'unlockGestures' : 'lockGestures'));
    byId('lock-button').innerHTML = lockIconMarkup(viewportState.locked);
    byId('grayscale-button').setAttribute('aria-pressed', String(transformState.grayscale));
    byId('sepia-button').setAttribute('aria-pressed', String(transformState.sepia));
    byId('contrast-value').value = i18n.t('contrast', { value: transformState.contrast });
    byId('contrast-value').textContent = i18n.t('contrast', { value: transformState.contrast });
    byId('brightness-value').value = i18n.t('brightness', { value: screenBrightnessLevel });
    byId('brightness-value').textContent = i18n.t('brightness', { value: screenBrightnessLevel });
  }
  function resetAll() {
    ({ viewportState, transformState } = resetImageAdjustments(viewportState, transformState));
    render();
    setStatus(i18n.t('adjustmentsRestored'));
  }
  function setControlsEnabled(enabled) { controls.forEach((control) => { control.disabled = !enabled; }); }
  const readAsDataUrl = (file) => new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = reject; reader.readAsDataURL(file); });
  async function saveProject() {
    if (!canExportImage(image)) { setStatus(i18n.t('imageNotReady')); return; }
    if (!nativeProjectWriter) { setStatus(i18n.t('projectSaveFailed')); return; }
    try {
      const dataUrl = objectUrl.startsWith('data:') ? objectUrl : await readAsDataUrl(fileInput.files[0]);
      const name = `${exportFileName(imageFileName).replace(/-lightbox\.png$/, '')}.lightbox`;
      const project = createProjectFile({ imageDataUrl: dataUrl, imageFileName, viewportState, transformState, referenceViewport: { width: viewport.clientWidth, height: viewport.clientHeight } });
      setStatus(i18n.t('projectChooseDocuments'));
      await writeProjectFile({ nativeWriter: nativeProjectWriter, base64: dataUrlToBase64(`data:application/json;base64,${btoa(unescape(encodeURIComponent(project)))}`), fileName: name });
      setStatus(i18n.t('projectSaved'));
    } catch (error) { setStatus(`${i18n.t('projectSaveFailed')} ${errorMessage(error)}`.trim()); }
  }
  function updatePinch() {
    const points = [...activePointers.values()];
    if (points.length < 2) return;
    const [first, second] = points;
    const distance = pointerDistance(first, second);
    if (!pinch) pinch = { distance, scale: viewportState.scale, x: (first.x + second.x) / 2, y: (first.y + second.y) / 2 };
    viewportState = zoomAt(viewportState, pinch.scale * (distance / pinch.distance), pinch.x, pinch.y);
    render();
  }

  byId('open-button').addEventListener('click', () => fileInput.click());
  languageSelect.addEventListener('change', () => { i18n.setLanguage(languageSelect.value); translatePage(); render(); });
  fileInput.addEventListener('change', () => {
    const [file] = fileInput.files;
    if (!file) return;
    if (!isImageFile(file)) { setStatus(i18n.t('invalidImage')); fileInput.value = ''; return; }
    const nextUrl = URL.createObjectURL(file);
    if (objectUrl) URL.revokeObjectURL(objectUrl);
    objectUrl = nextUrl;
    imageFileName = file.name;
    image.src = objectUrl;
    image.hidden = false;
    emptyState.hidden = true;
    setControlsEnabled(false);
    resetAll();
    setStatus(i18n.t('imageLoaded', { fileName: file.name }));
  });
  image.addEventListener('load', () => { setControlsEnabled(true); });
  image.addEventListener('error', () => { setControlsEnabled(false); setStatus(i18n.t('imageLoadFailed')); });
  byId('lock-button').addEventListener('click', () => { viewportState = setLocked(viewportState, !viewportState.locked); activePointers.clear(); pinch = null; render(); setStatus(i18n.t(viewportState.locked ? 'gesturesLocked' : 'gesturesUnlocked')); });
  byId('grayscale-button').addEventListener('click', () => { transformState = toggleGrayscale(transformState); render(); });
  byId('sepia-button').addEventListener('click', () => { transformState = toggleSepia(transformState); render(); });
  function bindHeldAdjustment(buttonId, delta, adjust) {
    const button = byId(buttonId);
    const held = createHeldAction({ action: () => { transformState = adjust(transformState, delta); render(); } });
    button.addEventListener('pointerdown', (event) => { if (button.disabled) return; event.preventDefault(); button.setPointerCapture(event.pointerId); held.start(); });
    ['pointerup', 'pointercancel', 'lostpointercapture'].forEach((eventName) => button.addEventListener(eventName, () => held.stop()));
    button.addEventListener('click', (event) => { if (event.detail === 0) { transformState = adjust(transformState, delta); render(); } });
  }
  bindHeldAdjustment('contrast-down-button', -10, changeContrast);
  bindHeldAdjustment('contrast-up-button', 10, changeContrast);
  function adjustScreenBrightness(delta) {
    screenBrightnessLevel = Math.max(0, Math.min(100, screenBrightnessLevel + delta));
    setScreenBrightness(nativeScreenBrightness, screenBrightnessLevel).catch(() => {});
    render();
  }
  function bindHeldScreenBrightness(buttonId, delta) {
    const button = byId(buttonId);
    const held = createHeldAction({ action: () => adjustScreenBrightness(delta) });
    button.addEventListener('pointerdown', (event) => { if (button.disabled) return; event.preventDefault(); button.setPointerCapture(event.pointerId); held.start(); });
    ['pointerup', 'pointercancel', 'lostpointercapture'].forEach((eventName) => button.addEventListener(eventName, () => held.stop()));
    button.addEventListener('click', (event) => { if (event.detail === 0) adjustScreenBrightness(delta); });
  }
  bindHeldScreenBrightness('brightness-down-button', -10);
  bindHeldScreenBrightness('brightness-up-button', 10);
  byId('original-button').addEventListener('click', resetAll);
  byId('transform-button').addEventListener('click', () => {
    editPanelState = toggleEditPanel(editPanelState);
    const sheet = document.querySelector('.control-sheet');
    sheet.classList.toggle('is-collapsed', !editPanelState.open);
    byId('transform-button').setAttribute('aria-expanded', String(editPanelState.open));
  });

  viewport.addEventListener('pointerdown', (event) => { if (!hasImage() || viewportState.locked) return; viewport.setPointerCapture(event.pointerId); activePointers.set(event.pointerId, { x: event.clientX, y: event.clientY }); if (activePointers.size === 2) pinch = null; });
  viewport.addEventListener('pointermove', (event) => { if (!activePointers.has(event.pointerId) || viewportState.locked) return; const previous = activePointers.get(event.pointerId); activePointers.set(event.pointerId, { x: event.clientX, y: event.clientY }); if (activePointers.size === 1) { viewportState = pan(viewportState, event.clientX - previous.x, event.clientY - previous.y); render(); } else { updatePinch(); } });
  function finishPointer(event) { activePointers.delete(event.pointerId); pinch = null; }
  viewport.addEventListener('pointerup', finishPointer);
  viewport.addEventListener('pointercancel', finishPointer);
  translatePage();
  render();
}
