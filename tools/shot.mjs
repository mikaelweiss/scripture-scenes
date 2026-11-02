// Usage: node tools/shot.mjs <style-folder>[?scene=<id>] <out.png> [waitMs] [keys]
// keys: comma list of "Key:ms" holds, e.g. "KeyW:1500,KeyD:400", pressed before the shot.
import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, resolve } from 'node:path';

const [style, out, waitMs = '2500', keys = ''] = process.argv.slice(2);
const root = resolve(new URL('..', import.meta.url).pathname);
const types = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml' };

const server = createServer(async (req, res) => {
  const path = join(root, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  try {
    const file = path.endsWith('/') ? join(path, 'index.html') : path;
    res.writeHead(200, { 'content-type': types[extname(file)] ?? 'application/octet-stream' });
    res.end(await readFile(file));
  } catch {
    res.writeHead(404).end();
  }
}).listen(0);

const browser = await chromium.launch({ args: ['--use-gl=angle', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
page.on('console', (m) => m.type() === 'error' && console.log('console error:', m.text()));
page.on('pageerror', (e) => console.log('page error:', e.message));
const [folder, query = ''] = style.split('?');
await page.goto(`http://localhost:${server.address().port}/styles/${folder}/${query ? `?${query}` : ''}`);
await page.waitForTimeout(Number(waitMs));
await page.mouse.click(640, 360);
for (const k of keys.split(',').filter(Boolean)) {
  const [key, ms] = k.split(':');
  await page.keyboard.down(key);
  await page.waitForTimeout(Number(ms));
  await page.keyboard.up(key);
}
await page.waitForTimeout(500);
await page.screenshot({ path: out });
await browser.close();
server.close();
console.log('saved', out);
