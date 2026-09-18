// Fictional UI demo only. This is NOT the protected personal-snapshot server.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const html = fs.readFileSync(path.join(__dirname, 'public', 'index.html'));
const port = Number(process.env.PORT || 3000);
http.createServer((req, res) => {
  const route = new URL(req.url, 'http://localhost').pathname;
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { Allow: 'GET, HEAD' }); return res.end();
  }
  if (route !== '/' && route !== '/index.html') {
    res.writeHead(404); return res.end('Not found');
  }
  res.writeHead(200, {
    'Content-Type': 'text/html; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'no-referrer'
  });
  res.end(req.method === 'HEAD' ? undefined : html);
}).listen(port, '0.0.0.0', () => console.log(`Hallway fictional demo listening on ${port}`));
