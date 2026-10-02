# LightBox Mobile

[Português](#português) · [English](#english)

## English

**LightBox Mobile** is a mobile-first image viewer for a digital lightbox for artists, designed to make it easier to copy reference 
images for drawing and painting. Its framing, zoom, and filter controls help analyze value relationships and keep the reference clear throughout the painting process.

### Features

- Open local images from the device
- Touch pan and zoom, from 1x to 5x
- Gesture lock
- Grayscale, sepia, and contrast filters
- Reset image adjustments and filters
- PNG export (still in development)
- Responsive and accessible interface

### Tech stack

- HTML, CSS, and JavaScript
- Capacitor for Android
- Service Worker
- Node.js tests

### Run locally

Prerequisites: Node.js LTS and pnpm.

```bash
pnpm install
pnpm dlx serve .
```

Open the displayed address in your browser. Using `localhost` or HTTPS enables Service Worker registration.

### Tests

```bash
pnpm test
```

See [TESTING.md](TESTING.md) for the manual testing checklist.

### Android

```bash
pnpm exec cap sync android
pnpm exec cap open android
```

The Android application identifier is `com.engflavia.lightbox`.

### Project structure

```text
.
├── src/          # Application logic
├── tests/        # Automated tests
├── android/      # Android project
├── www/          # Web files for the Android app
├── index.html    # Main interface
└── TESTING.md    # Manual tests
```

> Visualizador de imagens mobile-first para abrir, ajustar e exportar imagens em PNG.

## Português

O **LightBox Mobile** é um projeto de aplicativo de uma lightbox digital para artistas, criada para facilitar a cópia de imagens de referência para desenho e pintura. 
Seus controles de enquadramento, zoom e filtros ajudam a analisar valores tonais e manter a referência clara durante todo o processo de pintura.

### Recursos

- Abrir imagens locais do dispositivo
- Pan e zoom por toque, entre 1x e 5x
- Bloqueio de gestos
- Filtros de escala de cinza, sépia e contraste
- Redefinição de ajustes e filtros
- Exportação em PNG (ainda em desenvolvimento)
- Interface responsiva e acessível

### Tecnologias

- HTML, CSS e JavaScript
- Capacitor para Android
- Service Worker
- Testes com Node.js

### Executar localmente

Pré-requisitos: Node.js LTS e pnpm.

```bash
pnpm install
pnpm dlx serve .
```

Abra o endereço exibido no navegador. O uso de `localhost` ou HTTPS permite registrar o Service Worker.

### Testes

```bash
pnpm test
```

Consulte [TESTING.md](TESTING.md) para o roteiro de testes manuais.

### Android

```bash
pnpm exec cap sync android
pnpm exec cap open android
```

O identificador Android do aplicativo é `com.engflavia.lightbox`.

### Estrutura

```text
.
├── src/          # Lógica da aplicação
├── tests/        # Testes automatizados
├── android/      # Projeto Android
├── www/          # Arquivos web do app Android
├── index.html    # Interface principal
└── TESTING.md    # Testes manuais
```
