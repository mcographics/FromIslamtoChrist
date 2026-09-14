const fs = require('node:fs');
const fsp = require('node:fs/promises');
const path = require('node:path');
const initSqlJs = require('sql.js');

const projectRoot = path.resolve(__dirname, '..');
const dataRoot = path.join(projectRoot, 'Data');
const outputRoot = path.join(projectRoot, 'public', 'data');
const fallbackRoot = path.join(projectRoot, 'src', 'data');
const databasePath = path.join(outputRoot, 'from-darkness-to-light.db');
const licenseManifestPath = path.join(outputRoot, 'content-license-manifest.json');
const bibleRoot = path.join(dataRoot, 'strongs', 'kjv-HG num');
const bibleBooksPath = path.join(bibleRoot, 'books.json');
const bibleChapterCountPath = path.join(bibleRoot, 'chapter_count.json');
const bibleOutputPath = path.join(fallbackRoot, 'bible-john.json');
const strongsGreekPath = path.join(dataRoot, 'strongs', 'greek', 'strongs-greek-dictionary.js');
const strongsHebrewPath = path.join(dataRoot, 'strongs', 'hebrew', 'strongs-hebrew-dictionary.js');
const bhsaAlignmentPath = path.join(dataRoot, 'strongs', 'strongs_bhsa_alignment.json');
const n1904AlignmentPath = path.join(dataRoot, 'strongs', 'strongs_n1904_word_alignment.json');
const vinesEntriesPath = path.join(dataRoot, 'vines', 'vines_entries.json');
const packageVersion = require(path.join(projectRoot, 'package.json')).version;
const contentVersion = process.env.npm_package_version || packageVersion;

const categories = {
  documentation: new Set(['.md', '.txt', '.key', '.gitattributes', '.gitignore']),
  bible: new Set(['.docx', '.json', '.tf', '.mql', '.csv', '.pos', '.ann']),
  reference: new Set(['.pdf', '.xlsx', '.ipynb']),
  tooling: new Set(['.py', '.js', '.sh', '.pl', '.yaml', '.yml', '.xml', '.xslt', '.xhtml', '.html', '.css', '.scss']),
  media: new Set(['.png', '.jpg', '.jpeg', '.ico']),
  archive: new Set(['.zip', '.gz', '.bz2', '.dat', '.dic']),
};

const previewable = new Set([
  '', '.ann', '.css', '.csv', '.gitattributes', '.gitignore', '.html', '.ipynb', '.js',
  '.json', '.key', '.md', '.pl', '.pos', '.py', '.scss', '.sh', '.txt', '.tf', '.xml',
  '.xhtml', '.yaml', '.yml',
]);

async function walk(directory) {
  const entries = await fsp.readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(fullPath));
    else if (entry.isFile()) files.push(fullPath);
  }
  return files;
}

function categoryFor(extension) {
  for (const [category, extensions] of Object.entries(categories)) {
    if (extensions.has(extension)) return category;
  }
  return 'other';
}

function displayType(category, extension) {
  if (extension === '.docx') return 'Translation source';
  if (extension === '.json') return 'Structured data';
  if (extension === '.tf') return 'Text-Fabric feature';
  if (extension === '.csv' || extension === '.xlsx') return 'Tabular data';
  if (extension === '.pdf') return 'Reference document';
  if (category === 'archive') return 'Compressed dataset';
  if (category === 'media') return 'Image asset';
  if (category === 'tooling') return 'Tooling / configuration';
  if (category === 'documentation') return 'Documentation / notice';
  return extension ? `${extension.slice(1).toUpperCase()} asset` : 'Extensionless asset';
}

function buildLicenseManifest(files) {
  const reviewCounts = files.reduce((counts, file) => {
    counts[file.reviewStatus] = (counts[file.reviewStatus] || 0) + 1;
    return counts;
  }, {});

  return {
    manifestVersion: 1,
    generatedFrom: 'Data',
    contentVersion,
    releaseReady: files.every((file) => file.reviewStatus === 'cleared'),
    summary: {
      assetCount: files.length,
      reviewCounts,
      clearedAssetCount: reviewCounts.cleared || 0,
    },
    assets: files.map((file, index) => {
      const filePath = `Data/${file.path}`;
      const hasSourceNotice = file.reviewStatus === 'source-notice';
      return {
        asset_id: `data:${file.path}`,
        file_path: filePath,
        content_type: file.type,
        source: 'Local Data directory',
        copyright_holder: null,
        license: hasSourceNotice ? 'UNVERIFIED_SOURCE_NOTICE' : 'UNVERIFIED_LOCAL_SOURCE',
        redistribution_allowed: null,
        commercial_use_allowed: null,
        modification_allowed: null,
        required_attribution: null,
        required_notice: hasSourceNotice
          ? `Inspect the notice file associated with ${filePath} before redistribution.`
          : 'License and attribution review required before redistribution.',
        source_version: null,
        review_status: file.reviewStatus,
        reviewed_by: null,
        reviewed_at: null,
        catalog_index: index + 1,
      };
    }),
  };
}

function cleanBibleText(value) {
  return value
    .replace(/\[(?:[A-Z]\d+|fn)\]/gi, '')
    .replace(/<\/?em>/g, '')
    .replace(/\s+([,.;:!?])/g, '$1')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function repairLooseJson(raw) {
  let output = '';
  let inString = false;
  let escaped = false;

  for (let index = 0; index < raw.length; index += 1) {
    const character = raw[index];
    if (!inString) {
      output += character;
      if (character === '"') inString = true;
      continue;
    }

    if (escaped) {
      output += character;
      escaped = false;
      continue;
    }
    if (character === '\\' && raw[index + 1] === '\\' && raw[index + 2] === '"') {
      output += '\\"';
      index += 2;
      continue;
    }
    if (character === '\\') {
      output += character;
      escaped = true;
      continue;
    }
    if (character === '"') {
      const remainder = raw.slice(index + 1);
      const nextNonWhitespace = remainder.match(/\S/)?.[0];
      const nextAfterComma = remainder.match(/^\s*,\s*(\S)/)?.[1];
      const closingQuote = nextNonWhitespace === undefined
        || ':}]'.includes(nextNonWhitespace)
        || (nextNonWhitespace === ',' && (nextAfterComma === undefined || '"}]'.includes(nextAfterComma)));
      if (closingQuote) {
        output += character;
        inString = false;
      } else {
        output += '\\"';
      }
      continue;
    }
    output += character;
  }
  return output;
}

function firstJsonValue(raw) {
  let depth = 0;
  let inString = false;
  let escaped = false;
  let started = false;

  for (let index = 0; index < raw.length; index += 1) {
    const character = raw[index];
    if (inString) {
      if (escaped) escaped = false;
      else if (character === '\\') escaped = true;
      else if (character === '"') inString = false;
      continue;
    }
    if (character === '"') {
      inString = true;
      continue;
    }
    if (character === '{' || character === '[') {
      started = true;
      depth += 1;
    } else if (character === '}' || character === ']') {
      depth -= 1;
      if (started && depth === 0) return raw.slice(0, index + 1);
    }
  }
  return raw;
}

function parseLooseJson(raw, sourceLabel) {
  try {
    return JSON.parse(raw);
  } catch (initialError) {
    const repaired = repairLooseJson(raw);
    try {
      return JSON.parse(repaired);
    } catch {
      try {
        return JSON.parse(firstJsonValue(repaired));
      } catch {
        throw new Error(`Could not parse ${sourceLabel}: ${initialError.message}`);
      }
    }
  }
}

function buildStrongLexicon() {
  const dictionaries = [
    { language: 'Greek', source: 'Data/strongs/greek/strongs-greek-dictionary.js', entries: require(strongsGreekPath) },
    { language: 'Hebrew', source: 'Data/strongs/hebrew/strongs-hebrew-dictionary.js', entries: require(strongsHebrewPath) },
  ];
  return dictionaries.flatMap(({ language, source, entries }) => Object.entries(entries).map(([strongNumber, entry]) => ({
    strongNumber,
    language,
    lemma: entry.lemma || null,
    transliteration: entry.translit || entry.xlit || entry.pron || null,
    kjvDefinition: entry.kjv_def || null,
    strongsDefinition: entry.strongs_def || null,
    derivation: entry.derivation || null,
    source,
    licenseStatus: 'needs-review',
  })));
}

async function buildResearchLexicon() {
  const vines = parseLooseJson(await fsp.readFile(vinesEntriesPath, 'utf8'), 'vines_entries.json');
  const entries = (vines.entries || []).map((entry, index) => ({
    id: index + 1,
    title: entry.title || `Vine's entry ${index + 1}`,
    keywords: Array.isArray(entry.keywords) ? entry.keywords : [],
    page: Number(entry.page) || null,
    language: entry.language || null,
    definition: entry.definition || '',
    sections: Array.isArray(entry.sections) ? entry.sections : [],
    source: 'Data/vines/vines_entries.json',
    licenseStatus: 'needs-review',
    terms: Array.isArray(entry.terms) ? entry.terms : [],
  }));
  const terms = entries.flatMap((entry) => entry.terms.map((term) => ({
    entryId: entry.id,
    strongNumber: term.strong || null,
    language: term.language || null,
    original: term.original || null,
    transliteration: term.transliteration || null,
    partOfSpeech: term.partOfSpeech || null,
    gloss: term.gloss || null,
  })).filter((term) => /^[GH]\d+$/i.test(term.strongNumber || '')));
  return { strongs: buildStrongLexicon(), vines: entries, vinesTerms: terms };
}

function buildOriginalLanguageAlignments() {
  const bhsa = parseLooseJson(fs.readFileSync(bhsaAlignmentPath, 'utf8'), 'strongs_bhsa_alignment.json');
  const n1904 = parseLooseJson(fs.readFileSync(n1904AlignmentPath, 'utf8'), 'strongs_n1904_word_alignment.json');
  const bhsaRows = Object.entries(bhsa).map(([strongNumber, entry]) => {
    const aligned = entry?.bhsa || {};
    return {
      strongNumber: String(strongNumber).toUpperCase(),
      corpus: 'BHSA',
      lemma: aligned.lexeme || entry?.strongs_lemma_norm || entry?.strongs_lemma || null,
      transliteration: null,
      morphology: Object.fromEntries(Object.entries(aligned).filter(([key, value]) => key !== 'lexeme' && key !== 'count' && value !== '' && value !== null && value !== undefined)),
      gloss: null,
      occurrenceCount: Number(aligned.count || 0),
      source: 'Data/strongs/strongs_bhsa_alignment.json',
      licenseStatus: 'needs-review',
    };
  });
  const n1904Rows = Object.entries(n1904).map(([strongNumber, entry]) => {
    const aligned = entry?.n1904 || {};
    return {
      strongNumber: String(strongNumber).toUpperCase(),
      corpus: 'N1904',
      lemma: aligned.lemma || null,
      transliteration: aligned.translit || null,
      morphology: Object.fromEntries(Object.entries(aligned).filter(([key, value]) => !['lemma', 'translit', 'gloss'].includes(key) && value !== '' && value !== null && value !== undefined)),
      gloss: aligned.gloss || null,
      occurrenceCount: Number(entry?.count || 0),
      source: 'Data/strongs/strongs_n1904_word_alignment.json',
      licenseStatus: 'needs-review',
    };
  });
  return [...bhsaRows, ...n1904Rows].filter((entry) => /^[GH]\d+$/.test(entry.strongNumber));
}

function bibleVerseFromRow(book, reference, translations) {
  const rawEnglish = translations.en || '';
  const number = Number(reference.split('|').at(-1));
  return {
    number,
    reference: `${book.name} ${book.chapter}:${number}`,
    text: cleanBibleText(rawEnglish),
    strongs: [...rawEnglish.matchAll(/\[([A-Z]\d+)\]/g)].map((match) => match[1]),
    translations: {
      en: cleanBibleText(translations.en || ''),
      bg: translations.bg || null,
      ch: translations.ch || null,
      sp: translations.sp || null,
    },
  };
}

async function buildBibleCorpus() {
  const definitions = parseLooseJson(await fsp.readFile(bibleBooksPath, 'utf8'), 'books.json').books.map((entry, index) => {
    const [name, abbreviation] = Object.entries(entry)[0];
    return { id: abbreviation.toUpperCase(), name, abbreviation, order: index + 1 };
  });
  const chapterCounts = parseLooseJson(await fsp.readFile(bibleChapterCountPath, 'utf8'), 'chapter_count.json');
  const books = [];
  const verses = [];
  const verseKeys = new Set();
  const duplicateVerses = [];

  for (const definition of definitions) {
    const sourcePath = path.join(bibleRoot, `${definition.abbreviation}.json`);
    const source = parseLooseJson(await fsp.readFile(sourcePath, 'utf8'), `${definition.abbreviation}.json`);
    const sourceRoot = Object.keys(source)[0];
    const chapters = source[sourceRoot] || {};
    const book = {
      ...definition,
      chapterCount: Number(chapterCounts[definition.abbreviation] || 0),
      source: path.relative(projectRoot, sourcePath).split(path.sep).join('/'),
    };
    books.push(book);

    for (const [chapterReference, chapterRows] of Object.entries(chapters)) {
      const chapter = Number(chapterReference.split('|').at(-1));
      for (const [reference, translations] of Object.entries(chapterRows)) {
        if (Number(reference.split('|')[1]) !== chapter) continue;
        const verse = bibleVerseFromRow({ ...book, chapter }, reference, translations);
        if (!verse.text) continue;
        const verseKey = `${book.id}|${chapter}|${verse.number}`;
        if (verseKeys.has(verseKey)) {
          duplicateVerses.push(verseKey);
          continue;
        }
        verseKeys.add(verseKey);
        verses.push({ ...verse, bookId: book.id, bookOrder: book.order, chapter, source: book.source });
      }
    }
  }

  books.sort((left, right) => left.order - right.order);
  verses.sort((left, right) => left.bookOrder - right.bookOrder || left.chapter - right.chapter || left.number - right.number);
  const johnOne = verses.filter((verse) => verse.bookId === 'JHN' && verse.chapter === 1);
  const sample = {
    translation: 'KJV',
    source: 'Data/strongs/kjv-HG num/Jhn.json',
    licenseStatus: 'needs-review',
    book: 'John',
    chapter: 1,
    verses: johnOne.map(({ number, reference, text, strongs, translations }) => ({ number, reference, text, strongs, translations })),
  };
  await fsp.mkdir(fallbackRoot, { recursive: true });
  await fsp.writeFile(bibleOutputPath, `${JSON.stringify(sample, null, 2)}\n`);
  return { translation: 'KJV', licenseStatus: 'needs-review', books, verses, sample, duplicateVerses };
}

async function buildContentDatabase(files, groupStats, bible, lexicon, originalLanguage) {
  await fsp.mkdir(outputRoot, { recursive: true });
  const SQL = await initSqlJs({ locateFile: (fileName) => path.join(path.dirname(require.resolve('sql.js')), fileName) });
  const database = new SQL.Database();
  database.run(`
     PRAGMA user_version = 5;
    CREATE TABLE database_meta (key TEXT PRIMARY KEY, value TEXT NOT NULL);
    CREATE TABLE source_groups (
      name TEXT PRIMARY KEY,
      file_count INTEGER NOT NULL,
      total_bytes INTEGER NOT NULL
    );
    CREATE TABLE source_assets (
      id INTEGER PRIMARY KEY,
      path TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      group_name TEXT NOT NULL,
      category TEXT NOT NULL,
      type TEXT NOT NULL,
      extension TEXT NOT NULL,
      size_bytes INTEGER NOT NULL,
      previewable INTEGER NOT NULL,
      review_status TEXT NOT NULL
    );
    CREATE INDEX source_assets_path_idx ON source_assets(path);
    CREATE INDEX source_assets_group_idx ON source_assets(group_name);
    CREATE INDEX source_assets_category_idx ON source_assets(category);
    CREATE TABLE bible_books (
      book_id TEXT PRIMARY KEY,
      book_name TEXT NOT NULL,
      abbreviation TEXT NOT NULL,
      book_order INTEGER NOT NULL,
      chapter_count INTEGER NOT NULL,
      source_version TEXT NOT NULL,
      license_status TEXT NOT NULL
    );
    CREATE TABLE bible_verses (
      translation_id TEXT NOT NULL,
      book_id TEXT NOT NULL,
      chapter_number INTEGER NOT NULL,
      verse_number INTEGER NOT NULL,
      canonical_reference TEXT NOT NULL,
      text TEXT NOT NULL,
      strongs_json TEXT NOT NULL,
      translations_json TEXT NOT NULL,
      source_version TEXT NOT NULL,
      license_status TEXT NOT NULL,
      PRIMARY KEY (translation_id, book_id, chapter_number, verse_number)
    );
    CREATE INDEX bible_reference_idx ON bible_verses(canonical_reference);
    CREATE TABLE bible_verse_strongs (
      translation_id TEXT NOT NULL,
      strong_number TEXT NOT NULL,
      book_id TEXT NOT NULL,
      chapter_number INTEGER NOT NULL,
      verse_number INTEGER NOT NULL,
      canonical_reference TEXT NOT NULL,
      PRIMARY KEY (translation_id, strong_number, book_id, chapter_number, verse_number),
      FOREIGN KEY (translation_id, book_id, chapter_number, verse_number)
        REFERENCES bible_verses(translation_id, book_id, chapter_number, verse_number)
    );
    CREATE INDEX bible_verse_strongs_number_idx ON bible_verse_strongs(strong_number);
    CREATE INDEX bible_verse_strongs_reference_idx ON bible_verse_strongs(book_id, chapter_number, verse_number);
    CREATE TABLE lexicon_entries (
      strong_number TEXT PRIMARY KEY,
      language TEXT NOT NULL,
      lemma TEXT,
      transliteration TEXT,
      kjv_definition TEXT,
      strongs_definition TEXT,
      derivation TEXT,
      source TEXT NOT NULL,
      license_status TEXT NOT NULL
    );
    CREATE INDEX lexicon_language_idx ON lexicon_entries(language);
    CREATE TABLE vines_entries (
      entry_id INTEGER PRIMARY KEY,
      title TEXT NOT NULL,
      keywords_json TEXT NOT NULL,
      page INTEGER,
      language TEXT,
      definition TEXT NOT NULL,
      sections_json TEXT NOT NULL,
      source TEXT NOT NULL,
      license_status TEXT NOT NULL
    );
    CREATE TABLE vines_terms (
      entry_id INTEGER NOT NULL,
      strong_number TEXT NOT NULL,
      language TEXT,
      original TEXT,
      transliteration TEXT,
      part_of_speech TEXT,
      gloss TEXT,
      PRIMARY KEY (entry_id, strong_number),
      FOREIGN KEY (entry_id) REFERENCES vines_entries(entry_id)
    );
    CREATE INDEX vines_terms_strong_idx ON vines_terms(strong_number);
    CREATE TABLE original_language_alignments (
      strong_number TEXT NOT NULL,
      corpus TEXT NOT NULL,
      lemma TEXT,
      transliteration TEXT,
      morphology_json TEXT NOT NULL,
      gloss TEXT,
      occurrence_count INTEGER NOT NULL,
      source TEXT NOT NULL,
      license_status TEXT NOT NULL,
      PRIMARY KEY (strong_number, corpus)
    );
    CREATE INDEX original_language_alignments_strong_idx ON original_language_alignments(strong_number);
  `);

  const metadata = [
    ['database_version', '5'],
    ['content_version', contentVersion],
    ['generated_from', 'Data'],
    ['source_asset_count', String(files.length)],
    ['source_asset_bytes', String(files.reduce((sum, file) => sum + file.sizeBytes, 0))],
    ['bible_translation', bible.translation],
    ['bible_book_count', String(bible.books.length)],
    ['bible_verse_count', String(bible.verses.length)],
    ['bible_verse_strong_count', String(bible.verses.reduce((sum, verse) => sum + new Set(verse.strongs).size, 0))],
    ['bible_sample', `${bible.translation}:${bible.sample.book} ${bible.sample.chapter}`],
    ['lexicon_entry_count', String(lexicon.strongs.length)],
    ['vines_entry_count', String(lexicon.vines.length)],
    ['bhsa_alignment_count', String(originalLanguage.filter((entry) => entry.corpus === 'BHSA').length)],
    ['n1904_alignment_count', String(originalLanguage.filter((entry) => entry.corpus === 'N1904').length)],
    ['original_language_alignment_count', String(originalLanguage.length)],
  ];
  const metadataStatement = database.prepare('INSERT INTO database_meta (key, value) VALUES (?, ?)');
  for (const row of metadata) metadataStatement.run(row);
  metadataStatement.free();

  const groupStatement = database.prepare('INSERT INTO source_groups (name, file_count, total_bytes) VALUES (?, ?, ?)');
  for (const group of [...groupStats.values()].sort((left, right) => left.name.localeCompare(right.name))) {
    groupStatement.run([group.name, group.files, group.bytes]);
  }
  groupStatement.free();

  const assetStatement = database.prepare(`INSERT INTO source_assets
    (id, path, name, group_name, category, type, extension, size_bytes, previewable, review_status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
  files.forEach((file, index) => assetStatement.run([
    index + 1,
    file.path,
    file.name,
    file.group,
    file.category,
    file.type,
    file.extension,
    file.sizeBytes,
    file.previewable ? 1 : 0,
    file.reviewStatus,
  ]));
  assetStatement.free();

  const bookStatement = database.prepare(`INSERT INTO bible_books
    (book_id, book_name, abbreviation, book_order, chapter_count, source_version, license_status)
    VALUES (?, ?, ?, ?, ?, ?, ?)`);
  bible.books.forEach((book) => bookStatement.run([
    book.id,
    book.name,
    book.abbreviation,
    book.order,
    book.chapterCount,
    book.source,
    bible.licenseStatus,
  ]));
  bookStatement.free();

  const verseStatement = database.prepare(`INSERT INTO bible_verses
    (translation_id, book_id, chapter_number, verse_number, canonical_reference, text, strongs_json, translations_json, source_version, license_status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
  bible.verses.forEach((verse) => verseStatement.run([
    bible.translation,
    verse.bookId,
    verse.chapter,
    verse.number,
    verse.reference,
    verse.text,
    JSON.stringify(verse.strongs),
    JSON.stringify(verse.translations),
    verse.source,
    bible.licenseStatus,
  ]));
  verseStatement.free();

  const verseStrongStatement = database.prepare(`INSERT INTO bible_verse_strongs
    (translation_id, strong_number, book_id, chapter_number, verse_number, canonical_reference)
    VALUES (?, ?, ?, ?, ?, ?)`);
  bible.verses.forEach((verse) => {
    [...new Set(verse.strongs.map((strongNumber) => String(strongNumber).toUpperCase()))]
      .filter((strongNumber) => /^[GH]\d+$/.test(strongNumber))
      .forEach((strongNumber) => verseStrongStatement.run([
        bible.translation,
        strongNumber,
        verse.bookId,
        verse.chapter,
        verse.number,
        verse.reference,
      ]));
  });
  verseStrongStatement.free();

  const lexiconStatement = database.prepare(`INSERT INTO lexicon_entries
    (strong_number, language, lemma, transliteration, kjv_definition, strongs_definition, derivation, source, license_status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`);
  lexicon.strongs.forEach((entry) => lexiconStatement.run([
    entry.strongNumber,
    entry.language,
    entry.lemma,
    entry.transliteration,
    entry.kjvDefinition,
    entry.strongsDefinition,
    entry.derivation,
    entry.source,
    entry.licenseStatus,
  ]));
  lexiconStatement.free();

  const vinesEntryStatement = database.prepare(`INSERT INTO vines_entries
    (entry_id, title, keywords_json, page, language, definition, sections_json, source, license_status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`);
  lexicon.vines.forEach((entry) => vinesEntryStatement.run([
    entry.id,
    entry.title,
    JSON.stringify(entry.keywords),
    entry.page,
    entry.language,
    entry.definition,
    JSON.stringify(entry.sections),
    entry.source,
    entry.licenseStatus,
  ]));
  vinesEntryStatement.free();

  const vinesTermStatement = database.prepare(`INSERT INTO vines_terms
    (entry_id, strong_number, language, original, transliteration, part_of_speech, gloss)
    VALUES (?, ?, ?, ?, ?, ?, ?)`);
  lexicon.vinesTerms.forEach((term) => vinesTermStatement.run([
    term.entryId,
    term.strongNumber,
    term.language,
    term.original,
    term.transliteration,
    term.partOfSpeech,
    term.gloss,
  ]));
  vinesTermStatement.free();

  const originalLanguageStatement = database.prepare(`INSERT INTO original_language_alignments
    (strong_number, corpus, lemma, transliteration, morphology_json, gloss, occurrence_count, source, license_status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`);
  originalLanguage.forEach((entry) => originalLanguageStatement.run([
    entry.strongNumber,
    entry.corpus,
    entry.lemma,
    entry.transliteration,
    JSON.stringify(entry.morphology),
    entry.gloss,
    entry.occurrenceCount,
    entry.source,
    entry.licenseStatus,
  ]));
  originalLanguageStatement.free();

  try {
    database.run('CREATE VIRTUAL TABLE source_assets_fts USING fts5(path, name, group_name, category, type, content=source_assets, content_rowid=id)');
    database.run('INSERT INTO source_assets_fts (rowid, path, name, group_name, category, type) SELECT id, path, name, group_name, category, type FROM source_assets');
  } catch {
    database.run('CREATE TABLE source_assets_fts (path TEXT, name TEXT, group_name TEXT, category TEXT, type TEXT)');
    database.run('INSERT INTO source_assets_fts SELECT path, name, group_name, category, type FROM source_assets');
  }

  const exported = database.export();
  database.close();
  await fsp.writeFile(databasePath, Buffer.from(exported));
}

async function main() {
  if (!fs.existsSync(dataRoot)) {
    if (!fs.existsSync(databasePath) || !fs.existsSync(bibleOutputPath)) {
      throw new Error(`Missing data directory and checked-in runtime database: ${dataRoot}`);
    }
    console.log('Data directory not present; preserving the checked-in runtime database and Bible fallback sample.');
    return;
  }
  const fullPaths = await walk(dataRoot);
  const files = [];
  const groupStats = new Map();

  for (const fullPath of fullPaths) {
    const stats = await fsp.stat(fullPath);
    const relativePath = path.relative(dataRoot, fullPath).split(path.sep).join('/');
    const extension = path.extname(fullPath).toLowerCase();
    const pathParts = relativePath.split('/');
    const group = pathParts.length > 1 ? pathParts[0] : 'root';
    const category = categoryFor(extension);
    const entry = {
      path: relativePath,
      name: path.basename(fullPath),
      group,
      category,
      type: displayType(category, extension),
      extension: extension || '[none]',
      sizeBytes: stats.size,
      previewable: previewable.has(extension),
      reviewStatus: /(^|\/)(license|readme|.*license.*|.*readme.*)(\.[^/]*)?$/i.test(relativePath) ? 'source-notice' : 'needs-review',
    };
    files.push(entry);
    const current = groupStats.get(group) || { name: group, files: 0, bytes: 0 };
    current.files += 1;
    current.bytes += stats.size;
    groupStats.set(group, current);
  }

  files.sort((left, right) => left.path.localeCompare(right.path));
  const bible = await buildBibleCorpus();
  const lexicon = await buildResearchLexicon();
  const originalLanguage = buildOriginalLanguageAlignments();
  await buildContentDatabase(files, groupStats, bible, lexicon, originalLanguage);
  await fsp.writeFile(licenseManifestPath, `${JSON.stringify(buildLicenseManifest(files), null, 2)}\n`, 'utf8');
  if (bible.duplicateVerses.length > 0) console.warn(`Skipped ${bible.duplicateVerses.length} duplicate Bible verse rows: ${bible.duplicateVerses.slice(0, 5).join(', ')}`);
  console.log(`Indexed ${files.length} Data assets, ${bible.books.length} Bible books / ${bible.verses.length} verses, ${lexicon.strongs.length} Strong's entries, ${lexicon.vines.length} Vine's entries, and ${originalLanguage.length} original-language alignments into ${path.relative(projectRoot, databasePath)}.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
