# Salvamento em Documentos e Cadeado Amarelo Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Salvar e retomar projetos em `Documentos/LightBox` por meio da permissão persistente do Android, e restaurar os ícones amarelos de cadeado aberto e fechado.

**Architecture:** O plugin Android solicitará ao usuário uma pasta uma única vez pelo Storage Access Framework e persistirá a URI de `Documentos`. Ele gravará/listará arquivos `.lightbox` dentro da subpasta `LightBox`; a camada web usará o plugin já exposto pela ponte Capacitor e exibirá erros retornados pelo Android.

**Tech Stack:** Java Android SDK (Storage Access Framework), Capacitor 8, JavaScript ES modules, `node:test`.

## Global Constraints

- Trabalhar apenas em `C:\Users\flavi\Documents\Projetos\2026\LightBox`; não criar nem alterar arquivos no OneDrive.
- Não criar commit ou merge antes da aprovação final explícita da usuária.
- A primeira gravação pede a seleção de `Documentos`; as seguintes não pedem novamente.

---

### Task 1: Contrato web para gravar numa pasta escolhida

**Files:**
- Modify: `src/file-writer.js`
- Modify: `tests/file-writer.test.js`

**Interfaces:**
- Consumes: `nativeWriter.write({ base64, fileName, mimeType })`.
- Produces: `writeProjectFile({ nativeWriter, base64, fileName })`, que delega ao método nativo e propaga erros.

- [ ] **Step 1: Write the failing test**

```js
test('writes a project without selecting a MediaStore folder', async () => {
  const calls = [];
  await writeProjectFile({ nativeWriter: { write: async (data) => calls.push(data) }, base64: 'e30=', fileName: 'teste.lightbox' });
  assert.deepEqual(calls, [{ base64: 'e30=', fileName: 'teste.lightbox', mimeType: 'application/json' }]);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/file-writer.test.js`
Expected: FAIL because `writeProjectFile` is not exported.

- [ ] **Step 3: Write minimal implementation**

```js
export function writeProjectFile({ nativeWriter, base64, fileName }) {
  return writeFile({ nativeWriter, base64, fileName, mimeType: 'application/json' });
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/file-writer.test.js`
Expected: PASS.

### Task 2: Persistir a pasta Documentos pelo Android

**Files:**
- Modify: `android/app/src/main/java/com/engflavia/lightbox/ProjectFilePlugin.java`

**Interfaces:**
- Consumes: `write(base64, fileName, mimeType)` and `list()` calls from JavaScript.
- Produces: a project file at `Documentos/LightBox/<fileName>` and a `projects` array with `name` and Base64 `content`.

- [ ] **Step 1: Implement folder selection and persistence**

Use `ACTION_OPEN_DOCUMENT_TREE`, `takePersistableUriPermission`, and SharedPreferences. The first `write` call launches the selector; after `handleOnActivityResult`, create `LightBox` below the selected tree and write the pending project.

- [ ] **Step 2: Implement write and list against DocumentFile**

Use `DocumentFile.fromTreeUri`, `findFile`, `createFile`, `ContentResolver.openOutputStream`, and `DocumentFile.listFiles`; remove the `MediaStore.Downloads` implementation.

- [ ] **Step 3: Build the Android app**

Run: `gradlew.bat --no-daemon :app:assembleDebug`
Expected: `BUILD SUCCESSFUL`.

### Task 3: Use the plugin bridge and show exact saving status

**Files:**
- Modify: `src/app.js`
- Modify: `tests/app.test.js`
- Modify: `src/i18n.js`

**Interfaces:**
- Consumes: `window.Capacitor.Plugins.ProjectFile` and its `write` / `list` methods.
- Produces: save status that either confirms a filename or reports the Android error; first use prompts for `Documentos`.

- [ ] **Step 1: Write failing tests**

```js
test('uses the native ProjectFile bridge exposed by Capacitor', () => {
  assert.equal(resolveProjectWriter({ Capacitor: { Plugins: { ProjectFile: { write() {} } } } }).write instanceof Function, true);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/app.test.js`
Expected: FAIL because `resolveProjectWriter` is not exported.

- [ ] **Step 3: Implement minimal bridge resolution and message handling**

Use `Capacitor.Plugins.ProjectFile` first, retain `registerPlugin` as a secondary path, and only display the success message after the plugin resolves. Include the native error message in the failure status.

- [ ] **Step 4: Run tests to verify they pass**

Run: `node --test tests/app.test.js tests/file-writer.test.js`
Expected: PASS.

### Task 4: Restore the yellow lock icons

**Files:**
- Modify: `src/app.js`
- Modify: `styles.css`
- Modify: `tests/app.test.js`

**Interfaces:**
- Consumes: `lockIconMarkup(locked)`.
- Produces: yellow closed-lock emoji when locked and yellow open-lock emoji when unlocked.

- [ ] **Step 1: Write failing test**

```js
assert.equal(lockIconMarkup(true), '🔒');
assert.equal(lockIconMarkup(false), '🔓');
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/app.test.js`
Expected: FAIL because the function returns SVG markup.

- [ ] **Step 3: Implement and verify**

Return the original emoji lock symbols and apply a yellow visual style; re-run the test.

### Task 5: Package and verify

**Files:**
- Modify generated web assets: `www/index.html`, `www/styles.css`, `www/src/*`

- [ ] **Step 1: Sync web assets**

Run: `node scripts/sync-web.mjs && node node_modules/@capacitor/cli/bin/capacitor sync android`

- [ ] **Step 2: Run full tests**

Run: `node --test tests/*.test.js`
Expected: all tests pass.

- [ ] **Step 3: Build the APK**

Run: `gradlew.bat --no-daemon :app:assembleDebug`
Expected: `BUILD SUCCESSFUL`.

- [ ] **Step 4: Copy a uniquely named APK into `release`**

Use the generated version code in the file name and provide the local link for installation.
