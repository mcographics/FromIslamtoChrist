const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const initSqlJs = require('sql.js');

const projectRoot = path.resolve(__dirname, '..');
const databasePath = path.join(projectRoot, 'public', 'data', 'from-darkness-to-light.db');
const appSource = fs.readFileSync(path.join(projectRoot, 'src', 'App.jsx'), 'utf8');

function rowsFromResult(result) {
  if (!result?.[0]) return [];
  const [{ columns, values }] = result;
  return values.map((value) => Object.fromEntries(columns.map((column, index) => [column, value[index]])));
}

async function loadModule(relativePath) {
  const moduleUrl = pathToFileURL(path.join(projectRoot, relativePath)).href;
  return import(moduleUrl);
}

async function main() {
  assert.ok(fs.existsSync(databasePath), `Missing content database: ${databasePath}`);
  const [{ default: researchCapsules }, { default: factsInfoReadingPaths }] = await Promise.all([
    loadModule('src/data/facts-info-capsules.js'),
    loadModule('src/data/facts-info-reading-paths.js'),
  ]);
  const SQL = await initSqlJs({ locateFile: (fileName) => path.join(path.dirname(require.resolve('sql.js')), fileName) });
  const database = new SQL.Database(new Uint8Array(fs.readFileSync(databasePath)));
  const factsAssets = rowsFromResult(database.exec(`
    SELECT path, name
    FROM source_assets
    WHERE group_name = 'Facts & Info'
    ORDER BY path
  `));
  const sourceGroups = new Map(rowsFromResult(database.exec('SELECT name, file_count AS fileCount FROM source_groups')).map((row) => [row.name, row]));
  const runtimeCounts = Object.fromEntries(rowsFromResult(database.exec(`
    SELECT 'strongs' AS name, COUNT(*) AS count FROM lexicon_entries
    UNION ALL SELECT 'vines', COUNT(*) FROM vines_entries
    UNION ALL SELECT 'bhsa', COUNT(*) FROM original_language_alignments WHERE corpus = 'BHSA'
    UNION ALL SELECT 'n1904', COUNT(*) FROM original_language_alignments WHERE corpus = 'N1904'
  `)).map((row) => [row.name, Number(row.count || 0)]));

  assert.equal(factsAssets.length, researchCapsules.length, 'Every Facts & Info source asset must have one educational capsule.');
  const capsulePaths = new Set(researchCapsules.map((capsule) => capsule.sourcePath));
  const missingCapsules = factsAssets.filter((asset) => !capsulePaths.has(asset.path));
  assert.equal(missingCapsules.length, 0, `Facts & Info assets missing educational capsules: ${missingCapsules.map((asset) => asset.path).join(', ')}`);

  const capsuleIds = new Set(researchCapsules.map((capsule) => capsule.id));
  const usedCapsuleIds = new Set(factsInfoReadingPaths.flatMap((readingPath) => readingPath.sourceIds || []));
  assert.deepEqual([...usedCapsuleIds].sort(), [...capsuleIds].sort(), 'Every educational capsule must be used by at least one Facts & Info reading path.');

  ['Facts & Info', 'strongs', 'vines', 'bhsa', 'n1904'].forEach((groupName) => {
    assert.ok(sourceGroups.get(groupName)?.fileCount > 0, `The ${groupName} Data group is not indexed.`);
  });
  ['strongs', 'vines', 'bhsa', 'n1904'].forEach((collection) => {
    assert.ok(runtimeCounts[collection] > 0, `The ${collection} Data group has no runtime study rows.`);
  });
  assert.match(appSource, /const additionalCollections = sourceGroups[\s\S]*?\.filter/, 'The Source Library must create a collection for indexed groups outside the named research collections.');
  assert.match(appSource, /const collectionCards = \[\.\.\.researchCollections, \.\.\.additionalCollections\]/, 'The Source Library must render both named and additional source-group collections.');

  database.close();
  console.log(`Source coverage verified: ${factsAssets.length} Facts & Info documents mapped to ${researchCapsules.length} capsules and ${factsInfoReadingPaths.length} reading paths; Strong's ${runtimeCounts.strongs}, Vine's ${runtimeCounts.vines}, BHSA ${runtimeCounts.bhsa}, N1904 ${runtimeCounts.n1904} runtime rows; all indexed source groups have a Source Library route.`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
