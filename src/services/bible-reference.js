const BOOK_ALIASES = {
  ps: 'psalms',
  psalm: 'psalms',
  pslm: 'psalms',
  prov: 'proverbs',
  pr: 'proverbs',
  song: 'song of songs',
  sos: 'song of songs',
  mt: 'matthew',
  matt: 'matthew',
  mk: 'mark',
  mrk: 'mark',
  lk: 'luke',
  ac: 'acts',
  ro: 'romans',
  rom: 'romans',
  jn: 'john',
  joh: 'john',
  '1 sam': '1 samuel',
  '2 sam': '2 samuel',
  '1 sa': '1 samuel',
  '2 sa': '2 samuel',
  '1 k': '1 kings',
  '2 k': '2 kings',
  '1 ki': '1 kings',
  '2 ki': '2 kings',
  '1 kgs': '1 kings',
  '2 kgs': '2 kings',
  '1 chr': '1 chronicles',
  '2 chr': '2 chronicles',
  '1 ch': '1 chronicles',
  '2 ch': '2 chronicles',
  '1 cor': '1 corinthians',
  '2 cor': '2 corinthians',
  '1 co': '1 corinthians',
  '2 co': '2 corinthians',
  '1 th': '1 thessalonians',
  '2 th': '2 thessalonians',
  '1 thess': '1 thessalonians',
  '2 thess': '2 thessalonians',
  '1 tim': '1 timothy',
  '2 tim': '2 timothy',
  '1 ti': '1 timothy',
  '2 ti': '2 timothy',
  '1 pet': '1 peter',
  '2 pet': '2 peter',
  '1 pe': '1 peter',
  '2 pe': '2 peter',
  '1 pt': '1 peter',
  '2 pt': '2 peter',
  '1 jn': '1 john',
  '2 jn': '2 john',
  '3 jn': '3 john',
  '1 jo': '1 john',
  '2 jo': '2 john',
  '3 jo': '3 john',
  '1jn': '1 john',
  '2jn': '2 john',
  '3jn': '3 john',
  ga: 'galatians',
  eph: 'ephesians',
  php: 'philippians',
  phil: 'philippians',
  col: 'colossians',
  he: 'hebrews',
  heb: 'hebrews',
  jm: 'james',
  jas: 'james',
  '1pe': '1 peter',
  '2pe': '2 peter',
  '1pt': '1 peter',
  '2pt': '2 peter',
  rev: 'revelation',
  re: 'revelation',
};

function normalizeBookName(name) {
  const normalized = String(name || '').trim().toLowerCase().replace(/[.’']/g, '').replace(/\s+/g, ' ');
  return BOOK_ALIASES[normalized] || normalized;
}

export function findBibleBook(name, books = []) {
  const normalizedName = normalizeBookName(name);
  return books.find((candidate) => [candidate.name, candidate.abbreviation, candidate.id]
    .some((candidateName) => normalizeBookName(candidateName) === normalizedName));
}

export function resolveBibleReference(reference, books = []) {
  const match = String(reference || '').trim().match(/^(.+?)\s+(\d+)(?::\d+(?:\s*[-–]\s*(?:\d+:)?\d+)?)?$/);
  if (!match) return null;

  const book = findBibleBook(match[1], books);
  const chapter = Number(match[2]);
  if (!book || !Number.isInteger(chapter) || chapter < 1 || (book.chapterCount && chapter > book.chapterCount)) return null;
  return { bookId: book.id, chapter };
}
