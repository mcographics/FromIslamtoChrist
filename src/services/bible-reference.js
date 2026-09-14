export function resolveBibleReference(reference, books = []) {
  const match = String(reference || '').trim().match(/^(.+?)\s+(\d+)(?::\d+(?:[-–]\d+)?)?$/);
  if (!match) return null;

  const normalizeBookName = (name) => {
    const normalized = String(name || '').trim().toLowerCase().replace(/[.’']/g, '').replace(/\s+/g, ' ');
    return normalized === 'psalm' || normalized === 'ps' ? 'psalms' : normalized;
  };
  const book = books.find((candidate) => normalizeBookName(candidate.name) === normalizeBookName(match[1]));
  const chapter = Number(match[2]);
  if (!book || !Number.isInteger(chapter) || chapter < 1 || (book.chapterCount && chapter > book.chapterCount)) return null;
  return { bookId: book.id, chapter };
}
