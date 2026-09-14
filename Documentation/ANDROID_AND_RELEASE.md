# Android and release architecture

This document records the implementation and release decision for the From Islam to Christ prototype. The public product name is From Islam to Christ; the existing Android application ID and runtime database filename remain legacy technical identifiers for compatibility.

## Platform decision

- Windows desktop: Electron 44, React 19, and Vite 6.
- Android phone: Capacitor 8 wrapping the same React/Vite renderer, with phone-specific portrait sizing, mobile navigation, and Android packaging.
- Android application ID: `com.mcographics.fromdarknesstolight`.
- Android minimum SDK: 24.
- Android compile/target SDK: 36.
- Android build format: debug APK for the current prototype and test release workflow.
- App identity: `logo/icon.png` is used for the Windows and Android application icon; `logo/logo.png` is used by the Electron startup window and Android native splash.

Using the shared renderer preserves the same Home, Bible, Learn, article detail, Journey, Saved, Settings, privacy, theme, local-progress, Bible highlight, private-note, copy, font-size, and reading-tone features on both platforms. The Android shell adds native packaging and the phone navigation drawer without introducing an account or backend requirement. The research catalog is an internal SQLite content layer rather than a user-facing file browser.

The v0.2.0 privacy slice adds an optional local PIN gate, automatic locking after five minutes without pointer, touch, or keyboard activity, a manual Lock now action, and an explicit private-data deletion control. The PIN verifier uses a per-install salt and Web Crypto PBKDF2; the PIN gate is still not encryption, and the app explains that operating-system storage, backups, screenshots, device access, and compromised devices remain outside its protection boundary.

The v0.2.1 patch corrects the phone layout boundary in the shared renderer. The Android viewport now constrains the app shell and main content, wraps the reader controls, and replaces the fixed-width Bible selectors with a four-column mobile grid so the phone does not expose unintended horizontal page panning.

## Update behavior

The Windows application uses `electron-updater` and the GitHub Releases provider. Packaged builds check the latest release on startup, download an available Windows installer update, and offer restart-to-install. Development runs intentionally report that update checks require a packaged build.

The Android renderer checks the public GitHub Releases API. When a newer APK is available, the registered native `AndroidUpdater` plugin streams the GitHub release asset into the app's private `files/updates` directory, reports download progress, and verifies the GitHub-provided SHA-256 digest when available. The user-facing `Install update` action hands that private file to Android's package installer through the app's `FileProvider`; the phone browser is not used. Android requires the user to approve installation, and Android 8+ may require the user to allow this app to install packages. A production Android release still requires a stable signing key and a documented distribution choice such as Google Play, managed private distribution, or a signed GitHub release.

## Data and licensing boundary

The local `Data` directory is a 1,500+ file research/conversion source and is excluded from Git until redistribution rights are reviewed per asset. The repeatable `npm run build:data` pipeline writes `public/data/from-darkness-to-light.db`, which stores normalized metadata for every local file, the 66-book index, and the current structured KJV corpus (31,102 verses). The SQLite file is bundled as runtime metadata/content; it does not embed the unreviewed DOCX, lexicon, Hebrew, Greek, Text-Fabric, or other raw source files.

Before a public content release, complete the license manifest and attribution review required by `Documentation/plan.md`. Do not treat the current generated catalog or debug APK as evidence that every source asset is cleared for redistribution.

## Release procedure

1. Review content, safety, attribution, and licensing gates.
2. Confirm the Android signing/distribution decision before replacing the debug APK with a production-signed artifact.
3. Update the version in `package.json` and the Android `versionName`/`versionCode`.
4. Run `npm run verify:database`, `npm run build`, `npm run dist:win`, and `npm run android:debug` locally.
5. Create and push a tag such as `v0.2.1`.
6. GitHub Actions builds the Windows installer and Android test APK. For a tag, it creates the GitHub release consumed by both update paths.
7. Verify the release assets and checksums publicly before calling the release available.
