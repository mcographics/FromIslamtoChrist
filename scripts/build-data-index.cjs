const fs = require('node:fs');
const fsp = require('node:fs/promises');
const path = require('node:path');

const projectRoot = path.resolve(__dirname, '..');
const dataRoot = path.join(projectRoot, 'Data');
const outputRoot = path.join(projectRoot, 'src', 'data');
const assetIndexPath = path.join(outputRoot, 'data-index.json');
const bibleSourcePath = path.join(dataRoot, 'strongs', 'kjv-HG num', 'Jhn.json');
const bibleOutputPath = path.join(outputRoot, 'bible-john.json');

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

  await fsp.writeFile(bibleOutputPath, `${JSON.stringify({
    translation: 'KJV',
    source: 'Data/strongs/kjv-HG num/Jhn.json',
    licenseStatus: 'needs-review',
    book: 'John',
    chapter: 1,
    verses,
  }, null, 2)}\n`);
}

async function main() {
  await fsp.mkdir(outputRoot, { recursive: true });
  if (!fs.existsSync(dataRoot)) {
    if (!fs.existsSync(assetIndexPath) || !fs.existsSync(bibleOutputPath)) {
      throw new Error(`Missing data directory and checked-in runtime data: ${dataRoot}`);
    }
    console.log('Data directory not present; preserving the checked-in runtime catalog and John 1 sample.');
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
  await fsp.writeFile(assetIndexPath, `${JSON.stringify({
    generatedFrom: 'Data',
    totalFiles: files.length,
    totalBytes: files.reduce((sum, file) => sum + file.sizeBytes, 0),
    groups: [...groupStats.values()].sort((left, right) => left.name.localeCompare(right.name)),
    files,
  }, null, 2)}\n`);
  await buildBibleSample();
  console.log(`Indexed ${files.length} Data assets and generated the John 1 runtime sample.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
