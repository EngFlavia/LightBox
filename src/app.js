import { changeContrast, createTransformState, resetTransformState, toCssFilter, toggleGrayscale, toggleSepia } from './transform-state.js';
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

export function lockIconMarkup(locked) {
  return locked ? '🔒' : '🔓';
}

export function resolveProjectWriter(globalObject) {
  const capacitor = globalObject?.Capacitor;
  return capacitor?.Plugins?.ProjectFile
    ?? (capacitor?.isNativePlatform?.() ? capacitor.registerPlugin?.('ProjectFile') : null)
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
  const controls = ['save-button', 'lock-button', 'grayscale-button', 'sepia-button', 'contrast-down-button', 'contrast-up-button', 'original-button'].map(byId);
  const activePointers = new Map();
  let viewportState = createViewportState();
  let transformState = createTransformState();
  let editPanelState = createEditPanelState();
  let objectUrl = null;
  let imageFileName = '';
  let pinch = null;

  function hasImage() { return Boolean(objectUrl); }
  function setStatus(message) { statusPresenter.show(message); }
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

  const loadActions = byId('load-actions');
  const savedProjects = byId('saved-projects');
  function closeLoadMenu() { loadActions.hidden = true; savedProjects.hidden = true; byId('open-button').setAttribute('aria-expanded', 'false'); }
  byId('open-button').addEventListener('click', () => { loadActions.hidden = !loadActions.hidden; byId('open-button').setAttribute('aria-expanded', String(!loadActions.hidden)); });
  byId('open-image-button').addEventListener('click', () => { closeLoadMenu(); fileInput.click(); });
  async function restoreProject(text) {
    const project = parseProjectFile(text);
    imageFileName = project.imageFileName; objectUrl = project.imageDataUrl; image.src = objectUrl;
    viewportState = project.viewportState; transformState = project.transformState;
    image.hidden = false; emptyState.hidden = true; render(); setStatus(i18n.t('projectRestored'));
  }
  byId('open-project-button').addEventListener('click', async () => {
    if (!nativeProjectWriter) { closeLoadMenu(); byId('project-input').click(); return; }
    try {
      const { projects = [] } = await nativeProjectWriter.list();
      if (!projects.length) { closeLoadMenu(); setStatus('Nenhum projeto salvo encontrado.'); return; }
      savedProjects.replaceChildren(...projects.map(({ name, content }) => {
        const button = document.createElement('button'); button.type = 'button'; button.textContent = name;
        button.addEventListener('click', () => { closeLoadMenu(); restoreProject(new TextDecoder().decode(Uint8Array.from(atob(content), (char) => char.charCodeAt(0)))).catch(() => setStatus(i18n.t('projectLoadFailed'))); });
        return button;
      }));
      loadActions.hidden = true; savedProjects.hidden = false;
    } catch { closeLoadMenu(); setStatus(i18n.t('projectLoadFailed')); }
  });
  document.addEventListener('pointerdown', (event) => { if (!loadActions.hidden && !event.target.closest('.load-menu')) closeLoadMenu(); });
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
  byId('project-input').addEventListener('change', async () => { try { await restoreProject(await byId('project-input').files[0].text()); } catch { setStatus(i18n.t('projectLoadFailed')); } });
  byId('save-button').addEventListener('click', () => { closeLoadMenu(); saveProject(); });
  byId('lock-button').addEventListener('click', () => { viewportState = setLocked(viewportState, !viewportState.locked); activePointers.clear(); pinch = null; render(); setStatus(i18n.t(viewportState.locked ? 'gesturesLocked' : 'gesturesUnlocked')); });
  byId('grayscale-button').addEventListener('click', () => { transformState = toggleGrayscale(transformState); render(); });
  byId('sepia-button').addEventListener('click', () => { transformState = toggleSepia(transformState); render(); });
  byId('contrast-down-button').addEventListener('click', () => { transformState = changeContrast(transformState, -10); render(); });
  byId('contrast-up-button').addEventListener('click', () => { transformState = changeContrast(transformState, 10); render(); });
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
