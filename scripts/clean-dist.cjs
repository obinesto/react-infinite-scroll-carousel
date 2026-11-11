const fs = require('node:fs');
const path = require('node:path');

const project = path.resolve(__dirname, '..');
const output = path.resolve(project, 'dist');
if (path.dirname(output) !== project || path.basename(output) !== 'dist') {
  throw new Error('Build output must be the dist directory inside this project.');
}
fs.rmSync(output, { recursive: true, force: true });
