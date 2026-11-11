const { test } = require('node:test');
const assert = require('node:assert/strict');
const { planRelease } = require('./npm-release.cjs');

const metadata = {
  'dist-tags': { latest: '1.0.6', next: '2.0.0-beta.1' },
  versions: { '1.0.5': {}, '1.0.6': { gitHead: 'previous' }, '2.0.0-beta.1': {} },
};
const plan = (version, extra = {}) => planRelease({ version, metadata, sha: 'new', ...extra });

test('unchanged latest becomes a patch without replacing a published version', () => {
  assert.deepEqual([plan('1.0.6').version, plan('1.0.6').publish], ['1.0.7', true]);
});
for (const version of ['1.0.7', '1.1.0', '2.0.0']) {
  test(`accepts sequential release ${version}`, () => assert.equal(plan(version).version, version));
}
for (const version of ['1.0.8', '1.1.7', '1.2.0', '3.0.0', '0.9.0', '1.0.4']) {
  test(`rejects skipped or older version ${version}`, () => assert.throws(() => plan(version), /skips or reverses/));
}
test('rejects replacement of an older published version', () => assert.throws(() => plan('1.0.5'), /not latest/));
test('requires latest to exist', () => assert.throws(() => plan('1.0.6', { metadata: { versions: {} } }), /latest tag/));
test('rejects a latest tag behind another stable release', () => {
  assert.throws(() => plan('1.0.6', {
    metadata: { ...metadata, versions: { ...metadata.versions, '1.0.7': {} } },
  }), /trails published/);
});
test('rerunning an already published commit is a no-op', () => {
  assert.equal(plan('1.0.6', { sha: 'previous' }).publish, false);
});
for (const version of ['v1.0.7', '01.0.7', '1.0.7-beta.1', '1.0.7+build', '1.0', '']) {
  test(`rejects invalid stable version ${version}`, () => assert.throws(() => plan(version), /Invalid stable version/));
}
test('registry network failures propagate', async () => {
  const { readRegistry } = require('./npm-release.cjs');
  const original = global.fetch;
  try {
    global.fetch = async () => ({ ok: false, status: 503 });
    await assert.rejects(readRegistry('example'), /HTTP 503/);
    global.fetch = async () => { throw new Error('network unavailable'); };
    await assert.rejects(readRegistry('example'), /network unavailable/);
  } finally { global.fetch = original; }
});
