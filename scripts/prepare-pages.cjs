// Keep the GitHub Pages root entry in sync with the canonical static page.
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'dist/index.html'), 'utf8');
const html = source.replace(/(href|src)="(style\.css|content\.js|dates\.js|memories\.js|places\.js|app\.js)"/g, '$1="dist/$2"');
if (process.argv.includes('--check')) {
  if (!fs.existsSync(path.join(root, '.nojekyll')) || fs.readFileSync(path.join(root, 'index.html'), 'utf8') !== html) {
    throw new Error('Run node scripts/prepare-pages.cjs before publishing.');
  }
} else {
  fs.writeFileSync(path.join(root, 'index.html'), html);
  fs.writeFileSync(path.join(root, '.nojekyll'), '');
}
console.log('GitHub Pages entry is ready.');
