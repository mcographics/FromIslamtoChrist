const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const initSqlJs = require('sql.js');

const projectRoot = path.resolve(__dirname, '..');
const dataRoot = path.join(projectRoot, 'Data');
const databasePath = path.join(projectRoot, 'public', 'data', 'from-darkness-to-light.db');
const packageVersion = require(path.join(projectRoot, 'package.json')).version;

function rowsFromResult(result) {
  if (!result?.[0]) return [];
  const [{ columns, values }] = result;
  return values.map((value) => Object.fromEntries(columns.map((column, index) => [column, value[index]])));
}

function walkDataFiles(directory, relativeRoot = '') {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const relativePath = relativeRoot ? `${relativeRoot}/${entry.name}` : entry.name;
    const fullPath = path.join(directory, entry.name);
    return entry.isDirectory() ? walkDataFiles(fullPath, relativePath) : [relativePath];
  });
}

async function main() {
  assert.ok(fs.existsSync(databasePath), `Missing content database: ${databasePath}`);
  const SQL = await initSqlJs({ locateFile: (fileName) => path.join(path.dirname(require.resolve('sql.js')), fileName) });
  const database = new SQL.Database(new Uint8Array(fs.readFileSync(databasePath)));
  const metadata = Object.fromEntries(rowsFromResult(database.exec('SELECT key, value FROM database_meta')).map((row) => [row.key, row.value]));
  const sourceCount = Number(rowsFromResult(database.exec('SELECT COUNT(*) AS count FROM source_assets'))[0]?.count || 0);
  const ftsCount = Number(rowsFromResult(database.exec('SELECT COUNT(*) AS count FROM source_assets_fts'))[0]?.count || 0);
  const bookCount = Number(rowsFromResult(database.exec('SELECT COUNT(*) AS count FROM bible_books'))[0]?.count || 0);
  const verseCount = Number(rowsFromResult(database.exec('SELECT COUNT(*) AS count FROM bible_verses'))[0]?.count || 0);
  assert.equal(metadata.generated_from, 'Data');
  assert.equal(metadata.content_version, packageVersion);
  assert.equal(sourceCount, Number(metadata.source_asset_count));
  assert.equal(ftsCount, sourceCount);
  if (fs.existsSync(dataRoot)) {
    const dataPaths = walkDataFiles(dataRoot).sort();
    const indexedPaths = rowsFromResult(database.exec('SELECT path FROM source_assets ORDER BY path')).map((row) => row.path).sort();
    assert.deepEqual(indexedPaths, dataPaths, 'The runtime database does not account for every file in Data.');
  }
  assert.equal(bookCount, Number(metadata.bible_book_count));
  assert.equal(bookCount, 66);
  assert.equal(verseCount, Number(metadata.bible_verse_count));
  assert.equal(verseCount, 31102);
  assert.equal(Number(rowsFromResult(database.exec("SELECT COUNT(*) AS count FROM bible_verses WHERE book_id = 'JHN' AND chapter_number = 1"))[0]?.count || 0), 51);
  assert.ok(rowsFromResult(database.exec("SELECT 1 FROM source_assets WHERE path = 'strongs/kjv-HG num/Jhn.json'"))[0]);
  assert.ok(rowsFromResult(database.exec("SELECT 1 FROM bible_verses WHERE canonical_reference = 'John 1:1'"))[0]);
  database.close();
  console.log(`Content database verified: ${sourceCount} source assets, ${bookCount} Bible books, ${verseCount} Bible verses, FTS rows ${ftsCount}.`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
