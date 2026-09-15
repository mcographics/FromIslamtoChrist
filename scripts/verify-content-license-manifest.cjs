const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const projectRoot = path.resolve(__dirname, '..');
const dataRoot = path.join(projectRoot, 'Data');
const manifestPath = path.join(projectRoot, 'public', 'data', 'content-license-manifest.json');
const releaseMode = process.argv.includes('--release');

function walkDataFiles(directory, relativeRoot = '') {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const relativePath = relativeRoot ? `${relativeRoot}/${entry.name}` : entry.name;
    const fullPath = path.join(directory, entry.name);
    return entry.isDirectory() ? walkDataFiles(fullPath, relativePath) : [relativePath];
  });
}

function main() {
  assert.ok(fs.existsSync(manifestPath), `Missing content license manifest: ${manifestPath}`);

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  assert.equal(manifest.manifestVersion, 1);
  assert.equal(manifest.generatedFrom, 'Data');
  assert.ok(Array.isArray(manifest.assets), 'Manifest assets must be an array.');

  const requiredFields = [
    'asset_id',
    'file_path',
    'content_type',
    'source',
    'copyright_holder',
    'license',
    'redistribution_allowed',
    'commercial_use_allowed',
    'modification_allowed',
    'required_attribution',
    'required_notice',
    'source_version',
    'review_status',
    'reviewed_by',
    'reviewed_at',
  ];
  const manifestPaths = manifest.assets.map((asset) => String(asset.file_path).replace(/^Data\//, '')).sort();
  if (fs.existsSync(dataRoot)) {
    const dataPaths = walkDataFiles(dataRoot).sort();
    assert.deepEqual(manifestPaths, dataPaths, 'Manifest does not account for every file in Data.');
  } else {
    assert.ok(manifestPaths.length > 0, 'Manifest has no assets to audit in this checkout.');
  }

  for (const asset of manifest.assets) {
    for (const field of requiredFields) assert.ok(Object.prototype.hasOwnProperty.call(asset, field), `${asset.asset_id} is missing ${field}`);
    assert.ok(['needs-review', 'source-notice', 'cleared'].includes(asset.review_status), `${asset.asset_id} has an unknown review status.`);
    if (asset.review_status === 'cleared') {
      assert.ok(asset.license && asset.license !== 'UNVERIFIED_LOCAL_SOURCE' && asset.license !== 'UNVERIFIED_SOURCE_NOTICE');
      assert.equal(asset.redistribution_allowed, true);
      assert.ok(asset.reviewed_by);
      assert.ok(asset.reviewed_at);
    }
  }

  const reviewCounts = manifest.assets.reduce((counts, asset) => {
    counts[asset.review_status] = (counts[asset.review_status] || 0) + 1;
    return counts;
  }, {});
  assert.equal(manifest.summary.assetCount, manifest.assets.length);
  assert.equal(manifest.summary.clearedAssetCount, reviewCounts.cleared || 0);
  assert.equal(manifest.releaseReady, (reviewCounts.cleared || 0) === manifest.assets.length);

  const unresolvedCount = manifest.assets.length - (reviewCounts.cleared || 0);
  if (releaseMode && unresolvedCount > 0) {
    throw new Error(`Release gate blocked: ${unresolvedCount} Data assets still need license or attribution review.`);
  }

  console.log(`Content license manifest verified: ${manifest.assets.length} Data assets, ${reviewCounts.cleared || 0} cleared, ${unresolvedCount} pending review${fs.existsSync(dataRoot) ? '' : ' (checked-in manifest; raw Data directory not present)'}.`);
  if (unresolvedCount > 0) console.log('This is an audit pass for the local prototype; use --release to enforce a cleared-content release gate.');
}

try {
  main();
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
