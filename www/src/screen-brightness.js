export async function setScreenBrightness(nativeBrightness, level) {
  const clampedLevel = Math.max(0, Math.min(100, Number(level)));
  if (nativeBrightness?.set) await nativeBrightness.set({ level: clampedLevel });
  return clampedLevel;
}

export async function getScreenBrightness(nativeBrightness) {
  if (!nativeBrightness?.get) return 100;
  const { level } = await nativeBrightness.get();
  return Math.max(0, Math.min(100, Number(level)));
}
