# From Islam to Christ

Electron + React + Vite prototype for From Islam to Christ, based on `Documentation/plan.md` and `Concept/concept.png`.

The public product name is From Islam to Christ. Existing technical identifiers such as the Android application ID and generated database filename still use `fromdarknesstolight` for compatibility with the current installed app and release pipeline.

## Current public release

The current GitHub release is [From Islam to Christ v0.2.28](https://github.com/mcographics/FromIslamtoChrist/releases/tag/v0.2.28).

- [Windows x64 installer](https://github.com/mcographics/FromIslamtoChrist/releases/download/v0.2.28/From-Islam-to-Christ-0.2.28-x64.exe)
- [Android APK](https://github.com/mcographics/FromIslamtoChrist/releases/download/v0.2.28/From-Islam-to-Christ-0.2.28.apk)

The v0.2.28 Windows installer is packaged but not Authenticode-signed. The Android APK is signed with the matching local Android debug key so it can update the connected development phone without uninstalling the app; it is not Google Play production-signed. The release notes record these limitations, the manual publication, and the open content-rights review gate.

## Current prototype slice

- Home dashboard with the dawn-to-light visual direction and a locally selected daily verse from the full offline Bible corpus
- Private local Bible reading history on Home, with the last chapters available for one-tap return and included in the private-data reset
- One-time welcome onboarding with the product mission, guided-path overview, and plain-language privacy limits; replayable from Settings
- Bible reader with the full 66-book / 31,102-verse KJV corpus currently available in `Data`
- Local book/chapter navigation and reference search for passages such as `John 1` and `John 1:1`
- Bible reader Scripture search for words and phrases across the complete offline KJV corpus, with local verse excerpts and one-tap chapter/verse navigation
- Learn and article detail views
- Guided Journey with seven Scripture-linked lessons, private reflection responses, prayers, progression, and locally persisted progress
- Saved items with locally persisted bookmarks, highlights, notes, Journey lessons, and private lesson reflections across the full offline Bible corpus, including direct removal controls, local All/Articles/Bookmarks/Highlights/Notes views, and private themed folders with custom-folder support
- Light and dark modes with a persistent header switch and Settings controls
- Optional local PIN lock with five-minute inactivity locking, Android biometric unlock when supported, screenshot/task-preview protection while Discreet Mode is enabled, and a clear privacy boundary
- One-step deletion of local bookmarks, highlights, notes, saved folders, saved Study Packs, Study Pack checkpoints, Facts & Info checkpoints, Q&A explored progress, downloaded study guides, journey progress, reader preferences, and PIN state
- Responsive Android v0.2.1 layout with constrained controls and no unintended horizontal page panning
- Current local feature build v0.2.28 carries forward the v0.2.27 first-launch decision and safety sequence: a cinematic “YOU MADE THE RIGHT DECISION” screen, an immediate Privacy Protection choice, and a neutral Private space entry on later Discreet Mode launches. The sequence remains first-launch-only unless onboarding is reset from Settings. It also carries the Android-only Quick close app action, bounded local PIN failure throttling, Android backup exclusion, Offline-only network boundary, automatic multilingual UI and translation status, source-aware content review, and the in-app About, Terms & Conditions, Rights & Usage, and Credits record. It retains the v0.2.26 native Android Text-to-Speech fallback for Bible chapters and the educational-library Listen controls, the v0.2.24 Study Pack and Downloads read-aloud flow, the v0.2.23 local read-aloud experience, the v0.2.22 Prayer learning experience, the v0.2.21 Facts & Info reading-purpose tracks, the v0.2.20 Home continuation action, the v0.2.17 curated Jesus-centered offline verse cycle, the v0.2.15 Facts & Info-to-Q&A handoffs and 41-question library, and the v0.2.13 offline Strong’s/Vine’s explorer
- Branded application identity using `logo/icon.png` for the app icon and `logo/logo.png` for desktop and Android splash screens
- Mobile-first Android shell built with Capacitor, including a working phone navigation drawer
- GitHub-linked update checks for Android and Electron; Windows packaged builds use `electron-updater`
- Bible study tools for local highlights, private notes, copy, font sizing, Paper/Sepia/Low-light reading tones, and a verse-level interlinear study panel backed by Strong's-linked Hebrew/Greek metadata
- Bible word study now combines Strong's and Vine's with compact, review-labeled BHSA Hebrew and Nestle 1904 Greek alignment metadata derived from `Data/strongs`; Learn also provides an offline searchable explorer for those indexed entries. The raw source files remain outside the renderer bundle until licensing and content review are complete
- Bible reader text selection for the local English KJV, Bulgarian, Chinese, and Spanish variants, with English fallback when a verse lacks the selected variant, review status kept visible, and a responsive local chapter comparison view
- Settings now provides a persistent 21-language choice with English as the main language: English, Bulgarian, Chinese, Spanish, Arabic, French, German, Portuguese, Turkish, Urdu, Persian, Indonesian, Malay, Bengali, Hindi, Italian, Dutch, Russian, Japanese, Korean, and Swahili. The four bundled Bible editions remain available offline; missing non-English Bible and study text is translated automatically through the online fallback and cached locally. Core navigation labels, public rendered app text, and long-form read-aloud follow the selected language, with a visible translation status while public text is being prepared. Arabic, Persian, and Urdu also switch the document to right-to-left layout. Private notes, reflections, journal entries, typed fields, and typed searches stay on the device and are excluded from translation requests. Android uses its system/default voice for that language, and the app can open Android's voice-language download screen without using the phone browser
- Settings also provides an optional Offline-only mode for high-risk or connection-limited study: it pauses GitHub update checks and uncached automatic translation requests while keeping bundled Bible text, local study content, and cached translations available. The privacy notice explains this as a network boundary, not encryption or a guarantee of complete device secrecy. Delete private data clears the translation cache and resets the setting.
- Bible reader Plan tab linked to the seven-lesson Journey, with direct passage links and locally persisted lesson completion, plus an Audio tab that reads the current chapter aloud through the device’s local speech engine when available
- Learn screen search and topic filtering with local empty states
- Learn includes a content shelf for Christianity 101, Jesus, Muslim-seeker questions, Facts & Info paths, Strong's/Vine's study, source documents, local read-aloud audio, and an honest Soon state for unbundled video; its Research Collections panel also routes to the indexed Facts & Info, Strong's, Vine's, BHS/Hebrew, and NA/Greek source groups with live counts
- Article and Q&A detail pages now recommend three local contextual follow-up readings using shared Scripture references, topic, and source type; selecting one stays inside the app
- Full Q&A detail pages now add a topic-aware “question to carry” prompt before the contextual reading recommendations, keeping the journey thoughtful and Scripture-centered rather than ending at a single answer
- Home includes a private study-focus planner with five Jesus-centered directions, three practical steps per focus, direct article/Bible/Facts & Info/Prayer actions, and local completion state that never leaves the device
- Home also includes five private guided Bible reading plans—John, Luke, Psalms, Romans, and Acts—with 39 chapter readings, progress per plan, and direct links into the offline reader
- Learn also includes thirteen standalone beginner and discipleship guides covering Jesus, the Gospel, salvation, grace, the Cross, prayer, Scripture reading, Bible reliability, faith basics, Christian-Muslim comparison, family safety, baptism, and healthy Christian community
- Learn now includes a dedicated Testimonies in Scripture shelf with six Bible narrative studies, direct passage links, reflection prompts, and a clear boundary that these are Scripture guides rather than invented modern biographies
- Learn now includes five practical offline study packs that combine Bible passages, Muslim-seeker Q&A, Facts & Info paths, articles, prayer, Journey lessons, and Scripture testimonies; packs can be saved privately and exported as locally generated plain-text guides without opening the phone browser
- Downloads now provides a private on-device shelf for generated study guides: read them inside the app, reopen the source Study Pack, export another copy, or remove the guide; this is separate from the native in-app Android APK updater
- Facts & Info guided reading paths have their own dawn research artwork, while the source-library artwork remains reserved for the complete indexed Data catalog
- Each Facts & Info path now remembers its three private reading-section checkpoints, shows a completion percentage, and provides accessible "Mark read" / "Ongoing" controls so research becomes a practical, resumable study step
- Global local search from the header or `Ctrl/⌘+K` across Bible references and verse text, questions, articles, Journey lessons, Study Packs, Facts & Info reading paths, Strong's/Vine's entries, original-language alignments, and the indexed Data library; pack and path results reopen at the correct Learn selection
- 41-question Muslim-seeker Q&A with Quick Answer, Study Answer, Compare, and Scripture Only modes, organized by Jesus, God, Bible, Quran & Islam, and Salvation & Life. New guides cover Jesus as the only way, repentance, the Holy Spirit, Christianity’s Middle Eastern roots, Old Testament practice, prayer to Jesus, original sin, and Christian failure. Facts & Info paths link directly to relevant questions so research can continue into Scripture and a practical response
- A versioned SQLite content database generated from `Data`, cataloguing all 1,566 local assets and carrying the structured Bible corpus
- A Source Library screen that searches and displays every indexed `Data` asset with its path, type, size, group, and review status
- Selecting a source asset now explains its practical role in the app: Facts & Info opens the guided educational surface, Strong's/Vine's opens Bible word study, raw Hebrew/Greek/media/build files remain clearly marked as catalogued research, and top-level Data files are surfaced through a Project sources collection
- Settings includes a Sources & attribution audit, and the build generates a complete license/review manifest for all local Data assets
- Settings includes an in-app About, Terms & Conditions, Rights & Usage, Credits, software/platform credits, external-service notices, and source-by-source GitHub/DOI/license links. It identifies MCOGraphics as the project steward and clearly separates project-owned work, third-party data notices, and content that is still pending permission or editorial review.
- Offline Bible content loaded chapter-by-chapter from the SQLite database, with a checked-in John 1 JSON fallback for development recovery
- Electron window configured with context isolation, no Node integration, and a sandboxed renderer

The Bible text and article content are prototype samples. Translation licensing, attribution, content review, and production privacy hardening remain release gates described in `Documentation/plan.md`.

The full `Data` directory remains outside the renderer bundle. The repeatable build pipeline converts its metadata into `public/data/from-darkness-to-light.db`; the database is the runtime content boundary, while the raw DOCX, lexicon, Hebrew, Greek, Text-Fabric, archive, and other research files remain local conversion inputs. This keeps the prototype fast and avoids treating the presence of a file as permission to redistribute it.

The current source-by-source review is recorded in [`Documentation/CONTENT_REVIEW_REPORT.md`](Documentation/CONTENT_REVIEW_REPORT.md). It confirms what is technically usable in the local prototype and keeps unresolved licensing, attribution, editorial, and pastoral-safety decisions visible before a release.

## Run

```powershell
npm install
npm run dev
```

The development script starts Vite and the Electron shell together. For a production renderer build:

```powershell
npm run build
```

To validate the checked-in SQLite content artifact independently:

```powershell
npm run verify:database
npm run verify:review
npm run verify:audio
npm run verify:accessibility
npm run verify:links
npm run verify:coverage
npm run verify:privacy
npm run verify:updates
npm run verify:legal
npm run verify:art
```

`verify:links` checks every structured Scripture handoff in the local content modules against the actual 66-book Bible index, so article, Q&A, Journey, Faith, Prayer, Facts & Info, Study Pack, and reading-plan links cannot silently point to an unresolved passage.
`verify:coverage` checks that every supplied Facts & Info document is represented by an educational capsule and reading path, and that the Strong’s, Vine’s, BHSA, and N1904 source groups have runtime study rows.

For Android development-only verification, use a Java 21 toolchain and run:

```powershell
npm run android:debug
```

The debug APK is written to `android/app/build/outputs/apk/debug/app-debug.apk` and is not a release artifact. A local release-mode package can be checked with `npm run android:release`; without a configured signing keystore it remains unsigned at `android/app/build/outputs/apk/release/app-release-unsigned.apk`. The tag-driven GitHub workflow signs the release APK from repository secrets and publishes `release/From-Islam-to-Christ-X.Y.Z.apk`. Android update checks query GitHub, download the release APK into the app's private update storage, verify its SHA-256 when GitHub provides a digest, and launch Android's package installer only after the user clicks `Install update`; the phone browser is not used. Android still requires the operating system's installation confirmation and may require the user to allow this app to install packages. Windows packaged builds check GitHub Releases and download updates automatically, while the user controls the final `Install update` action. The v0.2.0 privacy lock is a local access gate, not encryption or a guarantee against device-level access. The v0.2.1 patch tightens the shared mobile layout so the phone viewport stays constrained without unintended horizontal panning.

The public release workflow is tag-driven. Create a `v*` tag after reviewing content and licensing, and GitHub Actions builds the Windows installer and a production-signed Android release APK from repository signing secrets. Each release entry is titled `From Islam to Christ vX.Y.Z` and includes the exact version, release tag, stable channel, and platform fields. The raw `Data` directory remains local research input and is intentionally excluded from the repository and application bundle until each asset has a completed redistribution review.

The current app intentionally has no backend, account, analytics, or remote content connection. The first-run welcome guide is stored locally so it can be completed once, replayed from Settings, or returned to after a private-data reset.
