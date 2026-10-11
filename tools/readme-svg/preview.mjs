// Writes preview.html: the README as GitHub shows it (light or dark, following the system),
// with every image inlined, so the animations can be checked before pushing.
// Usage: npm run preview
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Marked } from 'marked';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '../..');
const readme = fs.readFileSync(path.join(ROOT, 'README.md'), 'utf8');
let html = new Marked({ gfm: true }).parse(readme.replace(/<!--[\s\S]*?-->/g, ''));
for (const src of new Set([...readme.matchAll(/src="([^"]+)"/g)].map((m) => m[1]))) {
  if (/^https?:/.test(src)) continue;
  const data = fs.readFileSync(path.join(ROOT, src)).toString('base64');
  html = html.split(`"${src}"`).join(`"data:image/svg+xml;base64,${data}"`);
}
const css = fs.readFileSync(path.join(HERE, 'node_modules/github-markdown-css/github-markdown.css'), 'utf8');
const out = path.join(HERE, 'preview.html');
fs.writeFileSync(
  out,
  `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Profile preview</title>
<style>${css}
:root { color-scheme: light dark; }
body { margin: 0; background: #ffffff; }
@media (prefers-color-scheme: dark) { body { background: #0d1117; } }
.markdown-body { box-sizing: border-box; max-width: 980px; margin: 0 auto; padding: 24px 16px 40px; }
</style></head><body><article class="markdown-body">${html}</article></body></html>
`,
);
console.log(`  wrote ${path.relative(process.cwd(), out)}`);
