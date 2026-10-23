import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('./dist/', import.meta.url));
const mime = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.json':'application/json; charset=utf-8'};
const server = http.createServer(async (req,res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    if (pathname === '/__qa320' || pathname === '/__qa320-no-storage') {
      res.writeHead(200, {'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'});
      res.end('<!doctype html><html><meta name="viewport" content="width=device-width,initial-scale=1"><body style="margin:0;background:#eceaf2"><iframe '+(pathname.endsWith('no-storage')?'sandbox="allow-scripts allow-modals allow-downloads"':'')+' src="/" style="display:block;width:320px;height:900px;margin:auto;border:0" title="320px手机测试"></iframe></body></html>');return;
    }
    const filename = path.resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
    if (filename !== root && !filename.startsWith(root + path.sep) && !filename.startsWith(root.endsWith(path.sep) ? root : root + path.sep)) {
      res.writeHead(403);res.end('Forbidden');return;
    }
    const body = await readFile(filename);
    res.writeHead(200, {'Content-Type':mime[path.extname(filename)] || 'application/octet-stream','Cache-Control':'no-store'});
    res.end(body);
  } catch {res.writeHead(404);res.end('Not found');}
});
server.listen(4173,'127.0.0.1',() => console.log('Local: http://127.0.0.1:4173'));
