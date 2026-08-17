export async function writeFile({ nativeWriter, base64, fileName, mimeType, folder }) {
  if (!nativeWriter?.write) throw new Error('Gravação nativa indisponível.');
  return nativeWriter.write({ base64, fileName, mimeType, ...(folder ? { folder } : {}) });
}

export function writeProjectFile({ nativeWriter, base64, fileName }) {
  return writeFile({ nativeWriter, base64, fileName, mimeType: 'application/json' });
}

export function dataUrlToBase64(dataUrl) {
  return String(dataUrl).slice(String(dataUrl).indexOf(',') + 1);
}
