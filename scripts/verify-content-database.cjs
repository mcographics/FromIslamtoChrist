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
  const translationCoverage = { en: 0, bg: 0, ch: 0, sp: 0 };
  rowsFromResult(database.exec('SELECT translations_json FROM bible_verses')).forEach((row) => {
    const translations = JSON.parse(row.translations_json);
    Object.keys(translationCoverage).forEach((key) => {
      if (translations[key]) translationCoverage[key] += 1;
    });
  });
  const verseStrongCount = Number(rowsFromResult(database.exec('SELECT COUNT(*) AS count FROM bible_verse_strongs'))[0]?.count || 0);
  const lexiconCount = Number(rowsFromResult(database.exec('SELECT COUNT(*) AS count FROM lexicon_entries'))[0]?.count || 0);
  const vinesCount = Number(rowsFromResult(database.exec('SELECT COUNT(*) AS count FROM vines_entries'))[0]?.count || 0);
  const vinesTermCount = Number(rowsFromResult(database.exec('SELECT COUNT(*) AS count FROM vines_terms'))[0]?.count || 0);
  const bhsaAlignmentCount = Number(rowsFromResult(database.exec("SELECT COUNT(*) AS count FROM original_language_alignments WHERE corpus = 'BHSA'"))[0]?.count || 0);
  const n1904AlignmentCount = Number(rowsFromResult(database.exec("SELECT COUNT(*) AS count FROM original_language_alignments WHERE corpus = 'N1904'"))[0]?.count || 0);
  const originalLanguageAlignmentCount = Number(rowsFromResult(database.exec('SELECT COUNT(*) AS count FROM original_language_alignments'))[0]?.count || 0);
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
  assert.equal(metadata.database_version, '5');
  assert.equal(verseCount, 31102);
  assert.equal(translationCoverage.en, verseCount);
  assert.ok(translationCoverage.bg > 30000);
  assert.ok(translationCoverage.ch > 30000);
  assert.ok(translationCoverage.sp > 30000);
  assert.equal(verseStrongCount, Number(metadata.bible_verse_strong_count));
  assert.ok(verseStrongCount > 100000);
  assert.equal(lexiconCount, Number(metadata.lexicon_entry_count));
  assert.ok(lexiconCount > 14000);
  assert.equal(vinesCount, Number(metadata.vines_entry_count));
  assert.equal(vinesCount, 3369);
  assert.ok(vinesTermCount > 3000);
  assert.equal(bhsaAlignmentCount, Number(metadata.bhsa_alignment_count));
  assert.equal(n1904AlignmentCount, Number(metadata.n1904_alignment_count));
  assert.equal(originalLanguageAlignmentCount, Number(metadata.original_language_alignment_count));
  assert.ok(bhsaAlignmentCount > 6000);
  assert.ok(n1904AlignmentCount > 5000);
  assert.ok(rowsFromResult(database.exec("SELECT 1 FROM original_language_alignments WHERE strong_number = 'H430' AND corpus = 'BHSA'"))[0]);
  assert.ok(rowsFromResult(database.exec("SELECT 1 FROM original_language_alignments WHERE strong_number = 'G3056' AND corpus = 'N1904'"))[0]);
  assert.equal(Number(rowsFromResult(database.exec("SELECT COUNT(*) AS count FROM bible_verses WHERE book_id = 'JHN' AND chapter_number = 1"))[0]?.count || 0), 51);
  assert.ok(rowsFromResult(database.exec("SELECT 1 FROM source_assets WHERE path = 'strongs/kjv-HG num/Jhn.json'"))[0]);
  assert.ok(rowsFromResult(database.exec("SELECT 1 FROM bible_verses WHERE canonical_reference = 'John 1:1'"))[0]);
  assert.ok(rowsFromResult(database.exec("SELECT 1 FROM lexicon_entries WHERE strong_number = 'G3056'"))[0]);
  assert.ok(rowsFromResult(database.exec("SELECT 1 FROM lexicon_entries WHERE strong_number = 'H430'"))[0]);
  assert.ok(rowsFromResult(database.exec("SELECT 1 FROM vines_terms WHERE strong_number = 'H8441'"))[0]);
  assert.ok(rowsFromResult(database.exec("SELECT 1 FROM bible_verse_strongs WHERE strong_number = 'G3056' AND canonical_reference = 'John 1:1'"))[0]);
  assert.ok(rowsFromResult(database.exec("SELECT 1 FROM bible_verse_strongs WHERE strong_number = 'H430'"))[0]);
  const lexicalConnections = rowsFromResult(database.exec(`
    SELECT v.canonical_reference AS reference,
      COUNT(DISTINCT s.strong_number) AS sharedTerms
    FROM bible_verse_strongs s
    INNER JOIN bible_verses v
      ON v.translation_id = s.translation_id
      AND v.book_id = s.book_id
      AND v.chapter_number = s.chapter_number
      AND v.verse_number = s.verse_number
    WHERE s.translation_id = 'KJV'
      AND s.strong_number IN (
        SELECT DISTINCT source_link.strong_number
        FROM bible_verse_strongs source_link
        WHERE source_link.translation_id = 'KJV'
          AND source_link.book_id = 'JHN'
          AND source_link.chapter_number = 1
      )
      AND NOT (s.book_id = 'JHN' AND s.chapter_number = 1)
    GROUP BY v.book_id, v.chapter_number, v.verse_number
    ORDER BY sharedTerms DESC
    LIMIT 8
  `));
  assert.ok(lexicalConnections.length > 0, 'The Strong\'s index should produce at least one cross-chapter lexical connection.');
  database.close();
  console.log(`Content database verified: ${sourceCount} source assets, ${bookCount} Bible books, ${verseCount} Bible verses, translation coverage EN ${translationCoverage.en}, BG ${translationCoverage.bg}, CH ${translationCoverage.ch}, SP ${translationCoverage.sp}, ${verseStrongCount} verse-to-Strong's links, ${lexiconCount} Strong's entries, ${vinesCount} Vine's entries, ${vinesTermCount} Vine's terms, ${bhsaAlignmentCount} BHSA alignments, ${n1904AlignmentCount} N1904 alignments, FTS rows ${ftsCount}.`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
