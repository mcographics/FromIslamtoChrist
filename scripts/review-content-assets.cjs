const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const initSqlJs = require('sql.js');

const projectRoot = path.resolve(__dirname, '..');
const dataRoot = path.join(projectRoot, 'Data');
const databasePath = path.join(projectRoot, 'public', 'data', 'from-darkness-to-light.db');
const manifestPath = path.join(projectRoot, 'public', 'data', 'content-license-manifest.json');
const appSourcePath = path.join(projectRoot, 'src', 'App.jsx');

const knownEmptyPlaceholders = new Set([
  'Data/n1904/docs/tutorial/images/images to be put here.txt',
]);

const noticeEvidence = [
  {
    label: 'BHSA',
    files: ['Data/bhsa/LICENSE', 'Data/bhsa/README.md'],
    phrases: ['CC BY-NC 4.0', '10.17026/dans-z6y-skyh'],
    outcome: 'Restricted for commercial use by the local data notice; attribution and permission scope must be carried into any release.',
  },
  {
    label: 'N1904',
    files: ['Data/n1904/LICENSE.md', 'Data/n1904/docs/about.md'],
    phrases: ['MIT License', 'MACULA Greek Linguistic Datasets', 'Berean Study Bible', 'MARBLE'],
    outcome: 'An MIT notice is present, but the dataset documents derived MACULA, gloss, and semantic layers with separate upstream provenance; keep runtime outputs pending layer-by-layer review.',
  },
  {
    label: 'BHS-Strong mapping',
    files: ['Data/strongs/BHS-Strong-no/LICENSE', 'Data/strongs/BHS-Strong-no/README.md'],
    phrases: ['GNU GENERAL PUBLIC LICENSE', 'Attribution-NonCommercial 4.0', 'Deutsche Bibelgesellschaft'],
    outcome: 'The mapping includes a GPL notice and identifies non-commercial ETCBC/BHS terms; the source text and annotations must not be treated as commercially cleared.',
  },
];

function walkFiles(directory, relativeRoot = '') {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const relativePath = relativeRoot ? `${relativeRoot}/${entry.name}` : entry.name;
    const fullPath = path.join(directory, entry.name);
    return entry.isDirectory() ? walkFiles(fullPath, relativePath) : [relativePath];
  });
}

function rowsFromResult(result) {
  if (!result?.[0]) return [];
  const [{ columns, values }] = result;
  return values.map((value) => Object.fromEntries(columns.map((column, index) => [column, value[index]])));
}

function groupForDataPath(filePath) {
  const parts = filePath.split('/');
  return parts.length > 2 ? parts[1] : 'root';
}

function countBy(values) {
  return values.reduce((counts, value) => {
    counts[value] = (counts[value] || 0) + 1;
    return counts;
  }, {});
}

function formatCounts(counts) {
  return Object.entries(counts).sort(([left], [right]) => left.localeCompare(right)).map(([key, count]) => `${key}=${count}`).join(', ');
}

async function loadModule(relativePath) {
  const moduleUrl = pathToFileURL(path.join(projectRoot, relativePath)).href;
  return import(moduleUrl);
}

async function inspectRuntimeDatabase() {
  assert.ok(fs.existsSync(databasePath), `Missing checked-in runtime database: ${databasePath}`);
  const stat = fs.statSync(databasePath);
  assert.ok(stat.size > 0, 'The checked-in runtime database is empty.');
  const SQL = await initSqlJs({ locateFile: (fileName) => path.join(path.dirname(require.resolve('sql.js')), fileName) });
  const database = new SQL.Database(new Uint8Array(fs.readFileSync(databasePath)));
  try {
    const metadata = Object.fromEntries(rowsFromResult(database.exec('SELECT key, value FROM database_meta')).map((row) => [row.key, row.value]));
    const counts = {
      sourceAssets: Number(rowsFromResult(database.exec('SELECT COUNT(*) AS count FROM source_assets'))[0]?.count || 0),
      bibleBooks: Number(rowsFromResult(database.exec('SELECT COUNT(*) AS count FROM bible_books'))[0]?.count || 0),
      bibleVerses: Number(rowsFromResult(database.exec('SELECT COUNT(*) AS count FROM bible_verses'))[0]?.count || 0),
      strongs: Number(rowsFromResult(database.exec('SELECT COUNT(*) AS count FROM lexicon_entries'))[0]?.count || 0),
      vines: Number(rowsFromResult(database.exec('SELECT COUNT(*) AS count FROM vines_entries'))[0]?.count || 0),
      bhsa: Number(rowsFromResult(database.exec("SELECT COUNT(*) AS count FROM original_language_alignments WHERE corpus = 'BHSA'"))[0]?.count || 0),
      n1904: Number(rowsFromResult(database.exec("SELECT COUNT(*) AS count FROM original_language_alignments WHERE corpus = 'N1904'"))[0]?.count || 0),
    };
    assert.equal(metadata.generated_from, 'Data');
    assert.equal(counts.sourceAssets, Number(metadata.source_asset_count));
    assert.equal(counts.bibleBooks, Number(metadata.bible_book_count));
    assert.equal(counts.bibleVerses, Number(metadata.bible_verse_count));
    assert.ok(counts.bibleBooks > 0 && counts.bibleVerses > 0, 'The runtime database has no Bible rows.');
    assert.ok(counts.strongs > 0 && counts.vines > 0, 'The runtime database has no lexicon rows.');
    assert.ok(counts.bhsa > 0 && counts.n1904 > 0, 'The runtime database has no original-language alignment rows.');
    return { bytes: stat.size, metadata, counts };
  } finally {
    database.close();
  }
}

async function main() {
  assert.ok(fs.existsSync(manifestPath), `Missing content license manifest: ${manifestPath}`);
  assert.ok(fs.existsSync(appSourcePath), `Missing app source: ${appSourcePath}`);

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const dataAvailable = fs.existsSync(dataRoot);
  const dataPaths = dataAvailable
    ? walkFiles(dataRoot).sort().map((filePath) => `Data/${filePath}`)
    : manifest.assets.map((asset) => String(asset.file_path)).sort();
  const manifestPaths = manifest.assets.map((asset) => String(asset.file_path)).sort();
  if (dataAvailable) assert.deepEqual(manifestPaths, dataPaths, 'The license manifest and Data directory have different file sets.');
  else assert.ok(manifestPaths.length > 0, 'The checked-in license manifest is empty.');
  assert.equal(manifest.summary.assetCount, dataPaths.length, 'The license manifest asset count is stale.');

  const emptyFiles = dataAvailable ? dataPaths.filter((filePath) => fs.statSync(path.join(projectRoot, filePath)).size === 0) : [];
  const unexpectedEmptyFiles = emptyFiles.filter((filePath) => !knownEmptyPlaceholders.has(filePath));
  assert.equal(unexpectedEmptyFiles.length, 0, `Unexpected empty Data assets: ${unexpectedEmptyFiles.join(', ')}`);

  const statusCounts = countBy(manifest.assets.map((asset) => asset.review_status));
  const groupCounts = countBy(dataPaths.map(groupForDataPath));
  const noticeFiles = manifest.assets.filter((asset) => asset.review_status === 'source-notice').map((asset) => asset.file_path).sort();
  if (dataAvailable) noticeFiles.forEach((filePath) => assert.ok(fs.existsSync(path.join(projectRoot, filePath)), `Manifest notice file is missing: ${filePath}`));

  if (dataAvailable) {
    for (const evidence of noticeEvidence) {
      const content = evidence.files.map((filePath) => {
        const absolutePath = path.join(projectRoot, filePath);
        assert.ok(fs.existsSync(absolutePath), `Missing ${evidence.label} evidence file: ${filePath}`);
        return fs.readFileSync(absolutePath, 'utf8');
      }).join('\n');
      evidence.phrases.forEach((phrase) => assert.match(content, new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'), `${evidence.label} evidence no longer contains: ${phrase}`));
    }
  }

  const appSource = fs.readFileSync(appSourcePath, 'utf8');
  assert.match(appSource, /const additionalCollections = sourceGroups[\s\S]*?\.filter/, 'The Source Library does not expose indexed groups outside the named collections.');
  assert.match(appSource, /const collectionCards = \[\.\.\.researchCollections, \.\.\.additionalCollections\]/, 'The Source Library does not render named and additional collections together.');
  assert.match(appSource, /raw research files remain outside|raw research file is not presented as cleared public content|raw content remains outside the renderer/i, 'The app does not disclose the raw-source boundary.');

  const sourceFiles = walkFiles(path.join(projectRoot, 'src')).filter((filePath) => /\.(?:js|jsx|ts|tsx)$/.test(filePath));
  const rawDataImports = sourceFiles.filter((filePath) => /(?:from|import\s*\()[\s\S]{0,120}["'][^"']*\bData\//.test(fs.readFileSync(path.join(projectRoot, 'src', filePath), 'utf8')));
  assert.equal(rawDataImports.length, 0, `Renderer source imports raw Data files directly: ${rawDataImports.join(', ')}`);

  const [{ default: researchCapsules }, { default: factsInfoReadingPaths }] = await Promise.all([
    loadModule('src/data/facts-info-capsules.js'),
    loadModule('src/data/facts-info-reading-paths.js'),
  ]);
  const factsAssets = dataPaths.filter((filePath) => filePath.startsWith('Data/Facts & Info/'));
  const capsulePaths = new Set(researchCapsules.map((capsule) => `Data/${capsule.sourcePath}`));
  assert.equal(factsAssets.length, researchCapsules.length, 'Facts & Info source files and capsules are out of sync.');
  factsAssets.forEach((filePath) => assert.ok(capsulePaths.has(filePath), `Facts & Info asset has no educational capsule: ${filePath}`));
  const capsuleIds = new Set(researchCapsules.map((capsule) => capsule.id));
  const usedCapsuleIds = new Set(factsInfoReadingPaths.flatMap((readingPath) => readingPath.sourceIds || []));
  assert.deepEqual([...usedCapsuleIds].sort(), [...capsuleIds].sort(), 'A Facts & Info capsule is not used by a reading path.');

  const runtime = await inspectRuntimeDatabase();
  const releaseReady = Boolean(manifest.releaseReady) && (statusCounts.cleared || 0) === dataPaths.length;

  console.log('Content review audit passed for technical integrity.');
  console.log(`- Data inventory: ${dataPaths.length} files from ${dataAvailable ? 'the local Data directory' : 'the checked-in manifest'}; ${emptyFiles.length} known placeholder(s); 0 unexpected empty files.`);
  console.log(`- Review status: ${formatCounts(statusCounts)}.`);
  console.log(`- Data groups: ${formatCounts(groupCounts)}.`);
  console.log(`- Notice-bearing assets: ${noticeFiles.length}; ${dataAvailable ? 'local notice files exist and required evidence is present' : 'local notice files are not present in this checkout; checked-in manifest status is being enforced'}.`);
  console.log(`- Facts & Info: ${factsAssets.length} source documents -> ${researchCapsules.length} capsules -> ${factsInfoReadingPaths.length} reading paths.`);
  console.log(`- Runtime database: ${(runtime.bytes / (1024 * 1024)).toFixed(1)} MB; ${runtime.counts.sourceAssets} source assets, ${runtime.counts.bibleBooks} books, ${runtime.counts.bibleVerses} verses, ${runtime.counts.strongs} Strong's entries, ${runtime.counts.vines} Vine's entries, ${runtime.counts.bhsa} BHSA alignments, ${runtime.counts.n1904} N1904 alignments.`);
  console.log(`- Renderer boundary: raw Data imports 0; Source Library route present; raw-source disclosure present.`);
  console.log(`RELEASE CONTENT GATE: ${releaseReady ? 'READY' : 'BLOCKED'} — ${statusCounts.cleared || 0} of ${dataPaths.length} indexed Data assets are currently cleared.`);
  console.log('Rights/editorial follow-up remains explicit for translation DOCX files, Facts & Info manuscripts, Vine\'s data, Greek Strong\'s data, scraped KJV/Strong mappings, BHSA layers, and derived N1904/MACULA layers.');
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
