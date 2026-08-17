const translations = {
  pt: {
    openImage: 'Carregar Imagem', loadMenu: 'Carregar',
    savePng: 'Salvar PNG',
    saveProject: 'Salvar', openProject: 'Projetos salvos', exportPng: 'Exportar PNG', projectSaved: 'Projeto salvo em Documentos/LightBox.', projectChooseDocuments: 'Na primeira vez, selecione a pasta Documentos.', projectRestored: 'Projeto restaurado.', projectSaveFailed: 'Não foi possível salvar o projeto.', projectLoadFailed: 'Não foi possível abrir o projeto.',
    lockGestures: 'Bloquear gestos',
    unlockGestures: 'Desbloquear gestos',
    unlocked: 'Liberado',
    locked: 'Bloqueado',
    edit: 'Editar',
    original: 'Original',
    grayscale: 'Escala De Cinza',
    sepia: 'Sépia',
    contrast: 'Contraste {value}',
    decreaseContrast: 'Diminuir contraste',
    increaseContrast: 'Aumentar contraste',
    transformImage: 'Transformar imagem',
    appLabel: 'Visualizador de imagens',
    imageArea: 'Área da imagem',
    imageAlt: 'Imagem selecionada',
    emptyState: 'Carregue uma imagem para começar',
    language: 'Idioma',
    noImage: 'Nenhuma imagem carregada.',
    imageNotReady: 'A imagem ainda não está pronta para salvar.',
    imageSaveFailed: 'Não foi possível salvar a imagem.',
    imageSaved: 'Imagem salva em PNG.',
    invalidImage: 'Selecione um arquivo de imagem válido.',
    imageLoaded: '{fileName} carregada.',
    imageLoadFailed: 'Não foi possível carregar a imagem.',
    adjustmentsRestored: 'Ajustes restaurados.',
    gesturesLocked: 'Gestos bloqueados.',
    gesturesUnlocked: 'Gestos liberados.',
  },
  es: {
    openImage: 'Cargar Imagen', loadMenu: 'Cargar',
    savePng: 'Guardar PNG',
    saveProject: 'Guardar', openProject: 'Proyectos guardados', exportPng: 'Exportar PNG', projectSaved: 'Proyecto guardado en Documentos/LightBox.', projectRestored: 'Proyecto restaurado.', projectSaveFailed: 'No se pudo guardar el proyecto.', projectLoadFailed: 'No se pudo abrir el proyecto.',
    lockGestures: 'Bloquear gestos',
    unlockGestures: 'Desbloquear gestos',
    unlocked: 'Desbloqueado',
    locked: 'Bloqueado',
    edit: 'Editar',
    original: 'Original',
    grayscale: 'Escala De Grises',
    sepia: 'Sepia',
    contrast: 'Contraste {value}',
    decreaseContrast: 'Disminuir contraste',
    increaseContrast: 'Aumentar contraste',
    transformImage: 'Transformar imagen',
    appLabel: 'Visor de imágenes',
    imageArea: 'Área de la imagen',
    imageAlt: 'Imagen seleccionada',
    emptyState: 'Cargue una imagen para empezar',
    language: 'Idioma',
    noImage: 'Ninguna imagen cargada.',
    imageNotReady: 'La imagen aún no está lista para guardar.',
    imageSaveFailed: 'No se pudo guardar la imagen.',
    imageSaved: 'Imagen guardada en PNG.',
    invalidImage: 'Seleccione un archivo de imagen válido.',
    imageLoaded: '{fileName} cargada.',
    imageLoadFailed: 'No se pudo cargar la imagen.',
    adjustmentsRestored: 'Ajustes restaurados.',
    gesturesLocked: 'Gestos bloqueados.',
    gesturesUnlocked: 'Gestos desbloqueados.',
  },
  en: {
    openImage: 'Load Image', loadMenu: 'Load',
    savePng: 'Save PNG',
    saveProject: 'Save', openProject: 'Saved projects', exportPng: 'Export PNG', projectSaved: 'Project saved in Documents/LightBox.', projectRestored: 'Project restored.', projectSaveFailed: 'Could not save the project.', projectLoadFailed: 'Could not open the project.',
    lockGestures: 'Lock gestures',
    unlockGestures: 'Unlock gestures',
    unlocked: 'Unlocked',
    locked: 'Locked',
    edit: 'Edit',
    original: 'Original',
    grayscale: 'Grayscale',
    sepia: 'Sepia',
    contrast: 'Contrast {value}',
    decreaseContrast: 'Decrease contrast',
    increaseContrast: 'Increase contrast',
    transformImage: 'Transform image',
    appLabel: 'Image viewer',
    imageArea: 'Image area',
    imageAlt: 'Selected image',
    emptyState: 'Load an image to get started',
    language: 'Language',
    noImage: 'No image loaded.',
    imageNotReady: 'The image is not ready to save yet.',
    imageSaveFailed: 'Could not save the image.',
    imageSaved: 'Image saved as PNG.',
    invalidImage: 'Select a valid image file.',
    imageLoaded: '{fileName} loaded.',
    imageLoadFailed: 'Could not load the image.',
    adjustmentsRestored: 'Adjustments restored.',
    gesturesLocked: 'Gestures locked.',
    gesturesUnlocked: 'Gestures unlocked.',
  },
};

const languageStorageKey = 'lightbox-language';

function isSupportedLanguage(language) {
  return Object.hasOwn(translations, language);
}

function interpolate(template, values) {
  return template.replace(/\{(\w+)\}/g, (_, key) => values[key] ?? '');
}

export function createI18n({ storage = globalThis.localStorage, storageKey = languageStorageKey } = {}) {
  let language = 'pt';

  try {
    const storedLanguage = storage?.getItem(storageKey);
    if (isSupportedLanguage(storedLanguage)) language = storedLanguage;
  } catch {
    // Language selection remains available when browser storage is unavailable.
  }

  return {
    get language() { return language; },
    setLanguage(nextLanguage) {
      if (!isSupportedLanguage(nextLanguage)) return language;
      language = nextLanguage;
      try {
        storage?.setItem(storageKey, language);
      } catch {
        // Keep the current session language when persistence is unavailable.
      }
      return language;
    },
    t(key, values = {}) {
      return interpolate(translations[language][key] ?? translations.pt[key] ?? key, values);
    },
  };
}
