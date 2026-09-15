export const LEGAL_APP_INFO = {
  productName: 'From Islam to Christ',
  creatorName: 'MCOGraphics',
  repositoryLabel: 'mcographics/FromIslamtoChrist',
  repositoryUrl: 'https://github.com/mcographics/FromIslamtoChrist',
  reviewDate: '2026-09-14',
};

export const LEGAL_TERMS_SECTIONS = [
  {
    title: 'What this app is',
    paragraphs: [
      'From Islam to Christ is an independent, local-first Bible study and Christian educational prototype. It is designed to help a person read Scripture, explore questions about Jesus, and save private study progress on their device.',
      'The app expresses a Christian perspective and is intended to invite honest reading and reflection. It is not a church, denomination, government service, emergency service, legal service, medical service, or professional counseling service.',
    ],
  },
  {
    title: 'Your responsibility',
    paragraphs: [
      'Use the app voluntarily and apply your own judgment. Verify important claims against primary texts and trustworthy independent sources. The educational drafts are not a promise that every theological, historical, linguistic, Quranic, or biblical claim has been independently approved.',
      'If exploring Christianity could expose you to family, social, housing, employment, legal, or physical danger, consider your circumstances before taking any public step. Seek qualified local safety support or trusted in-person counsel when needed. Do not rely on this app for urgent protection.',
    ],
  },
  {
    title: 'Local data and privacy limits',
    paragraphs: [
      'The prototype does not require an account and has no connected reading-history, advertising, or analytics service. Bookmarks, notes, reflections, progress, preferences, and downloaded study guides are designed to remain in local app storage. Android backup and device-transfer rules exclude the app state where the operating system honors those rules.',
      'Local storage is not encryption. A device owner, administrator, forensic tool, screenshot, clipboard, backup, or another application with access may still expose information. Discreet Mode, the optional PIN, biometrics, quick close, and Offline-only mode reduce selected risks but do not guarantee secrecy.',
    ],
  },
  {
    title: 'Online services and updates',
    paragraphs: [
      'When Offline-only mode is disabled, the app may contact the public GitHub Releases API to check for updates. Android release APKs are downloaded into private app storage and handed to Android’s package installer only after you choose Install update. Windows packaged builds use Electron’s updater for the download and require your explicit final install action.',
      'When automatic translation is needed and no cached or bundled translation exists, public interface text may be sent to the configured MyMemory translation endpoint. Private notes, reflections, typed searches, and other protected fields are excluded by the app’s translation boundary. Translation quality, availability, and external-service terms are outside the app’s control.',
    ],
  },
  {
    title: 'Availability and warranty',
    paragraphs: [
      'The prototype is provided for study and evaluation on an “as available” basis. Features, content, translations, device compatibility, update availability, and external services may change or be unavailable. To the extent permitted by applicable law, MCOGraphics makes no promise that the app will be error-free, uninterrupted, secure, complete, or suitable for a particular purpose.',
      'Nothing in this notice removes rights that cannot lawfully be excluded in your place of residence. Before a public or commercial launch, these plain-language terms should be reviewed and replaced or supplemented by qualified legal counsel where appropriate.',
    ],
  },
];

export const LEGAL_RIGHTS_SECTIONS = [
  {
    title: 'Original project work',
    status: 'Project terms',
    paragraphs: [
      'Unless a file or dependency is identified below, the original From Islam to Christ source code, user interface, product name, logo treatment, project artwork, educational organization, and original writing are project work maintained by MCOGraphics. Viewing and using the prototype does not grant permission to copy, repackage, publish, sell, or create a confusingly similar product.',
      'The repository is the authoritative place for the current source, release tags, change history, and any future project license. A GitHub repository location is not, by itself, a license grant for the app or its data.',
    ],
    links: [{ label: 'Open the project repository', url: LEGAL_APP_INFO.repositoryUrl }],
  },
  {
    title: 'Bible and educational content',
    status: 'Review required',
    paragraphs: [
      'The runtime database contains Bible text variants, Strong’s-linked material, educational summaries, and study metadata normalized from local research inputs. Several source families are still marked needs-review or source-notice in the app. They are included for this private prototype’s study and engineering review, not as a blanket permission to redistribute the raw files or derived runtime output.',
      'Do not extract, resell, mirror, publish, or include the bundled text and research data in another product until the exact edition, source, rights holder, terms, notices, and any derived-data restrictions have been confirmed. The app’s Sources & attribution card and Source Library expose the current review status.',
    ],
  },
  {
    title: 'Known third-party data boundaries',
    status: 'Attribution recorded; clearance varies',
    paragraphs: [
      'BHSA identifies the Eep Talstra Centre for Bible and Computer and VU University Amsterdam, is described locally as CC BY-NC 4.0, and requests attribution using DOI 10.17026/dans-z6y-skyh. Its repository also contains a separate MIT notice for software; that software notice does not automatically change the data terms.',
      'BHS-Strong-no documents Biblia Hebraica Stuttgartensia text and ETCBC annotations, references Deutsche Bibelgesellschaft copyright, OpenHebrewBible, BibleBento, Open Scriptures, and Tyndale material, and includes a GPLv3 license file. These mixed text, annotation, mapping, and software notices must be kept separate and reviewed before redistribution.',
      'N1904 is associated with CenterBLC and ETCBC and has a local MIT notice, but its own documentation identifies upstream Nestle 1904, MACULA syntax, Berean Study Bible glosses, MARBLE/Louw-Nida semantic data, and other layers. The MIT notice is not treated as automatic clearance for every upstream layer.',
      'The scraped KJV/Strong’s material, Greek Strong’s dictionary, Vine’s entries, the translation DOCX files, and the supplied Facts & Info manuscripts still require exact provenance, permission, attribution, and editorial review in the current manifest.',
    ],
  },
  {
    title: 'What “rights usage” means here',
    status: 'Plain-language summary',
    paragraphs: [
      'You may use the installed prototype for personal study and testing within the limits of applicable law and the notices attached to each source. You may quote or share material only when you have an independent legal basis to do so and preserve the required attribution. You may not assume that a source is public domain because it is old, searchable, available on GitHub, or included in this prototype.',
      'If you own or control a source included in the app and want its rights record corrected, use the project repository to provide the exact file path, edition, license or permission, required credit, and any restrictions. Until verified, the app will continue to show the item as pending review.',
    ],
    links: [{ label: 'View the project content review report', url: 'https://github.com/mcographics/FromIslamtoChrist/blob/main/Documentation/CONTENT_REVIEW_REPORT.md' }],
  },
];

export const LEGAL_SOURCE_CREDITS = [
  {
    name: 'BHSA — Hebrew Bible research data',
    credit: 'Eep Talstra Centre for Bible and Computer (ETCBC), VU University Amsterdam; repository author credit includes Dirk Roorda.',
    terms: 'Local documentation identifies CC BY-NC 4.0 for the data and requests DOI 10.17026/dans-z6y-skyh. Review required for the exact runtime layer.',
    links: [
      { label: 'GitHub', url: 'https://github.com/ETCBC/bhsa' },
      { label: 'CC BY-NC 4.0', url: 'https://creativecommons.org/licenses/by-nc/4.0/' },
      { label: 'DOI', url: 'https://doi.org/10.17026/dans-z6y-skyh' },
    ],
  },
  {
    name: 'N1904 — Nestle 1904 Greek New Testament Text-Fabric data',
    credit: 'Center of Biblical Languages and Computing (CBLC) and the ETCBC/N1904 conversion project; local documentation credits Tony Jurg, Saulo de Oliveira Cantanhêde, Oliver Glanz, Diego Santos, Ulrik Sandborg-Petersen, and Jonathan Robie among the documented contributors.',
    terms: 'The repository includes an MIT notice, while the documentation identifies multiple upstream text, syntax, gloss, and semantic layers. The combined runtime output remains pending layer-by-layer review.',
    links: [
      { label: 'GitHub', url: 'https://github.com/CenterBLC/N1904' },
      { label: 'MIT license', url: 'https://opensource.org/license/mit/' },
      { label: 'DOI', url: 'https://doi.org/10.5281/zenodo.13117911' },
    ],
  },
  {
    name: 'BHS-Strong-no — Hebrew Strong’s mapping',
    credit: 'BibleBento / OpenHebrewBible documentation, with references to ETCBC, Deutsche Bibelgesellschaft, Open Scriptures, and Tyndale extended Strong’s material as recorded by the supplied source files.',
    terms: 'The local source set contains mixed copyright, CC BY-NC, and GPLv3 notices. The mapping, Hebrew text, annotations, and software license are not assumed to have one common permission.',
    links: [
      { label: 'OpenHebrewBible GitHub', url: 'https://github.com/eliranwong/OpenHebrewBible' },
      { label: 'Source mapping GitHub', url: 'https://github.com/eliranwong/BHS-Strong-no' },
      { label: 'GPLv3', url: 'https://www.gnu.org/licenses/gpl-3.0.html' },
    ],
  },
  {
    name: 'Strong’s Greek dictionary',
    credit: 'Ulrik Petersen, Strong’s Greek Dictionary in XML, version 1.4 (2007), as identified in the supplied README.',
    terms: 'The supplied README records release history but does not provide a complete redistribution license. Permission and attribution remain pending.',
    links: [],
  },
  {
    name: 'Vine’s and KJV/Strong’s source material',
    credit: 'Vine’s entries and the KJV/Strong’s JSON source are included from the supplied local data set; the KJV/Strong’s README identifies web-scraping and the Vine’s source has no complete adjacent license record in this project.',
    terms: 'Exact source edition, rights holder, permission, and required attribution are pending. The local runtime label is not a redistribution license.',
    links: [],
  },
  {
    name: 'Facts & Info manuscripts',
    credit: 'Supplied manuscripts converted into paraphrased, source-linked educational capsules and guided reading paths by the From Islam to Christ project.',
    terms: 'Author permission, exact citations, Quran and Bible reference checks, historical review, Arabic transliteration review, and final editorial approval are pending. The in-app capsules are marked review-draft.',
    links: [],
  },
];

export const LEGAL_SOFTWARE_CREDITS = [
  { name: 'React and React DOM', detail: 'UI framework; see the dependency metadata and its bundled license.' },
  { name: 'Electron, electron-updater, and electron-builder', detail: 'Windows desktop shell, update delivery, and packaging toolchain.' },
  { name: 'Capacitor and Capacitor Android', detail: 'Android bridge and native application shell.' },
  { name: 'sql.js', detail: 'Local SQLite-compatible runtime database reader.' },
  { name: 'Vite and the React plugin', detail: 'Development and renderer packaging toolchain.' },
  { name: 'Android TextToSpeech and Biometric APIs', detail: 'Platform services used for local read-aloud and optional device authentication.' },
];

export const LEGAL_EXTERNAL_SERVICES = [
  { name: 'GitHub', detail: 'Public release metadata and update assets for the project repository. GitHub is not the owner of this app or its educational content.', url: 'https://github.com' },
  { name: 'MyMemory translation service', detail: 'Used only as an online fallback for public interface text when translation is enabled and no bundled or cached text is available. Availability and output are external to the app.', url: 'https://mymemory.translated.net' },
];
