// Jest global setup polyfills and runtime patches
// Normalize mime API across versions: provide getType and charset lookup
try {
  const mimeMod = require('mime');
  if (mimeMod) {
    if (typeof mimeMod.getType !== 'function' && typeof mimeMod.lookup === 'function') {
      mimeMod.getType = mimeMod.lookup.bind(mimeMod);
    }
    if (!mimeMod.charsets || typeof mimeMod.charsets.lookup !== 'function') {
      mimeMod.charsets = { lookup: () => 'UTF-8' };
    }
  }
  const send = require('send');
  if (send && send.mime) {
    if (!send.mime.charsets || typeof send.mime.charsets.lookup !== 'function') {
      send.mime.charsets = { lookup: () => 'UTF-8' };
    }
    if (typeof send.mime.getType !== 'function' && typeof send.mime.lookup === 'function') {
      send.mime.getType = send.mime.lookup.bind(send.mime);
    }
  }
} catch (e) {
  // ignore; tests may not depend on mime
}

// Ensure process.env NODE_ENV defaults for tests
process.env.NODE_ENV = process.env.NODE_ENV || 'test';