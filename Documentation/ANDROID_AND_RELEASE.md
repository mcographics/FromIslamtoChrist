# Android and release architecture

This document records the first implementation decision for the From Darkness to Light prototype.

## Platform decision

- Windows desktop: Electron 44, React 19, and Vite 6.
- Android phone: Capacitor 8 wrapping the same React/Vite renderer, with phone-specific portrait sizing, mobile navigation, and Android packaging.
- Android application ID: `com.mcographics.fromdarknesstolight`.
- Android minimum SDK: 24.
- Android compile/target SDK: 36.
- Android build format: debug APK for the current prototype and test release workflow.
- App identity: `logo/icon.png` is used for the Windows and Android application icon; `logo/logo.png` is used by the Electron startup window and Android native splash.

Using the shared renderer preserves the same Home, Bible, Learn, article detail, Journey, Saved, Settings, privacy, theme, and local-progress features on both platforms. The Android shell adds native packaging and the phone navigation drawer without introducing an account or backend requirement. The research catalog is an internal SQLite content layer rather than a user-facing file browser.

## Update behavior

The Windows application uses `electron-updater` and the GitHub Releases provider. Packaged builds check the latest release on startup, download an available Windows installer update, and offer restart-to-install. Development runs intentionally report that update checks require a packaged build.

The Android renderer checks the public GitHub Releases API. When a newer APK is available, it opens the matching GitHub asset through the Android browser surface. Android requires the user to approve installation of a downloaded APK; a third-party APK cannot silently replace itself. A production Android release still requires a stable signing key and a documented distribution choice such as Google Play, managed private distribution, or a signed GitHub release.

## Data and licensing boundary

The local `Data` directory is a 1,500+ file research/conversion source and is excluded from Git until redistribution rights are reviewed per asset. The repeatable `npm run build:data` pipeline writes `public/data/from-darkness-to-light.db`, which stores normalized metadata for every local file and the current structured John 1 sample. The SQLite file is bundled as runtime metadata/content; it does not embed the unreviewed DOCX, lexicon, Hebrew, Greek, Text-Fabric, or other raw source files.

Before a public content release, complete the license manifest and attribution review required by `Documentation/plan.md`. Do not treat the current generated catalog or debug APK as evidence that every source asset is cleared for redistribution.

## Release procedure

1. Review content, safety, attribution, and licensing gates.
2. Confirm the Android signing/distribution decision before replacing the debug APK with a production-signed artifact.
3. Update the version in `package.json` and the Android `versionName`/`versionCode`.
4. Run `npm run verify:database`, `npm run build`, `npm run dist:win`, and `npm run android:debug` locally.
5. Create and push a tag such as `v0.1.3`.
6. GitHub Actions builds the Windows installer and Android test APK. For a tag, it creates the GitHub release consumed by both update paths.
7. Verify the release assets and checksums publicly before calling the release available.
