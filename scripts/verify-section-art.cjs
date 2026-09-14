const fs = require('node:fs');
const path = require('node:path');

const projectRoot = path.resolve(__dirname, '..');
const requiredImages = [
  'public/images/generated/heroes/hero-darkness-to-light-desktop.webp',
  'public/images/generated/heroes/hero-darkness-to-light-mobile.webp',
  'public/images/generated/sections/bible-study.webp',
  'public/images/generated/sections/learn-questions.webp',
  'public/images/generated/sections/facts-info-research.webp',
  'public/images/generated/sections/journey-path.webp',
  'public/images/generated/sections/faith-next-step.webp',
  'public/images/generated/sections/study-focus.webp',
  'public/images/generated/sections/reading-plans.webp',
  'public/images/generated/sections/saved-reflections.webp',
  'public/images/generated/sections/prayer-journal.webp',
  'public/images/generated/sections/source-library.webp',
  'public/images/generated/sections/privacy-settings.webp',
  'public/images/generated/sections/audio-listening.png',
  'public/images/generated/sections/testimonies-scripture.png',
  'public/images/generated/sections/study-packs.png',
  'public/images/generated/sections/downloads-study-guides.png',
];

const missing = requiredImages.filter((relativePath) => {
  const absolutePath = path.join(projectRoot, relativePath);
  try {
    const stats = fs.statSync(absolutePath);
    return !stats.isFile() || stats.size === 0;
  } catch {
    return true;
  }
});

if (missing.length > 0) {
  console.error(`Section artwork verification failed: ${missing.length} required image(s) are missing or empty.`);
  missing.forEach((relativePath) => console.error(`- ${relativePath}`));
  process.exitCode = 1;
} else {
  console.log(`Section artwork verified: ${requiredImages.length} required hero/section images are present and non-empty.`);
}
