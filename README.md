# From Darkness to Light

Electron + React + Vite prototype based on `Documentation/plan.md` and `Concept/concept.png`.

## Current prototype slice

- Home dashboard with the dawn-to-light visual direction
- Bible reader sample for John 1
- Local reference search for `John 1` and `John 1:1`
- Learn and article detail views
- Guided Journey with locally persisted progress
- Saved items with locally persisted bookmarks
- Light and dark modes with a persistent header switch and Settings controls
- Branded application identity using `logo/icon.png` for the app icon and `logo/logo.png` for desktop and Android splash screens
- Mobile-first Android shell built with Capacitor, including a working phone navigation drawer
- GitHub-linked update checks for Android and Electron; Windows packaged builds use `electron-updater`
- A versioned SQLite content database generated from `Data`, cataloguing all 1,566 local assets and carrying the structured John 1 runtime sample
- Offline Bible content loaded from the SQLite database, with a checked-in JSON fallback for development recovery
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

The debug APK is written to `android/app/build/outputs/apk/debug/app-debug.apk`. Android update checks open the matching GitHub release APK for user-approved installation; Android does not permit a third-party APK to silently replace itself. Windows packaged builds check GitHub Releases and install downloaded updates on restart.

The public release workflow is tag-driven. Create a `v*` tag after reviewing content and licensing, and GitHub Actions builds the Windows installer and Android test APK. The raw `Data` directory remains local research input and is intentionally excluded from the repository and application bundle until each asset has a completed redistribution review.

The current app intentionally has no backend, account, analytics, or remote content connection.
