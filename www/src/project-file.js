const VERSION = 1;

function number(value) { return typeof value === 'number' && Number.isFinite(value); }

export function createProjectFile(project) {
  return JSON.stringify({ version: VERSION, ...project });
}

export function parseProjectFile(text) {
  try {
    const project = JSON.parse(text);
    const valid = project?.version === VERSION
      && typeof project.imageDataUrl === 'string' && project.imageDataUrl.startsWith('data:image/')
      && typeof project.imageFileName === 'string'
      && number(project.viewportState?.scale) && number(project.viewportState?.x) && number(project.viewportState?.y)
      && typeof project.viewportState?.locked === 'boolean'
      && typeof project.transformState?.grayscale === 'boolean' && typeof project.transformState?.sepia === 'boolean' && number(project.transformState?.contrast)
      && number(project.referenceViewport?.width) && number(project.referenceViewport?.height);
    if (!valid) throw new Error('invalid');
    return project;
  } catch { throw new Error('Projeto LightBox inválido.'); }
}
