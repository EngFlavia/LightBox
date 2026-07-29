export function createViewportState() {
  return { scale: 1, x: 0, y: 0, locked: false };
}

export function pan(state, dx, dy) {
  if (state.locked) return state;

  return { ...state, x: state.x + dx, y: state.y + dy };
}

export function zoomAt(state, nextScale, anchorX, anchorY) {
  if (state.locked) return state;

  const scale = Math.max(1, Math.min(5, nextScale));
  const ratio = scale / state.scale;

  return {
    ...state,
    scale,
    x: anchorX - (anchorX - state.x) * ratio,
    y: anchorY - (anchorY - state.y) * ratio,
  };
}

export function resetViewportState(state) {
  return { scale: 1, x: 0, y: 0, locked: state.locked };
}

export function setLocked(state, locked) {
  return { ...state, locked };
}
