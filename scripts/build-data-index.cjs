const fs = require('node:fs');
const fsp = require('node:fs/promises');
const path = require('node:path');
const initSqlJs = require('sql.js');

const projectRoot = path.resolve(__dirname, '..');
const dataRoot = path.join(projectRoot, 'Data');
const outputRoot = path.join(projectRoot, 'public', 'data');
const fallbackRoot = path.join(projectRoot, 'src', 'data');
const databasePath = path.join(outputRoot, 'from-darkness-to-light.db');
const bibleSourcePath = path.join(dataRoot, 'strongs', 'kjv-HG num', 'Jhn.json');
const bibleOutputPath = path.join(fallbackRoot, 'bible-john.json');
const contentVersion = process.env.npm_package_version || '0.1.3';

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
    .replace(/\[[A-Z]\d+\]/g, '')
    .replace(/<\/?em>/g, '')
    .replace(/\s+([,.;:!?])/g, '$1')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

async function buildBibleSample() {
  const source = JSON.parse(await fsp.readFile(bibleSourcePath, 'utf8'));
  const chapter = source.Jhn['Jhn|1'];
  const verses = Object.entries(chapter).map(([reference, translations]) => {
    const number = Number(reference.split('|').at(-1));
    const rawEnglish = translations.en || '';
    return {
      number,
      reference: `John 1:${number}`,
      text: cleanBibleText(rawEnglish),
      strongs: [...rawEnglish.matchAll(/\[([A-Z]\d+)\]/g)].map((match) => match[1]),
      translations: {
        en: cleanBibleText(translations.en || ''),
        bg: translations.bg || null,
        ch: translations.ch || null,
        sp: translations.sp || null,
      },
    };
  });

  const sample = {
    translation: 'KJV',
    source: 'Data/strongs/kjv-HG num/Jhn.json',
    licenseStatus: 'needs-review',
    book: 'John',
    chapter: 1,
    verses,
  };
  await fsp.mkdir(fallbackRoot, { recursive: true });
  await fsp.writeFile(bibleOutputPath, `${JSON.stringify(sample, null, 2)}\n`);
  return sample;
}

async function buildContentDatabase(files, groupStats, bibleSample) {
  await fsp.mkdir(outputRoot, { recursive: true });
  const SQL = await initSqlJs({ locateFile: (fileName) => path.join(path.dirname(require.resolve('sql.js')), fileName) });
  const database = new SQL.Database();
  database.run(`
    PRAGMA user_version = 1;
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
    ['database_version', '1'],
    ['content_version', contentVersion],
    ['generated_from', 'Data'],
    ['source_asset_count', String(files.length)],
    ['source_asset_bytes', String(files.reduce((sum, file) => sum + file.sizeBytes, 0))],
    ['bible_sample', `${bibleSample.translation}:${bibleSample.book} ${bibleSample.chapter}`],
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

  const verseStatement = database.prepare(`INSERT INTO bible_verses
    (translation_id, book_id, chapter_number, verse_number, canonical_reference, text, strongs_json, translations_json, source_version, license_status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
  bibleSample.verses.forEach((verse) => verseStatement.run([
    bibleSample.translation,
    'JHN',
    bibleSample.chapter,
    verse.number,
    verse.reference,
    verse.text,
    JSON.stringify(verse.strongs),
    JSON.stringify(verse.translations),
    bibleSample.source,
    bibleSample.licenseStatus,
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
    console.log('Data directory not present; preserving the checked-in runtime database and John 1 sample.');
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
  const bibleSample = await buildBibleSample();
  await buildContentDatabase(files, groupStats, bibleSample);
  console.log(`Indexed ${files.length} Data assets into ${path.relative(projectRoot, databasePath)} and generated the John 1 runtime sample.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
