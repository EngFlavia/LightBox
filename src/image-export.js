import { toCssFilter } from './transform-state.js';

export function exportFileName(name) {
  const trimmedName = String(name || '').trim();
  const extensionIndex = trimmedName.lastIndexOf('.');
  const baseName = extensionIndex > 0
    ? trimmedName.slice(0, extensionIndex)
    : extensionIndex === 0
      ? ''
      : trimmedName;

  return `${baseName || 'image'}-lightbox.png`;
}

export function canExportImage(image) {
  return Boolean(
    image
    && image.complete
    && image.naturalWidth > 0
    && image.naturalHeight > 0
    && image.clientWidth > 0
    && image.clientHeight > 0,
  );
}

export function createComposition({
  viewportWidth,
  viewportHeight,
  imageWidth,
  imageHeight,
  x,
  y,
}) {
  return {
    width: viewportWidth,
    height: viewportHeight,
    originX: (viewportWidth - imageWidth) / 2 + x,
    originY: (viewportHeight - imageHeight) / 2 + y,
  };
}

export function renderComposition({
  canvas,
  image,
  viewportWidth,
  viewportHeight,
  imageWidth,
  imageHeight,
  viewportState,
  transformState,
  pixelRatio,
}) {
  const composition = createComposition({
    viewportWidth,
    viewportHeight,
    imageWidth,
    imageHeight,
    x: viewportState.x,
    y: viewportState.y,
  });
  const context = canvas.getContext('2d');

  canvas.width = composition.width * pixelRatio;
  canvas.height = composition.height * pixelRatio;
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.save();
  context.filter = toCssFilter(transformState);
  context.setTransform(
    pixelRatio * viewportState.scale,
    0,
    0,
    pixelRatio * viewportState.scale,
    composition.originX * pixelRatio,
    composition.originY * pixelRatio,
  );
  context.drawImage(image, 0, 0, imageWidth, imageHeight);
  context.restore();

  return canvas;
}
