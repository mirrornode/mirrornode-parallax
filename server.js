const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = process.env.MN_ROOT || __dirname;
const HOST = process.env.HOST || '127.0.0.1';
const PORT = Number(process.env.PORT || 4200);

const mime = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp'
};

function safePath(urlPath) {
  const clean = decodeURIComponent(urlPath.split('?')[0] || '/');
  const requested = clean === '/' ? '/index.html' : clean;
  const resolved = path.resolve(ROOT, `.${requested}`);

  if (!resolved.startsWith(path.resolve(ROOT))) {
    return path.join(ROOT, 'index.html');
  }

  if (!fs.existsSync(resolved) || fs.statSync(resolved).isDirectory()) {
    return path.join(ROOT, 'index.html');
  }

  return resolved;
}

const server = http.createServer((req, res) => {
  try {
    const fp = safePath(req.url);
    const ext = path.extname(fp);

    res.setHeader('Content-Type', mime[ext] || 'text/plain; charset=utf-8');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.end(fs.readFileSync(fp));
  } catch (err) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not found');
  }
});

server.on('error', (err) => {
  console.error(`MIRRORNODE server failed: ${err.message}`);
  process.exit(1);
});

server.listen(PORT, HOST, () => {
  console.log(`MIRRORNODE server on http://${HOST}:${PORT}`);
  console.log(`Serving ${ROOT}`);
});
