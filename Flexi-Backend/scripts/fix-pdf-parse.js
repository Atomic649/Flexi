// Cross-platform patch to adjust pdf-parse module behavior
// 1) Replace occurrences of `!module.parent` with `false` in node_modules/pdf-parse/index.js
//    to ensure correct runtime in bundlers/runtimes where module.parent is not set.
// 2) Strip the debug sample block that tries to read ./test/data/05-versions-space.pdf,
//    which breaks inside containers where that test file is absent.

const fs = require('fs');
const path = require('path');

const target = path.join(__dirname, '..', 'node_modules', 'pdf-parse', 'index.js');

try {
  if (!fs.existsSync(target)) {
    console.warn('[postinstall] pdf-parse/index.js not found, skipping patch:', target);
    process.exit(0);
  }
  const src = fs.readFileSync(target, 'utf8');

  // Force module.parent truthiness off and remove debug block
  const withoutModuleParent = src.replace(/!module\.parent/g, 'false');
  const withoutDebugBlock = withoutModuleParent.replace(/\/\/for testing purpose[\s\S]*?}\n\n/, '');

  if (src === withoutDebugBlock) {
    console.log('[postinstall] pdf-parse patch not needed (no changes).');
    process.exit(0);
  }

  fs.writeFileSync(target, withoutDebugBlock, 'utf8');
  console.log('[postinstall] pdf-parse/index.js patched successfully.');
} catch (err) {
  console.error('[postinstall] Failed to patch pdf-parse:', err);
  process.exit(0); // do not fail install due to optional patch
}
