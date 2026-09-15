# From Islam to Christ — Recent Changes and Updates

This is the running engineering log for the **From Islam to Christ** application.

It records source changes, content/data work, validation, platform work, release decisions, known limitations, and unfinished follow-up. The log is intentionally allowed to grow. Entries are appended chronologically so that a future build, phone installation, GitHub release, or regression investigation can be traced back to the source change that caused it.

This record is separate from:

- [`plan.md`](./plan.md), which defines the product vision and roadmap;
- [`BUILD_PROGRESS_2026-09-13.md`](./BUILD_PROGRESS_2026-09-13.md), which is the structured progress handoff and release evidence record; and
- [`ANDROID_AND_RELEASE.md`](./ANDROID_AND_RELEASE.md), which records the platform, signing, updater, and release architecture.

## Working rules for this log

- Append a dated entry for every meaningful source, data, documentation, validation, build, device, or release change.
- Distinguish clearly between source implementation, static validation, renderer build, Android/Windows packaging, device installation, runtime click-through, GitHub publication, and public release evidence.
- Do not describe a feature as device-tested unless the relevant device and interaction were actually tested.
- Do not describe a release artifact as signed unless its signature and signing identity were verified.
- Keep the current build instruction visible in the latest entry, including whether the user has authorized a new build.
- Preserve unrelated worktree changes when adding future entries.
- Keep content licensing and editorial review status visible. A file being present in `Data` does not mean it is cleared for redistribution.

## Current project snapshot

| Field | Current value |
| --- | --- |
| Public product name | From Islam to Christ |
| Repository | `mcographics/FromIslamtoChrist` |
| Branch | `main` |
| HEAD at the start of this log | `52b0ca1` / tag `v0.2.27` |
| Package version | `0.2.30` |
| Android application ID | `com.mcographics.fromdarknesstolight` |
| Android version code | `32` |
| Windows shell | Electron 44 + React 19 + Vite 6 |
| Android shell | Capacitor 8 wrapping the shared renderer |
| Runtime database | `public/data/from-darkness-to-light.db` |
| Database schema | Version 5 |
| Current build instruction | The 2026-09-15 user request authorized the next Windows/Android release build, GitHub push, and promotion of the release; v0.2.30 is now public with its signing and rights limitations stated in the release notes |
| Current source status | v0.2.30 source commits `a1f5ece` and `06fe134` are pushed to `main`. Windows release-mode packaging completed but is `NotSigned`; Android `assembleRelease` completed as `app-release-unsigned.apk` because no production keystore is configured. A separate debug-key-signed device copy is installed on the connected Samsung SM-G781W at version `0.2.30` / code `32`, with no uninstall or data reset. |

The public-facing product name is **From Islam to Christ**. The Android application ID and the generated runtime database filename retain the older `fromdarknesstolight` / `from-darkness-to-light` technical identifiers for compatibility with the existing application and release pipeline.

## 2026-09-14 — GitHub README banner

- Added the existing [`logo/banner.png`](../logo/banner.png) artwork to the top of the GitHub README using a repository-relative image path.
- The README banner now gives visitors an immediate visual identity for **From Islam to Christ** while preserving the existing product description and release/download section.
- No application source, build artifact, release asset, or runtime behavior changed in this documentation-only update.

## 2026-09-14 — v0.2.28 cross-platform GitHub release and phone installation

### GitHub publication

- Published [From Islam to Christ v0.2.28](https://github.com/mcographics/FromIslamtoChrist/releases/tag/v0.2.28) from the v0.2.28 source on `main`.
- Published the product-named [Windows x64 installer](https://github.com/mcographics/FromIslamtoChrist/releases/download/v0.2.28/From-Islam-to-Christ-0.2.28-x64.exe), the matching `latest.yml`, and the matching `.blockmap` for the Windows updater.
- Published the product-named [Android APK](https://github.com/mcographics/FromIslamtoChrist/releases/download/v0.2.28/From-Islam-to-Christ-0.2.28.apk). The incorrectly named `From-Islam-to-Christ-0.2.28-device-debug-signed.apk` duplicate was removed from the release so the updater sees the expected product-named asset.
- GitHub remote asset evidence: Windows installer `154,492,718` bytes / SHA-256 `3c319a9839263b86b2b75be407b0a7601775c572bca5842e027db1d13056f4a4`; Android APK `42,277,332` bytes / SHA-256 `6bc20bcd9423d11ec9cc8992be55d0f008144958699b40c93d866807512cbb36`; blockmap `162,171` bytes / SHA-256 `cbcf8b48bf23e623452457bd4ca075820ea0232a0603b048a6655f08bc91ea78`; `latest.yml` `368` bytes / SHA-256 `7de6f646bb4bb782de368c8aa8daea6c8939ab80f3394fe7aa71699ae21b7ce4`.
- The release title is **From Islam to Christ v0.2.28** and the release is public, non-draft, and non-prerelease. The release notes include the v0.2.27 comparison link and the direct-device signing/content-rights limitations.

### Phone installation

- The first attempt to install the local release-variant APK was correctly rejected by Android because it had no certificate (`INSTALL_PARSE_FAILED_NO_CERTIFICATES`).
- A separate device-install copy was signed with the local Android debug keystore. Its certificate SHA-256 is `dc272c4c52d0e4fbfab20f110ce52a7ffea0fca517fa735a898100d32d90df3b`, matching the existing app on the phone.
- `adb install -r --no-incremental` then returned `Success` for package `com.mcographics.fromdarknesstolight`. The connected Samsung `SM-G781W` reports version `0.2.28`, version code `30`, and `MainActivity` was confirmed foreground after launch. Existing app data was preserved; no uninstall or data reset was performed.

### Release boundaries

- The Windows installer remains unsigned under Authenticode.
- The Android APK verifies with APK Signature Scheme v2 and v3 but uses the Android debug certificate for this direct-device release; it is not Google Play production-signed.
- The strict rights audit remains `0 cleared / 1,566 pending review`, so this manual publication does not close the content licensing or editorial gate. The normal tag-driven workflow still requires repository Android signing secrets and the release license gate for a future production release.

## 2026-09-14 — v0.2.28 authorized cross-platform build

### Renderer and content build

- The user authorized a new build, source publication, and website update after the earlier no-build pause. The version boundary advanced from v0.2.27 to v0.2.28; Android version code advanced from 29 to 30.
- The production renderer build and data-index step completed as part of both platform packaging commands. The generated runtime database contains 1,566 indexed Data assets, 66 Bible books, 31,102 verses, 14,197 Strong’s entries, 3,369 Vine’s entries, and 12,234 original-language alignments.

### Windows artifact

- `npm run dist:win` completed successfully with Electron Builder 26.15.3, Electron 44.3.0, and the configured public product name **From Islam to Christ**.
- Output: [`release/From-Islam-to-Christ-0.2.28-x64.exe`](../release/From-Islam-to-Christ-0.2.28-x64.exe), 154,492,718 bytes.
- SHA-256: `3C319A9839263B86B2B75BE407B0A7601775C572BCA5842E027DB1D13056F4A4`.
- `release/latest.yml` was regenerated for version `0.2.28` and points to the product-named installer with the matching SHA-512 and size. Authenticode inspection reports `NotSigned`; the installer is a valid local package but is not represented as code-signed.

### Android artifact

- `npm run android:release` completed successfully with a portable Temurin 21.0.12.1 JDK after the machine-default Java 26 runtime failed the build’s Java 21 source-level requirement.
- Output: [`release/From-Islam-to-Christ-0.2.28-release-unsigned.apk`](../release/From-Islam-to-Christ-0.2.28-release-unsigned.apk), copied from the Gradle release output for convenient local access.
- APK metadata: package `com.mcographics.fromdarknesstolight`, version code `30`, version name `0.2.28`, application label **From Islam to Christ**, compile/target SDK 36.
- Size: 42,230,341 bytes. SHA-256: `F95D2FA24F058CAEEB685A8B831C25EB99A5454DA739074D5D227CF65699FABD`.
- `apksigner verify --verbose` reports `DOES NOT VERIFY` because the local release variant has no signing configuration. This is not a debug APK, but it is not a production-signed release and is intentionally excluded from GitHub publication and the in-app updater.

### Release decision

- The strict content-rights audit remains `0 cleared / 1,566 pending review` (`1,553 needs-review` and `13 source-notice`). The GitHub release workflow therefore remains correctly blocked by `npm run verify:licenses -- --release`.
- No app-specific production keystore or GitHub Android signing secrets are present in this checkout/account context. The signed v0.2.27 public APK was verified separately, but its private signing key is not available here and another project’s key must not be reused.
- No phone installation, visual QA, or click-through was performed for v0.2.28 because the current request authorized building and publication, not installation. Package metadata and signature checks are the evidence recorded here.

## 2026-09-14 — GitHub source and website publication

- Pushed the app source and documentation as [`d45df25`](https://github.com/mcographics/FromIslamtoChrist/commit/d45df25) to `mcographics/FromIslamtoChrist` `main`.
- Did not create a `v0.2.28` tag or public binary release. The Windows installer is not Authenticode-signed, the Android package is release-mode but unsigned, and the content manifest has 0 of 1,566 assets cleared for redistribution. The existing public v0.2.27 release remains the safe website download entry.
- Updated the companion website project card, homepage release metadata, full project page, RSS, sitemap, regression tests, and a detailed v0.2.28 build journal. The website commit is [`1300421`](https://github.com/mcographics/mcographics.github.io/commit/1300421), rebased onto the remote `8f17a80` visibility update so unrelated site work was retained.
- GitHub Pages deployment run [`34919377924`](https://github.com/mcographics/mcographics.github.io/actions/runs/34919377924) completed successfully. Live HTTP checks returned 200 for the homepage, From Islam to Christ project page, v0.2.28 journal, RSS feed, and sitemap. The live project page exposes v0.2.27 and links to the new journal; the stale `app-debug.apk` path is absent from the live homepage.
- This handoff contains source-push, local-build, packaging, static-validation, website-build, Pages-deployment, and live-HTTP evidence. It does not claim Android installation, phone click-through, Windows runtime interaction, or a public v0.2.28 binary release.

## 2026-09-14 — Unreleased source continuation: in-app terms, rights, about, and credits

### Changed

- Added [`src/data/legal-information.js`](../src/data/legal-information.js) as the single source for the in-app project identity, plain-language Terms & Conditions, Rights & Usage rules, third-party data credits, software/platform credits, and external-service notices.
- Added an About, terms & credits entry to Settings. The modal identifies MCOGraphics as the project steward and records the exact public project repository as `mcographics/FromIslamtoChrist`.
- Added source-aware rights guidance for the local BHSA, N1904, BHS-Strong-no, Strong’s Greek, Vine’s, KJV/Strong’s, translation, and supplied Facts & Info material. The copy distinguishes a repository’s software license from the rights of mixed text, annotation, mapping, gloss, semantic, or derived-data layers.
- Added documented links for the project GitHub repository, BHSA and N1904 upstream repositories, CC BY-NC 4.0, GPLv3, MIT, and the relevant DOI records. External links are restricted to an HTTPS host allow-list and remain separate from the in-app Android APK update path.
- Added plain-language notices for local storage, Discreet Mode, PIN/biometrics, Offline-only mode, GitHub update checks, MyMemory fallback translation, safety boundaries, availability, and the need for legal/editorial review before redistribution.
- Added `scripts/verify-legal-information.cjs` and `npm run verify:legal`; the tagged GitHub workflow now checks the legal/about surface before the existing strict content-rights gate.
- Extended the accessibility verifier from four to five dialog surfaces so the new legal modal is covered by the same modal semantics, focus trapping, Escape handling, and opener-focus restoration check.

### Validation

- The legal information source check passes after verifying the Settings entry point, Terms & Conditions, Rights & Usage, Credits, source boundaries, safe external links, responsive modal styling, package script, and release-workflow hook.
- No renderer build, Android/Windows package, device install, GitHub push, or release was run.

### Boundaries and follow-up

- This is an in-app plain-language rights and usage record, not legal advice or a substitute for the original license files, author permissions, attribution notices, or qualified counsel.
- The content release gate remains blocked while the manifest reports 0 of 1,566 local assets cleared. The app is suitable for continued private prototype development, not a rights-cleared public release.

## 2026-09-14 — Unreleased source continuation: updater and mobile contrast review

### Changed

- Reviewed the Android and Windows update paths against the standing requirement that Android APK updates stay inside the app and that public Android releases must not be debug builds.
- Hardened GitHub release asset selection so Android ignores APK names containing `debug` or `unsigned`, prefers the product-named `From-Islam-to-Christ-*.apk`, and still verifies the optional GitHub SHA-256 digest in the native updater.
- Corrected the Windows update banner boundary: Electron packaged builds auto-download through `electron-updater`, so the banner no longer exposes an external browser-download action while that download is in progress or merely available. The final Windows install action remains explicit after Electron reports `downloaded`.
- Changed automatic-translation requests to use the base language code from the selected locale (`de`, `fr`, `ar`, and so on), improving compatibility with translation services while the app continues to present the user’s full locale to the device speech engine and document direction.
- Strengthened mobile bottom-navigation icon and label colors in both light and dark themes so the controls have an explicit contrast layer instead of relying only on inherited desktop navigation color.
- Added `scripts/verify-update-safety.cjs` and `npm run verify:updates`, and placed this check before release packaging in the tagged GitHub workflow.

### Validation

- Static updater safety verification passed.
- No renderer build, Android/Windows package, device install, GitHub push, or release was run.

### Boundaries and follow-up

- The updater review proves source-level selection, validation, and action routing only. It does not prove a signed APK, installed package, Android package-installer confirmation, Electron download, or device behavior until builds and runtime testing are authorized.
- Plan #1 remains active because licensing, editorial approval, packaging, signing, device/accessibility, and private-pilot gates remain open.

## 2026-09-14 — Unreleased source continuation: dialog accessibility review

### Changed

- Reviewed the interactive dialog surfaces after the content and Bible reliability pass: mobile navigation, global search, translation comparison, and the privacy notice.
- Added a shared `useDialogFocus` behavior that places focus inside each dialog, keeps Tab and Shift+Tab within the active dialog, closes with Escape, and returns focus to the control that opened it when the dialog closes.
- Added a `tabIndex="-1"` container fallback to each modal so focus remains addressable even if a state-specific view temporarily has no enabled control.
- Added `aria-modal="true"` to the mobile navigation dialog so it has the same modal semantics as the other overlay surfaces.
- Added explicit accessible names to the Discreet Mode and Offline-only mode Settings switches; their nearby headings are now reinforced programmatically for screen readers.
- Added `scripts/verify-accessibility.cjs` and `npm run verify:accessibility`. The check covers dialog counts, modal semantics, initial focus, keyboard focus wrapping, opener-focus restoration, and the existing visible focus treatment.
- Added the accessibility check before packaging in the tagged GitHub release workflow.

### Validation

- `npm run verify:accessibility` passed.
- No renderer build, Android/Windows package, device install, GitHub push, or release was run.

### Boundaries and follow-up

- This is a source-level accessibility correction. Real screen-reader announcements, large-text layout, hardware-keyboard behavior, and packaged Android/Windows interaction still require future authorized runtime testing.
- Plan #1 remains active because licensing, editorial approval, packaging, signing, device/accessibility, and private-pilot gates remain open.

## 2026-09-14 — Unreleased source continuation: numbered Bible-reference aliases

### Changed

- Expanded the shared Bible resolver to normalize common numbered abbreviations including `1 Sa`, `1 Ki`, `1 Kgs`, `1 Ch`, `1 Co`, `1 Thess`, `1 Ti`, `1 Pe`, `1 Pt`, `1 Jn`, and their `2`/`3` equivalents where applicable.
- Added regression cases for numbered references so typed searches, article links, Q&A links, word-study occurrences, and cross-reference actions continue to resolve through the same reader path.

### Validation

- `npm run verify:bible` passed with the expanded numbered-reference set and invalid-location guards.
- Babel parsing and `git diff --check` remain green.
- No renderer build, Android/Windows package, device install, GitHub push, or release was run.

## 2026-09-14 — Unreleased source continuation: full content and data review

### Changed

- Added [`CONTENT_REVIEW_REPORT.md`](./CONTENT_REVIEW_REPORT.md) as the current source-by-source review record for the translation DOCX files, Facts & Info manuscripts, Strong's/Vine's resources, BHSA, N1904, the runtime database, and the renderer boundary.
- Added `scripts/review-content-assets.cjs` and `npm run verify:review`. The audit checks that all 1,566 `Data` files are represented in the manifest and runtime database, flags unexpected empty files, verifies local notice evidence, confirms all four Facts & Info documents have capsules and reading paths, checks that raw `Data` is not imported directly by renderer source, and confirms Source Library routing.
- Updated the tagged GitHub release workflow to run the review, database, link, coverage, privacy, artwork, and release-license checks before either Windows or Android packaging. The workflow will stop before packaging while any indexed asset remains uncleared.
- Made the review and license audits safe for both environments: local checkouts inspect the ignored raw `Data` directory and notices, while clean CI checkouts validate the checked-in manifest/database boundary and still enforce the strict cleared-content gate.
- Confirmed one known zero-byte directory placeholder in the N1904 tutorial tree and no unexpected empty assets. The placeholder is not runtime content and remains visible in the catalog for provenance.
- Reviewed the local license and provenance material. BHSA and the BHS-Strong mapping retain non-commercial/source-notice boundaries; N1904 has an MIT notice but also documents upstream MACULA, gloss, and semantic layers; the translation DOCX files, Vine's data, Greek Strong's data, scraped KJV/Strong mappings, and supplied Facts & Info manuscripts still need exact rights/provenance records.
- Confirmed the Facts & Info treatment remains educational and practical without presenting the supplied manuscripts as cleared public articles: four source documents map to four review-draft capsules used by eight reading paths.

### Validation

- `npm run verify:review` passed its technical audit: 1,566 Data files, 1,566 runtime source assets, 66 Bible books, 31,102 verses, 14,197 Strong's entries, 3,369 Vine's entries, 6,895 BHSA alignments, 5,339 N1904 alignments, zero unexpected empty files, zero raw Data imports in renderer source, and Source Library routing present.
- Current content gate remains intentionally blocked: 0 of 1,566 indexed Data assets are cleared, 13 carry source notices, and 1,553 remain pending review.
- No renderer build, Android/Windows package, device install, GitHub push, or release was run.

### Boundaries and follow-up

- This review makes the current prototype safer to continue using and easier to audit; it does not grant copyright permission or complete theological/editorial approval.
- Before a pilot or public release, record exact translation editions, upstream rights for each runtime layer, required attribution, reviewer/date, and subject-matter/editorial approvals. Then perform the separately authorized build, signing, device, accessibility, and updater verification.

See [`CONTENT_REVIEW_REPORT.md`](./CONTENT_REVIEW_REPORT.md) for the full matrix and repeatable audit commands.

## 2026-09-14 — Unreleased source continuation: audio current-verse loading fix

### Changed

- Fixed the Bible Audio panel's initial loading transition. When a chapter first rendered with no verses and then received its database rows, the `Current verse` display could remain blank until playback began.
- The panel now resets its current verse when the loaded verse count changes, while retaining the existing per-verse updates during Web Speech and Android Text-to-Speech playback.
- Android continues to speak only the verse text; it does not prepend or announce “verse one,” “verse two,” or similar labels.
- Added `scripts/verify-audio-state.cjs` and `npm run verify:audio` to guard initialization, per-verse advancement, accessible current-verse status, and the no-extra-announcement behavior.

### Validation

- `npm run verify:audio` passed.
- The existing database, link, Bible-navigation, privacy, source-coverage, content-review, artwork, license-audit, syntax, and diff checks remain green.
- No renderer build, Android/Windows package, device install, GitHub push, or release was run.

### Boundaries and follow-up

- The state correction is source-verified; live speech timing and visual behavior still require a future packaged Android/Windows run when builds are authorized.
- Plan #1 remains active because licensing, editorial approval, packaging, signing, device/accessibility, and pilot gates remain open.

## 2026-09-14 — Unreleased source continuation: optional offline-only mode

### User-facing behavior

- Added an optional **Offline-only mode** in Settings for users who need to pause network activity while reading or studying.
- When enabled, the app does not call the GitHub update checker. The Settings update card shows that checks are paused, disables the check action, and hides the install action until the user turns the setting off.
- When enabled, automatic translation uses only the four bundled Bible language variants and translations already cached on the device. Missing public translations stay in the English source form until the user intentionally restores online translation.
- Added a visible translation status that identifies the selected language as offline-only and explains that online translation is paused.
- Reserved Bible reader and audio verse text for the Bible-specific translation path so the generic page translator cannot race the chapter translation loader while a non-bundled language is being prepared.
- Delete private data now also removes cached automatic translations and resets Offline-only mode to its default off state.

### Privacy boundary

- Offline-only mode is a network-use control, not encryption and not a guarantee that the operating system, an external keyboard, clipboard, screenshots, or a compromised device cannot reveal activity.
- The privacy notice now documents the update-check and translation boundary beside the existing identity, notification, screen-preview, sharing, backup, lockout, encryption, logging, and deletion limits.

### Source files

- [`src/services/automatic-translation.js`](../src/services/automatic-translation.js) now exposes an explicit offline-only switch, prevents uncached fetches while enabled, cancels active translation requests when the switch is enabled, reports an offline status, and supports clearing its local cache.
- [`src/App.jsx`](../src/App.jsx) persists the setting, applies it to translation and update flows, exposes the Settings control, and clears it with private-data deletion.
- [`src/styles.css`](../src/styles.css) adds the offline translation status and the setting boundary-note treatment.
- [`scripts/verify-privacy-configuration.cjs`](../scripts/verify-privacy-configuration.cjs) checks the offline update, translation, cache-clearing, and privacy-copy boundaries.
- [`Documentation/ANDROID_AND_RELEASE.md`](./ANDROID_AND_RELEASE.md) records the release and privacy implications.
- [`Documentation/plan.md`](./plan.md) now has a current implementation-status section that separates verified source features from the remaining licensing, packaging, device, accessibility, and pilot gates.
- The Source Library now creates an explicit collection card for every indexed source group not already named in the research-collection list, including the 12 top-level `root` Data files as **Project sources**. The existing category/group filters remain available for every individual asset.

### Validation for this entry

- `npm run verify:privacy` passed. It confirms Android backup exclusions, the local PIN lockout boundary, the offline-only update/translation boundary, cache clearing, and the in-app privacy disclosures.
- `npm run verify:links` passed with 368 Scripture references and 80 in-app actions across 13 data modules resolved.
- `npm run verify:coverage` passed with all four Facts & Info documents mapped to four capsules and eight reading paths, plus Strong's, Vine's, BHSA, and N1904 runtime coverage; it also checks that named and additional indexed source groups have Source Library routes.
- `npm run verify:bible` passed with seven canonical/abbreviated/range references and invalid-location guards verified against the reader resolver.
- `npm run verify:database`, `npm run verify:art`, and `npm run verify:licenses` passed as audits. The license audit still reports 0 of 1,566 assets cleared and 1,566 pending review.
- Added `scripts/verify-bible-navigation.cjs` and the `npm run verify:bible` command to exercise canonical names, database abbreviations, common Muslim-seeker search forms, range references, and invalid chapter/book guards directly against the reader resolver.
- Babel parsing passed for all 20 JavaScript/JSX source files, the focused Node syntax checks passed, and `git diff --check` passed with only the existing LF-to-CRLF working-copy warnings.
- After the Bible translation-path correction, `npm run verify:privacy` passed again; it now also checks that reader and audio verse text remain outside the generic DOM translation observer.
- No renderer build, Android build, Windows package, phone installation, GitHub push, or public release was performed for this entry under the current instruction.
- Plan #1 remains open because the content license gate reports 0 of 1,566 indexed assets cleared, and packaged/device/accessibility/privacy behavior still requires release-gate verification.

## 2026-09-14 — Unreleased source continuation: automatic multilingual UI and RTL layout

### User-facing behavior

- Added a persistent 21-language selection with English as the main language.
- Kept English, Bulgarian, Chinese, and Spanish Bible variants as the locally bundled Bible text choices.
- Added Arabic, French, German, Portuguese, Turkish, Urdu, Persian, Indonesian, Malay, Bengali, Hindi, Italian, Dutch, Russian, Japanese, Korean, and Swahili as selectable app languages using the automatic translation path when a local translation is not bundled.
- Added automatic translation of public rendered application text after the user changes the selected language.
- Added automatic processing for newly rendered content so navigation between Home, Bible, Learn, Questions, Facts & Info, Study Packs, Journey, Faith, Prayer, Saved, Downloads, Library, Settings, article details, and modals does not leave newly mounted public text permanently in English.
- Added translation of public accessibility and presentation attributes including `aria-label`, `title`, `placeholder`, and image `alt` text where those attributes are not private or explicitly protected.
- Added a visible translation status surface showing when text is being prepared, when translation work is queued, when the selected language is ready, and when some items are waiting for a connection.
- Added a Retry action for temporary translation failures. The retry event also causes the protected Bible verse translation effects and the audio verse translation effects to try again.
- Added right-to-left document direction for Arabic, Persian, and Urdu. The navigation marker, mobile drawer boundary, translation selector, status actions, and mobile heading spacing use direction-aware styling.
- Added direct use of bundled verse translations on Home and Saved passages when the selected language has a local verse variant. This prevents unnecessary online translation requests for those bundled editions.
- Updated Home verse sharing so a non-bundled selected language attempts to translate the shared verse text before handing it to the device share or clipboard surface.

### Translation privacy boundary

- The automatic translation service sends public interface and educational text only.
- Private notes, Journey reflections, prayer-journal entries, Faith testimony drafts, typed searches, custom Saved folder names, and other user-entered private fields are excluded with explicit protection markers or protected input handling.
- Bible references, proper names, and short strings that a translation service cannot safely improve may remain unchanged.
- English remains the fallback when the selected non-bundled language has no cached translation and the device has no working connection. The UI does not present that fallback as a completed translation.
- Translations are cached in local storage by language to reduce repeated requests. This cache is an app convenience cache and is not presented as encrypted private storage.
- Android and Windows read-aloud continue to use the device/WebView speech engine for the selected locale. The app does not provide a male/female voice selector; Android’s system/default voice remains authoritative.

### Source files

- [`src/services/language.js`](../src/services/language.js) now owns the language catalog, the four bundled Bible language IDs, core copy, locale resolution, and RTL language resolution.
- [`src/services/automatic-translation.js`](../src/services/automatic-translation.js) provides the online translation fallback, chunking, concurrency limit, local cache, mutation observation, protected selectors, retry handling, and translation status events.
- [`src/App.jsx`](../src/App.jsx) connects language preference changes to the document locale/direction, public-text translation, status display, bundled Home/Saved verse selection, Bible chapter translation, Bible audio translation, and long-form local read-aloud.
- [`src/styles.css`](../src/styles.css) adds the visible translation status treatment and direction-aware layout adjustments.
- [`README.md`](../README.md) documents the 21-language behavior, online fallback, privacy exclusions, RTL languages, and the difference between debug, release-mode, and workflow-signed Android artifacts.

### Validation for this entry

- All 20 JavaScript/JSX files under `src` parsed successfully with the Babel parser.
- `node --check` passed for `language.js`, `automatic-translation.js`, `bible-reference.js`, and `content-database.js`.
- `git diff --check` passed. Git reported only the existing LF-to-CRLF working-copy warnings.
- `npm run verify:database` passed with 1,566 source assets, 66 Bible books, 31,102 Bible verses, 291,919 verse-to-Strong’s links, 14,197 Strong’s entries, 3,369 Vine’s entries, 7,575 Vine’s terms, 6,895 BHSA alignments, 5,339 N1904 alignments, and 1,566 FTS rows.
- `npm run verify:art` passed with all 17 required artwork files present and non-empty.
- `npm run verify:licenses` passed as an audit, reporting 1,566 assets pending review and 0 cleared assets. The release-enforcing license gate is therefore still not satisfied.
- No renderer build, Android build, Windows package, phone installation, GitHub push, or public release was performed for this entry.

## 2026-09-14 — Unreleased source continuation: Bible and study reliability

- Expanded Bible reference resolution with canonical names, database abbreviations, and common abbreviations such as `Jn`, `Rom`, `1 Cor`, `1 Th`, `Ps`, `Rev`, and related forms.
- Unified clicked Scripture links and typed Bible reference search around the same book-alias resolver.
- Preserved pending Scripture references when the content database is temporarily unavailable so a link clicked during database recovery can resolve after the database retry succeeds.
- Added a database retry path for a failed packaged SQLite load and protected the reader from silently reverting to an invalid location.
- Removed the hidden eight-result occurrence cap from Strong’s/Vine’s lexicon loading. Every returned Strong’s result may now load its first five linked KJV occurrences, while the UI continues to cap the visible result list for practicality.
- Kept linked Strong’s, Vine’s, BHSA, and N1904 data local to the indexed runtime database. Raw research files remain outside the renderer bundle until licensing and editorial review are complete.
- Corrected the translation comparison modal so it presents the four actually bundled Bible variants rather than displaying unsupported automatic-language columns as though they were separate bundled editions.
- Kept Facts & Info, Study Packs, Questions, Journey lessons, Faith content, Prayer content, source-library metadata, and Bible word-study handoffs connected to in-app navigation.

## 2026-09-14 — Unreleased source continuation: Bible book selection loading fix

### Reported behavior

The Bible reader could remain on `Loading [book] [chapter]…` after selecting a different book. The bundled database was checked directly and contains all 66 books, with a populated first chapter for every book, so the symptom was in the renderer request/state path rather than missing chapter-one data.

### Changed

- Added a normalized chapter request boundary in `src/App.jsx` so book IDs and chapter numbers are validated against the loaded book list before a request starts.
- Added request sequencing so a slower response from an earlier book selection cannot overwrite a newer selection.
- Added a 15-second safety timeout. A chapter request now exits the loading state with an actionable message if the local database operation does not settle.
- Changed empty or failed chapter responses to remain visible as a chapter error instead of silently reverting the reader to John 1 or leaving the previous chapter displayed under a new heading.
- Added `Try this chapter again`, which retries the current book/chapter without rebuilding or restarting the app.
- Added light- and dark-theme styling for the chapter error state in `src/styles.css`.
- Strengthened [`scripts/verify-content-database.cjs`](../scripts/verify-content-database.cjs) to check every expected book/chapter slot across the 66-book KJV corpus and parse both Strong’s and translation JSON payloads for every verse row.

### Validation

- Direct read-only SQLite inspection confirmed 66 books and no book missing chapter 1.
- Direct read-only SQLite inspection confirmed 31,102 KJV verse rows and valid JSON in every checked `strongs_json` and `translations_json` field.
- `npm run verify:database` passes after the regression-guard change: 66 books, all 1,189 expected chapters covered, 31,102 verse rows, complete English coverage, and the existing Strong’s/Vine’s/BHSA/N1904/FTS counts.
- Babel parsing passes for all 20 source JS/JSX files.
- `git diff --check` passes with the existing Windows LF-to-CRLF working-copy warnings only.
- Browser interaction testing was attempted through the local browser-control surface, but no browser instance was available in this session, so the physical selector click-through remains unverified.
- No renderer build, Android build, Windows package, phone installation, GitHub push, or release was performed.

### Follow-up

The next authorized renderer/device check should open the Bible, select books from both Old and New Testaments, select a multi-chapter book, switch chapters, and rapidly switch between two books. The expected result is that the final selected location wins, the spinner clears, and the displayed heading and verses match that final location.

## 2026-09-14 — Unreleased source continuation: Scripture handoff regression coverage

### Changed

- Added [`scripts/verify-content-links.cjs`](../scripts/verify-content-links.cjs) and the `npm run verify:links` command.
- The check loads the actual Bible book index and the structured app data modules, then sends every value under `reference`, `references`, and `reading` fields through the same `resolveBibleReference` implementation used by the renderer.
- The check covers article, Q&A, Journey, Faith, Prayer, reading-plan, testimony, Facts & Info, and Study Pack data without duplicating the resolver rules in the test.
- This creates a regression boundary for the previously reported “Open” actions: a content handoff can only be considered connected when its destination resolves against the actual packaged Bible index.
- Documented `npm run verify:links` beside the database and artwork checks in `README.md` so it remains part of the normal pre-build verification sequence.

### Validation

- `npm run verify:links` passes with 368 Scripture references across 13 data modules and 0 unresolved references.
- `node --check scripts/verify-content-links.cjs` passes.
- The README verification section now names the Scripture-link check explicitly.
- `git diff --check` passes with the existing Windows LF-to-CRLF working-copy warnings only.
- No renderer build, Android build, Windows package, phone installation, GitHub push, or release was performed.

## 2026-09-14 — Unreleased source continuation: supplied-data runtime coverage

### Changed

- Added [`scripts/verify-source-coverage.cjs`](../scripts/verify-source-coverage.cjs) and the `npm run verify:coverage` command.
- The coverage check confirms that every supplied Facts & Info document indexed from `Data/Facts & Info` has a matching educational capsule and that every capsule is used by at least one purpose-led reading path.
- The coverage check confirms that the indexed Strong’s, Vine’s, BHSA, and N1904 source groups each have corresponding runtime study rows in the packaged SQLite content boundary.
- Documented `npm run verify:coverage` in `README.md` beside the database and Scripture-link checks.

### Validation

- `npm run verify:coverage` passes: 4 Facts & Info documents map to 4 capsules and 8 reading paths; Strong’s has 14,197 runtime rows, Vine’s has 3,369, BHSA has 6,895, and N1904 has 5,339.
- `node --check scripts/verify-source-coverage.cjs` passes.
- Babel parsing continues to pass for all 20 source JS/JSX files.
- `git diff --check` passes with the existing Windows LF-to-CRLF working-copy warnings only.
- No renderer build, Android build, Windows package, phone installation, GitHub push, or release was performed.

## 2026-09-14 — v0.2.27 privacy and first-launch source slice

- Added the cinematic first-launch decision screen with the exact headline **YOU MADE THE RIGHT DECISION**.
- Added the John 14:6 affirmation, the reassurance that questions, fears, and loneliness are allowed, the closing line **Your journey begins here.**, and the illuminated **ENTER THE LIGHT** action.
- Added the immediate Privacy Protection prompt with **Enable Discreet Mode** and **Not Now** actions.
- Added the neutral Private space startup screen for later Discreet Mode launches.
- Kept the first-launch sequence automatic only until onboarding is completed. Settings can intentionally replay the onboarding sequence.
- Added an Android-only Quick close action that calls `finishAndRemoveTask()` where available and uses a normal activity finish fallback on older Android versions.
- Kept the privacy wording honest: Quick close does not erase application data, screenshots, backups, or every operating-system record.
- Improved Android biometric availability detection using the actual Android biometric capability result rather than treating every device as available.
- Kept the local PIN as a local access gate with PBKDF2 hashing and a per-install salt. The PIN is not described as encryption.
- Added Android screenshot/task-preview protection through the existing native privacy bridge when Discreet Mode is enabled.

The existing v0.2.27 artifact record belongs to the earlier build/install history in [`BUILD_PROGRESS_2026-09-13.md`](./BUILD_PROGRESS_2026-09-13.md). The multilingual and Bible reliability changes in the current worktree are later source changes and have not been packaged.

## 2026-09-14 — v0.2.26 Bible chapter local audio

- Extended the native Android `LocalTextToSpeech` fallback to the Bible Audio reader.
- Allowed chapter playback to start from the selected verse or from the beginning of the chapter.
- Kept current verse state synchronized while native Android speech advances through verses.
- Kept Android native Stop/replay behavior honest because Android Text-to-Speech does not expose a portable pause API.
- Preserved Web Speech Pause/Resume behavior where the WebView exposes Web Speech.
- Removed verse-number announcements from the spoken verse text so the audio does not repeatedly announce which verse is being read.
- Kept the system/default voice as the Android voice source. No male/female selector is used.

## 2026-09-14 — v0.2.25 native Android Text-to-Speech fallback

- Added and registered the native `LocalTextToSpeech` Capacitor plugin.
- Added native availability checks, locale application, speaking, stopping, and speech-state events.
- Added a Settings action that opens the Android system voice-language download/settings screen rather than sending the user to a phone browser.
- Added per-reading utterance IDs so unrelated audio surfaces do not react to one another’s native events.
- Kept educational-library read-aloud inside the app without downloading audio files.

## 2026-09-14 — v0.2.24 Study Pack and Downloads audio

- Extended local read-aloud to all five bundled Study Packs.
- Extended local read-aloud to generated guides reopened from the private Downloads shelf.
- Kept generated study guides readable and listenable inside the app without leaving to a browser or generating an external audio file.
- Reused the existing Study Pack and Downloads artwork.

## 2026-09-14 — v0.2.23 educational-library local read-aloud

- Added reusable local read-aloud controls to Facts & Info paths, Muslim-seeker Q&A, source-linked studies, Journey lessons, the 30-day Faith path, and guided prayers.
- Added Play, Pause, Resume, Stop, and Replay behavior for Web Speech-capable surfaces.
- Added explicit unavailable states when a device or WebView lacks a local speech engine.
- Kept readable text available even when audio is unavailable.

## 2026-09-14 — v0.2.22 Prayer learning and guided prompts

- Added a four-step Learn to Pray guide covering honest speech, asking for help, listening through Scripture, and taking a faithful next step.
- Linked each prayer-learning step to an in-app Bible reference.
- Expanded guided prayer prompts to eleven, including forgiveness, forgiving others, gratitude for mercy, and reading Scripture.
- Kept the journal local with ongoing/answered states, deletion, character limits, and private-data reset coverage.

## 2026-09-14 — v0.2.21 Facts & Info reading purposes

- Divided the eight Facts & Info educational paths into reading purposes: **Start with Jesus**, **Examine the claims**, **Respond and grow**, and **Read responsibly**.
- Preserved source-document traceability, Scripture trails, related Muslim-seeker questions, and private three-section reading checkpoints.
- Kept the supplied research material framed as source-linked educational drafts rather than final historical or doctrinal rulings.

## 2026-09-14 — v0.2.20 Home Journey continuation

- Added a Home action that opens the next available Journey lesson directly.
- Changed the action to a review shortcut for the final lesson after all seven Journey lessons are complete.
- Preserved the separate Home action that returns to the last Bible reading location.

## 2026-09-14 — v0.2.19 Home Verse of the Day explanations

- Added a locally maintained explanation for each reference in the curated 32-day Verse of the Day cycle.
- Kept explanations separate from Bible text so Scripture remains database-backed and the explanatory layer can be reviewed independently.
- Added a neutral fallback explanation for a future reference that has not yet received its own editorial explanation.

## 2026-09-14 — v0.2.18 Home daily-verse actions

- Added Save, Share, Copy fallback, and Open reference actions to the Home Verse of the Day.
- Kept sharing inside the operating-system share surface or the local clipboard fallback.
- Made the exact verse reference open in the in-app Bible reader.
- Added responsive styling for the Home verse action row.

## 2026-09-14 — v0.2.17 mission-aligned daily verse cycle

- Replaced arbitrary daily-verse selection with a curated 32-reference Jesus-centered cycle.
- Resolved each daily reference from the complete local KJV SQLite corpus.
- Verified the cycle references against the database; the 2026-09-14 selection is John 1:5.

## 2026-09-14 — v0.2.16 local daily verse

- Replaced the hard-coded Home John 1:5 card with a deterministic local daily verse loaded from SQLite.
- Used the shared stable verse ID so the daily verse participates in local bookmarks and Saved.
- Made Open today’s verse use the shared in-app Bible reference resolver.
- Kept John 1:5 as the recovery fallback when the database is unavailable.

## v0.2.15 — Facts & Info to Q&A bridge

- Expanded the Muslim-seeker Q&A library from 33 to 41 Scripture-linked guides.
- Added questions covering Jesus as the only way, repentance, the Holy Spirit, Christianity’s Middle Eastern roots, Old Testament practice, prayer to Jesus, original sin, and Christian failure.
- Added question handoffs to all eight Facts & Info paths.
- Kept the distinction between supplied-author arguments, Scripture, comparative references, and claims requiring review.

## v0.2.14 — contextual Q&A follow-up

- Added topic-aware contextual follow-up prompts to full Q&A study views.
- Added related local readings based on shared Scripture, topic, and source context.
- Kept the answer flow bounded and local rather than introducing unrestricted internet answers or an account system.

## v0.2.13 — offline Strong’s and Vine’s explorer

- Added a dedicated Learn explorer for Strong’s and Vine’s data.
- Added search by Strong’s number, lemma, transliteration, and definition.
- Added linked dictionary metadata, original-language alignment metadata, occurrence counts, and related verse navigation.
- Added normalized `bible_verse_strongs` lookup for efficient local occurrences and related-verse discovery.

## v0.2.12 — Home Facts & Info continuation

- Added a private Home Facts & Info progress card.
- Added a direct continuation handoff into the next unfinished Facts & Info path.
- Reused the Facts & Info research artwork.

## v0.2.11 — Faith-path resume state

- Added persistence for the selected Faith day.
- Added resume behavior that selects the next unfinished day in the private 30-day path.

## v0.2.10 — source-library research handoffs

- Connected indexed Facts & Info source records to practical guided reading paths.
- Added source-aware handoff guidance in the library.
- Kept raw source files outside the renderer bundle.

## v0.2.9 — Q&A detail progress

- Added the same explored/ongoing Q&A action to full article detail views.
- Kept Q&A progress local and included it in the private-data reset.

## v0.2.8 — Q&A progress

- Added private explored markers to the question shelf.
- Added topic-aware question progress indicators.

## v0.2.7 — Q&A foundations expansion

- Expanded the question library to 33 guides.
- Added Christian monotheism, Jesus’ “I am” claims, Father/Son/Spirit, and Old/New Testament introductions.

## v0.2.6 — Q&A evidence topics

- Expanded the question library to 29 guides.
- Added Bible authorship, apparent contradictions, manuscripts, translation differences, Jesus’ eternality, resurrection, and earlier Scripture comparison.

## v0.2.5 — Q&A topic organization

- Organized the question library by Jesus, God, Bible, Quran & Islam, and Salvation & Life.
- Added local topic filtering.

## v0.2.4 — Q&A content expansion

- Expanded the question library to 21 Scripture-linked questions.
- Added teaching on incarnation, God’s love, forgiveness and justice, salvation comparison, assurance, Quran–Gospel comparison, first steps, and family safety.

## v0.2.3 — Study Packs and Downloads

- Added five locally bundled Study Packs.
- Added in-app resource handoffs to Bible passages, articles, Facts & Info paths, prayer, Journey lessons, and related educational content.
- Added local pack saving and private per-resource checkpoints.
- Added locally generated plain-text guide export and a private Downloads shelf.
- Kept guide export separate from the Android APK updater.

## v0.2.2 — structured learning library

- Added the initial structured study-pack model and the controlled Ask a Question guide.
- Added natural-language aliases, curated answers, direct Scripture links, and contextual alternatives.
- Added global local search coverage for study packs, Facts & Info paths, and indexed source assets.

## v0.2.1 — responsive Android layout

- Constrained the Android viewport, application shell, main content, and page content to prevent unintended horizontal panning.
- Wrapped reader controls and replaced fixed-width Bible selectors with responsive mobile controls.
- Added safer wrapping for verse text and narrow content areas.
- Preserved shared Windows/Android renderer behavior.

## v0.2.0 — local privacy foundation

- Added the local PIN gate and five-minute inactivity locking.
- Added manual Lock now and private-data deletion controls.
- Added PBKDF2 PIN verification with a per-install salt.
- Added Android `FLAG_SECURE` request handling through the PrivacyShield bridge.
- Documented that the PIN gate is an access gate, not encryption, and cannot protect against device storage access, backups, screenshots, or a compromised device.

## v0.1.x — initial application and data foundation

- v0.1.0 added GitHub update checks and the initial mobile Android build path.
- v0.1.1 applied branded application icons and splash screens.
- v0.1.2 added responsive hero artwork for desktop and Android.
- v0.1.3 moved the local content catalog into SQLite.
- v0.1.4 added local Bible study tools and Learn search.
- v0.1.5 added the full offline 66-book Bible corpus and chapter navigation.

## Content and data inventory

The current runtime database verifies the following local content boundary:

| Content or source layer | Current verified count/status |
| --- | --- |
| Indexed `Data` source assets | 1,566 |
| Bible books | 66 |
| KJV Bible verses | 31,102 |
| Bulgarian verse coverage | 31,101 |
| Chinese verse coverage | 31,022 |
| Spanish verse coverage | 31,066 |
| Verse-to-Strong’s links | 291,919 |
| Strong’s lexicon entries | 14,197 |
| Vine’s entries | 3,369 |
| Vine’s terms | 7,575 |
| BHSA alignments | 6,895 |
| N1904 alignments | 5,339 |
| Full-text search rows | 1,566 |
| Facts & Info source DOCX files | 4 |
| Facts & Info guided paths | 8 |
| Muslim-seeker Q&A guides | 41 |
| Study Packs | 5 |
| Study Pack resources | 25 |
| Guided Bible reading plans | 5 |
| Guided reading-plan chapter stops | 39 |
| Journey lessons | 7 |
| Faith/new-believer days | 30 |
| Scripture-based testimony studies | 6 |
| Guided prayer prompts | 11 |
| Required section/hero artwork | 17/17 present |

The four supplied Facts & Info DOCX files are represented by source-linked educational capsules and purpose-led reading paths rather than copied wholesale into the renderer bundle. The app keeps their source paths, themes, Scripture trails, comparative references, and review boundaries visible. The raw files remain conversion/research inputs until redistribution is reviewed.

## Validation ledger

### Passed source/data checks

- All 20 source JS/JSX files parse successfully.
- Changed services pass `node --check`.
- `npm run verify:database` passes.
- `npm run verify:art` passes.
- `npm run verify:licenses` passes as a non-enforcing audit.
- `git diff --check` passes.
- Bible reference alias checks cover full names and common abbreviations including `Ps 23:1`, `Jn 1:1`, `Rom 8:1`, `1 Cor 15:3`, `1 Th 5:16`, `1 Sam 3`, and `Rev 21`.
- Prior read-only automatic-translation service smoke checks returned successful responses for the supported non-English target locales.

### Checks that must not be inferred

- Source parsing does not prove that a Windows or Android renderer build succeeds.
- A renderer build does not prove that the Android package is signed with the correct release identity.
- A packaged APK does not prove that it installed on a connected phone.
- A successful installation does not prove that every screen was visually or interactively tested.
- A GitHub push does not prove that the tagged release contains the intended Windows and Android assets.
- A public GitHub release does not prove that the 1,566 source assets are legally cleared.

## Known release and product gates

- The current license audit reports 0 cleared and 1,566 pending review. Run the release-enforcing audit only after content owners and reviewers have completed the manifest.
- The four bundled Bible variants and the derived Strong’s/Vine’s/BHSA/N1904 layers still require licensing, attribution, and editorial decisions before a public production content release.
- Local PIN protection is not encryption. A stronger encrypted private-state design remains a product/security task.
- Automatic translation for non-bundled languages requires a connection for the first translation and depends on the external translation service. Cached translations can be reused locally afterward.
- Automatic translation has not been visually verified on an unlocked Android device or a packaged Windows renderer in this source continuation.
- The latest current worktree changes have not been built, installed, pushed, or released.
- Community, mentor chat, cloud sync, public testimony upload, unrestricted AI answers, church finder, and other high-risk features remain outside the current safe local-first scope.

## Next work queue

This queue is intentionally updated as the product advances:

1. Continue the plan-based feature audit and repair the next verified source/runtime gap.
2. Expand practical, Jesus-centered use of the indexed Facts & Info, Strong’s, Vine’s, Hebrew, Greek, and research metadata without bundling uncleared raw files.
3. Improve private-state protection beyond the current local-storage access gate after deciding the encryption/key-storage model.
4. Complete content, theological, cultural, safety, accessibility, and redistribution review before declaring a public release ready.
5. When authorized, build the renderer and release-mode Android/Windows artifacts, verify signatures and versions, install on the connected phone only with compatible signing identity, and then update this log with exact evidence.

## 2026-09-14 — Unreleased source continuation: Bible location recovery and action-target verification

### Changed

- Normalized the Bible reader’s persisted book and chapter before the chapter-loading effect uses them. A stale book ID or out-of-range chapter is now mapped to a real runtime book and clamped to that book’s available chapter range.
- Kept the visible selector and the database request on the same normalized location, preventing an old local-storage value from leaving the reader loading a destination that the current database cannot serve.
- Improved the chapter timeout message to show the human-readable book name when a request genuinely takes too long.
- Extended `scripts/verify-content-links.cjs` to validate typed in-app actions, including Study Focus steps, Study Pack resources, and Facts & Info article handoffs. Article, Bible, path, Journey lesson, and view targets are checked against the current local destination sets.

### Validation

- `node --check scripts/verify-content-links.cjs` passed.
- `npm run verify:links` passed: 368 Scripture references and 80 in-app actions across 13 data modules, 0 unresolved.
- The source-only validation boundary remains in effect: no renderer build, APK/Windows packaging, device installation, GitHub push, or release was run.

### Boundaries and follow-up

- The connected phone and packaged runtime are still not available for visual click-through in this source continuation, so the selector behavior is structurally guarded but not device-verified here.
- Continue the plan-based audit of remaining user actions and keep the Bible/database checks in the validation ledger before any future build is authorized.

## 2026-09-14 — Unreleased source continuation: accurate content release gating

### Changed

- Updated the Settings content-stewardship card so “Release ready” is shown only when every indexed source asset has an explicit `cleared` status.
- Pending totals now equal indexed assets minus cleared assets, so any unknown or newly introduced review status cannot disappear from the count.
- Added an explicit unclassified-status count to the review notice, keeping the UI aligned with the release-enforcing license manifest.

### Validation

- Source parsing and the content-link checks remain green after the change.
- The current local audit still reports 1,566 indexed assets, 0 cleared, and 1,566 pending review.
- No renderer build, Android/Windows package, device install, GitHub push, or release was run.

### Boundaries and follow-up

- This is a source/data stewardship correction; it does not grant redistribution rights or clear any content.
- Content owners and reviewers must complete the license manifest before a release-enforcing check can pass.

## 2026-09-14 — Unreleased source continuation: explicit source-review statuses

### Changed

- Added a shared review-status label for source assets and used it in the Learn Facts & Info source cards and the complete Source Library list.
- Assets with an unrecognized review status now display `Unclassified` instead of being silently presented as ordinary review items. This matches the Settings release gate, which treats every non-`cleared` status as pending.

### Validation

- The source/data validation suite remains the authority for counts and manifest state; the current catalog is still 1,566 indexed assets with 0 cleared and 1,566 pending review.
- No renderer build, Android/Windows package, device install, GitHub push, or release was run.

### Boundaries and follow-up

- This label improves visibility only; it does not clear or authorize redistribution of any source.
- Continue connecting approved source-derived material to practical educational surfaces while preserving the raw-source licensing boundary.

## 2026-09-14 — Unreleased source continuation: direct Bible sub-surface handoffs

### Changed

- Added explicit Bible focus destinations for `read`, `audio`, and `word-study`.
- The Learn “Open audio reader” action now opens the Bible Audio tab and scrolls to the local read-aloud surface after the chapter is ready.
- Strong’s and Vine’s source-library guidance now opens the Bible and focuses the word-study card instead of dropping the user at the top of an unrelated reader view.
- Generic Bible-source guidance still opens the normal Read tab.
- Direct Scripture references and manual book/chapter changes clear any pending focus target, so an older handoff cannot steal focus after the user starts a different reading action.

### Validation

- All 368 structured Scripture references and 80 typed in-app actions still resolve through `npm run verify:links`.
- All source JS/JSX files continue to pass Babel parsing.
- No renderer build, Android/Windows package, device install, GitHub push, or release was run.

### Boundaries and follow-up

- The scroll/focus behavior is source-implemented but still needs live visual verification in a packaged renderer and on the connected Android device.
- Plan #2 remains premature because Plan #1 still has licensing, privacy-hardening, packaging, and device-verification gates open.

## 2026-09-14 — Unreleased source continuation: Discreet Mode startup enforcement

### Changed

- Android now reads a native privacy preference before Capacitor creates the WebView. Discreet Mode applies `FLAG_SECURE` during Activity creation and again on resume, closing the early startup gap around screenshots, recording, and recent-task previews.
- Android now chooses between the existing branded first-launch splash and a neutral lock-mark splash on later Discreet Mode launches. The first-launch decision flow remains branded as requested; after onboarding, the neutral startup is selected before the renderer appears.
- Electron now persists the startup privacy choice outside renderer `localStorage`, chooses the neutral or branded splash before loading the renderer, requests `setContentProtection` for the protected window, and keeps the desktop title neutral until the user enters the private space.
- Neutral desktop startup no longer loads the branded logo image at all, preventing a visible flash of Christian imagery before the neutral state is applied.
- The privacy notice now distinguishes actual Android/Windows window protection from the limits that remain: the installed launcher name and icon are still branded, OS behavior varies, and local storage is not encrypted.

### Validation

- `npm run verify:privacy` passed with checks for the Android native preference, early `FLAG_SECURE`, neutral Android splash theme, Electron content protection, pre-renderer splash selection, and the user-facing limits.
- `npm run verify:word-study`, `npm run verify:database`, `npm run verify:coverage`, `npm run verify:links`, `npm run verify:accessibility`, and `git diff --check` also passed after the privacy changes.
- The Android device was not connected during this pass, so no packaged-device screenshot/task-preview test was claimed.
- No renderer build, Android/Windows package, device install, GitHub push, or release was run for this source-only privacy continuation.

### Boundaries and follow-up

- Discreet Mode is a layered safety aid, not a guaranteed hidden identity. Someone who can inspect the launcher, app settings, storage, keyboard, clipboard, backups, screenshots from outside the protected window, or a compromised device may still discover activity.
- The new Android native preference is introduced at source level and needs to be included in the next authorized Android build before it can affect the installed APK. The current installed v0.2.28 APK does not contain this change.
- Windows content protection depends on the packaged Electron runtime and operating-system support; it cannot protect external monitors, cameras, or capture paths outside the app window.

## 2026-09-14 — Unreleased source continuation: original-language search and source handoffs

### Changed

- Corrected the Learn word-study explorer so searches can find BHSA Hebrew and N1904 Greek alignment rows by Strong’s number, lemma, transliteration, or gloss, in addition to Strong’s and Vine’s content.
- Added canonical/padded Strong-number alias handling. For example, an alignment recorded as `G0976` can now resolve to the lexicon entry recorded as `G976` instead of silently disappearing from the study trail.
- Updated the BHS / Hebrew and NA / Greek Source Library guidance so each collection explains its runtime use and offers a direct handoff into the Bible word-study surface.
- Routed Global Search research results directly into Learn’s word-study explorer with the matching search term prefilled, so a result for a Strong’s, Vine’s, BHSA, or N1904 entry opens a usable study surface immediately.
- Added `npm run verify:word-study` to protect the original-language query, alias linkage, and source-guidance routes against regression.

### Validation

- `npm run verify:word-study` passed against the packaged local database.
- The existing database, source-coverage, content-link, privacy, update-safety, legal, artwork, audio, accessibility, Bible-navigation, and review checks remain the validation set for this source continuation.
- No renderer build, Android/Windows package, device install, GitHub push, or release was run.

### Boundaries and follow-up

- BHSA/N1904 alignment rows remain review-labeled educational metadata. The raw source files are not presented as cleared public content, and licensing/editorial review remains open for the indexed Data catalog.
- The browser runtime was unavailable for this pass, so there is no new visual click-through evidence; source and database verification are reported separately from UI/device verification.

## 2026-09-14 — Unreleased source continuation: Android backup privacy boundary

### Changed

- Added Android legacy and Android 12+ backup/transfer rules that exclude the app's private local state from cloud backup and device-to-device transfer.
- Disabled Android application backup at the manifest level as an additional privacy boundary for the local-first prototype.
- Updated the Settings prototype boundary and the Discreet Mode explanation so the user can understand that saved notes, reflections, and progress are not restored automatically to another device.

### Validation

- This change is limited to Android manifest/resources and renderer copy; no build was run because the no-build boundary remains active.
- No APK/Windows package, install, GitHub push, or release was performed.

### Boundaries and follow-up

- The backup exclusion protects against ordinary Android backup and transfer. It does not provide encryption or protect data from someone with device or storage access.
- The Android manifest/resources still need a permitted release build and device verification before this privacy gate can be marked complete.

## 2026-09-14 — Unreleased source continuation: bounded PIN failure throttle

### Changed

- Added local failed-attempt tracking to the app PIN screen.
- After five incorrect PIN attempts, the screen applies an escalating temporary lockout capped at five minutes. A correct PIN or successful biometric unlock clears the counter.
- Delete private data, disabling the PIN, or creating a new PIN clears the lockout state.
- The screen keeps biometric fallback available and describes the behavior as a temporary access throttle, not encryption.

### Validation

- `npm run verify:privacy` now checks the threshold, maximum delay, failure callback, and user-facing lockout message in addition to the Android backup configuration.
- Source parsing, structured content links, source coverage, database integrity, artwork presence, license audit, and `git diff --check` remain green.
- No renderer build, Android/Windows package, device install, GitHub push, or release was run.

### Boundaries and follow-up

- The lockout is implemented in the shared renderer and persists locally; it still needs packaged Android testing for lifecycle behavior and accessibility verification.
- It slows casual repeated guessing but cannot protect data from someone with device/storage access or a compromised device.

## 2026-09-14 — Unreleased source continuation: complete privacy boundary notice

### Changed

- Expanded the in-app privacy notice to document launcher identity, the absence of app-created notifications, Android screenshot and recent-task protection requests, clipboard/share exposure, local storage and backup behavior, encryption-at-rest limits, PIN/biometric behavior, crash/log boundaries, and data deletion limits.
- Corrected the Settings Notifications row to state that this build creates no notifications or notification-history entries.
- Added responsive styling for the privacy boundary list so the explanation remains readable in the light and dark themes.

### Validation

- `npm run verify:privacy` now checks the user-facing notification, clipboard/share, encryption, and remote-logging disclosures as well as the Android backup and PIN-throttle safeguards.
- Source parsing, structured content links, source coverage, database integrity, artwork presence, license audit, and `git diff --check` remain green.
- No renderer build, Android/Windows package, device install, GitHub push, or release was run.

### Boundaries and follow-up

- The notice documents current behavior; it does not replace real Android screenshot, task-preview, backup, lockout, biometric, accessibility, or lifecycle testing.
- The prototype still uses local Web Storage without encryption at rest and retains the public product identity in its launcher label/icon.

## 2026-09-14 — Unreleased source continuation: Discreet Mode task identity handoff

### Changed

- Android now receives the renderer's `startupEntered` state alongside the stored Discreet Mode and onboarding values.
- Android applies a neutral `Private space` task title while the later neutral startup screen is waiting, then restores `From Islam to Christ` only after the user selects `OPEN PRIVATE SPACE` or otherwise intentionally enters the protected experience.
- Android now uses a durable `SharedPreferences.commit()` for the startup privacy state before acknowledging the bridge call, reducing the chance that an immediate process close loses the user's privacy choice.
- The neutral task-title behavior does not alter the installed launcher label or icon; that remaining boundary continues to be disclosed in the app's Privacy Notice.
- Added [`scripts/verify-privacy-state-matrix.cjs`](../scripts/verify-privacy-state-matrix.cjs) and `npm run verify:privacy:matrix` to exercise first launch, Discreet Mode off, active protected session, next neutral launch, and onboarding reset state expectations.

### Validation

- `npm run verify:privacy:matrix` passed: five lifecycle cases, early Android protection, neutral task identity, Electron protection, and neutral renderer wording.
- `npm run verify:privacy` passed with the Android bridge handoff, durable write, task identity, native splash, Electron protection, and privacy disclosure checks.
- `node --check scripts/verify-privacy-state-matrix.cjs`, `node --check scripts/verify-privacy-configuration.cjs`, `node --check electron/main.cjs`, and `node --check electron/preload.cjs` passed.
- `git diff --check` passed.
- No renderer build, Android/Windows package, device install, GitHub push, or release was run; the current no-build instruction remains active.

### Boundaries and follow-up

- This closes the source-level state handoff that could leave the Android task title stale, but it does not prove device behavior until this source is included in an authorized APK and tested through cold start, recent-task view, screenshot/recording attempts, entry, toggle changes, and onboarding reset.
- The existing v0.2.28 APK on the phone does not contain this continuation until a future authorized build. The phone was not connected for this source-only pass.
- Discreet Mode remains a casual-discovery and window-protection aid, not a hidden launcher identity, encrypted-storage system, or guarantee against a person with device/storage access.

## 2026-09-14 — v0.2.28 connected-phone Bible navigation smoke test

### Runtime evidence

- Confirmed the Android device `RFCRC15568L` is connected through ADB and launched the installed package `com.mcographics.fromdarknesstolight`.
- Confirmed the installed application reports version name `0.2.28`, version code `30`, and the `MainActivity` is the resumed Activity.
- Opened the Bible book picker on the phone, changed from John to Acts, and confirmed the reader reached `Acts 1` with verse-level controls exposed in the accessibility tree.
- Reopened the picker, returned to John, and confirmed the reader restored `John 1`; the user's reader location was returned to its original value after the smoke test.
- Captured and visually inspected the native Android book picker while it was open. The picker displayed the selectable book list rather than remaining on a loading-only surface.

### Boundaries

- This is runtime evidence for the already-installed v0.2.28 APK, not for the newer source-only Discreet Mode task-identity continuation. No build or reinstall was performed.
- The test covered the book/chapter navigation path only; it did not claim full feature-by-feature device QA, screenshot protection QA, recent-task QA, translation QA, or audio playback QA.
- The current no-build instruction remains active. The next privacy-specific device test requires an authorized APK build containing the source changes.

## 2026-09-15 — v0.2.28 connected-phone full feature smoke audit

### Changed

- Reset the installed Android app data on the connected Samsung `SM-G781W` (`RFCRC15568L`) and walked the first-launch Decision Screen, Privacy Protection prompt, three-step welcome guide, and Home entry flow.
- Exercised the main Android navigation surfaces: Home, Bible, Learn, Prayer, Journey, Faith, Saved, Settings, global search, About, Terms & Conditions, Rights & Usage, Credits, and the Source Library.
- Confirmed the Bible reader can change books and chapters, open in-app Scripture links from plans, Journey, articles, and Facts & Info material, and update the active reader location instead of remaining on John 1.
- Confirmed local audio playback exposes the current verse, advances the current-verse label while speaking, uses the Android system/default voice, and does not announce each verse number as an extra spoken phrase.
- Confirmed Questions Muslims Ask contains 41 categorized questions with a selectable quick-answer detail view, Facts & Info exposes eight guided study paths with source-linked Scripture trails, and an indexed source asset can open its metadata and jump to its guided path.
- Confirmed Prayer private journaling, Faith day-path content, Saved bookmarks/highlights/notes, and global search result navigation respond on-device.
- Confirmed Settings can open Android Text-to-Speech settings, switch app language, switch Light/Dark appearance, expose privacy controls, and display the rights/attribution review gate.

### Validation

- `adb shell pm clear --user 0 com.mcographics.fromdarknesstolight` completed with `Success` before the audit; the package was relaunched from a clean state.
- The installed package was verified as `com.mcographics.fromdarknesstolight`, version name `0.2.28`, version code `30`.
- In-app `Check for updates` completed against the configured GitHub release endpoint and reported: `You are running the latest Android release.` No update was downloaded or installed.
- Source Library runtime evidence showed `1,566` indexed assets, including Strong's, Vine's, Facts & Info, BHS/Hebrew, NA/Greek, and project-source groups. A Facts & Info source opened with its path, group, type, size, catalog status, runtime-use boundary, educational-use note, and guided-path action.
- With Discreet Mode enabled during the earlier reset pass, Android screenshot capture produced an empty capture and a restart opened the neutral `PRIVATE SPACE` startup surface. The installed phone build is still v0.2.28; newer source-only task-identity handoff changes are not claimed as installed.
- The updater check, reader link routing, audio progression, Q&A, Facts & Info, source review, settings, and Android TTS checks were performed without making a new build, installing a package, pushing GitHub, or changing a release.

### Findings and follow-up

- The Settings content is visible while the top app header still says `Home`; the header should reflect the active Settings/Library surface.
- The seven-item bottom navigation is too wide for this phone: the Saved icon and label are clipped at the right edge in the inspected light and dark layouts. This is an accessibility and discoverability issue.
- Spanish switching translated much of the Settings surface, but the phone was offline and reported queued/retry work (`71` items remaining after the test); several technical or image-description strings remained in English. Full automatic translation still needs a source-level localization pass and online/cache validation.
- The About/Rights panel exposed a visible close action, but Android Back did not close it during the audit; this should be made consistent with normal Android navigation.
- The Q&A detail is functional but appears far below the long 41-question list on a small screen, so the selected answer requires extensive scrolling to reach. Consider bringing the answer into a nearer detail state or adding a clearer jump affordance.
- The Source Library correctly blocks public-release assumptions: the installed UI reported `1,553` assets pending license/attribution review and `13` with notice or license material. This remains a release gate.
- Temporary audit state was cleared from the phone after testing so the device is left at a fresh first-launch state. No new build was made, and the current no-build instruction remains active.

## 2026-09-15 — Unreleased source refinement: complete John 14:6 Decision Screen verse

### Changed

- Extended the first-launch Decision Screen quotation from the opening clause of John 14:6 to the complete user-requested wording: “I am the way, the truth, and the life. No one comes to the Father except through me.”
- Kept the existing `John 14:6` reference, solemn onboarding layout, reassurance copy, “Your journey begins here.” closing, and `ENTER THE LIGHT` action unchanged.

### Validation

- Confirmed the exact new quotation is present in `src/App.jsx` under the Decision Screen's `decision-verse` block.
- `git diff --check` passed.
- No renderer build, Android/Windows package, device installation, GitHub push, or release was run. The current no-build instruction remains active.

### Boundaries and follow-up

- The phone remains reset at the already-installed v0.2.28 first-launch screen, so this source refinement will appear on the device only after a future authorized build and installation.

## 2026-09-15 — v0.2.29 Android build and connected-phone installation

### Changed

- Advanced the local package version to `0.2.29` and Android version code to `31` for the authorized phone update.
- Packaged the complete John 14:6 Decision Screen verse into the Android release assets.
- Corrected `MainActivity.onResume()` visibility from `protected` to `public` for compatibility with the current Capacitor 8 `BridgeActivity` API after the first build exposed the compiler error.
- Regenerated the versioned local content index/database metadata for `0.2.29`; the indexed catalog remains 1,566 Data assets, 66 Bible books, 31,102 verses, Strong's/Vine's data, and original-language alignments.

### Validation

- `npm run android:release` completed successfully under the scoped Temurin 21 JDK after the Android shell visibility correction. Vite transformed 54 modules and Gradle completed `assembleRelease`.
- Release-variant artifact: [`release/From-Islam-to-Christ-0.2.29-release-unsigned.apk`](../release/From-Islam-to-Christ-0.2.29-release-unsigned.apk), 42,232,229 bytes.
- Device-install artifact: [`release/From-Islam-to-Christ-0.2.29.apk`](../release/From-Islam-to-Christ-0.2.29.apk), 42,281,484 bytes, SHA-256 `E301B0456248498063615E04C0B05A1A0BEDE51D35FC7AF22A9851157B4830A`.
- `apksigner verify --verbose --print-certs` passed with APK v2 and v3. The certificate SHA-256 is `dc272c4c52d0e4fbfab20f110ce52a7ffea0fca517fa735a898100d32d90df3b`, matching the certificate previously verified on the phone.
- `adb install -r --no-incremental` returned `Success`; the app remained installed in place without an uninstall or data reset. Android reports package `com.mcographics.fromdarknesstolight`, version name `0.2.29`, version code `31`, and APK signing version 3.
- After launch, the phone accessibility tree exposed the complete Decision Screen quotation: `“I am the way, the truth, and the life. No one comes to the Father except through me.”`
- Passed `npm run verify:bible`, `npm run verify:audio`, `npm run verify:links`, `npm run verify:word-study`, `npm run verify:privacy`, `npm run verify:updates`, `npm run verify:legal`, `npm run verify:licenses`, `npm run verify:art`, `npm run verify:database`, and `git diff --check`.

### Boundaries and follow-up

- This is a local Android device update only. No Windows build, GitHub push, tag, public release, or website update was performed.
- The APK is release-variant but signed with the local debug certificate so it can update this development phone in place; it is not Google Play production-signed.
- The public GitHub v0.2.28 release and README links remain unchanged until a separate authorized cross-platform publication request.

## 2026-09-15 — v0.2.29 cross-platform release attempt and publication gates

### Build results

- Ran the newly authorized `npm run dist:win` build at package version `0.2.29`. The production renderer/data build and Electron NSIS packaging completed successfully.
- Windows artifact: [`release/From-Islam-to-Christ-0.2.29-x64.exe`](../release/From-Islam-to-Christ-0.2.29-x64.exe), 154,485,038 bytes, SHA-256 `28125A04D88A398FF6DF7A9E9C69DB2C479CF83C2A3D53A2ABBD4773529D88C0`.
- Windows blockmap: [`release/From-Islam-to-Christ-0.2.29-x64.exe.blockmap`](../release/From-Islam-to-Christ-0.2.29-x64.exe.blockmap), 162,327 bytes, SHA-256 `D869AB66647AC016F3461AA6313AAB4ECAE756D2A2798EE2D92CE9EA0F0DF8EC`.
- `release/latest.yml` was regenerated for `0.2.29`. Electron Builder reported the installer as `NotSigned` under Authenticode because no Windows signing certificate is configured; this is a release-mode installer, not a debug build, but it is not Authenticode-signed.
- The Android `assembleRelease` result and the locally debug-key-signed device copy are recorded in the preceding v0.2.29 entry. The release-mode APK itself remains unsigned until a production keystore is supplied.

### Publication and device boundaries

- The repository contains no production Android keystore, and `gh secret list --repo mcographics/FromIslamtoChrist` returned no Android signing secrets. The tag-driven release workflow therefore cannot create the requested official Android APK.
- `npm run verify:licenses -- --release` stopped at the strict release gate: all `1,566` Data assets still require license or attribution review. Audit mode passing does not mean the assets are cleared for redistribution.
- The prior v0.2.28 GitHub Actions run also exposed a workflow environment issue: the noninteractive Android SDK license step failed on the unaccepted `android-googlexr-license`. This must be corrected before relying on the hosted release workflow.
- No v0.2.29 GitHub tag/release or website update was made, and the public v0.2.28 release remains unchanged. No uninstall was performed on the phone because there is not yet an official production-signed APK to install; the connected device remains on the working local v0.2.29 release-variant install with its existing app data preserved.

### Required next action

- Configure the existing production Android signing identity in GitHub Actions using the repository secrets `ANDROID_KEYSTORE_BASE64`, `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS`, and `ANDROID_KEY_PASSWORD`, and complete the 1,566-asset rights/attribution review. Do not generate a replacement signing identity casually: changing the certificate can prevent future updates over the existing Android package.

## 2026-09-15 — Bible reader Translation button

### Changed

- Moved the Bible text/language selector out of the reader tab header and placed a clear `Translation` button in the reading-controls row directly between the `A+` font control and the `Paper` / `Sepia` / `Low light` reading-tone control.
- The button opens the configured language choices from the existing translation pipeline. Selecting a language updates the persisted Bible reader preference and immediately uses bundled verse text when available or the existing online/cached chapter translation path when it is not.
- Bundled Bible text is identified in the menu separately from online translation choices, so readers can see which options are included locally.
- Added a direct `Compare bundled text variants` action to the new menu while retaining the existing comparison view and side-panel entry point.
- Added localized labels for the new translation control and menu in the existing English, Bulgarian, Chinese, and Spanish core-copy sets.
- Added responsive and RTL-aware styling so the control and menu remain usable in the compact Android reader layout.

### Validation

- `npm run verify:bible` passed, including the new assertion that the Translation control appears before the reading-tone control and updates the selected Bible text.
- `npm run verify:privacy` passed; the Bible-specific translation boundary remains enforced.
- `npm run verify:accessibility` passed for the existing modal/dialog surfaces.
- `npm run verify:links` passed with 368 Scripture references and 80 in-app actions resolved.
- `git diff --check` passed with only the repository's normal LF-to-CRLF warnings.

### Boundaries and follow-up

- No renderer, Windows, or Android build was made for this source change, and no phone installation was changed. The new toolbar control will appear on the next authorized build/install.
- Online translation still respects the app's offline-only privacy setting and only uses cached/bundled text when network translation is unavailable.

## 2026-09-15 — v0.2.29 release-mode builds after the Translation control

### Build results

- Rebuilt both platform packages from the source that includes the Bible reader `Translation` button.
- Windows production-mode installer: [`release/From-Islam-to-Christ-0.2.29-x64.exe`](../release/From-Islam-to-Christ-0.2.29-x64.exe), 154,491,179 bytes, SHA-256 `554BBAB6F4BF4BEA3D80C60C5E6575D960C42E8BA1E33797E0E99A46788B241C`.
- Windows blockmap: [`release/From-Islam-to-Christ-0.2.29-x64.exe.blockmap`](../release/From-Islam-to-Christ-0.2.29-x64.exe.blockmap), 162,258 bytes, SHA-256 `CA06148B46AE2426B454A79F2F30B0047770125117F10A2F879480ABFB7260E6`.
- Android release-variant output: [`android/app/build/outputs/apk/release/app-release-unsigned.apk`](../android/app/build/outputs/apk/release/app-release-unsigned.apk), 42,233,213 bytes, SHA-256 `0ED1E70695D58CFDEA7FC4497460E9141B967D593AC959353D16203178B87C73`.
- Gradle `assembleRelease` completed successfully. The Android artifact is intentionally identified as unsigned: no production keystore is available in this workspace, so it is not eligible for an official public Android release or safe update over the signed phone install.
- Electron Builder completed the Windows NSIS package in release mode. `Get-AuthenticodeSignature` reports `NotSigned` because no Windows Authenticode certificate is configured.

### Validation and publication boundary

- Passed `npm run verify:bible`, `npm run verify:privacy`, `npm run verify:accessibility`, `npm run verify:links`, `npm run verify:database`, and `git diff --check` after the source update.
- The local builds are ready for inspection. The Windows installer, blockmap, `latest.yml`, and unsigned Android APK were uploaded to a maintainer-only GitHub draft release named `From Islam to Christ v0.2.29 — engineering build`; the draft is not a public end-user release.
- No public v0.2.29 GitHub binary release was published because the Android production signing and 1,566-asset licensing/attribution gates remain open.
- The public release channel therefore remains v0.2.28 until the production Android signing identity and rights review are completed.

### GitHub draft upload

- Draft release tag: `v0.2.29`.
- Uploaded Windows installer: `From-Islam-to-Christ-0.2.29-x64.exe`, 154,491,179 bytes.
- Uploaded Windows updater metadata: `From-Islam-to-Christ-0.2.29-x64.exe.blockmap` and `latest.yml`.
- Uploaded Android engineering artifact: `app-release-unsigned.apk`, 42,233,213 bytes.
- The draft must not be promoted to public until a stable production Android signing identity is configured and the rights/attribution audit is complete.

## 2026-09-15 — Reset App control

### Changed

- Added a dedicated `Reset App` section to Settings with a confirmation step so the user can intentionally return the application to a clean first-launch state.
- Reset App clears every app-owned `fdl-*` local-storage key, including future app keys added under the same namespace and the automatic translation cache. It does not touch unrelated browser/site storage or delete the read-only bundled content database.
- Reset App clears Journey lesson completion and reflections, Faith progress and testimony, questions and Facts & Info path checkpoints, Study Pack progress and saved packs, reading plans, downloaded guides, bookmarks, highlights, notes, prayer entries, saved folders, Bible location/history, reader preferences, language, appearance, Offline-only mode, privacy PIN/biometric state, and onboarding state.
- Reset App also clears active navigation/search/focus state, invalidates an in-flight Bible chapter request, returns the selected Bible location to John 1, and restores the first-launch Decision Screen followed by the Privacy Protection prompt.
- The existing Delete local data action now uses the same centralized reset implementation, so its behavior remains complete and its translation cache is also removed.
- Reset App restores the default light appearance and Discreet Mode enabled, matching the safest first-launch defaults. Android and Electron receive the reset startup state through the existing privacy bridge.

### Validation

- `npm run verify:privacy` passed with source checks for the centralized app-storage boundary, prefix cleanup, Reset App Settings surface, and first-launch startup reset.
- `npm run verify:privacy:matrix` passed for fresh launch, Discreet Mode states, protected sessions, neutral startup, and onboarding reset behavior.
- `npm run verify:accessibility` passed for the confirmation dialog surfaces and shared focus handling.
- `npm run verify:bible` passed after the reset now returns the reader location to John 1.
- `git diff --check` passed with only the repository's normal LF-to-CRLF warnings.

### Boundaries and follow-up

- This is a source/UI change only. No build, phone installation, GitHub push, or release publication was performed for this Reset App change.
- Reset App cannot erase operating-system records, screenshots, clipboard contents, external backups already made, or data copied outside the app. The privacy notice continues to explain those limits.

## 2026-09-15 — v0.2.30 Reset App release build and GitHub draft

### Changed

- Advanced the package version to `0.2.30` and Android version code to `32`.
- Included the new Settings `Reset App` flow in both platform builds. It clears app-owned `fdl-*` state, translation cache, progress, reader state, privacy state, and onboarding state, then returns the app to the first-launch Decision Screen and Privacy Protection prompt while leaving the read-only content database installed.
- Regenerated the bundled content database and license manifest. The build indexed all 1,566 Data assets, 66 Bible books, 31,102 verses, 14,197 Strong's entries, 3,369 Vine's entries, and 12,234 original-language alignments. The rights manifest still reports 1,566 assets requiring review, so presence in the app does not yet mean redistribution rights are cleared.

### Build results

- Windows NSIS release-mode installer: [`release/From-Islam-to-Christ-0.2.30-x64.exe`](../release/From-Islam-to-Christ-0.2.30-x64.exe), 154,489,983 bytes, SHA-256 `32962A6AF4E13A690CDDE9EDBF8723FB8787D7FA88B2DA8CCCF7A0B90F817086`.
- Windows updater blockmap: [`release/From-Islam-to-Christ-0.2.30-x64.exe.blockmap`](../release/From-Islam-to-Christ-0.2.30-x64.exe.blockmap), 161,416 bytes, SHA-256 `F1231CD6B7D7456A07B1673FF731471B79786E15085DBF8161CF038E09BAE849`.
- Windows updater metadata: [`release/latest.yml`](../release/latest.yml), regenerated for version `0.2.30` and pointing to the product-named installer.
- Android release-variant output: [`android/app/build/outputs/apk/release/app-release-unsigned.apk`](../android/app/build/outputs/apk/release/app-release-unsigned.apk), 42,233,777 bytes, SHA-256 `6B5F8B91E443DB0C7F7D6B05D06A52BD2A045AC8FD86604CCD1EE4693C0F39CE`.
- Android package inspection reports application ID `com.mcographics.fromdarknesstolight`, version name `0.2.30`, version code `32`, and label `From Islam to Christ`. `apksigner verify` correctly reports that this artifact does not verify because it is unsigned; it is not a debug APK, but it is not a production-installable update.
- Electron Builder completed the Windows package in release mode. `Get-AuthenticodeSignature` reports `NotSigned` because no Windows Authenticode certificate is configured.

### Validation and publication boundary

- Passed `npm run verify:privacy`, `npm run verify:privacy:matrix`, `npm run verify:accessibility`, `npm run verify:bible`, `npm run verify:updates`, `npm run verify:database`, `npm run verify:links`, and `git diff --check` before packaging. The renderer/data builds and both platform packaging commands completed successfully.
- `npm run verify:licenses -- --release` was run as the release gate and intentionally blocked publication: all 1,566 Data assets still need license or attribution review.
- Source commit `a1f5ece` was pushed to `main`, and the four artifacts were uploaded to the maintainer-only [v0.2.30 engineering draft](https://github.com/mcographics/FromIslamtoChrist/releases/tag/untagged-03a03ad95db2c1ab3688). The GitHub binary release must remain a draft until a stable production Android signing identity is configured, Windows signing is addressed as appropriate, and the 1,566-asset licensing/attribution review is complete.
- No phone installation, uninstall, or device click-through was performed in this release turn. The public updater must continue to ignore this draft and the public release channel remains on the last eligible release until the gates are closed.

## 2026-09-15 — v0.2.30 promoted to official public GitHub release

### GitHub publication

- Promoted the v0.2.30 engineering draft to the official public [From Islam to Christ v0.2.30 GitHub release](https://github.com/mcographics/FromIslamtoChrist/releases/tag/v0.2.30).
- The public release contains the Windows installer, Windows blockmap, `latest.yml`, and the Android `app-release-unsigned.apk` artifact built in the preceding entry.
- GitHub created the public `v0.2.30` tag at the pushed `main` source containing the Reset App implementation and its release documentation.
- The official release notes explicitly identify the Windows installer as release-mode but not Authenticode-signed, identify the Android file as unsigned and unsuitable for updating an existing signed install, explain that the Android in-app updater rejects unsigned APK assets, and keep the 1,566-asset rights/attribution review visible.

### Current platform boundary

- Windows users can see the public v0.2.30 release through the GitHub/Electron release channel, subject to the installer’s unsigned Authenticode status.
- Android users should not treat `app-release-unsigned.apk` as a production update. The Android updater intentionally ignores that filename because it is not a production-signed APK; a production keystore and product-named signed APK are still required for a safe Android update path.
- No phone installation or uninstall was performed when the draft was promoted. The website was not modified by this release promotion.

## 2026-09-15 — v0.2.30 local APK copies and connected-phone installation

### Device and local files

- Copied the exact v0.2.30 release-variant APK into the visible `release` folder as [`release/From-Islam-to-Christ-0.2.30-release-unsigned.apk`](../release/From-Islam-to-Christ-0.2.30-release-unsigned.apk), 42,233,777 bytes, SHA-256 `6B5F8B91E443DB0C7F7D6B05D06A52BD2A045AC8FD86604CCD1EE4693C0F39CE`.
- Created a separate device-install copy as [`release/From-Islam-to-Christ-0.2.30-device-debug-signed.apk`](../release/From-Islam-to-Christ-0.2.30-device-debug-signed.apk), 42,281,484 bytes, SHA-256 `79626E368085B9ECA74F2F383362ACA42CC2B77BD7D5A559DD94673A84B4EE8D`.
- The device copy uses the local Android debug keystore certificate SHA-256 `dc272c4c52d0e4fbfab20f110ce52a7ffea0fca517fa735a898100d32d90df3b`, the same certificate identity used by the existing phone installation. `apksigner verify` reports valid v2 and v3 signatures.

### Phone installation

- The connected Samsung SM-G781W was detected through ADB.
- Installed the device copy with `adb install -r --no-incremental`; ADB returned `Success`.
- Android now reports package `com.mcographics.fromdarknesstolight`, version name `0.2.30`, version code `32`, and APK signing version 3.
- The in-place install did not uninstall the app or reset its local app data. The public GitHub APK remains unsigned; the phone is using the separately signed local device copy.

### Boundaries

- This verifies package installation and Android package metadata, not a complete visual click-through of every app screen. The connected phone was not navigated through the full app in this action.
- The device copy is for local testing only and must not replace the production signing identity or be presented as a Google Play-signed build.

## Future entry template

Use this structure for each meaningful future change:

```markdown
## YYYY-MM-DD — [unreleased or version] — [feature/change]

### Changed

- What changed and why.
- Files/data/assets affected.
- User-visible behavior.

### Validation

- Exact checks run and their results.
- Device/runtime/build/release evidence, if actually available.

### Boundaries and follow-up

- What was not tested or is not yet implemented.
- Licensing, safety, accessibility, privacy, or release gates that remain.
```
