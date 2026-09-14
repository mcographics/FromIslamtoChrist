# From Islam to Christ — Build Progress

**Progress date:** 2026-09-13  
**Repository:** `mcographics/FromIslamtoChrist`  
**Website repository:** `mcographics/mcographics.github.io`  
**Current application version:** `0.2.1`  
**Current public release:** [From Islam to Christ v0.2.1](https://github.com/mcographics/FromIslamtoChrist/releases/tag/v0.2.1)

## Purpose of this record

This is a progress handoff for the work completed so far. It is separate from the product plan in [`plan.md`](./plan.md) and the platform/release rules in [`ANDROID_AND_RELEASE.md`](./ANDROID_AND_RELEASE.md).

The supplied `fromislamtochrist.png` file was treated as a visual asset and replacement request. It did not contain additional implementation instructions. The supplied image was preserved byte-for-byte and used as the website’s Release 01 artwork.

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
- Bible reader with the available 66-book KJV corpus and 31,102 verses.
- Local book/chapter navigation.
- Reference lookup for entries such as `John 1` and `John 1:1`.
- Learn screen with topic filtering and local search.
- Article detail views.
- Guided Journey with locally persisted progress.
- Saved items and locally persisted bookmarks.
- Bible highlights and private notes.
- Copy passage action.
- Reader font-size controls.
- Paper, Sepia, and Low-light reading tones.
- Persistent light mode and dark mode controls in the header and Settings.
- Optional local PIN gate.
- Automatic locking after five minutes without pointer, touch, or keyboard activity.
- Manual **Lock now** action.
- One-step deletion of local bookmarks, highlights, notes, journey progress, reader preferences, and PIN state.
- Explicit privacy-boundary messaging explaining that the PIN gate is not encryption and cannot protect against operating-system storage access, backups, screenshots, device access, or a compromised device.
- Mobile navigation drawer for the Android phone shell.

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

## Data and offline content pipeline

- The local `Data` directory contains the research and conversion inputs and is catalogued by the repeatable data-build script.
- The generated runtime database is [`public/data/from-darkness-to-light.db`](../public/data/from-darkness-to-light.db).
- The catalog currently indexes 1,566 local assets.
- The database carries the 66-book index and the structured 31,102-verse Bible corpus.
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
npm run build:pages              # website repository
node --test tests\rendered-html.test.mjs   # website repository: 39/39
git diff --check
GitHub Actions: app v0.2.1 succeeded
GitHub Actions: website Pages deployment succeeded
```

These checks establish source/build/database/deployment evidence. They do not substitute for full visual QA of every Electron and Android screen, production Android signing, content licensing approval, or a store publication review.

## Phone installation status

The connected Android phone is now running:

```text
Package: com.mcographics.fromdarknesstolight
Version code: 3
Version name: 0.2.1
```

The corrected `v0.2.1` APK was built with the public label **From Islam to Christ**, verified, and installed after explicit authorization to remove the prior debug-signed `v0.2.0` installation. The package is `com.mcographics.fromdarknesstolight`, the launched activity is `.MainActivity`, and the installed application reports version code `3` / version name `0.2.1`.

The uninstall removed local app data from the prior installation, including bookmarks, notes, highlights, journey progress, PIN state, and reader preferences. The new APK uses the current local debug certificate `dc272c4c52d0e4fbfab20f110ce52a7ffea0fca517fa735a898100d32d90df3b`; future update-compatible Android testing requires keeping this signing identity stable or moving to a protected production key.

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
- Electron main process: [`electron/main.cjs`](../electron/main.cjs)
- Data index builder: [`scripts/build-data-index.cjs`](../scripts/build-data-index.cjs)
- Database verifier: [`scripts/verify-content-database.cjs`](../scripts/verify-content-database.cjs)
- Android project: [`android/`](../android/)
- Release configuration: [`package.json`](../package.json)
