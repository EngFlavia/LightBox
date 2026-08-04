import { cp, mkdir, rm } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const projectDirectory = resolve(scriptDirectory, '..');

export async function syncWebFiles(sourceDirectory, webDirectory) {
  await mkdir(webDirectory, { recursive: true });
  await Promise.all([
    cp(resolve(sourceDirectory, 'index.html'), resolve(webDirectory, 'index.html')),
    cp(resolve(sourceDirectory, 'styles.css'), resolve(webDirectory, 'styles.css')),
  ]);
  await rm(resolve(webDirectory, 'src'), { recursive: true, force: true });
  await cp(resolve(sourceDirectory, 'src'), resolve(webDirectory, 'src'), { recursive: true });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await syncWebFiles(projectDirectory, resolve(projectDirectory, 'www'));
}
