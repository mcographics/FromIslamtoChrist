# From Darkness to Light

Electron + React + Vite prototype based on `Documentation/plan.md` and `Concept/concept.png`.

## Current prototype slice

- Home dashboard with the dawn-to-light visual direction
- Bible reader with the full 66-book / 31,102-verse KJV corpus currently available in `Data`
- Local book/chapter navigation and reference search for passages such as `John 1` and `John 1:1`
- Learn and article detail views
- Guided Journey with locally persisted progress
- Saved items with locally persisted bookmarks
- Light and dark modes with a persistent header switch and Settings controls
- Optional local PIN lock with five-minute inactivity locking and a clear privacy boundary
- One-step deletion of local bookmarks, highlights, notes, journey progress, reader preferences, and PIN state
- Responsive Android v0.2.1 layout with constrained controls and no unintended horizontal page panning
- Branded application identity using `logo/icon.png` for the app icon and `logo/logo.png` for desktop and Android splash screens
- Mobile-first Android shell built with Capacitor, including a working phone navigation drawer
- GitHub-linked update checks for Android and Electron; Windows packaged builds use `electron-updater`
- Bible study tools for local highlights, private notes, copy, font sizing, and Paper/Sepia/Low-light reading tones
- Learn screen search and topic filtering with local empty states
- A versioned SQLite content database generated from `Data`, cataloguing all 1,566 local assets and carrying the structured Bible corpus
- Offline Bible content loaded chapter-by-chapter from the SQLite database, with a checked-in John 1 JSON fallback for development recovery
- Electron window configured with context isolation, no Node integration, and a sandboxed renderer

The Bible text and article content are prototype samples. Translation licensing, attribution, content review, and production privacy hardening remain release gates described in `Documentation/plan.md`.

The full `Data` directory remains outside the renderer bundle. The repeatable build pipeline converts its metadata into `public/data/from-darkness-to-light.db`; the database is the runtime content boundary, while the raw DOCX, lexicon, Hebrew, Greek, Text-Fabric, archive, and other research files remain local conversion inputs. This keeps the prototype fast and avoids treating the presence of a file as permission to redistribute it.

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
```

For the Android phone build, use a Java 21 toolchain and run:

```powershell
npm run android:debug
```

The debug APK is written to `android/app/build/outputs/apk/debug/app-debug.apk`. Android update checks open the matching GitHub release APK for user-approved installation; Android does not permit a third-party APK to silently replace itself. Windows packaged builds check GitHub Releases and install downloaded updates on restart. The v0.2.0 privacy lock is a local access gate, not encryption or a guarantee against device-level access. The v0.2.1 patch tightens the shared mobile layout so the phone viewport stays constrained without unintended horizontal panning.

The public release workflow is tag-driven. Create a `v*` tag after reviewing content and licensing, and GitHub Actions builds the Windows installer and Android test APK. The raw `Data` directory remains local research input and is intentionally excluded from the repository and application bundle until each asset has a completed redistribution review.

The current app intentionally has no backend, account, analytics, or remote content connection.
