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
- Mobile-first Android shell built with Capacitor, including a working phone navigation drawer
- GitHub-linked update checks for Android and Electron; Windows packaged builds use `electron-updater`
- Source Library indexing all 1,562 files in `Data` by collection, type, size, and review status
- Safe Electron previews for readable source files plus a generated John 1 runtime sample from the structured KJV JSON
- Electron window configured with context isolation, no Node integration, and a sandboxed renderer

The Bible text and article content are prototype samples. Translation licensing, attribution, content review, and production privacy hardening remain release gates described in `Documentation/plan.md`.

The full `Data` directory remains outside the renderer bundle. The app indexes every local asset and previews selected readable files through a path-validated Electron preload bridge; large and binary files remain catalogued as local source assets. This keeps the prototype fast and avoids treating the presence of a file as permission to redistribute it.

## Run

```powershell
npm install
npm run dev
```

The development script starts Vite and the Electron shell together. For a production renderer build:

```powershell
npm run build
```

For the Android phone build, use a Java 21 toolchain and run:

```powershell
npm run android:debug
```

The debug APK is written to `android/app/build/outputs/apk/debug/app-debug.apk`. Android update checks open the matching GitHub release APK for user-approved installation; Android does not permit a third-party APK to silently replace itself. Windows packaged builds check GitHub Releases and install downloaded updates on restart.

The public release workflow is tag-driven. Create a `v*` tag after reviewing content and licensing, and GitHub Actions builds the Windows installer and Android test APK. The raw `Data` directory remains local research input and is intentionally excluded from the repository and application bundle until each asset has a completed redistribution review.

The current app intentionally has no backend, account, analytics, or remote content connection.
