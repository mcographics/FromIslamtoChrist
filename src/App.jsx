import { useEffect, useMemo, useRef, useState } from 'react';
import { Capacitor, registerPlugin } from '@capacitor/core';
import bibleData from './data/bible-john.json';
import dailyVerseContent from './data/daily-verse-content';
import researchCapsules from './data/facts-info-capsules';
import factsInfoReadingPaths from './data/facts-info-reading-paths';
import guidedPrayers, { prayerBasics } from './data/prayer-content';
import journeyLessonContent from './data/journey-content';
import questionLibrary from './data/muslim-questions';
import newBelieverDays from './data/faith-content';
import studyFoci from './data/study-foci';
import discipleshipArticles from './data/discipleship-content';
import defaultSavedFolders from './data/saved-folders';
import readingPlans from './data/reading-plans';
import scriptureTestimonies from './data/scripture-testimonies';
import studyPacks from './data/study-packs';
import { LEGAL_APP_INFO, LEGAL_EXTERNAL_SERVICES, LEGAL_RIGHTS_SECTIONS, LEGAL_SOFTWARE_CREDITS, LEGAL_SOURCE_CREDITS, LEGAL_TERMS_SECTIONS } from './data/legal-information';
import { loadBibleChapter, loadChapterCrossReferences, loadContentDatabase, loadLexiconEntries, loadSavedBibleVerses, loadVerseOfTheDay, searchBibleVerses, searchLexiconEntries, searchResearchEntries } from './services/content-database';
import { findBibleBook, resolveBibleReference } from './services/bible-reference';
import {
  APP_VERSION,
  GITHUB_RELEASES_URL,
  checkForGitHubUpdate,
  downloadAndroidUpdate,
  getUpdatePlatform,
  installAndroidUpdate,
  openAndroidInstallSettings,
  openUpdateUrl,
} from './services/github-updates';
import { BUNDLED_BIBLE_LANGUAGE_IDS, getLanguageCopy, getLanguageOption, isRtlLanguage, LANGUAGE_OPTIONS } from './services/language';
import { clearAutomaticTranslationCache, getCachedAutomaticTranslation, requestAutomaticTranslation, setAutomaticTranslationOffline, startAutomaticTranslation } from './services/automatic-translation';

const PrivacyShield = registerPlugin('PrivacyShield');
const BiometricAuth = registerPlugin('BiometricAuth');
const LocalTextToSpeech = registerPlugin('LocalTextToSpeech');
const QuickClose = registerPlugin('QuickClose');

const navigation = [
  { id: 'home', label: 'Home', icon: 'home' },
  { id: 'bible', label: 'Bible', icon: 'book' },
  { id: 'learn', label: 'Learn', icon: 'learn' },
  { id: 'prayer', label: 'Prayer', icon: 'hands' },
  { id: 'journey', label: 'Journey', icon: 'journey' },
  { id: 'faith', label: 'Faith', icon: 'heart' },
  { id: 'saved', label: 'Saved', icon: 'bookmark' },
  { id: 'downloads', label: 'Downloads', icon: 'download' },
  { id: 'library', label: 'Library', icon: 'database' },
];

const sectionArt = {
  bible: { src: './images/generated/sections/bible-study.webp', alt: 'An open Bible resting on a warm study table in morning light.', label: 'Scripture reading and word study' },
  learn: { src: './images/generated/sections/learn-questions.webp', alt: 'Open books near a bright window in a quiet study.', label: 'Questions, foundations, and discovery' },
  factsInfo: { src: './images/generated/sections/facts-info-research.webp', alt: 'A Bible, research notebook, reference book, and magnifying glass beside a dawn-lit path.', label: 'Facts & Info guided research' },
  testimonies: { src: './images/generated/sections/testimonies-scripture.png', alt: 'An open Bible and journal beside a sunlit path through the hills.', label: 'Stories of people meeting God in Scripture' },
  studyPacks: { src: './images/generated/sections/study-packs.png', alt: 'A small stack of study cards, an open Bible, and a journal arranged beside a path toward warm light.', label: 'Practical offline study packs' },
  downloads: { src: './images/generated/sections/downloads-study-guides.png', alt: 'A stack of blank study guides, an open Bible, and a journal beside a dawn-lit path.', label: 'Private saved study guides' },
  journey: { src: './images/generated/sections/journey-path.webp', alt: 'A stone path through shaded hills toward a distant cross at sunrise.', label: 'A gentle path toward hope' },
  faith: { src: './images/generated/sections/faith-next-step.webp', alt: 'An open Bible and journal beside a path leading toward a distant sunrise and cross.', label: 'A new beginning with Jesus' },
  audio: { src: './images/generated/sections/audio-listening.png', alt: 'An open Bible and headphones in a quiet reading corner at sunrise.', label: 'Listen to Scripture with your device voice' },
  studyFocus: { src: './images/generated/sections/study-focus.webp', alt: 'An open Bible and journal beside a quiet path leading toward a warm sunrise.', label: 'A private next step in Scripture' },
  readingPlans: { src: './images/generated/sections/reading-plans.webp', alt: 'An open Bible and reading journal on a wooden table facing a sunrise path through the hills.', label: 'Guided Bible reading plans' },
  saved: { src: './images/generated/sections/saved-reflections.webp', alt: 'A bookmarked journal and candle on a quiet study desk.', label: 'Private reflections to return to' },
  prayer: { src: './images/generated/sections/prayer-journal.webp', alt: 'A prayer journal and candle beside a softly lit window.', label: 'Guided prayer and private reflection' },
  library: { src: './images/generated/sections/source-library.webp', alt: 'An organized Bible research desk with reference books and a magnifying glass.', label: 'Strong\'s, Vine\'s, facts, and information' },
  settings: { src: './images/generated/sections/privacy-settings.webp', alt: 'A closed notebook in a quiet alcove with a small pool of warm light.', label: 'Quiet boundaries and local privacy' },
};

const bibleTextOptions = LANGUAGE_OPTIONS;
const bundledBibleTextOptions = bibleTextOptions.filter((option) => BUNDLED_BIBLE_LANGUAGE_IDS.includes(option.id));
const BIBLE_CHAPTER_TIMEOUT_MS = 15000;

const researchCollections = [
  { id: 'strongs', group: 'strongs', label: "Strong's", icon: 'scroll', description: 'Greek and Hebrew dictionaries, mappings, and word-study data.' },
  { id: 'vines', group: 'vines', label: "Vine's", icon: 'book', description: 'New Testament word meanings and expository reference material.' },
  { id: 'facts-info', group: 'Facts & Info', label: 'Facts & Info', icon: 'info', description: 'Topical studies that add context to difficult questions.' },
  { id: 'bhsa', group: 'bhsa', label: 'BHS / Hebrew', icon: 'scroll', description: 'Hebrew alignment and morphology metadata for Bible word study.' },
  { id: 'n1904', group: 'n1904', label: 'NA / Greek', icon: 'book', description: 'Greek alignment metadata for careful New Testament word study.' },
];

const factsInfoPathHandoffs = [
  { pattern: /Allah_Ilah/i, pathId: 'begin-with-identity' },
  { pattern: /Jesus_the_True_God/i, pathId: 'meet-jesus' },
  { pattern: /Muhammad_and_the_Biblical_Test/i, pathId: 'test-prophetic-claims' },
  { pattern: /The_Case_for_Christ_Against_Quranic_Claims/i, pathId: 'cross-and-resurrection' },
];

const LEGAL_LINK_HOSTS = new Set([
  'github.com',
  'creativecommons.org',
  'doi.org',
  'zenodo.org',
  'opensource.org',
  'gnu.org',
  'www.gnu.org',
  'mymemory.translated.net',
  'centerblc.github.io',
  'annotation.github.io',
  'etcbc.github.io',
]);

function openLegalExternalLink(value) {
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || !LEGAL_LINK_HOSTS.has(url.hostname.toLowerCase())) return;
    if (typeof window !== 'undefined' && window.fromDarkness?.openExternal) {
      window.fromDarkness.openExternal(url.toString()).catch(() => undefined);
      return;
    }
    if (typeof window !== 'undefined') window.open(url.toString(), '_blank', 'noopener,noreferrer');
  } catch {
    // Static legal links are allow-listed above; malformed values remain inert.
  }
}

const articles = [
  {
    id: 'who-is-jesus',
    category: 'Jesus',
    title: 'Who is Jesus?',
    summary: 'Discover His life, teachings, and why He matters.',
    icon: 'sunrise',
    tone: 'gold',
    readTime: '6 min read',
    body: [
      'Jesus is not presented in the Christian Scriptures as an idea to master, but as a person to encounter. The Gospels invite you to look closely at His words, His compassion, His authority, and His call to follow Him.',
      'The first step does not require pretending that every question has already been answered. Read slowly, notice what Jesus says about God and about Himself, and bring honest questions with you.',
    ],
    references: ['John 1:1–5', 'John 1:14', 'John 20:28'],
  },
  {
    id: 'christianity-and-islam',
    category: 'Questions',
    title: 'Christianity and Islam',
    summary: 'Clear, respectful answers to common questions.',
    icon: 'dialogue',
    tone: 'blue',
    readTime: '8 min read',
    body: [
      'A thoughtful comparison begins by representing each tradition fairly. Christianity and Islam use some familiar words, but they do not always mean the same thing by God, revelation, sin, salvation, or Jesus.',
      'This section is designed to slow the conversation down. It separates what Christians believe, what Muslims commonly believe, and where the central differences actually are.',
    ],
    references: ['Mark 12:29', 'John 14:6', 'Ephesians 2:8–9'],
  },
  {
    id: 'bible-reliable',
    category: 'Bible',
    title: 'Is the Bible reliable?',
    summary: 'An introduction to manuscripts, transmission, and trust.',
    icon: 'scroll',
    tone: 'stone',
    readTime: '9 min read',
    body: [
      'The Bible is a collection of writings preserved through communities, manuscripts, translations, and careful comparison. Asking how the text was transmitted is a worthwhile question, not a threat to faith.',
      'A reliable study distinguishes the original languages, manuscript evidence, translation choices, and interpretation. It also makes room for uncertainty where the evidence is genuinely debated.',
    ],
    references: ['Luke 1:1–4', '2 Timothy 3:16–17', '1 Corinthians 15:3–8'],
  },
  {
    id: 'faith-basics',
    category: 'Foundations',
    title: 'Faith basics',
    summary: 'Understand the core beliefs of Christianity.',
    icon: 'sprout',
    tone: 'green',
    readTime: '7 min read',
    body: [
      'Christian faith is trust in God and His promises, centered on Jesus Christ. It is not the same as having no questions; it is a decision to keep seeking truth and to entrust yourself to the One you are coming to know.',
      'Grace, repentance, forgiveness, and new life belong together. They are not a pressure campaign or a performance score. They describe a relationship with God that begins with His initiative.',
    ],
    references: ['John 3:16', 'Romans 5:8', 'Ephesians 2:8–10'],
  },
  {
    id: 'how-to-pray',
    category: 'Practice',
    title: 'How do I pray?',
    summary: 'A simple beginning for talking with God.',
    icon: 'hands',
    tone: 'violet',
    readTime: '4 min read',
    body: [
      'Prayer can begin with honesty. You do not need special language or a perfect posture to speak to God. You can ask for help, confess what is true, give thanks, or simply say that you want to know Him.',
      'A short prayer is enough to begin: “God, show me what is true. Help me understand Jesus. Give me courage to follow what I learn.”',
    ],
    references: ['Matthew 6:9–13', 'Psalm 139:23–24', 'Hebrews 4:16'],
  },
  {
    id: 'family-and-fear',
    category: 'Life',
    title: 'What if my family finds out?',
    summary: 'Think carefully about safety, timing, and trusted support.',
    icon: 'shield',
    tone: 'slate',
    readTime: '6 min read',
    body: [
      'You do not have to make a public decision before you are ready, and you should not place yourself in avoidable danger. Take time to understand what you believe and consider the real circumstances around you.',
      'If you ever face threats, coercion, homelessness, or violence, seek qualified local safety support. This app cannot replace emergency services, professional safeguarding, or trusted in-person help.',
    ],
    references: ['Proverbs 22:3', 'Matthew 10:16', 'Psalm 46:1'],
  },
  {
    id: 'what-is-the-gospel',
    category: 'Foundations',
    title: 'What is the Gospel?',
    summary: 'Understand the good news Christians announce about Jesus.',
    icon: 'sunrise',
    tone: 'gold',
    readTime: '7 min read',
    body: [
      'Gospel means good news. Christianity announces that the holy God has acted in Jesus Christ to bring forgiveness, reconciliation, and new life—not because people have earned it, but because God is merciful and faithful.',
      'The good news is not simply advice to become a better person. It is a message about what God has done: Jesus died, was buried, and was raised, and He calls people to repent, trust Him, and follow Him. You can examine that announcement directly in the passages below.',
    ],
    references: ['Mark 1:14–15', '1 Corinthians 15:1–8', 'Romans 1:16', '2 Corinthians 5:17–21'],
  },
  {
    id: 'what-is-salvation',
    category: 'Foundations',
    title: 'What is salvation?',
    summary: 'Explore rescue from sin, reconciliation with God, and new life in Christ.',
    icon: 'gift',
    tone: 'green',
    readTime: '7 min read',
    body: [
      'In Christian language, salvation is God rescuing and restoring people who cannot repair their relationship with Him by effort alone. It includes forgiveness, reconciliation, freedom from sin’s rule, and the hope of life with God.',
      'Christians do not treat salvation as a score earned by religious performance. Good works matter as the fruit of a changed life, but grace comes first. The question is not whether you can make yourself worthy; it is whether you will receive God’s mercy in Jesus and begin to follow Him.',
    ],
    references: ['John 3:16–18', 'Ephesians 2:8–10', 'Titus 3:4–7', 'Acts 4:10–12'],
  },
  {
    id: 'what-is-grace',
    category: 'Foundations',
    title: 'What is grace?',
    summary: 'See why Christian grace is a gift rather than a wage.',
    icon: 'droplet',
    tone: 'blue',
    readTime: '6 min read',
    body: [
      'Grace is God’s undeserved kindness toward people who need mercy. It does not mean that sin is unimportant or that justice can be ignored. It means that God takes the initiative to forgive and restore through Jesus.',
      'Grace changes the direction of a life. A person who receives mercy is invited to become merciful, truthful, humble, and ready to turn away from what harms others. Christian obedience is a response to grace, not a purchase price for God’s love.',
    ],
    references: ['Romans 3:21–26', 'Romans 5:6–11', 'Ephesians 2:4–10', 'Titus 2:11–14'],
  },
  {
    id: 'why-did-jesus-die',
    category: 'Jesus',
    title: 'Why did Jesus die?',
    summary: 'A careful introduction to the Cross and Christian redemption.',
    icon: 'cross',
    tone: 'violet',
    readTime: '8 min read',
    body: [
      'The Cross is the center of the Christian Gospel. Christians believe Jesus willingly gave Himself for sinners, bearing the weight of judgment and opening the way for forgiveness and reconciliation with God.',
      'The Cross should not be reduced to a transaction detached from love. Jesus’ death is presented alongside His compassion, obedience, justice, and resurrection. Read the passages in context and distinguish the biblical witness from the many ways Christians explain its meaning theologically.',
    ],
    references: ['Mark 10:45', 'Isaiah 53:4–6', 'Romans 5:8', '1 Peter 2:24', '1 Corinthians 15:3–4'],
  },
  {
    id: 'how-to-read-the-bible',
    category: 'Practice',
    title: 'How do I read the Bible?',
    summary: 'A simple, honest method for reading Scripture in context.',
    icon: 'book',
    tone: 'blue',
    readTime: '6 min read',
    body: [
      'Begin with a manageable passage and ask what it actually says before asking what you want it to say. Notice who is speaking, who is listening, what happens before and after, and what kind of writing you are reading.',
      'Read repeatedly, compare related passages, and bring difficult questions into the open. The goal is not to collect isolated quotations but to understand the story of Scripture and how it points toward God’s character and Jesus. The Bible reader’s notes, highlights, and word-study tools can help you return to what you have seen.',
    ],
    references: ['Luke 24:27', 'Acts 17:10–12', '2 Timothy 3:16–17', '1 Thessalonians 5:21'],
  },
];

const allArticles = [...articles, ...discipleshipArticles, ...researchCapsules, ...questionLibrary, ...scriptureTestimonies];

const lessons = journeyLessonContent;

const fallbackVerses = bibleData.verses;

function stableVerseId(verse) {
  const bookSlug = verse.bookId === 'JHN' || verse.reference?.startsWith('John ') ? 'john' : (verse.bookId || verse.bookName || 'bible').toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const chapter = verse.chapter || Number(verse.reference?.match(/\s(\d+):/)?.[1] || 1);
  return `verse-${bookSlug}-${chapter}-${verse.number}`;
}

function Icon({ name, size = 20, strokeWidth = 1.8 }) {
  const paths = {
    home: <><path d="m3 10 9-7 9 7" /><path d="M5.5 9.5V21h13V9.5M9 21v-6h6v6" /></>,
    book: <><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5z" /><path d="M4 5.5v16M8 7h8M8 11h7" /></>,
    learn: <><path d="M4 5.5 12 3l8 2.5v13L12 21l-8-2.5z" /><path d="m4 5.5 8 2.5 8-2.5M12 8v13" /></>,
    journey: <><circle cx="5" cy="19" r="2" /><circle cx="19" cy="5" r="2" /><path d="M6.5 17.5 17.5 6.5M9 5h5M9 19h5" /></>,
    bookmark: <><path d="M6 3h12v18l-6-4-6 4z" /></>,
    menu: <><path d="M4 7h16M4 12h16M4 17h16" /></>,
    search: <><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 5 5" /></>,
    lock: <><rect x="4" y="10" width="16" height="11" rx="2" /><path d="M7 10V7a5 5 0 0 1 10 0v3" /></>,
    arrow: <><path d="M4 12h16M13 5l7 7-7 7" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    chevron: <path d="m9 5 7 7-7 7" />,
    back: <path d="m15 5-7 7 7 7M8 12h12" />,
    sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.65 17.65l1.42 1.42M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.65 6.35l1.42-1.42" /></>,
    moon: <path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5 8.5 8.5 0 1 0 20.5 14.5z" />,
    shield: <><path d="M12 3 20 6v5c0 5-3.3 8.5-8 10-4.7-1.5-8-5-8-10V6z" /><path d="m8.5 12 2.2 2.2 4.8-5" /></>,
    globe: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.4 2.5 3.5 5.5 3.5 9S14.4 18.5 12 21c-2.4-2.5-3.5-5.5-3.5-9S9.6 5.5 12 3z" /></>,
    users: <><circle cx="9" cy="8" r="3" /><path d="M3.5 20a5.5 5.5 0 0 1 11 0M16 5.5a3 3 0 0 1 0 5.9M17 14.5a5.5 5.5 0 0 1 3.5 5" /></>,
    droplet: <path d="M12 3S5.5 10.2 5.5 14.7A6.5 6.5 0 0 0 18.5 14.7C18.5 10.2 12 3 12 3Z" />,
    gift: <><path d="M4 10h16v11H4zM2.5 7h19v3h-19zM12 7v14M12 7H8.5A2.5 2.5 0 1 1 11 4.5C11 6 12 7 12 7Zm0 0h3.5A2.5 2.5 0 1 0 13 4.5C13 6 12 7 12 7Z" /></>,
    refresh: <><path d="M20 11a8 8 0 0 0-14.7-4L3 10M3 5v5h5M4 13a8 8 0 0 0 14.7 4L21 14M21 19v-5h-5" /></>,
    history: <><path d="M3 12a9 9 0 1 0 3-6.7" /><path d="M3 5v7h7M12 7v5l3 2" /></>,
    bell: <><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" /></>,
    info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></>,
    heart: <path d="M20.8 8.7c0 5.2-8.8 10.3-8.8 10.3S3.2 13.9 3.2 8.7A4.7 4.7 0 0 1 12 6a4.7 4.7 0 0 1 8.8 2.7z" />,
    dialogue: <><path d="M4 5.5h16v10H8l-4 4z" /><path d="M8 9h8M8 12h5" /></>,
    scroll: <><path d="M6 4h12v16H6a3 3 0 0 1 0-6h12" /><path d="M6 14h12M9 8h6M9 11h4" /></>,
    sprout: <><path d="M12 21v-9" /><path d="M12 12C7 12 4 9 4 4c5 0 8 3 8 8M12 15c0-5 3-8 8-8 0 5-3 8-8 8" /></>,
    hands: <><path d="M7 12V6a1.5 1.5 0 0 1 3 0v4M10 10V4.5a1.5 1.5 0 0 1 3 0V10M13 10V6a1.5 1.5 0 0 1 3 0v5M16 11V8.5a1.5 1.5 0 0 1 3 0V14c0 4-2.5 7-6.5 7H11c-2.5 0-4-1.2-5.5-3.2L3 14a1.7 1.7 0 0 1 2.8-2L7 13" /></>,
    compass: <><circle cx="12" cy="12" r="9" /><path d="m15.5 8.5-2.2 4.8-4.8 2.2 2.2-4.8z" /></>,
    play: <path d="m8 5 11 7-11 7z" />,
    download: <><path d="M12 3v12M7 11l5 5 5-5" /><path d="M5 20h14" /></>,
    share: <><circle cx="18" cy="5" r="2.5" /><circle cx="6" cy="12" r="2.5" /><circle cx="18" cy="19" r="2.5" /><path d="m8.2 10.8 7.6-4.5M8.2 13.2l7.6 4.5" /></>,
    pause: <><path d="M8 5v14M16 5v14" /></>,
    stop: <rect x="6" y="6" width="12" height="12" rx="1.5" />,
    headphones: <><path d="M4 14v-2a8 8 0 0 1 16 0v2" /><path d="M4 14h3v5H5a1 1 0 0 1-1-1zM20 14h-3v5h2a1 1 0 0 0 1-1z" /></>,
    close: <><path d="m6 6 12 12M18 6 6 18" /></>,
    focus: <><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" /></>,
    minimize: <><path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5" /></>,
    cross: <><path d="M12 3v18M5 10h14" /></>,
    sparkles: <><path d="m12 3 1.4 5.6L19 10l-5.6 1.4L12 17l-1.4-5.6L5 10l5.6-1.4z" /><path d="m19 16 .6 2.4L22 19l-2.4.6L19 22l-.6-2.4L16 19l2.4-.6z" /></>,
    database: <><ellipse cx="12" cy="5" rx="7.5" ry="2.5" /><path d="M4.5 5v7c0 1.4 3.4 2.5 7.5 2.5s7.5-1.1 7.5-2.5V5M4.5 12v7c0 1.4 3.4 2.5 7.5 2.5s7.5-1.1 7.5-2.5v-7" /><path d="M4.5 12c0 1.4 3.4 2.5 7.5 2.5s7.5-1.1 7.5-2.5" /></>,
  };

  return (
    <svg aria-hidden="true" className="icon" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      {paths[name] || paths.info}
    </svg>
  );
}

function readLocal(key, fallback) {
  try {
    const stored = window.localStorage.getItem(key);
    return stored === null ? fallback : JSON.parse(stored);
  } catch {
    return fallback;
  }
}

function readReaderPreferences() {
  const stored = readLocal('fdl-reader-preferences', {});
  const preferences = stored && typeof stored === 'object' && !Array.isArray(stored) ? { ...stored } : {};
  delete preferences.voiceGender;
  return {
    fontScale: 1,
    tone: 'default',
    ...preferences,
    translation: getLanguageOption(preferences.translation).id,
  };
}

function readSavedFolderState() {
  const stored = readLocal('fdl-saved-folders', null);
  if (!stored || typeof stored !== 'object') return { folders: defaultSavedFolders, assignments: {} };
  const folders = Array.isArray(stored.folders) && stored.folders.length > 0
    ? stored.folders.filter((folder) => folder && typeof folder.id === 'string' && typeof folder.label === 'string')
    : defaultSavedFolders;
  const assignments = stored.assignments && typeof stored.assignments === 'object' ? stored.assignments : {};
  return { folders: folders.length > 0 ? folders : defaultSavedFolders, assignments };
}

function readReadingPlanState() {
  const stored = readLocal('fdl-reading-plans', null);
  if (!stored || typeof stored !== 'object') return { selectedPlanId: readingPlans[0]?.id || null, completedByPlan: {} };
  const selectedPlanId = readingPlans.some((plan) => plan.id === stored.selectedPlanId) ? stored.selectedPlanId : readingPlans[0]?.id || null;
  const completedByPlan = stored.completedByPlan && typeof stored.completedByPlan === 'object'
    ? Object.fromEntries(Object.entries(stored.completedByPlan).filter(([planId, stepIds]) => readingPlans.some((plan) => plan.id === planId) && Array.isArray(stepIds)))
    : {};
  return { selectedPlanId, completedByPlan };
}

function readJourneyReflections() {
  const stored = readLocal('fdl-journey-reflections', {});
  if (!stored || typeof stored !== 'object' || Array.isArray(stored)) return {};
  return Object.fromEntries(Object.entries(stored).filter(([lessonId, reflection]) => {
    return lessons.some((lesson) => String(lesson.id) === String(lessonId))
      && reflection
      && typeof reflection === 'object'
      && typeof reflection.text === 'string';
  }));
}

function readBibleHistory() {
  const stored = readLocal('fdl-bible-history', []);
  if (!Array.isArray(stored)) return [];
  return stored.filter((entry) => entry && typeof entry.bookId === 'string' && Number(entry.chapter) > 0).slice(0, 8);
}

function readSavedStudyPacks() {
  const stored = readLocal('fdl-saved-study-packs', []);
  if (!Array.isArray(stored)) return [];
  return [...new Set(stored.filter((packId) => studyPacks.some((pack) => pack.id === packId)))];
}

function readDownloadedGuides() {
  const stored = readLocal('fdl-downloaded-guides', []);
  if (!Array.isArray(stored)) return [];
  return stored.filter((entry) => entry
    && typeof entry.id === 'string'
    && typeof entry.packId === 'string'
    && studyPacks.some((pack) => pack.id === entry.packId)
    && typeof entry.title === 'string'
    && typeof entry.content === 'string'
    && entry.content.trim()).slice(0, 12);
}

function readStudyPackProgress() {
  const stored = readLocal('fdl-study-pack-progress', {});
  if (!stored || typeof stored !== 'object' || Array.isArray(stored)) return {};
  return Object.fromEntries(Object.entries(stored).flatMap(([packId, resourceIds]) => {
    const pack = studyPacks.find((candidate) => candidate.id === packId);
    if (!pack || !Array.isArray(resourceIds)) return [];
    const validIds = [...new Set(resourceIds.filter((resourceId) => pack.resources.some((resource) => resource.id === resourceId)))];
    return validIds.length > 0 ? [[packId, validIds]] : [];
  }));
}

function readFactsPathProgress() {
  const stored = readLocal('fdl-facts-path-progress', {});
  if (!stored || typeof stored !== 'object' || Array.isArray(stored)) return {};
  return Object.fromEntries(Object.entries(stored).flatMap(([pathId, sectionTitles]) => {
    const path = factsInfoReadingPaths.find((candidate) => candidate.id === pathId);
    if (!path || !Array.isArray(sectionTitles)) return [];
    const validTitles = [...new Set(sectionTitles.filter((title) => path.readingSections.some((section) => section.title === title)))];
    return validTitles.length > 0 ? [[pathId, validTitles]] : [];
  }));
}

function readQuestionProgress() {
  const stored = readLocal('fdl-question-progress', []);
  if (!Array.isArray(stored)) return [];
  return [...new Set(stored.filter((questionId) => questionLibrary.some((question) => question.id === questionId)))];
}

function readFaithSelectedDay() {
  const stored = Number(readLocal('fdl-faith-selected-day', 0));
  if (newBelieverDays.some((day) => day.id === stored)) return stored;
  const faithProgress = readLocal('fdl-faith-progress', {});
  const completedDays = Array.isArray(faithProgress?.completedDays) ? faithProgress.completedDays : [];
  return newBelieverDays.find((day) => !completedDays.includes(day.id))?.id || newBelieverDays[0]?.id || null;
}

function buildStudyPackGuide(pack) {
  if (!pack) return '';
  const lines = [
    `FROM ISLAM TO CHRIST — ${pack.title.toUpperCase()}`,
    '',
    pack.purpose,
    pack.description,
    '',
    'READING STOPS',
    ...pack.resources.map((resource, index) => `${index + 1}. ${resource.label}\n   ${resource.detail}`),
    '',
    `REFLECTION: ${pack.closingPrompt}`,
    '',
    `REVIEW BOUNDARY: ${pack.reviewNote}`,
    '',
    'Generated locally by From Islam to Christ. The guide contains prompts for bundled app content; it is not a substitute for reading the primary text.',
  ];
  return lines.join('\n');
}

function triggerTextDownload(content, filename) {
  if (!content || typeof window === 'undefined' || typeof document === 'undefined') return;
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => window.URL.revokeObjectURL(url), 1200);
}

const PRIVATE_STORAGE_KEYS = [
  'fdl-active-view',
  'fdl-bookmarks',
  'fdl-highlights',
  'fdl-notes',
  'fdl-prayer-journal',
  'fdl-faith-progress',
  'fdl-faith-selected-day',
  'fdl-study-plan',
  'fdl-reading-plans',
  'fdl-journey-reflections',
  'fdl-saved-folders',
  'fdl-reader-preferences',
  'fdl-completed-lessons',
  'fdl-discreet-mode',
  'fdl-theme',
  'fdl-bible-location',
  'fdl-bible-history',
  'fdl-saved-study-packs',
  'fdl-downloaded-guides',
  'fdl-study-pack-progress',
  'fdl-facts-path-progress',
  'fdl-question-progress',
  'fdl-privacy-pin',
  'fdl-biometric-unlock',
  'fdl-onboarding-complete',
  'fdl-privacy-lockout',
  'fdl-offline-mode',
];
const PRIVACY_LOCKOUT_STORAGE_KEY = 'fdl-privacy-lockout';
const PRIVACY_LOCKOUT_THRESHOLD = 5;
const PRIVACY_LOCKOUT_BASE_MS = 30 * 1000;
const PRIVACY_LOCKOUT_MAX_MS = 5 * 60 * 1000;
const PRIVACY_IDLE_TIMEOUT_MS = 5 * 60 * 1000;

function bytesToBase64(bytes) {
  let binary = '';
  bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  return window.btoa(binary);
}

function base64ToBytes(value) {
  const binary = window.atob(value);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

function readPrivacyLockout() {
  const stored = readLocal(PRIVACY_LOCKOUT_STORAGE_KEY, {});
  const failures = Number(stored?.failures);
  const lockedUntil = Number(stored?.lockedUntil);
  return {
    failures: Number.isFinite(failures) ? Math.max(0, Math.floor(failures)) : 0,
    lockedUntil: Number.isFinite(lockedUntil) ? Math.max(0, Math.floor(lockedUntil)) : 0,
  };
}

function privacyLockoutDelay(failures) {
  if (failures < PRIVACY_LOCKOUT_THRESHOLD) return 0;
  const escalation = Math.min(failures - PRIVACY_LOCKOUT_THRESHOLD, 3);
  return Math.min(PRIVACY_LOCKOUT_MAX_MS, PRIVACY_LOCKOUT_BASE_MS * (2 ** escalation));
}

async function hashPrivacyPin(pin, salt) {
  const key = await window.crypto.subtle.importKey('raw', new TextEncoder().encode(pin), { name: 'PBKDF2' }, false, ['deriveBits']);
  const bits = await window.crypto.subtle.deriveBits({ name: 'PBKDF2', salt: base64ToBytes(salt), iterations: 120000, hash: 'SHA-256' }, key, 256);
  return bytesToBase64(new Uint8Array(bits));
}

async function createPrivacyPin(pin) {
  const salt = bytesToBase64(window.crypto.getRandomValues(new Uint8Array(16)));
  return { version: 1, salt, hash: await hashPrivacyPin(pin, salt) };
}

function readActiveView() {
  const storedView = readLocal('fdl-active-view', 'home');
  return navigation.some((item) => item.id === storedView) ? storedView : 'home';
}

function App() {
  const [activeView, setActiveView] = useState(readActiveView);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [bookmarks, setBookmarks] = useState(() => readLocal('fdl-bookmarks', ['verse-john-1-1']));
  const [highlights, setHighlights] = useState(() => readLocal('fdl-highlights', []));
  const [notes, setNotes] = useState(() => readLocal('fdl-notes', {}));
  const [prayerEntries, setPrayerEntries] = useState(() => readLocal('fdl-prayer-journal', []));
  const [faithProgress, setFaithProgress] = useState(() => readLocal('fdl-faith-progress', { started: false, startedAt: null, completedDays: [], testimony: {} }));
  const [faithSelectedDayId, setFaithSelectedDayId] = useState(readFaithSelectedDay);
  const [studyPlan, setStudyPlan] = useState(() => readLocal('fdl-study-plan', { focusId: null, completedSteps: [] }));
  const [readingPlanState, setReadingPlanState] = useState(readReadingPlanState);
  const [journeyReflections, setJourneyReflections] = useState(readJourneyReflections);
  const [savedFolderState, setSavedFolderState] = useState(readSavedFolderState);
  const [savedStudyPacks, setSavedStudyPacks] = useState(readSavedStudyPacks);
  const [downloadedGuides, setDownloadedGuides] = useState(readDownloadedGuides);
  const [studyPackProgress, setStudyPackProgress] = useState(readStudyPackProgress);
  const [factsPathProgress, setFactsPathProgress] = useState(readFactsPathProgress);
  const [questionProgress, setQuestionProgress] = useState(readQuestionProgress);
  const [readerPreferences, setReaderPreferences] = useState(readReaderPreferences);
  const [completedLessons, setCompletedLessons] = useState(() => readLocal('fdl-completed-lessons', [1]));
  const [discreetMode, setDiscreetMode] = useState(() => readLocal('fdl-discreet-mode', true));
  const [theme, setTheme] = useState(() => readLocal('fdl-theme', 'light'));
  const [privacyPin, setPrivacyPin] = useState(() => readLocal('fdl-privacy-pin', null));
  const [privacyLocked, setPrivacyLocked] = useState(() => Boolean(readLocal('fdl-privacy-pin', null)));
  const [privacyLockout, setPrivacyLockout] = useState(readPrivacyLockout);
  const [offlineMode, setOfflineMode] = useState(() => readLocal('fdl-offline-mode', false) === true);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(() => readLocal('fdl-biometric-unlock', false));
  const [onboardingComplete, setOnboardingComplete] = useState(() => readLocal('fdl-onboarding-complete', false));
  const [discreetStartupEntered, setDiscreetStartupEntered] = useState(() => {
    const hasCompletedOnboarding = readLocal('fdl-onboarding-complete', false);
    const hasDiscreetMode = readLocal('fdl-discreet-mode', true);
    return !hasCompletedOnboarding || !hasDiscreetMode;
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [pendingBibleReference, setPendingBibleReference] = useState(null);
  const [globalSearchOpen, setGlobalSearchOpen] = useState(false);
  const [showPrivacyNotice, setShowPrivacyNotice] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [updateState, setUpdateState] = useState({ status: 'idle', currentVersion: APP_VERSION });
  const androidDownloadPromise = useRef(null);
  const suppressBibleHistoryRef = useRef(false);
  const [libraryGroup, setLibraryGroup] = useState('All');
  const [libraryQuery, setLibraryQuery] = useState('');
  const [learnFocusPathId, setLearnFocusPathId] = useState(null);
  const [learnFocusStudyPackId, setLearnFocusStudyPackId] = useState(null);
  const [learnWordStudyQuery, setLearnWordStudyQuery] = useState('');
  const [journeyFocusLessonId, setJourneyFocusLessonId] = useState(null);
  const [bibleLocation, setBibleLocation] = useState(() => readLocal('fdl-bible-location', { bookId: 'JHN', chapter: 1 }));
  const [bibleHistory, setBibleHistory] = useState(readBibleHistory);
  const [bibleChapterLoading, setBibleChapterLoading] = useState(false);
  const [bibleChapterError, setBibleChapterError] = useState('');
  const [bibleChapterAttempt, setBibleChapterAttempt] = useState(0);
  const bibleChapterRequestRef = useRef(0);
  const [bibleFocusTarget, setBibleFocusTarget] = useState(null);
  const [dailyVerse, setDailyVerse] = useState(null);
  const [contentDatabase, setContentDatabase] = useState({ status: 'loading', sourceAssetCount: 0, contentVersion: APP_VERSION, bibleBooks: [], bibleVerses: [] });
  const [contentDatabaseAttempt, setContentDatabaseAttempt] = useState(0);
  const [translationStatus, setTranslationStatus] = useState({ status: 'idle', pending: 0 });

  useEffect(() => window.localStorage.setItem('fdl-active-view', JSON.stringify(activeView)), [activeView]);
  useEffect(() => window.localStorage.setItem('fdl-bookmarks', JSON.stringify(bookmarks)), [bookmarks]);
  useEffect(() => window.localStorage.setItem('fdl-highlights', JSON.stringify(highlights)), [highlights]);
  useEffect(() => window.localStorage.setItem('fdl-notes', JSON.stringify(notes)), [notes]);
  useEffect(() => window.localStorage.setItem('fdl-prayer-journal', JSON.stringify(prayerEntries)), [prayerEntries]);
  useEffect(() => window.localStorage.setItem('fdl-faith-progress', JSON.stringify(faithProgress)), [faithProgress]);
  useEffect(() => window.localStorage.setItem('fdl-faith-selected-day', JSON.stringify(faithSelectedDayId)), [faithSelectedDayId]);
  useEffect(() => window.localStorage.setItem('fdl-study-plan', JSON.stringify(studyPlan)), [studyPlan]);
  useEffect(() => window.localStorage.setItem('fdl-reading-plans', JSON.stringify(readingPlanState)), [readingPlanState]);
  useEffect(() => window.localStorage.setItem('fdl-journey-reflections', JSON.stringify(journeyReflections)), [journeyReflections]);
  useEffect(() => window.localStorage.setItem('fdl-saved-folders', JSON.stringify(savedFolderState)), [savedFolderState]);
  useEffect(() => window.localStorage.setItem('fdl-saved-study-packs', JSON.stringify(savedStudyPacks)), [savedStudyPacks]);
  useEffect(() => window.localStorage.setItem('fdl-downloaded-guides', JSON.stringify(downloadedGuides)), [downloadedGuides]);
  useEffect(() => window.localStorage.setItem('fdl-study-pack-progress', JSON.stringify(studyPackProgress)), [studyPackProgress]);
  useEffect(() => window.localStorage.setItem('fdl-facts-path-progress', JSON.stringify(factsPathProgress)), [factsPathProgress]);
  useEffect(() => window.localStorage.setItem('fdl-question-progress', JSON.stringify(questionProgress)), [questionProgress]);
  useEffect(() => window.localStorage.setItem('fdl-reader-preferences', JSON.stringify(readerPreferences)), [readerPreferences]);
  useEffect(() => {
    const language = getLanguageOption(readerPreferences?.translation);
    document.documentElement.lang = language.locale;
    document.documentElement.dir = isRtlLanguage(language.id) ? 'rtl' : 'ltr';
    setAutomaticTranslationOffline(offlineMode);
    setTranslationStatus(language.id === 'en' ? { status: 'idle', pending: 0 } : offlineMode ? { status: 'offline', pending: 0 } : { status: 'starting', pending: 0 });
    const handleTranslationStatus = (event) => {
      if (event.detail?.languageId === language.id) setTranslationStatus(event.detail);
    };
    window.addEventListener('fdl-translation-status', handleTranslationStatus);
    window.dispatchEvent(new CustomEvent('fdl-language-change', { detail: language.id }));
    const stopAutomaticTranslation = startAutomaticTranslation(language.id);
    return () => {
      window.removeEventListener('fdl-translation-status', handleTranslationStatus);
      stopAutomaticTranslation();
    };
  }, [offlineMode, readerPreferences?.translation]);
  useEffect(() => window.localStorage.setItem('fdl-completed-lessons', JSON.stringify(completedLessons)), [completedLessons]);
  useEffect(() => window.localStorage.setItem('fdl-discreet-mode', JSON.stringify(discreetMode)), [discreetMode]);
  useEffect(() => window.localStorage.setItem('fdl-theme', JSON.stringify(theme)), [theme]);
  useEffect(() => window.localStorage.setItem(PRIVACY_LOCKOUT_STORAGE_KEY, JSON.stringify(privacyLockout)), [privacyLockout]);
  useEffect(() => window.localStorage.setItem('fdl-offline-mode', JSON.stringify(offlineMode)), [offlineMode]);
  useEffect(() => window.localStorage.setItem('fdl-bible-location', JSON.stringify(bibleLocation)), [bibleLocation]);
  useEffect(() => window.localStorage.setItem('fdl-bible-history', JSON.stringify(bibleHistory)), [bibleHistory]);
  useEffect(() => window.localStorage.setItem('fdl-onboarding-complete', JSON.stringify(onboardingComplete)), [onboardingComplete]);
  useEffect(() => window.localStorage.setItem('fdl-biometric-unlock', JSON.stringify(biometricEnabled)), [biometricEnabled]);
  useEffect(() => {
    document.documentElement.style.colorScheme = theme;
  }, [theme]);
  useEffect(() => {
    const isNative = typeof window.Capacitor?.isNativePlatform === 'function' && window.Capacitor.isNativePlatform();
    const shouldProtectWindow = !onboardingComplete || discreetMode;
    const desktopPrivacyRequest = window.fromDarkness?.setPrivacyState?.({ discreetMode, onboardingComplete, startupEntered: discreetStartupEntered });
    desktopPrivacyRequest?.catch(() => undefined);
    if (isNative && Capacitor.getPlatform() === 'android') {
      const startupPrivacyRequest = PrivacyShield.setStartupPrivacy?.({ discreetMode, onboardingComplete, startupEntered: discreetStartupEntered });
      startupPrivacyRequest?.catch(() => undefined);
      PrivacyShield.setScreenProtection({ enabled: shouldProtectWindow }).catch(() => undefined);
      BiometricAuth.isAvailable().then((result) => setBiometricAvailable(Boolean(result?.available))).catch(() => setBiometricAvailable(false));
    }
    return undefined;
  }, [discreetMode, onboardingComplete, discreetStartupEntered]);
  useEffect(() => {
    function handleSearchShortcut(event) {
      if (privacyPin && privacyLocked) return;
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setGlobalSearchOpen(true);
      }
      if (event.key === 'Escape' && globalSearchOpen) setGlobalSearchOpen(false);
    }
    window.addEventListener('keydown', handleSearchShortcut);
    return () => window.removeEventListener('keydown', handleSearchShortcut);
  }, [globalSearchOpen, privacyPin, privacyLocked]);
  useEffect(() => {
    if (!privacyPin || privacyLocked) return undefined;
    let timer;
    const armLockTimer = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        setPrivacyLocked(true);
        setSelectedArticle(null);
        setMobileMenuOpen(false);
        setGlobalSearchOpen(false);
      }, PRIVACY_IDLE_TIMEOUT_MS);
    };
    const activityEvents = ['pointerdown', 'keydown', 'touchstart'];
    activityEvents.forEach((eventName) => window.addEventListener(eventName, armLockTimer, { passive: true }));
    armLockTimer();
    return () => {
      window.clearTimeout(timer);
      activityEvents.forEach((eventName) => window.removeEventListener(eventName, armLockTimer));
    };
  }, [privacyPin, privacyLocked]);

  const runtimeVerses = contentDatabase.bibleVerses?.length ? contentDatabase.bibleVerses : fallbackVerses;
  const runtimeBooks = contentDatabase.bibleBooks?.length ? contentDatabase.bibleBooks : [{ id: 'JHN', name: 'John', abbreviation: 'Jhn', bookOrder: 43, chapterCount: 1 }];
  const runtimeBibleLocation = (() => {
    const selectedBook = runtimeBooks.find((book) => book.id === bibleLocation?.bookId) || runtimeBooks[0];
    const chapterCount = Number(selectedBook?.chapterCount) || 1;
    return {
      bookId: selectedBook?.id || 'JHN',
      chapter: Math.min(Math.max(1, Number(bibleLocation?.chapter) || 1), chapterCount),
    };
  })();

  useEffect(() => {
    if (contentDatabase.status !== 'ready' || !runtimeBibleLocation.bookId) return;
    if (bibleLocation?.bookId === runtimeBibleLocation.bookId && Number(bibleLocation?.chapter) === runtimeBibleLocation.chapter) return;
    setBibleLocation(runtimeBibleLocation);
  }, [contentDatabase.status, runtimeBibleLocation.bookId, runtimeBibleLocation.chapter, bibleLocation?.bookId, bibleLocation?.chapter]);

  useEffect(() => {
    let active = true;
    loadContentDatabase()
      .then((snapshot) => {
        if (active) setContentDatabase(snapshot);
      })
      .catch((error) => {
        if (active) setContentDatabase({ status: 'error', sourceAssetCount: 0, contentVersion: APP_VERSION, bibleVerses: [], errorMessage: error?.message || 'Database unavailable.' });
      });
    return () => { active = false; };
  }, [contentDatabaseAttempt]);

  useEffect(() => {
    if (contentDatabase.status !== 'ready') return undefined;
    const requestedLocation = runtimeBibleLocation;
    const loadedLocation = contentDatabase.bibleLocation;
    if (loadedLocation?.bookId === requestedLocation.bookId && loadedLocation?.chapter === requestedLocation.chapter && contentDatabase.bibleVerses?.length) {
      setBibleChapterLoading(false);
      setBibleChapterError('');
      return undefined;
    }
    let active = true;
    const requestId = bibleChapterRequestRef.current + 1;
    bibleChapterRequestRef.current = requestId;
    const isCurrentRequest = () => active && bibleChapterRequestRef.current === requestId;
    const timeoutId = window.setTimeout(() => {
      if (!isCurrentRequest()) return;
      active = false;
      setBibleChapterLoading(false);
      const requestedBook = runtimeBooks.find((book) => book.id === requestedLocation.bookId);
      setBibleChapterError(`The ${requestedBook?.name || requestedLocation.bookId} ${requestedLocation.chapter} chapter took too long to open. Please try again.`);
    }, BIBLE_CHAPTER_TIMEOUT_MS);
    setBibleChapterLoading(true);
    setBibleChapterError('');
    loadBibleChapter(requestedLocation.bookId, requestedLocation.chapter)
      .then((verses) => {
        if (!isCurrentRequest()) return;
        if (!verses.length) {
          throw new Error(`No verses were found for ${requestedLocation.bookId} ${requestedLocation.chapter}.`);
        }
        setContentDatabase((current) => ({ ...current, bibleLocation: requestedLocation, bibleVerses: verses }));
      })
      .catch((error) => {
        if (isCurrentRequest()) setBibleChapterError(error?.message || 'This Bible chapter could not be opened.');
      })
      .finally(() => {
        window.clearTimeout(timeoutId);
        if (isCurrentRequest()) setBibleChapterLoading(false);
      });
    return () => {
      active = false;
      window.clearTimeout(timeoutId);
    };
  }, [contentDatabase.status, contentDatabase.bibleLocation?.bookId, contentDatabase.bibleLocation?.chapter, contentDatabase.bibleVerses?.length, runtimeBibleLocation.bookId, runtimeBibleLocation.chapter, bibleChapterAttempt]);

  useEffect(() => {
    if (contentDatabase.status !== 'ready') return undefined;
    let active = true;
    loadVerseOfTheDay()
      .then((verse) => {
        if (active) setDailyVerse(verse);
      })
      .catch(() => {
        if (active) setDailyVerse(null);
      });
    return () => { active = false; };
  }, [contentDatabase.status]);

  async function startAndroidDownload(update) {
    if (!update?.available || update.platform !== 'android') return update;
    if (androidDownloadPromise.current) return androidDownloadPromise.current;

    const downloadPromise = (async () => {
      setUpdateState((current) => ({ ...current, ...update, status: 'downloading', percent: 0 }));
      try {
        const result = await downloadAndroidUpdate(update, (progress) => {
          setUpdateState((current) => ({ ...current, ...progress, status: 'downloading', latestVersion: update.latestVersion, version: update.latestVersion }));
        });
        const nextState = {
          ...update,
          ...result,
          status: 'downloaded',
          version: update.latestVersion,
          latestVersion: update.latestVersion,
          percent: 100,
        };
        setUpdateState(nextState);
        return nextState;
      } catch (error) {
        const nextState = {
          ...update,
          status: 'error',
          message: error?.message || 'The Android update could not be downloaded inside the app.',
        };
        setUpdateState(nextState);
        return nextState;
      } finally {
        androidDownloadPromise.current = null;
      }
    })();
    androidDownloadPromise.current = downloadPromise;
    return downloadPromise;
  }

  async function checkForUpdates() {
    if (offlineMode) {
      const nextState = { status: 'offline', currentVersion: APP_VERSION, platform: getUpdatePlatform() };
      setUpdateState(nextState);
      return nextState;
    }
    setUpdateState((current) => ({ ...current, status: 'checking' }));
    try {
      if (window.fromDarkness?.checkForUpdate) {
        const result = await window.fromDarkness.checkForUpdate();
        setUpdateState((current) => ({ ...current, ...result }));
        return result;
      }
      const result = await checkForGitHubUpdate();
      if (result.available && result.platform === 'android') return startAndroidDownload(result);
      const nextState = { ...result, status: result.available ? 'available' : 'current' };
      setUpdateState(nextState);
      return nextState;
    } catch (error) {
      const nextState = { status: 'error', currentVersion: APP_VERSION, message: error?.message || 'Could not check GitHub for updates.' };
      setUpdateState(nextState);
      return nextState;
    }
  }

  useEffect(() => {
    let removeUpdateListener;
    if (!offlineMode && window.fromDarkness?.onUpdateStatus) removeUpdateListener = window.fromDarkness.onUpdateStatus((status) => setUpdateState((current) => ({ ...current, ...status })));
    if (offlineMode) {
      setUpdateState({ status: 'offline', currentVersion: APP_VERSION, platform: getUpdatePlatform() });
    } else {
      checkForUpdates();
    }
    return () => removeUpdateListener?.();
  }, [offlineMode]);

  const currentTitle = useMemo(() => {
    if (selectedArticle) return selectedArticle.title;
    const item = navigation.find((candidate) => candidate.id === activeView);
    return getLanguageCopy(readerPreferences?.translation, `nav.${item?.id}`, item?.label || 'Home');
  }, [activeView, readerPreferences?.translation, selectedArticle]);

  const selectedLanguage = getLanguageOption(readerPreferences?.translation);

  useEffect(() => {
    if (!pendingBibleReference || contentDatabase.status !== 'ready') return undefined;
    const targetLocation = resolveBibleReference(pendingBibleReference, runtimeBooks);
    if (targetLocation) {
      setSearchTerm(pendingBibleReference);
      setBibleLocation(targetLocation);
    }
    setPendingBibleReference(null);
    return undefined;
  }, [pendingBibleReference, contentDatabase.status, contentDatabase.bibleBooks?.length]);

  useEffect(() => {
    if (!bibleLocation?.bookId || !bibleLocation?.chapter) return;
    if (suppressBibleHistoryRef.current) {
      suppressBibleHistoryRef.current = false;
      return;
    }
    setBibleHistory((current) => {
      const key = `${bibleLocation.bookId}-${Number(bibleLocation.chapter)}`;
      const nextEntry = { bookId: bibleLocation.bookId, chapter: Number(bibleLocation.chapter), visitedAt: new Date().toISOString() };
      return [nextEntry, ...current.filter((entry) => `${entry.bookId}-${Number(entry.chapter)}` !== key)].slice(0, 8);
    });
  }, [bibleLocation?.bookId, bibleLocation?.chapter]);

  function navigate(view) {
    setSelectedArticle(null);
    if (view !== 'learn') {
      setLearnFocusPathId(null);
      setLearnFocusStudyPackId(null);
      setLearnWordStudyQuery('');
    }
    if (view !== 'bible') setBibleFocusTarget(null);
    setActiveView(view);
    setMobileMenuOpen(false);
  }

  function openBibleFocus(target) {
    if (!['read', 'audio', 'word-study'].includes(target)) return;
    setBibleFocusTarget(target);
    navigate('bible');
  }

  function openLibraryBibleDestination(target) {
    openBibleFocus(target === 'word-study' ? 'word-study' : 'read');
  }

  function openLibraryGroup(groupName, query = '') {
    setLibraryGroup(groupName);
    setLibraryQuery(query);
    navigate('library');
  }

  function openLearnWordStudy(query = '') {
    setLearnWordStudyQuery(String(query || '').trim());
    setSelectedArticle(null);
    setActiveView('learn');
    setMobileMenuOpen(false);
  }

  function openFactsPath(pathId) {
    if (!factsInfoReadingPaths.some((path) => path.id === pathId)) return;
    setLearnFocusPathId(pathId);
    setLearnFocusStudyPackId(null);
    navigate('learn');
  }

  function toggleBookmark(id) {
    setBookmarks((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  }

  function toggleHighlight(id) {
    setHighlights((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  }

  function saveNote(id, text) {
    setNotes((current) => {
      const next = { ...current };
      if (text.trim()) next[id] = text.trim();
      else delete next[id];
      return next;
    });
  }

  function savePrayerEntry(text) {
    const trimmed = text.trim();
    if (!trimmed) return false;
    setPrayerEntries((current) => [{ id: `prayer-${Date.now()}`, text: trimmed, createdAt: new Date().toISOString(), status: 'ongoing' }, ...current].slice(0, 100));
    return true;
  }

  function togglePrayerEntryStatus(id) {
    setPrayerEntries((current) => current.map((entry) => entry.id === id ? { ...entry, status: entry.status === 'answered' ? 'ongoing' : 'answered' } : entry));
  }

  function deletePrayerEntry(id) {
    setPrayerEntries((current) => current.filter((entry) => entry.id !== id));
  }

  function startFaithPath() {
    setFaithProgress((current) => ({ ...current, started: true, startedAt: current.startedAt || new Date().toISOString() }));
  }

  function selectStudyFocus(focusId) {
    if (!studyFoci.some((focus) => focus.id === focusId)) return;
    setStudyPlan({ focusId, completedSteps: [] });
  }

  function toggleStudyStep(stepId) {
    setStudyPlan((current) => {
      const completedSteps = Array.isArray(current.completedSteps) ? current.completedSteps : [];
      return { ...current, completedSteps: completedSteps.includes(stepId) ? completedSteps.filter((id) => id !== stepId) : [...completedSteps, stepId] };
    });
  }

  function selectReadingPlan(planId) {
    if (!readingPlans.some((plan) => plan.id === planId)) return;
    setReadingPlanState((current) => ({ ...current, selectedPlanId: planId }));
  }

  function toggleReadingPlanStep(stepId) {
    setReadingPlanState((current) => {
      const plan = readingPlans.find((candidate) => candidate.id === current.selectedPlanId) || readingPlans[0];
      if (!plan?.steps.some((step) => step.id === stepId)) return current;
      const existing = Array.isArray(current.completedByPlan?.[plan.id]) ? current.completedByPlan[plan.id] : [];
      const completed = existing.includes(stepId) ? existing.filter((id) => id !== stepId) : [...existing, stepId];
      return { ...current, selectedPlanId: plan.id, completedByPlan: { ...current.completedByPlan, [plan.id]: completed } };
    });
  }

  function toggleSavedStudyPack(packId) {
    if (!studyPacks.some((pack) => pack.id === packId)) return;
    setSavedStudyPacks((current) => current.includes(packId) ? current.filter((id) => id !== packId) : [...current, packId]);
  }

  function toggleStudyPackResource(packId, resourceId) {
    const pack = studyPacks.find((candidate) => candidate.id === packId);
    if (!pack?.resources.some((resource) => resource.id === resourceId)) return;
    setStudyPackProgress((current) => {
      const completed = Array.isArray(current[packId]) ? current[packId] : [];
      const nextCompleted = completed.includes(resourceId)
        ? completed.filter((id) => id !== resourceId)
        : [...completed, resourceId];
      const next = { ...current };
      if (nextCompleted.length > 0) next[packId] = nextCompleted;
      else delete next[packId];
      return next;
    });
  }

  function toggleFactsPathSection(pathId, sectionTitle) {
    const path = factsInfoReadingPaths.find((candidate) => candidate.id === pathId);
    if (!path?.readingSections.some((section) => section.title === sectionTitle)) return;
    setFactsPathProgress((current) => {
      const completed = Array.isArray(current[pathId]) ? current[pathId] : [];
      const nextCompleted = completed.includes(sectionTitle)
        ? completed.filter((title) => title !== sectionTitle)
        : [...completed, sectionTitle];
      const next = { ...current };
      if (nextCompleted.length > 0) next[pathId] = nextCompleted;
      else delete next[pathId];
      return next;
    });
  }

  function toggleQuestionProgress(questionId) {
    if (!questionLibrary.some((question) => question.id === questionId)) return;
    setQuestionProgress((current) => current.includes(questionId)
      ? current.filter((id) => id !== questionId)
      : [...current, questionId]);
  }

  function saveDownloadedGuide({ packId, title, content, filename }) {
    if (!studyPacks.some((pack) => pack.id === packId) || !String(content || '').trim()) return;
    const record = {
      id: `guide-${packId}`,
      packId,
      title: String(title || '').trim(),
      content: String(content),
      filename: String(filename || `from-islam-to-christ-${packId}.txt`),
      createdAt: new Date().toISOString(),
    };
    setDownloadedGuides((current) => [record, ...current.filter((entry) => entry.packId !== packId)].slice(0, 12));
  }

  function removeDownloadedGuide(id) {
    setDownloadedGuides((current) => current.filter((entry) => entry.id !== id));
  }

  function openStudyPack(packId) {
    if (!studyPacks.some((pack) => pack.id === packId)) return;
    setLearnFocusPathId(null);
    setLearnFocusStudyPackId(packId);
    navigate('learn');
  }

  function openStudyPackResource(resource) {
    if (!resource) return;
    if (resource.type === 'article') {
      const article = allArticles.find((candidate) => candidate.id === resource.target);
      if (article) openArticle(article);
      return;
    }
    if (resource.type === 'bible') {
      openBibleReference(resource.target);
      return;
    }
    if (resource.type === 'path') {
      setLearnFocusStudyPackId(null);
      setLearnFocusPathId(resource.target);
      navigate('learn');
      return;
    }
    if (resource.type === 'lesson') {
      setJourneyFocusLessonId(Number(resource.target));
      navigate('journey');
      return;
    }
    if (resource.type === 'view') navigate(resource.target);
  }

  function openReadingPlanStep(step) {
    if (step?.reference) openBibleReference(step.reference);
  }

  function saveJourneyReflection(lessonId, text) {
    if (!lessons.some((lesson) => lesson.id === lessonId)) return;
    const cleanText = String(text || '').trim().slice(0, 1600);
    setJourneyReflections((current) => {
      const next = { ...current };
      if (cleanText) next[lessonId] = { text: cleanText, updatedAt: new Date().toISOString() };
      else delete next[lessonId];
      return next;
    });
  }

  function createSavedFolder(label) {
    const cleanLabel = String(label || '').trim().replace(/\s+/g, ' ').slice(0, 32);
    if (!cleanLabel) return null;
    const id = `custom-${Date.now()}`;
    setSavedFolderState((current) => ({
      ...current,
      folders: [...current.folders, { id, label: cleanLabel, description: 'A private folder for saved study.' }],
    }));
    return id;
  }

  function deleteSavedFolder(folderId) {
    if (defaultSavedFolders.some((folder) => folder.id === folderId)) return;
    setSavedFolderState((current) => {
      const assignments = Object.fromEntries(Object.entries(current.assignments).filter(([, assignedFolderId]) => assignedFolderId !== folderId));
      return { folders: current.folders.filter((folder) => folder.id !== folderId), assignments };
    });
  }

  function assignSavedItem(itemId, folderId) {
    setSavedFolderState((current) => {
      const assignments = { ...current.assignments };
      if (folderId && current.folders.some((folder) => folder.id === folderId)) assignments[itemId] = folderId;
      else delete assignments[itemId];
      return { ...current, assignments };
    });
  }

  function openStudyStep(step) {
    if (!step) return;
    if (step.type === 'article') {
      const article = allArticles.find((candidate) => candidate.id === step.target);
      if (article) openArticle(article);
      return;
    }
    if (step.type === 'bible') {
      openBibleReference(step.target);
      return;
    }
    if (step.type === 'path') {
      setLearnFocusStudyPackId(null);
      setLearnFocusPathId(step.target);
      navigate('learn');
      return;
    }
    if (step.type === 'lesson') {
      setJourneyFocusLessonId(step.target);
      navigate('journey');
      return;
    }
    if (step.type === 'view') navigate(step.target);
  }

  function toggleFaithDay(id) {
    setFaithProgress((current) => {
      const completedDays = Array.isArray(current.completedDays) ? current.completedDays : [];
      return { ...current, started: true, startedAt: current.startedAt || new Date().toISOString(), completedDays: completedDays.includes(id) ? completedDays.filter((dayId) => dayId !== id) : [...completedDays, id] };
    });
  }

  function saveFaithTestimony(testimony) {
    const cleaned = {
      questions: String(testimony?.questions || '').trim(),
      learned: String(testimony?.learned || '').trim(),
      hope: String(testimony?.hope || '').trim(),
    };
    setFaithProgress((current) => {
      if (!Object.values(cleaned).some(Boolean)) {
        const next = { ...current };
        delete next.testimony;
        return next;
      }
      return { ...current, testimony: { ...cleaned, updatedAt: new Date().toISOString() } };
    });
  }

  function updateReaderPreference(key, value) {
    setReaderPreferences((current) => ({ ...current, [key]: value }));
  }

  function changeBibleLocation(nextLocation) {
    const nextBook = runtimeBooks.find((book) => book.id === nextLocation?.bookId);
    if (!nextBook) return;
    const nextChapter = Math.min(Math.max(1, Number(nextLocation.chapter) || 1), Number(nextBook.chapterCount) || 1);
    setSearchTerm('');
    setBibleChapterError('');
    setBibleFocusTarget(null);
    setBibleLocation({ bookId: nextBook.id, chapter: nextChapter });
  }

  function retryBibleChapter() {
    setBibleChapterError('');
    setBibleChapterAttempt((current) => current + 1);
  }

  function openBibleReference(reference) {
    const targetLocation = resolveBibleReference(reference, runtimeBooks);
    if (targetLocation) {
      setSearchTerm(reference);
      setBibleFocusTarget(null);
      setBibleLocation(targetLocation);
      setPendingBibleReference(null);
    } else if (contentDatabase.status !== 'ready') {
      setSearchTerm(reference);
      setPendingBibleReference(reference);
    }
    setSelectedArticle(null);
    setActiveView('bible');
    setMobileMenuOpen(false);
  }

  function retryContentDatabase() {
    setContentDatabase((current) => ({ ...current, status: 'loading', errorMessage: null }));
    setContentDatabaseAttempt((current) => current + 1);
  }

  function openGlobalBibleResult(result) {
    if (result?.reference) openBibleReference(result.reference);
    setGlobalSearchOpen(false);
  }

  function openGlobalArticle(article) {
    if (article) openArticle(article);
    setGlobalSearchOpen(false);
  }

  function openGlobalLibraryResult(result) {
    if (result?.type === 'research') {
      openLearnWordStudy(result.query || result.title?.split(' · ')[0] || '');
      setGlobalSearchOpen(false);
      return;
    }
    const libraryQuery = result?.type === 'research' ? '' : (result?.query || result?.title || '');
    openLibraryGroup(result?.groupName || 'All', libraryQuery);
    setGlobalSearchOpen(false);
  }

  function toggleLesson(id) {
    setCompletedLessons((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  }

  function openArticle(article) {
    setSelectedArticle(article);
    setActiveView('learn');
    setMobileMenuOpen(false);
  }

  function openJourneyLesson(lessonId) {
    if (!lessons.some((lesson) => lesson.id === lessonId)) return;
    setJourneyFocusLessonId(lessonId);
    navigate('journey');
  }

  async function enablePrivacyLock(pin) {
    try {
      const credential = await createPrivacyPin(pin);
      window.localStorage.setItem('fdl-privacy-pin', JSON.stringify(credential));
      setPrivacyPin(credential);
      setPrivacyLocked(false);
      setPrivacyLockout({ failures: 0, lockedUntil: 0 });
      return { ok: true };
    } catch (error) {
      return { ok: false, message: error?.message || 'This device could not create a local PIN.' };
    }
  }

  function disablePrivacyLock() {
    window.localStorage.removeItem('fdl-privacy-pin');
    window.localStorage.removeItem('fdl-biometric-unlock');
    window.localStorage.removeItem(PRIVACY_LOCKOUT_STORAGE_KEY);
    setPrivacyPin(null);
    setBiometricEnabled(false);
    setPrivacyLockout({ failures: 0, lockedUntil: 0 });
    setPrivacyLocked(false);
  }

  async function enableBiometricUnlock() {
    if (!privacyPin) return { ok: false, message: 'Set an app PIN before enabling biometric unlock.' };
    if (!biometricAvailable) return { ok: false, message: 'Biometric unlock is not available on this Android device.' };
    try {
      const result = await BiometricAuth.authenticate();
      if (!result?.authenticated) return { ok: false, message: 'Biometric verification was not completed.' };
      setBiometricEnabled(true);
      return { ok: true };
    } catch (error) {
      return { ok: false, message: error?.message || 'Android biometric verification could not be started.' };
    }
  }

  async function unlockWithBiometric() {
    if (!biometricEnabled || !biometricAvailable) return false;
    try {
      const result = await BiometricAuth.authenticate();
      if (result?.authenticated) {
        setPrivacyLockout({ failures: 0, lockedUntil: 0 });
        setPrivacyLocked(false);
        return true;
      }
    } catch {
      return false;
    }
    return false;
  }

  function lockApp() {
    setPrivacyLocked(true);
    setSelectedArticle(null);
    setMobileMenuOpen(false);
    setGlobalSearchOpen(false);
  }

  async function quickCloseApp() {
    if (Capacitor.getPlatform() !== 'android') {
      return { ok: false, message: 'Quick close is available in the Android app.' };
    }
    try {
      await QuickClose.closeApp();
      return { ok: true };
    } catch (error) {
      return { ok: false, message: error?.message || 'Quick close is unavailable on this device.' };
    }
  }

  async function unlockPrivacyLock(pin) {
    if (!privacyPin?.salt || !privacyPin?.hash) return false;
    try {
      return (await hashPrivacyPin(pin, privacyPin.salt)) === privacyPin.hash;
    } catch {
      return false;
    }
  }

  function registerPrivacyFailure() {
    setPrivacyLockout((current) => {
      const failures = Math.max(0, Number(current?.failures) || 0) + 1;
      const delay = privacyLockoutDelay(failures);
      return { failures, lockedUntil: delay ? Date.now() + delay : 0 };
    });
  }

  function clearPrivacyLockout() {
    setPrivacyLockout({ failures: 0, lockedUntil: 0 });
  }

  function deletePrivateData() {
    PRIVATE_STORAGE_KEYS.forEach((key) => window.localStorage.removeItem(key));
    clearAutomaticTranslationCache();
    setActiveView('home');
    setSelectedArticle(null);
    setBookmarks(['verse-john-1-1']);
    setHighlights([]);
    setNotes({});
    setPrayerEntries([]);
    setFaithProgress({ started: false, startedAt: null, completedDays: [], testimony: {} });
    setFaithSelectedDayId(newBelieverDays[0]?.id || null);
    setStudyPlan({ focusId: null, completedSteps: [] });
    setReadingPlanState({ selectedPlanId: readingPlans[0]?.id || null, completedByPlan: {} });
    setJourneyReflections({});
    setSavedFolderState({ folders: defaultSavedFolders, assignments: {} });
    setSavedStudyPacks([]);
    setDownloadedGuides([]);
    setStudyPackProgress({});
    setFactsPathProgress({});
    setQuestionProgress([]);
    setReaderPreferences({ fontScale: 1, tone: 'default', translation: 'en' });
    setCompletedLessons([1]);
    setDiscreetMode(true);
    setTheme('light');
    setSearchTerm('');
    setGlobalSearchOpen(false);
    setMobileMenuOpen(false);
    suppressBibleHistoryRef.current = true;
    setBibleLocation({ bookId: 'JHN', chapter: 1 });
    setBibleHistory([]);
    setPrivacyPin(null);
    setBiometricEnabled(false);
    setPrivacyLockout({ failures: 0, lockedUntil: 0 });
    setOfflineMode(false);
    setPrivacyLocked(false);
    setOnboardingComplete(false);
  }

  function finishOnboarding(destination = 'home') {
    setOnboardingComplete(true);
    setDiscreetStartupEntered(true);
    setSelectedArticle(null);
    setActiveView(destination);
    setMobileMenuOpen(false);
  }

  async function handleUpdateAction() {
    try {
      const platform = updateState.platform || getUpdatePlatform();
      if (platform === 'android') {
        if (updateState.status === 'downloaded') {
          const result = await installAndroidUpdate();
          if (result?.requiresPermission) {
            setUpdateState((current) => ({ ...current, status: 'permission-required', message: result.message }));
            return openAndroidInstallSettings();
          }
          return result;
        }
        if (updateState.status === 'permission-required') {
          const result = await installAndroidUpdate();
          if (result?.requiresPermission) return openAndroidInstallSettings();
          return result;
        }
        if (updateState.status === 'available') return startAndroidDownload(updateState);
        return undefined;
      }
      if (updateState.status === 'downloaded' && window.fromDarkness?.installUpdate) return window.fromDarkness.installUpdate();
      return openUpdateUrl(updateState.downloadUrl || updateState.notesUrl || GITHUB_RELEASES_URL);
    } catch (error) {
      setUpdateState((current) => ({ ...current, status: 'error', message: error?.message || 'The update could not be installed.' }));
      return { ok: false, message: error?.message || 'The update could not be installed.' };
    }
  }

  if (privacyPin && privacyLocked) {
    return <div className={`app-shell theme-${theme}`}><PrivacyLockScreen discreetMode={discreetMode} lockout={privacyLockout} biometricEnabled={biometricEnabled} biometricAvailable={biometricAvailable} onFailedAttempt={registerPrivacyFailure} onBiometricUnlock={unlockWithBiometric} onUnlock={async (pin) => { const unlocked = await unlockPrivacyLock(pin); if (unlocked) { clearPrivacyLockout(); setPrivacyLocked(false); } return unlocked; }} /></div>;
  }

  if (!onboardingComplete) {
    return <div className={`app-shell theme-${theme}`}><Onboarding theme={theme} setTheme={setTheme} setDiscreetMode={setDiscreetMode} onComplete={finishOnboarding} /></div>;
  }

  if (discreetMode && !discreetStartupEntered) {
    return <div className={`app-shell theme-${theme}`}><NeutralStartupScreen onEnter={() => setDiscreetStartupEntered(true)} /></div>;
  }

  return (
    <div className={`app-shell theme-${theme}`}>
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <aside className="sidebar">
        <BrandMark />
        <div className="sidebar-rule" />
        <nav className="side-nav" aria-label="Primary navigation">
          {navigation.map((item) => (
            <NavButton key={item.id} item={item} languageId={selectedLanguage.id} active={activeView === item.id && !selectedArticle} onClick={() => navigate(item.id)} />
          ))}
        </nav>
        <div className="sidebar-bottom">
          <button className="privacy-mini" type="button" onClick={() => { setShowPrivacyNotice(true); navigate('settings'); }}>
            <span className="privacy-mini-icon"><Icon name="lock" size={17} /></span>
            <span><strong>Local only</strong><small>Your progress stays here</small></span>
          </button>
          <button className="settings-link" type="button" onClick={() => navigate('settings')}><Icon name="shield" size={17} /> Privacy & settings</button>
        </div>
      </aside>

      <main className="app-main">
        <header className="topbar">
          <button className="mobile-menu" type="button" aria-label="Open navigation" aria-expanded={mobileMenuOpen} onClick={() => setMobileMenuOpen((current) => !current)}><Icon name={mobileMenuOpen ? 'close' : 'menu'} /></button>
          <div className="mobile-title">{currentTitle}</div>
          <div className="topbar-actions">
            <button className="icon-button" type="button" aria-label="Search all content" title="Search all content (Ctrl+K)" onClick={() => setGlobalSearchOpen(true)}><Icon name="search" size={19} /></button>
            <button className="theme-button" type="button" aria-pressed={theme === 'dark'} aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`} title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`} onClick={() => setTheme((current) => current === 'light' ? 'dark' : 'light')}><Icon name={theme === 'light' ? 'moon' : 'sun'} size={16} /><span>{theme === 'light' ? 'Dark' : 'Light'}</span></button>
            <button className="profile-button" type="button" onClick={() => navigate('settings')}><span className="profile-avatar">✦</span><span className="profile-label">Private seeker</span><Icon name="chevron" size={14} /></button>
          </div>
        </header>

        {mobileMenuOpen && <MobileDrawer activeView={activeView} selectedArticle={selectedArticle} languageId={selectedLanguage.id} theme={theme} setTheme={setTheme} onNavigate={navigate} onClose={() => setMobileMenuOpen(false)} />}
        {(updateState.status === 'available' || updateState.status === 'downloading' || updateState.status === 'downloaded' || updateState.status === 'permission-required') && <UpdateBanner updateState={updateState} onAction={handleUpdateAction} />}
        {selectedLanguage.id !== 'en' && <TranslationStatus language={selectedLanguage} translationStatus={translationStatus} offlineMode={offlineMode} onRetry={() => window.dispatchEvent(new CustomEvent('fdl-translation-retry', { detail: { languageId: selectedLanguage.id } }))} />}

        <div className="page-content">
          {selectedArticle ? (
            <ArticleDetail article={selectedArticle} onBack={() => setSelectedArticle(null)} bookmarks={bookmarks} toggleBookmark={toggleBookmark} navigate={navigate} onOpenReference={openBibleReference} onOpenArticle={openArticle} questionProgress={questionProgress} onToggleQuestionProgress={toggleQuestionProgress} />
          ) : (
            <>
              {activeView === 'home' && <Home onNavigate={navigate} onOpenArticle={openArticle} onOpenBibleReference={openBibleReference} onOpenJourneyLesson={openJourneyLesson} bookmarks={bookmarks} toggleBookmark={toggleBookmark} completedLessons={completedLessons} bibleLocation={bibleLocation} bibleHistory={bibleHistory} books={runtimeBooks} dailyVerse={dailyVerse} languageId={selectedLanguage.id} studyPlan={studyPlan} onSelectStudyFocus={selectStudyFocus} onToggleStudyStep={toggleStudyStep} onOpenStudyStep={openStudyStep} readingPlanState={readingPlanState} onSelectReadingPlan={selectReadingPlan} onToggleReadingPlanStep={toggleReadingPlanStep} onOpenReadingPlanStep={openReadingPlanStep} factsPathProgress={factsPathProgress} onOpenFactsPath={openFactsPath} />}
              {activeView === 'bible' && <Bible verses={runtimeVerses} books={runtimeBooks} location={runtimeBibleLocation} onChangeLocation={changeBibleLocation} loading={contentDatabase.status === 'loading' || bibleChapterLoading} focusTarget={bibleFocusTarget} onFocusTargetHandled={() => setBibleFocusTarget(null)} chapterError={bibleChapterError} onRetryChapter={retryBibleChapter} databaseStatus={contentDatabase.status} databaseError={contentDatabase.errorMessage} onRetryDatabase={retryContentDatabase} searchTerm={searchTerm} setSearchTerm={setSearchTerm} bookmarks={bookmarks} toggleBookmark={toggleBookmark} highlights={highlights} toggleHighlight={toggleHighlight} notes={notes} saveNote={saveNote} readerPreferences={readerPreferences} updateReaderPreference={updateReaderPreference} completedLessons={completedLessons} toggleLesson={toggleLesson} />}
              {activeView === 'learn' && <Learn articles={allArticles} sourceAssets={contentDatabase.sourceAssets || []} onOpenArticle={openArticle} onOpenLibraryGroup={openLibraryGroup} onOpenReference={openBibleReference} onOpenBible={() => openBibleFocus('audio')} onOpenDownloads={() => navigate('downloads')} onSaveGuide={saveDownloadedGuide} initialPathId={learnFocusPathId} initialWordStudyQuery={learnWordStudyQuery} studyPacks={studyPacks} savedStudyPacks={savedStudyPacks} onToggleStudyPack={toggleSavedStudyPack} completedResourcesByPack={studyPackProgress} onToggleStudyPackResource={toggleStudyPackResource} completedSectionsByPath={factsPathProgress} onToggleFactsPathSection={toggleFactsPathSection} questionProgress={questionProgress} onToggleQuestionProgress={toggleQuestionProgress} onOpenStudyPackResource={openStudyPackResource} initialStudyPackId={learnFocusStudyPackId} />}
              {activeView === 'prayer' && <Prayer entries={prayerEntries} onSaveEntry={savePrayerEntry} onToggleEntry={togglePrayerEntryStatus} onDeleteEntry={deletePrayerEntry} onOpenReference={openBibleReference} />}
              {activeView === 'journey' && <Journey completedLessons={completedLessons} toggleLesson={toggleLesson} bookmarks={bookmarks} toggleBookmark={toggleBookmark} reflections={journeyReflections} onSaveReflection={saveJourneyReflection} onNavigate={navigate} onOpenReference={openBibleReference} initialLessonId={journeyFocusLessonId} />}
              {activeView === 'faith' && <Faith progress={faithProgress} selectedDayId={faithSelectedDayId} onSelectDay={setFaithSelectedDayId} onStart={startFaithPath} onToggleDay={toggleFaithDay} onSaveTestimony={saveFaithTestimony} onNavigate={navigate} onOpenReference={openBibleReference} onOpenArticle={openArticle} />}
              {activeView === 'saved' && <Saved verses={runtimeVerses} languageId={selectedLanguage.id} bookmarks={bookmarks} highlights={highlights} notes={notes} journeyReflections={journeyReflections} savedStudyPacks={savedStudyPacks} toggleBookmark={toggleBookmark} toggleHighlight={toggleHighlight} saveNote={saveNote} onOpenArticle={openArticle} onOpenLesson={openJourneyLesson} onOpenReference={openBibleReference} onOpenStudyPack={openStudyPack} onToggleStudyPack={toggleSavedStudyPack} navigate={navigate} savedFolders={savedFolderState.folders} savedFolderAssignments={savedFolderState.assignments} onCreateFolder={createSavedFolder} onDeleteFolder={deleteSavedFolder} onAssignFolder={assignSavedItem} />}
              {activeView === 'downloads' && <Downloads guides={downloadedGuides} onOpenPack={openStudyPack} onOpenLearn={() => navigate('learn')} onRemove={removeDownloadedGuide} />}
              {activeView === 'library' && <Library assets={contentDatabase.sourceAssets || []} groups={contentDatabase.groups || []} initialGroup={libraryGroup} initialQuery={libraryQuery} onOpenLearn={() => navigate('learn')} onOpenFactsPath={openFactsPath} onOpenBible={openLibraryBibleDestination} />}
              {activeView === 'settings' && <Settings discreetMode={discreetMode} setDiscreetMode={setDiscreetMode} offlineMode={offlineMode} setOfflineMode={setOfflineMode} theme={theme} setTheme={setTheme} readerPreferences={readerPreferences} updateReaderPreference={updateReaderPreference} showPrivacyNotice={showPrivacyNotice} setShowPrivacyNotice={setShowPrivacyNotice} updateState={updateState} onCheckUpdates={checkForUpdates} onUpdateAction={handleUpdateAction} contentDatabase={contentDatabase} onOpenLibrary={() => navigate('library')} privacyPinEnabled={Boolean(privacyPin)} biometricAvailable={biometricAvailable} biometricEnabled={biometricEnabled} onEnablePrivacyLock={enablePrivacyLock} onDisablePrivacyLock={disablePrivacyLock} onEnableBiometric={enableBiometricUnlock} onDisableBiometric={() => setBiometricEnabled(false)} onLockApp={lockApp} onQuickClose={quickCloseApp} onDeletePrivateData={deletePrivateData} onShowOnboarding={() => setOnboardingComplete(false)} />}
            </>
          )}
        </div>
        <BottomNav activeView={activeView} selectedArticle={selectedArticle} languageId={selectedLanguage.id} onNavigate={navigate} />
      </main>
      {globalSearchOpen && <GlobalSearch articles={allArticles} lessons={lessons} sourceAssets={contentDatabase.sourceAssets || []} books={runtimeBooks} onClose={() => setGlobalSearchOpen(false)} onOpenBible={openGlobalBibleResult} onOpenArticle={openGlobalArticle} onOpenLibrary={openGlobalLibraryResult} onOpenStudyPack={(packId) => { openStudyPack(packId); setGlobalSearchOpen(false); }} onOpenFactsPath={(pathId) => { openFactsPath(pathId); setGlobalSearchOpen(false); }} onNavigate={(view) => { navigate(view); setGlobalSearchOpen(false); }} />}
    </div>
  );
}

function Onboarding({ theme, setTheme, setDiscreetMode, onComplete }) {
  const [phase, setPhase] = useState('decision');
  const [step, setStep] = useState(0);
  const slides = [
    {
      eyebrow: 'A quiet place to begin',
      title: 'Seek the truth. Meet Jesus.',
      description: 'From Islam to Christ is a private, Bible-centered guide for honest questions, careful reading, and a gentle next step.',
      points: [
        { icon: 'book', title: 'Read Scripture', text: 'Explore the offline Bible at your own pace.' },
        { icon: 'dialogue', title: 'Ask honestly', text: 'Find respectful answers to difficult questions.' },
      ],
    },
    {
      eyebrow: 'A guided path',
      title: 'Learn in a way that feels human.',
      description: 'Move from curiosity toward understanding with short lessons, linked passages, prayer prompts, and room to reflect.',
      points: [
        { icon: 'journey', title: 'Follow the Journey', text: 'Seven connected lessons introduce Jesus and the Gospel.' },
        { icon: 'hands', title: 'Take the next step', text: 'Save what matters and return when you are ready.' },
      ],
    },
    {
      eyebrow: 'Private by design',
      title: 'Your study stays on this device.',
      description: 'No account is required for reading or lessons. Bookmarks, notes, and progress are stored locally in this prototype.',
      points: [
        { icon: 'lock', title: 'Local first', text: 'There is no connected account, analytics, or remote reading history.' },
        { icon: 'shield', title: 'Know the limits', text: 'Discreet Mode reduces casual discovery but cannot guarantee complete secrecy.' },
      ],
    },
  ];
  const currentSlide = slides[step];
  const lastStep = step === slides.length - 1;

  if (phase === 'decision') return <DecisionScreen onEnterLight={() => setPhase('privacy')} />;
  if (phase === 'privacy') return <PrivacyProtectionPrompt onChoose={(enabled) => { setDiscreetMode(enabled); setPhase('guide'); }} />;

  return (
    <main className="onboarding-shell" aria-labelledby="onboarding-title">
      <div className="onboarding-backdrop" aria-hidden="true"><picture><source media="(max-width: 720px)" srcSet="./images/generated/heroes/hero-darkness-to-light-mobile.webp" /><img src="./images/generated/heroes/hero-darkness-to-light-desktop.webp" alt="" /></picture></div>
      <section className="onboarding-card">
        <div className="onboarding-header"><BrandMark /><button className="onboarding-theme-button" type="button" onClick={() => setTheme((current) => current === 'light' ? 'dark' : 'light')} aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}><Icon name={theme === 'light' ? 'moon' : 'sun'} size={16} /><span>{theme === 'light' ? 'Dark' : 'Light'}</span></button></div>
        <div className="onboarding-progress" aria-label={`Welcome step ${step + 1} of ${slides.length}`}>{slides.map((slide, index) => <button className={index === step ? 'active' : ''} type="button" key={slide.title} onClick={() => setStep(index)} aria-label={`Go to welcome step ${index + 1}`} aria-current={index === step ? 'step' : undefined} />)}</div>
        <div className="onboarding-copy" key={currentSlide.title}>
          <p className="eyebrow">{currentSlide.eyebrow}</p>
          <h1 id="onboarding-title">{currentSlide.title}</h1>
          <p className="onboarding-description">{currentSlide.description}</p>
          <div className="onboarding-points">{currentSlide.points.map((point) => <div className="onboarding-point" key={point.title}><span className="onboarding-point-icon"><Icon name={point.icon} size={19} /></span><span><strong>{point.title}</strong><small>{point.text}</small></span></div>)}</div>
        </div>
        <div className="onboarding-actions"><button className="primary-button onboarding-primary" type="button" onClick={() => lastStep ? onComplete('home') : setStep((current) => current + 1)}>{lastStep ? 'Start on Home' : 'Continue'} <Icon name="arrow" size={16} /></button>{lastStep && <button className="secondary-button onboarding-bible-button" type="button" onClick={() => onComplete('bible')}><Icon name="book" size={15} /> Open the Bible</button>}</div>
        <button className="onboarding-skip" type="button" onClick={() => onComplete('home')}>{lastStep ? 'I understand the privacy limits' : 'Skip welcome guide'}</button>
      </section>
    </main>
  );
}

function DecisionScreen({ onEnterLight }) {
  return (
    <main className="onboarding-shell decision-onboarding-shell" aria-labelledby="decision-title">
      <div className="onboarding-backdrop decision-backdrop" aria-hidden="true"><picture><source media="(max-width: 720px)" srcSet="./images/generated/heroes/hero-darkness-to-light-mobile.webp" /><img src="./images/generated/heroes/hero-darkness-to-light-desktop.webp" alt="" /></picture><span className="decision-light" /><span className="decision-cross"><Icon name="cross" size={58} strokeWidth={1.1} /></span></div>
      <section className="decision-card" aria-describedby="decision-message decision-reassurance decision-verse">
        <div className="decision-brand"><span>FROM ISLAM TO CHRIST</span><i /></div>
        <div className="decision-mark" aria-hidden="true"><Icon name="sunrise" size={28} strokeWidth={1.35} /></div>
        <p className="decision-eyebrow">A new beginning</p>
        <h1 id="decision-title">YOU MADE THE RIGHT DECISION</h1>
        <p id="decision-message" className="decision-message">Choosing to seek Jesus Christ is the most important decision of your life. You have opened the door to truth, hope, forgiveness, and the love of God.</p>
        <p id="decision-reassurance" className="decision-reassurance">You may still have questions. You may feel afraid, uncertain, or alone. You do not have to understand everything tonight. Take one honest step at a time—and let Jesus meet you there.</p>
        <blockquote id="decision-verse"><strong>John 14:6</strong><span>“I am the way, the truth, and the life. No one comes to the Father except through me.”</span></blockquote>
        <div className="decision-closing"><p>Your journey begins here.</p><button className="decision-enter-button" type="button" onClick={onEnterLight}>ENTER THE LIGHT <Icon name="arrow" size={17} /></button></div>
      </section>
    </main>
  );
}

function PrivacyProtectionPrompt({ onChoose }) {
  return (
    <main className="onboarding-shell privacy-onboarding-shell" aria-labelledby="privacy-prompt-title">
      <div className="privacy-prompt-backdrop" aria-hidden="true"><span className="privacy-prompt-door" /><span className="privacy-prompt-glow" /></div>
      <section className="privacy-prompt-card" aria-describedby="privacy-prompt-description privacy-prompt-limits">
        <div className="privacy-prompt-icon" aria-hidden="true"><Icon name="shield" size={29} /></div>
        <p className="decision-eyebrow">Privacy protection</p>
        <h1 id="privacy-prompt-title">Your safety comes first.</h1>
        <p id="privacy-prompt-description">Some people may face social, family, or personal danger if their interest in Christianity is discovered. This app can begin quietly and let you choose when to enter the protected experience.</p>
        <p>With Discreet Mode enabled, future startups use a neutral appearance and avoid obvious Christian imagery or wording until you intentionally enter the app. Your choice can be changed later in Settings.</p>
        <div className="privacy-prompt-actions"><button className="decision-enter-button" type="button" onClick={() => onChoose(true)}><Icon name="lock" size={17} /> Enable Discreet Mode</button><button className="privacy-prompt-secondary" type="button" onClick={() => onChoose(false)}>Not Now <Icon name="arrow" size={15} /></button></div>
        <p id="privacy-prompt-limits" className="privacy-prompt-note"><Icon name="info" size={14} /> Discreet Mode reduces casual discovery but cannot guarantee complete secrecy. It does not erase device records, screenshots, backups, or operating-system history.</p>
      </section>
    </main>
  );
}

function NeutralStartupScreen({ onEnter }) {
  return (
    <main className="discreet-startup-shell" aria-labelledby="discreet-startup-title">
      <div className="discreet-startup-atmosphere" aria-hidden="true"><span /><i /></div>
      <section className="discreet-startup-card">
        <div className="discreet-startup-mark" aria-hidden="true"><Icon name="lock" size={23} /></div>
        <p className="discreet-startup-eyebrow">Private space</p>
        <h1 id="discreet-startup-title">Your quiet space is ready.</h1>
        <p>This neutral welcome keeps the app’s identity out of view until you choose to continue. Your local study space remains on this device.</p>
        <button className="discreet-startup-button" type="button" onClick={onEnter}>OPEN PRIVATE SPACE <Icon name="arrow" size={16} /></button>
      </section>
    </main>
  );
}

function MobileDrawer({ activeView, selectedArticle, languageId = 'en', theme, setTheme, onNavigate, onClose }) {
  const dialogRef = useRef(null);
  useDialogFocus(dialogRef, onClose);

  return (
    <div className="mobile-drawer-layer" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <aside ref={dialogRef} className="mobile-drawer" role="dialog" aria-modal="true" aria-label="Navigation menu" tabIndex="-1">
        <div className="mobile-drawer-header"><div className="mobile-drawer-brand"><span>From Islam</span><strong>to Christ</strong></div><button className="icon-button" type="button" onClick={onClose} aria-label="Close navigation"><Icon name="close" size={18} /></button></div>
        <nav className="mobile-drawer-nav" aria-label="Mobile navigation menu">
          {navigation.map((item) => <NavButton key={item.id} item={item} languageId={languageId} active={activeView === item.id && !selectedArticle} onClick={() => onNavigate(item.id)} />)}
          <button className={`nav-button ${activeView === 'settings' && !selectedArticle ? 'active' : ''}`} type="button" onClick={() => onNavigate('settings')}><Icon name="shield" size={19} /><span>{getLanguageCopy(languageId, 'nav.settings', 'Privacy & settings')}</span>{activeView === 'settings' && !selectedArticle && <span className="nav-dot" />}</button>
        </nav>
        <div className="mobile-drawer-footer">
          <button className="drawer-theme-button" type="button" onClick={() => setTheme((current) => current === 'light' ? 'dark' : 'light')}><Icon name={theme === 'light' ? 'moon' : 'sun'} size={17} /><span>Use {theme === 'light' ? 'dark' : 'light'} mode</span></button>
          <p><Icon name="lock" size={15} /> Local only · no account required</p>
        </div>
      </aside>
    </div>
  );
}

function UpdateBanner({ updateState, onAction }) {
  const platform = updateState.platform || getUpdatePlatform();
  const isDownloaded = updateState.status === 'downloaded';
  const isDownloading = updateState.status === 'downloading';
  const needsPermission = updateState.status === 'permission-required';
  const isAndroid = platform === 'android';
  const title = isDownloaded ? 'Update ready to install' : needsPermission ? 'Allow Android installation' : isDownloading ? 'Downloading update' : isAndroid ? 'Android update available' : 'Update available';
  const detail = isDownloaded
    ? `Version ${updateState.version || updateState.latestVersion} is downloaded inside the app.`
    : needsPermission
      ? 'Android needs permission before the downloaded update can be installed.'
    : isDownloading
      ? `${updateState.percent || 0}% downloaded inside the app from GitHub.`
      : `Version ${updateState.version || updateState.latestVersion} is available from GitHub.`;
  const actionLabel = isDownloaded ? 'Install update' : needsPermission ? 'Allow installs' : isDownloading ? `${updateState.percent || 0}%` : isAndroid ? 'Download update' : 'Downloading…';
  const showAction = isAndroid ? !isDownloading : platform === 'windows' ? isDownloaded : true;

  return <section className="update-banner" role="status"><span className="update-banner-icon"><Icon name={isDownloaded ? 'check' : needsPermission ? 'lock' : 'sparkles'} size={18} /></span><span className="update-banner-copy"><strong>{title}</strong><small>{detail}</small></span>{showAction && <button className="update-banner-button" type="button" onClick={onAction}>{actionLabel}<Icon name="arrow" size={14} /></button>}{isDownloading && <span className="update-banner-progress">{actionLabel}</span>}</section>;
}

function TranslationStatus({ language, translationStatus = {}, onRetry, offlineMode = false }) {
  const status = translationStatus.status || 'starting';
  const pending = Number(translationStatus.pending) || 0;
  const failed = Number(translationStatus.failed) || 0;
  const isOffline = offlineMode || status === 'offline';
  const isWorking = !isOffline && (status === 'starting' || status === 'translating');
  const title = isOffline
    ? 'Offline-only language mode'
    : isWorking
    ? 'Preparing your language'
    : status === 'partial'
      ? 'Some text is waiting for translation'
      : 'Language ready';
  const detail = isOffline
    ? `Only bundled or cached translations are used in ${language.nativeLabel}. Online translation is paused.`
    : isWorking
    ? 'Public app text is being translated and cached on this device.'
    : status === 'partial'
      ? `${failed || pending} item${(failed || pending) === 1 ? '' : 's'} will retry when the connection is available.`
      : `Public app text is ready in ${language.nativeLabel}. Private notes and searches stay on this device.`;
  return <section className={`translation-status translation-status-${isOffline ? 'offline' : status}`} role="status" aria-live="polite"><span className="translation-status-icon"><Icon name={isWorking ? 'sparkles' : status === 'partial' ? 'refresh' : 'check'} size={16} /></span><span><strong>{title}</strong><small>{detail}</small></span>{isWorking && pending > 0 && <em>{pending} queued</em>}{!isOffline && status === 'partial' && <button className="translation-status-retry" type="button" onClick={onRetry}>Retry <Icon name="refresh" size={12} /></button>}</section>;
}

function BrandMark() {
  return (
    <div className="brand-mark">
      <div className="brand-symbol"><Icon name="cross" size={25} strokeWidth={1.7} /></div>
      <div className="brand-copy"><span>From Islam</span><strong>to Christ</strong></div>
    </div>
  );
}

function NavButton({ item, languageId = 'en', active, onClick }) {
  const label = getLanguageCopy(languageId, `nav.${item.id}`, item.label);
  return <button className={`nav-button ${active ? 'active' : ''}`} type="button" onClick={onClick}><Icon name={item.icon} size={19} /><span>{label}</span>{active && <span className="nav-dot" />}</button>;
}

function BottomNav({ activeView, selectedArticle, languageId = 'en', onNavigate }) {
  return <nav className="bottom-nav" aria-label="Mobile navigation">{navigation.filter((item) => !['library', 'downloads'].includes(item.id)).map((item) => <NavButton key={item.id} item={item} languageId={languageId} active={activeView === item.id && !selectedArticle} onClick={() => onNavigate(item.id)} />)}</nav>;
}

function GlobalSearch({ articles, lessons: journeyLessons, sourceAssets, books, onClose, onOpenBible, onOpenArticle, onOpenLibrary, onOpenStudyPack, onOpenFactsPath, onNavigate }) {
  const [query, setQuery] = useState('');
  const [bibleResults, setBibleResults] = useState([]);
  const [researchResults, setResearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const dialogRef = useRef(null);
  const normalizedQuery = query.trim().toLowerCase();
  const referenceLocation = resolveBibleReference(query, books);
  useDialogFocus(dialogRef, onClose, 'input');

  const articleResults = useMemo(() => {
    if (!normalizedQuery) return [];
    return articles.filter((article) => [article.title, article.summary, article.category, article.answerSummary, ...(article.body || [])].filter(Boolean).join(' ').toLowerCase().includes(normalizedQuery)).slice(0, 6);
  }, [articles, normalizedQuery]);
  const lessonResults = useMemo(() => {
    if (!normalizedQuery) return [];
    return journeyLessons.filter((lesson) => `${lesson.title} ${lesson.subtitle}`.toLowerCase().includes(normalizedQuery)).slice(0, 5);
  }, [journeyLessons, normalizedQuery]);
  const assetResults = useMemo(() => {
    if (!normalizedQuery) return [];
    return sourceAssets.filter((asset) => `${asset.name} ${asset.path} ${asset.type} ${asset.groupName}`.toLowerCase().includes(normalizedQuery)).slice(0, 5);
  }, [sourceAssets, normalizedQuery]);
  const studyPackResults = useMemo(() => {
    if (!normalizedQuery) return [];
    return studyPacks.filter((pack) => [pack.title, pack.label, pack.purpose, pack.description, pack.closingPrompt, ...(pack.resources || []).map((resource) => `${resource.label} ${resource.detail}`)].join(' ').toLowerCase().includes(normalizedQuery)).slice(0, 5);
  }, [normalizedQuery]);
  const factsPathResults = useMemo(() => {
    if (!normalizedQuery) return [];
    return factsInfoReadingPaths.filter((path) => [path.title, path.label, path.purpose, path.introduction, ...(path.readingSections || []).map((section) => `${section.title} ${section.text}`), ...(path.sourceSections || [])].join(' ').toLowerCase().includes(normalizedQuery)).slice(0, 5);
  }, [normalizedQuery]);
  const exactBibleResult = bibleResults.find((result) => result.reference.toLowerCase() === normalizedQuery);
  const visibleBibleResults = exactBibleResult ? bibleResults.filter((result) => result !== exactBibleResult) : bibleResults;
  const hasResults = Boolean(referenceLocation || articleResults.length || lessonResults.length || assetResults.length || researchResults.length || studyPackResults.length || factsPathResults.length || bibleResults.length);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previousOverflow; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setBibleResults([]);
    setResearchResults([]);
    if (!normalizedQuery) {
      setLoading(false);
      return undefined;
    }
    setLoading(true);
    const timer = window.setTimeout(async () => {
      try {
        const [verses, research] = await Promise.all([searchBibleVerses(query, 8), searchResearchEntries(query, 6)]);
        if (!cancelled) {
          setBibleResults(verses);
          setResearchResults(research);
        }
      } catch {
        if (!cancelled) {
          setBibleResults([]);
          setResearchResults([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 220);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [normalizedQuery, query]);

  function useQuickSearch(value) {
    setQuery(value);
    window.requestAnimationFrame(() => inputRef.current?.focus());
  }

  return <div className="global-search-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <section ref={dialogRef} className="global-search-modal" role="dialog" aria-modal="true" aria-labelledby="global-search-title" tabIndex="-1">
      <div className="global-search-heading"><div><p className="eyebrow">Local search</p><h2 id="global-search-title">Find your next step.</h2></div><button className="modal-close" type="button" onClick={onClose} aria-label="Close search"><Icon name="close" size={18} /></button></div>
      <div className="global-search-input"><Icon name="search" size={18} /><input ref={inputRef} value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => { if (event.key === 'Escape') onClose(); }} placeholder="Search Scripture, questions, lessons, or research" aria-label="Search all local content" /><kbd>Esc</kbd>{query && <button type="button" onClick={() => setQuery('')} aria-label="Clear global search"><Icon name="close" size={15} /></button>}</div>
      <div className="global-search-meta"><span><Icon name="lock" size={12} /> Searches stay on this device</span><span>Ctrl / ⌘ K anytime</span></div>
      {!normalizedQuery ? <div className="global-search-welcome"><span className="global-search-welcome-icon"><Icon name="sparkles" size={25} /></span><h3>Search the whole study space</h3><p>Look through the offline Bible, Muslim-seeker questions, foundational articles, Journey lessons, Study Packs, Facts &amp; Info paths, Strong’s, Vine’s, original-language alignments, and the indexed Data library.</p><div className="global-search-suggestions"><button type="button" onClick={() => useQuickSearch('John 1:1')}>John 1:1</button><button type="button" onClick={() => useQuickSearch('Who is Jesus')}>Who is Jesus?</button><button type="button" onClick={() => useQuickSearch('Trinity')}>Trinity</button><button type="button" onClick={() => useQuickSearch("Strong's")}>Strong’s</button><button type="button" onClick={() => useQuickSearch('Facts & Info')}>Facts &amp; Info</button></div></div> : <div className="global-search-results">
        {referenceLocation && <section className="global-search-section"><p className="global-search-section-label">Bible reference</p><button className="global-search-result global-search-reference" type="button" onClick={() => onOpenBible({ reference: query })}><span className="global-search-result-icon"><Icon name="book" size={18} /></span><span><strong>Open {query.trim()}</strong><small>Go to {books.find((book) => book.id === referenceLocation.bookId)?.name} chapter {referenceLocation.chapter} in the reader.</small></span><Icon name="arrow" size={15} /></button></section>}
        {visibleBibleResults.length > 0 && <SearchResultSection label="Bible verses" count={visibleBibleResults.length}>{visibleBibleResults.map((result) => <button className="global-search-result" type="button" key={`bible-${result.reference}`} onClick={() => onOpenBible(result)}><span className="global-search-result-icon tone-blue"><Icon name="book" size={18} /></span><span><strong>{result.reference}</strong><small>{result.text}</small></span><Icon name="arrow" size={15} /></button>)}</SearchResultSection>}
        {articleResults.length > 0 && <SearchResultSection label="Questions & articles" count={articleResults.length}>{articleResults.map((article) => <button className="global-search-result" type="button" key={`article-${article.id}`} onClick={() => onOpenArticle(article)}><span className={`global-search-result-icon tone-${article.tone || 'slate'}`}><Icon name={article.icon || 'learn'} size={18} /></span><span><strong>{article.title}</strong><small>{article.category} · {article.summary}</small></span><Icon name="arrow" size={15} /></button>)}</SearchResultSection>}
        {lessonResults.length > 0 && <SearchResultSection label="Journey lessons" count={lessonResults.length}>{lessonResults.map((lesson) => <button className="global-search-result" type="button" key={`lesson-${lesson.id}`} onClick={() => onNavigate('journey')}><span className="global-search-result-icon tone-green"><Icon name={lesson.icon} size={18} /></span><span><strong>{lesson.title}</strong><small>{lesson.subtitle}</small></span><Icon name="arrow" size={15} /></button>)}</SearchResultSection>}
        {studyPackResults.length > 0 && <SearchResultSection label="Study Packs" count={studyPackResults.length}>{studyPackResults.map((pack) => <button className="global-search-result" type="button" key={`pack-${pack.id}`} onClick={() => onOpenStudyPack?.(pack.id)}><span className={`global-search-result-icon tone-${pack.tone || 'gold'}`}><Icon name={pack.icon || 'database'} size={18} /></span><span><strong>{pack.title}</strong><small>{pack.label} · {pack.purpose}</small></span><Icon name="arrow" size={15} /></button>)}</SearchResultSection>}
        {factsPathResults.length > 0 && <SearchResultSection label="Facts & Info paths" count={factsPathResults.length}>{factsPathResults.map((path) => <button className="global-search-result" type="button" key={`facts-path-${path.id}`} onClick={() => onOpenFactsPath?.(path.id)}><span className={`global-search-result-icon tone-${path.tone || 'gold'}`}><Icon name={path.icon || 'info'} size={18} /></span><span><strong>{path.title}</strong><small>{path.label} · {path.purpose}</small></span><Icon name="arrow" size={15} /></button>)}</SearchResultSection>}
        {researchResults.length > 0 && <SearchResultSection label="Word study & original languages" count={researchResults.length}>{researchResults.map((result) => <button className="global-search-result" type="button" key={result.id} onClick={() => onOpenLibrary({ ...result, query })}><span className="global-search-result-icon tone-violet"><Icon name="scroll" size={18} /></span><span><strong>{result.title}</strong><small>{result.collection} · {result.detail}</small></span><Icon name="arrow" size={15} /></button>)}</SearchResultSection>}
        {assetResults.length > 0 && <SearchResultSection label="Data library" count={assetResults.length}>{assetResults.map((asset) => <button className="global-search-result" type="button" key={`asset-${asset.id}`} onClick={() => onOpenLibrary({ ...asset, query })}><span className="global-search-result-icon tone-gold"><Icon name={assetIcon(asset.category)} size={18} /></span><span><strong>{formatSourceTitle(asset.name)}</strong><small>{asset.groupName} · {asset.type}</small></span><Icon name="arrow" size={15} /></button>)}</SearchResultSection>}
        {loading && <div className="global-search-loading" role="status"><span className="loading-dot" /> Searching the offline index…</div>}
        {!loading && !hasResults && <div className="global-search-no-results"><span><Icon name="search" size={22} /></span><h3>No local matches</h3><p>Try a Bible reference, a shorter phrase, or a topic such as grace, prayer, Trinity, or salvation.</p></div>}
      </div>}
    </section>
  </div>;
}

function SearchResultSection({ label, count, children }) {
  return <section className="global-search-section"><div className="global-search-section-heading"><p className="global-search-section-label">{label}</p><span>{count}</span></div><div className="global-search-result-list">{children}</div></section>;
}

function BibleSearchResults({ query, results = [], loading, onOpenResult }) {
  return <div className="bible-search-results" role="status" aria-live="polite">
    <div className="bible-search-heading"><span>Search results</span>{!loading && results.length > 0 && <small>{results.length} local matches</small>}</div>
    {loading && <div className="bible-search-loading"><span className="loading-dot" /> Searching the offline Bible…</div>}
    {!loading && results.length > 0 && <div className="bible-search-list">{results.map((result) => <button className="bible-search-result" type="button" key={result.reference} onClick={() => onOpenResult?.(result)}><span className="bible-search-result-icon"><Icon name="book" size={15} /></span><span><strong>{result.reference}</strong><small>{result.text}</small></span><Icon name="arrow" size={14} /></button>)}</div>}
    {!loading && results.length === 0 && <p className="bible-search-empty">No verses matched <span data-private-content="true">“{query.trim()}”</span>. Try a shorter word or phrase.</p>}
  </div>;
}

function SectionIntro({ eyebrow, title, description, action }) {
  return <div className="section-intro"><div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1>{description && <p className="section-description">{description}</p>}</div>{action}</div>;
}

function SectionArt({ art }) {
  if (!art) return null;
  return <figure className="section-art-banner"><img src={art.src} alt={art.alt} width="1600" height="800" loading="lazy" /><figcaption>{art.label}</figcaption></figure>;
}

const DIALOG_FOCUSABLE_SELECTOR = 'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function useDialogFocus(dialogRef, onClose, initialSelector = '') {
  const closeRef = useRef(onClose);

  useEffect(() => {
    closeRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return undefined;
    const previouslyFocused = document.activeElement;
    const initialTarget = (initialSelector && dialog.querySelector(initialSelector)) || dialog.querySelector(DIALOG_FOCUSABLE_SELECTOR);
    initialTarget?.focus();

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeRef.current?.();
        return;
      }
      if (event.key !== 'Tab') return;
      const focusable = [...dialog.querySelectorAll(DIALOG_FOCUSABLE_SELECTOR)].filter((element) => element.offsetParent !== null);
      if (focusable.length === 0) {
        event.preventDefault();
        dialog.focus();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    dialog.addEventListener('keydown', handleKeyDown);
    return () => {
      dialog.removeEventListener('keydown', handleKeyDown);
      if (previouslyFocused?.isConnected && typeof previouslyFocused.focus === 'function') previouslyFocused.focus();
    };
  }, [dialogRef, initialSelector]);
}

function Home({ onNavigate, onOpenArticle, onOpenBibleReference, onOpenJourneyLesson, bookmarks, toggleBookmark, completedLessons, bibleLocation, bibleHistory = [], books = [], dailyVerse = null, languageId = 'en', studyPlan, onSelectStudyFocus, onToggleStudyStep, onOpenStudyStep, readingPlanState, onSelectReadingPlan, onToggleReadingPlanStep, onOpenReadingPlanStep, factsPathProgress = {}, onOpenFactsPath }) {
  const [shareMessage, setShareMessage] = useState('');
  const progress = Math.round((completedLessons.length / lessons.length) * 100);
  const currentBook = books.find((book) => book.id === bibleLocation?.bookId) || books[0] || { name: 'John', id: 'JHN' };
  const currentChapter = Number(bibleLocation?.chapter) || 1;
  const currentReadingLabel = `${currentBook.name} ${currentChapter}`;
  const nextJourneyLesson = lessons.find((lesson) => !completedLessons.includes(lesson.id) && (lesson.id === 1 || completedLessons.includes(lesson.id - 1))) || lessons[lessons.length - 1];
  const journeyComplete = completedLessons.length >= lessons.length;
  const verseOfDay = dailyVerse || { reference: 'John 1:5', text: 'The light shines in the darkness, and the darkness has not overcome it.', bookId: 'JHN', chapter: 1, number: 5 };
  const hasLocalVerseTranslation = Boolean(verseOfDay.translations?.[languageId]);
  const displayedVerseText = verseOfDay.translations?.[languageId] || verseOfDay.text;
  const verseInsight = dailyVerseContent[verseOfDay.reference] || dailyVerseContent.default;
  const verseOfDayId = stableVerseId(verseOfDay);
  const factsTotalSections = factsInfoReadingPaths.reduce((total, path) => total + (path.readingSections?.length || 0), 0);
  const factsCompletedSections = factsInfoReadingPaths.reduce((total, path) => total + (Array.isArray(factsPathProgress[path.id]) ? factsPathProgress[path.id].filter((title) => path.readingSections.some((section) => section.title === title)).length : 0), 0);
  const factsNextPath = factsInfoReadingPaths.find((path) => (factsPathProgress[path.id] || []).length < (path.readingSections?.length || 0)) || factsInfoReadingPaths[0];
  const factsProgressPercent = factsTotalSections ? Math.round((factsCompletedSections / factsTotalSections) * 100) : 0;
  async function shareDailyVerse() {
    const sharedVerseText = hasLocalVerseTranslation || languageId === 'en'
      ? displayedVerseText
      : await requestAutomaticTranslation(verseOfDay.text, languageId) || displayedVerseText;
    const text = `${sharedVerseText}\n— ${verseOfDay.reference}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: 'A verse for today', text });
        setShareMessage('Ready to share');
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        setShareMessage('Verse copied');
      } else {
        throw new Error('Sharing is unavailable.');
      }
      window.setTimeout(() => setShareMessage(''), 2400);
    } catch (error) {
      if (error?.name !== 'AbortError') setShareMessage('Copy unavailable');
    }
  }
  return (
    <div className="home-page page-enter">
      <section className="hero-panel">
        <div className="hero-copy">
          <p className="eyebrow hero-eyebrow"><span className="eyebrow-line" /> A safe place to explore Jesus</p>
          <h1>From Islam<br /><em>to Christ</em></h1>
          <p className="hero-lede">Truth. Peace. A new beginning.</p>
          <p className="hero-verse">“I am the way, the truth, and the life.”<br /><span>— John 14:6</span></p>
          <button className="primary-button hero-button" type="button" onClick={() => onNavigate('journey')}>Begin your journey <Icon name="arrow" size={18} /></button>
        </div>
        <div className="hero-art" aria-hidden="true"><picture><source media="(max-width: 570px)" srcSet="./images/generated/heroes/hero-darkness-to-light-mobile.webp" /><img src="./images/generated/heroes/hero-darkness-to-light-desktop.webp" alt="" width="1600" height="900" loading="eager" /></picture></div>
        <div className="hero-tag"><Icon name="lock" size={14} /> Local-first & private</div>
      </section>

      <div className="home-grid">
        <section className="continue-card card-surface">
          <div className="card-heading-row"><div><p className="eyebrow">Your journey</p><h2>Steps toward the light</h2></div><span className="progress-fraction">{completedLessons.length} of {lessons.length}</span></div>
          <div className="progress-track"><span style={{ width: `${Math.max(progress, 14)}%` }} /></div>
          <div className="home-continue-options">
            <div className="continue-content home-continue-option"><div className="lesson-badge"><Icon name="book" size={22} /></div><div><strong>Continue reading</strong><p>Return to {currentReadingLabel} in the offline Bible.</p></div><button className="round-arrow" type="button" onClick={() => onNavigate('bible')} aria-label={`Continue reading ${currentReadingLabel}`}><Icon name="arrow" size={17} /></button></div>
            {nextJourneyLesson && <div className="continue-content home-continue-option"><div className="lesson-badge journey-badge"><Icon name={nextJourneyLesson.icon} size={22} /></div><div><strong>{journeyComplete ? 'Review your journey' : 'Resume your journey'}</strong><p>{journeyComplete ? 'Revisit the final lesson and your reflections.' : `Next: ${nextJourneyLesson.title}.`}</p></div><button className="round-arrow" type="button" onClick={() => onOpenJourneyLesson?.(nextJourneyLesson.id)} aria-label={`${journeyComplete ? 'Review' : 'Resume'} ${nextJourneyLesson.title}`}><Icon name="arrow" size={17} /></button></div>}
          </div>
        </section>

        <section className="verse-card card-surface">
          <div className="card-heading-row"><p className="eyebrow">A verse for today</p><button className={`bookmark-button ${bookmarks.includes(verseOfDayId) ? 'saved' : ''}`} type="button" onClick={() => toggleBookmark(verseOfDayId)} aria-label={`${bookmarks.includes(verseOfDayId) ? 'Remove' : 'Save'} ${verseOfDay.reference}`} aria-pressed={bookmarks.includes(verseOfDayId)}><Icon name="bookmark" size={18} /></button></div>
          <blockquote data-no-translate={hasLocalVerseTranslation ? 'true' : undefined}>“{displayedVerseText}”</blockquote>
          <div className="verse-insight"><strong>{verseInsight.title}</strong><p>{verseInsight.explanation}</p></div>
          <div className="verse-footer"><span>{verseOfDay.reference}</span><div className="verse-footer-actions"><button type="button" onClick={shareDailyVerse}><Icon name="share" size={14} /> Share</button><button type="button" onClick={() => onOpenBibleReference?.(verseOfDay.reference)}>Open <Icon name="arrow" size={14} /></button></div>{shareMessage && <small className="verse-share-status" role="status">{shareMessage}</small>}</div>
        </section>
      </div>

      <RecentBibleHistory history={bibleHistory} books={books} onOpenReference={onOpenBibleReference} />

      <PersonalStudyFocus studyPlan={studyPlan} onSelectFocus={onSelectStudyFocus} onToggleStep={onToggleStudyStep} onOpenStep={onOpenStudyStep} />

      <ReadingPlanShelf readingPlanState={readingPlanState} onSelectPlan={onSelectReadingPlan} onToggleStep={onToggleReadingPlanStep} onOpenStep={onOpenReadingPlanStep} />

      <FactsInfoHomeCard completedSections={factsCompletedSections} totalSections={factsTotalSections} progressPercent={factsProgressPercent} nextPath={factsNextPath} onOpenPath={onOpenFactsPath} />

      <section className="quick-section"><div className="section-label-row"><div><p className="eyebrow">Continue exploring</p><h2>Where would you like to begin?</h2></div><button className="text-button" type="button" onClick={() => onNavigate('learn')}>View all <Icon name="arrow" size={15} /></button></div><div className="quick-grid">
        <QuickCard icon="sunrise" tone="gold" title="Who is Jesus?" text="Discover His life, teachings, and why He matters." onClick={() => onOpenArticle(articles[0])} />
        <QuickCard icon="dialogue" tone="blue" title="Ask your questions" text="Clear, respectful answers for a thoughtful journey." onClick={() => onNavigate('learn')} />
        <QuickCard icon="sprout" tone="green" title="Faith basics" text="Understand the foundations of Christian faith." onClick={() => onOpenArticle(articles[3])} />
        <QuickCard icon="heart" tone="violet" title="I believe in Jesus" text="Begin a private 30-day path with Jesus." onClick={() => onNavigate('faith')} />
        <QuickCard icon="database" tone="violet" title="Research library" text="Explore Strong's, Vine's, facts, and information sources." onClick={() => onNavigate('library')} />
      </div></section>
    </div>
  );
}

function FactsInfoHomeCard({ completedSections = 0, totalSections = 0, progressPercent = 0, nextPath, onOpenPath }) {
  if (!nextPath) return null;
  return <section className="home-facts-card card-surface" aria-labelledby="home-facts-heading">
    <div className="home-facts-art"><img src={sectionArt.factsInfo.src} alt={sectionArt.factsInfo.alt} width="1600" height="800" loading="lazy" /></div>
    <div className="home-facts-content">
      <div className="home-facts-heading"><div><p className="eyebrow">Facts &amp; Info</p><h2 id="home-facts-heading">Read difficult questions with care.</h2><p className="section-description">Purpose-led research paths turn the supplied studies into clear sections, Scripture trails, and honest review boundaries.</p></div><span className="home-facts-icon"><Icon name="learn" size={22} /></span></div>
      <div className="home-facts-progress"><div><span>{completedSections} of {totalSections} research sections marked read</span><strong>{progressPercent}%</strong></div><div className="progress-track"><span style={{ width: `${Math.max(progressPercent, completedSections ? 10 : 0)}%` }} /></div></div>
      <div className="home-facts-next"><div><p className="eyebrow">Next suggested path</p><strong>{nextPath.title}</strong><span>{nextPath.purpose}</span></div><button className="primary-button" type="button" onClick={() => onOpenPath?.(nextPath.id)}>Continue research <Icon name="arrow" size={15} /></button></div>
    </div>
  </section>;
}

function RecentBibleHistory({ history = [], books = [], onOpenReference }) {
  const visibleHistory = history.map((entry) => {
    const book = books.find((candidate) => candidate.id === entry.bookId);
    return book ? { ...entry, bookName: book.name } : null;
  }).filter(Boolean).slice(0, 6);

  if (visibleHistory.length === 0) return null;

  return <section className="recent-bible-history card-surface" aria-labelledby="recent-bible-history-heading">
    <div className="recent-bible-history-heading"><div><p className="eyebrow">Private reading history</p><h2 id="recent-bible-history-heading">Return to what you were reading.</h2><p className="section-description">Your last Bible chapters stay on this device so you can continue without searching again.</p></div><span className="recent-bible-history-icon"><Icon name="history" size={21} /></span></div>
    <div className="recent-bible-history-list">{visibleHistory.map((entry) => <button className="recent-bible-history-item" type="button" key={`${entry.bookId}-${entry.chapter}`} onClick={() => onOpenReference?.(`${entry.bookName} ${entry.chapter}`)}><span className="recent-bible-history-item-icon"><Icon name="book" size={16} /></span><span><strong>{entry.bookName} {entry.chapter}</strong><small>Open chapter</small></span><Icon name="arrow" size={14} /></button>)}</div>
    <p className="recent-bible-history-note"><Icon name="lock" size={13} /> Reading history is private and is removed by Delete local data.</p>
  </section>;
}

function ReadingPlanShelf({ readingPlanState = {}, onSelectPlan, onToggleStep, onOpenStep }) {
  const selectedPlan = readingPlans.find((plan) => plan.id === readingPlanState?.selectedPlanId) || readingPlans[0];
  const completedSteps = selectedPlan && Array.isArray(readingPlanState?.completedByPlan?.[selectedPlan.id]) ? readingPlanState.completedByPlan[selectedPlan.id] : [];
  const completedCount = selectedPlan?.steps.filter((step) => completedSteps.includes(step.id)).length || 0;
  const completionPercent = selectedPlan?.steps.length ? Math.round((completedCount / selectedPlan.steps.length) * 100) : 0;

  if (!selectedPlan) return null;

  return <section className="reading-plan-shelf card-surface" aria-labelledby="reading-plan-heading">
    <div className="reading-plan-art"><img src={sectionArt.readingPlans.src} alt={sectionArt.readingPlans.alt} width="1600" height="800" loading="lazy" /></div>
    <div className="reading-plan-content">
      <div className="reading-plan-heading"><div><p className="eyebrow">Guided Bible reading</p><h2 id="reading-plan-heading">Follow the story at your own pace.</h2><p className="section-description">Choose a path through the Bible, read one chapter at a time, and mark what you have truly read. Progress stays private on this device.</p></div><span className="reading-plan-icon"><Icon name="book" size={22} /></span></div>
      <div className="reading-plan-choice-grid" aria-label="Bible reading plans">{readingPlans.map((plan) => <button className={`reading-plan-choice ${selectedPlan.id === plan.id ? 'active' : ''}`} type="button" key={plan.id} onClick={() => onSelectPlan?.(plan.id)} aria-pressed={selectedPlan.id === plan.id}><span className={`reading-plan-choice-icon tone-${plan.tone}`}><Icon name={plan.icon} size={17} /></span><span><strong>{plan.label}</strong><small>{plan.purpose}</small></span><Icon name="chevron" size={14} /></button>)}</div>
      <div className="reading-plan-detail">
        <div className="reading-plan-detail-heading"><div><p className="eyebrow">{selectedPlan.purpose}</p><h3>{selectedPlan.label}</h3><p>{selectedPlan.description}</p></div><span className="reading-plan-local"><Icon name="lock" size={12} /> Local</span></div>
        <div className="reading-plan-progress"><div><span>{completedCount} of {selectedPlan.steps.length} readings marked complete</span><strong>{completionPercent}%</strong></div><div className="progress-track"><span style={{ width: `${Math.max(completionPercent, completedCount ? 10 : 0)}%` }} /></div></div>
        <div className="reading-plan-step-list">{selectedPlan.steps.map((step, index) => { const complete = completedSteps.includes(step.id); return <article className={`reading-plan-step ${complete ? 'complete' : ''}`} key={step.id}><button className="reading-plan-marker" type="button" onClick={() => onToggleStep?.(step.id)} aria-label={`${complete ? 'Mark' : 'Complete'} ${step.label}`}><span>{complete ? <Icon name="check" size={13} /> : index + 1}</span></button><div className="reading-plan-step-copy"><strong>{step.label}</strong><small>{step.detail}</small><span>{step.reference}</span></div><button className="reading-plan-open" type="button" onClick={() => onOpenStep?.(step)}>{complete ? 'Review' : 'Open'} <Icon name="arrow" size={13} /></button></article>; })}</div>
      </div>
    </div>
  </section>;
}

function PersonalStudyFocus({ studyPlan = {}, onSelectFocus, onToggleStep, onOpenStep }) {
  const plan = studyPlan && typeof studyPlan === 'object' ? studyPlan : {};
  const [choosing, setChoosing] = useState(!plan.focusId);
  const focus = studyFoci.find((candidate) => candidate.id === plan.focusId) || null;
  const completedSteps = Array.isArray(plan.completedSteps) ? plan.completedSteps : [];
  const completedCount = focus ? focus.steps.filter((step) => completedSteps.includes(step.id)).length : 0;

  useEffect(() => {
    if (!focus) setChoosing(true);
  }, [focus]);

  function chooseFocus(focusId) {
    onSelectFocus?.(focusId);
    setChoosing(false);
  }

  return <section className="personal-study-focus card-surface" aria-labelledby="personal-study-focus-heading">
    <div className="personal-study-art"><img src={sectionArt.studyFocus.src} alt={sectionArt.studyFocus.alt} width="900" height="420" loading="lazy" /></div>
    <div className="personal-study-content">
      <div className="personal-study-heading"><div><p className="eyebrow">Private study focus</p><h2 id="personal-study-focus-heading">Choose the question you want to carry next.</h2><p className="section-description">This small plan is saved only on this device. It offers a direction, not pressure or a required conversion sequence.</p></div><span className="personal-study-icon"><Icon name={focus?.icon || 'compass'} size={23} /></span></div>
      {choosing || !focus ? <div className="study-focus-choices">{studyFoci.map((option) => <button className="study-focus-choice" type="button" key={option.id} onClick={() => chooseFocus(option.id)}><span className={`study-focus-choice-icon tone-${option.tone}`}><Icon name={option.icon} size={18} /></span><span><strong>{option.label}</strong><small>{option.description}</small></span><Icon name="arrow" size={14} /></button>)}</div> : <>
        <div className="personal-study-plan-heading"><div><span className={`personal-study-label tone-${focus.tone}`}><Icon name={focus.icon} size={13} /> {focus.label}</span><p>{focus.description}</p></div><button className="text-button subtle" type="button" onClick={() => setChoosing(true)}>Change focus <Icon name="chevron" size={14} /></button></div>
        <div className="personal-study-progress"><span>{completedCount} of {focus.steps.length} steps marked complete</span><div className="progress-track"><span style={{ width: `${Math.max((completedCount / focus.steps.length) * 100, completedCount ? 10 : 0)}%` }} /></div></div>
        <div className="personal-study-steps">{focus.steps.map((step, index) => { const complete = completedSteps.includes(step.id); return <article className={`personal-study-step ${complete ? 'complete' : ''}`} key={step.id}><button className="personal-study-marker" type="button" onClick={() => onToggleStep?.(step.id)} aria-label={`${complete ? 'Mark' : 'Complete'} ${step.label}`}><span>{complete ? <Icon name="check" size={14} /> : index + 1}</span></button><div className="personal-study-step-copy"><strong>{step.label}</strong><small>{step.detail}</small></div><div className="personal-study-step-actions"><button className="personal-study-open" type="button" onClick={() => onOpenStep?.(step)}>{complete ? 'Review' : 'Open'} <Icon name="arrow" size={13} /></button><button className="personal-study-complete" type="button" onClick={() => onToggleStep?.(step.id)}>{complete ? 'Ongoing' : 'Done'}</button></div></article>; })}</div>
      </>}
    </div>
  </section>;
}

function QuickCard({ icon, tone, title, text, onClick }) {
  return <button className="quick-card" type="button" onClick={onClick}><span className={`quick-icon tone-${tone}`}><Icon name={icon} size={21} /></span><span className="quick-card-copy"><strong>{title}</strong><small>{text}</small></span><Icon name="chevron" size={17} /></button>;
}

function formatAlignmentMetadata(alignment) {
  return Object.entries(alignment?.morphology || {})
    .filter(([, value]) => value !== '' && value !== null && value !== undefined)
    .slice(0, 6)
    .map(([key, value]) => `${key.replace(/_/g, ' ')}: ${value}`)
    .join(' · ');
}

function WordStudyCard({ entries, loading, onOpenOccurrence }) {
  const [selectedNumber, setSelectedNumber] = useState(null);
  const visibleEntries = entries.slice(0, 8);
  const selectedEntry = visibleEntries.find((entry) => entry.strongNumber === selectedNumber) || null;

  useEffect(() => {
    if (selectedNumber && !entries.some((entry) => entry.strongNumber === selectedNumber)) setSelectedNumber(null);
  }, [entries, selectedNumber]);

  return (
    <div className="word-study-card" id="bible-word-study">
      <div className="word-study-heading">
        <div><p className="eyebrow">Word study</p><h3>Strong's, Vine's &amp; original languages</h3></div>
        <span>{loading ? 'Loading…' : `${entries.length} terms`}</span>
      </div>
      <p className="word-study-description">Linked lexical entries from the local Strong's and Vine's sources, with derived BHSA Hebrew and Nestle 1904 Greek alignment when available. Select a term to inspect it without leaving the reader.</p>
      {loading ? <div className="word-study-loading" role="status"><span className="loading-dot" /> Loading word-study entries…</div> : entries.length > 0 ? <>
        <div className="word-study-list">
          {visibleEntries.map((entry) => <button className={`word-study-entry ${selectedNumber === entry.strongNumber ? 'selected' : ''}`} type="button" key={entry.strongNumber} onClick={() => setSelectedNumber((current) => current === entry.strongNumber ? null : entry.strongNumber)} aria-expanded={selectedNumber === entry.strongNumber}>
            <div className="word-study-entry-heading"><strong>{entry.strongNumber}</strong><span>{entry.language}{entry.lemma ? ` · ${entry.lemma}` : ''}</span><Icon name="chevron" size={14} /></div>
            <p>{entry.strongsDefinition || entry.kjvDefinition || 'Definition available in the local lexicon.'}</p>
            <div className="word-study-entry-meta"><span>{entry.occurrenceCount.toLocaleString()} occurrence{entry.occurrenceCount === 1 ? '' : 's'}</span>{entry.vines[0] && <span>Vine's · {entry.vines[0].title}</span>}{entry.originalLanguage?.length > 0 && <span>{entry.originalLanguage.map((alignment) => alignment.corpus).join(' · ')}</span>}</div>
          </button>)}
        </div>
        {selectedEntry && <div className="word-study-detail">
          <div className="word-study-detail-heading"><div><p className="eyebrow">Selected term</p><h4>{selectedEntry.strongNumber} · {selectedEntry.lemma || 'Lexical entry'}</h4></div><button type="button" className="word-study-close" onClick={() => setSelectedNumber(null)} aria-label="Close word-study details"><Icon name="close" size={15} /></button></div>
          <dl className="word-study-facts">
            <div><dt>Language</dt><dd>{selectedEntry.language || 'Original language'}</dd></div>
            <div><dt>Transliteration</dt><dd>{selectedEntry.transliteration || 'Not listed'}</dd></div>
            <div><dt>Meaning</dt><dd>{selectedEntry.strongsDefinition || selectedEntry.kjvDefinition || 'Definition available in the local lexicon.'}</dd></div>
            {selectedEntry.derivation && <div><dt>Derivation</dt><dd>{selectedEntry.derivation}</dd></div>}
          </dl>
          {selectedEntry.originalLanguage?.length > 0 && <div className="word-study-alignment"><div className="word-study-alignment-heading"><p className="eyebrow">Original-language alignment</p><span>Review</span></div><p className="word-study-alignment-note">Compact derived metadata from the local alignment sources. The raw BHS and N1904 research files remain outside the renderer bundle until their review is complete.</p><div className="word-study-alignment-list">{selectedEntry.originalLanguage.map((alignment) => <div className="word-study-alignment-entry" key={`${selectedEntry.strongNumber}-${alignment.corpus}`}><div><strong>{alignment.corpus === 'BHSA' ? 'BHSA · Hebrew' : 'N1904 · Greek'}</strong><span>{alignment.lemma || 'Lemma not listed'}{alignment.transliteration ? ` · ${alignment.transliteration}` : ''}</span></div><small>{alignment.occurrenceCount.toLocaleString()} aligned occurrences</small>{alignment.gloss && <p>{alignment.gloss}</p>}{formatAlignmentMetadata(alignment) && <em>{formatAlignmentMetadata(alignment)}</em>}</div>)}</div></div>}
          {selectedEntry.vines[0] && <div className="word-study-vines"><p className="eyebrow">Vine's reference</p><strong>{selectedEntry.vines[0].title}{selectedEntry.vines[0].gloss ? ` · ${selectedEntry.vines[0].gloss}` : ''}</strong><p>{selectedEntry.vines[0].definition || 'Expository reference available in the local Vine’s index.'}</p></div>}
          <div className="word-study-related"><div className="word-study-related-heading"><p className="eyebrow">Related verses</p><span>{selectedEntry.occurrenceCount.toLocaleString()} total</span></div>{selectedEntry.occurrences.length > 0 ? <div className="related-verse-list">{selectedEntry.occurrences.map((occurrence) => <button type="button" key={`${selectedEntry.strongNumber}-${occurrence.reference}`} onClick={() => onOpenOccurrence?.(occurrence)}><strong>{occurrence.reference}</strong><span>{occurrence.text}</span><Icon name="arrow" size={14} /></button>)}</div> : <p className="word-study-empty">No verse occurrences are indexed for this term.</p>}{selectedEntry.occurrenceCount > selectedEntry.occurrences.length && <small className="word-study-more">Showing the first {selectedEntry.occurrences.length} occurrences from the local KJV index.</small>}</div>
        </div>}
      </> : <p className="word-study-empty">No linked lexicon entries were found for this chapter.</p>}
    </div>
  );
}

function InterlinearCard({ verses = [], entries = [], loading }) {
  const [selectedVerseNumber, setSelectedVerseNumber] = useState(verses[0]?.number || null);
  const entryByNumber = useMemo(() => new Map(entries.map((entry) => [entry.strongNumber, entry])), [entries]);
  const selectedVerse = verses.find((verse) => Number(verse.number) === Number(selectedVerseNumber)) || verses[0] || null;
  const alignedWords = (selectedVerse?.strongs || []).map((strongNumber) => ({ strongNumber, entry: entryByNumber.get(strongNumber) })).filter(({ entry }) => entry);

  useEffect(() => {
    if (!verses.some((verse) => Number(verse.number) === Number(selectedVerseNumber))) setSelectedVerseNumber(verses[0]?.number || null);
  }, [selectedVerseNumber, verses]);

  return <section className="interlinear-card" aria-labelledby="interlinear-title">
    <div className="interlinear-heading"><div><p className="eyebrow">Interlinear study</p><h3 id="interlinear-title">See the words behind the verse.</h3></div><Icon name="scroll" size={19} /></div>
    <p className="interlinear-description">A verse-level view of the local Strong's links, with Hebrew or Greek lemma, transliteration, gloss, and lexical context where available.</p>
    {verses.length > 0 && <label className="interlinear-verse-select"><span>Choose a verse</span><select value={selectedVerse?.number || ''} onChange={(event) => setSelectedVerseNumber(Number(event.target.value))}>{verses.map((verse) => <option key={verse.number} value={verse.number}>{verse.reference}</option>)}</select><Icon name="chevron" size={13} /></label>}
    {loading ? <div className="word-study-loading" role="status"><span className="loading-dot" /> Loading linked words…</div> : alignedWords.length > 0 ? <>
      <div className="interlinear-word-list">{alignedWords.map(({ strongNumber, entry }) => {
        const alignment = entry.originalLanguage?.[0];
        const languageLabel = alignment?.corpus === 'BHSA' ? 'Hebrew' : alignment?.corpus === 'N1904' ? 'Greek' : entry.language || 'Original language';
        return <article className="interlinear-word" key={`${selectedVerse?.reference}-${strongNumber}`}><div className="interlinear-word-number"><strong>{strongNumber}</strong><small>{languageLabel}</small></div><div className="interlinear-word-copy"><strong>{alignment?.lemma || entry.lemma || 'Lemma not listed'}</strong><span>{alignment?.transliteration || entry.transliteration || 'Transliteration not listed'}</span><p>{alignment?.gloss || entry.kjvDefinition || entry.strongsDefinition || 'Gloss available in the local lexicon.'}</p></div></article>;
      })}</div>
      <p className="interlinear-note"><Icon name="info" size={13} /> Strong's-aligned study rows are available locally. The current reviewed runtime does not claim token-by-token word order or a complete interlinear edition.</p>
    </> : <p className="word-study-empty">No linked original-language rows were found for this verse.</p>}
  </section>;
}

function CrossReferenceCard({ references, loading, onOpenReference }) {
  return (
    <section className="cross-reference-card" aria-labelledby="passage-connections-title">
      <div className="cross-reference-heading">
        <div><p className="eyebrow">Passage connections</p><h3 id="passage-connections-title">Follow the thread</h3></div>
        <span>{loading ? 'Loading…' : `${references.length} found`}</span>
      </div>
      <p className="cross-reference-description">Discovery aids from shared Strong's links in this chapter. These are not editorially curated cross-references.</p>
      {loading ? <div className="word-study-loading" role="status"><span className="loading-dot" /> Finding related passages…</div> : references.length > 0 ? <div className="cross-reference-list">
        {references.map((reference) => <button type="button" key={`${reference.bookId}-${reference.chapter}-${reference.number}`} onClick={() => onOpenReference?.(reference)}>
          <span className="cross-reference-copy"><strong>{reference.reference}</strong><small>{reference.sharedTerms} shared term{reference.sharedTerms === 1 ? '' : 's'}</small><p>{reference.text}</p></span>
          <Icon name="arrow" size={14} />
        </button>)}
      </div> : <p className="word-study-empty">No lexical connections were found outside this chapter.</p>}
    </section>
  );
}

function TranslationComparison({ book, chapter, verses, onClose }) {
  const dialogRef = useRef(null);
  useDialogFocus(dialogRef, onClose);

  return (
    <div className="modal-backdrop translation-compare-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section ref={dialogRef} className="translation-compare-modal" role="dialog" aria-modal="true" aria-labelledby="translation-compare-title" tabIndex="-1">
        <button className="modal-close" type="button" onClick={onClose} aria-label="Close text comparison"><Icon name="close" size={18} /></button>
        <div className="translation-compare-heading"><div><p className="eyebrow">Bible study</p><h2 id="translation-compare-title">Compare {book.name} {chapter}</h2></div><span>{verses.length} verses</span></div>
        <p className="translation-compare-description">Read the same local chapter in four available text variants. These source texts are included for study while translation licensing and attribution review continue.</p>
        <div className="translation-compare-grid">
          {bundledBibleTextOptions.map((option) => (
            <section className="translation-column" key={option.id} aria-labelledby={`translation-column-${option.id}`}>
              <div className="translation-column-heading"><div><p className="eyebrow">{option.language}</p><h3 id={`translation-column-${option.id}`}>{option.label}</h3></div><span>Review</span></div>
              <ol>
                {verses.map((verse) => <li key={`${option.id}-${verse.number}`}><span>{verse.number}</span><p>{verse.translations?.[option.id] || verse.text || 'Text not available for this verse.'}</p></li>)}
              </ol>
            </section>
          ))}
        </div>
        <div className="translation-compare-footer"><Icon name="info" size={15} /><span>Comparison is local to this chapter and does not send reading activity or text to a server.</span><button className="text-button" type="button" onClick={onClose}>Return to reader <Icon name="arrow" size={14} /></button></div>
      </section>
    </div>
  );
}

function BiblePlan({ completedLessons = [], onToggleLesson, onOpenReference }) {
  const progress = Math.round((completedLessons.length / lessons.length) * 100);
  const nextLesson = lessons.find((lesson) => !completedLessons.includes(lesson.id) && (lesson.id === 1 || completedLessons.includes(lesson.id - 1)));

  function isAvailable(lesson) {
    return completedLessons.includes(lesson.id) || lesson.id === 1 || completedLessons.includes(lesson.id - 1);
  }

  return (
    <div className="reader-plan" aria-labelledby="reader-plan-title">
      <div className="reader-plan-heading"><div><p className="eyebrow">A private reading plan</p><h2 id="reader-plan-title">Move through the Gospel slowly.</h2><p>Use the same seven-lesson Journey here beside the Bible. Read the linked passages, reflect honestly, and mark each step when you are ready.</p></div><div className="reader-plan-progress"><strong>{progress}%</strong><span>{completedLessons.length} of {lessons.length} complete</span></div></div>
      {nextLesson && <div className="reader-plan-next"><span className="reader-plan-next-icon"><Icon name={nextLesson.icon} size={20} /></span><div><p className="eyebrow">Next suggested step</p><strong>{nextLesson.title}</strong><span>{nextLesson.subtitle}</span></div><span className="reader-plan-local">Local</span></div>}
      <div className="reader-plan-list">
        {lessons.map((lesson) => {
          const complete = completedLessons.includes(lesson.id);
          const available = isAvailable(lesson);
          return <article className={`reader-plan-step ${complete ? 'complete' : ''} ${!available ? 'locked' : ''}`} key={lesson.id}>
            <div className={`reader-plan-marker tone-${lesson.tone}`}>{complete ? <Icon name="check" size={15} /> : <span>{lesson.id}</span>}</div>
            <div className="reader-plan-copy"><div className="reader-plan-step-heading"><div><p className="eyebrow">Lesson {lesson.id}</p><h3>{lesson.title}</h3></div><span>{complete ? 'Complete' : available ? 'Ready' : 'Locked'}</span></div><p>{lesson.summary}</p><div className="reader-plan-readings"><span>Read</span>{lesson.reading.map((reference) => <button type="button" key={reference} disabled={!available} onClick={() => onOpenReference?.(reference)}>{reference} <Icon name="arrow" size={13} /></button>)}</div><button className={`reader-plan-complete ${complete ? 'complete' : ''}`} type="button" disabled={!available} onClick={() => onToggleLesson?.(lesson.id)}>{complete ? 'Mark as ongoing' : 'Mark lesson complete'} <Icon name={complete ? 'arrow' : 'check'} size={14} /></button></div>
          </article>;
        })}
      </div>
      <p className="reader-plan-note"><Icon name="lock" size={14} /> Your plan progress stays on this device. The Journey screen contains the full lesson text, reflection, and prayer.</p>
    </div>
  );
}

const speechLanguageByTranslation = Object.fromEntries(bibleTextOptions.map((option) => [option.id, option.locale]));

function AudioReaderPanel({ book, chapter, verses = [], translation, loading, previousLocation, nextLocation, onChangeLocation }) {
  const [playbackStatus, setPlaybackStatus] = useState('idle');
  const [currentVerseNumber, setCurrentVerseNumber] = useState(verses[0]?.number || null);
  const [rate, setRate] = useState(1);
  const [voiceUri, setVoiceUri] = useState('');
  const [voices, setVoices] = useState([]);
  const [translationPending, setTranslationPending] = useState(false);
  const [translationRetryToken, setTranslationRetryToken] = useState(0);
  const speechSequenceRef = useRef(0);
  const speechRef = useRef(null);
  const nativeUtteranceIdRef = useRef('');
  const nativeSpeechRunRef = useRef(null);
  const speechSupported = typeof window !== 'undefined'
    && typeof window.speechSynthesis?.speak === 'function'
    && typeof window.SpeechSynthesisUtterance === 'function';
  const isAndroid = Capacitor.getPlatform() === 'android';
  const [nativeSpeechAvailable, setNativeSpeechAvailable] = useState(false);
  const [nativeSpeechChecked, setNativeSpeechChecked] = useState(!isAndroid || speechSupported);
  const useNativeSpeech = isAndroid && !speechSupported && nativeSpeechAvailable;
  if (!nativeUtteranceIdRef.current) nativeUtteranceIdRef.current = `fdl-reader-${Math.random().toString(36).slice(2)}`;

  useEffect(() => {
    const retry = (event) => {
      if (event.detail?.languageId === translation?.id) setTranslationRetryToken((current) => current + 1);
    };
    window.addEventListener('fdl-translation-retry', retry);
    return () => window.removeEventListener('fdl-translation-retry', retry);
  }, [translation?.id]);

  useEffect(() => {
    if (!speechSupported) return undefined;
    const refreshVoices = () => setVoices(window.speechSynthesis.getVoices().filter((voice) => voice?.voiceURI));
    refreshVoices();
    window.speechSynthesis.addEventListener?.('voiceschanged', refreshVoices);
    return () => window.speechSynthesis.removeEventListener?.('voiceschanged', refreshVoices);
  }, [speechSupported]);

  useEffect(() => {
    let active = true;
    if (speechSupported || !isAndroid) {
      setNativeSpeechChecked(true);
      return undefined;
    }

    setNativeSpeechChecked(false);
    let listenerHandle;
    LocalTextToSpeech.isAvailable()
      .then((result) => {
        if (!active) return;
        setNativeSpeechAvailable(Boolean(result?.available));
        setNativeSpeechChecked(true);
      })
      .catch(() => {
        if (!active) return;
        setNativeSpeechAvailable(false);
        setNativeSpeechChecked(true);
      });
    LocalTextToSpeech.addListener('speechState', (event) => {
      const run = nativeSpeechRunRef.current;
      if (!active || !run || run.sequence !== speechSequenceRef.current || event?.utteranceId !== run.utteranceId) return;
      if (event.state === 'playing') {
        setCurrentVerseNumber(run.verses[run.index]?.number || currentVerseNumber);
        setPlaybackStatus('playing');
      }
      if (event.state === 'complete') {
        if (run.index + 1 < run.verses.length) {
          speakNativeVerse(run, run.index + 1);
        } else {
          nativeSpeechRunRef.current = null;
          setPlaybackStatus('complete');
        }
      }
      if (event.state === 'error') {
        nativeSpeechRunRef.current = null;
        setPlaybackStatus('error');
      }
      if (event.state === 'idle') {
        nativeSpeechRunRef.current = null;
        setPlaybackStatus('idle');
      }
    }).then((handle) => {
      if (!active) handle.remove();
      else listenerHandle = handle;
    }).catch(() => undefined);

    return () => {
      active = false;
      listenerHandle?.remove();
    };
  }, [isAndroid, speechSupported]);

  useEffect(() => {
    speechSequenceRef.current += 1;
    nativeSpeechRunRef.current = null;
    if (speechSupported) window.speechSynthesis.cancel();
    if (useNativeSpeech) LocalTextToSpeech.stop().catch(() => undefined);
    speechRef.current = null;
    setPlaybackStatus('idle');
    setCurrentVerseNumber(verses[0]?.number || null);
  }, [book?.id, chapter, translation?.id, verses?.length, speechSupported, useNativeSpeech]);

  useEffect(() => () => {
    speechSequenceRef.current += 1;
    nativeSpeechRunRef.current = null;
    if (speechSupported) window.speechSynthesis.cancel();
    if (useNativeSpeech) LocalTextToSpeech.stop().catch(() => undefined);
  }, [speechSupported, useNativeSpeech]);

  const currentIndex = Math.max(0, verses.findIndex((verse) => verse.number === currentVerseNumber));
  const progress = verses.length ? Math.round(((currentIndex + 1) / verses.length) * 100) : 0;
  const selectedVoice = voices.find((voice) => voice.voiceURI === voiceUri);
  const [translatedVerseTexts, setTranslatedVerseTexts] = useState({});

  useEffect(() => {
    let active = true;
    const languageId = translation?.id || 'en';
    const translatableVerses = verses.filter((verse) => !verse?.translations?.[languageId] && verse?.text);
    if (languageId === 'en' || translatableVerses.length === 0) {
      setTranslatedVerseTexts({});
      setTranslationPending(false);
      return () => { active = false; };
    }
    const cached = Object.fromEntries(translatableVerses.map((verse) => [stableVerseId(verse), getCachedAutomaticTranslation(verse.text, languageId)]).filter(([, text]) => text));
    setTranslatedVerseTexts(cached);
    setTranslationPending(Object.keys(cached).length < translatableVerses.length);
    Promise.all(translatableVerses.map(async (verse) => [stableVerseId(verse), await requestAutomaticTranslation(verse.text, languageId)]))
      .then((entries) => {
        if (!active) return;
        setTranslatedVerseTexts((current) => ({ ...current, ...Object.fromEntries(entries.filter(([, text]) => text)) }));
        setTranslationPending(false);
      });
    return () => { active = false; };
  }, [verses, translation?.id, translationRetryToken]);

  function verseText(verse) {
    return verse?.translations?.[translation?.id] || translatedVerseTexts[stableVerseId(verse)] || verse?.text || '';
  }

  function verseLanguage(verse) {
    return verse?.translations?.[translation?.id] || translatedVerseTexts[stableVerseId(verse)] ? speechLanguageByTranslation[translation?.id] || translation?.locale || 'en-US' : 'en-US';
  }

  function stopSpeech(resetStatus = true) {
    speechSequenceRef.current += 1;
    nativeSpeechRunRef.current = null;
    if (speechSupported) window.speechSynthesis.cancel();
    if (useNativeSpeech) LocalTextToSpeech.stop().catch(() => undefined);
    speechRef.current = null;
    if (resetStatus) setPlaybackStatus('idle');
  }

  function pauseSpeech() {
    if (!speechSupported || useNativeSpeech || playbackStatus !== 'playing') return;
    window.speechSynthesis.pause();
    setPlaybackStatus('paused');
  }

  function resumeSpeech() {
    if (!speechSupported || useNativeSpeech || playbackStatus !== 'paused') return;
    window.speechSynthesis.resume();
    setPlaybackStatus('playing');
  }

  function speakNativeVerse(run, index) {
    if (run.sequence !== speechSequenceRef.current || index >= run.verses.length) return;
    const verse = run.verses[index];
    run.index = index;
    run.utteranceId = `${nativeUtteranceIdRef.current}-${run.sequence}-verse-${verse.number}`;
    setCurrentVerseNumber(verse.number);
    setPlaybackStatus('playing');
    LocalTextToSpeech.speak({
      text: verseText(verse),
      language: verseLanguage(verse),
      rate: run.rate,
      utteranceId: run.utteranceId,
    }).catch(() => {
      if (run.sequence === speechSequenceRef.current) {
        nativeSpeechRunRef.current = null;
        setPlaybackStatus('error');
      }
    });
  }

  function startSpeech(startIndex = currentIndex, restart = false) {
    if ((!speechSupported && !useNativeSpeech) || loading || translationPending || verses.length === 0) return;
    if (playbackStatus === 'paused' && !restart) {
      resumeSpeech();
      return;
    }
    const safeStart = Math.min(Math.max(0, startIndex), verses.length - 1);
    stopSpeech(false);
    const sequence = speechSequenceRef.current;
    if (useNativeSpeech) {
      const run = {
        sequence,
        verses: verses.slice(safeStart),
        index: -1,
        utteranceId: '',
        rate,
      };
      nativeSpeechRunRef.current = run;
      speakNativeVerse(run, 0);
      return;
    }

    function speakVerse(index) {
      if (sequence !== speechSequenceRef.current || index >= verses.length) {
        if (sequence === speechSequenceRef.current) {
          setPlaybackStatus('complete');
          speechRef.current = null;
        }
        return;
      }
      const verse = verses[index];
      const utterance = new window.SpeechSynthesisUtterance(verseText(verse));
      utterance.lang = verseLanguage(verse);
      utterance.rate = rate;
      if (selectedVoice) utterance.voice = selectedVoice;
      utterance.onstart = () => {
        if (sequence !== speechSequenceRef.current) return;
        setCurrentVerseNumber(verse.number);
        setPlaybackStatus('playing');
      };
      utterance.onend = () => {
        if (sequence === speechSequenceRef.current) speakVerse(index + 1);
      };
      utterance.onerror = (event) => {
        if (sequence !== speechSequenceRef.current || event.error === 'canceled' || event.error === 'interrupted') return;
        speechRef.current = null;
        setPlaybackStatus('error');
      };
      speechRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    }

    setCurrentVerseNumber(verses[safeStart].number);
    setPlaybackStatus('playing');
    speakVerse(safeStart);
  }

  function changeChapter(nextLocation) {
    stopSpeech();
    if (nextLocation) onChangeLocation?.(nextLocation);
  }

  const audioAvailable = speechSupported || useNativeSpeech;
  const primaryAction = playbackStatus === 'playing' ? (useNativeSpeech ? stopSpeech : pauseSpeech) : playbackStatus === 'paused' ? resumeSpeech : () => startSpeech(currentIndex);
  const primaryIcon = playbackStatus === 'playing' ? (useNativeSpeech ? 'stop' : 'pause') : playbackStatus === 'paused' ? 'play' : 'play';
  const copy = (key, fallback) => getLanguageCopy(translation?.id, key, fallback);
  const primaryLabel = playbackStatus === 'playing' ? (useNativeSpeech ? copy('bible.stop', 'Stop') : 'Pause') : playbackStatus === 'paused' ? 'Resume' : playbackStatus === 'complete' ? 'Play again' : 'Play from verse';
  const playbackLabel = translationPending ? 'Preparing the selected language…' : playbackStatus === 'playing' ? 'Speaking' : playbackStatus === 'paused' ? 'Paused' : playbackStatus === 'complete' ? 'Chapter complete' : playbackStatus === 'error' ? 'Voice error' : copy('bible.ready', 'Ready to listen');
  return <section className="reader-audio" aria-labelledby="reader-audio-title">
    <SectionArt art={sectionArt.audio} />
    <div className="reader-audio-heading"><div><p className="eyebrow">Listen · reflect</p><h2 id="reader-audio-title">Hear {book?.name} {chapter} aloud.</h2><p>Use the speech voice already installed on this device to listen through the chapter. Nothing is streamed or sent away.</p></div><span className="reader-audio-icon"><Icon name="headphones" size={24} /></span></div>
    {loading ? <div className="reader-audio-empty" role="status"><span className="loading-dot" /> Loading this chapter…</div> : isAndroid && !speechSupported && !nativeSpeechChecked ? <div className="reader-audio-unavailable"><Icon name="headphones" size={20} /><div><strong>Checking the local Android voice…</strong><p>The app is checking the speech engine already installed on this device.</p></div></div> : !audioAvailable ? <div className="reader-audio-unavailable"><Icon name="info" size={20} /><div><strong>Read-aloud is unavailable here.</strong><p>{isAndroid ? 'Android could not find a usable local speech engine. The Bible remains available in the Read tab.' : 'This device or browser does not expose a local speech engine. The Bible remains available in the Read tab.'}</p></div></div> : <>
      <div className="reader-audio-progress"><div><span>{copy('bible.currentVerse', 'Current verse')}</span><strong aria-live="polite">{book?.name} {chapter}:{currentVerseNumber || '—'}</strong></div><div><span>{playbackLabel}</span><strong>{translationPending ? '…' : `${progress}%`}</strong></div></div>
      <div className="reader-audio-track" aria-hidden="true"><span style={{ width: `${progress}%` }} /></div>
      <div className="reader-audio-controls"><button className="primary-button" type="button" onClick={primaryAction} disabled={translationPending}><Icon name={primaryIcon} size={15} /> {translationPending ? 'Preparing…' : primaryLabel}</button><button className="secondary-button" type="button" onClick={() => startSpeech(0, true)} disabled={translationPending}><Icon name="refresh" size={15} /> {copy('bible.startChapter', 'Start chapter')}</button><button className="audio-stop-button" type="button" onClick={() => stopSpeech()} disabled={playbackStatus === 'idle'}><Icon name="stop" size={15} /> {copy('bible.stop', 'Stop')}</button></div>
      <div className="reader-audio-options"><label><span>{copy('bible.readingSpeed', 'Reading speed')}</span><select value={rate} onChange={(event) => setRate(Number(event.target.value))}><option value="0.8">Slower · 0.8×</option><option value="1">Normal · 1×</option><option value="1.15">Steady · 1.15×</option><option value="1.3">Faster · 1.3×</option></select></label>{useNativeSpeech ? <div className="reader-audio-voice-note"><Icon name="headphones" size={14} /><span><strong>System default voice</strong><small>Android uses the installed voice for {translation?.label || 'the selected language'}.</small></span></div> : voices.length > 0 && <label><span>Device voice</span><select value={voiceUri} onChange={(event) => setVoiceUri(event.target.value)}><option value="">System default</option>{voices.map((voice) => <option key={voice.voiceURI} value={voice.voiceURI}>{voice.name} · {voice.lang}</option>)}</select></label>}</div>
      <div className="reader-audio-verse-list" aria-label="Choose a starting verse">{verses.map((verse, index) => <button className={verse.number === currentVerseNumber ? 'active' : ''} type="button" key={verse.number} onClick={() => startSpeech(index, true)} disabled={translationPending}><span>{verse.number}</span><p data-no-translate={translation?.id !== 'en' ? 'true' : undefined}>{verseText(verse)}</p><Icon name="play" size={12} /></button>)}</div>
      <div className="reader-audio-navigation"><button className="text-button" type="button" disabled={!previousLocation} onClick={() => changeChapter(previousLocation)}><Icon name="back" size={14} /> Previous chapter</button><span>{useNativeSpeech ? 'Android Text-to-Speech' : 'Local device voice'} · {translation?.label || 'English'}</span><button className="text-button" type="button" disabled={!nextLocation} onClick={() => changeChapter(nextLocation)}>Next chapter <Icon name="arrow" size={14} /></button></div>
    </>}
    <p className="content-note"><Icon name="lock" size={12} /> Audio here means local text-to-speech. It depends on the voices installed on the device; no audio files or network service are required.</p>
  </section>;
}

function Bible({ verses: verseList, books: bookList, location, onChangeLocation, loading, focusTarget = null, onFocusTargetHandled, chapterError = '', onRetryChapter, databaseStatus = 'ready', databaseError = '', onRetryDatabase, searchTerm, setSearchTerm, bookmarks, toggleBookmark, highlights, toggleHighlight, notes, saveNote, readerPreferences, updateReaderPreference, completedLessons, toggleLesson }) {
  const [noteVerseId, setNoteVerseId] = useState(null);
  const [noteDraft, setNoteDraft] = useState('');
  const [copyMessage, setCopyMessage] = useState('');
  const [wordStudyEntries, setWordStudyEntries] = useState([]);
  const [wordStudyLoading, setWordStudyLoading] = useState(false);
  const [crossReferences, setCrossReferences] = useState([]);
  const [crossReferenceLoading, setCrossReferenceLoading] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [comparisonOpen, setComparisonOpen] = useState(false);
  const [translationMenuOpen, setTranslationMenuOpen] = useState(false);
  const [readerTab, setReaderTab] = useState('read');
  const [jumpVerse, setJumpVerse] = useState('');
  const [bibleSearchResults, setBibleSearchResults] = useState([]);
  const [bibleSearchLoading, setBibleSearchLoading] = useState(false);
  const [translatedVerseTexts, setTranslatedVerseTexts] = useState({});
  const [verseTranslationPending, setVerseTranslationPending] = useState(false);
  const [translationRetryToken, setTranslationRetryToken] = useState(0);
  const searchRef = useRef(null);
  const fontScale = Math.min(1.3, Math.max(.85, Number(readerPreferences?.fontScale) || 1));
  const tone = readerPreferences?.tone || 'default';
  const translationKey = bibleTextOptions.some((option) => option.id === readerPreferences?.translation) ? readerPreferences.translation : 'en';
  const selectedTextOption = bibleTextOptions.find((option) => option.id === translationKey) || bibleTextOptions[0];
  const copy = (key, fallback) => getLanguageCopy(translationKey, key, fallback);
  const currentBook = bookList.find((book) => book.id === location.bookId) || bookList[0];
  const currentBookIndex = Math.max(0, bookList.findIndex((book) => book.id === currentBook?.id));
  const currentChapter = Number(location.chapter) || 1;
  const previousLocation = currentChapter > 1
    ? { bookId: currentBook.id, chapter: currentChapter - 1 }
    : currentBookIndex > 0
      ? { bookId: bookList[currentBookIndex - 1].id, chapter: bookList[currentBookIndex - 1].chapterCount }
      : null;
  const nextLocation = currentChapter < currentBook.chapterCount
    ? { bookId: currentBook.id, chapter: currentChapter + 1 }
    : currentBookIndex < bookList.length - 1
      ? { bookId: bookList[currentBookIndex + 1].id, chapter: 1 }
      : null;
  const normalizedSearch = searchTerm.trim().toLowerCase();
  const searchReference = normalizedSearch.match(/^(.+?)\s+(\d+)(?::(\d+)(?:\s*[-–]\s*(?:\d+:)?\d+)?)?$/);
  const hasReferenceSyntax = Boolean(searchReference);
  const searchBook = searchReference && findBibleBook(searchReference[1], bookList);
  const searchTarget = normalizedSearch && verseList.find((verse) => {
    const exactMatch = verse.reference.toLowerCase() === normalizedSearch || `${currentBook.name.toLowerCase()} ${currentChapter}:${verse.number}` === normalizedSearch;
    const linkedChapter = Boolean(searchBook && searchBook.id === currentBook.id && Number(searchReference?.[2]) === currentChapter);
    const linkedVerse = linkedChapter && searchReference?.[3] && Number(searchReference[3]) === verse.number;
    return exactMatch || linkedVerse;
  });
  const searchMatch = Boolean(searchTarget) || Boolean(searchBook && Number(searchReference[2]) === currentChapter && searchBook.id === currentBook.id);

  useEffect(() => {
    const retry = (event) => {
      if (event.detail?.languageId === translationKey) setTranslationRetryToken((current) => current + 1);
    };
    window.addEventListener('fdl-translation-retry', retry);
    return () => window.removeEventListener('fdl-translation-retry', retry);
  }, [translationKey]);

  useEffect(() => {
    if (!translationMenuOpen) return undefined;
    function closeOnOutsideClick(event) {
      if (!event.target?.closest?.('.reader-translation-control')) setTranslationMenuOpen(false);
    }
    function closeOnEscape(event) {
      if (event.key === 'Escape') setTranslationMenuOpen(false);
    }
    document.addEventListener('mousedown', closeOnOutsideClick);
    window.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('mousedown', closeOnOutsideClick);
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [translationMenuOpen]);

  function verseText(verse) {
    return verse?.translations?.[translationKey] || translatedVerseTexts[stableVerseId(verse)] || verse?.text || '';
  }

  function submitSearch() {
    if (searchBook) {
      const chapter = Number(searchReference[2]);
      if (chapter < 1 || chapter > searchBook.chapterCount) return;
      onChangeLocation({ bookId: searchBook.id, chapter });
      return;
    }
    if (bibleSearchResults[0]) openBibleSearchResult(bibleSearchResults[0]);
  }

  function openBibleSearchResult(result) {
    if (!result?.bookId || !result.chapter) return;
    onChangeLocation({ bookId: result.bookId, chapter: result.chapter });
    setSearchTerm(result.reference);
  }

  function openPlanReference(reference) {
    const targetLocation = resolveBibleReference(reference, bookList);
    if (!targetLocation) return;
    onChangeLocation(targetLocation);
    setSearchTerm(reference);
    setReaderTab('read');
  }

  function jumpToVerse(number) {
    if (!number) return;
    setSearchTerm(`${currentBook.name} ${currentChapter}:${number}`);
    setJumpVerse('');
    window.setTimeout(() => document.getElementById(`verse-${currentBook.id}-${currentChapter}-${number}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 0);
  }

  function editNote(verse) {
    const id = stableVerseId(verse);
    setNoteVerseId(id);
    setNoteDraft(notes[id] || '');
  }

  async function copyVerse(verse) {
    const value = `${verseText(verse)} — ${verse.reference}`;
    try {
      if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(value);
      else {
        const input = document.createElement('textarea');
        input.value = value;
        input.setAttribute('readonly', '');
        input.style.position = 'fixed';
        input.style.opacity = '0';
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        input.remove();
      }
      setCopyMessage(`${verse.reference} copied`);
      window.setTimeout(() => setCopyMessage(''), 2200);
    } catch {
      setCopyMessage('Copy unavailable on this device');
    }
  }

  useEffect(() => {
    let cancelled = false;
    const strongNumbers = [...new Set(verseList.flatMap((verse) => Array.isArray(verse.strongs) ? verse.strongs : []))];
    if (strongNumbers.length === 0) {
      setWordStudyEntries([]);
      return undefined;
    }
    setWordStudyLoading(true);
    loadLexiconEntries(strongNumbers).then((entries) => {
      if (!cancelled) setWordStudyEntries(entries);
    }).catch(() => {
      if (!cancelled) setWordStudyEntries([]);
    }).finally(() => {
      if (!cancelled) setWordStudyLoading(false);
    });
    return () => { cancelled = true; };
  }, [verseList]);

  useEffect(() => {
    let active = true;
    const translatableVerses = verseList.filter((verse) => !verse?.translations?.[translationKey] && verse?.text);
    if (translationKey === 'en' || translatableVerses.length === 0) {
      setTranslatedVerseTexts({});
      setVerseTranslationPending(false);
      return () => { active = false; };
    }
    const cached = Object.fromEntries(translatableVerses.map((verse) => [stableVerseId(verse), getCachedAutomaticTranslation(verse.text, translationKey)]).filter(([, text]) => text));
    setTranslatedVerseTexts(cached);
    setVerseTranslationPending(Object.keys(cached).length < translatableVerses.length);
    Promise.all(translatableVerses.map(async (verse) => [stableVerseId(verse), await requestAutomaticTranslation(verse.text, translationKey)]))
      .then((entries) => {
        if (!active) return;
        setTranslatedVerseTexts((current) => ({ ...current, ...Object.fromEntries(entries.filter(([, text]) => text)) }));
        setVerseTranslationPending(false);
      });
    return () => { active = false; };
  }, [translationKey, verseList, translationRetryToken]);

  useEffect(() => {
    let cancelled = false;
    if (!currentBook?.id || !currentChapter) {
      setCrossReferences([]);
      return undefined;
    }
    setCrossReferenceLoading(true);
    loadChapterCrossReferences(currentBook.id, currentChapter).then((references) => {
      if (!cancelled) setCrossReferences(references);
    }).catch(() => {
      if (!cancelled) setCrossReferences([]);
    }).finally(() => {
      if (!cancelled) setCrossReferenceLoading(false);
    });
    return () => { cancelled = true; };
  }, [currentBook?.id, currentChapter]);

  useEffect(() => {
    let cancelled = false;
    if (!normalizedSearch || hasReferenceSyntax) {
      setBibleSearchResults([]);
      setBibleSearchLoading(false);
      return undefined;
    }
    setBibleSearchLoading(true);
    const timer = window.setTimeout(() => {
      searchBibleVerses(searchTerm, 8).then((results) => {
        if (!cancelled) setBibleSearchResults(results);
      }).catch(() => {
        if (!cancelled) setBibleSearchResults([]);
      }).finally(() => {
        if (!cancelled) setBibleSearchLoading(false);
      });
    }, 220);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [hasReferenceSyntax, normalizedSearch, searchTerm]);

  useEffect(() => {
    if (!searchTarget || searchTarget.bookId !== currentBook?.id || Number(searchTarget.chapter) !== currentChapter) return undefined;
    const frame = window.requestAnimationFrame(() => document.getElementById(`verse-${currentBook.id}-${currentChapter}-${searchTarget.number}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }));
    return () => window.cancelAnimationFrame(frame);
  }, [currentBook?.id, currentChapter, searchTarget?.number, searchTarget?.reference]);

  useEffect(() => {
    if (!focusMode) return undefined;
    function closeOnEscape(event) {
      if (event.key === 'Escape') setFocusMode(false);
    }
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [focusMode]);

  useEffect(() => {
    if (!focusTarget || loading || verseList.length === 0) return undefined;
    setReaderTab(focusTarget === 'audio' ? 'audio' : 'read');
    const timer = window.setTimeout(() => {
      const selector = focusTarget === 'audio' ? '.reader-audio' : focusTarget === 'word-study' ? '#bible-word-study' : '.reader-panel';
      document.querySelector(selector)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      onFocusTargetHandled?.();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [focusTarget, loading, verseList.length]);

  return (
    <div className={`bible-page page-enter ${focusMode ? 'bible-focus-page' : ''}`}>
      <SectionIntro eyebrow={copy('bible.eyebrow', 'Read · Plan')} title={copy('bible.title', 'The Bible')} description={copy('bible.description', 'Read slowly. Ask honestly. Let Scripture meet you where you are.')} action={<div className="bible-intro-actions"><button className="round-icon-button" type="button" aria-label="Bible search" onClick={() => searchRef.current?.focus()}><Icon name="search" /></button><button className={`round-icon-button ${focusMode ? 'active' : ''}`} type="button" aria-pressed={focusMode} aria-label={focusMode ? 'Exit focus reading' : 'Open focus reading'} title={focusMode ? 'Exit focus reading' : 'Focus reading'} onClick={() => setFocusMode((current) => !current)}><Icon name={focusMode ? 'minimize' : 'focus'} /></button></div>} />
      <SectionArt art={sectionArt.bible} />
      <div className={`reader-layout ${focusMode ? 'reader-layout-focus' : ''}`}>
        <section className={`reader-panel reader-tone-${tone}`}>
          {databaseStatus === 'error' && <div className="reader-database-error" role="alert"><Icon name="info" size={18} /><div><strong>The offline Bible database could not be opened.</strong><p>{databaseError || 'The full Scripture library is unavailable in this build.'}</p><button className="text-button" type="button" onClick={onRetryDatabase}>Retry local Bible</button></div></div>}
          {databaseStatus === 'loading' && <div className="reader-database-loading" role="status"><span className="loading-dot" /><div><strong>Opening the offline Bible</strong><p>The complete Scripture library is loading from this app. This can take a moment on first launch.</p></div></div>}
          <div className="reader-toolbar"><div className="reader-tabs"><button className={`reader-tab ${readerTab === 'read' ? 'active' : ''}`} type="button" onClick={() => setReaderTab('read')}>{copy('bible.read', 'Read')}</button><button className={`reader-tab ${readerTab === 'plan' ? 'active' : ''}`} type="button" onClick={() => setReaderTab('plan')}>{copy('bible.plan', 'Plan')}</button><button className={`reader-tab ${readerTab === 'audio' ? 'active' : ''}`} type="button" onClick={() => setReaderTab('audio')}>{copy('bible.audio', 'Audio')}</button></div></div>
          {readerTab === 'plan' ? <BiblePlan completedLessons={completedLessons} onToggleLesson={toggleLesson} onOpenReference={openPlanReference} /> : readerTab === 'audio' ? <AudioReaderPanel book={currentBook} chapter={currentChapter} verses={verseList} translation={selectedTextOption} loading={loading} previousLocation={previousLocation} nextLocation={nextLocation} onChangeLocation={onChangeLocation} /> : <>
          <div className="reader-tools" aria-label="Reading controls"><div className="reader-font-controls"><button type="button" onClick={() => updateReaderPreference('fontScale', Math.max(.85, fontScale - .1))} aria-label="Decrease Bible text size">A−</button><span>{Math.round(fontScale * 100)}%</span><button type="button" onClick={() => updateReaderPreference('fontScale', Math.min(1.3, fontScale + .1))} aria-label="Increase Bible text size">A+</button></div><div className="reader-translation-control"><button className="reader-translation-button" type="button" aria-haspopup="menu" aria-expanded={translationMenuOpen} aria-label={`${copy('bible.translation', 'Translation')}: ${selectedTextOption.label}`} onClick={() => setTranslationMenuOpen((current) => !current)}><Icon name="globe" size={15} /><span>{copy('bible.translation', 'Translation')}</span><strong>{selectedTextOption.shortLabel}</strong><Icon name="chevron" size={13} /></button>{translationMenuOpen && <div className="reader-translation-menu" role="menu" aria-label={copy('bible.translationOptions', 'Bible translation options')}><p className="reader-translation-menu-heading">{copy('bible.translationOptions', 'Bible translation options')}</p>{bibleTextOptions.map((option) => { const isSelected = option.id === translationKey; const isBundled = BUNDLED_BIBLE_LANGUAGE_IDS.includes(option.id); return <button className={`reader-translation-option ${isSelected ? 'active' : ''}`} type="button" role="menuitemradio" aria-checked={isSelected} key={option.id} onClick={() => { updateReaderPreference('translation', option.id); setTranslationMenuOpen(false); }}><span><strong>{option.shortLabel}</strong><small>{isBundled ? copy('bible.bundledTranslation', 'Bundled with the app') : copy('bible.onlineTranslation', 'Translate this chapter when online')}</small></span>{isSelected && <Icon name="check" size={14} />}</button>; })}<button className="reader-translation-compare" type="button" onClick={() => { setComparisonOpen(true); setTranslationMenuOpen(false); }}><Icon name="learn" size={14} /> {copy('bible.compareVariants', 'Compare bundled text variants')}</button></div>}</div><button className="reader-tone-button" type="button" onClick={() => updateReaderPreference('tone', tone === 'default' ? 'sepia' : tone === 'sepia' ? 'night' : 'default')} aria-label="Change reading tone">{tone === 'default' ? 'Paper' : tone === 'sepia' ? 'Sepia' : 'Low light'}</button>{copyMessage && <span className="copy-status" role="status">{copyMessage}</span>}</div>
          <div className="reference-row"><button className="reference-arrow" type="button" aria-label="Previous chapter" disabled={!previousLocation} onClick={() => previousLocation && onChangeLocation(previousLocation)}><Icon name="back" size={18} /></button><label className="reference-select"><span className="sr-only">Bible book</span><select value={currentBook.id} onChange={(event) => onChangeLocation({ bookId: event.target.value, chapter: 1 })}>{bookList.map((book) => <option key={book.id} value={book.id}>{book.name}</option>)}</select><Icon name="chevron" size={15} /></label><label className="reference-select chapter-select"><span className="sr-only">Bible chapter</span><select value={currentChapter} onChange={(event) => onChangeLocation({ bookId: currentBook.id, chapter: Number(event.target.value) })}>{Array.from({ length: currentBook.chapterCount }, (_, index) => <option key={index + 1} value={index + 1}>Chapter {index + 1}</option>)}</select><Icon name="chevron" size={15} /></label><button className="reference-arrow" type="button" aria-label="Next chapter" disabled={!nextLocation} onClick={() => nextLocation && onChangeLocation(nextLocation)}><Icon name="arrow" size={18} /></button></div>
           <div className="reference-search"><Icon name="search" size={16} /><input ref={searchRef} value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') submitSearch(); }} placeholder="Search Scripture or enter John 1:1" aria-label="Search Scripture or Bible reference" />{searchTerm && <button type="button" onClick={() => setSearchTerm('')} aria-label="Clear search"><Icon name="close" size={15} /></button>}</div>
           {searchTerm && hasReferenceSyntax && <div className={`search-result ${searchMatch ? 'match' : ''}`}>{searchMatch ? `${searchTarget?.reference || `${currentBook.name} ${currentChapter}`} is ready to read.` : 'Try a book and chapter such as “John 1” or a verse such as “John 1:5”. Press Enter to open it.'}</div>}
           {searchTerm && !hasReferenceSyntax && <BibleSearchResults query={searchTerm} results={bibleSearchResults} loading={bibleSearchLoading} onOpenResult={openBibleSearchResult} />}
           <div className="verse-jump-row"><label><span>Jump to verse</span><select value={jumpVerse} onChange={(event) => jumpToVerse(Number(event.target.value))}><option value="">Choose a verse…</option>{verseList.map((verse) => <option key={verse.number} value={verse.number}>Verse {verse.number}</option>)}</select><Icon name="chevron" size={14} /></label></div>
           <div className="chapter-heading"><span className="chapter-kicker">{currentBook.name}</span><h2>{currentBook.name} {currentChapter}</h2><span className="chapter-subtitle">{currentBook.id === 'JHN' && currentChapter === 1 ? 'The Word Became Flesh' : 'Read this chapter slowly'}</span></div>
           {verseTranslationPending && <p className="reader-translation-status" role="status">Preparing the selected language for this chapter…</p>}
          {loading ? <div className="reader-loading" role="status"><span className="loading-dot" /> Loading {currentBook.name} {currentChapter}…</div> : chapterError ? <div className="reader-chapter-error" role="alert"><Icon name="info" size={18} /><div><strong>We could not open this chapter.</strong><p>{chapterError}</p><button className="text-button" type="button" onClick={onRetryChapter}>Try this chapter again</button></div></div> : <div className="verse-list">{verseList.map((verse) => {
            const id = stableVerseId(verse);
            const saved = bookmarks.includes(id);
            const highlighted = highlights.includes(id);
            const noted = Boolean(notes[id]);
            const targeted = searchTarget?.number === verse.number;
             return <div className="verse-entry" id={`verse-${verse.bookId || currentBook.id}-${verse.chapter || currentChapter}-${verse.number}`} key={`${verse.bookId || currentBook.id}-${verse.chapter || currentChapter}-${verse.number}`}><div className={`verse-row ${verse.reference === 'John 1:5' ? 'verse-highlight' : ''} ${highlighted ? 'verse-user-highlight' : ''} ${targeted ? 'verse-search-target' : ''}`}><span className="verse-number">{verse.number}</span><p data-no-translate={translationKey !== 'en' ? 'true' : undefined} style={{ fontSize: `${17 * fontScale}px` }}>{verseText(verse)}</p><div className="verse-actions"><button className={`verse-action ${saved ? 'saved' : ''}`} type="button" onClick={() => toggleBookmark(id)} aria-label={`${saved ? 'Remove' : 'Save'} ${verse.reference}`} aria-pressed={saved}><Icon name="bookmark" size={15} /></button><button className={`verse-action ${highlighted ? 'active' : ''}`} type="button" onClick={() => toggleHighlight(id)} aria-label={`${highlighted ? 'Remove' : 'Add'} highlight to ${verse.reference}`} aria-pressed={highlighted}><Icon name="sun" size={15} /></button><button className={`verse-action ${noted ? 'noted' : ''}`} type="button" onClick={() => editNote(verse)} aria-label={`${noted ? 'Edit' : 'Add'} note for ${verse.reference}`}><Icon name="dialogue" size={15} /></button></div></div>{noteVerseId === id && <div className="verse-note-editor"><label htmlFor={`note-${verse.number}`}>Private note for {verse.reference}</label><textarea id={`note-${verse.number}`} value={noteDraft} onChange={(event) => setNoteDraft(event.target.value)} placeholder="Write a thought to return to…" rows="3" /><div><button className="text-button subtle" type="button" onClick={() => setNoteVerseId(null)}>Cancel</button><button className="primary-button" type="button" onClick={() => { saveNote(id, noteDraft); setNoteVerseId(null); }}>Save note</button></div></div>}</div>;
          })}</div>}
            <p className="content-note">{selectedTextOption.label} text from the local Data source · all text variants remain subject to license and attribution review before public release.</p>
          </>}
         </section>
         <aside className="reader-side-panel"><div className="side-quote"><Icon name="sparkles" size={22} /><p>{currentBook.id === 'JHN' && currentChapter === 1 ? '“The light shines in the darkness.”' : '“Your word is a lamp unto my feet.”'}</p><span>{currentBook.id === 'JHN' && currentChapter === 1 ? 'John 1:5' : `${currentBook.name} ${currentChapter}`}</span></div><div className="study-card"><p className="eyebrow">Study tools</p>{verseList[0] && <><button type="button" onClick={() => toggleBookmark(stableVerseId(verseList[0]))}><Icon name="bookmark" size={17} /> {bookmarks.includes(stableVerseId(verseList[0])) ? 'Remove saved passage' : 'Save a passage'} <span>Local</span></button><button type="button" onClick={() => editNote(verseList[0])}><Icon name="dialogue" size={17} /> Add a private note <span>Local</span></button><button type="button" onClick={() => copyVerse(verseList[0])}><Icon name="scroll" size={17} /> Copy {verseList[0].reference} <span>Device</span></button></>}<button type="button" onClick={() => setComparisonOpen(true)} disabled={verseList.length === 0}><Icon name="learn" size={17} /> Compare text variants <span>Local</span></button></div><InterlinearCard verses={verseList} entries={wordStudyEntries} loading={wordStudyLoading} /><WordStudyCard entries={wordStudyEntries} loading={wordStudyLoading} onOpenOccurrence={(occurrence) => { onChangeLocation({ bookId: occurrence.bookId, chapter: occurrence.chapter }); setSearchTerm(occurrence.reference); }} /><CrossReferenceCard references={crossReferences} loading={crossReferenceLoading} onOpenReference={(reference) => { onChangeLocation({ bookId: reference.bookId, chapter: reference.chapter }); setSearchTerm(reference.reference); }} /></aside>
       </div>
       {comparisonOpen && <TranslationComparison book={currentBook} chapter={currentChapter} verses={verseList} onClose={() => setComparisonOpen(false)} />}
     </div>
  );
}

function Learn({ articles: articleList, sourceAssets = [], onOpenArticle, onOpenLibraryGroup, onOpenReference, onOpenBible, onOpenDownloads, onSaveGuide, initialPathId = null, initialWordStudyQuery = '', studyPacks: packList = studyPacks, savedStudyPacks = [], onToggleStudyPack, completedResourcesByPack = {}, onToggleStudyPackResource, completedSectionsByPath = {}, onToggleFactsPathSection, questionProgress = [], onToggleQuestionProgress, onOpenStudyPackResource, initialStudyPackId = null }) {
  const [category, setCategory] = useState('All');
  const [query, setQuery] = useState('');
  const searchRef = useRef(null);
  const categories = ['All', 'Jesus', 'Questions', 'Bible', 'Foundations', 'Practice', 'Life', 'Research', 'Testimonies', 'Study Packs'];
  const normalizedQuery = query.trim().toLowerCase();
  const filteredArticles = articleList.filter((article) => {
    const categoryMatches = category === 'All' || article.category === category;
    const queryMatches = !normalizedQuery || [article.title, article.summary, article.category, article.answerSummary, ...(article.body || [])].filter(Boolean).join(' ').toLowerCase().includes(normalizedQuery);
    return categoryMatches && queryMatches;
  });
  const visibleQuestions = filteredArticles.filter((article) => article.isQuestion);
  const visibleLessons = filteredArticles.filter((article) => !article.isQuestion && !article.isScriptureTestimony);
  const visibleTestimonies = filteredArticles.filter((article) => article.isScriptureTestimony);
  const factsInfoAssets = sourceAssets.filter((asset) => asset.groupName === 'Facts & Info');
  const questionArticles = articleList.filter((article) => article.isQuestion);
  const visibleFactsReadingPaths = (category === 'All' || category === 'Research') ? factsInfoReadingPaths.filter((path) => {
    if (!normalizedQuery) return true;
    return [path.title, path.purpose, path.readingPurpose, path.introduction, ...(path.readingSections || []).map((section) => `${section.title} ${section.text}`), ...(path.sourceSections || [])].join(' ').toLowerCase().includes(normalizedQuery);
  }) : [];
  const visibleStudyPacks = (category === 'All' || category === 'Study Packs') ? packList.filter((pack) => {
    if (!normalizedQuery) return true;
    return [pack.title, pack.purpose, pack.description, pack.label, pack.closingPrompt, ...(pack.resources || []).map((resource) => `${resource.label} ${resource.detail}`)].join(' ').toLowerCase().includes(normalizedQuery);
  }) : [];

  useEffect(() => {
    if (initialPathId && factsInfoReadingPaths.some((path) => path.id === initialPathId)) {
      setCategory('Research');
      setQuery('');
    }
  }, [initialPathId]);

  useEffect(() => {
    if (initialStudyPackId && packList.some((pack) => pack.id === initialStudyPackId)) {
      setCategory('Study Packs');
      setQuery('');
    }
  }, [initialStudyPackId, packList]);

  function openLearnCategory(nextCategory, targetId) {
    setCategory(nextCategory);
    setQuery('');
    window.setTimeout(() => document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0);
  }

  function focusWordStudy() {
    const explorer = document.getElementById('word-study-explorer');
    explorer?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    window.setTimeout(() => document.getElementById('word-study-search')?.focus(), 250);
  }

  return (
    <div className="learn-page page-enter">
      <SectionIntro eyebrow="Learn & explore" title="Questions welcome here." description="Clear answers, Scripture first, and room to think at your own pace." action={<button className="round-icon-button" type="button" aria-label="Search learning library" onClick={() => searchRef.current?.focus()}><Icon name="search" /></button>} />
      <SectionArt art={sectionArt.learn} />
      <div className="reference-search learn-search"><Icon name="search" size={16} /><input ref={searchRef} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search lessons and questions" aria-label="Search lessons and questions" />{query && <button type="button" onClick={() => setQuery('')} aria-label="Clear learning search"><Icon name="close" size={15} /></button>}</div>
      <div className="category-pills">{categories.map((option) => <button className={`category-pill ${category === option ? 'active' : ''}`} type="button" key={option} onClick={() => setCategory(option)}>{option}</button>)}</div>
      <LearnContentShelf articles={articleList} sourceAssets={sourceAssets} studyPacks={packList} onSelectCategory={openLearnCategory} onOpenLibraryGroup={onOpenLibraryGroup} onOpenBible={onOpenBible} onOpenDownloads={onOpenDownloads} onFocusWordStudy={focusWordStudy} />
      {visibleStudyPacks.length > 0 && <StudyPackShelf packs={visibleStudyPacks} savedStudyPacks={savedStudyPacks} completedResourcesByPack={completedResourcesByPack} onToggleStudyPackResource={onToggleStudyPackResource} onToggleStudyPack={onToggleStudyPack} onOpenResource={onOpenStudyPackResource} onSaveGuide={onSaveGuide} initialPackId={initialStudyPackId} />}
      {category === 'Study Packs' && visibleStudyPacks.length === 0 && <EmptyState icon="database" title="No study packs found" text="Try another search to find a practical reading bundle." />}
      <ResearchCollectionShelf sourceAssets={sourceAssets} onOpenLibraryGroup={onOpenLibraryGroup} />
      <WordStudyExplorer initialQuery={initialWordStudyQuery} onOpenReference={onOpenReference} />
      {visibleFactsReadingPaths.length > 0 && <FactsInfoReadingPaths paths={visibleFactsReadingPaths} articles={articleList} completedSectionsByPath={completedSectionsByPath} onToggleFactsPathSection={onToggleFactsPathSection} onOpenArticle={onOpenArticle} onOpenReference={onOpenReference} initialPathId={initialPathId} />}
      <AskQuestion questions={questionArticles} onOpenArticle={onOpenArticle} onOpenReference={onOpenReference} />
      {visibleQuestions.length > 0 && <QuestionLibrary questions={visibleQuestions} exploredQuestionIds={questionProgress} onToggleQuestionProgress={onToggleQuestionProgress} onOpenArticle={onOpenArticle} />}
      {visibleTestimonies.length > 0 && <ScriptureTestimonyShelf testimonies={visibleTestimonies} onOpenArticle={onOpenArticle} onOpenReference={onOpenReference} />}
      {category !== 'Study Packs' && (visibleLessons.length > 0 ? <div className="article-grid" id="learn-guides">{visibleLessons.map((article) => <ArticleCard key={article.id} article={article} onOpen={() => onOpenArticle(article)} />)}</div> : filteredArticles.length === 0 ? <EmptyState icon="search" title="No lessons found" text="Try another search or choose a different topic." /> : null)}
      {factsInfoAssets.length > 0 && <section className="facts-library-section" aria-labelledby="facts-library-heading"><div className="section-label-row"><div><p className="eyebrow">Facts & Info sources</p><h2 id="facts-library-heading">Research for difficult questions</h2><p className="section-description">These local studies are indexed for review. Open the collection to inspect the source files and their status.</p></div><button className="text-button" type="button" onClick={() => onOpenLibraryGroup?.('Facts & Info')}>Open collection <Icon name="arrow" size={15} /></button></div><div className="facts-library-grid">{factsInfoAssets.map((asset) => <button className="facts-library-card" type="button" key={asset.id} onClick={() => onOpenLibraryGroup?.('Facts & Info')}><span className="facts-library-icon"><Icon name="info" size={19} /></span><span className="facts-library-copy"><strong>{formatSourceTitle(asset.name)}</strong><small>{asset.type} · {reviewStatusLabel(asset.reviewStatus)}</small></span><Icon name="chevron" size={16} /></button>)}</div></section>}
    </div>
  );
}

function LearnContentShelf({ articles: articleList = [], sourceAssets = [], studyPacks: packList = studyPacks, onSelectCategory, onOpenLibraryGroup, onOpenBible, onOpenDownloads, onFocusWordStudy }) {
  const questionCount = articleList.filter((article) => article.isQuestion).length;
  const foundationCount = articleList.filter((article) => !article.isQuestion && ['Foundations', 'Practice', 'Life'].includes(article.category)).length;
  const jesusCount = articleList.filter((article) => article.category === 'Jesus').length;
  const testimonyCount = articleList.filter((article) => article.isScriptureTestimony).length;
  const documentCount = sourceAssets.filter((asset) => ['Reference document', 'Translation source'].includes(asset.type)).length;
  const wordStudyCount = sourceAssets.filter((asset) => ['strongs', 'vines'].includes(String(asset.groupName || '').toLowerCase())).length;
  const cards = [
    { id: 'foundations', icon: 'learn', tone: 'blue', title: 'Christianity 101', description: 'Foundations, prayer, and daily practice.', count: `${foundationCount} guides`, actionLabel: 'Open foundations', action: () => onSelectCategory?.('Foundations', 'learn-guides') },
    { id: 'jesus', icon: 'sunrise', tone: 'gold', title: 'Jesus', description: 'Read the Gospel portrait of Christ.', count: `${jesusCount} studies`, actionLabel: 'Open Jesus studies', action: () => onSelectCategory?.('Jesus', 'learn-guides') },
    { id: 'questions', icon: 'dialogue', tone: 'green', title: 'Questions Muslims ask', description: 'Curated answers with compare and Scripture modes.', count: `${questionCount} questions`, actionLabel: 'Open questions', action: () => onSelectCategory?.('Questions', 'learn-question-library') },
    { id: 'facts', icon: 'info', tone: 'stone', title: 'Facts & Info paths', description: 'Purpose-led reading through the supplied studies.', count: `${factsInfoReadingPaths.length} paths`, actionLabel: 'Open study paths', action: () => onSelectCategory?.('Research', 'learn-facts-paths') },
    { id: 'testimonies', icon: 'heart', tone: 'green', title: 'Testimonies in Scripture', description: 'Meet people Jesus finds, heals, restores, and sends.', count: `${testimonyCount} stories`, actionLabel: 'Open testimonies', action: () => onSelectCategory?.('Testimonies', 'learn-testimonies') },
    { id: 'study-packs', icon: 'database', tone: 'gold', title: 'Study packs', description: 'Practical bundles that connect every major learning surface.', count: `${packList.length} packs`, actionLabel: 'Browse packs', action: () => onSelectCategory?.('Study Packs', 'learn-study-packs') },
    { id: 'downloads', icon: 'download', tone: 'gold', title: 'Downloads', description: 'Saved study guides ready to revisit offline.', count: 'Local guides', actionLabel: 'Open downloads', action: onOpenDownloads },
    { id: 'word-study', icon: 'scroll', tone: 'violet', title: "Strong's & Vine's", description: 'Search local definitions, original-language notes, and linked verses.', count: `${wordStudyCount.toLocaleString()} sources`, actionLabel: 'Search word studies', action: onFocusWordStudy },
    { id: 'books', icon: 'database', tone: 'slate', title: 'Books & study documents', description: 'Source documents are catalogued with review status.', count: `${documentCount.toLocaleString()} documents`, actionLabel: 'Open source library', action: () => onOpenLibraryGroup?.('All') },
    { id: 'audio', icon: 'headphones', tone: 'violet', title: 'Audio', description: 'Listen to Bible chapters with the device’s local speech voice.', count: 'Local read-aloud', actionLabel: 'Open audio reader', action: onOpenBible },
    { id: 'video', icon: 'sparkles', tone: 'slate', title: 'Video', description: 'No video teaching package is connected to this offline build.', count: 'Not packaged', unavailable: true },
  ];

  return <section className="learn-content-shelf" aria-labelledby="learn-content-shelf-heading"><div className="section-label-row"><div><p className="eyebrow">Content library</p><h2 id="learn-content-shelf-heading">Choose how you want to learn.</h2><p className="section-description">Start with a simple guide, a difficult question, a Facts & Info path, or the research layer behind the app.</p></div><span className="library-total"><Icon name="database" size={16} /> {cards.filter((card) => !card.unavailable).length} active shelves</span></div><div className="learn-content-grid">{cards.map((card) => <article className={`learn-content-card ${card.unavailable ? 'unavailable' : ''}`} key={card.id}><span className={`learn-content-icon tone-${card.tone}`}><Icon name={card.icon} size={19} /></span><div className="learn-content-copy"><strong>{card.title}</strong><p>{card.description}</p><small>{card.count}</small></div>{card.unavailable ? <span className="learn-content-status">Soon</span> : <button className="learn-content-action" type="button" onClick={card.action}>{card.actionLabel}<Icon name="arrow" size={13} /></button>}</article>)}</div></section>;
}

function StudyPackShelf({ packs = [], savedStudyPacks = [], completedResourcesByPack = {}, onToggleStudyPackResource, onToggleStudyPack, onOpenResource, onSaveGuide, initialPackId = null }) {
  const [selectedId, setSelectedId] = useState(initialPackId || packs[0]?.id || null);
  const [exportMessage, setExportMessage] = useState('');
  const selectedPack = packs.find((pack) => pack.id === selectedId) || packs[0] || null;

  useEffect(() => {
    if (initialPackId && packs.some((pack) => pack.id === initialPackId)) setSelectedId(initialPackId);
  }, [initialPackId, packs]);

  useEffect(() => {
    if (!packs.some((pack) => pack.id === selectedId)) setSelectedId(packs[0]?.id || null);
  }, [packs, selectedId]);

  function exportGuide(pack) {
    if (!pack) return;
    const content = buildStudyPackGuide(pack);
    const filename = `from-islam-to-christ-${pack.id}.txt`;
    onSaveGuide?.({ packId: pack.id, title: pack.title, content, filename });
    triggerTextDownload(content, filename);
    setExportMessage('Guide saved in Downloads and exported locally.');
    window.setTimeout(() => setExportMessage(''), 3200);
  }

  if (!selectedPack) return null;
  const isSaved = savedStudyPacks.includes(selectedPack.id);
  const completedResourceIds = Array.isArray(completedResourcesByPack[selectedPack.id]) ? completedResourcesByPack[selectedPack.id] : [];
  const completedCount = selectedPack.resources.filter((resource) => completedResourceIds.includes(resource.id)).length;
  const completionPercent = Math.round((completedCount / selectedPack.resources.length) * 100);

  return <section className="study-pack-shelf" id="learn-study-packs" aria-labelledby="study-pack-heading">
    <SectionArt art={sectionArt.studyPacks} />
    <div className="section-label-row study-pack-heading"><div><p className="eyebrow">Offline study packs</p><h2 id="study-pack-heading">Take a practical next step.</h2><p className="section-description">Each pack brings together the app’s local Bible, Q&amp;A, Facts &amp; Info, prayer, Journey, and Scripture testimony material around one clear purpose.</p></div><span className="library-total"><Icon name="database" size={16} /> {packs.length} packs</span></div>
    <div className="study-pack-layout">
      <div className="study-pack-choice-list" aria-label="Study packs">
        {packs.map((pack) => <button className={`study-pack-choice ${selectedPack.id === pack.id ? 'selected' : ''}`} type="button" key={pack.id} onClick={() => setSelectedId(pack.id)} aria-pressed={selectedPack.id === pack.id}><span className={`study-pack-choice-icon tone-${pack.tone}`}><Icon name={pack.icon} size={20} /></span><span><strong>{pack.title}</strong><small>{pack.label} · {pack.readTime}</small></span><Icon name="chevron" size={15} /></button>)}
      </div>
      <article className="study-pack-detail card-surface">
        <div className="study-pack-detail-heading"><div><p className="eyebrow">{selectedPack.label} · {selectedPack.readTime}</p><h3>{selectedPack.title}</h3></div><span className={`study-pack-detail-icon tone-${selectedPack.tone}`}><Icon name={selectedPack.icon} size={22} /></span></div>
        <p className="study-pack-purpose">{selectedPack.purpose}</p>
        <p className="study-pack-description">{selectedPack.description}</p>
        <LocalReadAloud title="Listen to this study pack" text={[selectedPack.title, selectedPack.purpose, selectedPack.description, ...(selectedPack.resources || []).flatMap((resource) => [resource.label, resource.detail]), selectedPack.closingPrompt].filter(Boolean).join('\n\n')} />
        <div className="study-pack-progress" aria-label={`${completedCount} of ${selectedPack.resources.length} study stops complete`}><div><span>{completedCount} of {selectedPack.resources.length} stops marked complete</span><strong>{completionPercent}%</strong></div><div className="progress-track"><span style={{ width: `${completionPercent}%` }} /></div></div>
        <div className="study-pack-resource-list"><p className="eyebrow">Inside this pack</p>{selectedPack.resources.map((resource, index) => { const complete = completedResourceIds.includes(resource.id); return <div className={`study-pack-resource ${complete ? 'complete' : ''}`} key={resource.id}><button className="study-pack-resource-marker" type="button" onClick={() => onToggleStudyPackResource?.(selectedPack.id, resource.id)} aria-label={`${complete ? 'Mark' : 'Complete'} ${resource.label}`} aria-pressed={complete}><span>{complete ? <Icon name="check" size={13} /> : String(index + 1).padStart(2, '0')}</span></button><div><strong>{resource.label}</strong><p>{resource.detail}</p></div><div className="study-pack-resource-actions"><button className="text-button" type="button" onClick={() => onOpenResource?.(resource)}>Open <Icon name="arrow" size={13} /></button><button className="text-button study-pack-resource-toggle" type="button" onClick={() => onToggleStudyPackResource?.(selectedPack.id, resource.id)}>{complete ? 'Ongoing' : 'Mark done'} <Icon name={complete ? 'arrow' : 'check'} size={13} /></button></div></div>; })}</div>
        <div className="study-pack-reflection"><p className="eyebrow">Pause and reflect</p><p>{selectedPack.closingPrompt}</p></div>
        <div className="study-pack-actions"><button className={`secondary-button ${isSaved ? 'selected' : ''}`} type="button" onClick={() => onToggleStudyPack?.(selectedPack.id)}><Icon name="bookmark" size={15} /> {isSaved ? 'Saved on this device' : 'Save pack locally'}</button><button className="secondary-button" type="button" onClick={() => exportGuide(selectedPack)}><Icon name="download" size={15} /> Export plain-text guide</button></div>
        {exportMessage && <p className="study-pack-message" role="status"><Icon name="check" size={13} /> {exportMessage}</p>}
        <div className="study-pack-review"><Icon name="info" size={16} /><p><strong>Review boundary</strong><span>{selectedPack.reviewNote}</span></p></div>
      </article>
    </div>
  </section>;
}

function Downloads({ guides = [], onOpenPack, onOpenLearn, onRemove }) {
  const [selectedGuideId, setSelectedGuideId] = useState(null);
  const [message, setMessage] = useState('');
  const totalCharacters = guides.reduce((total, guide) => total + guide.content.length, 0);

  function exportGuide(guide) {
    if (!guide) return;
    triggerTextDownload(guide.content, guide.filename || `from-islam-to-christ-${guide.packId}.txt`);
    setMessage(`${guide.title} exported from this device.`);
    window.setTimeout(() => setMessage(''), 3200);
  }

  function formatCreatedAt(value) {
    const date = value ? new Date(value) : null;
    return date && !Number.isNaN(date.getTime())
      ? `Saved ${date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`
      : 'Saved locally';
  }

  return <div className="downloads-page page-enter">
    <SectionIntro eyebrow="Your offline shelf" title="Downloads" description="Study guides you generate in the app stay here on this device. No account or external document service is used." />
    <SectionArt art={sectionArt.downloads} />
    <div className="downloads-summary">
      <div><span className="summary-number">{guides.length}</span><span>saved guides</span></div>
      <div><span className="summary-number">{totalCharacters.toLocaleString()}</span><span>local characters</span></div>
      <div><span className="summary-number">Offline</span><span>available here</span></div>
    </div>
    <section className="downloads-info card-surface">
      <span className="downloads-info-icon"><Icon name="lock" size={21} /></span>
      <div><p className="eyebrow">Private by design</p><h2>Keep your study close.</h2><p>Generated guides are stored in this app’s local storage. Exporting creates a text file through the app; APK update downloads continue to use the separate private native updater.</p></div>
    </section>
    {message && <p className="downloads-message" role="status"><Icon name="check" size={14} /> {message}</p>}
    {guides.length > 0 ? <section className="downloads-list-section" aria-labelledby="downloads-list-heading">
      <div className="section-label-row"><div><p className="eyebrow">Your generated guides</p><h2 id="downloads-list-heading">Return to a clear next step.</h2><p className="section-description">Read a guide in the app, reopen the source pack, or export another copy when you need one.</p></div><span className="library-total"><Icon name="download" size={16} /> {guides.length} saved</span></div>
      <div className="downloads-list">{guides.map((guide) => {
        const pack = studyPacks.find((candidate) => candidate.id === guide.packId);
        const isOpen = selectedGuideId === guide.id;
        return <article className={`download-entry card-surface ${isOpen ? 'open' : ''}`} key={guide.id}>
          <div className="download-entry-heading"><span className={`download-entry-icon tone-${pack?.tone || 'gold'}`}><Icon name="download" size={19} /></span><div><p className="card-category">{pack?.label || 'Study pack'} · {pack?.readTime || 'Local guide'}</p><h3>{guide.title}</h3><small>{formatCreatedAt(guide.createdAt)} · {guide.content.length.toLocaleString()} characters</small></div></div>
          {isOpen && <div className="download-entry-content"><LocalReadAloud title="Listen to this saved guide" text={guide.content} /><pre>{guide.content}</pre></div>}
          <div className="download-entry-actions"><button className="primary-button" type="button" aria-expanded={isOpen} onClick={() => setSelectedGuideId(isOpen ? null : guide.id)}><Icon name={isOpen ? 'close' : 'book'} size={14} /> {isOpen ? 'Close guide' : 'Read guide'}</button><button className="secondary-button" type="button" onClick={() => onOpenPack?.(guide.packId)} disabled={!pack}>Open source pack <Icon name="arrow" size={14} /></button><button className="text-button" type="button" onClick={() => exportGuide(guide)}><Icon name="download" size={14} /> Export again</button><button className="text-button danger" type="button" onClick={() => { if (selectedGuideId === guide.id) setSelectedGuideId(null); onRemove?.(guide.id); }}><Icon name="close" size={13} /> Remove</button></div>
        </article>;
      })}</div>
    </section> : <section className="downloads-empty-section"><EmptyState icon="download" title="Nothing downloaded yet" text="Open Learn, choose a Study Pack, and export a guide. It will appear here for a quick return to the material." action={<button className="text-button" type="button" onClick={onOpenLearn}>Open Learn <Icon name="arrow" size={15} /></button>} /></section>}
  </div>;
}

function ScriptureTestimonyShelf({ testimonies = [], onOpenArticle, onOpenReference }) {
  return <section className="scripture-testimony-shelf" id="learn-testimonies" aria-labelledby="scripture-testimony-heading">
    <SectionArt art={sectionArt.testimonies} />
    <div className="section-label-row"><div><p className="eyebrow">Testimonies in Scripture</p><h2 id="scripture-testimony-heading">Notice how Jesus meets people.</h2><p className="section-description">These are Bible narratives, not invented modern biographies. Read the story, follow the passage, and consider what Jesus’ mercy and truth mean for you.</p></div><span className="library-total"><Icon name="heart" size={16} /> {testimonies.length} stories</span></div>
    <div className="scripture-testimony-grid">{testimonies.map((testimony) => <article className="scripture-testimony-card card-surface" key={testimony.id}><div className={`scripture-testimony-icon tone-${testimony.tone}`}><Icon name={testimony.icon} size={22} /></div><div className="scripture-testimony-copy"><p className="card-category">{testimony.readTime}</p><h3>{testimony.title}</h3><p>{testimony.summary}</p><div className="scripture-testimony-actions"><button className="primary-button" type="button" onClick={() => onOpenArticle?.(testimony)}>Read story <Icon name="arrow" size={14} /></button>{testimony.references?.map((reference) => <button className="text-button" type="button" key={reference} onClick={() => onOpenReference?.(reference)}>{reference} <Icon name="book" size={13} /></button>)}</div></div></article>)}</div>
  </section>;
}

function ResearchCollectionShelf({ sourceAssets = [], onOpenLibraryGroup }) {
  const collectionCards = researchCollections.map((collection) => {
    const count = sourceAssets.filter((asset) => String(asset.groupName || '').toLowerCase() === String(collection.group).toLowerCase()).length;
    const tone = collection.group === 'strongs' || collection.group === 'vines' ? 'violet' : collection.group === 'Facts & Info' ? 'gold' : 'blue';
    return { ...collection, count, tone };
  });
  const indexedCount = collectionCards.reduce((total, collection) => total + collection.count, 0);

  return <section className="research-collection-shelf" aria-labelledby="research-collection-heading">
    <SectionArt art={sectionArt.library} />
    <div className="section-label-row"><div><p className="eyebrow">Research layer</p><h2 id="research-collection-heading">Use the sources carefully.</h2><p className="section-description">These collections are built from the local Data catalog. Open one to inspect its files, counts, and review status before treating it as teaching material.</p></div><span className="library-total"><Icon name="database" size={16} /> {indexedCount.toLocaleString()} indexed</span></div>
    <div className="research-collection-grid">{collectionCards.map((collection) => <button className="research-collection-card" type="button" key={collection.id} onClick={() => onOpenLibraryGroup?.(collection.group)}><span className={`research-collection-icon tone-${collection.tone}`}><Icon name={collection.icon} size={19} /></span><span className="research-collection-copy"><strong>{collection.label}</strong><small>{collection.count.toLocaleString()} indexed source{collection.count === 1 ? '' : 's'}</small><em>{collection.description}</em></span><Icon name="arrow" size={15} /></button>)}</div>
  </section>;
}

function WordStudyExplorer({ initialQuery = '', onOpenReference }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedNumber, setSelectedNumber] = useState(null);
  const appliedInitialQuery = useRef(null);
  const normalizedQuery = query.trim();
  const selectedEntry = results.find((entry) => entry.strongNumber === selectedNumber) || null;

  useEffect(() => {
    const nextQuery = String(initialQuery || '').trim();
    if (!nextQuery || nextQuery === appliedInitialQuery.current) return;
    appliedInitialQuery.current = nextQuery;
    setQuery(nextQuery);
  }, [initialQuery]);

  useEffect(() => {
    if (!normalizedQuery) {
      setResults([]);
      setLoading(false);
      setSelectedNumber(null);
      return undefined;
    }

    let cancelled = false;
    setLoading(true);
    const timer = window.setTimeout(() => {
      searchLexiconEntries(normalizedQuery, 12).then((entries) => {
        if (cancelled) return;
        setResults(entries);
        setSelectedNumber((current) => entries.some((entry) => entry.strongNumber === current) ? current : entries[0]?.strongNumber || null);
      }).catch(() => {
        if (!cancelled) {
          setResults([]);
          setSelectedNumber(null);
        }
      }).finally(() => {
        if (!cancelled) setLoading(false);
      });
    }, 220);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [normalizedQuery]);

  function clearSearch() {
    setQuery('');
    setResults([]);
    setSelectedNumber(null);
  }

  return (
    <section className="word-study-explorer" id="word-study-explorer" aria-labelledby="word-study-explorer-heading">
      <SectionArt art={sectionArt.library} />
      <div className="word-study-explorer-heading">
        <div><p className="eyebrow">Offline word-study explorer</p><h2 id="word-study-explorer-heading">Search the words behind the text.</h2><p className="section-description">Look up a Strong’s number, lemma, transliteration, or definition. Results come from the indexed local lexicon and can lead directly into the Bible reader.</p></div>
        <span className="word-study-explorer-badge"><Icon name="lock" size={13} /> Local</span>
      </div>
      <form className="word-study-explorer-form" onSubmit={(event) => event.preventDefault()}>
        <div className="reference-search"><Icon name="search" size={16} /><input id="word-study-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Try G26, agape, love, or covenant" aria-label="Search Strong's and Vine's word studies" autoComplete="off" />{query && <button type="button" onClick={clearSearch} aria-label="Clear word-study search"><Icon name="close" size={15} /></button>}</div>
        <button className="primary-button word-study-explorer-submit" type="submit"><Icon name="search" size={14} /> Search</button>
      </form>
      <p className="word-study-explorer-note"><Icon name="info" size={13} /> Definitions and alignment rows are study aids. Read the linked passage in context and keep the source review status in mind.</p>
      {loading ? <p className="word-study-loading" role="status"><span className="loading-dot" /> Searching the local word-study index…</p> : normalizedQuery && results.length === 0 ? <p className="word-study-empty" role="status">No local Strong’s or Vine’s entries matched <span data-private-content="true">“{normalizedQuery}”</span>. Try a number, a shorter word, or a different spelling.</p> : results.length > 0 ? <div className="word-study-explorer-results" aria-live="polite">
        <div className="word-study-explorer-results-heading"><div><p className="eyebrow">Search results</p><h3>{results.length} local entr{results.length === 1 ? 'y' : 'ies'}</h3></div><span>Select an entry to inspect its study trail.</span></div>
        <div className="word-study-list">
          {results.map((entry) => <button className={`word-study-entry ${selectedNumber === entry.strongNumber ? 'selected' : ''}`} type="button" key={entry.strongNumber} onClick={() => setSelectedNumber((current) => current === entry.strongNumber ? null : entry.strongNumber)} aria-expanded={selectedNumber === entry.strongNumber}>
            <div className="word-study-entry-heading"><strong>{entry.strongNumber}</strong><span>{entry.language}{entry.lemma ? ` · ${entry.lemma}` : ''}{entry.transliteration ? ` · ${entry.transliteration}` : ''}</span><Icon name="chevron" size={14} /></div>
            <p>{entry.strongsDefinition || entry.kjvDefinition || 'Definition available in the local lexicon.'}</p>
            <div className="word-study-entry-meta"><span>{entry.occurrenceCount.toLocaleString()} Bible occurrence{entry.occurrenceCount === 1 ? '' : 's'}</span>{entry.vines.length > 0 && <span>Vine’s reference</span>}{entry.originalLanguage.length > 0 && <span>{entry.originalLanguage.map((alignment) => alignment.corpus).join(' · ')}</span>}</div>
          </button>)}
        </div>
        {selectedEntry && <article className="word-study-explorer-detail word-study-detail" aria-labelledby="word-study-selected-heading">
          <div className="word-study-detail-heading"><div><p className="eyebrow">Selected word study</p><h4 id="word-study-selected-heading">{selectedEntry.strongNumber} · {selectedEntry.lemma || 'Lexical entry'}</h4></div><button type="button" className="word-study-close" onClick={() => setSelectedNumber(null)} aria-label="Close selected word study"><Icon name="close" size={15} /></button></div>
          <dl className="word-study-facts">
            <div><dt>Language</dt><dd>{selectedEntry.language || 'Original language'}</dd></div>
            <div><dt>Transliteration</dt><dd>{selectedEntry.transliteration || 'Not listed'}</dd></div>
            <div><dt>Meaning</dt><dd>{selectedEntry.strongsDefinition || selectedEntry.kjvDefinition || 'Definition available in the local lexicon.'}</dd></div>
            {selectedEntry.derivation && <div><dt>Derivation</dt><dd>{selectedEntry.derivation}</dd></div>}
          </dl>
          {selectedEntry.vines.length > 0 && <div className="word-study-explorer-vines word-study-vines"><p className="eyebrow">Vine’s reference</p>{selectedEntry.vines.map((vine, index) => <div key={`${selectedEntry.strongNumber}-vine-${index}`}><strong>{vine.title}{vine.gloss ? ` · ${vine.gloss}` : ''}</strong>{vine.definition && <p>{vine.definition}</p>}</div>)}</div>}
          {selectedEntry.originalLanguage.length > 0 && <div className="word-study-alignment"><div className="word-study-alignment-heading"><p className="eyebrow">Original-language alignment</p><span>Review</span></div><p className="word-study-alignment-note">Derived metadata from the local Hebrew and Greek alignment indexes. Raw research files remain outside the renderer bundle until their review is complete.</p><div className="word-study-alignment-list">{selectedEntry.originalLanguage.map((alignment, index) => <div className="word-study-alignment-entry" key={`${selectedEntry.strongNumber}-${alignment.corpus}-${index}`}><div><strong>{alignment.corpus === 'BHSA' ? 'BHSA · Hebrew' : 'N1904 · Greek'}</strong><span>{alignment.lemma || 'Lemma not listed'}{alignment.transliteration ? ` · ${alignment.transliteration}` : ''}</span></div><small>{alignment.occurrenceCount.toLocaleString()} aligned occurrences</small>{alignment.gloss && <p>{alignment.gloss}</p>}{formatAlignmentMetadata(alignment) && <em>{formatAlignmentMetadata(alignment)}</em>}</div>)}</div></div>}
          <div className="word-study-related"><div className="word-study-related-heading"><p className="eyebrow">Open linked verses</p><span>{selectedEntry.occurrenceCount.toLocaleString()} total in the local KJV index</span></div>{selectedEntry.occurrences.length > 0 ? <div className="related-verse-list">{selectedEntry.occurrences.map((occurrence) => <button type="button" key={`${selectedEntry.strongNumber}-${occurrence.reference}`} onClick={() => onOpenReference?.(occurrence.reference)}><strong>{occurrence.reference}</strong><span>{occurrence.text}</span><Icon name="arrow" size={14} /></button>)}</div> : <p className="word-study-empty">No linked verse occurrences are available for this entry.</p>}{selectedEntry.occurrenceCount > selectedEntry.occurrences.length && <small className="word-study-more">Showing the first {selectedEntry.occurrences.length} linked verses. Open one to continue reading in context.</small>}</div>
        </article>}
      </div> : <div className="word-study-explorer-empty"><Icon name="scroll" size={24} /><div><p className="eyebrow">A searchable study shelf</p><p>Start with a familiar word or a Strong’s number. The app will bring together dictionary meaning, Vine’s notes, original-language alignment, and linked Bible passages in one place.</p></div></div>}
    </section>
  );
}

function FactsInfoReadingPaths({ paths, articles, completedSectionsByPath = {}, onToggleFactsPathSection, onOpenArticle, onOpenReference, initialPathId = null }) {
  const [selectedId, setSelectedId] = useState(initialPathId || paths[0]?.id || null);
  const [selectedPurpose, setSelectedPurpose] = useState('All');
  const appliedInitialPathId = useRef(null);
  const purposeOptions = useMemo(() => ['All', ...new Set(paths.map((path) => path.readingPurpose).filter(Boolean))], [paths]);
  const visiblePaths = useMemo(() => paths.filter((path) => selectedPurpose === 'All' || path.readingPurpose === selectedPurpose), [paths, selectedPurpose]);
  const selectedPath = visiblePaths.find((path) => path.id === selectedId) || visiblePaths[0];
  const sourceArticles = (selectedPath?.sourceIds || []).map((id) => articles.find((article) => article.id === id)).filter(Boolean);
  const questionArticles = (selectedPath?.questionIds || []).map((id) => articles.find((article) => article.id === id)).filter(Boolean);
  const completedSectionTitles = Array.isArray(completedSectionsByPath[selectedPath?.id]) ? completedSectionsByPath[selectedPath.id] : [];
  const completedCount = selectedPath?.readingSections?.filter((section) => completedSectionTitles.includes(section.title)).length || 0;
  const completionPercent = selectedPath?.readingSections?.length ? Math.round((completedCount / selectedPath.readingSections.length) * 100) : 0;

  useEffect(() => {
    if (!purposeOptions.includes(selectedPurpose)) setSelectedPurpose('All');
  }, [purposeOptions, selectedPurpose]);

  useEffect(() => {
    if (initialPathId && initialPathId !== appliedInitialPathId.current && paths.some((path) => path.id === initialPathId)) {
      appliedInitialPathId.current = initialPathId;
      setSelectedId(initialPathId);
      const initialPath = paths.find((path) => path.id === initialPathId);
      if (initialPath?.readingPurpose) setSelectedPurpose(initialPath.readingPurpose);
      return;
    }
    if (!visiblePaths.some((path) => path.id === selectedId)) setSelectedId(visiblePaths[0]?.id || null);
  }, [initialPathId, paths, selectedId, visiblePaths]);

  if (!selectedPath) return null;

  return (
    <section className="facts-reading-section" id="learn-facts-paths" aria-labelledby="facts-reading-heading">
      <SectionArt art={sectionArt.factsInfo} />
      <div className="section-label-row facts-reading-heading">
        <div><p className="eyebrow">Facts &amp; Info study paths</p><h2 id="facts-reading-heading">Read the research with a purpose.</h2><p className="section-description">The supplied studies are divided into practical reading paths. Start where your question is, follow the Scripture trail, and return to Jesus at the center.</p></div>
        <span className="facts-reading-count">{visiblePaths.length} of {paths.length} paths</span>
      </div>
      <div className="facts-reading-purpose-filter" aria-label="Choose a Facts and Information reading purpose"><span>Choose a reading purpose</span><div role="group" aria-label="Facts and Information reading purposes">{purposeOptions.map((purpose) => <button className={`facts-reading-purpose-pill ${selectedPurpose === purpose ? 'active' : ''}`} type="button" key={purpose} onClick={() => setSelectedPurpose(purpose)} aria-pressed={selectedPurpose === purpose}>{purpose}{purpose === 'All' ? ` · ${paths.length}` : ` · ${paths.filter((path) => path.readingPurpose === purpose).length}`}</button>)}</div></div>
      <div className="facts-reading-grid" aria-label={`${visiblePaths.length} Facts and Information reading paths`}>
        {visiblePaths.map((path) => <button className={`facts-reading-card ${selectedPath.id === path.id ? 'selected' : ''}`} type="button" key={path.id} onClick={() => setSelectedId(path.id)} aria-pressed={selectedPath.id === path.id}>
          <span className={`facts-reading-icon tone-${path.tone}`}><Icon name={path.icon} size={21} /></span>
          <span className="facts-reading-copy"><strong>{path.title}</strong><small>{path.purpose}</small><em>{path.readingPurpose} · {path.readTime}</em></span>
          <Icon name="chevron" size={16} />
        </button>)}
      </div>
      <article className="facts-reading-detail" aria-labelledby="facts-reading-detail-heading">
        <div className="facts-reading-detail-heading"><div><p className="eyebrow">{selectedPath.label} · {selectedPath.readTime}</p><h3 id="facts-reading-detail-heading">{selectedPath.title}</h3></div><Icon name={selectedPath.icon} size={25} /></div>
        <p className="facts-reading-introduction">{selectedPath.introduction}</p>
        <LocalReadAloud title="Listen to this reading path" text={[selectedPath.title, selectedPath.introduction, ...(selectedPath.readingSections || []).flatMap((section) => [section.title, section.text]), ...(selectedPath.sourceSections || [])].filter(Boolean).join('\n\n')} />
        <div className="facts-reading-progress" aria-label={`${completedCount} of ${selectedPath.readingSections.length} research sections read`}><div><span>{completedCount} of {selectedPath.readingSections.length} sections marked read</span><strong>{completionPercent}%</strong></div><div className="progress-track"><span style={{ width: `${completionPercent}%` }} /></div></div>
        <div className="facts-reading-sections">{selectedPath.readingSections.map((section, index) => { const complete = completedSectionTitles.includes(section.title); return <section className={complete ? 'complete' : ''} key={section.title}><div className="facts-reading-section-heading"><button className="facts-reading-marker" type="button" onClick={() => onToggleFactsPathSection?.(selectedPath.id, section.title)} aria-label={`${complete ? 'Mark' : 'Complete'} ${section.title}`} aria-pressed={complete}><span>{complete ? <Icon name="check" size={13} /> : String(index + 1).padStart(2, '0')}</span></button><span>{complete ? 'Read' : `Part ${String(index + 1).padStart(2, '0')}`}</span></div><div><h4>{section.title}</h4><p>{section.text}</p></div><button className="text-button facts-reading-toggle" type="button" onClick={() => onToggleFactsPathSection?.(selectedPath.id, section.title)}>{complete ? 'Ongoing' : 'Mark read'} <Icon name={complete ? 'arrow' : 'check'} size={13} /></button></section>; })}</div>
        <div className="facts-reading-trails">
          <div><p className="eyebrow">Source chapters</p><ul>{selectedPath.sourceSections.map((sourceSection) => <li key={sourceSection}>{sourceSection}</li>)}</ul></div>
          <div><p className="eyebrow">Scripture trail</p><div className="facts-reading-references">{selectedPath.references.map((reference) => <button type="button" key={reference} onClick={() => onOpenReference?.(reference)}>{reference}<Icon name="arrow" size={13} /></button>)}</div></div>
        </div>
        <div className="facts-reading-source-actions"><p className="eyebrow">Open the source-linked study</p><div>{sourceArticles.map((article) => <button className="text-button" type="button" key={article.id} onClick={() => onOpenArticle?.(article)}>{article.title} <Icon name="arrow" size={14} /></button>)}</div></div>
        {questionArticles.length > 0 && <div className="facts-reading-question-actions"><div><p className="eyebrow">Continue with a question</p><p>Let the research lead back to Jesus, Scripture, and a practical next step.</p></div><div>{questionArticles.map((article) => <button className="facts-reading-question" type="button" key={article.id} onClick={() => onOpenArticle?.(article)}><span><Icon name={article.icon || 'dialogue'} size={16} /></span><strong>{article.title}</strong><Icon name="arrow" size={14} /></button>)}</div></div>}
      </article>
    </section>
  );
}

function AskQuestion({ questions = [], onOpenArticle, onOpenReference }) {
  const [query, setQuery] = useState('');
  const normalizedQuery = query.trim().toLowerCase();
  const matches = useMemo(() => {
    if (!normalizedQuery) return [];
    const aliasTerms = [
      ['three gods', ['trinity', 'one god']],
      ['three god', ['trinity', 'one god']],
      ['why did jesus pray', ['prayer', 'father']],
      ['jesus pray', ['prayer', 'father']],
      ['changed bible', ['corrupted', 'manuscript']],
      ['bible changed', ['corrupted', 'manuscript']],
      ['god physically', ['son of god', 'incarnation']],
      ['forgive sin', ['salvation', 'grace', 'atonement']],
      ['good works', ['faith', 'works', 'salvation']],
    ].filter(([phrase]) => normalizedQuery.includes(phrase)).flatMap(([, terms]) => terms);
    const terms = [...new Set([...normalizedQuery.split(/\s+/).filter((term) => term.length > 2), ...aliasTerms])];
    return questions.map((question) => {
      const title = question.title.toLowerCase();
      const searchable = [question.title, question.summary, question.answerSummary, ...(question.body || []), ...(question.references || []), ...(question.comparativeSources || []), question.furtherReading].filter(Boolean).join(' ').toLowerCase();
      const termScore = terms.reduce((score, term) => score + (searchable.includes(term) ? 1 : 0), 0);
      const titleScore = title.includes(normalizedQuery) ? 10 : terms.reduce((score, term) => score + (title.includes(term) ? 3 : 0), 0);
      const phraseScore = searchable.includes(normalizedQuery) ? 4 : 0;
      return { question, score: titleScore + termScore + phraseScore };
    }).filter((result) => result.score > 0).sort((a, b) => b.score - a.score).slice(0, 3).map((result) => result.question);
  }, [normalizedQuery, questions]);
  const suggestions = questions.slice(0, 4);
  const selectedQuestion = matches[0];

  return (
    <section className="ask-question card-surface" aria-labelledby="ask-question-heading">
      <div className="ask-question-heading"><span className="ask-question-icon"><Icon name="dialogue" size={21} /></span><div><p className="eyebrow">Ask a question</p><h2 id="ask-question-heading">Bring an honest question.</h2><p>Search the local, curated Q&A library. Answers are drawn from the app's reviewed study records, not from an unrestricted chat service.</p></div></div>
      <form className="ask-question-form" onSubmit={(event) => { event.preventDefault(); setQuery((current) => current.trim()); }}><label className="sr-only" htmlFor="ask-question-input">Ask a question</label><input id="ask-question-input" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="How can Jesus be God if He prayed?" /><button className="primary-button" type="submit">Find an answer <Icon name="arrow" size={15} /></button></form>
      {!normalizedQuery && <div className="ask-question-suggestions" aria-label="Suggested questions"><span>Try one of these</span>{suggestions.map((question) => <button type="button" key={question.id} onClick={() => setQuery(question.title)}>{question.title}</button>)}</div>}
      {normalizedQuery && <div className="ask-question-result" aria-live="polite">{selectedQuestion ? <><div className="ask-question-result-heading"><div><p className="eyebrow">Curated quick answer</p><h3>{selectedQuestion.title}</h3></div><span>{matches.length} match{matches.length === 1 ? '' : 'es'}</span></div><p>{selectedQuestion.answerSummary}</p><div className="ask-question-scripture"><div><p className="eyebrow">Start in Scripture</p><small>Open a recommended passage in the offline reader.</small></div><div className="ask-question-scripture-links">{(selectedQuestion.references || []).slice(0, 4).map((reference) => <button type="button" key={reference} onClick={() => onOpenReference?.(reference)}>{reference} <Icon name="book" size={13} /></button>)}</div></div><div className="ask-question-result-actions"><button className="text-button" type="button" onClick={() => onOpenArticle?.(selectedQuestion)}>Open full study <Icon name="arrow" size={14} /></button>{matches.slice(1).map((question) => <button className="ask-question-alternate" type="button" key={question.id} onClick={() => setQuery(question.title)}>Also explore: {question.title}</button>)}</div></> : <><p className="eyebrow">No curated match yet</p><p>Try a phrase such as “Trinity,” “Bible corrupted,” “Why did Jesus pray?” or browse the question cards below.</p></>}</div>}
    </section>
  );
}

function QuestionLibrary({ questions = [], exploredQuestionIds = [], onToggleQuestionProgress, onOpenArticle }) {
  const [selectedId, setSelectedId] = useState(questions[0]?.id || null);
  const [selectedTopic, setSelectedTopic] = useState('All');
  const topicOptions = ['All', ...new Set(questions.map((question) => question.questionTopic).filter(Boolean))];
  const visibleQuestions = questions.filter((question) => selectedTopic === 'All' || question.questionTopic === selectedTopic);
  const selectedQuestion = visibleQuestions.find((question) => question.id === selectedId) || visibleQuestions[0];
  const exploredQuestions = new Set(exploredQuestionIds);
  const exploredVisibleCount = visibleQuestions.filter((question) => exploredQuestions.has(question.id)).length;
  const progressPercent = visibleQuestions.length ? Math.round((exploredVisibleCount / visibleQuestions.length) * 100) : 0;

  useEffect(() => {
    if (!visibleQuestions.some((question) => question.id === selectedId)) setSelectedId(visibleQuestions[0]?.id || null);
  }, [visibleQuestions, selectedId]);

  useEffect(() => {
    if (!topicOptions.includes(selectedTopic)) setSelectedTopic('All');
  }, [questions, selectedTopic, topicOptions]);

  if (!visibleQuestions.length || !selectedQuestion) return null;

  return (
    <section className="question-library" id="learn-question-library" aria-labelledby="question-library-heading">
      <div className="section-label-row">
        <div><p className="eyebrow">Common questions</p><h2 id="question-library-heading">Questions Muslims may ask</h2><p className="section-description">Explore respectful, Scripture-linked answers to questions that often arise when comparing Islam and Christianity. Browse by topic when you want a focused starting point.</p></div>
        <span className="question-count">{visibleQuestions.length} of {questions.length} available</span>
      </div>
      <div className="question-topic-filter" aria-label="Filter questions by topic">
        <span>Browse by topic</span>
        <div role="group" aria-label="Question topics">
          {topicOptions.map((topic) => <button className={`question-topic-pill ${selectedTopic === topic ? 'active' : ''}`} type="button" key={topic} onClick={() => setSelectedTopic(topic)} aria-pressed={selectedTopic === topic}>{topic}{topic === 'All' ? ` · ${questions.length}` : ` · ${questions.filter((question) => question.questionTopic === topic).length}`}</button>)}
        </div>
      </div>
      <div className="question-reading-progress" aria-label={`${exploredVisibleCount} of ${visibleQuestions.length} questions explored`}>
        <div><span>Private reading progress</span><strong>{exploredVisibleCount} of {visibleQuestions.length} explored</strong></div>
        <div className="progress-track" aria-hidden="true"><span style={{ width: `${progressPercent}%` }} /></div>
      </div>
      <div className="question-library-layout">
        <div className="question-card-list" aria-label={`${selectedTopic} questions Muslims may ask`}>
          {visibleQuestions.map((question) => <button className={`question-card ${selectedQuestion.id === question.id ? 'selected' : ''}`} type="button" key={question.id} onClick={() => setSelectedId(question.id)} aria-pressed={selectedQuestion.id === question.id}><span className={`question-card-icon tone-${question.tone}`}><Icon name={question.icon} size={18} /></span><span className="question-card-copy"><strong>{question.title}</strong><small>{question.questionTopic} · {question.summary}</small>{exploredQuestions.has(question.id) && <span className="question-card-explored"><Icon name="check" size={11} /> Explored</span>}</span><Icon name="chevron" size={15} /></button>)}
        </div>
        <div className="question-answer card-surface">
          <div className="question-answer-heading"><span className="question-answer-icon"><Icon name="dialogue" size={21} /></span><div><p className="eyebrow">{selectedQuestion.questionTopic} · Quick answer</p><h3>{selectedQuestion.title}</h3></div></div>
          <p>{selectedQuestion.answerSummary}</p>
          <div className="question-answer-footer"><span><Icon name="book" size={14} /> {selectedQuestion.references.length} Scripture passages</span><div className="question-answer-footer-actions"><button className={`text-button question-explore-toggle ${exploredQuestions.has(selectedQuestion.id) ? 'complete' : ''}`} type="button" onClick={() => onToggleQuestionProgress?.(selectedQuestion.id)} aria-pressed={exploredQuestions.has(selectedQuestion.id)}>{exploredQuestions.has(selectedQuestion.id) ? 'Mark ongoing' : 'Mark explored'} <Icon name={exploredQuestions.has(selectedQuestion.id) ? 'refresh' : 'check'} size={14} /></button><button className="text-button" type="button" onClick={() => onOpenArticle?.(selectedQuestion)}>Open full study <Icon name="arrow" size={15} /></button></div></div>
        </div>
      </div>
    </section>
  );
}

function ArticleCard({ article, onOpen }) {
  return <article className="article-card card-surface"><button className={`article-art tone-${article.tone}`} type="button" onClick={onOpen} aria-label={`Open ${article.title}`}><Icon name={article.icon} size={31} /></button><div className="article-card-body"><p className="card-category">{article.category}</p><h3>{article.title}</h3><p>{article.summary}</p><div className="article-meta"><span>{article.readTime}</span><button type="button" onClick={onOpen}>Read <Icon name="arrow" size={14} /></button></div></div></article>;
}

function QuestionStudyModes({ article, onOpenReference }) {
  const [mode, setMode] = useState('quick');
  const modeId = `question-study-${article.id}`;

  useEffect(() => setMode('quick'), [article.id]);

  const modes = [
    { id: 'quick', label: 'Quick answer' },
    { id: 'study', label: 'Study answer' },
    { id: 'compare', label: 'Compare' },
    { id: 'scripture', label: 'Scripture only' },
  ];

  return (
    <section className="question-study-modes" aria-labelledby={`${modeId}-heading`}>
      <div className="question-mode-tabs" role="tablist" aria-label="Question answer modes">
        {modes.map((option) => <button className={`question-mode-tab ${mode === option.id ? 'active' : ''}`} type="button" role="tab" key={option.id} id={`${modeId}-tab-${option.id}`} aria-selected={mode === option.id} aria-controls={`${modeId}-panel`} onClick={() => setMode(option.id)}>{option.label}</button>)}
      </div>
      <div className="question-mode-panel" id={`${modeId}-panel`} role="tabpanel" aria-labelledby={`${modeId}-tab-${mode}`}>
        <h2 id={`${modeId}-heading`} className="sr-only">{modes.find((option) => option.id === mode)?.label}</h2>
        {mode === 'quick' && <div className="question-mode-quick"><p className="eyebrow">A clear starting point</p><p>{article.answerSummary}</p></div>}
        {mode === 'study' && <div className="question-mode-study"><p className="eyebrow">Read the fuller explanation</p>{article.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>}
        {mode === 'compare' && <div className="question-compare-grid"><article className="question-compare-column christian"><p className="eyebrow">Christian explanation</p><p>{article.answerSummary}</p></article><article className="question-compare-column sources"><p className="eyebrow">Comparative starting points</p><p>These source references are entry points for careful comparison, not a complete summary of every Muslim belief. Read each text in context and keep the Christian interpretation, the Islamic source, and the historical question distinct.</p>{article.comparativeSources?.length > 0 && <ul>{article.comparativeSources.map((source) => <li key={source}>{source}</li>)}</ul>}</article></div>}
        {mode === 'scripture' && <div className="question-mode-scripture"><p className="eyebrow">Read the passages in context</p><p>This view keeps the study trail focused on the Bible references attached to this question. Open a passage to continue in the offline reader.</p><div className="question-scripture-links">{article.references.map((reference) => <button type="button" key={reference} onClick={() => onOpenReference?.(reference)}>{reference} <Icon name="arrow" size={14} /></button>)}</div></div>}
      </div>
    </section>
  );
}

function relatedArticlesFor(article, limit = 3) {
  const referenceSet = new Set(article.references || []);
  const uniqueArticles = [...new Map(allArticles.map((item) => [item.id, item])).values()];
  return uniqueArticles
    .filter((item) => item.id !== article.id)
    .map((item) => {
      const sharedReferences = (item.references || []).filter((reference) => referenceSet.has(reference)).length;
      let score = sharedReferences * 5;
      if (item.category === article.category) score += 3;
      if (Boolean(item.isQuestion) === Boolean(article.isQuestion)) score += 2;
      if (Boolean(item.sourceFile) === Boolean(article.sourceFile)) score += 1;
      return { item, score };
    })
    .sort((left, right) => right.score - left.score || left.item.title.localeCompare(right.item.title))
    .slice(0, limit)
    .map(({ item }) => item);
}

function contextualFollowUpFor(article) {
  const prompts = {
    God: 'How does this question invite you to examine God’s character and love, not only a definition?',
    Jesus: 'What does Jesus’ response, authority, or compassion reveal about who He is and how He welcomes you?',
    Bible: 'What passage or historical question would you read next before deciding what the Bible says?',
    'Quran & Islam': 'What changes when you read the biblical and Islamic claims in their own contexts, then ask which portrait leads you toward truth?',
    'Salvation & Life': 'What would it mean to bring this question honestly to Jesus and take one safe, faithful next step?',
  };
  return prompts[article.questionTopic] || 'What is the next honest question you want to bring into the light of Jesus and Scripture?';
}

function ArticleDetail({ article, onBack, bookmarks, toggleBookmark, navigate, onOpenReference, onOpenArticle, questionProgress = [], onToggleQuestionProgress }) {
  const articleArt = article.sourceFile ? sectionArt.library : sectionArt.learn;
  const relatedArticles = relatedArticlesFor(article);
  const questionExplored = article.isQuestion && questionProgress.includes(article.id);
  const readAloudText = [article.title, article.summary, article.answerSummary, ...(article.body || []), article.keyArgument, article.furtherReading].filter(Boolean).join('\n\n');
  return <div className="article-detail page-enter"><button className="back-button" type="button" onClick={onBack}><Icon name="back" size={17} /> Back to Learn</button><SectionArt art={article.isScriptureTestimony ? sectionArt.testimonies : articleArt} /><div className="detail-layout"><article className="detail-article"><div className={`detail-hero tone-${article.tone}`}><Icon name={article.icon} size={46} /><span>{article.category}</span></div><p className="eyebrow">{article.readTime} · {article.sourceFile ? 'Review draft' : article.isQuestion ? 'Curated Q&A' : article.isScriptureTestimony ? 'Bible narrative' : 'Prototype content'}</p><h1>{article.title}</h1><p className="detail-lede">{article.summary}</p><LocalReadAloud title={article.isQuestion ? 'Listen to this answer' : 'Listen to this study'} text={readAloudText} />{article.isQuestion ? <QuestionStudyModes article={article} onOpenReference={onOpenReference} /> : <>{article.answerSummary && <div className="answer-callout"><p className="eyebrow">Quick answer</p><p>{article.answerSummary}</p></div>}{article.body.map((paragraph) => <p className="detail-paragraph" key={paragraph}>{paragraph}</p>)}</>}{article.reflectionPrompt && <section className="testimony-reflection-prompt"><p className="eyebrow">Pause and reflect</p><p>{article.reflectionPrompt}</p></section>}{article.keyArgument && <section className="research-detail-section"><p className="eyebrow">Key argument</p><p className="detail-paragraph">{article.keyArgument}</p></section>}<div className="references-box"><p className="eyebrow">Scripture to explore</p><div>{article.references.map((reference) => <button key={reference} type="button" onClick={() => onOpenReference ? onOpenReference(reference) : navigate('bible')}>{reference} <Icon name="arrow" size={14} /></button>)}</div></div>{article.comparativeSources && <section className="research-detail-section"><p className="eyebrow">Comparative source trail</p><ul className="research-source-list">{article.comparativeSources.map((source) => <li key={source}>{source}</li>)}</ul></section>}{article.furtherReading && <section className="research-detail-section"><p className="eyebrow">Further reading</p><p className="detail-paragraph">{article.furtherReading}</p></section>}{article.reviewNote && <div className="research-review-note"><Icon name="info" size={17} /><p><strong>Review boundary</strong><span>{article.reviewNote}</span></p></div>}{relatedArticles.length > 0 && <RelatedReading article={article} articles={relatedArticles} onOpenArticle={onOpenArticle} />}</article><aside className="detail-actions"><button className={`save-detail-button ${bookmarks.includes(`article-${article.id}`) ? 'saved' : ''}`} type="button" onClick={() => toggleBookmark(`article-${article.id}`)}><Icon name="bookmark" size={18} /> {bookmarks.includes(`article-${article.id}`) ? 'Saved locally' : 'Save for later'}</button>{article.isQuestion && <button className={`save-detail-button question-detail-progress ${questionExplored ? 'saved' : ''}`} type="button" onClick={() => onToggleQuestionProgress?.(article.id)} aria-pressed={questionExplored}><Icon name={questionExplored ? 'refresh' : 'check'} size={18} /> {questionExplored ? 'Mark question ongoing' : 'Mark question explored'}</button>}{article.sourceFile && <div className="research-source-note"><Icon name="scroll" size={17} /><p><strong>Source-linked draft</strong><span>{article.sourceFile}</span></p></div>}<div className="detail-safety"><Icon name="lock" size={17} /><p><strong>Private by design</strong><span>Your saved items stay on this device in the prototype.</span></p></div></aside></div></div>;
}

function RelatedReading({ article, articles, onOpenArticle }) {
  return <section className="related-reading" aria-labelledby="related-reading-heading"><div className="related-reading-heading"><div><p className="eyebrow">{article.isQuestion ? 'Contextual follow-up' : 'Continue your study'}</p><h2 id="related-reading-heading">Take the next question with you.</h2><p>These local recommendations share Scripture, topic, or source context with what you just read.</p></div><Icon name="arrow" size={19} /></div>{article.isQuestion && <div className="related-reading-prompt"><span><Icon name="dialogue" size={19} /></span><div><p className="eyebrow">A question to carry</p><p>{contextualFollowUpFor(article)}</p></div></div>}<div className="related-reading-grid">{articles.map((item) => <button className="related-reading-card" type="button" key={item.id} onClick={() => onOpenArticle?.(item)}><span className={`related-reading-icon tone-${item.tone || 'blue'}`}><Icon name={item.icon || 'learn'} size={18} /></span><span><strong>{item.title}</strong><small>{item.category} · {item.readTime}</small></span><Icon name="arrow" size={14} /></button>)}</div></section>;
}

function LocalReadAloud({ title = 'Listen to this study', text = '' }) {
  const [status, setStatus] = useState('idle');
  const [languageId, setLanguageId] = useState(() => readReaderPreferences().translation);
  const [translationPending, setTranslationPending] = useState(false);
  const [nativeSpeechAvailable, setNativeSpeechAvailable] = useState(false);
  const [nativeSpeechChecked, setNativeSpeechChecked] = useState(false);
  const utteranceRef = useRef(null);
  const nativeUtteranceIdRef = useRef('');
  const sequenceRef = useRef(0);
  const speechSupported = typeof window !== 'undefined'
    && typeof window.speechSynthesis?.speak === 'function'
    && typeof window.SpeechSynthesisUtterance === 'function';
  const isAndroid = Capacitor.getPlatform() === 'android';
  const useNativeSpeech = isAndroid && !speechSupported && nativeSpeechAvailable;

  if (!nativeUtteranceIdRef.current) nativeUtteranceIdRef.current = `fdl-${Math.random().toString(36).slice(2)}`;

  useEffect(() => {
    function handleLanguageChange(event) {
      const nextLanguageId = event.detail || LANGUAGE_OPTIONS.find((option) => option.locale.toLowerCase() === document.documentElement.lang.toLowerCase())?.id || 'en';
      setLanguageId(getLanguageOption(nextLanguageId).id);
    }
    window.addEventListener('fdl-language-change', handleLanguageChange);
    return () => window.removeEventListener('fdl-language-change', handleLanguageChange);
  }, []);

  useEffect(() => {
    let active = true;
    if (speechSupported || !isAndroid) {
      setNativeSpeechChecked(true);
      return undefined;
    }

    setNativeSpeechChecked(false);
    let listenerHandle;
    LocalTextToSpeech.isAvailable()
      .then((result) => {
        if (!active) return;
        setNativeSpeechAvailable(Boolean(result?.available));
        setNativeSpeechChecked(true);
      })
      .catch(() => {
        if (!active) return;
        setNativeSpeechAvailable(false);
        setNativeSpeechChecked(true);
      });
    LocalTextToSpeech.addListener('speechState', (event) => {
      if (!active || event?.utteranceId !== nativeUtteranceIdRef.current) return;
      if (event.state === 'playing') setStatus('playing');
      if (event.state === 'complete') setStatus('complete');
      if (event.state === 'error') setStatus('error');
      if (event.state === 'idle') setStatus('idle');
    }).then((handle) => {
      if (!active) handle.remove();
      else listenerHandle = handle;
    }).catch(() => undefined);

    return () => {
      active = false;
      listenerHandle?.remove();
    };
  }, [isAndroid, speechSupported]);

  useEffect(() => {
    sequenceRef.current += 1;
    if (speechSupported) window.speechSynthesis.cancel();
    if (useNativeSpeech) LocalTextToSpeech.stop().catch(() => undefined);
    utteranceRef.current = null;
    setTranslationPending(false);
    setStatus('idle');
    return () => {
      sequenceRef.current += 1;
      if (speechSupported) window.speechSynthesis.cancel();
      if (useNativeSpeech) LocalTextToSpeech.stop().catch(() => undefined);
      utteranceRef.current = null;
    };
  }, [languageId, speechSupported, text, useNativeSpeech]);

  function stopSpeech() {
    sequenceRef.current += 1;
    if (speechSupported) window.speechSynthesis.cancel();
    if (useNativeSpeech) LocalTextToSpeech.stop().catch(() => undefined);
    utteranceRef.current = null;
    setTranslationPending(false);
    setStatus('idle');
  }

  async function startSpeech() {
    const cleanText = String(text || '').trim();
    if ((!speechSupported && !useNativeSpeech) || !cleanText) {
      setStatus('error');
      return;
    }
    sequenceRef.current += 1;
    const sequence = sequenceRef.current;
    const selectedLanguage = getLanguageOption(languageId);
    let spokenText = cleanText;
    if (languageId !== 'en') {
      setTranslationPending(true);
      setStatus('translating');
      try {
        spokenText = getCachedAutomaticTranslation(cleanText, languageId)
          || await requestAutomaticTranslation(cleanText, languageId)
          || cleanText;
      } catch {
        spokenText = cleanText;
      }
      if (sequence !== sequenceRef.current) return;
      setTranslationPending(false);
    }
    if (sequence !== sequenceRef.current) return;
    setStatus('playing');
    if (useNativeSpeech) {
      LocalTextToSpeech.speak({ text: spokenText, language: selectedLanguage.locale, utteranceId: nativeUtteranceIdRef.current }).catch(() => {
        if (sequence === sequenceRef.current) setStatus('error');
      });
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new window.SpeechSynthesisUtterance(spokenText);
    utterance.lang = selectedLanguage.locale;
    utterance.onstart = () => { if (sequence === sequenceRef.current) setStatus('playing'); };
    utterance.onend = () => { if (sequence === sequenceRef.current) { utteranceRef.current = null; setStatus('complete'); } };
    utterance.onerror = () => { if (sequence === sequenceRef.current) { utteranceRef.current = null; setStatus('error'); } };
    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }

  function pauseSpeech() {
    if (!speechSupported || useNativeSpeech || status !== 'playing') return;
    window.speechSynthesis.pause();
    setStatus('paused');
  }

  function resumeSpeech() {
    if (!speechSupported || useNativeSpeech || status !== 'paused') return;
    window.speechSynthesis.resume();
    setStatus('playing');
  }

  const speechAvailable = speechSupported || useNativeSpeech;
  const statusText = translationPending ? 'Preparing the selected language…' : status === 'playing' ? 'Speaking now' : status === 'paused' ? 'Paused' : status === 'complete' ? 'Finished' : status === 'error' ? 'Voice unavailable' : 'Ready to listen';
  if (isAndroid && !speechSupported && !nativeSpeechChecked) return <div className="local-read-aloud local-read-aloud-unavailable"><Icon name="headphones" size={18} /><div><strong>Checking the local Android voice…</strong><small>The app is checking the speech engine already installed on this device.</small></div></div>;
  if (!speechAvailable) return <div className="local-read-aloud local-read-aloud-unavailable"><Icon name="info" size={18} /><div><strong>Local read-aloud is unavailable here.</strong><small>{isAndroid ? 'Android could not find a usable device speech engine. The study remains available to read offline.' : 'This device or browser does not expose a speech engine. The study remains available to read offline.'}</small></div></div>;

  const primaryAction = status === 'playing' ? (useNativeSpeech ? stopSpeech : pauseSpeech) : status === 'paused' ? resumeSpeech : startSpeech;
  const primaryIcon = status === 'playing' ? (useNativeSpeech ? 'stop' : 'pause') : status === 'paused' ? 'play' : 'headphones';
  const primaryLabel = status === 'playing' ? (useNativeSpeech ? 'Stop' : 'Pause') : status === 'paused' ? 'Resume' : status === 'complete' ? 'Listen again' : 'Listen';
  return <section className="local-read-aloud" aria-label={title}><div className="local-read-aloud-copy"><span className="local-read-aloud-icon"><Icon name="headphones" size={18} /></span><div><p className="eyebrow">Local read-aloud</p><strong>{title}</strong><small>{useNativeSpeech ? 'Uses Android Text-to-Speech already installed on this device.' : 'Uses the device voice. No audio file is downloaded.'}</small></div></div><div className="local-read-aloud-actions"><button className="primary-button" type="button" onClick={primaryAction} disabled={translationPending}><Icon name={primaryIcon} size={14} /> {translationPending ? 'Preparing…' : primaryLabel}</button><button className="local-read-aloud-stop" type="button" onClick={stopSpeech} disabled={status === 'idle'}><Icon name="stop" size={13} /> Stop</button></div><small className="local-read-aloud-status" role="status">{statusText}</small></section>;
}

function Prayer({ entries = [], onSaveEntry, onToggleEntry, onDeleteEntry, onOpenReference }) {
  const [selectedPrayerId, setSelectedPrayerId] = useState(guidedPrayers[0]?.id || null);
  const [journalDraft, setJournalDraft] = useState('');
  const [journalMessage, setJournalMessage] = useState('');
  const selectedPrayer = guidedPrayers.find((prayer) => prayer.id === selectedPrayerId) || guidedPrayers[0];

  function saveJournalEntry(event) {
    event.preventDefault();
    if (!onSaveEntry?.(journalDraft)) {
      setJournalMessage('Write a prayer or reflection before saving.');
      return;
    }
    setJournalDraft('');
    setJournalMessage('Saved privately on this device.');
    window.setTimeout(() => setJournalMessage(''), 2400);
  }

  function useGuidedPrayer() {
    if (!selectedPrayer) return;
    setJournalDraft(selectedPrayer.prayer);
    setJournalMessage('Guided prayer added to your journal draft.');
  }

  function formatEntryDate(value) {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? 'Saved locally' : date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  }

  return (
    <div className="prayer-page page-enter">
      <SectionIntro eyebrow="Pause · speak · listen" title="A quiet place to pray." description="Begin with your own words. Use a guided prayer, sit with Scripture, or write a private reflection." action={<span className="journey-count">{entries.length} journal {entries.length === 1 ? 'entry' : 'entries'}</span>} />
      <SectionArt art={sectionArt.prayer} />
      <section className="prayer-basics card-surface" aria-labelledby="prayer-basics-heading">
        <div className="prayer-basics-heading"><div><p className="eyebrow">Learn to pray</p><h2 id="prayer-basics-heading">Start with a simple conversation.</h2><p className="section-description">Christian prayer is communication with God, not a test of perfect words or religious performance. Begin honestly and let Scripture guide your next step.</p></div><span className="prayer-basics-icon"><Icon name="hands" size={22} /></span></div>
        <div className="prayer-basics-grid">{prayerBasics.map((step, index) => <article className="prayer-basic-step" key={step.id}><span>{String(index + 1).padStart(2, '0')}</span><div><h3>{step.title}</h3><p>{step.text}</p><button className="text-button" type="button" onClick={() => onOpenReference?.(step.reference)}>{step.reference} <Icon name="arrow" size={13} /></button></div></article>)}</div>
      </section>
      <div className="prayer-layout">
        <section className="guided-prayer-panel card-surface" aria-labelledby="guided-prayers-heading">
          <div className="section-label-row"><div><p className="eyebrow">Guided prayers</p><h2 id="guided-prayers-heading">Start where you are</h2><p className="section-description">There is no required formula. These short prayers are invitations, not tests.</p></div><span className="library-total"><Icon name="hands" size={16} /> {guidedPrayers.length} prompts</span></div>
          <div className="guided-prayer-grid">{guidedPrayers.map((prayer) => <button className={`guided-prayer-card ${selectedPrayerId === prayer.id ? 'selected' : ''}`} type="button" key={prayer.id} onClick={() => setSelectedPrayerId(prayer.id)} aria-pressed={selectedPrayerId === prayer.id}><span className={`guided-prayer-icon tone-${prayer.tone}`}><Icon name={prayer.icon} size={20} /></span><span className="guided-prayer-copy"><strong>{prayer.title}</strong><small>{prayer.description}</small></span><Icon name="chevron" size={15} /></button>)}</div>
        </section>
        <aside className="prayer-aside">
          {selectedPrayer && <section className="selected-prayer-card"><div className="selected-prayer-heading"><div><p className="eyebrow">Selected prayer</p><h2>{selectedPrayer.title}</h2></div><span className={`guided-prayer-icon tone-${selectedPrayer.tone}`}><Icon name={selectedPrayer.icon} size={20} /></span></div><p className="selected-prayer-text">{selectedPrayer.prayer}</p><span className="selected-prayer-reference">{selectedPrayer.reference}</span><LocalReadAloud title="Listen to this prayer" text={selectedPrayer.prayer} /><button className="primary-button" type="button" onClick={useGuidedPrayer}>Use in journal <Icon name="arrow" size={16} /></button></section>}
          <section className="prayer-journal-card card-surface" aria-labelledby="prayer-journal-heading"><div className="section-label-row"><div><p className="eyebrow">Private journal</p><h2 id="prayer-journal-heading">Write it down</h2></div><Icon name="bookmark" size={19} /></div><p className="prayer-journal-description">Your entries stay in this app on this device. They are included in the local delete/reset control.</p><form className="prayer-journal-form" onSubmit={saveJournalEntry}><label htmlFor="prayer-entry">Prayer or reflection</label><textarea id="prayer-entry" value={journalDraft} onChange={(event) => setJournalDraft(event.target.value)} placeholder="Write what is on your heart..." rows={5} maxLength={2000} /><div className="prayer-journal-actions"><span>{journalDraft.length}/2000</span><button className="primary-button" type="submit">Save privately <Icon name="check" size={15} /></button></div>{journalMessage && <p className="prayer-journal-message" role="status">{journalMessage}</p>}</form>{entries.length > 0 ? <div className="prayer-entry-list">{entries.map((entry) => <article className={`prayer-entry ${entry.status === 'answered' ? 'answered' : ''}`} key={entry.id}><div className="prayer-entry-heading"><span>{formatEntryDate(entry.createdAt)}</span><div><button type="button" onClick={() => onToggleEntry?.(entry.id)} aria-label={`${entry.status === 'answered' ? 'Mark' : 'Mark'} prayer ${entry.status === 'answered' ? 'ongoing' : 'answered'}`}>{entry.status === 'answered' ? 'Answered' : 'Ongoing'}</button><button className="prayer-entry-delete" type="button" onClick={() => onDeleteEntry?.(entry.id)} aria-label="Delete prayer journal entry"><Icon name="close" size={14} /></button></div></div><p data-private-content="true">{entry.text}</p></article>)}</div> : <div className="prayer-entry-empty"><Icon name="bookmark" size={18} /><span>Your saved prayers will appear here.</span></div>}</section>
        </aside>
      </div>
    </div>
  );
}

function Faith({ progress = {}, selectedDayId: initialSelectedDayId = null, onSelectDay, onStart, onToggleDay, onSaveTestimony, onNavigate, onOpenReference, onOpenArticle }) {
  const [selectedDayId, setSelectedDayId] = useState(() => initialSelectedDayId || newBelieverDays[0]?.id || null);
  const completedDays = Array.isArray(progress.completedDays) ? progress.completedDays : [];
  const selectedDay = newBelieverDays.find((day) => day.id === selectedDayId) || newBelieverDays[0];
  const nextDay = newBelieverDays.find((day) => !completedDays.includes(day.id)) || newBelieverDays[0];
  const discipleshipGuide = selectedDay?.id === 17
    ? allArticles.find((article) => article.id === 'what-is-the-church')
    : selectedDay?.id === 18
      ? allArticles.find((article) => article.id === 'what-is-baptism')
      : null;
  const completionPercent = Math.round((completedDays.length / newBelieverDays.length) * 100);

  useEffect(() => {
    if (!newBelieverDays.some((day) => day.id === selectedDayId)) setSelectedDayId(newBelieverDays[0]?.id || null);
  }, [selectedDayId]);

  useEffect(() => {
    if (initialSelectedDayId && newBelieverDays.some((day) => day.id === initialSelectedDayId) && initialSelectedDayId !== selectedDayId) setSelectedDayId(initialSelectedDayId);
  }, [initialSelectedDayId, selectedDayId]);

  function selectDay(dayId) {
    if (!newBelieverDays.some((day) => day.id === dayId)) return;
    setSelectedDayId(dayId);
    onSelectDay?.(dayId);
  }

  function markSelectedDay() {
    if (!selectedDay) return;
    if (!progress.started) onStart?.();
    onToggleDay?.(selectedDay.id);
  }

  return <div className="faith-page page-enter">
    <SectionIntro eyebrow="A new beginning" title="I believe in Jesus — what now?" description="A gentle first step for learning to follow Jesus. Take one day at a time, keep your progress private, and skip anything you are not ready for." action={<span className="journey-count">{completedDays.length} of {newBelieverDays.length} days</span>} />
    <SectionArt art={sectionArt.faith} />
    <section className="faith-welcome card-surface" aria-labelledby="faith-welcome-heading">
      <div className="faith-welcome-copy"><p className="eyebrow">First 30 days with Jesus</p><h2 id="faith-welcome-heading">There is no deadline for growing.</h2><p>{progress.started ? 'Your private path has begun. Return whenever you are ready and mark a day after you have had time to reflect.' : 'If you are beginning to trust Jesus, this private month-long path can help you build a foundation in grace, prayer, Scripture, community, and daily life.'}</p></div>
      <div className="faith-welcome-action"><div className="faith-progress-number"><strong>{completionPercent}%</strong><span>complete</span></div><button className="primary-button" type="button" onClick={() => { if (!progress.started) onStart?.(); selectDay(nextDay?.id); onNavigate?.('faith'); }}>{progress.started ? `Continue with Day ${nextDay?.id || 1}` : 'Begin privately'} <Icon name="arrow" size={16} /></button></div>
    </section>
    <div className="faith-layout">
      <section className="starter-path card-surface" aria-labelledby="starter-path-heading"><div className="section-label-row"><div><p className="eyebrow">A simple rhythm</p><h2 id="starter-path-heading">Your first 30 days</h2><p className="section-description">Read the passage, sit with the question, pray honestly, and mark the day when you are ready. Move at a safe, sustainable pace.</p></div><span className="library-total"><Icon name="heart" size={16} /> {newBelieverDays.length} days</span></div><div className="starter-day-list">{newBelieverDays.map((day) => { const complete = completedDays.includes(day.id); return <button className={`starter-day ${selectedDay?.id === day.id ? 'selected' : ''} ${complete ? 'complete' : ''}`} type="button" key={day.id} onClick={() => selectDay(day.id)} aria-pressed={selectedDay?.id === day.id}><span className={`starter-day-number tone-${day.tone}`}>{complete ? <Icon name="check" size={15} /> : day.id}</span><span className="starter-day-copy"><small>Day {day.id}</small><strong>{day.title}</strong><span>{day.summary}</span></span><Icon name="chevron" size={16} /></button>; })}</div></section>
      <aside className="faith-detail-column">
        {selectedDay && <section className="faith-day-detail"><div className="faith-day-heading"><div><p className="eyebrow">Day {selectedDay.id}</p><h2>{selectedDay.title}</h2></div><span className={`faith-day-icon tone-${selectedDay.tone}`}><Icon name={selectedDay.icon} size={22} /></span></div><p className="faith-day-summary">{selectedDay.summary}</p><LocalReadAloud title="Listen to this day" text={[selectedDay.title, selectedDay.summary, selectedDay.reflection, selectedDay.prayer].filter(Boolean).join('\n\n')} /><div className="faith-reading"><p className="eyebrow">Read in the Bible</p><div>{selectedDay.reading.map((reference) => <button type="button" key={reference} onClick={() => onOpenReference?.(reference)}>{reference} <Icon name="arrow" size={14} /></button>)}</div></div><div className="faith-reflection"><p className="eyebrow">Reflect</p><p>{selectedDay.reflection}</p></div><div className="faith-day-prayer"><p className="eyebrow">Pray</p><p>{selectedDay.prayer}</p></div>{discipleshipGuide && <button className="text-button faith-guide-button" type="button" onClick={() => onOpenArticle?.(discipleshipGuide)}>Open the full teaching guide <Icon name="arrow" size={14} /></button>}<button className={`faith-complete-button ${completedDays.includes(selectedDay.id) ? 'complete' : ''}`} type="button" onClick={markSelectedDay}>{completedDays.includes(selectedDay.id) ? 'Mark as ongoing' : 'Mark day complete'} <Icon name={completedDays.includes(selectedDay.id) ? 'arrow' : 'check'} size={15} /></button></section>}
        <section className="faith-safety-card card-surface"><span className="faith-safety-icon"><Icon name="lock" size={18} /></span><div><p className="eyebrow">Private progress</p><p>Days completed are stored only on this device. You can clear them from Privacy & settings at any time.</p></div></section>
      </aside>
    </div>
    <section className="faith-next-steps card-surface" aria-labelledby="faith-next-steps-heading">
      <div className="section-label-row"><div><p className="eyebrow">When you are ready</p><h2 id="faith-next-steps-heading">Important next steps deserve time.</h2><p className="section-description">These lessons are invitations, not requirements. Open one when it matches your questions, and take the safest honest pace for your circumstances.</p></div><Icon name="compass" size={20} /></div>
      <div className="faith-next-step-grid">{[17, 18, 22].map((dayId) => { const day = newBelieverDays.find((item) => item.id === dayId); return day ? <button className="faith-next-step" type="button" key={day.id} onClick={() => setSelectedDayId(day.id)}><span className={`faith-next-step-icon tone-${day.tone}`}><Icon name={day.icon} size={19} /></span><span><small>Day {day.id}</small><strong>{day.title}</strong><em>{day.summary}</em></span><Icon name="arrow" size={15} /></button> : null; })}</div>
    </section>
    <TestimonyBuilder testimony={progress.testimony} onSave={onSaveTestimony} />
  </div>;
}

function TestimonyBuilder({ testimony = {}, onSave }) {
  const [draft, setDraft] = useState(() => ({
    questions: testimony.questions || '',
    learned: testimony.learned || '',
    hope: testimony.hope || '',
  }));
  const [message, setMessage] = useState('');

  useEffect(() => {
    setDraft({ questions: testimony.questions || '', learned: testimony.learned || '', hope: testimony.hope || '' });
  }, [testimony]);

  function updateDraft(key, value) {
    setDraft((current) => ({ ...current, [key]: value }));
    setMessage('');
  }

  function saveDraft(event) {
    event.preventDefault();
    const hasContent = Object.values(draft).some((value) => value.trim());
    if (!hasContent) {
      setMessage('Write something first, or leave this private page for another day.');
      return;
    }
    onSave?.(draft);
    setMessage('Saved privately on this device.');
  }

  function clearDraft() {
    const emptyDraft = { questions: '', learned: '', hope: '' };
    setDraft(emptyDraft);
    onSave?.(emptyDraft);
    setMessage('Your private story draft was cleared.');
  }

  return <section className="testimony-builder card-surface" aria-labelledby="testimony-builder-heading">
    <div className="testimony-heading"><div><p className="eyebrow">Your story of grace</p><h2 id="testimony-builder-heading">Put your next step into words.</h2><p className="section-description">You do not need a polished testimony or a public decision. Use these prompts to remember what you are asking, what you are learning about Jesus, and where you hope to go next.</p></div><span className="testimony-icon"><Icon name="dialogue" size={22} /></span></div>
    <form className="testimony-form" onSubmit={saveDraft}>
      <label className="testimony-field"><span>What brought me here</span><textarea value={draft.questions} onChange={(event) => updateDraft('questions', event.target.value)} placeholder="Questions, experiences, or hopes that started this search…" rows={4} maxLength={1200} /></label>
      <label className="testimony-field"><span>What I am learning about Jesus</span><textarea value={draft.learned} onChange={(event) => updateDraft('learned', event.target.value)} placeholder="A passage, truth, or part of Jesus’ character that is staying with me…" rows={4} maxLength={1200} /></label>
      <label className="testimony-field"><span>My next honest step</span><textarea value={draft.hope} onChange={(event) => updateDraft('hope', event.target.value)} placeholder="A prayer, Scripture reading, safe conversation, or question I want to carry forward…" rows={4} maxLength={1200} /></label>
      <div className="testimony-actions"><span>{testimony.updatedAt ? `Last saved ${new Date(testimony.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}` : 'Private draft · never shared automatically'}</span><div><button className="text-button subtle" type="button" onClick={clearDraft} disabled={!Object.values(draft).some((value) => value.trim()) && !testimony.updatedAt}>Clear</button><button className="primary-button" type="submit">Save privately <Icon name="check" size={15} /></button></div></div>
      {message && <p className="testimony-message" role="status">{message}</p>}
    </form>
  </section>;
}

function Journey({ completedLessons, toggleLesson, bookmarks = [], toggleBookmark, reflections = {}, onSaveReflection, onNavigate, onOpenReference, initialLessonId = null }) {
  const [selectedLessonId, setSelectedLessonId] = useState(() => initialLessonId || lessons.find((lesson) => !completedLessons.includes(lesson.id) && (lesson.id === 1 || completedLessons.includes(lesson.id - 1)))?.id || lessons[0]?.id);
  const [reflectionDraft, setReflectionDraft] = useState('');
  const [reflectionMessage, setReflectionMessage] = useState('');
  const progress = Math.round((completedLessons.length / lessons.length) * 100);
  const isAvailable = (lesson) => completedLessons.includes(lesson.id) || lesson.id === 1 || completedLessons.includes(lesson.id - 1);
  const nextLesson = lessons.find((lesson) => !completedLessons.includes(lesson.id) && isAvailable(lesson)) || lessons[lessons.length - 1];
  const selectedLesson = lessons.find((lesson) => lesson.id === selectedLessonId) || nextLesson;
  const selectedLessonSaved = Boolean(selectedLesson && bookmarks.includes(`lesson-${selectedLesson.id}`));

  useEffect(() => {
    if (initialLessonId && lessons.some((lesson) => lesson.id === initialLessonId)) setSelectedLessonId(initialLessonId);
  }, [initialLessonId]);

  useEffect(() => {
    setReflectionDraft(selectedLesson ? reflections[selectedLesson.id]?.text || '' : '');
    setReflectionMessage('');
  }, [selectedLesson?.id, reflections]);

  useEffect(() => {
    if (!selectedLesson || !isAvailable(selectedLesson)) setSelectedLessonId(nextLesson?.id || lessons[0]?.id);
  }, [completedLessons, nextLesson, selectedLesson]);

  function markSelectedLesson() {
    if (!selectedLesson || !isAvailable(selectedLesson)) return;
    toggleLesson(selectedLesson.id);
  }

  function submitReflection(event) {
    event.preventDefault();
    if (!selectedLesson) return;
    const cleanText = reflectionDraft.trim();
    onSaveReflection?.(selectedLesson.id, cleanText);
    setReflectionMessage(cleanText ? 'Reflection saved privately.' : 'Reflection cleared.');
  }

  return <div className="journey-page page-enter"><SectionIntro eyebrow="Your journey" title="Steps toward the light." description="A guided path from curiosity to faith, at your own pace." action={<span className="journey-count">{completedLessons.length} of {lessons.length}</span>} /><SectionArt art={sectionArt.journey} /><div className="journey-layout"><section className="journey-card card-surface"><div className="journey-progress-head"><span>Journey progress</span><strong>{progress}%</strong></div><div className="progress-track large"><span style={{ width: `${Math.max(progress, 14)}%` }} /></div><div className="journey-list">{lessons.map((lesson) => <JourneyStep key={lesson.id} lesson={lesson} complete={completedLessons.includes(lesson.id)} available={isAvailable(lesson)} selected={selectedLesson?.id === lesson.id} onSelect={() => setSelectedLessonId(lesson.id)} onToggle={() => toggleLesson(lesson.id)} />)}</div></section><aside className="journey-aside">{selectedLesson && <section className="journey-detail card-surface" aria-labelledby="journey-detail-heading"><div className="journey-detail-heading"><div><p className="eyebrow">Lesson {selectedLesson.id}</p><h2 id="journey-detail-heading">{selectedLesson.title}</h2></div><span className={`journey-detail-icon tone-${selectedLesson.tone}`}><Icon name={selectedLesson.icon} size={21} /></span></div><p className="journey-detail-summary">{selectedLesson.summary}</p><LocalReadAloud title="Listen to this lesson" text={[selectedLesson.title, selectedLesson.summary, ...(selectedLesson.body || []), selectedLesson.reflection, selectedLesson.prayer].filter(Boolean).join('\n\n')} /><div className="journey-reading"><p className="eyebrow">Read in the Bible</p><div>{selectedLesson.reading.map((reference) => <button type="button" key={reference} onClick={() => onOpenReference?.(reference)}>{reference} <Icon name="arrow" size={14} /></button>)}</div></div><div className="journey-detail-body">{selectedLesson.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div><div className="journey-reflection"><p className="eyebrow">Reflect</p><p>{selectedLesson.reflection}</p></div><form className="journey-reflection-form" onSubmit={submitReflection}><div className="journey-reflection-form-heading"><div><p className="eyebrow">Private response</p><label htmlFor={`journey-reflection-${selectedLesson.id}`}>Write what you are noticing</label></div><Icon name="dialogue" size={18} /></div><textarea id={`journey-reflection-${selectedLesson.id}`} value={reflectionDraft} onChange={(event) => setReflectionDraft(event.target.value)} placeholder="A sentence, question, or prayer to remember…" rows={4} maxLength={1600} /><div className="journey-reflection-form-actions"><span>{reflectionDraft.length}/1600 · stays on this device</span><div><button className="text-button subtle" type="button" onClick={() => { setReflectionDraft(''); onSaveReflection?.(selectedLesson.id, ''); setReflectionMessage('Reflection cleared.'); }} disabled={!reflectionDraft.trim() && !reflections[selectedLesson.id]}>Clear</button><button className="primary-button" type="submit">Save reflection <Icon name="check" size={14} /></button></div></div>{reflectionMessage && <p className="journey-reflection-message" role="status">{reflectionMessage}</p>}</form><div className="journey-detail-prayer"><p className="eyebrow">Pray</p><p>{selectedLesson.prayer}</p></div><div className="journey-detail-actions"><button className={`journey-complete-button ${completedLessons.includes(selectedLesson.id) ? 'complete' : ''}`} type="button" onClick={markSelectedLesson} disabled={!isAvailable(selectedLesson)}>{completedLessons.includes(selectedLesson.id) ? 'Mark lesson as ongoing' : 'Mark lesson complete'} <Icon name={completedLessons.includes(selectedLesson.id) ? 'arrow' : 'check'} size={15} /></button><button className={`journey-save-button ${selectedLessonSaved ? 'saved' : ''}`} type="button" onClick={() => toggleBookmark?.(`lesson-${selectedLesson.id}`)}><Icon name="bookmark" size={15} /> {selectedLessonSaved ? 'Saved locally' : 'Save lesson'}</button></div></section>}<div className="journey-quote"><span className="quote-mark">“</span><p>You are not asked to have every answer before you begin.</p><span className="quote-source">A gentle pace is still progress.</span></div><div className="next-step-card"><p className="eyebrow">Keep exploring</p><h3>Read the Gospel of John</h3><p>Open John 1 and notice what the text says about Jesus.</p><button className="primary-button" type="button" onClick={() => onOpenReference?.('John 1')}>Open John 1 <Icon name="arrow" size={16} /></button></div></aside></div></div>;
}

function JourneyStep({ lesson, complete, available, selected, onToggle, onSelect }) {
  const locked = !available;
  return <div className={`journey-step ${complete ? 'complete' : ''} ${selected ? 'selected' : ''} ${locked ? 'locked' : ''}`}><button className="step-marker" type="button" onClick={locked ? undefined : onToggle} disabled={locked} aria-label={`${complete ? 'Mark' : 'Complete'} ${lesson.title}`}>{complete ? <Icon name="check" size={16} /> : <Icon name={locked ? 'lock' : lesson.icon} size={16} />}</button><button className="step-select" type="button" onClick={onSelect} disabled={locked}><span className="step-copy"><strong>{lesson.title}</strong><span>{lesson.subtitle}</span></span></button>{locked ? <span className="step-locked">Soon</span> : <button className="step-action" type="button" onClick={onSelect}>{selected ? 'Open' : complete ? 'Review' : 'Start'} <Icon name="arrow" size={14} /></button>}</div>;
}

function Saved({ verses: verseList, languageId = 'en', bookmarks, highlights = [], notes = {}, journeyReflections = {}, savedStudyPacks = [], toggleBookmark, toggleHighlight, saveNote, onOpenArticle, onOpenLesson, onOpenReference, onOpenStudyPack, onToggleStudyPack, navigate, savedFolders = [], savedFolderAssignments = {}, onCreateFolder, onDeleteFolder, onAssignFolder }) {
  const [savedVerses, setSavedVerses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [savedView, setSavedView] = useState('all');
  const [selectedFolderId, setSelectedFolderId] = useState('all');
  const [newFolderName, setNewFolderName] = useState('');
  const [folderMessage, setFolderMessage] = useState('');
  const savedVerseIds = useMemo(() => [...new Set([...bookmarks, ...highlights, ...Object.keys(notes || {})].filter((id) => String(id).startsWith('verse-')))], [bookmarks, highlights, notes]);
  const savedArticles = [...new Map([
    ...allArticles.filter((article) => bookmarks.includes(`article-${article.id}`)).map((article) => [article.id, { ...article, savedItemId: `article-${article.id}` }]),
    ...lessons.filter((lesson) => bookmarks.includes(`lesson-${lesson.id}`)).map((lesson) => [`lesson-${lesson.id}`, { id: `journey-lesson-${lesson.id}`, savedItemId: `lesson-${lesson.id}`, category: 'Journey', title: lesson.title, summary: lesson.summary, icon: lesson.icon, tone: lesson.tone, readTime: 'Guided lesson', body: lesson.body, references: lesson.reading, sourceLesson: lesson }]),
  ]).values()];
  const savedPackEntries = studyPacks.filter((pack) => savedStudyPacks.includes(pack.id));
  const savedReflections = lessons.filter((lesson) => journeyReflections[lesson.id]?.text?.trim()).map((lesson) => ({
    lesson,
    itemId: `reflection-${lesson.id}`,
    reflection: journeyReflections[lesson.id],
  }));
  const fallbackVerses = verseList.filter((verse) => savedVerseIds.includes(stableVerseId(verse)));
  const visibleVerses = savedVerses.length > 0 ? savedVerses : fallbackVerses;
  const folderMatches = (itemId) => selectedFolderId === 'all' || savedFolderAssignments[itemId] === selectedFolderId;
  const folderSavedArticles = savedArticles.filter((article) => folderMatches(article.savedItemId || `article-${article.id}`));
  const folderSavedPacks = savedPackEntries.filter((pack) => folderMatches(`study-pack-${pack.id}`));
  const folderSavedReflections = savedReflections.filter((entry) => folderMatches(entry.itemId));
  const folderSavedVerseIds = savedVerseIds.filter((id) => folderMatches(id));
  const activeSavedItemIds = useMemo(() => new Set([...savedArticles.map((article) => article.savedItemId || `article-${article.id}`), ...savedPackEntries.map((pack) => `study-pack-${pack.id}`), ...savedReflections.map((entry) => entry.itemId), ...savedVerseIds]), [savedArticles, savedPackEntries, savedReflections, savedVerseIds]);
  const folderCounts = useMemo(() => Object.fromEntries(savedFolders.map((folder) => [folder.id, Object.entries(savedFolderAssignments).filter(([itemId, folderId]) => folderId === folder.id && activeSavedItemIds.has(itemId)).length])), [activeSavedItemIds, savedFolderAssignments, savedFolders]);
  const passageCounts = {
    bookmarks: folderSavedVerseIds.filter((id) => bookmarks.includes(id)).length,
    highlights: folderSavedVerseIds.filter((id) => highlights.includes(id)).length,
    notes: folderSavedVerseIds.filter((id) => Boolean(String(notes[id] || '').trim())).length,
  };
  const savedViewOptions = [
    { id: 'all', label: 'All', count: folderSavedArticles.length + folderSavedPacks.length + folderSavedReflections.length + folderSavedVerseIds.length },
    { id: 'articles', label: 'Articles, packs & reflections', count: folderSavedArticles.length + folderSavedPacks.length + folderSavedReflections.length },
    { id: 'bookmarks', label: 'Bookmarks', count: passageCounts.bookmarks },
    { id: 'highlights', label: 'Highlights', count: passageCounts.highlights },
    { id: 'notes', label: 'Notes', count: passageCounts.notes },
  ];
  const showArticles = savedView === 'all' || savedView === 'articles';
  const showStudyPacks = savedView === 'all' || savedView === 'articles';
  const showReflections = savedView === 'all' || savedView === 'articles';
  const showPassages = savedView !== 'articles';
  const filteredVerses = visibleVerses.filter((verse) => {
    const id = stableVerseId(verse);
    if (!folderMatches(id)) return false;
    if (savedView === 'bookmarks') return bookmarks.includes(id);
    if (savedView === 'highlights') return highlights.includes(id);
    if (savedView === 'notes') return Boolean(String(notes[id] || '').trim());
    return true;
  });
  const hasVisibleContent = (showArticles && folderSavedArticles.length > 0) || (showStudyPacks && folderSavedPacks.length > 0) || (showReflections && folderSavedReflections.length > 0) || (showPassages && filteredVerses.length > 0);
  const selectedViewLabel = savedViewOptions.find((option) => option.id === savedView)?.label || 'saved items';
  const selectedFolder = savedFolders.find((folder) => folder.id === selectedFolderId) || null;

  useEffect(() => {
    if (selectedFolderId !== 'all' && !selectedFolder) setSelectedFolderId('all');
  }, [selectedFolder, selectedFolderId]);

  useEffect(() => {
    let active = true;
    if (savedVerseIds.length === 0) {
      setSavedVerses([]);
      setLoading(false);
      return undefined;
    }
    setLoading(true);
    loadSavedBibleVerses(savedVerseIds).then((verses) => {
      if (active) setSavedVerses(verses);
    }).catch(() => {
      if (active) setSavedVerses([]);
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, [savedVerseIds]);

  function openVerse(verse) {
    if (onOpenReference) onOpenReference(verse.reference);
    else navigate('bible');
  }

  function submitFolder(event) {
    event.preventDefault();
    const createdId = onCreateFolder?.(newFolderName);
    if (!createdId) {
      setFolderMessage('Enter a folder name first.');
      return;
    }
    setNewFolderName('');
    setSelectedFolderId(createdId);
    setFolderMessage('Folder created privately.');
  }

  return <div className="saved-page page-enter">
    <SectionIntro eyebrow="Your library" title="Saved for later." description="Your bookmarks, highlights, and notes stay on this device in the prototype." />
    <SectionArt art={sectionArt.saved} />
    <div className="saved-summary">
      <div><span className="summary-number">{folderSavedArticles.length + folderSavedPacks.length + folderSavedReflections.length + folderSavedVerseIds.length}</span><span data-private-content={selectedFolder?.id?.startsWith('custom-') ? 'true' : undefined}>{selectedFolder ? selectedFolder.label : 'saved items'}</span></div>
      <div><span className="summary-number">{folderSavedArticles.length + folderSavedPacks.length + folderSavedReflections.length}</span><span>learning items</span></div>
      <div><span className="summary-number">{folderSavedVerseIds.length}</span><span>passages</span></div>
    </div>
    <SavedFolderShelf folders={savedFolders} counts={folderCounts} selectedFolderId={selectedFolderId} onSelectFolder={setSelectedFolderId} newFolderName={newFolderName} onChangeFolderName={setNewFolderName} onSubmit={submitFolder} onDeleteFolder={onDeleteFolder} message={folderMessage} />
    <div className="saved-view-tabs" role="tablist" aria-label="Saved views">
      {savedViewOptions.map((option) => <button className={`saved-view-tab ${savedView === option.id ? 'active' : ''}`} key={option.id} type="button" role="tab" aria-selected={savedView === option.id} onClick={() => setSavedView(option.id)}>{option.label}<span>{option.count}</span></button>)}
    </div>
    {showStudyPacks && folderSavedPacks.length > 0 && <section className="saved-section saved-study-packs-section">
      <div className="section-label-row"><div><p className="eyebrow">Saved study packs</p><h2>Practical guides to return to</h2></div><span className="saved-section-status">{folderSavedPacks.length} saved</span></div>
      <div className="saved-study-pack-grid">{folderSavedPacks.map((pack) => { const itemId = `study-pack-${pack.id}`; return <article className="saved-study-pack card-surface" key={pack.id}><div className="saved-study-pack-heading"><span className={`saved-study-pack-icon tone-${pack.tone}`}><Icon name={pack.icon} size={19} /></span><div><p className="card-category">{pack.readTime}</p><h3>{pack.title}</h3></div></div><p>{pack.purpose}</p><div className="saved-study-pack-actions"><button className="primary-button" type="button" onClick={() => onOpenStudyPack?.(pack.id)}>Open pack <Icon name="arrow" size={14} /></button><button className="text-button" type="button" onClick={() => onToggleStudyPack?.(pack.id)}>Remove <Icon name="close" size={13} /></button></div><SavedFolderSelect itemId={itemId} folders={savedFolders} assignments={savedFolderAssignments} onAssign={onAssignFolder} label={`Folder for ${pack.title}`} /></article>; })}</div>
    </section>}
    {showArticles && folderSavedArticles.length > 0 && <section className="saved-section">
      <div className="section-label-row"><div><p className="eyebrow">Articles &amp; lessons</p><h2>Keep exploring</h2></div><span className="saved-section-status">{folderSavedArticles.length} saved</span></div>
      <div className="article-grid compact">{folderSavedArticles.map((article) => { const itemId = article.savedItemId || `article-${article.id}`; const openSavedItem = () => article.sourceLesson ? onOpenLesson?.(article.sourceLesson.id) : onOpenArticle?.(article); return <div className="saved-article-entry" key={itemId}><ArticleCard article={article} onOpen={openSavedItem} /><SavedFolderSelect itemId={itemId} folders={savedFolders} assignments={savedFolderAssignments} onAssign={onAssignFolder} label={`Folder for ${article.title}`} /></div>; })}</div>
    </section>}
    {showReflections && folderSavedReflections.length > 0 && <section className="saved-section">
      <div className="section-label-row"><div><p className="eyebrow">Journey reflections</p><h2>Thoughts to return to</h2></div><span className="saved-section-status">{folderSavedReflections.length} saved</span></div>
      <div className="saved-reflection-list">{folderSavedReflections.map(({ lesson, itemId, reflection }) => <article className="saved-reflection" key={itemId}><div className="saved-reflection-heading"><div><span>Lesson {lesson.id}</span><h3>{lesson.title}</h3></div><button className="text-button" type="button" onClick={() => onOpenLesson?.(lesson.id)}>Open lesson <Icon name="arrow" size={13} /></button></div><p data-private-content="true">{reflection.text}</p><div className="saved-reflection-footer"><span>{reflection.updatedAt ? `Updated ${new Date(reflection.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}` : 'Saved privately'}</span><SavedFolderSelect itemId={itemId} folders={savedFolders} assignments={savedFolderAssignments} onAssign={onAssignFolder} label={`Folder for reflection on ${lesson.title}`} /></div></article>)}</div>
    </section>}
    {showPassages && filteredVerses.length > 0 && <section className="saved-section">
      <div className="section-label-row"><div><p className="eyebrow">Bible passages</p><h2>Words to return to</h2></div><span className="saved-section-status">{loading ? 'Loading local passages…' : `${filteredVerses.length} shown`}</span></div>
      <div className="saved-verse-list">{filteredVerses.map((verse) => { const id = stableVerseId(verse); const isBookmarked = bookmarks.includes(id); const isHighlighted = highlights.includes(id); const note = notes[id]; const hasLocalVerseTranslation = Boolean(verse.translations?.[languageId]); const displayedVerseText = verse.translations?.[languageId] || verse.text; return <article className="saved-verse" key={id}><button className="saved-verse-open" type="button" onClick={() => openVerse(verse)}><span className="saved-verse-reference">{verse.reference}</span><p data-no-translate={hasLocalVerseTranslation ? 'true' : undefined}>{displayedVerseText}</p>{note && <small className="saved-verse-note" data-private-content="true"><Icon name="dialogue" size={12} /> {note}</small>}</button><div className="saved-verse-status" aria-label="Saved passage details">{isBookmarked && <span title="Bookmarked"><Icon name="bookmark" size={13} /></span>}{isHighlighted && <button className="saved-verse-status-button" type="button" onClick={() => toggleHighlight?.(id)} title="Remove highlight" aria-label={`Remove highlight from ${verse.reference}`}><Icon name="sun" size={13} /></button>}{note && <button className="saved-verse-status-button" type="button" onClick={() => saveNote?.(id, '')} title="Remove private note" aria-label={`Remove private note from ${verse.reference}`}><Icon name="dialogue" size={13} /></button>}</div>{isBookmarked && <button className="saved-verse-remove" type="button" onClick={() => toggleBookmark(id)} aria-label={`Remove bookmark from ${verse.reference}`}><Icon name="close" size={15} /></button>}<SavedFolderSelect itemId={id} folders={savedFolders} assignments={savedFolderAssignments} onAssign={onAssignFolder} label={`Folder for ${verse.reference}`} /></article>; })}</div>
    </section>}
    {!hasVisibleContent && <section className="saved-section"><EmptyState icon={savedView === 'articles' ? 'book' : 'bookmark'} title={loading ? 'Loading saved passages…' : `No ${selectedViewLabel.toLowerCase()} yet`} text={savedView === 'all' ? 'Bookmark an article, highlight a verse, or add a private note and it will appear here.' : 'This view updates from your private on-device study state.'} action={<button className="text-button" type="button" onClick={() => navigate(savedView === 'articles' ? 'learn' : 'bible')}>{savedView === 'articles' ? 'Open Learn' : 'Open the Bible'} <Icon name="arrow" size={15} /></button>} /></section>}
  </div>;
}

function SavedFolderShelf({ folders = [], counts = {}, selectedFolderId = 'all', onSelectFolder, newFolderName, onChangeFolderName, onSubmit, onDeleteFolder, message }) {
  const iconForFolder = (folderId) => {
    if (folderId === 'family') return 'shield';
    if (folderId === 'questions') return 'dialogue';
    if (folderId === 'bible') return 'book';
    if (folderId === 'trinity') return 'learn';
    if (folderId === 'jesus') return 'sunrise';
    return 'bookmark';
  };

  return <section className="saved-folder-shelf card-surface" aria-labelledby="saved-folder-heading">
    <div className="saved-folder-heading"><div><p className="eyebrow">Private folders</p><h2 id="saved-folder-heading">Keep your questions close.</h2><p className="section-description">Group saved passages and articles by theme. Folders stay only on this device.</p></div><Icon name="bookmark" size={21} /></div>
    <div className="saved-folder-grid">
      <button className={`saved-folder-chip ${selectedFolderId === 'all' ? 'active' : ''}`} type="button" onClick={() => onSelectFolder?.('all')}><span className="saved-folder-chip-icon"><Icon name="database" size={15} /></span><span><strong>All saved</strong><small>Everything</small></span></button>
      {folders.map((folder) => <div className="saved-folder-chip-wrap" key={folder.id}><button className={`saved-folder-chip ${selectedFolderId === folder.id ? 'active' : ''}`} data-private-content={folder.id.startsWith('custom-') ? 'true' : undefined} type="button" onClick={() => onSelectFolder?.(folder.id)} title={folder.description}><span className="saved-folder-chip-icon"><Icon name={iconForFolder(folder.id)} size={15} /></span><span><strong>{folder.label}</strong><small>{counts[folder.id] || 0} item{counts[folder.id] === 1 ? '' : 's'}</small></span></button>{folder.id.startsWith('custom-') && <button className="saved-folder-delete" data-private-content="true" type="button" onClick={() => onDeleteFolder?.(folder.id)} aria-label={`Delete ${folder.label} folder`} title="Delete folder"><Icon name="close" size={13} /></button>}</div>)}
    </div>
    <form className="saved-folder-form" onSubmit={onSubmit}><label htmlFor="new-saved-folder"><span>New private folder</span><input id="new-saved-folder" value={newFolderName} onChange={(event) => onChangeFolderName?.(event.target.value)} maxLength={32} placeholder="e.g. Gospel conversations" /></label><button className="secondary-button" type="submit"><Icon name="check" size={15} /> Create folder</button></form>
    {message && <p className="saved-folder-message" role="status"><Icon name="check" size={13} /> {message}</p>}
  </section>;
}

function SavedFolderSelect({ itemId, folders = [], assignments = {}, onAssign, label }) {
  return <label className="saved-item-folder"><span className="sr-only">{label}</span><Icon name="bookmark" size={13} /><select aria-label={label} value={assignments[itemId] || ''} onChange={(event) => onAssign?.(itemId, event.target.value)}><option value="">No folder</option>{folders.map((folder) => <option key={folder.id} value={folder.id} data-private-content={folder.id.startsWith('custom-') ? 'true' : undefined}>{folder.label}</option>)}</select><Icon name="chevron" size={11} /></label>;
}

function EmptyState({ icon, title, text, action }) {
  return <div className="empty-state"><span><Icon name={icon} size={24} /></span><h3>{title}</h3><p>{text}</p>{action}</div>;
}

function LanguageSettings({ readerPreferences, updateReaderPreference }) {
  const selectedLanguage = getLanguageOption(readerPreferences?.translation);
  const copy = (key, fallback) => getLanguageCopy(selectedLanguage.id, key, fallback);
  const isAndroid = Capacitor.getPlatform() === 'android';

  function selectLanguage(languageId) {
    const nextLanguage = getLanguageOption(languageId);
    updateReaderPreference?.('translation', nextLanguage.id);
    if (isAndroid && typeof LocalTextToSpeech.setLanguage === 'function') {
      LocalTextToSpeech.setLanguage({ language: nextLanguage.locale }).catch(() => undefined);
    }
  }

  function openVoiceLanguages() {
    if (isAndroid && typeof LocalTextToSpeech.openTtsSettings === 'function') {
      LocalTextToSpeech.openTtsSettings().catch(() => undefined);
    }
  }

  return <div className="setting-row language-setting-row">
    <span className="setting-row-icon"><Icon name="globe" size={18} /></span>
    <span className="setting-row-copy"><strong>{copy('settings.language', 'Language')}</strong><small>{copy('settings.languageDescription', 'Choose the language for Scripture text and local read-aloud.')}</small><em>{copy('settings.languageNote', 'English is the main language. More reviewed language packs can be added as they become available.')}</em></span>
    <label className="language-setting-control"><span className="sr-only">{copy('settings.language', 'Language')}</span><select value={selectedLanguage.id} onChange={(event) => selectLanguage(event.target.value)}>{LANGUAGE_OPTIONS.map((option) => <option key={option.id} value={option.id}>{option.nativeLabel} · {option.label}</option>)}</select><Icon name="chevron" size={14} /></label>
    {isAndroid && <button className="text-button language-download-button" type="button" onClick={openVoiceLanguages}><Icon name="download" size={14} /> {copy('settings.downloadVoices', 'Manage Android voice languages')}</button>}
    <small className="language-setting-note">{copy('settings.downloadVoicesNote', 'Download or update voices from the Android speech engine. The app uses the system/default voice for the selected language.')}</small>
    <small className="language-setting-note">{copy('settings.translationPrivacy', 'Only public app text is sent for translation. Private notes, reflections, and typed searches stay on this device.')}</small>
  </div>;
}

function Settings({ discreetMode, setDiscreetMode, offlineMode = false, setOfflineMode, theme, setTheme, readerPreferences, updateReaderPreference, showPrivacyNotice, setShowPrivacyNotice, updateState, onCheckUpdates, onUpdateAction, contentDatabase, onOpenLibrary, privacyPinEnabled, biometricAvailable, biometricEnabled, onEnablePrivacyLock, onDisablePrivacyLock, onEnableBiometric, onDisableBiometric, onLockApp, onQuickClose, onDeletePrivateData, onShowOnboarding }) {
  const [showLegalInformation, setShowLegalInformation] = useState(false);
  const databaseValue = contentDatabase?.status === 'ready'
    ? `${contentDatabase.sourceAssetCount.toLocaleString()} sources · ${contentDatabase.bibleBookCount || 0} books · ${(contentDatabase.lexiconEntryCount || 0).toLocaleString()} terms`
    : contentDatabase?.status === 'loading' ? 'Loading locally' : 'Sample fallback';
  const databaseDescription = contentDatabase?.status === 'ready'
    ? `Versioned SQLite content database is available offline · ${(contentDatabase.bibleVerseStrongCount || 0).toLocaleString()} word links · ${(contentDatabase.originalLanguageAlignmentCount || 0).toLocaleString()} BHS/Greek alignments`
    : contentDatabase?.errorMessage || 'The bundled sample remains available';
  return (
    <div className="settings-page page-enter">
      <SectionIntro eyebrow={getLanguageCopy(readerPreferences?.translation, 'settings.eyebrow', 'Safe & private')} title={getLanguageCopy(readerPreferences?.translation, 'settings.title', 'Settings')} description={getLanguageCopy(readerPreferences?.translation, 'settings.description', 'You are in control of what this app remembers and reveals.')} />
      <SectionArt art={sectionArt.settings} />
      <div className="settings-layout">
        <section className="settings-main">
          <div className="discreet-card">
            <div className="discreet-icon"><Icon name="shield" size={28} /></div>
            <div className="setting-copy">
              <div className="setting-title-row"><h2>Discreet Mode</h2><Toggle label="Discreet Mode" checked={discreetMode} onChange={() => setDiscreetMode(!discreetMode)} /></div>
              <p>Reduces casual discovery by keeping the experience quiet on this device. On Android, it also requests screenshot and recent-task preview protection while enabled. Operating-system behavior can vary, and it cannot guarantee complete privacy.</p>
              <button className="text-button subtle" type="button" onClick={() => setShowPrivacyNotice(true)}>Understand the limits <Icon name="arrow" size={14} /></button>
            </div>
          </div>
          <div className="discreet-card offline-mode-card">
            <div className="discreet-icon"><Icon name="database" size={28} /></div>
            <div className="setting-copy">
              <div className="setting-title-row"><h2>Offline-only mode</h2><Toggle label="Offline-only mode" checked={offlineMode} onChange={() => setOfflineMode?.(!offlineMode)} /></div>
              <p>When enabled, the app pauses GitHub update checks and automatic online translation requests. Bundled Bible text, local content, and translations already cached on this device continue to work.</p>
              <small className="setting-boundary-note">Turn this off when you want to check for a new release or translate uncached public text.</small>
            </div>
          </div>
          <div className="settings-list">
            <LanguageSettings readerPreferences={readerPreferences} updateReaderPreference={updateReaderPreference} />
            <div className="setting-row">
              <span className="setting-row-icon"><Icon name={theme === 'light' ? 'sun' : 'moon'} size={18} /></span>
              <span className="setting-row-copy"><strong>{getLanguageCopy(readerPreferences?.translation, 'settings.appearance', 'App appearance')}</strong><small>{getLanguageCopy(readerPreferences?.translation, 'settings.appearanceDescription', 'Choose how the app feels at night')}</small></span>
              <div className="appearance-toggle"><button className={theme === 'light' ? 'selected' : ''} type="button" onClick={() => setTheme('light')}><Icon name="sun" size={15} /> Light</button><button className={theme === 'dark' ? 'selected' : ''} type="button" onClick={() => setTheme('dark')}><Icon name="moon" size={15} /> Dark</button></div>
            </div>
            <SettingRow icon="lock" title="Privacy & security" value="Local only" />
            <SettingRow icon="database" title="Offline content database" value={databaseValue} description={databaseDescription} />
            <SettingRow icon="bell" title="Notifications" value="None active" description="This build creates no notifications or notification-history entries." />
            <SettingRow icon="info" title="About, terms & credits" value={`v${APP_VERSION}`} description="Who made this app, how to use its content, and the current rights record" onClick={() => setShowLegalInformation(true)} />
          </div>
          <ContentAttributionCard contentDatabase={contentDatabase} onOpenLibrary={onOpenLibrary} />
          <section className="welcome-guide-card card-surface" aria-labelledby="welcome-guide-heading"><div className="welcome-guide-icon"><Icon name="compass" size={22} /></div><div><p className="eyebrow">Need a reset?</p><h2 id="welcome-guide-heading">Review the welcome guide</h2><p>Reopen the short introduction to the Bible, Journey, and privacy boundaries without changing your saved study state.</p><button className="text-button" type="button" onClick={onShowOnboarding}>Show welcome guide <Icon name="arrow" size={14} /></button></div></section>
          <UpdateSettings updateState={updateState} offlineMode={offlineMode} onCheckUpdates={onCheckUpdates} onUpdateAction={onUpdateAction} />
          <PrivacyLockSettings enabled={privacyPinEnabled} biometricAvailable={biometricAvailable} biometricEnabled={biometricEnabled} onEnable={onEnablePrivacyLock} onDisable={onDisablePrivacyLock} onEnableBiometric={onEnableBiometric} onDisableBiometric={onDisableBiometric} onLock={onLockApp} onQuickClose={onQuickClose} />
          <PrivateDataSettings onDelete={onDeletePrivateData} />
        </section>
        <aside className="settings-aside">
          <div className="not-alone-card"><div className="cross-circle"><Icon name="cross" size={36} /></div><p>You are not alone.<br />There is hope.</p><em>Jesus loves you.</em></div>
          <div className="prototype-note"><Icon name="info" size={17} /><p><strong>Prototype boundary</strong><span>Saved state uses local app storage. No account, sync, analytics, or remote content is connected. The Android app excludes private study state from cloud backup and device-to-device transfer.</span></p></div>
        </aside>
      </div>
      {showPrivacyNotice && <PrivacyNotice onClose={() => setShowPrivacyNotice(false)} />}
      {showLegalInformation && <LegalInformationModal onClose={() => setShowLegalInformation(false)} />}
    </div>
  );
}

function LegalExternalLink({ link }) {
  return <button className="legal-external-link" type="button" onClick={() => openLegalExternalLink(link.url)}>{link.label}<Icon name="arrow" size={13} /></button>;
}

function LegalInformationModal({ onClose }) {
  const dialogRef = useRef(null);
  useDialogFocus(dialogRef, onClose);

  return (
    <div className="modal-backdrop legal-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section ref={dialogRef} className="legal-modal" role="dialog" aria-modal="true" aria-labelledby="legal-modal-title" tabIndex="-1">
        <button className="modal-close" type="button" onClick={onClose} aria-label="Close about and rights information"><Icon name="close" size={18} /></button>
        <div className="legal-modal-heading">
          <div><p className="eyebrow">About this app</p><h2 id="legal-modal-title">About, terms & rights</h2><p>Clear information about the project, its sources, and the limits of using this private prototype.</p></div>
          <span className="legal-version">v{APP_VERSION}<small>Reviewed {LEGAL_APP_INFO.reviewDate}</small></span>
        </div>
        <nav className="legal-jump-links" aria-label="About and rights sections">
          <a href="#legal-about">About</a><a href="#legal-terms">Terms &amp; Conditions</a><a href="#legal-rights">Rights &amp; Usage</a><a href="#legal-credits">Credits</a>
        </nav>

        <section id="legal-about" className="legal-panel" aria-labelledby="legal-about-title">
          <div className="legal-panel-heading"><span className="legal-panel-icon"><Icon name="sunrise" size={19} /></span><div><p className="eyebrow">Independent project</p><h3 id="legal-about-title">Made by {LEGAL_APP_INFO.creatorName}</h3></div></div>
          <p>From Islam to Christ is a creator-led Bible study project built to help Muslim-background seekers and other curious readers explore Jesus Christ, Scripture, prayer, and Christian faith at a thoughtful pace. The app is local-first and designed for private study, with no account, advertising, reading-history analytics, or connected mentor service.</p>
          <div className="legal-about-facts"><div><strong>Project steward</strong><span>{LEGAL_APP_INFO.creatorName}</span></div><div><strong>Product</strong><span>{LEGAL_APP_INFO.productName}</span></div><div><strong>Repository</strong><span>{LEGAL_APP_INFO.repositoryLabel}</span></div></div>
          <div className="legal-link-row"><LegalExternalLink link={{ label: 'Open the official GitHub repository', url: LEGAL_APP_INFO.repositoryUrl }} /></div>
        </section>

        <section id="legal-terms" className="legal-panel" aria-labelledby="legal-terms-title">
          <div className="legal-panel-heading"><span className="legal-panel-icon"><Icon name="scroll" size={19} /></span><div><p className="eyebrow">Plain-language notice</p><h3 id="legal-terms-title">Terms &amp; Conditions</h3></div></div>
          <p className="legal-panel-lede">By using this prototype, you agree to use it lawfully and to respect the rights and safety boundaries described here. This notice is product information, not a substitute for qualified legal advice.</p>
          <div className="legal-text-sections">{LEGAL_TERMS_SECTIONS.map((section) => <article key={section.title}><h4>{section.title}</h4>{section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</article>)}</div>
        </section>

        <section id="legal-rights" className="legal-panel" aria-labelledby="legal-rights-title">
          <div className="legal-panel-heading"><span className="legal-panel-icon"><Icon name="shield" size={19} /></span><div><p className="eyebrow">Read before copying or sharing</p><h3 id="legal-rights-title">Rights &amp; Usage</h3></div></div>
          <p className="legal-panel-lede">A source being available on GitHub, present in the local Data folder, or bundled into this prototype does not automatically grant permission to redistribute it. The current release gate intentionally keeps unresolved source rights visible.</p>
          <div className="legal-text-sections">{LEGAL_RIGHTS_SECTIONS.map((section) => <article key={section.title}><div className="legal-article-heading"><h4>{section.title}</h4><span>{section.status}</span></div>{section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}{section.links?.length > 0 && <div className="legal-link-row">{section.links.map((link) => <LegalExternalLink key={link.url} link={link} />)}</div>}</article>)}</div>
        </section>

        <section id="legal-credits" className="legal-panel" aria-labelledby="legal-credits-title">
          <div className="legal-panel-heading"><span className="legal-panel-icon"><Icon name="database" size={19} /></span><div><p className="eyebrow">With gratitude and care</p><h3 id="legal-credits-title">Credits &amp; source record</h3></div></div>
          <p className="legal-panel-lede">These credits reflect the supplied local documentation and the current technical review. They are not a replacement for the license files, notices, and permissions that must accompany a cleared release.</p>
          <div className="legal-credit-list">{LEGAL_SOURCE_CREDITS.map((credit) => <article className="legal-credit-card" key={credit.name}><div className="legal-credit-heading"><h4>{credit.name}</h4><Icon name="book" size={16} /></div><p><strong>Credit:</strong> {credit.credit}</p><p><strong>Rights record:</strong> {credit.terms}</p>{credit.links?.length > 0 && <div className="legal-link-row">{credit.links.map((link) => <LegalExternalLink key={link.url} link={link} />)}</div>}</article>)}</div>
          <div className="legal-credit-subsection"><p className="eyebrow">Software and platform credits</p><div className="legal-software-list">{LEGAL_SOFTWARE_CREDITS.map((credit) => <div key={credit.name}><strong>{credit.name}</strong><span>{credit.detail}</span></div>)}</div></div>
          <div className="legal-credit-subsection"><p className="eyebrow">External service notices</p><div className="legal-service-list">{LEGAL_EXTERNAL_SERVICES.map((service) => <div key={service.name}><div><strong>{service.name}</strong><span>{service.detail}</span></div><LegalExternalLink link={{ label: 'Service information', url: service.url }} /></div>)}</div></div>
          <p className="legal-footer-note"><Icon name="info" size={14} /> For the full source-by-source status, see the project’s Content Review Report and the Source Library inside the app. The current audit reports 1,566 indexed local assets and 0 cleared assets, so this prototype is not a rights-cleared public release.</p>
        </section>

        <div className="legal-modal-footer"><span>Project record: {LEGAL_APP_INFO.repositoryLabel}</span><button className="primary-button" type="button" onClick={onClose}>Close <Icon name="check" size={15} /></button></div>
      </section>
    </div>
  );
}

function ContentAttributionCard({ contentDatabase, onOpenLibrary }) {
  const assets = contentDatabase?.sourceAssets || [];
  const reviewCount = assets.filter((asset) => asset.reviewStatus === 'needs-review').length;
  const noticeCount = assets.filter((asset) => asset.reviewStatus === 'source-notice').length;
  const clearedCount = assets.filter((asset) => asset.reviewStatus === 'cleared').length;
  const unclassifiedCount = assets.filter((asset) => !['cleared', 'needs-review', 'source-notice'].includes(asset.reviewStatus)).length;
  const pendingCount = assets.length - clearedCount;
  const releaseReady = assets.length > 0 && pendingCount === 0;

  return <section className="attribution-card card-surface" aria-labelledby="attribution-heading">
    <div className="attribution-heading"><div><p className="eyebrow">Content stewardship</p><h2 id="attribution-heading">Sources & attribution</h2></div><span className={`attribution-status ${releaseReady ? 'ready' : 'pending'}`}>{releaseReady ? 'Release ready' : 'Review pending'}</span></div>
    <p className="attribution-description">The app indexes the local Data catalog so every source can be traced. A file being present on this device does not automatically grant permission to redistribute it.</p>
    <div className="attribution-stats" aria-label="Content review counts"><div><strong>{assets.length.toLocaleString()}</strong><span>indexed</span></div><div><strong>{clearedCount.toLocaleString()}</strong><span>cleared</span></div><div><strong>{pendingCount.toLocaleString()}</strong><span>pending</span></div></div>
    <p className="attribution-note"><Icon name="info" size={15} /><span>{reviewCount.toLocaleString()} assets require license/attribution review, {noticeCount.toLocaleString()} contain notice or license material, and {unclassifiedCount.toLocaleString()} have an unclassified status. Public release remains gated until every packaged asset has a confirmed cleared status.</span></p>
    <button className="text-button" type="button" onClick={onOpenLibrary}><Icon name="database" size={15} /> Review the source library <Icon name="arrow" size={14} /></button>
  </section>;
}

function UpdateSettings({ updateState, offlineMode = false, onCheckUpdates, onUpdateAction }) {
  const platform = updateState?.platform || getUpdatePlatform();
  const isDownloading = updateState?.status === 'downloading';
  const isChecking = updateState?.status === 'checking';
  const isDownloaded = updateState?.status === 'downloaded';
  const needsPermission = updateState?.status === 'permission-required';
  const version = updateState?.version || updateState?.latestVersion;
  const statusCopy = offlineMode
    ? 'Offline-only mode is on. GitHub update checks are paused.'
    : isChecking
    ? 'Checking GitHub for the latest release…'
    : isDownloading
      ? `${updateState.percent || 0}% downloaded inside the app${version ? ` · v${version}` : ''}`
      : isDownloaded
        ? `v${version} is ready to install.`
        : needsPermission
          ? updateState.message || 'Allow this app to install its downloaded update.'
          : updateState.status === 'error'
            ? updateState.message || 'The update check failed.'
            : updateState.status === 'current'
              ? `You are running the latest ${platform === 'android' ? 'Android' : 'Windows'} release.`
              : 'Updates are checked against the public GitHub release.';

  return (
    <section className="update-settings-card card-surface" aria-labelledby="update-settings-heading">
      <div className="update-settings-heading">
        <div><p className="eyebrow">Stay current</p><h2 id="update-settings-heading">App updates</h2></div>
        <span className="update-platform"><Icon name={platform === 'android' ? 'book' : 'database'} size={16} /> {platform === 'android' ? 'Android' : 'Windows'}</span>
      </div>
      <p className="update-settings-description">Checks GitHub for a newer release. Android updates download into the app and open Android’s installer only when you choose Install update.</p>
      <div className="update-settings-actions">
        <button className="secondary-button" type="button" onClick={onCheckUpdates} disabled={offlineMode || isChecking || isDownloading}><Icon name="sparkles" size={15} /> {offlineMode ? 'Updates paused' : isChecking ? 'Checking…' : 'Check for updates'}</button>
        {!offlineMode && (isDownloaded || needsPermission) && <button className="primary-button update-install-button" type="button" onClick={onUpdateAction}><Icon name={needsPermission ? 'lock' : 'check'} size={15} /> {needsPermission ? 'Allow installs' : 'Install update'}</button>}
      </div>
      <p className={`update-settings-status status-${updateState?.status || 'idle'}`} role="status"><Icon name={isDownloaded ? 'check' : updateState?.status === 'error' ? 'info' : 'sparkles'} size={14} /> {statusCopy}</p>
    </section>
  );
}

function formatAssetSize(sizeBytes) {
  const size = Number(sizeBytes) || 0;
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  if (size < 1024 * 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  return `${(size / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

function formatSourceTitle(name) {
  return String(name || '')
    .replace(/\.[^.]+$/, '')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+(FIXED|CORRECTED|REVISED|FINAL)\b/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function reviewStatusLabel(status) {
  if (status === 'cleared') return 'Cleared';
  if (status === 'source-notice') return 'Notice';
  if (status === 'needs-review') return 'Review';
  return 'Unclassified';
}

function assetIcon(category) {
  if (category === 'media') return 'sparkles';
  if (category === 'bible') return 'book';
  if (category === 'reference') return 'scroll';
  if (category === 'archive') return 'database';
  return 'info';
}

function sourceGuidanceForAsset(asset) {
  const group = String(asset?.groupName || '').toLowerCase();
  if (group === 'facts & info') {
    const pathHandoff = factsInfoPathHandoffs.find((handoff) => handoff.pattern.test(`${asset?.path || ''} ${asset?.name || ''}`));
    const path = factsInfoReadingPaths.find((candidate) => candidate.id === pathHandoff?.pathId);
    return { icon: 'learn', title: 'Educational use in the app', text: 'This supplied study is paraphrased into guided Facts & Info reading paths and review-draft articles. The raw source file stays outside the renderer bundle until its redistribution status is confirmed.', action: path ? 'facts-path' : 'learn', pathId: path?.id, actionLabel: path ? `Open guided path: ${path.title}` : 'Open Facts & Info in Learn' };
  }
  if (group === 'strongs') return { icon: 'scroll', title: 'Word-study use in the app', text: 'Strong’s source files support the local lexicon, verse-to-number mappings, occurrences, and related passage discovery shown in the Bible reader. The raw research file is not presented as cleared public content.', action: 'bible', focusTarget: 'word-study', actionLabel: 'Open the Bible word study' };
  if (group === 'vines') return { icon: 'book', title: 'Word-study use in the app', text: 'Vine’s source files supply New Testament word-study context alongside the Strong’s entries in the Bible reader. This catalog entry records provenance while review continues.', action: 'bible', focusTarget: 'word-study', actionLabel: 'Open the Bible word study' };
  if (group === 'bhsa') return { icon: 'scroll', title: 'Hebrew research use', text: 'The app uses the review-labeled BHSA-derived alignment metadata in Bible word studies to show Hebrew lemmas, transliterations, glosses, morphology, and occurrence counts. Raw Hebrew source files remain outside the renderer bundle until their redistribution status is confirmed.', action: 'bible', focusTarget: 'word-study', actionLabel: 'Open Hebrew word study' };
  if (group === 'n1904') return { icon: 'book', title: 'Greek research use', text: 'The app uses the review-labeled N1904-derived alignment metadata in Bible word studies to show Greek lemmas, transliterations, glosses, morphology, and occurrence counts. Raw Greek source files remain outside the renderer bundle until their redistribution status is confirmed.', action: 'bible', focusTarget: 'word-study', actionLabel: 'Open Greek word study' };
  if (asset?.category === 'bible') return { icon: 'book', title: 'Bible conversion use', text: 'Bible source material is normalized into the offline runtime database when its conversion and review rules allow it. The reader consumes stable database rows rather than opening this raw file.' , action: 'bible', focusTarget: 'read', actionLabel: 'Open the Bible reader' };
  if (asset?.category === 'media') return { icon: 'sparkles', title: 'Visual asset use', text: 'This file is catalogued as a visual source for artwork and future media review. It is not bundled or displayed as public content until its rights and purpose are confirmed.' };
  if (asset?.category === 'documentation' || asset?.category === 'tooling') return { icon: 'info', title: 'Build and review use', text: 'This file supports conversion, documentation, or source review. It remains visible in the catalog so the provenance of the app’s data pipeline is not hidden.' };
  return { icon: 'database', title: 'Catalogued research source', text: 'This file is accounted for in the local source catalog. Its metadata is available for provenance and review, while raw content remains outside the renderer unless an approved runtime use is added.' };
}

function Library({ assets, groups: sourceGroups = [], initialGroup = 'All', initialQuery = '', onOpenLearn, onOpenFactsPath, onOpenBible }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [group, setGroup] = useState(initialGroup);
  const [selectedId, setSelectedId] = useState(null);
  const categories = useMemo(() => ['All', ...new Set(assets.map((asset) => asset.category).filter(Boolean))], [assets]);
  const groupOptions = useMemo(() => ['All', ...new Set(assets.map((asset) => asset.groupName).filter(Boolean))], [assets]);
  const groupStats = useMemo(() => new Map(sourceGroups.map((sourceGroup) => [sourceGroup.name, sourceGroup])), [sourceGroups]);
  useEffect(() => {
    setGroup(initialGroup && groupOptions.includes(initialGroup) ? initialGroup : 'All');
  }, [initialGroup, groupOptions]);
  useEffect(() => {
    setQuery(initialQuery || '');
    setSelectedId(null);
  }, [initialQuery]);
  const normalizedQuery = query.trim().toLowerCase();
  const filteredAssets = useMemo(() => assets.filter((asset) => {
    const categoryMatches = category === 'All' || asset.category === category;
    const groupMatches = group === 'All' || asset.groupName === group;
    const queryMatches = !normalizedQuery || `${asset.path} ${asset.name} ${asset.type} ${asset.groupName}`.toLowerCase().includes(normalizedQuery);
    return categoryMatches && groupMatches && queryMatches;
  }), [assets, category, group, normalizedQuery]);
  const selectedAsset = assets.find((asset) => asset.id === selectedId);
  const selectedAssetGuidance = selectedAsset ? sourceGuidanceForAsset(selectedAsset) : null;
  const namedGroups = new Set(researchCollections.map((collection) => collection.group));
  const additionalCollections = sourceGroups
    .filter((sourceGroup) => sourceGroup?.name && !namedGroups.has(sourceGroup.name))
    .map((sourceGroup) => ({
      id: `catalog-${String(sourceGroup.name).toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
      group: sourceGroup.name,
      label: sourceGroup.name === 'root' ? 'Project sources' : `${sourceGroup.name} sources`,
      icon: 'database',
      description: sourceGroup.name === 'root' ? 'Top-level Data files used by the conversion and review pipeline.' : 'Indexed source files available for inspection and review.',
    }));
  const collectionCards = [...researchCollections, ...additionalCollections].map((collection) => ({ ...collection, stats: groupStats.get(collection.group) }));

  return (
    <div className="library-page page-enter">
      <SectionIntro eyebrow="Every source, accounted for" title="Source library" description="The complete local Data catalog is available here. The app uses every asset’s metadata without bundling unreviewed raw research files into the install." action={<span className="library-total"><Icon name="database" size={16} /> {assets.length.toLocaleString()} indexed</span>} />
      <SectionArt art={sectionArt.library} />
      <section className="research-collections" aria-labelledby="research-collections-heading">
        <div className="section-label-row"><div><p className="eyebrow">Research collections</p><h2 id="research-collections-heading">Strong's, Vine's, and more</h2><p className="section-description">Start with a named collection, then inspect every indexed file and its local review status.</p></div><span className="library-total"><Icon name="database" size={16} /> {assets.length.toLocaleString()} sources</span></div>
        <div className="collection-grid">{collectionCards.map((collection) => <button className={`collection-card ${group === collection.group ? 'selected' : ''}`} type="button" key={collection.id} onClick={() => { setGroup(collection.group); setCategory('All'); setQuery(''); setSelectedId(null); }} aria-pressed={group === collection.group}><span className={`collection-card-icon collection-card-icon-${collection.id}`}><Icon name={collection.icon} size={20} /></span><span className="collection-card-copy"><strong>{collection.label}</strong><small>{collection.description}</small></span><span className="collection-card-count">{(collection.stats?.fileCount || 0).toLocaleString()} sources <Icon name="arrow" size={14} /></span></button>)}</div>
      </section>
      <div className="library-controls">
        <div className="reference-search library-search"><Icon name="search" size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search names, paths, or types" aria-label="Search source library" />{query && <button type="button" onClick={() => setQuery('')} aria-label="Clear library search"><Icon name="close" size={15} /></button>}</div>
        <label className="library-filter"><span>Category</span><select value={category} onChange={(event) => setCategory(event.target.value)}>{categories.map((option) => <option key={option} value={option}>{option === 'All' ? 'All categories' : option}</option>)}</select><Icon name="chevron" size={14} /></label>
        <label className="library-filter"><span>Source group</span><select value={group} onChange={(event) => setGroup(event.target.value)}>{groupOptions.map((option) => <option key={option} value={option}>{option === 'All' ? 'All groups' : option}</option>)}</select><Icon name="chevron" size={14} /></label>
      </div>
      <div className="library-summary"><strong>{filteredAssets.length.toLocaleString()}</strong><span>assets shown</span><span className="library-summary-divider" /> <span>{assets.length.toLocaleString()} total indexed from Data</span></div>
      {filteredAssets.length > 0 ? <div className="asset-list" aria-label="Indexed source assets">{filteredAssets.map((asset) => <button className={`asset-row ${selectedId === asset.id ? 'selected' : ''}`} type="button" key={asset.id} onClick={() => setSelectedId(asset.id)}><span className={`asset-icon asset-icon-${asset.category}`}><Icon name={assetIcon(asset.category)} size={18} /></span><span className="asset-copy"><strong>{asset.name}</strong><small>{asset.path}</small></span><span className="asset-type">{asset.type}</span><span className="asset-size">{formatAssetSize(asset.sizeBytes)}</span><span className={`asset-review asset-review-${asset.reviewStatus}`}>{reviewStatusLabel(asset.reviewStatus)}</span><Icon name="chevron" size={15} /></button>)}</div> : <EmptyState icon="search" title="No source assets found" text="Try a different name, path, category, or source group." />}
       {selectedAsset && <section className="asset-detail card-surface" aria-labelledby="asset-detail-heading"><div className="asset-detail-heading"><span className={`asset-icon asset-icon-${selectedAsset.category}`}><Icon name={assetIcon(selectedAsset.category)} size={20} /></span><div><p className="eyebrow">Indexed source asset</p><h2 id="asset-detail-heading">{selectedAsset.name}</h2></div><button className="icon-button" type="button" onClick={() => setSelectedId(null)} aria-label="Close asset details"><Icon name="close" size={17} /></button></div><dl className="asset-detail-grid"><div><dt>Path</dt><dd>{selectedAsset.path}</dd></div><div><dt>Group</dt><dd>{selectedAsset.groupName}</dd></div><div><dt>Type</dt><dd>{selectedAsset.type}</dd></div><div><dt>Size</dt><dd>{formatAssetSize(selectedAsset.sizeBytes)}</dd></div><div><dt>Catalog status</dt><dd>{reviewStatusLabel(selectedAsset.reviewStatus)}</dd></div><div><dt>Runtime use</dt><dd>{selectedAsset.previewable ? 'Searchable and metadata-indexed' : 'Metadata-indexed; raw file stays outside the renderer bundle'}</dd></div></dl>{selectedAssetGuidance && <div className="asset-guidance"><span className="asset-guidance-icon"><Icon name={selectedAssetGuidance.icon} size={18} /></span><div><p className="eyebrow">{selectedAssetGuidance.title}</p><p>{selectedAssetGuidance.text}</p>{selectedAssetGuidance.action === 'facts-path' && selectedAssetGuidance.pathId && <button className="text-button" type="button" onClick={() => onOpenFactsPath?.(selectedAssetGuidance.pathId)}>{selectedAssetGuidance.actionLabel} <Icon name="arrow" size={14} /></button>}{selectedAssetGuidance.action === 'learn' && <button className="text-button" type="button" onClick={onOpenLearn}>Open guided study <Icon name="arrow" size={14} /></button>}{selectedAssetGuidance.action === 'bible' && <button className="text-button" type="button" onClick={() => onOpenBible?.(selectedAssetGuidance.focusTarget)}>{selectedAssetGuidance.actionLabel} <Icon name="arrow" size={14} /></button>}</div></div>}</section>}
    </div>
  );
}

function PrivacyLockSettings({ enabled, biometricAvailable = false, biometricEnabled = false, onEnable, onDisable, onEnableBiometric, onDisableBiometric, onLock, onQuickClose }) {
  const [editorOpen, setEditorOpen] = useState(false);
  const [pin, setPin] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [message, setMessage] = useState('');
  const [biometricMessage, setBiometricMessage] = useState('');
  const [quickCloseMessage, setQuickCloseMessage] = useState('');

  function closeEditor() {
    setEditorOpen(false);
    setPin('');
    setConfirmation('');
    setMessage('');
  }

  async function submit(event) {
    event.preventDefault();
    if (!/^\d{4,8}$/.test(pin)) {
      setMessage('Use a PIN with 4 to 8 digits.');
      return;
    }
    if (pin !== confirmation) {
      setMessage('The PINs do not match.');
      return;
    }
    const result = await onEnable(pin);
    if (!result?.ok) {
      setMessage(result?.message || 'The local PIN could not be created.');
      return;
    }
    closeEditor();
  }

  async function toggleBiometric() {
    setBiometricMessage('');
    if (biometricEnabled) {
      onDisableBiometric?.();
      setBiometricMessage('Device biometric unlock is off. Your app PIN remains available.');
      return;
    }
    const result = await onEnableBiometric?.();
    setBiometricMessage(result?.ok ? 'Device biometric unlock is on. Your app PIN remains available as a fallback.' : (result?.message || 'Biometric unlock could not be enabled.'));
  }

  async function quickClose() {
    setQuickCloseMessage('');
    const result = await onQuickClose?.();
    if (!result?.ok) setQuickCloseMessage(result?.message || 'Quick close is available in the Android app.');
  }

  return <section className="privacy-control-card card-surface" aria-labelledby="privacy-lock-heading">
    <div className="privacy-control-heading"><div><p className="eyebrow">Local access</p><h2 id="privacy-lock-heading">PIN lock</h2></div><span className={`privacy-status ${enabled ? 'enabled' : ''}`}>{enabled ? 'Enabled' : 'Not set'}</span></div>
    <p className="privacy-control-description">A local PIN hides the app after launch and after five minutes without activity. It is an access gate, not encryption, and it cannot protect a compromised device or operating-system storage.</p>
    <div className="privacy-control-actions">
      {enabled && <button className="secondary-button" type="button" onClick={onLock}><Icon name="lock" size={15} /> Lock now</button>}
      <button className="text-button" type="button" onClick={() => { setEditorOpen(true); setMessage(''); }}>{enabled ? 'Change PIN' : 'Set a local PIN'} <Icon name="arrow" size={14} /></button>
      {enabled && <button className="text-button danger-button" type="button" onClick={onDisable}>Remove PIN</button>}
    </div>
    {enabled && <div className="biometric-control"><div><p className="eyebrow">Android convenience</p><strong>Device biometric unlock</strong><small>{biometricAvailable ? 'Use the fingerprint or face authentication already configured on your Android device.' : 'Available in the Android app when the device supports Android 6 biometric authentication.'}</small></div><button className={`secondary-button ${biometricEnabled ? 'selected' : ''}`} type="button" onClick={toggleBiometric} disabled={!biometricAvailable}>{biometricEnabled ? 'Turn off' : 'Set up'} <Icon name={biometricEnabled ? 'close' : 'shield'} size={15} /></button></div>}
    {biometricMessage && <p className="privacy-form-message" role="status">{biometricMessage}</p>}
    <div className="quick-close-control"><div><p className="eyebrow">Leave quietly</p><strong>Quick close app</strong><small>Close this Android app and remove its task from the recent-apps list when Android allows it. Your saved data remains on this device, and this does not erase system records.</small></div><button className="secondary-button quick-close-button" type="button" onClick={quickClose}><Icon name="close" size={15} /> Close app</button></div>
    {quickCloseMessage && <p className="privacy-form-message" role="alert">{quickCloseMessage}</p>}
    {editorOpen && <form className="privacy-control-form" onSubmit={submit}>
      <label>New PIN<input type="password" inputMode="numeric" autoComplete="new-password" pattern="[0-9]{4,8}" maxLength="8" value={pin} onChange={(event) => setPin(event.target.value.replace(/\D/g, ''))} autoFocus /></label>
      <label>Confirm PIN<input type="password" inputMode="numeric" autoComplete="new-password" pattern="[0-9]{4,8}" maxLength="8" value={confirmation} onChange={(event) => setConfirmation(event.target.value.replace(/\D/g, ''))} /></label>
      {message && <p className="privacy-form-message" role="alert">{message}</p>}
      <div className="privacy-control-actions"><button className="primary-button" type="submit">Save PIN <Icon name="check" size={15} /></button><button className="text-button" type="button" onClick={closeEditor}>Cancel</button></div>
    </form>}
  </section>;
}

function PrivateDataSettings({ onDelete }) {
  const [confirming, setConfirming] = useState(false);
  return <section className="data-control-card card-surface" aria-labelledby="data-control-heading">
    <div className="privacy-control-heading"><div><p className="eyebrow">Private state</p><h2 id="data-control-heading">Delete local data</h2></div><Icon name="database" size={21} /></div>
    <p className="privacy-control-description">Remove bookmarks, highlights, notes, private Saved folders, saved Study Packs, Study Pack checkpoints, downloaded study guides, reading-plan progress, study focus, prayer journal entries, Journey progress, Faith path progress, reading preferences, saved Bible location and reading history, and the local PIN from this device. The read-only content database is not deleted.</p>
    {!confirming ? <button className="text-button danger-button" type="button" onClick={() => setConfirming(true)}>Delete private data <Icon name="close" size={14} /></button> : <div className="delete-confirmation" role="alert"><strong>This cannot be undone.</strong><span>Reset the private state on this device?</span><div className="privacy-control-actions"><button className="danger-solid-button" type="button" onClick={() => { onDelete(); setConfirming(false); }}>Delete it</button><button className="text-button" type="button" onClick={() => setConfirming(false)}>Cancel</button></div></div>}
  </section>;
}

function SettingRow({ icon, title, value, description, onClick }) {
  const Row = onClick ? 'button' : 'div';
  return <Row className="setting-row" type={onClick ? 'button' : undefined} onClick={onClick}><span className="setting-row-icon"><Icon name={icon} size={18} /></span><span className="setting-row-copy"><strong>{title}</strong><small>{description || (title === 'Privacy & security' ? 'Bookmarks and progress remain on this device' : 'Available in a future build')}</small></span><span className="setting-value">{value}</span>{onClick && <Icon name="chevron" size={16} />}</Row>;
}

function Toggle({ label, checked, onChange }) {
  return <button className={`toggle ${checked ? 'on' : ''}`} type="button" role="switch" aria-label={label} aria-checked={checked} onClick={onChange}><span /></button>;
}

function PrivacyLockScreen({ discreetMode = false, lockout = {}, onUnlock, onFailedAttempt, biometricEnabled = false, biometricAvailable = false, onBiometricUnlock }) {
  const [pin, setPin] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [biometricBusy, setBiometricBusy] = useState(false);
  const [now, setNow] = useState(Date.now());
  const lockoutUntil = Number(lockout?.lockedUntil) || 0;
  const isLockedOut = lockoutUntil > now;
  const lockoutSeconds = Math.max(0, Math.ceil((lockoutUntil - now) / 1000));

  useEffect(() => {
    if (lockoutUntil <= Date.now()) {
      setNow(Date.now());
      return undefined;
    }
    const timer = window.setInterval(() => {
      const current = Date.now();
      setNow(current);
      if (current >= lockoutUntil) window.clearInterval(timer);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [lockoutUntil]);

  function lockoutMessage() {
    if (!isLockedOut) return '';
    const unit = lockoutSeconds === 1 ? 'second' : 'seconds';
    return `Too many incorrect attempts. Try again in ${lockoutSeconds} ${unit}.`;
  }

  async function submit(event) {
    event.preventDefault();
    if (isLockedOut) {
      setMessage(lockoutMessage());
      return;
    }
    if (!pin) {
      setMessage('Enter your PIN to continue.');
      return;
    }
    setBusy(true);
    const unlocked = await onUnlock(pin);
    setBusy(false);
    if (unlocked) {
      setPin('');
      setMessage('');
    } else {
      setPin('');
      onFailedAttempt?.();
      setMessage('That PIN did not unlock this app.');
    }
  }

  async function unlockWithBiometric() {
    setBiometricBusy(true);
    setMessage('');
    const unlocked = await onBiometricUnlock?.();
    setBiometricBusy(false);
    if (!unlocked) setMessage('Biometric verification was not completed. Use your app PIN instead.');
  }

  return <main className={`privacy-lock-screen ${discreetMode ? 'privacy-lock-screen-neutral' : ''}`} aria-labelledby="privacy-lock-screen-title"><section className="privacy-lock-card">{discreetMode ? <div className="lock-screen-neutral-mark"><span><Icon name="lock" size={20} /></span><strong>Private space</strong></div> : <div className="lock-screen-mark"><div className="brand-symbol"><Icon name="cross" size={25} strokeWidth={1.7} /></div><div className="brand-copy"><span>From Islam</span><strong>to Christ</strong></div></div>}<div className="lock-screen-icon"><Icon name="lock" size={27} /></div><p className="eyebrow">{discreetMode ? 'Private space' : 'Private on this device'}</p><h1 id="privacy-lock-screen-title">Enter your PIN.</h1><p className="lock-screen-description">{discreetMode ? 'This private space is locked. Your local PIN protects casual access to what is stored here; it does not replace your device security.' : 'This app is locked after inactivity. Your local PIN reduces casual access to saved study state; it does not replace your device security.'}</p><form className="lock-screen-form" onSubmit={submit}><label htmlFor="privacy-pin-entry">Local PIN</label><input id="privacy-pin-entry" type="password" inputMode="numeric" autoComplete="current-password" pattern="[0-9]{4,8}" maxLength="8" value={pin} onChange={(event) => setPin(event.target.value.replace(/\D/g, ''))} autoFocus disabled={isLockedOut} /><button className="primary-button" type="submit" disabled={busy || biometricBusy || isLockedOut}>{busy ? 'Checking…' : isLockedOut ? 'Temporarily locked' : 'Unlock'} <Icon name="arrow" size={16} /></button>{biometricEnabled && biometricAvailable && <button className="secondary-button lock-screen-biometric" type="button" onClick={unlockWithBiometric} disabled={busy || biometricBusy}><Icon name="shield" size={16} /> {biometricBusy ? 'Waiting for device…' : 'Unlock with biometrics'}</button>}{(message || isLockedOut) && <p className="privacy-form-message" role="alert">{isLockedOut ? lockoutMessage() : message}</p>}</form><p className="lock-screen-limit"><strong>Privacy limit:</strong> someone with access to this device or its storage may still be able to access application data.</p></section></main>;
}

function PrivacyNotice({ onClose }) {
  const dialogRef = useRef(null);
  useDialogFocus(dialogRef, onClose);

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section ref={dialogRef} className="privacy-modal" role="dialog" aria-modal="true" aria-labelledby="privacy-title" tabIndex="-1">
        <button className="modal-close" type="button" onClick={onClose} aria-label="Close privacy notice"><Icon name="close" size={18} /></button>
        <div className="modal-icon"><Icon name="shield" size={24} /></div>
        <p className="eyebrow">A clear promise</p>
        <h2 id="privacy-title">What Discreet Mode can do</h2>
        <p>It keeps this prototype local, quiet, and free from accounts or analytics. It can reduce casual discovery on the device, but it is not a guarantee of secrecy.</p>
        <ul className="privacy-boundary-list">
          <li><strong>Identity:</strong> the launcher label and icon still identify the app as From Islam to Christ. The neutral startup screen only reduces casual discovery after launch.</li>
          <li><strong>Notifications:</strong> this build creates no notifications and requests no notification permission, so it does not place reading activity in notification history.</li>
          <li><strong>Screen and task previews:</strong> enabled Discreet Mode applies Android <code>FLAG_SECURE</code> before the WebView starts, protecting the window from screenshots, screen recording, and recent-task previews where Android honors the flag. Windows packaged builds also request Electron content protection. Device manufacturers, operating systems, and external capture tools may handle those requests differently.</li>
          <li><strong>Clipboard and sharing:</strong> copying a verse or using the system share surface can expose text to the clipboard or another app. Share only when it is safe; the app does not share reading or journey activity automatically.</li>
          <li><strong>Storage and backup:</strong> saved study state stays in local app storage and is excluded from Android cloud backup and device-to-device transfer. It is not encrypted at rest in this prototype, and someone with device or storage access may still inspect it.</li>
          <li><strong>Offline-only mode:</strong> when enabled, the app pauses GitHub update checks and uncached online translation requests. Bundled Bible text, local study content, and translations already cached on this device remain available; turning the setting off is required to discover new releases or request missing public translations.</li>
          <li><strong>PIN and biometrics:</strong> the local PIN is an access gate, not encryption. Five incorrect PIN attempts begin a temporary escalating throttle capped at five minutes. Android biometric unlock remains an optional convenience and the PIN remains the fallback.</li>
          <li><strong>Logs and deletion:</strong> this prototype has no remote analytics or crash-reporting service. The operating system may retain its own records, and Delete private data removes the app's saved study state but cannot erase every system record, screenshot, clipboard entry, or backup already made.</li>
        </ul>
        <button className="primary-button" type="button" onClick={onClose}>I understand <Icon name="check" size={16} /></button>
      </section>
    </div>
  );
}

export default App;
