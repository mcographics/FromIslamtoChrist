# From Islam to Christ — Build Progress

**Progress date:** 2026-09-14
**Repository:** `mcographics/FromIslamtoChrist`  
**Website repository:** `mcographics/mcographics.github.io`  
**Current application version:** `0.2.28`

**Current public release:** [From Islam to Christ v0.2.27](https://github.com/mcographics/FromIslamtoChrist/releases/tag/v0.2.27)

**Latest public release at build start:** [From Islam to Christ v0.2.27](https://github.com/mcographics/FromIslamtoChrist/releases/tag/v0.2.27)

## v0.2.28 build continuation — source, packaging, and release boundary — 2026-09-14

- Advanced the local version boundary to `0.2.28` and Android version code `30` for the newly authorized Windows and Android build.
- The renderer/database build completed three times as part of the Windows and Android commands. Each data-index pass reported 1,566 Data assets, 66 Bible books, 31,102 verses, 14,197 Strong’s entries, 3,369 Vine’s entries, and 12,234 original-language alignments.
- Windows packaging passed with Electron Builder 26.15.3 and Electron 44.3.0. The installer is [`From-Islam-to-Christ-0.2.28-x64.exe`](../release/From-Islam-to-Christ-0.2.28-x64.exe), 154,492,718 bytes, SHA-256 `3C319A9839263B86B2B75BE407B0A7601775C572BCA5842E027DB1D13056F4A4`. `release/latest.yml` reports version `0.2.28`, the same installer size, and the matching updater SHA-512. Windows Authenticode inspection reports `NotSigned`; this is a locally packaged installer, not a code-signed public Windows release.
- Android packaging first stopped because the machine defaulted to Java 26 while this Capacitor build requires Java source level 21. The release build then completed successfully with a portable Temurin 21.0.12.1 JDK kept outside the repository. The resulting release-variant APK is [`From-Islam-to-Christ-0.2.28-release-unsigned.apk`](../release/From-Islam-to-Christ-0.2.28-release-unsigned.apk), 42,230,341 bytes, SHA-256 `F95D2FA24F058CAEEB685A8B831C25EB99A5454DA739074D5D227CF65699FABD`. APK metadata reports package `com.mcographics.fromdarknesstolight`, version code `30`, version name `0.2.28`, compile/target SDK 36, and application label `From Islam to Christ`.
- Android `apksigner verify --verbose` reports `DOES NOT VERIFY` with `Missing META-INF/MANIFEST.MF`, confirming that the local package is release-mode but unsigned. It is intentionally not uploaded to GitHub and cannot be used as an update over the signed public v0.2.27 package. The v0.2.27 public APK was separately confirmed signed with APK v2/v3 for comparison.
- Build warnings recorded for follow-up: the Vite JavaScript bundle is larger than 500 kB after minification, Electron Builder reports a missing package author field, Android reports `flatDir` repository and SDK XML compatibility warnings, and the local Windows installer is unsigned.
- The strict content-rights gate remains unchanged. The current manifest reports 0 of 1,566 local assets cleared, so no public v0.2.28 release will be represented as available until that gate and Android production signing are both resolved.
- App source and documentation were pushed to [`mcographics/FromIslamtoChrist`](https://github.com/mcographics/FromIslamtoChrist/commit/d45df25) at commit `d45df25` on `main`; no `v0.2.28` tag or GitHub binary release was created.
- The companion site was updated and pushed to [`mcographics/mcographics.github.io`](https://github.com/mcographics/mcographics.github.io/commit/1300421) at commit `1300421`. GitHub Pages run [34919377924](https://github.com/mcographics/mcographics.github.io/actions/runs/34919377924) completed successfully.
- Live HTTP verification returned 200 for the homepage, [`From Islam to Christ` project page](https://mcographics.github.io/projects/from-darkness-to-light/), [`v0.2.28 build journal`](https://mcographics.github.io/blog/from-islam-to-christ-v0-2-28-build/), RSS, and sitemap. The live project page exposes the public v0.2.27 links and the v0.2.28 journal; the homepage no longer contains the stale `app-debug.apk` path.

## Unreleased source continuation — multilingual UI and RTL layout — 2026-09-14

- Extended the selected-language foundation so public rendered app text is translated through the in-app automatic translation layer and cached per language. Translation requests exclude private notes, reflections, journal entries, typed searches, custom folder names, and other user-entered private content.
- Added a visible translation status surface for non-English selections, including queued work, partial/offline fallback, and a retry action. Bible chapter verse lists retry through the same control when a translation request was temporarily unavailable.
- Added right-to-left document layout for Arabic, Persian, and Urdu and used locally bundled verse variants directly on Home and Saved passages when available. Non-bundled language text remains honest about its online translation dependency.
- Updated README language and Android artifact guidance to distinguish development debug APKs from release-mode and workflow-signed APKs.
- Source-only validation passed: all 20 JS/JSX files parsed, the changed services passed `node --check`, `git diff --check` passed, the content database verified with 1,566 source assets / 66 books / 31,102 verses, and all 17 required artwork files were present.
- No renderer build, Android package, device installation, GitHub push, or public release was performed for this continuation, in accordance with the current no-build instruction. The license audit remains `0 cleared / 1,566 pending review`.

## v0.2.27 Android Quick close privacy action — 2026-09-14

- Added and registered the native Android `QuickClose` Capacitor bridge. The Settings privacy panel now offers an Android-only Quick close app action that calls `finishAndRemoveTask()` on supported Android versions and falls back to a normal activity finish on older versions.
- Added the first-launch decision screen with the requested exact headline, John 14:6 affirmation, “Your journey begins here.” closing, and illuminated “ENTER THE LIGHT” action. It transitions immediately to a discreet Privacy Protection prompt with “Enable Discreet Mode” and “Not Now” choices. When Discreet Mode is enabled, later launches show a neutral Private space entry until the user intentionally opens the study experience; the PIN lock presentation also avoids Christian branding while locked.
- Kept the privacy boundary explicit: Quick close removes the app task where Android permits it, but it does not delete saved app data, erase screenshots/backups, or guarantee that the operating system leaves no record. Desktop/browser surfaces report that the action is Android-only.
- Version boundary advanced to local application `0.2.27` / Android version code `29` for this privacy workflow slice.
- Renderer validation passed with `npm run build`; Android packaging passed under Temurin Java 21 and produced `android/app/build/outputs/apk/debug/app-debug.apk` at 47,374,296 bytes with SHA-256 `6E625AC885690DDB84D39D1A7763013066D110E80C520F87AEC4D3486E51DCC4`. APK manifest inspection reports package `com.mcographics.fromdarknesstolight`, version code `29`, and version name `0.2.27`. On connected Samsung `SM-G781W` / Android 13 device `RFCRC15568L`, the prior v0.2.22 installation was updated in place with `adb install -r`, which returned `Success`; installed package metadata now reports v0.2.27 and `MainActivity` was confirmed foreground after launch. Visual first-launch click-through and Quick close hardware behavior remain unverified; existing local app data was preserved and not cleared.

## v0.2.26 Native fallback for Bible chapter audio — 2026-09-14

- Extended the native `LocalTextToSpeech` bridge to the Bible chapter Audio reader. When Web Speech is unavailable on Android, the reader now sends the selected verse-to-end or full chapter text to Android’s installed local Text-to-Speech engine.
- Preserved verse-start selection, reading-rate selection, chapter navigation, and honest native Stop/replay behavior. The Web Speech path retains per-verse progress and Pause/Resume.
- Version boundary advanced to local application `0.2.26` / Android version code `28` for this Bible audio reliability slice.
- Renderer validation passed with `npm run build`; Android packaging passed under Temurin Java 21 and produced `android/app/build/outputs/apk/debug/app-debug.apk` at 47,117,756 bytes with SHA-256 `5FECDE0D71EAA7F8555520B61FB6DC6831EE5A19E2F328AECFC65DEF627DF562`. APK manifest inspection reports package `com.mcographics.fromdarknesstolight`, version code `28`, and version name `0.2.26`. Connected-phone installation was attempted, but ADB currently reports no devices, so no installation or runtime claim is made for v0.2.26.

## v0.2.25 Native Android Text-to-Speech fallback — 2026-09-14

- Added and registered the native `LocalTextToSpeech` Capacitor plugin. Educational Listen controls now fall back to Android’s installed local Text-to-Speech engine when the WebView does not expose Web Speech, while keeping playback inside the app and avoiding audio downloads.
- Added per-reading utterance IDs and native state events so only the active reading surface responds to playback updates. Native fallback exposes Stop/replay; Web Speech retains Pause/Resume.
- Version boundary advanced to local application `0.2.25` / Android version code `27` for this Android audio reliability slice.
- Renderer validation passed with `npm run build`; Android packaging passed under Temurin Java 21 and produced `android/app/build/outputs/apk/debug/app-debug.apk` at 47,116,812 bytes with SHA-256 `D39F8758AE9EAA4A1BDA40244A8177BBE2DE31924873924D49C81E03ED60726F`. APK manifest inspection reports package `com.mcographics.fromdarknesstolight`, version code `27`, and version name `0.2.25`. Connected-phone installation was attempted, but ADB currently reports no devices, so no installation or runtime claim is made for v0.2.25.

## v0.2.24 Study Pack and Downloads read-aloud — 2026-09-14

- Extended the reusable local read-aloud control to the five bundled Study Packs and each generated guide reopened from the private Downloads shelf. Users can now read or hear the same guide inside the app without creating or downloading an audio file.
- Reused the existing Study Packs and Downloads section artwork; no new image surface was introduced by this slice.
- Version boundary advanced to local application `0.2.24` / Android version code `26` for this Study Pack and Downloads slice.
- Renderer validation passed with `npm run build`; Android packaging passed under Temurin Java 21 and produced `android/app/build/outputs/apk/debug/app-debug.apk` at 47,113,380 bytes with SHA-256 `A8FAAF1ADE4F45F796241AC3BDEE5E8EEFBE1F16DB85C74E81D7F24935AF21D5`. APK manifest inspection reports package `com.mcographics.fromdarknesstolight`, version code `26`, and version name `0.2.24`. Connected-phone installation was attempted, but ADB currently reports no devices, so no installation or runtime claim is made for v0.2.24.

## v0.2.23 Local read-aloud for the educational library — 2026-09-14

- Added a reusable local read-aloud control to Facts & Info reading paths, Muslim-seeker Q&A and source-linked study details, Journey lessons, the 30-day Faith path, and guided prayers. It uses the device/WebView speech engine, supports pause, resume, stop, and replay, and does not download or stream audio files.
- Kept the unavailable state explicit when a device or WebView does not expose a speech engine; the complete educational content remains readable offline.
- Version boundary advanced to local application `0.2.23` / Android version code `25` for this local audio slice.
- Renderer validation passed with `npm run build`; the database, artwork, license-audit, prayer-content, and whitespace checks remain clean. Android packaging passed under Temurin Java 21 and produced `android/app/build/outputs/apk/debug/app-debug.apk` at 47,113,308 bytes with SHA-256 `F342E56A7F433089F30C33013F15BCBBD35EE2FF68ED20F8F08D6BC1A226C91B`. APK manifest inspection reports package `com.mcographics.fromdarknesstolight`, version code `25`, and version name `0.2.23`. Connected-phone installation was attempted, but ADB currently reports no devices, so no installation or runtime claim is made for v0.2.23.

## v0.2.22 Prayer learning and guided prompts — 2026-09-14

- Added a four-step “Learn to pray” guide: speak honestly, ask for help, listen in Scripture, and take one faithful step. Each step opens its linked passage in the in-app Bible reader.
- Expanded guided prayer from seven to eleven prompts with forgiveness, forgiving others, gratitude for mercy, and reading Scripture added. All prompts remain local and can be placed into the private journal without requiring an account or external service.
- Version boundary advanced to local application `0.2.22` / Android version code `24` for this Prayer slice.
- Android validation passed with `npm run android:debug` under Temurin Java 21; Vite transformed 51 modules and the Android Gradle build completed successfully. The resulting 47,111,708-byte APK installed successfully over the connected package with ADB and reported version code `24`, version name `0.2.22`, and last update time `2026-09-14 12:45:54`. Latest local Android APK SHA-256: `ED3313FBF7945ED468EE4AD92A8F86E8492BE4B53CBAF70F1EE49D29DD3385FC`.

## v0.2.21 Facts & Info reading-purpose tracks — 2026-09-14

- Divided the eight Facts & Info educational paths by reading purpose: **Start with Jesus**, **Examine the claims**, **Respond and grow**, and **Read responsibly**. The user can filter the path shelf before selecting an individual study.
- Preserved each path’s source-document links, Scripture trail, related Muslim-seeker questions, and private three-section progress. The new purpose labels are editorial navigation metadata; they do not alter the supplied source documents or present unreviewed raw files as app content.
- Version boundary advanced to local application `0.2.21` / Android version code `23` for this Facts & Info navigation slice.
- Android validation passed with `npm run android:debug` under Temurin Java 21; Vite transformed 51 modules and the Android Gradle build completed successfully. The resulting 47,110,180-byte APK installed successfully over the connected package with ADB and reported version code `23`, version name `0.2.21`, and last update time `2026-09-14 12:36:38`. Latest local Android APK SHA-256: `FC608629B19093BAA7E36D90DF136F1FD82C03CAB49098CF2DE04E58A44AFB52`.

## v0.2.20 Home journey continuation — 2026-09-14

- Completed the Home welcome-card continuation requirement by adding a second local action for the next available Journey lesson. It opens the selected lesson directly in the Journey detail view, while the existing action continues the user’s Bible reading location.
- When all seven Journey lessons are complete, the same action becomes a review shortcut for the final lesson and its private reflections.
- Version boundary advanced to local application `0.2.20` / Android version code `22` for this Home navigation slice.
- Android validation passed with `npm run android:debug` under Temurin Java 21; Vite transformed 51 modules and the Android Gradle build completed successfully. The resulting 47,109,676-byte APK installed successfully over the connected package with ADB and reported version code `22`, version name `0.2.20`, and last update time `2026-09-14 12:30:40`. Latest local Android APK SHA-256: `2BD01F73940845604EBCADE4683152B7A79F316CF94FD1737B8F6E83BFF835BB`.

## v0.2.19 Home Verse of the Day explanations — 2026-09-14

- Added a local reflection layer for every reference in the curated 32-day Verse of the Day cycle. Each Home verse now includes a short, readable “why it matters” explanation that connects the passage to Jesus, grace, hope, repentance, prayer, or a practical next step.
- Kept the reflection content separate from the Bible text and loaded it by exact reference, so the Scripture remains database-backed and the explanatory layer can be reviewed independently. Unknown future references use a neutral contextual fallback.
- Version boundary advanced to local application `0.2.19` / Android version code `21` for this Home education slice.
- Android validation passed with `npm run android:debug` under Temurin Java 21; Vite transformed 51 modules and the Android Gradle build completed successfully. The resulting 47,109,284-byte APK installed successfully over the connected package with ADB and reported version code `21`, version name `0.2.19`, and last update time `2026-09-14 12:23:46`. Latest local Android APK SHA-256: `5FB43959333FE283749D771252FFFD7F0FB36FCEC238B41A59EC348A89DB385A`.

## Purpose of this record

This is a progress handoff for the work completed so far. It is separate from the product plan in [`plan.md`](./plan.md) and the platform/release rules in [`ANDROID_AND_RELEASE.md`](./ANDROID_AND_RELEASE.md).

The supplied `fromislamtochrist.png` file was treated as a visual asset and replacement request. It did not contain additional implementation instructions. The supplied image was preserved byte-for-byte and used as the website’s Release 01 artwork.

## v0.2.16 Local daily verse — 2026-09-14

- Replaced the hard-coded Home John 1:5 card with a deterministic daily verse loaded from the complete local KJV corpus in SQLite. The selection is stable for a calendar day, changes without a network request, and falls back to John 1:5 only if the database cannot be read.
- The daily verse uses the shared stable verse ID, so Save verse works with the existing Saved/Bookmarks surface. Open today’s verse now hands the exact reference to the shared in-app Bible reader instead of merely navigating to the reader default.
- Version boundary advanced to local application `0.2.16` / Android version code `18` for this initial Home and Bible data slice.

## v0.2.17 Mission-aligned daily verse refinement — 2026-09-14

- Refined the daily verse selection to use a curated 32-reference Jesus-centered cycle, still resolved from the local KJV SQLite database. This avoids presenting an arbitrary genealogy or context-heavy verse as the Home invitation while retaining deterministic offline behavior and full database-backed text.
- Verified all 32 featured references exist in the KJV database. For 2026-09-14, the local cycle selects `John 1:5`.
- Version boundary advanced to local application `0.2.17` / Android version code `19` for this Home refinement.
- Android validation passed with `npm run android:debug`; Vite transformed 50 modules and the Android Gradle build completed successfully. The resulting 47,105,404-byte APK installed successfully over the connected package with ADB and reported version code `19`, version name `0.2.17`, and last update time `2026-09-14 12:06:23`. Latest local Android APK SHA-256: `FF10B55C08BA707CA4B15C55D08399D5978DB469CF4085216DF07DDE5E4562EE`.

## v0.2.18 Home daily-verse actions — 2026-09-14

- Added the planned Home verse actions: save with the shared local bookmark model, share through the device share surface when available, and copy locally when native sharing is unavailable. The exact reference still opens through the in-app Bible resolver.
- Added the shared `share` icon and responsive footer styling so the actions remain visible in light mode and wrap safely on small Android screens.
- Version boundary advanced to local application `0.2.18` / Android version code `20` for this Home interaction slice.
- Android validation passed with `npm run android:debug`; Vite transformed 50 modules and the Android Gradle build completed successfully. The resulting 47,105,932-byte APK installed successfully over the connected package with ADB and reported version code `20`, version name `0.2.18`, and last update time `2026-09-14 12:12:46`. Latest local Android APK SHA-256: `FFE02D67B3CEFAACFB1A21C75883E8047772BC12BEF1E9E32F6DE3816C194A6D`.

## v0.2.15 Facts & Info to Q&A bridge — 2026-09-14

- Expanded the local Muslim-seeker Q&A library from 33 to 41 Scripture-linked guides across God, Jesus, Bible, Quran & Islam, and Salvation & Life. The new guides cover Jesus as the only way, repentance, the Holy Spirit, Christianity’s Middle Eastern roots, Old Testament practice, prayer to Jesus, original sin, and Christian failure.
- Added path-specific question handoffs to all eight Facts & Info reading paths. Each path now presents relevant “Continue with a question” actions after its source chapters and Scripture trail, so the four supplied research documents are used as educational context that leads back to Jesus, in-app Bible reading, and a practical next step.
- Added a review-aware handoff explanation and retained the distinction between the supplied authors’ arguments, primary Scripture, comparative references, and claims requiring subject-matter review.
- Version boundary advanced to local application `0.2.15` / Android version code `17` for this content and navigation slice.
- Android validation passed with `npm run android:debug`; Vite transformed 50 modules and the Android Gradle build completed successfully. The resulting 47,104,828-byte APK installed successfully over the connected package with ADB and reported version code `17`, version name `0.2.15`, and last update time `2026-09-14 11:50:53`. Latest local Android APK SHA-256: `88ACC2BCA22CC451756A39767C7D9E2D81DA81AF31C2FC66D1F967705CBEB10E`.
- Content database validation passed with 1,566 source assets, 66 Bible books, 31,102 verses, 291,919 verse-to-Strong’s links, 14,197 Strong’s entries, 3,369 Vine’s entries, 7,575 Vine’s terms, 6,895 BHSA alignments, 5,339 N1904 alignments, and 1,566 FTS rows. The license audit remains intentionally pending for all 1,566 local source assets (`0 cleared`, `1,566 pending review`). Section artwork validation remains `17/17`.
- The phone was online for installation, but it remains at the secure Android PIN bouncer. Package installation and metadata are verified; visual/click-through QA of the new Learn path handoffs and Q&A cards remains pending until the device is unlocked.

## Product identity and technical foundation

- Public-facing website name: **From Islam to Christ**.
- Public application/product name: **From Islam to Christ**.
- Internal technical identifiers retained for compatibility: the existing Android application ID and runtime database filename still use `fromdarknesstolight` / `from-darkness-to-light`.
- Windows application: Electron 44, React 19, Vite 6, and `electron-builder`.
- Android application: Capacitor 8 wrapping the shared React/Vite renderer.
- Android application ID: `com.mcographics.fromdarknesstolight`.
- Android minimum SDK: 24.
- Android compile/target SDK: 36.
- The application is local-first and currently has no account system, backend, analytics, or remote content service.
- The renderer uses Electron context isolation, no Node integration, and a sandboxed renderer.

## Features implemented in the shared application

The Windows and Android builds use the same primary feature set:

- Home dashboard with the dawn-to-light visual direction.
- One-time welcome onboarding with three short steps covering the mission, guided path, offline/local behavior, and privacy limits; replayable from Settings and reset with private data.
- Bible reader with the available 66-book KJV corpus and 31,102 verses.
- Local book/chapter navigation.
- Reference lookup for entries such as `John 1` and `John 1:1`.
- Learn screen with topic filtering and local search.
- Article detail views.
- Guided Journey with seven Scripture-linked lessons, private reflection responses, prayer prompts, progression, and locally persisted progress.
- Saved items with locally persisted bookmarks, highlights, notes, Journey lessons, and private lesson reflections resolved across the full Bible.
- Bible highlights and private notes.
- Copy passage action.
- Reader font-size controls.
- Paper, Sepia, and Low-light reading tones.
- Persistent light mode and dark mode controls in the header and Settings.
- Optional local PIN gate.
- Automatic locking after five minutes without pointer, touch, or keyboard activity.
- Manual **Lock now** action.
- One-step deletion of local bookmarks, highlights, notes, prayer journal entries, Journey progress, Faith path progress, reader preferences, and PIN state.
- Explicit privacy-boundary messaging explaining that the PIN gate is not encryption and cannot protect against operating-system storage access, backups, screenshots, device access, or a compromised device.
- Mobile navigation drawer for the Android phone shell.
- Dedicated section artwork on the Bible, Learn, Journey, Saved, Source Library, and Settings screens, with accessible alt text and responsive phone sizing.
- Home shortcut into the research library, plus data-driven collection cards for Strong's, Vine's, Facts & Info, BHS/Hebrew, and NA/Greek.
- Bible word-study panel that resolves the current chapter's Strong's numbers to local Greek/Hebrew lexicon entries and linked Vine's references.
- Tappable Word Study entries with original-language details, transliteration, meaning, Vine's context, occurrence counts, and the first five related KJV verses; selecting a related verse opens its chapter in the reader.
- The Bible reader now exposes the local text variants carried in the normalized verse rows: English KJV, Bulgarian, Chinese, and Spanish. Selection is stored with reader preferences, copied verse text follows the selected variant, and missing variant rows fall back to English instead of rendering blank Scripture.
- Bible reader Passage connections now surface nearby chapters that share indexed Strong's terms, with in-reader navigation and an explicit note that these are lexical discovery aids rather than editorially curated cross-references.
- Four source-linked `Facts & Info` study capsules in Learn, covering Allah/ilah and biblical identity, Jesus and the True God, the biblical test of a prophet, and the cumulative case for Christ; each capsule separates the supplied author's argument, Scripture trail, comparative sources, further reading, and required review.
- Eight purpose-led `Facts & Info` reading paths in Learn now turn those four supplied studies into practical, bite-sized journeys: identity, one God and the Trinity, the portrait of Jesus, the Cross and resurrection, Bible trust, testing prophetic claims, mercy/atonement/new life, and careful study. Each path has an introduction, three readable sections, source-chapter traceability, and Scripture buttons that open the selected passage inside the app.
- Each `Facts & Info` path now has path-specific “Continue with a question” actions that open relevant Muslim-seeker Q&As inside Learn. This keeps the supplied research useful as educational context while giving the reader a clear transition back to Jesus, Scripture, and a practical next step.
- Private Prayer section with seven guided prayer prompts, a local journal, answered/ongoing status, entry deletion, character counting, and inclusion in the private-data reset flow.
- Global local search opened from the header or `Ctrl/⌘+K`, covering Bible references and verse text, questions/articles, Journey lessons, Strong's/Vine's entries, and the indexed Data library; results open their owning in-app surface.
- Full Q&A detail now has four bounded answer modes: Quick Answer, Study Answer, Compare, and Scripture Only. Compare separates the Christian explanation from comparative source entry points and states that those references are not a complete summary of every Muslim belief; Scripture Only keeps the attached Bible trail one tap away in the in-app reader.
- The Muslim-seeker Q&A library now contains 41 Scripture-linked guides across God, Jesus, Bible, Quran & Islam, and Salvation & Life. The latest eight guides cover Jesus as the only way, repentance, the Holy Spirit, Christianity’s Middle Eastern roots, Old Testament practice, prayer to Jesus, original sin, and Christian failure.
- The Q&A shelf now includes private explored markers and a topic-aware progress bar, with progress stored locally and covered by the Delete private data action.
- Saved now resolves bookmarked, highlighted, and noted verses across all 66 books from stable local IDs, so passages do not disappear when the reader changes chapters; selecting one returns to its exact in-app reference.

## Branding and image assets

The requested logo/icon setup is implemented:

- [`logo/icon.png`](../logo/icon.png) is used as the Windows application icon and Android launcher icon source.
- [`logo/logo.png`](../logo/logo.png) is used for the Electron startup window and Android native splash screen.
- [`logo/banner.png`](../logo/banner.png) supplies the application banner artwork.
- The public website continues to use its From Islam to Christ banner artwork for the project page and journal contexts.
- The new supplied website artwork is [`fromislamtochrist.png`](https://mcographics.github.io/projects/fromislamtochrist.png).

### Release 01 artwork replacement

The supplied image replaced the featured homepage Release 01 visual in the website repository:

- Source path: `G:\Website on Github\public\projects\fromislamtochrist.png`
- Website path: `/projects/fromislamtochrist.png`
- Original supplied dimensions: 2040 × 4000 pixels, as provided in the user attachment.
- Local SHA-256 recorded during integration: `FDF22038D8DD397E9F0B54F19CB037780042FFC126AD9EB1012B3315494CB14C`
- The asset was not regenerated, cropped, or replaced with a related image.
- The existing banner remains available for the project-card, project-page, and journal artwork contexts.

### Next build slice: section artwork and research collections

The shared renderer now uses nine generated section images from `public/images/generated/sections/`:

- `bible-study.webp` for Scripture reading and word study.
- `learn-questions.webp` for questions, foundations, and discovery.
- `facts-info-research.webp` for the guided Facts & Info research paths.
- `journey-path.webp` for the guided path toward hope.
- `saved-reflections.webp` for private bookmarks and notes.
- `source-library.webp` for Strong's, Vine's, facts, and information research.
- `privacy-settings.webp` for local privacy and settings.
- `prayer-journal.webp` for guided prayer and private reflection.
- `faith-next-step.webp` for the private first-30-days path with Jesus.

The Source Library collection shortcuts are backed by the SQLite `source_groups` table rather than hardcoded totals. The current indexed counts are Strong's `130`, Vine's `1`, Facts & Info `4`, BHS/Hebrew `1,116`, and NA/Greek `303`. Selecting a collection applies the corresponding source-group filter to the full 1,566-asset catalog.
- A generated content-license manifest now accounts for every Data file with explicit license, attribution, redistribution, notice, reviewer, and review-date fields. The Settings screen exposes the live audit state, while `npm run verify:licenses` audits locally and `node scripts/verify-content-license-manifest.cjs --release` blocks a public release until all packaged assets are cleared.

The Word Study slice now also uses a normalized `bible_verse_strongs` table. The current database contains `291,919` indexed verse-to-Strong's links, so occurrences and related passages are loaded from the local index rather than scanning the raw Bible files in the renderer.

The Passage connections slice uses that same index to group verses outside the current chapter by shared Strong's terms. It is intentionally described as a lexical connection tool until a reviewed editorial cross-reference dataset is added.

The four `Facts & Info` DOCX assets are now represented by source-linked editorial capsule records in [`src/data/facts-info-capsules.js`](../src/data/facts-info-capsules.js). The capsules paraphrase the reviewed source themes and retain the exact source path for traceability; they do not reproduce the full documents.

The new reading layer is defined in [`src/data/facts-info-reading-paths.js`](../src/data/facts-info-reading-paths.js). It groups the material by reading purpose instead of presenting a flat document list, keeps the supplied source arguments clearly framed as study material for review, and links each path back to its source capsule and relevant Bible references. The Learn screen keeps the full source collection available below the guided paths so readers can move from a practical explanation to the underlying material.

The Prayer section content is kept as original app copy in [`src/data/prayer-content.js`](../src/data/prayer-content.js), while journal entries remain device-local and are never written into the bundled content database.

The new Faith section implements the plan's gentle decision/new-believer slice. [`src/data/faith-content.js`](../src/data/faith-content.js) now supplies 30 original first-month prompts with Bible readings, reflection questions, and prayers, covering grace, prayer, Scripture, identity, doubt, safety, Christian community, baptism, healthy leadership, service, suffering, and continued discipleship. Users can begin the path, select a day, open its reading in the local Bible reader, and mark days complete. Start state and completed days are stored under the local `fdl-faith-progress` key and are included in the privacy delete/reset control; the flow does not use countdowns, public commitments, or emotional pressure.

The Learn section now includes 13 curated question-and-answer drafts in [`src/data/muslim-questions.js`](../src/data/muslim-questions.js). They cover common Muslim-seeker questions about Christian monotheism and the Trinity, Jesus' prayer and divinity, crucifixion, Son of God, Bible corruption, the four Gospels, Jesus as prophet, the Gospel, the Cross, salvation by faith, worship, and evaluating Muhammad's prophetic claim. Each question has a short answer, a full study body, Scripture references, comparative Quran/source references, further reading, and an explicit editorial review boundary. Search indexes both the question summary and answer body; the full study view remains separate from the quick-answer library.

The generated artwork and its prompt/route metadata are recorded in [`public/images/generated/assets-manifest.json`](../public/images/generated/assets-manifest.json). This is an implementation slice for the next build; it has not been published as a new GitHub release yet.

### GitHub release metadata correction

The eight published releases from `v0.1.0` through `v0.2.1` were updated in GitHub so each entry now displays the public title **From Islam to Christ vX.Y.Z**, an explicit version, its exact release tag, the stable channel, and its Windows/Android platform scope. Their existing tags and downloadable assets were preserved. The tag-driven workflow in [`.github/workflows/release.yml`](../.github/workflows/release.yml) now emits the same metadata block for future releases.

### Welcome onboarding slice

The first-run experience now opens with a responsive three-step welcome guide in [`src/App.jsx`](../src/App.jsx). It reuses the existing desktop and mobile dawn artwork, explains the app's Bible-centered purpose, introduces the Journey and local content, and states the limits of Discreet Mode without promising complete secrecy. Completing the guide can land on Home or directly in the Bible reader. Its local completion flag is included in the private-data reset flow, and Settings can replay the guide without changing saved study state.

## Data and offline content pipeline

- The local `Data` directory contains the research and conversion inputs and is catalogued by the repeatable data-build script.
- The generated runtime database is [`public/data/from-darkness-to-light.db`](../public/data/from-darkness-to-light.db).
- The catalog currently indexes 1,566 local assets.
- The database carries the 66-book index and the structured 31,102-verse Bible corpus.
- The database carries version `5` of the offline schema, including 291,919 indexed verse-to-Strong's links for occurrence and related-verse lookup.
- The database also carries 14,197 Strong's Greek/Hebrew entries, 3,369 Vine's entries, and 7,575 linked Vine's terms for offline word study.
- The database now also carries 6,895 compact BHSA Hebrew and 5,339 Nestle 1904 Greek alignment records, linked to Strong's numbers for the Bible word-study panel. These records are derived runtime metadata marked `needs-review`; the raw BHS/N1904 source files remain outside the renderer bundle until attribution, licensing, and content review are complete.
- The Bible is loaded chapter-by-chapter from SQLite, with a checked-in John 1 JSON fallback for development recovery.
- Raw DOCX, lexicon, Hebrew, Greek, Text-Fabric, archive, and other research inputs remain outside the renderer bundle.
- The presence of a local research file is not treated as permission to redistribute it. Licensing, attribution, and content review remain required before a production content release.

## Responsive Android work

The v0.2.1 patch addresses the reported unnecessary horizontal panning on phones.

The shared stylesheet was corrected to:

- Constrain `html`, `body`, and `#root` to the viewport width.
- Remove the body-level minimum width that could force overflow.
- Constrain the application shell, main content, and page content in the flex layout.
- Separate vertical scrolling from horizontal overflow handling.
- Wrap the reader toolbar and reader tools on narrow screens.
- Replace fixed-width Bible reference controls with a responsive four-column mobile grid.
- Allow selectors to shrink to the available width and clip long labels without expanding the page.
- Allow verse text and narrow content areas to wrap safely.

The resulting build was compiled and the generated database was independently verified. A real-device visual click-through of every Android screen has not been claimed; the available device evidence is limited to ADB installation/launch checks described below.

## Update behavior

### Windows

- Packaged Windows builds use `electron-updater`.
- The GitHub Releases provider is configured for `mcographics/FromIslamtoChrist`.
- Packaged builds check for updates, download an available Windows installer update, and offer restart-to-install.
- Development runs intentionally report that update checks require a packaged build.

### Android

- The renderer checks the public GitHub Releases API.
- When a newer APK is available, the native `AndroidUpdater` plugin downloads it into the app's private update storage and verifies the GitHub-provided SHA-256 digest when available.
- The user-facing `Install update` action hands the private APK to Android's package installer through the app's `FileProvider`; the phone browser is not used.
- Android still requires the user to approve installation and may require permission for this app to install packages.
- A production Android distribution still requires a stable signing key and a documented distribution choice such as Google Play, managed private distribution, or a signed GitHub release.

## Release history

| Version | Main work | Git reference | Status |
| --- | --- | --- | --- |
| `0.1.0` | Initial GitHub update configuration and Android build foundation | `bb01047` / `v0.1.0` | Published history |
| `0.1.1` | Branded application icons and splash screens | `eaae0d1` / `v0.1.1` | Published history |
| `0.1.2` | Responsive hero artwork for desktop and Android | `dcb3f7d` / `v0.1.2` | Published history |
| `0.1.3` | SQLite content catalog | `12cbc4b` / `v0.1.3` | Published history |
| `0.1.4` | Local Bible study tools and Learn search | `2b077d8` / `v0.1.4` | Published history |
| `0.1.5` | Full offline Bible corpus and chapter navigation | `fe985db` / `v0.1.5` | Published history |
| `0.2.0` | Privacy slice: local PIN, inactivity lock, manual lock, and local-data deletion | `91c394e` / `v0.2.0` | Published release; corrected assets republished |
| `0.2.1` | Responsive Android layout correction and release/website alignment | `8d097af` / `v0.2.1` | Current public release |

## v0.2.1 release evidence

- Application commit: `41acd0b Rename release artifacts to From Islam to Christ`.
- Git tag: `v0.2.1`.
- App repository branch: `main`, pushed to GitHub.
- GitHub Actions workflow: [successful v0.2.1 build](https://github.com/mcographics/FromIslamtoChrist/actions/runs/34797640654).
- Release is public, non-draft, and non-prerelease.
- Public release assets include:
  - Windows installer: `From-Islam-to-Christ-0.2.1-x64.exe`
  - Windows blockmap and `latest.yml`
  - Android APK: `From-Islam-to-Christ-0.2.1.apk`
- Published corrected Android APK SHA-256: `7b3e818c557a283b04f55304ba95f24ded27166837c21b340af4309d1dc95c28`.
- Direct Android download: [v0.2.1 From-Islam-to-Christ APK](https://github.com/mcographics/FromIslamtoChrist/releases/download/v0.2.1/From-Islam-to-Christ-0.2.1.apk).
- The existing public `v0.2.0` release was also replaced with `From-Islam-to-Christ-0.2.0.apk`, `From-Islam-to-Christ-0.2.0-x64.exe`, its blockmap, and a correctly named `latest.yml`.

## Website work and deployment evidence

The website repository was updated and pushed in commit `b23b9c7`:

- Homepage featured Release 01 now uses `fromislamtochrist.png`.
- Homepage release copy now identifies the official Windows and Android v0.2.1 builds.
- Windows and Android download links point to the v0.2.1 release assets.
- The project details page describes the responsive phone-layout correction and links to v0.2.1.
- Repository status metadata was updated to v0.2.1.
- The historical v0.2.0 journal entry was retained rather than rewritten as a different release.
- GitHub Pages workflow: [successful website deployment](https://github.com/mcographics/mcographics.github.io/actions/runs/34798101540).
- Website rendering tests passed: 39/39.
- Live HTTP checks returned 200 for the homepage, project page, historical release journal, and the new PNG asset.

## Verification completed

The following checks passed during this build sequence:

```text
npm run build
npm run verify:database
npm run build:data             # 14,197 Strong's + 3,369 Vine's entries indexed
npm run build:pages              # website repository
node --test tests\rendered-html.test.mjs   # website repository: 39/39
git diff --check
GitHub Actions: app v0.2.1 succeeded
GitHub Actions: website Pages deployment succeeded
```

These checks establish source/build/database/deployment evidence. They do not substitute for full visual QA of every Electron and Android screen, production Android signing, content licensing approval, or a store publication review.

### Latest local build slice — 2026-09-14

- The production renderer build passed after adding section art, research collection shortcuts, offline Strong's/Vine's lookup, tappable occurrence/related-verse details, thirteen standalone beginner and discipleship guides, four source-linked Facts & Info study capsules, eight purpose-led Facts & Info reading paths, the private Prayer section, the initial 13-question Muslim-seeker Q&A library, the controlled Ask a Question finder, four Q&A study modes, the 30-day Faith/new-believer path, the generated content-license manifest, the Settings Sources & attribution audit, the reader text/language selector, the global local search surface, and all-corpus Saved verse resolution. The library is now 21 questions after the v0.2.4 expansion above.
- The Bible reader now turns its former Text variants placeholder into a responsive chapter comparison view for the local English, Bulgarian, Chinese, and Spanish variants, with verse-number alignment, English fallback, local-only messaging, and the same visible review boundary as the primary reader.
- The Bible reader Plan tab is now functional: it reuses the seven Scripture-linked Journey lessons, opens their passages in the reader, shows the next available step, and persists completion through the existing local Journey state. The Audio tab now provides verse-by-verse local text-to-speech playback with pause, resume, stop, starting-verse, speed, voice, and chapter-navigation controls when the device speech engine is available; no audio files or network service are required.
- Learn now includes a dedicated Testimonies in Scripture shelf with six Bible narrative studies— the Samaritan woman, Zacchaeus, Paul, the man born blind, the returning son, and the Ethiopian official—each with a direct passage link, reflection prompt, and explicit wording that it is a Scripture guide rather than an invented modern biography.
- Android Discreet Mode now connects the renderer to a native `PrivacyShield` plugin that applies `FLAG_SECURE` while enabled, requesting screenshot and recent-task preview protection; the in-app privacy notice states the OS and device-access limits instead of promising complete secrecy.
- Android privacy settings now expose optional device biometric unlock through a native `BiometricAuth` bridge on Android 6+; it requires the local app PIN first and keeps the PIN as the fallback. The privacy copy continues to describe this as an access gate rather than encryption.
- Source Library asset details now provide a practical-use explanation for every selected catalog entry: Facts & Info links to guided Learn material, Strong's/Vine's links to the Bible word-study surface, and Hebrew/Greek/media/build inputs remain explicitly catalogued research rather than silently appearing as cleared runtime content.
- Learn now has a content shelf that routes Christianity 101, Jesus studies, Muslim-seeker questions, Facts & Info paths, Strong's/Vine's, source documents, and local read-aloud Audio to their existing surfaces; Video remains visibly Soon because no teaching package is bundled in this offline build.
- Facts & Info paths now use a dedicated generated research banner inside the guided reading panel; the source-library artwork continues to represent the complete indexed Data catalog.
- Home now resumes the locally saved Bible location instead of sending every reader back to John 1; the `verify:art` check confirms the darkness-to-light hero and all fifteen required hero/section images are present and non-empty.
- Saved now provides direct local removal controls for bookmarks, highlights, and private notes, completing the plan’s bookmark/highlight/note management loop without requiring a return to the Bible reader.
- Saved now provides local organization views for All, Articles, Bookmarks, Highlights, and Notes, with counts derived from private on-device state and no account or remote sync.
- Saved now provides five private themed folders—Jesus, Trinity, Bible, Questions, and Family discussions—plus custom folders; saved articles and passages can be assigned or removed in place, and folder state is stored only on the device.
- Journey lesson detail now offers Save lesson, and Saved renders those lessons alongside articles with direct return to the original Journey lesson; the existing local folder assignment controls cover both resource types.
- Journey lesson detail now includes a bounded private reflection response. Reflections persist locally, appear in Saved beside the originating lesson, can be assigned to the same private folders, and are removed by the existing delete-private-data control.
- Bible word study now surfaces the selected Strong's entry's aligned BHSA Hebrew or Nestle 1904 Greek lemma, transliteration where supplied, occurrence count, gloss, and compact morphology. The UI labels the corpus and keeps the review boundary visible so the research data is educational and useful without presenting unreviewed raw source files as cleared content.
- Faith now includes a private testimony builder tied to the New Believer path, with prompts for the seeker’s questions, what they are learning about Jesus, and an honest next step; drafts remain local and can be cleared from the builder or the existing Privacy & settings reset.
- Faith now surfaces the existing Day 17 healthy-community, Day 18 baptism, and Day 22 testimony lessons as direct “When you are ready” next-step cards, so the plan’s discipleship guidance is discoverable without implying pressure or a required sequence.
- Learn now includes a source-backed Research Collections panel for all five indexed groups—Strong’s, Vine’s, Facts & Info, BHS/Hebrew, and NA/Greek—with live asset counts, source-library artwork, and direct review-aware Library routes.
- Article and Muslim-seeker Q&A details now include three locally ranked contextual follow-up readings based on shared Scripture references, topic, question/research type, and source linkage; the recommendations stay inside the app and do not use remote search.
- Home now includes a private personalized study-focus planner with five Jesus-centered directions—Meet Jesus, Understand the Gospel, Trust Scripture, Pray and follow, and Work through questions—each backed by three direct article, Bible, Facts & Info, or Prayer steps with local completion state.
- Home now includes five private guided Bible reading plans—Meet Jesus in John, Hear Jesus in Luke, Pray with the Psalms, Understand grace in Romans, and Watch the witness grow in Acts—with 39 chapter readings, per-plan local progress, direct Bible-reader links, and dedicated reading-plan artwork.
- Shared Bible-reference resolution now treats Psalm/Psalms as the same book name, keeping older article links and the new Psalms plan usable against the full corpus.
- The new study-focus section has dedicated artwork at `public/images/generated/sections/study-focus.webp`; the artwork verifier now covers twelve required hero/section images.
- The Faith day 17 and day 18 detail views now link to dedicated Learn guides for healthy Christian community and baptism, making the Phase 3 discipleship topics searchable and available outside the 30-day path.
- The latest renderer build also includes Bible reader Passage connections derived from the local verse-to-Strong's index; the database verifier and a direct John 1 query both returned cross-chapter lexical connections.
- Bible word study now uses the indexed Strong's numbers to surface 6,895 BHSA Hebrew and 5,339 Nestle 1904 Greek alignment records from the local `Data/strongs` conversion inputs. The compact records show lemma, transliteration where available, gloss, occurrence count, and morphology, while the UI and release docs keep their `needs-review` status visible.
- The Bible reader search now accepts either a reference or a word/phrase query. Text queries use the local SQLite verse index, show excerpts, open the matching chapter, and scroll to the selected verse without using a network service.
- Global search now includes the compact BHSA/N1904 alignment layer by Strong's number, lemma, transliteration, or gloss and routes those results into the matching review-aware source collection.
- The Bible reader now includes a verse-level Interlinear study panel. It presents the selected verse's Strong's-linked rows with language, lemma, transliteration, and gloss, and explicitly distinguishes this study aid from a complete token-by-token interlinear edition.
- Home now keeps a private eight-entry Bible chapter history, with the six most recent chapters available as direct return actions; the history is stored locally and included in Delete local data.
- The Facts & Info mapping check passed for all eight paths, three reading sections per path, four source capsules, and all referenced source files. On-device Learn QA confirmed the path cards, selected-path detail, and mobile layout render on the connected Samsung phone.
- Scripture links from article/Q&A detail and the Faith path now resolve the selected book and chapter through the shared Bible reader location handler instead of merely navigating back to the default John 1 screen; multi-word book names and verse ranges are covered by the resolver check.
- On-device visual QA found and corrected low-contrast inactive bottom-navigation icons and labels in light mode; the mobile navigation now uses high-contrast ink for inactive items, a blue active state, stronger icon strokes, and a visible bar boundary.
- Android `assembleDebug` passed with the user-local Temurin 21 toolchain and the installed Android SDK.
- The latest local APK is 48,826,818 bytes with SHA-256 `27C6F081810254D4AA0CF1FFB39EB84FDDD0DD92FED919EB28C965E9F3845164`.
- APK metadata remains package `com.mcographics.fromdarknesstolight`, version code `3`, version name `0.2.1`, and public label **From Islam to Christ**.
- ADB detected Samsung SM-G781W (`RFCRC15568L`); this APK was installed in place without removing private app data. Package evidence reports version code `3`, version name `0.2.1`, and update time `2026-09-14 08:37:06`. The phone is currently at its secure PIN bouncer, so visual QA of Home resume-reading/history, the Learn content shelf, the dedicated Facts & Info banner, Testimonies in Scripture, 30-day Faith screen, reader text/language selector, chapter comparison view, verse-level Interlinear panel, local Audio/read-aloud controls, Plan tab, Android screenshot/task-preview protection, biometric Settings/lock-screen controls, and Source Library asset-detail guidance on this exact APK remains pending; prior on-device Learn, path-card, and light-mode navigation QA remains recorded above.

## Study-pack slice — 2026-09-14

- Added [`src/data/study-packs.js`](../src/data/study-packs.js) with five curated, purpose-led offline packs: Meet Jesus; Questions about God and Jesus; From evidence to the Gospel; Pray and follow; and Mercy, new life, and courage.
- Each pack reuses existing local app surfaces rather than duplicating content: Bible references resolve through the shared reader, articles and Q&A open in Learn, Facts & Info paths open in their guided reading panel, prayers open in the private Prayer section, and Journey lessons open at the selected lesson.
- Added in-app pack selection, 25 validated resource links, local Save/Remove controls stored in `fdl-saved-study-packs`, Saved-section management, reflection prompts, and explicit review boundaries.
- Added an in-app plain-text guide export for the selected pack. The generated guide is created by the renderer and does not route APK downloads through the phone browser; this is separate from the Android updater, which continues to download APKs into private app storage and hands installation to Android only after the user chooses `Install update`.
- Added generated study-pack artwork at [`public/images/generated/sections/study-packs.png`](../public/images/generated/sections/study-packs.png), copied into the Android web asset bundle, and registered it in [`public/images/generated/assets-manifest.json`](../public/images/generated/assets-manifest.json). The artwork verifier now checks 16 required hero/section images.
- Validation passed: `npm run build` (50 Vite modules), `npm run verify:art` (16/16), study-pack reference validation (5 packs / 25 resources), JSON manifest validation, `git diff --check`, and `npm run android:debug`.
- Latest local Android APK: 48,826,919 bytes, SHA-256 `609E2AD1C375A433CF9A9370C077768501DB5EDC79151E0EC3549BFE9A8D4FC3`.
- APK metadata and install evidence: package `com.mcographics.fromdarknesstolight`, version code `3`, version name `0.2.1`, installed in place on Samsung `SM-G781W` serial `RFCRC15568L` at `2026-09-14 08:58:59`, preserving existing app data.
- Device boundary: ADB reports the package and installed asset, but the phone remains at `mCurrentFocus=... Bouncer`, `isKeyguardShowing=true`, and `mFocusedApp=null`. Visual and click-through QA of the new Learn study-pack shelf and Saved pack management is therefore still pending until the phone is unlocked.

## v0.2.2 study-path checkpoint slice — 2026-09-14

- Added a secondary Downloads destination to the shared navigation. It is available from the desktop sidebar and Android navigation drawer, while the compact bottom navigation stays focused on the primary reading and formation surfaces.
- Study Pack plain-text export now uses shared guide-generation and renderer-download helpers. Every export is also retained as a private local record in `fdl-downloaded-guides`, linked to its source pack, with a twelve-guide cap to keep the local shelf practical.
- The Downloads screen can read the saved guide inside the app, reopen its source Study Pack, export another copy, remove it, and clear it through the existing Delete local data control. No raw `Data` document is bundled or redistributed by this feature.
- Global local search now indexes Study Pack titles, descriptions, resource stops, and the eight Facts & Info reading paths, with direct selection routing back into the correct Learn pack or research path.
- Study Packs now remember each of their five resource-stop checkpoints in private `fdl-study-pack-progress` state, show completion percentage, and expose both accessible marker and text actions for marking a stop ongoing or complete.
- Facts & Info paths now remember each of their three reading-section checkpoints in private `fdl-facts-path-progress` state, show completion percentage, and expose accessible marker and text actions for marking a section read or ongoing.
- Added dedicated artwork at [`public/images/generated/sections/downloads-study-guides.png`](../public/images/generated/sections/downloads-study-guides.png), registered in the asset manifest, and extended the artwork verifier to 17 required hero/section images.
- Validation passed: `npm run build`, `npm run verify:database`, `npm run verify:licenses`, `npm run verify:art` (17/17), JSON manifest validation, the study-pack reference check, `git diff --check`, and `npm run android:debug` with Temurin Java 21.
- Latest local Android APK: 47,077,372 bytes with SHA-256 `223ACE8F6E9FD95BAA576E090592551CF7B3E187298FFDC04AA3A4A68517257F`.
- APK metadata and install evidence: package `com.mcographics.fromdarknesstolight`, version code `4`, version name `0.2.2`, installed in place on Samsung `SM-G781W` serial `RFCRC15568L` at `2026-09-14 09:51:23`, preserving existing app data. The APK contains `assets/public/images/generated/sections/downloads-study-guides.png`, `assets/public/images/generated/sections/facts-info-research.webp`, the global-search Study Pack/path code, private Study Pack and Facts & Info section checkpoints, and the updated private-data explanation.
- Device boundary remains unchanged: the connected Samsung phone is detected and may be updated in place, but its secure PIN bouncer still prevents honest visual or click-through QA until it is unlocked.

## v0.2.3 Ask a Question guide slice — 2026-09-14

- The controlled Ask a Question guide now searches natural-language aliases and the local question records' Scripture, comparative-source, and further-reading fields, so phrases such as `three gods`, `changed Bible`, `Jesus pray`, `god physically`, `forgive sin`, and `good works` reach the relevant curated question more reliably.
- A matched answer now presents up to four direct Scripture buttons that reopen the referenced passage in the offline Bible reader, alongside the full-study action and contextual alternate questions. The feature remains a bounded local knowledge base and does not introduce unrestricted remote chat.
- Added review-aware Ask a Question styling for Scripture recommendations in both light and dark themes; the existing Learn artwork remains the section-level visual anchor.
- Validation passed: `npm run android:debug`, `npm run verify:database`, `npm run verify:licenses`, `npm run verify:art`, educational mapping checks, version-boundary checks, and `git diff --check`.
- Latest local Android APK: 47,077,928 bytes with SHA-256 `8D10E0BB79E8BDAC7B5B365BBA30C105F6336CACE3EBE571AA8A5F30119A55EA`.
- APK metadata and install evidence: package `com.mcographics.fromdarknesstolight`, version code `5`, version name `0.2.3`, installed in place on Samsung `SM-G781W` serial `RFCRC15568L` at `2026-09-14 10:00:37`, preserving existing app data. The APK contains `assets/public/images/generated/sections/downloads-study-guides.png`, `assets/public/images/generated/sections/facts-info-research.webp`, the Scripture-linked Ask a Question guide, private Study Pack and Facts & Info section checkpoints, and the in-app updater version boundary.
- Device boundary remains unchanged: ADB confirms the package, but the secure PIN bouncer prevents honest visual or click-through QA of the Ask a Question controls until the phone is unlocked.

## v0.2.4 Muslim-seeker Q&A expansion slice — 2026-09-14

- Expanded the local Muslim-seeker Q&A library from 13 to 21 Scripture-linked records. The new educational guides cover the incarnation, God’s love for sinners, mercy and justice at the cross, Christian and Islamic salvation themes, assurance of forgiveness, Quran–Gospel comparison, first steps in following Jesus, and family relationships and safety.
- Kept each article inside the existing review-aware content shape: Christian explanation, direct Bible references, comparative source entry points, further reading, and an editorial review boundary. Comparative references are presented as starting points for study, not as a complete account of every Muslim belief or interpretation.
- Reused the existing in-app reader actions so every new guide can open its attached Bible passages directly in the offline reader; no browser, remote chat, or unrestricted AI answer surface was added.
- Version boundary advanced to local application `0.2.4` / Android version code `6` so the content expansion is distinguishable from the installed v0.2.3 package.
- Android validation passed with `npm run android:debug`; the resulting APK was installed in place with ADB and reported version code `6`, version name `0.2.4`, and last update time `2026-09-14 10:14:09`.
- Device boundary remains unchanged: ADB confirms the package installation, but the secure PIN bouncer prevents honest visual or click-through QA of the new Q&A cards until the phone is unlocked.

## v0.2.5 Question topic navigation slice — 2026-09-14

- Added an explicit `questionTopic` taxonomy to all 21 Muslim-seeker Q&A records: Jesus, God, Bible, Quran & Islam, and Salvation & Life.
- Added local topic filters to the Questions Muslims may ask shelf. The selected topic updates the visible count, card list, answer heading, and accessible pressed state while preserving the existing full-text search and direct Scripture actions.
- Kept the top-level Learn category as `Questions` so the new topic organization does not break existing shelves, Study Pack references, or global search results.
- Version boundary advanced to local application `0.2.5` / Android version code `7` for the navigation and information-architecture change.
- Android validation passed with `npm run android:debug`; the resulting 47,310,003-byte APK was installed in place with ADB and reported version code `7`, version name `0.2.5`, and last update time `2026-09-14 10:30:12`.
- Latest local Android APK SHA-256: `6DEF67FDFFEE7A63BB63B7BA2EAD13ECE7B56D2B06A4D848C309156CAAB3C6AA`.
- Device boundary remains unchanged: ADB confirms the package installation, but the secure PIN bouncer prevents honest visual or click-through QA of the topic filters until the phone is unlocked.

## v0.2.6 Question library content expansion slice — 2026-09-14

- Expanded the local Muslim-seeker Q&A library from 21 to 29 Scripture-linked guides. The new guides cover Christian monotheism, Jesus’ eternality, the resurrection, Bible authorship, apparent contradictions, manuscript evidence, translation differences, and what the Quran says about earlier Scripture.
- Kept the five-topic taxonomy and local filters: God, Jesus, Bible, Quran & Islam, and Salvation & Life. The resulting topic counts are God 5, Jesus 8, Bible 6, Quran & Islam 4, and Salvation & Life 6.
- Kept source-aware boundaries in the new Bible and comparison material: the guides distinguish manuscript evidence from translation choices, Christian interpretation from historical claims, and selected Quran references from a complete account of Islamic interpretation.
- Reused the in-app Scripture action for every new guide so the reader can move directly from the question to the offline Bible passage without opening a browser or remote service.
- Version boundary advanced to local application `0.2.6` / Android version code `8` for the content expansion.
- Android validation passed with `npm run android:debug`; the resulting 47,089,432-byte APK was installed in place with ADB and reported version code `8`, version name `0.2.6`, and last update time `2026-09-14 10:38:22`.
- Latest local Android APK SHA-256: `707B094EE2D8E4EE43C6343A6BF95C5B2224DB1C7877136455049A62C40F31DD`.
- Device boundary remains unchanged: ADB confirms the package installation, but the secure PIN bouncer prevents honest visual or click-through QA of the expanded question library until the phone is unlocked.

## v0.2.14 Contextual Q&A follow-up prompts — 2026-09-14

- Added a topic-aware “question to carry” panel to every full Muslim-seeker Q&A study. God, Jesus, Bible, Quran & Islam, and Salvation & Life questions now each lead to a different reflective next question before the reader chooses a related local study.
- Kept the prompt local and deterministic: it is derived from the curated question’s topic, does not call an AI service, does not send the question or reading activity anywhere, and retains the existing Scripture and safety boundaries.
- Reused the existing article-detail artwork and related-reading surface; the section-art manifest remains complete with 17 required hero/section images.
- Version boundary advanced to local application `0.2.14` / Android version code `16` for the contextual guide slice.
- Renderer validation passed through `npm run android:debug`; Vite transformed 50 modules and the Android Gradle build completed successfully. The resulting 47,098,596-byte APK installed successfully over the connected package and reported version code `16`, version name `0.2.14`, and last update time `2026-09-14 11:37:37`. Latest local Android APK SHA-256: `75DB266203F4060D660E5E5A8DF991214505E37091C1F1D3A4BD75C729B021A3`.
- Device boundary remains unchanged: ADB confirms the package installation, but the secure PIN bouncer is still showing (`mCurrentFocus=... Bouncer`, `isKeyguardShowing=true`), so visual and click-through QA of the contextual prompt is not honestly claimed until the phone is unlocked.

## v0.2.13 Offline Strong’s & Vine’s explorer — 2026-09-14

- Added a dedicated Learn word-study explorer backed by the local SQLite index. Search accepts Strong’s numbers, lemmas, transliterations, and dictionary-definition text, then presents the matching Strong’s entry with occurrence count, Vine’s notes, BHSA/N1904 alignment metadata, and the first linked Bible verses.
- Added direct verse handoff from the explorer into the existing in-app Bible reader. The phone browser and a remote research service are not involved; the explorer uses the same offline database boundary as chapter reading.
- Kept review boundaries visible in the interface: alignment metadata is labeled for review, and the raw Hebrew/Greek/lexicon files remain outside the renderer bundle pending licensing and attribution review.
- Reused the existing source-library artwork for this research surface; the checked-in section-art manifest remains complete with 17 required hero/section images.
- Version boundary advanced to local application `0.2.13` / Android version code `15` for the offline word-study slice.
- Renderer validation passed with `npm run build`; the build indexed 1,566 Data assets, 66 Bible books / 31,102 verses, 14,197 Strong’s entries, 3,369 Vine’s entries, and 12,234 original-language alignments before Vite completed successfully.
- Android validation passed with `npm run android:debug`; the resulting 47,098,016-byte APK installed successfully over the connected package and reported version code `15`, version name `0.2.13`, and last update time `2026-09-14 11:28:19`. Latest local Android APK SHA-256: `AD983BCFF111DE5A6613899FF19E5894D8A43BC02993DD6558CF359A107C028D`.
- Device boundary remains unchanged: ADB confirms the package installation, but the secure PIN bouncer is still showing (`mCurrentFocus=... Bouncer`, `isKeyguardShowing=true`), so visual and click-through QA of the new explorer is not honestly claimed until the phone is unlocked.

## v0.2.12 Home Facts & Info continuation — 2026-09-14

- Added a Home Facts & Info progress card using the existing research artwork. It totals private reading-section checkpoints across the eight paths and opens the next unfinished path directly in Learn.
- Kept the card local-first: no research activity is sent anywhere, and no raw source document is exposed by the Home action.
- Version boundary advanced to local application `0.2.12` / Android version code `14` for the Home discovery slice.
- Android validation passed with `npm run android:debug`; the resulting 47,094,384-byte APK was installed in place with ADB and reported version code `14`, version name `0.2.12`, and last update time `2026-09-14 11:16:37`. Latest local Android APK SHA-256: `8391C653F2B525C1FB08BF994EA752221D8E8F6EC1A80F48109B3BE100BBE922`.
- Device boundary remains unchanged: ADB confirms the package installation, but the secure PIN bouncer prevents honest visual or click-through QA of the Home Facts & Info continuation card until the phone is unlocked.

## v0.2.11 Faith path resume — 2026-09-14

- Added a private Faith-path resume point. The selected day is remembered locally, and the welcome action now moves a returning reader to the next unfinished day instead of reopening Day 1.
- Included the selected-day state in the existing Delete private data reset.
- Version boundary advanced to local application `0.2.11` / Android version code `13` for the discipleship resume slice.
- Android validation passed with `npm run android:debug`; the resulting 47,093,352-byte APK was installed in place with ADB and reported version code `13`, version name `0.2.11`, and last update time `2026-09-14 11:11:08`. Latest local Android APK SHA-256: `7684D23E36066DFDAA77F162008F18760849C8DD2A760F4D75F3BB660907E7E8`.
- Device boundary remains unchanged: ADB confirms the package installation, but the secure PIN bouncer prevents honest visual or click-through QA of the Faith path resume state until the phone is unlocked.

## v0.2.10 Facts & Info source handoff — 2026-09-14

- Added source-aware routing in the indexed source library. The four supplied Facts & Info studies now point directly to their matching guided reading path: identity, meeting Jesus, prophetic discernment, or Cross and resurrection.
- Kept the raw source-file boundary intact: the library remains metadata-indexed, while the app opens curated educational paths and review-draft articles rather than redistributing unreviewed DOCX files.
- Version boundary advanced to local application `0.2.10` / Android version code `12` for the Facts & Info handoff.
- Android validation passed with `npm run android:debug`; the resulting 47,093,128-byte APK was installed in place with ADB and reported version code `12`, version name `0.2.10`, and last update time `2026-09-14 11:06:01`. Latest local Android APK SHA-256: `727A338B4427B641925FF8A0F6D47CAC16DE081947C5FFB7EC07D6F2FF332210`.
- Device boundary remains unchanged: ADB confirms the package installation, but the secure PIN bouncer prevents honest visual or click-through QA of the source-to-path handoff until the phone is unlocked.

## v0.2.9 Q&A detail progress polish — 2026-09-14

- Added the same private explored/ongoing control to full Q&A article pages, so progress can be updated whether a reader is on the Learn shelf or inside the complete study view.
- Version boundary advanced to local application `0.2.9` / Android version code `11` for the detail-page progress polish.
- Android validation passed with `npm run android:debug`; the resulting 47,092,784-byte APK was installed in place with ADB and reported version code `11`, version name `0.2.9`, and last update time `2026-09-14 10:59:43`. Latest local Android APK SHA-256: `DFCA29412CCB3DF5E89AA7ADC0B74B443453E247195B4541377D976BA40C1543`.
- Device boundary remains unchanged: ADB confirms the package installation, but the secure PIN bouncer prevents honest visual or click-through QA of the detail-page progress control until the phone is unlocked.

## v0.2.8 Private Q&A progress slice — 2026-09-14

- Added private explored markers to the 33-question Muslim-seeker Q&A library. A selected guide can be marked explored or ongoing, and the marker is visible in the question shelf.
- Added a topic-aware private progress bar that reports the explored count for the current All, God, Jesus, Bible, Quran & Islam, or Salvation & Life view.
- Kept progress local-only under `fdl-question-progress`; the existing Delete private data action clears it with the rest of the app’s local state.
- Version boundary advanced to local application `0.2.8` / Android version code `10` for the Q&A progress slice.
- Android validation passed with `npm run android:debug`; the resulting 47,092,628-byte APK was installed in place with ADB and reported version code `10`, version name `0.2.8`, and last update time `2026-09-14 10:52:50`. Latest local Android APK SHA-256: `36CB25E7F0CD7D6937805FDE23E6710D508BDDB9D792A997824760E8BF098090`.
- Device boundary remains unchanged: ADB confirms the package installation, but the secure PIN bouncer prevents honest visual or click-through QA of the progress controls until the phone is unlocked.

## v0.2.7 Foundational Scripture Q&A slice — 2026-09-14

- Expanded the local Muslim-seeker Q&A library from 29 to 33 Scripture-linked guides. The new guides cover Jesus’ “I am” claims, the Father/Son/Holy Spirit distinction, the Old Testament, and the New Testament.
- Kept the five-topic taxonomy and local filters: God 6, Jesus 9, Bible 8, Quran & Islam 4, and Salvation & Life 6.
- Kept every guide source-aware and review-labeled, with a Christian explanation, direct Bible references, comparative source entry points where relevant, and further reading that encourages context rather than isolated quotations.
- Version boundary advanced to local application `0.2.7` / Android version code `9` for the foundational content expansion.
- Android validation passed with `npm run android:debug`; the resulting 47,091,976-byte APK was installed in place with ADB and reported version code `9`, version name `0.2.7`, and last update time `2026-09-14 10:43:48`. Latest local APK SHA-256: `AA5B13DBE58D526A3C93A6E81E3318FD78242A7FAB72BD3B66E417D1EACEE5BC`.
- Device boundary remains unchanged: visual and click-through QA remains pending because the connected phone is locked at the secure PIN bouncer.

## Phone installation status — historical v0.2.1 evidence

An earlier connected Android phone was running:

```text
Package: com.mcographics.fromdarknesstolight
Version code: 3
Version name: 0.2.1
```

The corrected `v0.2.1` APK was built with the public label **From Islam to Christ**, verified, and installed after explicit authorization to remove the prior debug-signed `v0.2.0` installation. The package is `com.mcographics.fromdarknesstolight`, the launched activity is `.MainActivity`, and the installed application reports version code `3` / version name `0.2.1`.

The uninstall removed local app data from the prior installation, including bookmarks, notes, highlights, journey progress, PIN state, and reader preferences. The new APK uses the current local debug certificate `dc272c4c52d0e4fbfab20f110ce52a7ffea0fca517fa735a898100d32d90df3b`; future update-compatible Android testing requires keeping this signing identity stable or moving to a protected production key.

This paragraph records the historical clean-install test for v0.2.1. The later v0.2.2, v0.2.3, v0.2.4, v0.2.5, v0.2.6, and v0.2.7 in-place updates are recorded in their respective build slices above.

## Remaining work and release gates

1. For update-compatible Android releases, establish and protect one production signing key; do not continue using changing debug certificates for upgrade testing.
2. Choose the intended Android distribution path: Play Store, managed/private distribution, or signed GitHub APK release.
3. Complete the Data asset license manifest, attribution review, and content review described in [`plan.md`](./plan.md).
4. Perform full visual and interaction QA on a representative Windows desktop and Android phone after the fresh install.
5. Keep the privacy boundary visible and review the local PIN implementation before describing the app as encrypted or secure against device-level inspection.

## Important file references

- Product plan: [`Documentation/plan.md`](./plan.md)
- Android and release architecture: [`Documentation/ANDROID_AND_RELEASE.md`](./ANDROID_AND_RELEASE.md)
- Application README: [`README.md`](../README.md)
- Shared renderer entry: [`src/App.jsx`](../src/App.jsx)
- Shared responsive styles: [`src/styles.css`](../src/styles.css)
- Muslim-seeker Q&A drafts: [`src/data/muslim-questions.js`](../src/data/muslim-questions.js)
- Guided prayer content: [`src/data/prayer-content.js`](../src/data/prayer-content.js)
- New-believer path content: [`src/data/faith-content.js`](../src/data/faith-content.js)
- Guided Journey lesson content: [`src/data/journey-content.js`](../src/data/journey-content.js)
- Private Saved folder definitions: [`src/data/saved-folders.js`](../src/data/saved-folders.js)
- Guided Bible reading plans: [`src/data/reading-plans.js`](../src/data/reading-plans.js)
- Journey reflection storage and rendering: `fdl-journey-reflections` in [`src/App.jsx`](../src/App.jsx)
- Offline content service: [`src/services/content-database.js`](../src/services/content-database.js)
- Electron main process: [`electron/main.cjs`](../electron/main.cjs)
- Data index builder: [`scripts/build-data-index.cjs`](../scripts/build-data-index.cjs)
- Database verifier: [`scripts/verify-content-database.cjs`](../scripts/verify-content-database.cjs)
- Android project: [`android/`](../android/)
- Release configuration: [`package.json`](../package.json)
