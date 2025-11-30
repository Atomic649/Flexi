// Cross-platform patch to adjust pdf-parse module behavior
// Replaces occurrences of `!module.parent` with `false` in node_modules/pdf-parse/index.js
// to ensure correct runtime in bundlers/runtimes where module.parent is not set.

const fs = require('fs');
const path = require('path');

const target = path.join(__dirname, '..', 'node_modules', 'pdf-parse', 'index.js');

try {
  if (!fs.existsSync(target)) {
    console.warn('[postinstall] pdf-parse/index.js not found, skipping patch:', target);
    process.exit(0);
  }
  const src = fs.readFileSync(target, 'utf8');
  const replaced = src.replace(/!module\.parent/g, 'false');
  if (src === replaced) {
    console.log('[postinstall] pdf-parse patch not needed (no occurrences found).');
    process.exit(0);
  }
  fs.writeFileSync(target, replaced, 'utf8');
  console.log('[postinstall] pdf-parse/index.js patched successfully.');
} catch (err) {
  console.error('[postinstall] Failed to patch pdf-parse:', err);
  process.exit(0); // do not fail install due to optional patch
}
