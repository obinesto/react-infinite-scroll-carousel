const assert = require('node:assert/strict');
const fs = require('node:fs');
const { execFileSync } = require('node:child_process');
const pkg = require('../package.json');

async function main() {
  const packed = JSON.parse(execFileSync(process.execPath,
    [process.env.npm_execpath, 'pack', '--dry-run', '--json', '--ignore-scripts'], { encoding: 'utf8' }))[0];
  const files = new Set(packed.files.map(file => file.path));
  for (const file of [pkg.main, pkg.module, pkg.types, 'dist/index.css']) {
    assert.ok(files.has(file), `Package is missing ${file}`);
  }
  const declarations = fs.readFileSync(pkg.types, 'utf8');
  assert.match(declarations, /Carousel/);
  assert.equal(typeof require(pkg.name).Carousel, 'function');
  assert.equal(typeof (await import(pkg.name)).Carousel, 'function');
  console.log('Package includes JavaScript, declarations, and CSS. CommonJS and ESM imports pass.');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
