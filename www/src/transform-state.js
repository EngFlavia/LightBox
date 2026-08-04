export function createTransformState() {
  return { grayscale: false, sepia: false, contrast: 0 };
}

export function toggleGrayscale(state) {
  return { ...state, grayscale: !state.grayscale };
}

export function toggleSepia(state) {
  return { ...state, sepia: !state.sepia };
}

export function changeContrast(state, delta) {
  return {
    ...state,
    contrast: Math.max(-100, Math.min(100, state.contrast + delta)),
  };
}

export function resetTransformState() {
  return createTransformState();
}

export function toCssFilter(state) {
  return `grayscale(${Number(state.grayscale)}) sepia(${Number(state.sepia)}) contrast(${100 + state.contrast}%)`;
}
