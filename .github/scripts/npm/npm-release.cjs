const fs = require('node:fs');
const { execFileSync } = require('node:child_process');

function parseVersion(version) {
  if (!/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.test(version)) {
    throw new Error(`Invalid stable version: ${version}. Use major.minor.patch without a prerelease suffix.`);
  }
  const parts = version.split('.').map(Number);
  if (!parts.every(Number.isSafeInteger)) throw new Error(`Version is too large: ${version}.`);
  return parts;
}

function planRelease({ version, metadata, sha }) {
  parseVersion(version);
  const latest = metadata['dist-tags']?.latest;
  if (!latest || !metadata.versions?.[latest]) {
    throw new Error('npm has no valid latest tag. Restore the latest tag before releasing this existing package.');
  }
  const [major, minor, patch] = parseVersion(latest);
  const versions = metadata.versions;
  for (const published of Object.keys(versions)) {
    if (!/^\d+\.\d+\.\d+$/.test(published)) continue;
    const parts = parseVersion(published);
    const newer = parts[0] > major || (parts[0] === major &&
      (parts[1] > minor || (parts[1] === minor && parts[2] > patch)));
    if (newer) throw new Error(`npm latest (${latest}) trails published version ${published}. Repair the latest tag first.`);
  }
  if (sha && versions[latest].gitHead === sha) {
    return { publish: false, latest, version: latest, reason: `Commit ${sha} is already published as ${latest}.` };
  }
  const allowed = [`${major}.${minor}.${patch + 1}`, `${major}.${minor + 1}.0`, `${major + 1}.0.0`];
  let target = version;
  if (version === latest) target = allowed[0];
  else if (versions[version]) {
    throw new Error(`Version ${version} is already published and is not latest (${latest}). Update package.json to ${latest} or one of: ${allowed.join(', ')}.`);
  } else if (!allowed.includes(version)) {
    throw new Error(`Version ${version} skips or reverses a release from ${latest}. Choose ${allowed.join(', ')}. npm versions cannot be overwritten.`);
  }
  if (versions[target]) throw new Error(`Target ${target} already exists. npm versions cannot be overwritten.`);
  return {
    publish: true, latest, version: target,
    reason: version === latest
      ? `npm cannot replace ${latest}; stage patch ${target}. Approval will publish it with the latest tag.`
      : `Stage sequential release ${target} after ${latest}. Publication requires maintainer approval.`,
  };
}

async function readRegistry(name) {
  let response;
  try {
    response = await fetch(`https://registry.npmjs.org/${encodeURIComponent(name)}`, {
      signal: AbortSignal.timeout(30000), headers: { accept: 'application/json', 'cache-control': 'no-cache' },
    });
  } catch (error) {
    throw new Error(`Cannot read npm registry: ${error.message}. Check network access and npm status, then retry. No release was attempted.`);
  }
  if (!response.ok) throw new Error(`npm registry returned HTTP ${response.status}. Check the package name, registry availability, and package access. No release was attempted.`);
  return response.json();
}

async function main() {
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const metadata = await readRegistry(pkg.name);
  if (process.argv[2] === 'verify') {
    const latest = process.env.EXPECTED_LATEST;
    if (metadata['dist-tags']?.latest !== latest || metadata.versions?.[pkg.version]) {
      throw new Error(`Registry changed after planning. Expected latest ${latest} and unused target ${pkg.version}. Re-run against the current registry before staging.`);
    }
    console.log(`Registry still permits ${pkg.name}@${pkg.version}.`);
    return;
  }
  const plan = planRelease({ version: pkg.version, metadata, sha: process.env.GITHUB_SHA });
  // Git tags are an additional collision check; npm dist-tags determine latest.
  const tags = execFileSync('git', ['tag', '--list'], { encoding: 'utf8' }).trim().split(/\r?\n/);
  if (plan.publish && (tags.includes(`v${plan.version}`) || tags.includes(plan.version))) {
    throw new Error(`Git tag for ${plan.version} already exists, but npm has no matching release. Resolve this incomplete release before continuing.`);
  }
  console.log(plan.reason);
  if (process.env.GITHUB_OUTPUT) {
    fs.appendFileSync(process.env.GITHUB_OUTPUT,
      `publish=${plan.publish}\nversion=${plan.version}\nlatest=${plan.latest}\n`);
  }
  if (process.env.GITHUB_STEP_SUMMARY) {
    fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, `### npm release decision\n\n${plan.reason}\n\nSource version: ${pkg.version}. Registry latest: ${plan.latest}.\n`);
  }
}

module.exports = { planRelease, readRegistry };
if (require.main === module) main().catch(error => {
  const message = `Release stopped: ${error.message}`;
  console.error(message);
  if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, `\n${message}\n`);
  process.exitCode = 1;
});
