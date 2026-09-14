import initSqlJs from 'sql.js';
import wasmUrl from 'sql.js/dist/sql-wasm.wasm?url';

const DATABASE_FILE = 'data/from-darkness-to-light.db';
let databaseSnapshotPromise;

function rowsFromResult(result) {
  if (!result?.[0]) return [];
  const [{ columns, values }] = result;
  return values.map((value) => Object.fromEntries(columns.map((column, index) => [column, value[index]])));
}

async function readDatabaseBytes() {
  if (window.fromDarkness?.getContentDatabase) {
    const bridged = await window.fromDarkness.getContentDatabase();
    if (bridged instanceof ArrayBuffer) return new Uint8Array(bridged);
    if (ArrayBuffer.isView(bridged)) return new Uint8Array(bridged.buffer, bridged.byteOffset, bridged.byteLength);
  }

  const response = await fetch(`./${DATABASE_FILE}`, { cache: 'no-store' });
  if (!response.ok) throw new Error(`Content database returned ${response.status}.`);
  return new Uint8Array(await response.arrayBuffer());
}

async function createSnapshot() {
  const SQL = await initSqlJs({ locateFile: () => wasmUrl });
  const database = new SQL.Database(await readDatabaseBytes());
  const metadata = Object.fromEntries(rowsFromResult(database.exec('SELECT key, value FROM database_meta')).map((row) => [row.key, row.value]));
  const groups = rowsFromResult(database.exec('SELECT name, file_count AS fileCount, total_bytes AS totalBytes FROM source_groups ORDER BY name'));
  const bibleVerses = rowsFromResult(database.exec(`
    SELECT verse_number AS number, canonical_reference AS reference, text, strongs_json AS strongsJson, translations_json AS translationsJson
    FROM bible_verses
    ORDER BY translation_id, book_id, chapter_number, verse_number
  `)).map((verse) => ({
    number: verse.number,
    reference: verse.reference,
    text: verse.text,
    strongs: JSON.parse(verse.strongsJson),
    translations: JSON.parse(verse.translationsJson),
  }));
  database.close();

  return {
    status: 'ready',
    databaseFile: DATABASE_FILE,
    databaseVersion: metadata.database_version || 'unknown',
    contentVersion: metadata.content_version || 'unknown',
    sourceAssetCount: Number(metadata.source_asset_count || 0),
    sourceAssetBytes: Number(metadata.source_asset_bytes || 0),
    groups,
    bibleVerses,
  };
}

export function loadContentDatabase() {
  if (!databaseSnapshotPromise) {
    databaseSnapshotPromise = createSnapshot().catch((error) => {
      databaseSnapshotPromise = null;
      throw error;
    });
  }
  return databaseSnapshotPromise;
}
