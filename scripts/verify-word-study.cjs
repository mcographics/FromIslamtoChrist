const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const initSqlJs = require('sql.js');

const projectRoot = path.resolve(__dirname, '..');
const databasePath = path.join(projectRoot, 'public', 'data', 'from-darkness-to-light.db');
const databaseService = fs.readFileSync(path.join(projectRoot, 'src', 'services', 'content-database.js'), 'utf8');
const appSource = fs.readFileSync(path.join(projectRoot, 'src', 'App.jsx'), 'utf8');

function rowsFromResult(result) {
  if (!result?.[0]) return [];
  const [{ columns, values }] = result;
  return values.map((value) => Object.fromEntries(columns.map((column, index) => [column, value[index]])));
}

async function main() {
  assert.match(databaseService, /function canonicalStrongNumber\(value\)/, 'Word-study loading must canonicalize padded Strong numbers.');
  assert.match(databaseService, /function strongNumberAliases\(values\)/, 'Word-study loading must search both padded and canonical Strong-number forms.');
  assert.match(databaseService, /const originalLanguageStatement = database\.prepare/, 'Word-study search must query original-language alignments.');
  assert.match(databaseService, /originalLanguageStrongNumbers/, 'Original-language search results must feed the lexicon study trail.');
  assert.match(appSource, /function openLearnWordStudy\(query = ''\)/, 'Global research results must have a Learn word-study handoff.');
  assert.match(appSource, /if \(result\?\.type === 'research'\)[\s\S]*?openLearnWordStudy/, 'Global research results must open the word-study explorer.');
  assert.match(appSource, /<WordStudyExplorer initialQuery=\{initialWordStudyQuery\}/, 'The Learn word-study explorer must accept a routed search term.');
  assert.match(appSource, /if \(group === 'bhsa'\)[\s\S]*?focusTarget: 'word-study'/, 'BHSA source guidance must route to the word-study surface.');
  assert.match(appSource, /if \(group === 'n1904'\)[\s\S]*?focusTarget: 'word-study'/, 'N1904 source guidance must route to the word-study surface.');

  assert.ok(fs.existsSync(databasePath), `Missing content database: ${databasePath}`);
  const SQL = await initSqlJs({ locateFile: (fileName) => path.join(path.dirname(require.resolve('sql.js')), fileName) });
  const database = new SQL.Database(new Uint8Array(fs.readFileSync(databasePath)));
  const paddedAlignment = rowsFromResult(database.exec(`
    SELECT strong_number AS strongNumber, lemma
    FROM original_language_alignments
    WHERE strong_number = 'G0976' AND lower(lemma) LIKE lower('%βίβλος%')
    LIMIT 1
  `))[0];
  assert.ok(paddedAlignment, 'The database must retain a padded original-language alignment sample.');
  assert.ok(rowsFromResult(database.exec("SELECT 1 FROM lexicon_entries WHERE strong_number = 'G976'"))[0], 'The canonical lexicon form must exist for the padded alignment sample.');
  const aliasLoadRows = rowsFromResult(database.exec(`
    SELECT le.strong_number AS strongNumber, ola.strong_number AS alignmentStrongNumber
    FROM lexicon_entries le
    INNER JOIN original_language_alignments ola
      ON le.strong_number IN ('G976', 'G0976')
      AND ola.strong_number IN ('G976', 'G0976')
    WHERE le.strong_number = 'G976' AND ola.strong_number = 'G0976'
    LIMIT 1
  `));
  assert.equal(aliasLoadRows.length, 1, 'Canonical and padded forms must remain linkable in the local study database.');
  database.close();
  console.log('Word-study verified: original-language search is wired into the local explorer, padded/canonical Strong numbers remain linkable, and BHSA/N1904 source guidance opens Bible word study.');
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
