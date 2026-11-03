/**
 * Minimal static server for the built interface.
 * One command, zero dependencies: `npm start` works on Render, Railway, Fly or any Node host.
 * Serves ./dist, honours PORT and binds 0.0.0.0 so the platform can reach it.
 */
import { createServer } from 'node:http';
import { existsSync, statSync, readFileSync } from 'node:fs';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)), 'dist');
const port = Number(process.env.PORT) || 3000;
const types = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.map': 'application/json; charset=utf-8', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.ico': 'image/x-icon',
  '.woff2': 'font/woff2', '.txt': 'text/plain; charset=utf-8',
};

const server = createServer((request, response) => {
  let pathname = '/';
  try {
    pathname = decodeURIComponent(new URL(request.url || '/', 'http://localhost').pathname);
  } catch {
    response.writeHead(400).end('Bad request');
    return;
  }
  let file = join(root, normalize(pathname));
  // A request must never escape the build folder.
  if (file !== root && !file.startsWith(root + sep)) {
    response.writeHead(403).end('Forbidden');
    return;
  }
  if (existsSync(file) && statSync(file).isDirectory()) file = join(file, 'index.html');
  if (!existsSync(file)) file = join(root, 'index.html');  // Single page app fallback
  const body = readFileSync(file);
  const hashed = file.includes(sep + 'assets' + sep);
  response.writeHead(200, {
    'Content-Type': types[extname(file).toLowerCase()] || 'application/octet-stream',
    'Cache-Control': hashed ? 'public, max-age=31536000, immutable' : 'no-cache',
    'X-Content-Type-Options': 'nosniff',
  });
  response.end(body);
});

server.listen(port, '0.0.0.0', () => {
  console.log('Price Hunter interface: http://0.0.0.0:' + port + ' (root ' + root + ')');
});
