import { createReadStream, existsSync } from 'node:fs';
import { createServer } from 'node:http';
import { dirname, extname, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFile } from 'node:child_process';

const mimeTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
};

export function createWebServer({ rootDirectory }) {
  const root = resolve(rootDirectory);
  return createServer((request, response) => {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    const relativePath = pathname === '/' ? 'index.html' : pathname.replace(/^[/\\]+/, '');
    const filePath = resolve(root, normalize(relativePath));
    if (filePath !== root && !filePath.startsWith(`${root}${sep}`)) {
      response.writeHead(403).end();
      return;
    }
    if (!existsSync(filePath)) {
      response.writeHead(404).end();
      return;
    }
    response.writeHead(200, { 'Content-Type': mimeTypes[extname(filePath)] ?? 'application/octet-stream' });
    createReadStream(filePath).pipe(response);
  });
}

function openBrowser(url) {
  if (process.platform === 'win32') execFile('cmd.exe', ['/c', 'start', '', url], { windowsHide: true });
  else if (process.platform === 'darwin') execFile('open', [url]);
  else execFile('xdg-open', [url]);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const rootDirectory = resolve(dirname(fileURLToPath(import.meta.url)), '..');
  const server = createWebServer({ rootDirectory });
  server.listen(4173, '127.0.0.1', () => {
    const url = 'http://localhost:4173';
    console.log(`LightBox disponível em ${url}`);
    openBrowser(url);
  });
}
