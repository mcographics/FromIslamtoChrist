const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const projectRoot = path.resolve(__dirname, '..');
const appSource = fs.readFileSync(path.join(projectRoot, 'src', 'App.jsx'), 'utf8');

function panelSource(panelName, nextMarker) {
  const start = appSource.indexOf(`function ${panelName}`);
  assert.ok(start >= 0, `Missing ${panelName}.`);
  const end = appSource.indexOf(nextMarker, start);
  assert.ok(end > start, `Could not determine the end of ${panelName}.`);
  return appSource.slice(start, end);
}

function main() {
  const audioPanel = panelSource('AudioReaderPanel', 'function Bible(');
  const localReadAloud = panelSource('LocalReadAloud', 'function Prayer(');

  assert.match(audioPanel, /useState\(verses\[0\]\?\.number \|\| null\)/, 'Audio must initialize its current verse from the first loaded verse.');
  assert.match(audioPanel, /setCurrentVerseNumber\(verses\[0\]\?\.number \|\| null\)/, 'Audio must refresh its current verse when the chapter payload changes.');
  assert.match(audioPanel, /\[book\?\.id, chapter, translation\?\.id, verses\?\.length, speechSupported, useNativeSpeech\]/, 'Audio chapter state must react when verses arrive after loading.');
  assert.match(audioPanel, /setCurrentVerseNumber\(verse\.number\)/, 'Audio must move the current-verse indicator before each verse is spoken.');
  assert.match(audioPanel, /<strong aria-live="polite">\{book\?\.name\} \{chapter\}:\{currentVerseNumber \|\| '—'\}<\/strong>/, 'The current verse indicator must be announced accessibly without adding verse-number speech text.');
  assert.match(audioPanel, /text: verseText\(verse\)/, 'Android TTS must speak the verse text without a generated verse announcement.');
  assert.match(localReadAloud, /text: spokenText/, 'Shared study read-aloud must send the translated study text to the local voice.');

  console.log('Audio state verified: loaded chapters initialize Current verse, playback advances it per verse, Android speaks verse text without extra verse announcements, and the indicator is live for assistive technology.');
}

try {
  main();
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
