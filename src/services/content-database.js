import initSqlJs from 'sql.js';
import wasmUrl from 'sql.js/dist/sql-wasm.wasm?url';

const DATABASE_FILE = 'data/from-darkness-to-light.db';
let databaseSnapshotPromise;
let databaseHandlePromise;

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

function mapBibleVerse(verse) {
  return {
    number: verse.number,
    reference: verse.reference,
    text: verse.text,
    bookId: verse.bookId,
    bookName: verse.bookName,
    chapter: verse.chapter,
    strongs: JSON.parse(verse.strongsJson),
    translations: JSON.parse(verse.translationsJson),
  };
}

function readBibleVerses(database, bookId, chapter) {
  return rowsFromResult(database.exec(`
    SELECT verse_number AS number,
      canonical_reference AS reference,
      text,
      book_id AS bookId,
      (SELECT book_name FROM bible_books WHERE bible_books.book_id = bible_verses.book_id) AS bookName,
      chapter_number AS chapter,
      strongs_json AS strongsJson,
      translations_json AS translationsJson
    FROM bible_verses
    WHERE translation_id = 'KJV' AND book_id = '${String(bookId).replace(/'/g, "''")}' AND chapter_number = ${Number(chapter) || 1}
    ORDER BY verse_number
  `)).map(mapBibleVerse);
}

async function openDatabase() {
  const SQL = await initSqlJs({ locateFile: () => wasmUrl });
  return new SQL.Database(await readDatabaseBytes());
}

async function getDatabase() {
  if (!databaseHandlePromise) {
    databaseHandlePromise = openDatabase().catch((error) => {
      databaseHandlePromise = null;
      throw error;
    });
  }
  return databaseHandlePromise;
}

async function createSnapshot() {
  const database = await getDatabase();
  const metadata = Object.fromEntries(rowsFromResult(database.exec('SELECT key, value FROM database_meta')).map((row) => [row.key, row.value]));
  const groups = rowsFromResult(database.exec('SELECT name, file_count AS fileCount, total_bytes AS totalBytes FROM source_groups ORDER BY name'));
  const bibleBooks = rowsFromResult(database.exec(`
    SELECT book_id AS id, book_name AS name, abbreviation, book_order AS bookOrder, chapter_count AS chapterCount
    FROM bible_books
    ORDER BY book_order
  `));
  const bibleVerses = readBibleVerses(database, 'JHN', 1);

  return {
    status: 'ready',
    databaseFile: DATABASE_FILE,
    databaseVersion: metadata.database_version || 'unknown',
    contentVersion: metadata.content_version || 'unknown',
    sourceAssetCount: Number(metadata.source_asset_count || 0),
    sourceAssetBytes: Number(metadata.source_asset_bytes || 0),
    groups,
    bibleTranslation: metadata.bible_translation || 'KJV',
    bibleBookCount: Number(metadata.bible_book_count || bibleBooks.length),
    bibleVerseCount: Number(metadata.bible_verse_count || 0),
    bibleBooks,
    bibleLocation: { bookId: 'JHN', chapter: 1 },
    bibleVerses,
  };
}

export function loadContentDatabase() {
  if (!databaseSnapshotPromise) {
    databaseSnapshotPromise = createSnapshot().catch((error) => {
      databaseSnapshotPromise = null;
      databaseHandlePromise = null;
      throw error;
    });
  }
  return databaseSnapshotPromise;
}

export async function loadBibleChapter(bookId, chapter) {
  await loadContentDatabase();
  return readBibleVerses(await getDatabase(), bookId, chapter);
}
