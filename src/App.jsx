import { useEffect, useMemo, useRef, useState } from 'react';
import bibleData from './data/bible-john.json';
import { loadBibleChapter, loadContentDatabase } from './services/content-database';
import { APP_VERSION, GITHUB_RELEASES_URL, checkForGitHubUpdate, getUpdatePlatform, openUpdateUrl } from './services/github-updates';

const navigation = [
  { id: 'home', label: 'Home', icon: 'home' },
  { id: 'bible', label: 'Bible', icon: 'book' },
  { id: 'learn', label: 'Learn', icon: 'learn' },
  { id: 'journey', label: 'Journey', icon: 'journey' },
  { id: 'saved', label: 'Saved', icon: 'bookmark' },
];

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
];

const lessons = [
  { id: 1, title: 'Explore the truth', subtitle: 'Start with your honest questions.', status: 'complete', icon: 'search' },
  { id: 2, title: 'Read the Gospel', subtitle: 'Meet Jesus in the Gospel of John.', status: 'current', icon: 'book' },
  { id: 3, title: 'Ask questions', subtitle: 'Make space for careful answers.', status: 'locked', icon: 'dialogue' },
  { id: 4, title: 'Consider faith', subtitle: 'What does it mean to follow Jesus?', status: 'locked', icon: 'compass' },
  { id: 5, title: 'Take the next step', subtitle: 'Move at a safe and honest pace.', status: 'locked', icon: 'arrow' },
  { id: 6, title: 'Grow in faith', subtitle: 'Prayer, Scripture, and daily life.', status: 'locked', icon: 'sprout' },
  { id: 7, title: 'Walk in the light', subtitle: 'Keep learning with hope.', status: 'locked', icon: 'sunrise' },
];

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
    bell: <><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" /></>,
    info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></>,
    heart: <path d="M20.8 8.7c0 5.2-8.8 10.3-8.8 10.3S3.2 13.9 3.2 8.7A4.7 4.7 0 0 1 12 6a4.7 4.7 0 0 1 8.8 2.7z" />,
    dialogue: <><path d="M4 5.5h16v10H8l-4 4z" /><path d="M8 9h8M8 12h5" /></>,
    scroll: <><path d="M6 4h12v16H6a3 3 0 0 1 0-6h12" /><path d="M6 14h12M9 8h6M9 11h4" /></>,
    sprout: <><path d="M12 21v-9" /><path d="M12 12C7 12 4 9 4 4c5 0 8 3 8 8M12 15c0-5 3-8 8-8 0 5-3 8-8 8" /></>,
    hands: <><path d="M7 12V6a1.5 1.5 0 0 1 3 0v4M10 10V4.5a1.5 1.5 0 0 1 3 0V10M13 10V6a1.5 1.5 0 0 1 3 0v5M16 11V8.5a1.5 1.5 0 0 1 3 0V14c0 4-2.5 7-6.5 7H11c-2.5 0-4-1.2-5.5-3.2L3 14a1.7 1.7 0 0 1 2.8-2L7 13" /></>,
    compass: <><circle cx="12" cy="12" r="9" /><path d="m15.5 8.5-2.2 4.8-4.8 2.2 2.2-4.8z" /></>,
    play: <path d="m8 5 11 7-11 7z" />,
    close: <><path d="m6 6 12 12M18 6 6 18" /></>,
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
  const [readerPreferences, setReaderPreferences] = useState(() => readLocal('fdl-reader-preferences', { fontScale: 1, tone: 'default' }));
  const [completedLessons, setCompletedLessons] = useState(() => readLocal('fdl-completed-lessons', [1]));
  const [discreetMode, setDiscreetMode] = useState(() => readLocal('fdl-discreet-mode', true));
  const [theme, setTheme] = useState(() => readLocal('fdl-theme', 'light'));
  const [searchTerm, setSearchTerm] = useState('');
  const [showPrivacyNotice, setShowPrivacyNotice] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [updateState, setUpdateState] = useState({ status: 'idle', currentVersion: APP_VERSION });
  const [bibleLocation, setBibleLocation] = useState(() => readLocal('fdl-bible-location', { bookId: 'JHN', chapter: 1 }));
  const [bibleChapterLoading, setBibleChapterLoading] = useState(false);
  const [contentDatabase, setContentDatabase] = useState({ status: 'loading', sourceAssetCount: 0, contentVersion: APP_VERSION, bibleBooks: [], bibleVerses: [] });

  useEffect(() => window.localStorage.setItem('fdl-active-view', JSON.stringify(activeView)), [activeView]);
  useEffect(() => window.localStorage.setItem('fdl-bookmarks', JSON.stringify(bookmarks)), [bookmarks]);
  useEffect(() => window.localStorage.setItem('fdl-highlights', JSON.stringify(highlights)), [highlights]);
  useEffect(() => window.localStorage.setItem('fdl-notes', JSON.stringify(notes)), [notes]);
  useEffect(() => window.localStorage.setItem('fdl-reader-preferences', JSON.stringify(readerPreferences)), [readerPreferences]);
  useEffect(() => window.localStorage.setItem('fdl-completed-lessons', JSON.stringify(completedLessons)), [completedLessons]);
  useEffect(() => window.localStorage.setItem('fdl-discreet-mode', JSON.stringify(discreetMode)), [discreetMode]);
  useEffect(() => window.localStorage.setItem('fdl-theme', JSON.stringify(theme)), [theme]);
  useEffect(() => window.localStorage.setItem('fdl-bible-location', JSON.stringify(bibleLocation)), [bibleLocation]);
  useEffect(() => {
    document.documentElement.style.colorScheme = theme;
  }, [theme]);
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
  }, []);

  useEffect(() => {
    if (contentDatabase.status !== 'ready') return undefined;
    const loadedLocation = contentDatabase.bibleLocation;
    if (loadedLocation?.bookId === bibleLocation.bookId && loadedLocation?.chapter === bibleLocation.chapter) return undefined;
    let active = true;
    setBibleChapterLoading(true);
    loadBibleChapter(bibleLocation.bookId, bibleLocation.chapter)
      .then((verses) => {
        if (!active) return;
        setContentDatabase((current) => ({ ...current, bibleLocation, bibleVerses: verses }));
      })
      .catch(() => {
        if (active) setBibleChapterLoading(false);
      })
      .finally(() => {
        if (active) setBibleChapterLoading(false);
      });
    return () => { active = false; };
  }, [contentDatabase.status, contentDatabase.bibleLocation?.bookId, contentDatabase.bibleLocation?.chapter, bibleLocation.bookId, bibleLocation.chapter]);

  async function checkForUpdates() {
    setUpdateState((current) => ({ ...current, status: 'checking' }));
    try {
      if (window.fromDarkness?.checkForUpdate) {
        const result = await window.fromDarkness.checkForUpdate();
        setUpdateState((current) => ({ ...current, ...result }));
        return result;
      }
      const result = await checkForGitHubUpdate();
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
    if (window.fromDarkness?.onUpdateStatus) removeUpdateListener = window.fromDarkness.onUpdateStatus((status) => setUpdateState((current) => ({ ...current, ...status })));
    checkForUpdates();
    return () => removeUpdateListener?.();
  }, []);

  const currentTitle = useMemo(() => {
    if (selectedArticle) return selectedArticle.title;
    return navigation.find((item) => item.id === activeView)?.label || 'Home';
  }, [activeView, selectedArticle]);

  const runtimeVerses = contentDatabase.bibleVerses?.length ? contentDatabase.bibleVerses : fallbackVerses;
  const runtimeBooks = contentDatabase.bibleBooks?.length ? contentDatabase.bibleBooks : [{ id: 'JHN', name: 'John', abbreviation: 'Jhn', bookOrder: 43, chapterCount: 1 }];

  function navigate(view) {
    setSelectedArticle(null);
    setActiveView(view);
    setMobileMenuOpen(false);
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

  function updateReaderPreference(key, value) {
    setReaderPreferences((current) => ({ ...current, [key]: value }));
  }

  function changeBibleLocation(nextLocation) {
    setSearchTerm('');
    setBibleLocation(nextLocation);
  }

  function toggleLesson(id) {
    setCompletedLessons((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  }

  function openArticle(article) {
    setSelectedArticle(article);
    setActiveView('learn');
    setMobileMenuOpen(false);
  }

  async function handleUpdateAction() {
    if (updateState.status === 'downloaded' && window.fromDarkness?.installUpdate) {
      await window.fromDarkness.installUpdate();
      return;
    }
    await openUpdateUrl(updateState.downloadUrl || updateState.notesUrl || GITHUB_RELEASES_URL);
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
            <NavButton key={item.id} item={item} active={activeView === item.id && !selectedArticle} onClick={() => navigate(item.id)} />
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
            <button className="icon-button" type="button" aria-label="Search" onClick={() => navigate('learn')}><Icon name="search" size={19} /></button>
            <button className="theme-button" type="button" aria-pressed={theme === 'dark'} aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`} title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`} onClick={() => setTheme((current) => current === 'light' ? 'dark' : 'light')}><Icon name={theme === 'light' ? 'moon' : 'sun'} size={16} /><span>{theme === 'light' ? 'Dark' : 'Light'}</span></button>
            <button className="profile-button" type="button" onClick={() => navigate('settings')}><span className="profile-avatar">✦</span><span className="profile-label">Private seeker</span><Icon name="chevron" size={14} /></button>
          </div>
        </header>

        {mobileMenuOpen && <MobileDrawer activeView={activeView} selectedArticle={selectedArticle} theme={theme} setTheme={setTheme} onNavigate={navigate} onClose={() => setMobileMenuOpen(false)} />}
        {(updateState.status === 'available' || updateState.status === 'downloading' || updateState.status === 'downloaded') && <UpdateBanner updateState={updateState} onAction={handleUpdateAction} />}

        <div className="page-content">
          {selectedArticle ? (
            <ArticleDetail article={selectedArticle} onBack={() => setSelectedArticle(null)} bookmarks={bookmarks} toggleBookmark={toggleBookmark} navigate={navigate} />
          ) : (
            <>
              {activeView === 'home' && <Home onNavigate={navigate} onOpenArticle={openArticle} bookmarks={bookmarks} toggleBookmark={toggleBookmark} completedLessons={completedLessons} />}
              {activeView === 'bible' && <Bible verses={runtimeVerses} books={runtimeBooks} location={bibleLocation} onChangeLocation={changeBibleLocation} loading={bibleChapterLoading} searchTerm={searchTerm} setSearchTerm={setSearchTerm} bookmarks={bookmarks} toggleBookmark={toggleBookmark} highlights={highlights} toggleHighlight={toggleHighlight} notes={notes} saveNote={saveNote} readerPreferences={readerPreferences} updateReaderPreference={updateReaderPreference} />}
              {activeView === 'learn' && <Learn articles={articles} onOpenArticle={openArticle} />}
              {activeView === 'journey' && <Journey completedLessons={completedLessons} toggleLesson={toggleLesson} onNavigate={navigate} />}
              {activeView === 'saved' && <Saved verses={runtimeVerses} bookmarks={bookmarks} toggleBookmark={toggleBookmark} onOpenArticle={openArticle} navigate={navigate} />}
              {activeView === 'settings' && <Settings discreetMode={discreetMode} setDiscreetMode={setDiscreetMode} theme={theme} setTheme={setTheme} showPrivacyNotice={showPrivacyNotice} setShowPrivacyNotice={setShowPrivacyNotice} updateState={updateState} onCheckUpdates={checkForUpdates} contentDatabase={contentDatabase} />}
            </>
          )}
        </div>
        <BottomNav activeView={activeView} selectedArticle={selectedArticle} onNavigate={navigate} />
      </main>
    </div>
  );
}

function MobileDrawer({ activeView, selectedArticle, theme, setTheme, onNavigate, onClose }) {
  return (
    <div className="mobile-drawer-layer" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <aside className="mobile-drawer" role="dialog" aria-label="Navigation menu">
        <div className="mobile-drawer-header"><div className="mobile-drawer-brand"><span>From Darkness</span><strong>to Light</strong></div><button className="icon-button" type="button" onClick={onClose} aria-label="Close navigation"><Icon name="close" size={18} /></button></div>
        <nav className="mobile-drawer-nav" aria-label="Mobile navigation menu">
          {navigation.map((item) => <NavButton key={item.id} item={item} active={activeView === item.id && !selectedArticle} onClick={() => onNavigate(item.id)} />)}
          <button className={`nav-button ${activeView === 'settings' && !selectedArticle ? 'active' : ''}`} type="button" onClick={() => onNavigate('settings')}><Icon name="shield" size={19} /><span>Privacy & settings</span>{activeView === 'settings' && !selectedArticle && <span className="nav-dot" />}</button>
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
  const isAndroid = platform === 'android';
  const title = isDownloaded ? 'Update ready' : isDownloading ? 'Downloading update' : isAndroid ? 'Android update available' : 'Update available';
  const detail = isDownloaded
    ? `Version ${updateState.version || updateState.latestVersion} is ready to install.`
    : isDownloading
      ? `${updateState.percent || 0}% downloaded from GitHub.`
      : `Version ${updateState.version || updateState.latestVersion} is available from GitHub.`;
  const actionLabel = isDownloaded ? 'Restart to install' : isDownloading ? `${updateState.percent || 0}%` : isAndroid ? 'Download' : 'Downloading…';

  return <section className="update-banner" role="status"><span className="update-banner-icon"><Icon name={isDownloaded ? 'check' : 'sparkles'} size={18} /></span><span className="update-banner-copy"><strong>{title}</strong><small>{detail}</small></span>{(!isDownloading || isDownloaded) && <button className="update-banner-button" type="button" onClick={onAction}>{actionLabel}<Icon name="arrow" size={14} /></button>}{isDownloading && <span className="update-banner-progress">{actionLabel}</span>}</section>;
}

function BrandMark() {
  return (
    <div className="brand-mark">
      <div className="brand-symbol"><Icon name="cross" size={25} strokeWidth={1.7} /></div>
      <div className="brand-copy"><span>From Darkness</span><strong>to Light</strong></div>
    </div>
  );
}

function NavButton({ item, active, onClick }) {
  return <button className={`nav-button ${active ? 'active' : ''}`} type="button" onClick={onClick}><Icon name={item.icon} size={19} /><span>{item.label}</span>{active && <span className="nav-dot" />}</button>;
}

function BottomNav({ activeView, selectedArticle, onNavigate }) {
  return <nav className="bottom-nav" aria-label="Mobile navigation">{navigation.map((item) => <NavButton key={item.id} item={item} active={activeView === item.id && !selectedArticle} onClick={() => onNavigate(item.id)} />)}</nav>;
}

function SectionIntro({ eyebrow, title, description, action }) {
  return <div className="section-intro"><div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1>{description && <p className="section-description">{description}</p>}</div>{action}</div>;
}

function Home({ onNavigate, onOpenArticle, bookmarks, toggleBookmark, completedLessons }) {
  const progress = Math.round((completedLessons.length / lessons.length) * 100);
  return (
    <div className="home-page page-enter">
      <section className="hero-panel">
        <div className="hero-copy">
          <p className="eyebrow hero-eyebrow"><span className="eyebrow-line" /> A safe place to explore Jesus</p>
          <h1>From Darkness<br /><em>to Light</em></h1>
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
          <div className="continue-content"><div className="lesson-badge"><Icon name="book" size={22} /></div><div><strong>Read the Gospel</strong><p>Meet Jesus in the Gospel of John.</p></div><button className="round-arrow" type="button" onClick={() => onNavigate('journey')} aria-label="Continue journey"><Icon name="arrow" size={17} /></button></div>
        </section>

        <section className="verse-card card-surface">
          <div className="card-heading-row"><p className="eyebrow">A verse for today</p><button className={`bookmark-button ${bookmarks.includes('verse-john-1-5') ? 'saved' : ''}`} type="button" onClick={() => toggleBookmark('verse-john-1-5')} aria-label="Save verse"><Icon name="bookmark" size={18} /></button></div>
          <blockquote>“The light shines in the darkness, and the darkness has not overcome it.”</blockquote>
          <div className="verse-footer"><span>John 1:5</span><button type="button" onClick={() => onNavigate('bible')}>Open chapter <Icon name="arrow" size={14} /></button></div>
        </section>
      </div>

      <section className="quick-section"><div className="section-label-row"><div><p className="eyebrow">Continue exploring</p><h2>Where would you like to begin?</h2></div><button className="text-button" type="button" onClick={() => onNavigate('learn')}>View all <Icon name="arrow" size={15} /></button></div><div className="quick-grid">
        <QuickCard icon="sunrise" tone="gold" title="Who is Jesus?" text="Discover His life, teachings, and why He matters." onClick={() => onOpenArticle(articles[0])} />
        <QuickCard icon="dialogue" tone="blue" title="Ask your questions" text="Clear, respectful answers for a thoughtful journey." onClick={() => onNavigate('learn')} />
        <QuickCard icon="sprout" tone="green" title="Faith basics" text="Understand the foundations of Christian faith." onClick={() => onOpenArticle(articles[3])} />
      </div></section>
    </div>
  );
}

function QuickCard({ icon, tone, title, text, onClick }) {
  return <button className="quick-card" type="button" onClick={onClick}><span className={`quick-icon tone-${tone}`}><Icon name={icon} size={21} /></span><span className="quick-card-copy"><strong>{title}</strong><small>{text}</small></span><Icon name="chevron" size={17} /></button>;
}

function Bible({ verses: verseList, books: bookList, location, onChangeLocation, loading, searchTerm, setSearchTerm, bookmarks, toggleBookmark, highlights, toggleHighlight, notes, saveNote, readerPreferences, updateReaderPreference }) {
  const [noteVerseId, setNoteVerseId] = useState(null);
  const [noteDraft, setNoteDraft] = useState('');
  const [copyMessage, setCopyMessage] = useState('');
  const searchRef = useRef(null);
  const fontScale = Math.min(1.3, Math.max(.85, Number(readerPreferences?.fontScale) || 1));
  const tone = readerPreferences?.tone || 'default';
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
  const searchTarget = normalizedSearch && verseList.find((verse) => verse.reference.toLowerCase() === normalizedSearch || `${currentBook.name.toLowerCase()} ${currentChapter}:${verse.number}` === normalizedSearch);
  const searchReference = normalizedSearch.match(/^(.+?)\s+(\d+)(?::(\d+))?$/);
  const searchBook = searchReference && bookList.find((book) => book.name.toLowerCase() === searchReference[1].trim().toLowerCase());
  const searchMatch = Boolean(searchTarget) || Boolean(searchBook && Number(searchReference[2]) === currentChapter && searchBook.id === currentBook.id);

  function submitSearch() {
    if (!searchBook) return;
    const chapter = Number(searchReference[2]);
    if (chapter < 1 || chapter > searchBook.chapterCount) return;
    onChangeLocation({ bookId: searchBook.id, chapter });
  }

  function editNote(verse) {
    const id = stableVerseId(verse);
    setNoteVerseId(id);
    setNoteDraft(notes[id] || '');
  }

  async function copyVerse(verse) {
    const value = `${verse.text} — ${verse.reference}`;
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

  return (
    <div className="bible-page page-enter">
      <SectionIntro eyebrow="Read · Plan · Listen" title="The Bible" description="Read slowly. Ask honestly. Let Scripture meet you where you are." action={<button className="round-icon-button" type="button" aria-label="Bible search" onClick={() => searchRef.current?.focus()}><Icon name="search" /></button>} />
      <div className="reader-layout">
        <section className={`reader-panel reader-tone-${tone}`}>
          <div className="reader-toolbar"><div className="reader-tabs"><button className="reader-tab active" type="button">Read</button><button className="reader-tab" type="button" disabled>Plan</button><button className="reader-tab" type="button" disabled>Audio</button></div><span className="translation-pill">KJV · review <Icon name="chevron" size={14} /></span></div>
          <div className="reader-tools" aria-label="Reading controls"><div className="reader-font-controls"><button type="button" onClick={() => updateReaderPreference('fontScale', Math.max(.85, fontScale - .1))} aria-label="Decrease Bible text size">A−</button><span>{Math.round(fontScale * 100)}%</span><button type="button" onClick={() => updateReaderPreference('fontScale', Math.min(1.3, fontScale + .1))} aria-label="Increase Bible text size">A+</button></div><button className="reader-tone-button" type="button" onClick={() => updateReaderPreference('tone', tone === 'default' ? 'sepia' : tone === 'sepia' ? 'night' : 'default')} aria-label="Change reading tone">{tone === 'default' ? 'Paper' : tone === 'sepia' ? 'Sepia' : 'Low light'}</button>{copyMessage && <span className="copy-status" role="status">{copyMessage}</span>}</div>
          <div className="reference-row"><button className="reference-arrow" type="button" aria-label="Previous chapter" disabled={!previousLocation} onClick={() => previousLocation && onChangeLocation(previousLocation)}><Icon name="back" size={18} /></button><label className="reference-select"><span className="sr-only">Bible book</span><select value={currentBook.id} onChange={(event) => onChangeLocation({ bookId: event.target.value, chapter: 1 })}>{bookList.map((book) => <option key={book.id} value={book.id}>{book.name}</option>)}</select><Icon name="chevron" size={15} /></label><label className="reference-select chapter-select"><span className="sr-only">Bible chapter</span><select value={currentChapter} onChange={(event) => onChangeLocation({ bookId: currentBook.id, chapter: Number(event.target.value) })}>{Array.from({ length: currentBook.chapterCount }, (_, index) => <option key={index + 1} value={index + 1}>Chapter {index + 1}</option>)}</select><Icon name="chevron" size={15} /></label><button className="reference-arrow" type="button" aria-label="Next chapter" disabled={!nextLocation} onClick={() => nextLocation && onChangeLocation(nextLocation)}><Icon name="arrow" size={18} /></button></div>
          <div className="reference-search"><Icon name="search" size={16} /><input ref={searchRef} value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') submitSearch(); }} placeholder="Search a reference, e.g. John 1:1" aria-label="Search Bible reference" />{searchTerm && <button type="button" onClick={() => setSearchTerm('')} aria-label="Clear search"><Icon name="close" size={15} /></button>}</div>
          {searchTerm && <div className={`search-result ${searchMatch ? 'match' : ''}`}>{searchMatch ? `${searchTarget?.reference || `${currentBook.name} ${currentChapter}`} is ready to read.` : 'Try a book and chapter such as “John 1” or a verse such as “John 1:5”. Press Enter to open it.'}</div>}
          <div className="chapter-heading"><span className="chapter-kicker">{currentBook.name}</span><h2>{currentBook.name} {currentChapter}</h2><span className="chapter-subtitle">{currentBook.id === 'JHN' && currentChapter === 1 ? 'The Word Became Flesh' : 'Read this chapter slowly'}</span></div>
          {loading ? <div className="reader-loading" role="status"><span className="loading-dot" /> Loading {currentBook.name} {currentChapter}…</div> : <div className="verse-list">{verseList.map((verse) => {
            const id = stableVerseId(verse);
            const saved = bookmarks.includes(id);
            const highlighted = highlights.includes(id);
            const noted = Boolean(notes[id]);
            const targeted = searchTarget?.number === verse.number;
            return <div className="verse-entry" key={`${verse.bookId || currentBook.id}-${verse.chapter || currentChapter}-${verse.number}`}><div className={`verse-row ${verse.reference === 'John 1:5' ? 'verse-highlight' : ''} ${highlighted ? 'verse-user-highlight' : ''} ${targeted ? 'verse-search-target' : ''}`}><span className="verse-number">{verse.number}</span><p style={{ fontSize: `${17 * fontScale}px` }}>{verse.text}</p><div className="verse-actions"><button className={`verse-action ${saved ? 'saved' : ''}`} type="button" onClick={() => toggleBookmark(id)} aria-label={`${saved ? 'Remove' : 'Save'} ${verse.reference}`} aria-pressed={saved}><Icon name="bookmark" size={15} /></button><button className={`verse-action ${highlighted ? 'active' : ''}`} type="button" onClick={() => toggleHighlight(id)} aria-label={`${highlighted ? 'Remove' : 'Add'} highlight to ${verse.reference}`} aria-pressed={highlighted}><Icon name="sun" size={15} /></button><button className={`verse-action ${noted ? 'noted' : ''}`} type="button" onClick={() => editNote(verse)} aria-label={`${noted ? 'Edit' : 'Add'} note for ${verse.reference}`}><Icon name="dialogue" size={15} /></button></div></div>{noteVerseId === id && <div className="verse-note-editor"><label htmlFor={`note-${verse.number}`}>Private note for {verse.reference}</label><textarea id={`note-${verse.number}`} value={noteDraft} onChange={(event) => setNoteDraft(event.target.value)} placeholder="Write a thought to return to…" rows="3" /><div><button className="text-button subtle" type="button" onClick={() => setNoteVerseId(null)}>Cancel</button><button className="primary-button" type="button" onClick={() => { saveNote(id, noteDraft); setNoteVerseId(null); }}>Save note</button></div></div>}</div>;
          })}</div>}
          <p className="content-note">KJV corpus from the local Data source · translation licensing and attribution review required before public release.</p>
        </section>
        <aside className="reader-side-panel"><div className="side-quote"><Icon name="sparkles" size={22} /><p>{currentBook.id === 'JHN' && currentChapter === 1 ? '“The light shines in the darkness.”' : '“Your word is a lamp unto my feet.”'}</p><span>{currentBook.id === 'JHN' && currentChapter === 1 ? 'John 1:5' : `${currentBook.name} ${currentChapter}`}</span></div><div className="study-card"><p className="eyebrow">Study tools</p>{verseList[0] && <><button type="button" onClick={() => toggleBookmark(stableVerseId(verseList[0]))}><Icon name="bookmark" size={17} /> {bookmarks.includes(stableVerseId(verseList[0])) ? 'Remove saved passage' : 'Save a passage'} <span>Local</span></button><button type="button" onClick={() => editNote(verseList[0])}><Icon name="dialogue" size={17} /> Add a private note <span>Local</span></button><button type="button" onClick={() => copyVerse(verseList[0])}><Icon name="scroll" size={17} /> Copy {verseList[0].reference} <span>Device</span></button></>}<button type="button" disabled><Icon name="learn" size={17} /> Compare translations <span>Later</span></button></div></aside>
      </div>
    </div>
  );
}

function Learn({ articles: articleList, onOpenArticle }) {
  const [category, setCategory] = useState('All');
  const [query, setQuery] = useState('');
  const searchRef = useRef(null);
  const categories = ['All', 'Jesus', 'Questions', 'Bible', 'Foundations', 'Practice', 'Life'];
  const normalizedQuery = query.trim().toLowerCase();
  const filteredArticles = articleList.filter((article) => {
    const categoryMatches = category === 'All' || article.category === category;
    const queryMatches = !normalizedQuery || `${article.title} ${article.summary} ${article.category}`.toLowerCase().includes(normalizedQuery);
    return categoryMatches && queryMatches;
  });
  return <div className="learn-page page-enter"><SectionIntro eyebrow="Learn & explore" title="Questions welcome here." description="Clear answers, Scripture first, and room to think at your own pace." action={<button className="round-icon-button" type="button" aria-label="Search learning library" onClick={() => searchRef.current?.focus()}><Icon name="search" /></button>} /><div className="reference-search learn-search"><Icon name="search" size={16} /><input ref={searchRef} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search lessons and questions" aria-label="Search lessons and questions" />{query && <button type="button" onClick={() => setQuery('')} aria-label="Clear learning search"><Icon name="close" size={15} /></button>}</div><div className="category-pills">{categories.map((option) => <button className={`category-pill ${category === option ? 'active' : ''}`} type="button" key={option} onClick={() => setCategory(option)}>{option}</button>)}</div>{filteredArticles.length > 0 ? <div className="article-grid">{filteredArticles.map((article) => <ArticleCard key={article.id} article={article} onOpen={() => onOpenArticle(article)} />)}</div> : <EmptyState icon="search" title="No lessons found" text="Try another search or choose a different topic." />}</div>;
}

function ArticleCard({ article, onOpen }) {
  return <article className="article-card card-surface"><button className={`article-art tone-${article.tone}`} type="button" onClick={onOpen} aria-label={`Open ${article.title}`}><Icon name={article.icon} size={31} /></button><div className="article-card-body"><p className="card-category">{article.category}</p><h3>{article.title}</h3><p>{article.summary}</p><div className="article-meta"><span>{article.readTime}</span><button type="button" onClick={onOpen}>Read <Icon name="arrow" size={14} /></button></div></div></article>;
}

function ArticleDetail({ article, onBack, bookmarks, toggleBookmark, navigate }) {
  return <div className="article-detail page-enter"><button className="back-button" type="button" onClick={onBack}><Icon name="back" size={17} /> Back to Learn</button><div className="detail-layout"><article className="detail-article"><div className={`detail-hero tone-${article.tone}`}><Icon name={article.icon} size={46} /><span>{article.category}</span></div><p className="eyebrow">{article.readTime} · Prototype content</p><h1>{article.title}</h1><p className="detail-lede">{article.summary}</p>{article.body.map((paragraph) => <p className="detail-paragraph" key={paragraph}>{paragraph}</p>)}<div className="references-box"><p className="eyebrow">Scripture to explore</p><div>{article.references.map((reference) => <button key={reference} type="button" onClick={() => navigate('bible')}>{reference} <Icon name="arrow" size={14} /></button>)}</div></div></article><aside className="detail-actions"><button className={`save-detail-button ${bookmarks.includes(`article-${article.id}`) ? 'saved' : ''}`} type="button" onClick={() => toggleBookmark(`article-${article.id}`)}><Icon name="bookmark" size={18} /> {bookmarks.includes(`article-${article.id}`) ? 'Saved locally' : 'Save for later'}</button><div className="detail-safety"><Icon name="lock" size={17} /><p><strong>Private by design</strong><span>Your saved items stay on this device in the prototype.</span></p></div></aside></div></div>;
}

function Journey({ completedLessons, toggleLesson, onNavigate }) {
  const progress = Math.round((completedLessons.length / lessons.length) * 100);
  return <div className="journey-page page-enter"><SectionIntro eyebrow="Your journey" title="Steps toward the light." description="A guided path from curiosity to faith, at your own pace." action={<span className="journey-count">{completedLessons.length} of {lessons.length}</span>} /><div className="journey-layout"><section className="journey-card card-surface"><div className="journey-progress-head"><span>Journey progress</span><strong>{progress}%</strong></div><div className="progress-track large"><span style={{ width: `${Math.max(progress, 14)}%` }} /></div><div className="journey-list">{lessons.map((lesson) => <JourneyStep key={lesson.id} lesson={lesson} complete={completedLessons.includes(lesson.id)} onToggle={() => toggleLesson(lesson.id)} onOpen={() => lesson.id === 2 ? onNavigate('bible') : undefined} />)}</div></section><aside className="journey-aside"><div className="journey-quote"><span className="quote-mark">“</span><p>You are not asked to have every answer before you begin.</p><span className="quote-source">A gentle pace is still progress.</span></div><div className="next-step-card"><p className="eyebrow">Up next</p><h3>Read the Gospel of John</h3><p>Start with John 1 and notice what the text says about Jesus.</p><button className="primary-button" type="button" onClick={() => onNavigate('bible')}>Open John 1 <Icon name="arrow" size={16} /></button></div></aside></div></div>;
}

function JourneyStep({ lesson, complete, onToggle, onOpen }) {
  const locked = lesson.status === 'locked' && !complete;
  return <div className={`journey-step ${complete ? 'complete' : ''} ${lesson.status === 'current' ? 'current' : ''} ${locked ? 'locked' : ''}`}><button className="step-marker" type="button" onClick={locked ? undefined : onToggle} disabled={locked}>{complete ? <Icon name="check" size={16} /> : <Icon name={locked ? 'lock' : lesson.icon} size={16} />}</button><div className="step-copy"><strong>{lesson.title}</strong><span>{lesson.subtitle}</span></div>{lesson.status === 'current' && <button className="step-action" type="button" onClick={onOpen}>Start <Icon name="arrow" size={14} /></button>}{locked && <span className="step-locked">Soon</span>}</div>;
}

function Saved({ verses: verseList, bookmarks, toggleBookmark, onOpenArticle, navigate }) {
  const savedArticles = articles.filter((article) => bookmarks.includes(`article-${article.id}`));
  const savedVerses = verseList.filter((verse) => bookmarks.includes(stableVerseId(verse)));
  return <div className="saved-page page-enter"><SectionIntro eyebrow="Your library" title="Saved for later." description="Your bookmarks stay on this device in the prototype." /><div className="saved-summary"><div><span className="summary-number">{bookmarks.length}</span><span>saved items</span></div><div><span className="summary-number">{savedArticles.length}</span><span>articles</span></div><div><span className="summary-number">{savedVerses.length}</span><span>passages</span></div></div>{savedArticles.length > 0 && <section className="saved-section"><div className="section-label-row"><div><p className="eyebrow">Articles</p><h2>Keep exploring</h2></div></div><div className="article-grid compact">{savedArticles.map((article) => <ArticleCard key={article.id} article={article} onOpen={() => onOpenArticle(article)} />)}</div></section>}<section className="saved-section"><div className="section-label-row"><div><p className="eyebrow">Bible passages</p><h2>Words to return to</h2></div></div>{savedVerses.length > 0 ? <div className="saved-verse-list">{savedVerses.map((verse) => <div className="saved-verse" key={stableVerseId(verse)}><span>{verse.reference}</span><p>{verse.text}</p><button type="button" onClick={() => toggleBookmark(stableVerseId(verse))} aria-label="Remove saved passage"><Icon name="close" size={15} /></button></div>)}</div> : <EmptyState icon="bookmark" title="Nothing saved yet" text="Bookmark a verse or article and it will appear here." action={<button className="text-button" type="button" onClick={() => navigate('bible')}>Open the Bible <Icon name="arrow" size={15} /></button>} />}</section></div>;
}

function EmptyState({ icon, title, text, action }) {
  return <div className="empty-state"><span><Icon name={icon} size={24} /></span><h3>{title}</h3><p>{text}</p>{action}</div>;
}

function Settings({ discreetMode, setDiscreetMode, theme, setTheme, showPrivacyNotice, setShowPrivacyNotice, contentDatabase }) {
  const databaseValue = contentDatabase?.status === 'ready'
    ? `${contentDatabase.sourceAssetCount.toLocaleString()} sources · ${contentDatabase.bibleBookCount || 0} books`
    : contentDatabase?.status === 'loading' ? 'Loading locally' : 'Sample fallback';
  const databaseDescription = contentDatabase?.status === 'ready'
    ? 'Versioned SQLite content database is available offline'
    : contentDatabase?.errorMessage || 'The bundled sample remains available';
  return <div className="settings-page page-enter"><SectionIntro eyebrow="Safe & private" title="Settings" description="You are in control of what this app remembers and reveals." /><div className="settings-layout"><section className="settings-main"><div className="discreet-card"><div className="discreet-icon"><Icon name="shield" size={28} /></div><div className="setting-copy"><div className="setting-title-row"><h2>Discreet Mode</h2><Toggle checked={discreetMode} onChange={() => setDiscreetMode(!discreetMode)} /></div><p>Reduces casual discovery by keeping the experience quiet on this device. It cannot guarantee complete privacy.</p><button className="text-button subtle" type="button" onClick={() => setShowPrivacyNotice(true)}>Understand the limits <Icon name="arrow" size={14} /></button></div></div><div className="settings-list"><SettingRow icon="globe" title="Language" value="English" /><div className="setting-row"><span className="setting-row-icon"><Icon name={theme === 'light' ? 'sun' : 'moon'} size={18} /></span><span className="setting-row-copy"><strong>App appearance</strong><small>Choose how the app feels at night</small></span><div className="appearance-toggle"><button className={theme === 'light' ? 'selected' : ''} type="button" onClick={() => setTheme('light')}><Icon name="sun" size={15} /> Light</button><button className={theme === 'dark' ? 'selected' : ''} type="button" onClick={() => setTheme('dark')}><Icon name="moon" size={15} /> Dark</button></div></div><SettingRow icon="lock" title="Privacy & security" value="Local only" /><SettingRow icon="database" title="Offline content database" value={databaseValue} description={databaseDescription} /><SettingRow icon="bell" title="Notifications" value="Quiet by default" /><SettingRow icon="info" title="About this prototype" value={`v${APP_VERSION}`} /></div></section><aside className="settings-aside"><div className="not-alone-card"><div className="cross-circle"><Icon name="cross" size={36} /></div><p>You are not alone.<br />There is hope.</p><em>Jesus loves you.</em></div><div className="prototype-note"><Icon name="info" size={17} /><p><strong>Prototype boundary</strong><span>Saved state uses local browser storage. No account, sync, analytics, or remote content is connected.</span></p></div></aside></div>{showPrivacyNotice && <PrivacyNotice onClose={() => setShowPrivacyNotice(false)} />}</div>;
}

function SettingRow({ icon, title, value, description }) {
  return <button className="setting-row" type="button"><span className="setting-row-icon"><Icon name={icon} size={18} /></span><span className="setting-row-copy"><strong>{title}</strong><small>{description || (title === 'Privacy & security' ? 'Bookmarks and progress remain on this device' : 'Available in a future build')}</small></span><span className="setting-value">{value}</span><Icon name="chevron" size={16} /></button>;
}

function Toggle({ checked, onChange }) {
  return <button className={`toggle ${checked ? 'on' : ''}`} type="button" role="switch" aria-checked={checked} onClick={onChange}><span /></button>;
}

function PrivacyNotice({ onClose }) {
  return <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><section className="privacy-modal" role="dialog" aria-modal="true" aria-labelledby="privacy-title"><button className="modal-close" type="button" onClick={onClose} aria-label="Close privacy notice"><Icon name="close" size={18} /></button><div className="modal-icon"><Icon name="shield" size={24} /></div><p className="eyebrow">A clear promise</p><h2 id="privacy-title">What Discreet Mode can do</h2><p>It keeps this prototype local, quiet, and free from accounts or analytics. It can reduce casual discovery on the device.</p><p>It cannot erase every system record or protect you from someone who has your device access, device PIN, backups, screenshots, or a compromised device.</p><button className="primary-button" type="button" onClick={onClose}>I understand <Icon name="check" size={16} /></button></section></div>;
}

export default App;
