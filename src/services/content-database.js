import initSqlJs from 'sql.js';
import wasmUrl from 'sql.js/dist/sql-wasm.wasm?url';

const DATABASE_FILE = 'data/from-darkness-to-light.db';
let databaseSnapshotPromise;
let databaseHandlePromise;

function bytesFromBridgeValue(value) {
  if (!value) return null;
  if (Object.prototype.toString.call(value) === '[object ArrayBuffer]') return new Uint8Array(value);
  if (value instanceof ArrayBuffer) return new Uint8Array(value);
  if (ArrayBuffer.isView(value)) return new Uint8Array(value.buffer, value.byteOffset, value.byteLength);
  if (Array.isArray(value)) return new Uint8Array(value);
  if (Array.isArray(value.data)) return new Uint8Array(value.data);
  return null;
}

function databaseUrl() {
  const base = typeof document !== 'undefined' && document.baseURI
    ? document.baseURI
    : `${import.meta.env.BASE_URL || './'}`;
  return new URL(DATABASE_FILE, base).toString();
}

function rowsFromResult(result) {
  if (!result?.[0]) return [];
  const [{ columns, values }] = result;
  return values.map((value) => Object.fromEntries(columns.map((column, index) => [column, value[index]])));
}

function rowsFromStatement(statement) {
  const rows = [];
  while (statement.step()) rows.push(statement.getAsObject());
  statement.free();
  return rows;
}

async function readDatabaseBytes() {
  let bridgeError = null;
  if (window.fromDarkness?.getContentDatabase) {
    try {
      const bridged = await window.fromDarkness.getContentDatabase();
      const bytes = bytesFromBridgeValue(bridged);
      if (bytes?.byteLength) return bytes;
      bridgeError = new Error('The desktop content bridge returned no database bytes.');
    } catch (error) {
      bridgeError = error;
    }
  }

  try {
    const response = await fetch(databaseUrl(), { cache: 'no-store' });
    if (!response.ok) throw new Error(`Content database returned ${response.status}.`);
    const bytes = new Uint8Array(await response.arrayBuffer());
    if (!bytes.byteLength) throw new Error('The packaged content database is empty.');
    return bytes;
  } catch (fetchError) {
    const details = bridgeError?.message ? ` Desktop bridge: ${bridgeError.message}` : '';
    throw new Error(`The packaged Bible database could not be opened.${details} ${fetchError?.message || ''}`.trim());
  }
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

function sqlList(values) {
  return values.map((value) => `'${String(value).replace(/'/g, "''")}'`).join(', ');
}

function canonicalStrongNumber(value) {
  const match = String(value || '').trim().toUpperCase().match(/^([GH])(\d+)$/);
  if (!match) return String(value || '').trim().toUpperCase();
  return `${match[1]}${Number(match[2])}`;
}

function strongNumberAliases(values) {
  return [...new Set(values.flatMap((value) => [String(value).toUpperCase(), canonicalStrongNumber(value)]))];
}

function mapLexiconEntry(entry) {
  return {
    strongNumber: entry.strongNumber,
    language: entry.language,
    lemma: entry.lemma,
    transliteration: entry.transliteration,
    kjvDefinition: entry.kjvDefinition,
    strongsDefinition: entry.strongsDefinition,
    derivation: entry.derivation,
    occurrenceCount: Number(entry.occurrenceCount || 0),
    occurrences: [],
  };
}

function mapVinesEntry(entry) {
  return {
    title: entry.title,
    page: entry.page,
    language: entry.language,
    definition: entry.definition,
    gloss: entry.gloss,
  };
}

function mapOriginalLanguageAlignment(entry) {
  return {
    corpus: entry.corpus,
    lemma: entry.lemma,
    transliteration: entry.transliteration,
    morphology: JSON.parse(entry.morphologyJson || '{}'),
    gloss: entry.gloss,
    occurrenceCount: Number(entry.occurrenceCount || 0),
    source: entry.source,
    licenseStatus: entry.licenseStatus,
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
  const sourceAssets = rowsFromResult(database.exec(`
    SELECT id,
      path,
      name,
      group_name AS groupName,
      category,
      type,
      extension,
      size_bytes AS sizeBytes,
      previewable,
      review_status AS reviewStatus
    FROM source_assets
    ORDER BY path
  `)).map((asset) => ({ ...asset, previewable: Boolean(asset.previewable) }));
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
    sourceAssets,
    bibleTranslation: metadata.bible_translation || 'KJV',
    bibleBookCount: Number(metadata.bible_book_count || bibleBooks.length),
    bibleVerseCount: Number(metadata.bible_verse_count || 0),
    bibleVerseStrongCount: Number(metadata.bible_verse_strong_count || 0),
    lexiconEntryCount: Number(metadata.lexicon_entry_count || 0),
    vinesEntryCount: Number(metadata.vines_entry_count || 0),
    bhsaAlignmentCount: Number(metadata.bhsa_alignment_count || 0),
    n1904AlignmentCount: Number(metadata.n1904_alignment_count || 0),
    originalLanguageAlignmentCount: Number(metadata.original_language_alignment_count || 0),
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

function dayOfYearIndex(date, count) {
  const safeDate = date instanceof Date && !Number.isNaN(date.getTime()) ? date : new Date();
  const start = Date.UTC(safeDate.getFullYear(), 0, 1);
  const current = Date.UTC(safeDate.getFullYear(), safeDate.getMonth(), safeDate.getDate());
  return Math.floor((current - start) / 86400000) % count;
}

const dailyVerseReferences = [
  'John 1:5', 'John 1:14', 'John 3:16', 'John 8:12', 'John 10:10', 'John 11:25', 'John 14:6', 'John 15:9', 'John 16:33', 'John 20:31',
  'Luke 4:18', 'Luke 15:20', 'Luke 19:10', 'Luke 24:6', 'Matthew 11:28', 'Matthew 22:37', 'Matthew 28:20', 'Mark 10:45', 'Mark 12:29',
  'Romans 5:8', 'Romans 8:1', 'Romans 8:39', 'Romans 10:9', 'Ephesians 2:8', '2 Corinthians 5:17', 'Galatians 2:20', '1 Peter 5:7',
  '1 John 4:9', 'Psalms 23:1', 'Psalms 34:18', 'Psalms 119:105', 'Isaiah 53:5',
];

export async function loadVerseOfTheDay(date = new Date()) {
  await loadContentDatabase();
  const database = await getDatabase();
  const featuredReference = dailyVerseReferences[dayOfYearIndex(date, dailyVerseReferences.length)];
  const escapedReference = String(featuredReference).replace(/'/g, "''");
  const rows = rowsFromResult(database.exec(`
    SELECT v.verse_number AS number,
      v.canonical_reference AS reference,
      v.text,
      v.book_id AS bookId,
      b.book_name AS bookName,
      v.chapter_number AS chapter,
      v.strongs_json AS strongsJson,
      v.translations_json AS translationsJson
    FROM bible_verses v
    INNER JOIN bible_books b ON b.book_id = v.book_id
    WHERE v.translation_id = 'KJV' AND v.canonical_reference = '${escapedReference}'
  `));
  if (rows[0]) return mapBibleVerse(rows[0]);

  const count = Number(rowsFromResult(database.exec("SELECT COUNT(*) AS count FROM bible_verses WHERE translation_id = 'KJV'"))[0]?.count || 0);
  if (count === 0) return null;
  const offset = dayOfYearIndex(date, count);
  const fallbackRows = rowsFromResult(database.exec(`
    SELECT v.verse_number AS number,
      v.canonical_reference AS reference,
      v.text,
      v.book_id AS bookId,
      b.book_name AS bookName,
      v.chapter_number AS chapter,
      v.strongs_json AS strongsJson,
      v.translations_json AS translationsJson
    FROM bible_verses v
    INNER JOIN bible_books b ON b.book_id = v.book_id
    WHERE v.translation_id = 'KJV'
    ORDER BY b.book_order, v.chapter_number, v.verse_number
    LIMIT 1 OFFSET ${offset}
  `));
  return fallbackRows[0] ? mapBibleVerse(fallbackRows[0]) : null;
}

export async function loadSavedBibleVerses(ids) {
  const targets = [...new Set((ids || []).map((value) => String(value)).filter((value) => /^verse-.+\-\d+\-\d+$/.test(value)))].map((id) => {
    const match = id.match(/^verse-(.+)-(\d+)-(\d+)$/);
    return { id, bookSlug: match[1], chapter: Number(match[2]), verse: Number(match[3]) };
  });
  if (targets.length === 0) return [];
  await loadContentDatabase();
  const database = await getDatabase();
  const books = rowsFromResult(database.exec('SELECT book_id AS id FROM bible_books')).map((book) => ({ ...book, slug: book.id === 'JHN' ? 'john' : String(book.id).toLowerCase() }));
  const bookIds = new Map(books.map((book) => [book.slug, book.id]));
  const validTargets = targets.filter((target) => bookIds.has(target.bookSlug));
  if (validTargets.length === 0) return [];
  const bindings = {};
  const clauses = validTargets.map((target, index) => {
    bindings[`$book${index}`] = bookIds.get(target.bookSlug);
    bindings[`$chapter${index}`] = target.chapter;
    bindings[`$verse${index}`] = target.verse;
    return `(v.book_id = $book${index} AND v.chapter_number = $chapter${index} AND v.verse_number = $verse${index})`;
  });
  const statement = database.prepare(`
    SELECT v.verse_number AS number,
      v.canonical_reference AS reference,
      v.text,
      v.book_id AS bookId,
      b.book_name AS bookName,
      v.chapter_number AS chapter,
      v.strongs_json AS strongsJson,
      v.translations_json AS translationsJson
    FROM bible_verses v
    INNER JOIN bible_books b ON b.book_id = v.book_id
    WHERE v.translation_id = 'KJV' AND (${clauses.join(' OR ')})
    ORDER BY b.book_order, v.chapter_number, v.verse_number
  `);
  statement.bind(bindings);
  return rowsFromStatement(statement).map(mapBibleVerse);
}

export async function loadLexiconEntries(strongNumbers) {
  const normalized = [...new Set((strongNumbers || []).map((value) => String(value).toUpperCase()).filter((value) => /^[GH]\d+$/.test(value)))];
  if (normalized.length === 0) return [];
  await loadContentDatabase();
  try {
    const database = await getDatabase();
    const values = sqlList(strongNumberAliases(normalized));
    const strongs = rowsFromResult(database.exec(`
        SELECT strong_number AS strongNumber,
        language,
        lemma,
        transliteration,
        kjv_definition AS kjvDefinition,
        strongs_definition AS strongsDefinition,
        derivation,
        (SELECT COUNT(*)
          FROM bible_verse_strongs
          WHERE bible_verse_strongs.translation_id = 'KJV'
            AND bible_verse_strongs.strong_number = lexicon_entries.strong_number) AS occurrenceCount
      FROM lexicon_entries
      WHERE strong_number IN (${values})
      ORDER BY strong_number
    `)).map(mapLexiconEntry);
    strongs.forEach((entry) => {
      const occurrences = rowsFromResult(database.exec(`
        SELECT s.strong_number AS strongNumber,
          s.book_id AS bookId,
          s.chapter_number AS chapter,
          s.verse_number AS verse,
          s.canonical_reference AS reference,
          v.text
        FROM bible_verse_strongs s
        INNER JOIN bible_verses v
          ON v.translation_id = s.translation_id
          AND v.book_id = s.book_id
          AND v.chapter_number = s.chapter_number
          AND v.verse_number = s.verse_number
        INNER JOIN bible_books b ON b.book_id = s.book_id
        WHERE s.translation_id = 'KJV'
          AND s.strong_number = '${entry.strongNumber}'
        ORDER BY b.book_order, s.chapter_number, s.verse_number
        LIMIT 5
      `));
      entry.occurrences = occurrences.map((occurrence) => ({
        bookId: occurrence.bookId,
        chapter: Number(occurrence.chapter),
        verse: Number(occurrence.verse),
        reference: occurrence.reference,
        text: occurrence.text,
      }));
    });
    const vines = rowsFromResult(database.exec(`
      SELECT t.strong_number AS strongNumber,
        e.title,
        e.page,
        e.language,
        e.definition,
        t.gloss
      FROM vines_terms t
      INNER JOIN vines_entries e ON e.entry_id = t.entry_id
      WHERE t.strong_number IN (${values})
      ORDER BY t.strong_number, e.title
    `));
    const vinesByNumber = new Map();
    vines.forEach((entry) => {
      const list = vinesByNumber.get(entry.strongNumber) || [];
      if (list.length < 2) list.push(mapVinesEntry(entry));
      vinesByNumber.set(entry.strongNumber, list);
    });
    const originalLanguage = rowsFromResult(database.exec(`
      SELECT strong_number AS strongNumber,
        corpus,
        lemma,
        transliteration,
        morphology_json AS morphologyJson,
        gloss,
        occurrence_count AS occurrenceCount,
        source,
        license_status AS licenseStatus
      FROM original_language_alignments
      WHERE strong_number IN (${values})
      ORDER BY strong_number, corpus
    `)).map((entry) => ({ ...entry, strongNumber: canonicalStrongNumber(entry.strongNumber) }));
    const originalLanguageByNumber = new Map();
    originalLanguage.forEach((entry) => {
      const list = originalLanguageByNumber.get(entry.strongNumber) || [];
      list.push(mapOriginalLanguageAlignment(entry));
      originalLanguageByNumber.set(entry.strongNumber, list);
    });
    return strongs.map((entry) => ({
      ...entry,
      vines: vinesByNumber.get(entry.strongNumber) || [],
      originalLanguage: originalLanguageByNumber.get(entry.strongNumber) || [],
    }));
  } catch {
    return [];
  }
}

export async function searchLexiconEntries(query, limit = 12) {
  const normalizedQuery = String(query || '').trim();
  if (!normalizedQuery) return [];
  await loadContentDatabase();
  const database = await getDatabase();
  const resultLimit = Math.max(1, Math.min(24, Number(limit) || 12));
  const likeQuery = `%${normalizedQuery}%`;
  const exactQuery = normalizedQuery.toUpperCase();
  const strongsStatement = database.prepare(`
    SELECT strong_number AS strongNumber
    FROM lexicon_entries
    WHERE lower(strong_number) LIKE lower($query)
      OR lower(COALESCE(lemma, '')) LIKE lower($query)
      OR lower(COALESCE(transliteration, '')) LIKE lower($query)
      OR lower(COALESCE(strongs_definition, '')) LIKE lower($query)
      OR lower(COALESCE(kjv_definition, '')) LIKE lower($query)
    ORDER BY CASE WHEN upper(strong_number) = $exact THEN 0 ELSE 1 END, strong_number
    LIMIT $limit
  `);
  strongsStatement.bind({ $query: likeQuery, $exact: exactQuery, $limit: resultLimit });
  const strongNumbers = rowsFromStatement(strongsStatement).map((entry) => entry.strongNumber);
  strongsStatement.free();

  const vinesStatement = database.prepare(`
    SELECT DISTINCT t.strong_number AS strongNumber
    FROM vines_terms t
    INNER JOIN vines_entries e ON e.entry_id = t.entry_id
    WHERE lower(COALESCE(t.strong_number, '')) LIKE lower($query)
      OR lower(COALESCE(t.gloss, '')) LIKE lower($query)
      OR lower(COALESCE(e.title, '')) LIKE lower($query)
      OR lower(COALESCE(e.definition, '')) LIKE lower($query)
    ORDER BY t.strong_number
    LIMIT $limit
  `);
  vinesStatement.bind({ $query: likeQuery, $limit: resultLimit });
  const vineStrongNumbers = rowsFromStatement(vinesStatement).map((entry) => entry.strongNumber).filter(Boolean);
  vinesStatement.free();

  const originalLanguageStatement = database.prepare(`
    SELECT strong_number AS strongNumber
    FROM original_language_alignments
    WHERE lower(strong_number) LIKE lower($query)
      OR lower(COALESCE(lemma, '')) LIKE lower($query)
      OR lower(COALESCE(transliteration, '')) LIKE lower($query)
      OR lower(COALESCE(gloss, '')) LIKE lower($query)
    ORDER BY CASE WHEN upper(strong_number) = $exact THEN 0 ELSE 1 END, strong_number
    LIMIT $limit
  `);
  originalLanguageStatement.bind({ $query: likeQuery, $exact: exactQuery, $limit: resultLimit });
  const originalLanguageStrongNumbers = rowsFromStatement(originalLanguageStatement).map((entry) => entry.strongNumber).filter(Boolean);
  originalLanguageStatement.free();

  return loadLexiconEntries([...new Set([...strongNumbers, ...vineStrongNumbers, ...originalLanguageStrongNumbers].map(canonicalStrongNumber))].slice(0, resultLimit));
}

export async function loadChapterCrossReferences(bookId, chapter, limit = 8) {
  const normalizedBookId = String(bookId || '').replace(/'/g, "''");
  const chapterNumber = Number(chapter) || 1;
  const resultLimit = Math.max(1, Math.min(20, Number(limit) || 8));
  if (!normalizedBookId) return [];
  await loadContentDatabase();
  const database = await getDatabase();
  const rows = rowsFromResult(database.exec(`
    SELECT v.book_id AS bookId,
      b.book_name AS bookName,
      v.chapter_number AS chapter,
      v.verse_number AS number,
      v.canonical_reference AS reference,
      v.text,
      COUNT(DISTINCT s.strong_number) AS sharedTerms
    FROM bible_verse_strongs s
    INNER JOIN bible_verses v
      ON v.translation_id = s.translation_id
      AND v.book_id = s.book_id
      AND v.chapter_number = s.chapter_number
      AND v.verse_number = s.verse_number
    INNER JOIN bible_books b ON b.book_id = v.book_id
    WHERE s.translation_id = 'KJV'
      AND s.strong_number IN (
        SELECT DISTINCT source_link.strong_number
        FROM bible_verse_strongs source_link
        WHERE source_link.translation_id = 'KJV'
          AND source_link.book_id = '${normalizedBookId}'
          AND source_link.chapter_number = ${chapterNumber}
      )
      AND NOT (s.book_id = '${normalizedBookId}' AND s.chapter_number = ${chapterNumber})
    GROUP BY v.book_id, b.book_name, b.book_order, v.chapter_number, v.verse_number, v.canonical_reference, v.text
    ORDER BY sharedTerms DESC, b.book_order, v.chapter_number, v.verse_number
    LIMIT ${resultLimit}
  `));
  return rows.map((row) => ({
    bookId: row.bookId,
    bookName: row.bookName,
    chapter: Number(row.chapter),
    number: Number(row.number),
    reference: row.reference,
    text: row.text,
    sharedTerms: Number(row.sharedTerms || 0),
  }));
}

export async function searchBibleVerses(query, limit = 8) {
  const normalizedQuery = String(query || '').trim();
  if (!normalizedQuery) return [];
  await loadContentDatabase();
  const database = await getDatabase();
  const statement = database.prepare(`
    SELECT v.book_id AS bookId,
      b.book_name AS bookName,
      v.chapter_number AS chapter,
      v.verse_number AS number,
      v.canonical_reference AS reference,
      v.text
    FROM bible_verses v
    INNER JOIN bible_books b ON b.book_id = v.book_id
    WHERE v.translation_id = 'KJV'
      AND (lower(v.canonical_reference) LIKE lower($query) OR lower(v.text) LIKE lower($query))
    ORDER BY CASE WHEN lower(v.canonical_reference) = lower($exact) THEN 0 ELSE 1 END,
      b.book_order, v.chapter_number, v.verse_number
    LIMIT $limit
  `);
  statement.bind({ $query: `%${normalizedQuery}%`, $exact: normalizedQuery, $limit: Math.max(1, Number(limit) || 8) });
  return rowsFromStatement(statement).map((verse) => ({
    bookId: verse.bookId,
    bookName: verse.bookName,
    chapter: Number(verse.chapter),
    number: Number(verse.number),
    reference: verse.reference,
    text: verse.text,
  }));
}

export async function searchResearchEntries(query, limit = 8) {
  const normalizedQuery = String(query || '').trim();
  if (!normalizedQuery) return [];
  await loadContentDatabase();
  const database = await getDatabase();
  const resultLimit = Math.max(1, Number(limit) || 8);
  const strongsStatement = database.prepare(`
    SELECT strong_number AS strongNumber,
      language,
      lemma,
      transliteration,
      COALESCE(strongs_definition, kjv_definition, '') AS definition
    FROM lexicon_entries
    WHERE lower(strong_number) LIKE lower($query)
      OR lower(COALESCE(lemma, '')) LIKE lower($query)
      OR lower(COALESCE(transliteration, '')) LIKE lower($query)
      OR lower(COALESCE(strongs_definition, '')) LIKE lower($query)
      OR lower(COALESCE(kjv_definition, '')) LIKE lower($query)
    ORDER BY CASE WHEN lower(strong_number) = lower($exact) THEN 0 ELSE 1 END, strong_number
    LIMIT $limit
  `);
  strongsStatement.bind({ $query: `%${normalizedQuery}%`, $exact: normalizedQuery, $limit: resultLimit });
  const strongs = rowsFromStatement(strongsStatement).map((entry) => ({
    type: 'research',
    collection: "Strong's",
    id: `strongs-${entry.strongNumber}`,
    title: `${entry.strongNumber}${entry.lemma ? ` · ${entry.lemma}` : ''}`,
    detail: `${entry.language || 'Original language'} · ${entry.definition || 'Lexical definition available in the local index.'}`,
    groupName: 'strongs',
  }));

  const vinesStatement = database.prepare(`
    SELECT DISTINCT e.entry_id AS entryId,
      e.title,
      e.language,
      e.definition,
      t.strong_number AS strongNumber
    FROM vines_entries e
    LEFT JOIN vines_terms t ON t.entry_id = e.entry_id
    WHERE lower(e.title) LIKE lower($query)
      OR lower(e.definition) LIKE lower($query)
      OR lower(COALESCE(t.strong_number, '')) LIKE lower($query)
      OR lower(COALESCE(t.gloss, '')) LIKE lower($query)
    ORDER BY e.entry_id
    LIMIT $limit
  `);
  vinesStatement.bind({ $query: `%${normalizedQuery}%`, $limit: resultLimit });
  const vines = rowsFromStatement(vinesStatement).map((entry) => ({
    type: 'research',
    collection: "Vine's",
    id: `vines-${entry.entryId}`,
    title: entry.title,
    detail: `${entry.strongNumber ? `${entry.strongNumber} · ` : ''}${entry.definition || 'Expository reference available in the local index.'}`,
    groupName: 'vines',
  }));

  const originalLanguageStatement = database.prepare(`
    SELECT strong_number AS strongNumber,
      corpus,
      lemma,
      transliteration,
      gloss,
      occurrence_count AS occurrenceCount
    FROM original_language_alignments
    WHERE lower(strong_number) LIKE lower($query)
      OR lower(COALESCE(lemma, '')) LIKE lower($query)
      OR lower(COALESCE(transliteration, '')) LIKE lower($query)
      OR lower(COALESCE(gloss, '')) LIKE lower($query)
    ORDER BY CASE WHEN lower(strong_number) = lower($exact) THEN 0 ELSE 1 END, corpus, strong_number
    LIMIT $limit
  `);
  originalLanguageStatement.bind({ $query: `%${normalizedQuery}%`, $exact: normalizedQuery, $limit: resultLimit });
  const originalLanguage = rowsFromStatement(originalLanguageStatement).map((entry) => ({
    type: 'research',
    collection: entry.corpus === 'BHSA' ? 'BHSA Hebrew' : 'N1904 Greek',
    id: `original-language-${entry.corpus}-${entry.strongNumber}`,
    title: `${entry.strongNumber} · ${entry.lemma || 'Aligned lemma'}`,
    detail: `${entry.transliteration ? `${entry.transliteration} · ` : ''}${entry.gloss || 'Original-language alignment'} · ${Number(entry.occurrenceCount || 0).toLocaleString()} occurrences`,
    groupName: entry.corpus === 'BHSA' ? 'bhsa' : 'n1904',
  }));

  return [...strongs, ...vines, ...originalLanguage];
}
