import { createReadStream, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { dirname, extname, isAbsolute, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT_DIR = dirname(fileURLToPath(import.meta.url));
const DIST_DIRS = [resolve(ROOT_DIR, './dist'), resolve(ROOT_DIR, '../dist')];
const PORT = Number(process.env.PORT) || 3000;

const CONTENT_TYPES = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
};

const NOT_FOUND_HEADERS = {
  ...SECURITY_HEADERS,
  'Content-Type': 'text/plain; charset=utf-8',
  'X-Robots-Tag': 'noindex, nofollow',
};

const HIDDEN_PATHS = new Set(['/server.js', '/package.json']);

function isWithinDirectory(directory, filePath) {
  const path = relative(directory, filePath);

  return path === '' || (path !== '..' && !path.startsWith(`..${sep}`) && !isAbsolute(path));
}

function getFile(path) {
  try {
    let filePath = path;
    let stats = statSync(filePath);

    if (stats.isDirectory()) {
      filePath = resolve(filePath, 'index.html');
      stats = statSync(filePath);
    }

    return stats.isFile() ? filePath : null;
  } catch {
    return null;
  }
}

function findFile(pathname) {
  const isDistRequest = pathname === '/dist' || pathname.startsWith('/dist/');
  const requestedPath = isDistRequest ? pathname.slice('/dist'.length) : pathname;
  const directories = isDistRequest ? DIST_DIRS : [ROOT_DIR, ...DIST_DIRS];

  for (const directory of directories) {
    const filePath = resolve(directory, `.${requestedPath}`);
    if (!isWithinDirectory(directory, filePath)) continue;

    const file = getFile(filePath);
    if (file) return file;
  }

  return null;
}

function sendNotFound(res) {
  res.writeHead(404, NOT_FOUND_HEADERS);
  res.end('404 - File Not Found');
}

function handleRequest(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, {
      ...SECURITY_HEADERS,
      Allow: 'GET, HEAD',
    });
    return res.end('Method Not Allowed');
  }

  let pathname;

  try {
    pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  } catch {
    res.writeHead(400, SECURITY_HEADERS);
    return res.end('Bad Request');
  }

  if (HIDDEN_PATHS.has(pathname)) return sendNotFound(res);
  if (pathname === '/') pathname = '/index.html';

  const filePath = findFile(pathname);
  if (!filePath) return sendNotFound(res);

  res.writeHead(200, {
    ...SECURITY_HEADERS,
    'Content-Type': CONTENT_TYPES[extname(filePath).toLowerCase()] || 'application/octet-stream',
  });

  if (req.method === 'HEAD') return res.end();

  const stream = createReadStream(filePath);

  stream.on('error', () => {
    if (res.headersSent) return res.destroy();
    res.writeHead(500, SECURITY_HEADERS);
    res.end('Internal Server Error');
  });

  stream.pipe(res);
}

const server = createServer(handleRequest);

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on http://0.0.0.0:${PORT}`);
  console.log('Root directory:', ROOT_DIR);
  console.log('Distribution directories:', DIST_DIRS);
});

server.on('error', (error) => {
  console.error('Server failed to start:', error);
  process.exitCode = 1;
});
