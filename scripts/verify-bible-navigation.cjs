const assert = require('node:assert/strict');
const fs = require('node:fs');
const { pathToFileURL } = require('node:url');

async function main() {
  const { findBibleBook, resolveBibleReference } = await import(pathToFileURL(`${process.cwd()}\\src\\services\\bible-reference.js`).href);
  const books = [
    { id: 'PSA', name: 'Psalms', abbreviation: 'Ps', chapterCount: 150 },
    { id: 'JHN', name: 'John', abbreviation: 'Jhn', chapterCount: 21 },
    { id: 'ROM', name: 'Romans', abbreviation: 'Rom', chapterCount: 16 },
    { id: '1CO', name: '1 Corinthians', abbreviation: '1 Cor', chapterCount: 16 },
    { id: '1TH', name: '1 Thessalonians', abbreviation: '1 Th', chapterCount: 5 },
    { id: '1KI', name: '1 Kings', abbreviation: '1 Ki', chapterCount: 22 },
    { id: '1TI', name: '1 Timothy', abbreviation: '1 Ti', chapterCount: 6 },
    { id: '1PE', name: '1 Peter', abbreviation: '1 Pe', chapterCount: 5 },
    { id: '1JO', name: '1 John', abbreviation: '1 Jo', chapterCount: 5 },
    { id: 'REV', name: 'Revelation', abbreviation: 'Rev', chapterCount: 22 },
  ];

  const referenceCases = [
    ['John 1:1', { bookId: 'JHN', chapter: 1 }],
    ['Jn 3:16', { bookId: 'JHN', chapter: 3 }],
    ['Rom 8', { bookId: 'ROM', chapter: 8 }],
    ['1 Cor 13:4-7', { bookId: '1CO', chapter: 13 }],
    ['1 Co 13:4-7', { bookId: '1CO', chapter: 13 }],
    ['1 Th 5:16', { bookId: '1TH', chapter: 5 }],
    ['1 Ti 4:12', { bookId: '1TI', chapter: 4 }],
    ['1 Pet 2:24', { bookId: '1PE', chapter: 2 }],
    ['1 Jn 4:9', { bookId: '1JO', chapter: 4 }],
    ['1 Kgs 18:21', { bookId: '1KI', chapter: 18 }],
    ['Ps 119:105', { bookId: 'PSA', chapter: 119 }],
    ['Rev 22:21', { bookId: 'REV', chapter: 22 }],
  ];

  for (const [reference, expected] of referenceCases) {
    assert.deepEqual(resolveBibleReference(reference, books), expected, `Reference should resolve: ${reference}`);
  }

  assert.equal(findBibleBook('JHN', books)?.id, 'JHN', 'Database book IDs should resolve.');
  assert.equal(findBibleBook('john', books)?.id, 'JHN', 'Canonical names should resolve.');
  assert.equal(findBibleBook('Jhn', books)?.id, 'JHN', 'Database abbreviations should resolve.');
  assert.equal(resolveBibleReference('John 22:1', books), null, 'Chapter numbers beyond a book must be rejected.');
  assert.equal(resolveBibleReference('Unknown 1:1', books), null, 'Unknown books must be rejected.');
  assert.equal(resolveBibleReference('John', books), null, 'A book without a chapter must not be treated as a location.');

  const appSource = fs.readFileSync(`${process.cwd()}\\src\\App.jsx`, 'utf8');
  const stylesSource = fs.readFileSync(`${process.cwd()}\\src\\styles.css`, 'utf8');
  assert.match(appSource, /reader-translation-control[\s\S]*reader-translation-button[\s\S]*reader-tone-button/, 'The Bible reader must place the Translation button before the reading-tone control.');
  assert.match(appSource, /BUNDLED_BIBLE_LANGUAGE_IDS\.includes\(option\.id\)/, 'The Translation menu must identify bundled Bible text.');
  assert.match(appSource, /updateReaderPreference\('translation', option\.id\)/, 'The Translation menu must update the selected Bible text.');
  assert.match(stylesSource, /\.reader-translation-menu\s*\{/, 'The Translation menu must have a dedicated reader layout.');

  console.log(`Bible navigation verified: ${referenceCases.length} references, canonical/abbreviated book lookup, invalid-location guards, and the reader Translation control passed.`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
