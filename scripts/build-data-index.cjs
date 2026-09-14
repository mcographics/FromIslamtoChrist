const fs = require('node:fs');
const fsp = require('node:fs/promises');
const path = require('node:path');
const initSqlJs = require('sql.js');

const projectRoot = path.resolve(__dirname, '..');
const dataRoot = path.join(projectRoot, 'Data');
const outputRoot = path.join(projectRoot, 'public', 'data');
const fallbackRoot = path.join(projectRoot, 'src', 'data');
const databasePath = path.join(outputRoot, 'from-darkness-to-light.db');
const bibleRoot = path.join(dataRoot, 'strongs', 'kjv-HG num');
const bibleBooksPath = path.join(bibleRoot, 'books.json');
const bibleChapterCountPath = path.join(bibleRoot, 'chapter_count.json');
const bibleOutputPath = path.join(fallbackRoot, 'bible-john.json');
const contentVersion = process.env.npm_package_version || '0.1.5';

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

async function buildContentDatabase(files, groupStats, bible) {
  await fsp.mkdir(outputRoot, { recursive: true });
  const SQL = await initSqlJs({ locateFile: (fileName) => path.join(path.dirname(require.resolve('sql.js')), fileName) });
  const database = new SQL.Database();
  database.run(`
    PRAGMA user_version = 2;
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
  `);

  const metadata = [
    ['database_version', '2'],
    ['content_version', contentVersion],
    ['generated_from', 'Data'],
    ['source_asset_count', String(files.length)],
    ['source_asset_bytes', String(files.reduce((sum, file) => sum + file.sizeBytes, 0))],
    ['bible_translation', bible.translation],
    ['bible_book_count', String(bible.books.length)],
    ['bible_verse_count', String(bible.verses.length)],
    ['bible_sample', `${bible.translation}:${bible.sample.book} ${bible.sample.chapter}`],
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
  await buildContentDatabase(files, groupStats, bible);
  if (bible.duplicateVerses.length > 0) console.warn(`Skipped ${bible.duplicateVerses.length} duplicate Bible verse rows: ${bible.duplicateVerses.slice(0, 5).join(', ')}`);
  console.log(`Indexed ${files.length} Data assets and ${bible.books.length} Bible books / ${bible.verses.length} verses into ${path.relative(projectRoot, databasePath)}.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
