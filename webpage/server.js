import { createReadStream, statSync } from 'node:fs';
import { createServer } from 'node:http';
import {
  dirname as _dirname,
  relative as _relative,
  extname,
  isAbsolute,
  resolve,
  sep,
} from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = _dirname(__filename);

const ROOT_DIR = __dirname;
const DIST_DIR = resolve(__dirname, '../dist');

const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
};

function findFile(filePath) {
  const dirs = filePath.startsWith('/dist') ? [DIST_DIR] : [ROOT_DIR, DIST_DIR];

  for (const dir of dirs) {
    const adjustedPath = filePath.startsWith('/dist') ? filePath.slice('/dist'.length) : filePath;

    const fullPath = resolve(dir, '.' + adjustedPath);
    const relative = _relative(dir, fullPath);

    // Prevent access outside either directory.
    if (relative === '..' || relative.startsWith('..' + sep) || isAbsolute(relative)) {
      continue;
    }

    try {
      if (statSync(fullPath).isFile()) {
        return fullPath;
      }
    } catch {
      // File doesn't exist here; try the next directory.
    }
  }

  return null;
}

const server = createServer((req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { Allow: 'GET, HEAD' });
    return res.end('Method Not Allowed');
  }

  let pathname;

  try {
    pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  } catch {
    res.writeHead(400);
    return res.end('Bad Request');
  }

  if (pathname === '/') pathname = '/index.html';

  const filePath = findFile(pathname);

  if (!filePath) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('404 - File Not Found');
  }

  const contentType = contentTypes[extname(filePath).toLowerCase()] || 'application/octet-stream';

  const stream = createReadStream(filePath);

  res.writeHead(200, {
    'Content-Type': contentType,
    'X-Content-Type-Options': 'nosniff',
  });

  if (req.method === 'HEAD') return res.end();

  stream.on('error', () => {
    if (!res.headersSent) res.writeHead(500);
    res.end('Internal Server Error');
  });

  stream.pipe(res);
});

server.listen(3000, '127.0.0.1', () => {
  console.log('Serving at http://localhost:3000');
  console.log('Search order:', ROOT_DIR, 'then', DIST_DIR);
});
