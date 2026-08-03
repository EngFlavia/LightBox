import { changeContrast, createTransformState, resetTransformState, toCssFilter, toggleGrayscale, toggleSepia } from './transform-state.js';
import { canExportImage, exportFileName, renderComposition } from './image-export.js';
import { createStatusPresenter } from './status-presenter.js';
import { createViewportState, pan, resetViewportState, setLocked, zoomAt } from './viewport-state.js';

export function isImageFile(file) {
  return Boolean(file && file.type && file.type.startsWith('image/'));
}

export function pointerDistance(first, second) {
  return Math.hypot(second.x - first.x, second.y - first.y);
}

if (typeof document !== 'undefined') {
  const byId = (id) => document.getElementById(id);
  const image = byId('image');
  const viewport = byId('viewport');
  const emptyState = byId('empty-state');
  const status = byId('status');
  const statusPresenter = createStatusPresenter(status);
  const fileInput = byId('file-input');
  const controls = ['save-button', 'reset-button', 'lock-button', 'grayscale-button', 'sepia-button', 'contrast-down-button', 'contrast-up-button', 'original-button'].map(byId);
  const activePointers = new Map();
  let viewportState = createViewportState();
  let transformState = createTransformState();
  let objectUrl = null;
  let imageFileName = '';
  let pinch = null;

  function hasImage() { return Boolean(objectUrl); }
  function setStatus(message) { statusPresenter.show(message); }
  function render() {
    image.style.transform = `translate(${viewportState.x}px, ${viewportState.y}px) scale(${viewportState.scale})`;
    image.style.filter = toCssFilter(transformState);
    byId('lock-button').setAttribute('aria-pressed', String(viewportState.locked));
    byId('lock-button').setAttribute('aria-label', viewportState.locked ? 'Desbloquear gestos' : 'Bloquear gestos');
    byId('lock-button').innerHTML = viewportState.locked ? '🔒 <span>Bloqueado</span>' : '🔓 <span>Desbloqueado</span>';
    byId('grayscale-button').setAttribute('aria-pressed', String(transformState.grayscale));
    byId('sepia-button').setAttribute('aria-pressed', String(transformState.sepia));
    byId('contrast-value').value = `Contraste ${transformState.contrast}`;
    byId('contrast-value').textContent = `Contraste ${transformState.contrast}`;
  }
  function resetAll() { viewportState = resetViewportState(viewportState); transformState = resetTransformState(); render(); setStatus('Ajustes restaurados.'); }
  function setControlsEnabled(enabled) { controls.forEach((control) => { control.disabled = !enabled; }); }
  function saveImage() {
    if (!canExportImage(image)) { setStatus('A imagem ainda não está pronta para salvar.'); return; }
    const canvas = document.createElement('canvas');
    renderComposition({ canvas, image, viewportWidth: viewport.clientWidth, viewportHeight: viewport.clientHeight, imageWidth: image.clientWidth, imageHeight: image.clientHeight, viewportState, transformState, pixelRatio: window.devicePixelRatio || 1 });
    canvas.toBlob((blob) => {
      if (!blob) { setStatus('Não foi possível salvar a imagem.'); return; }
      const downloadUrl = URL.createObjectURL(blob);
      const download = document.createElement('a');
      download.href = downloadUrl;
      download.download = exportFileName(imageFileName);
      download.click();
      URL.revokeObjectURL(downloadUrl);
      setStatus('Imagem salva em PNG.');
    }, 'image/png');
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
  fileInput.addEventListener('change', () => {
    const [file] = fileInput.files;
    if (!file) return;
    if (!isImageFile(file)) { setStatus('Selecione um arquivo de imagem válido.'); fileInput.value = ''; return; }
    const nextUrl = URL.createObjectURL(file);
    if (objectUrl) URL.revokeObjectURL(objectUrl);
    objectUrl = nextUrl;
    imageFileName = file.name;
    image.src = objectUrl;
    image.hidden = false;
    emptyState.hidden = true;
    setControlsEnabled(false);
    resetAll();
    setStatus(`${file.name} carregada.`);
  });
  image.addEventListener('load', () => { setControlsEnabled(true); });
  image.addEventListener('error', () => { setControlsEnabled(false); setStatus('Não foi possível carregar a imagem.'); });
  byId('save-button').addEventListener('click', saveImage);
  byId('reset-button').addEventListener('click', resetAll);
  byId('lock-button').addEventListener('click', () => { viewportState = setLocked(viewportState, !viewportState.locked); activePointers.clear(); pinch = null; render(); setStatus(viewportState.locked ? 'Gestos bloqueados.' : 'Gestos liberados.'); });
  byId('grayscale-button').addEventListener('click', () => { transformState = toggleGrayscale(transformState); render(); });
  byId('sepia-button').addEventListener('click', () => { transformState = toggleSepia(transformState); render(); });
  byId('contrast-down-button').addEventListener('click', () => { transformState = changeContrast(transformState, -10); render(); });
  byId('contrast-up-button').addEventListener('click', () => { transformState = changeContrast(transformState, 10); render(); });
  byId('original-button').addEventListener('click', () => { transformState = resetTransformState(); render(); setStatus('Transformações restauradas.'); });
  byId('transform-button').addEventListener('click', () => { const sheet = document.querySelector('.control-sheet'); const collapsed = sheet.classList.toggle('is-collapsed'); byId('transform-button').setAttribute('aria-expanded', String(!collapsed)); });

  viewport.addEventListener('pointerdown', (event) => { if (!hasImage() || viewportState.locked) return; viewport.setPointerCapture(event.pointerId); activePointers.set(event.pointerId, { x: event.clientX, y: event.clientY }); if (activePointers.size === 2) pinch = null; });
  viewport.addEventListener('pointermove', (event) => { if (!activePointers.has(event.pointerId) || viewportState.locked) return; const previous = activePointers.get(event.pointerId); activePointers.set(event.pointerId, { x: event.clientX, y: event.clientY }); if (activePointers.size === 1) { viewportState = pan(viewportState, event.clientX - previous.x, event.clientY - previous.y); render(); } else { updatePinch(); } });
  function finishPointer(event) { activePointers.delete(event.pointerId); pinch = null; }
  viewport.addEventListener('pointerup', finishPointer);
  viewport.addEventListener('pointercancel', finishPointer);
  render();
  setStatus('Nenhuma imagem carregada.');
}

if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js'));
}
