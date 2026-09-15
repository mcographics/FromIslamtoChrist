# From Islam to Christ — Content and Data Review Report

Review date: **2026-09-14**
Review mode: **source and checked-in runtime audit; no build, package, install, or release**

This report records what was checked before the next build is authorized. It separates technical readiness, editorial readiness, and redistribution permission. A local file is not treated as cleared merely because it exists in `Data` or because it can be converted into the runtime database.

## Review result

The local prototype is technically coherent for continued development:

- 1,566 files are present in `Data` and accounted for in the content-license manifest and checked-in runtime database.
- One empty file is a known directory placeholder: `Data/n1904/docs/tutorial/images/images to be put here.txt`. There are no unexpected empty files.
- The checked-in runtime database is 77.5 MB and contains 66 Bible books, 31,102 verses, 14,197 Strong's entries, 3,369 Vine's entries, 6,895 BHSA alignments, and 5,339 N1904 alignments.
- All four Facts & Info documents have an educational capsule, and the four capsules are used across eight guided reading paths.
- The Source Library exposes named research collections plus every other indexed source group, including top-level project files.
- Raw `Data` files are not imported directly by renderer source; the renderer uses normalized runtime rows and metadata.
- The application content/link audit reports 368 Scripture references and 80 in-app actions with zero unresolved targets.

The content is **not public-release cleared**:

- The manifest currently reports `0 cleared`, `13 source-notice`, and `1,553 needs-review` assets.
- The release content gate is therefore blocked intentionally. This is a correct result until rights, attribution, source versions, and editorial approvals are recorded.
- Facts & Info capsules and Muslim-seeker Q&A are presented as review drafts or Christian explanations. They should not be described as neutral academic consensus, a complete account of Islamic belief, or a substitute for primary-source and subject-matter review.

## Source-by-source review

| Source group | Local evidence | Current app use | Review result | Required before redistribution |
| --- | --- | --- | --- | --- |
| Root translation DOCX files (`akjv`, `asv`, `bib`, `blb`, `dbt`, `drb`, `erv`, `jps`, `kjv`, `slt`, `wbt`, `ylt`) | No adjacent license or provenance record was found in the project source set. | Conversion input for bundled and future language rows. | **Pending**. Do not assume a translation edition is public domain from its abbreviation alone. | Identify the exact edition, publisher/source URL, copyright holder, edition/version, permitted redistribution and commercial-use terms, and required notice for each file. |
| `Data/strongs/kjv-HG num` | README describes the files as web-scraped KJV material with Strong's tags but does not provide a redistribution license. | KJV chapter rows, verse-to-Strong's links, and Bible navigation. | **Pending**. This is a runtime content dependency, not just a catalog file. | Confirm the exact KJV source and tagging dataset rights; add attribution and a release-specific license entry. |
| BHSA | Local README identifies the data as CC BY-NC 4.0 and gives DOI `10.17026/dans-z6y-skyh`; the local `LICENSE` is an MIT notice but does not override the README's data terms. | Hebrew/original-language alignment rows and Source Library metadata. | **Restricted/pending**. Non-commercial attribution requirements apply to the data layer. | Confirm the intended distribution is non-commercial or obtain permission; carry the attribution and DOI into in-app notices and release files. |
| BHS-Strong mapping | Local README identifies the underlying Hebrew text and ETCBC annotations, gives the Deutsche Bibelgesellschaft copyright notice, and states CC BY-NC 4.0; the adjacent license file is GPLv3 text. | Hebrew Strong's alignment rows and related word-study discovery. | **Restricted/pending**. Mixed text, annotation, and software terms must be kept separate. | Review each derived layer, preserve notices, and obtain permission for any use outside the stated non-commercial scope. |
| N1904 | Local `LICENSE.md` is MIT and the project documents Nestle 1904 provenance, but its documentation also identifies MACULA syntax, Berean Study Bible glosses, MARBLE/Louw-Nida data, and other derived layers. | Greek/original-language alignment rows and Source Library metadata. | **Pending layer review**. The repository-level MIT notice is not treated as automatic clearance for every upstream layer. | Record the exact feature layers used by the app, their upstream licenses, required attribution, and whether the combined runtime output may be redistributed. |
| Greek Strong's dictionary | `README.txt` contains release notes but no clear redistribution license. Additional local development notes are not treated as a complete license grant. | Greek lexicon rows and word-study lookup. | **Pending**. | Confirm author/source, edition, license, and attribution for the exact XML/JS data used. |
| Vine's | `vines_entries.json` has no adjacent license or provenance notice in the project source set. | New Testament word-study context and searchable Vine's terms. | **Pending**. | Confirm source edition, copyright holder, permission, and required attribution. |
| Facts & Info DOCX files | Four supplied manuscripts are present, but no local redistribution license or author permission record was found. | Paraphrased educational capsules, Q&A context, and eight guided reading paths; raw manuscripts remain outside the renderer bundle. | **Editorial and rights review pending**. Capsules are explicitly marked `review-draft`. | Confirm author permission, verify quotations and Quran/Bible references, review Arabic transliteration and historical claims, and approve language for respectful, accurate comparison. |

## Editorial and safety review outcome

The current treatment is suitable for continued private prototype work because the app now makes the boundaries visible:

- Facts & Info pages distinguish the supplied author's Christian argument from primary text, historical claims, and unresolved editorial questions.
- Q&A pages use Christian-explanation labels and tell the reader that comparative references are starting points rather than a complete summary of every Muslim belief or school.
- Source Library guidance opens practical educational or word-study surfaces instead of pretending that a raw research file is a finished public article.
- Scripture links resolve into the Bible reader, and the runtime database provides the full canonical book/chapter set for those handoffs.
- Private notes, reflections, searches, and saved state are protected from the automatic translation path; online translation is limited to public app text and can be paused with Offline-only mode.
- Settings now includes an in-app About, Terms & Conditions, Rights & Usage, and Credits record. It identifies MCOGraphics as project steward, links to the project repository and documented upstream GitHub/DOI/license pages, and repeats the distinction between project-owned work, third-party notices, and unresolved permission. These notices are plain-language product information and do not replace the source license files or legal review.

The following still require human review before a pilot or public release:

- theological and historical accuracy;
- fair representation of Islamic beliefs and primary sources;
- Arabic and Quran translation/transliteration accuracy;
- readability, tone, and pastoral safety for users who may face family or social danger;
- accessibility with large text, screen readers, RTL languages, and keyboard navigation; and
- all required copyright, attribution, and permission notices.

## Repeatable audit

Run the following checks after source/data changes. These are read-only audits and do not create a build:

```powershell
npm run verify:review
npm run verify:database
npm run verify:coverage
npm run verify:links
npm run verify:bible
npm run verify:privacy
npm run verify:licenses
npm run verify:art
npm run verify:legal
git diff --check
```

`npm run verify:review` checks manifest/Data parity, unexpected empty files, local notice evidence, Facts & Info capsule/path coverage, runtime database presence, raw-source renderer boundaries, and Source Library routing. It reports the release gate without weakening it.

The local audit performs the deepest check when the ignored `Data` directory is available. In a clean GitHub Actions checkout, where raw `Data` is intentionally absent, the same command audits the checked-in manifest, runtime database, renderer boundaries, and routing; the strict license command still requires every manifest entry to be cleared before packaging.

## Release decision

**Do not publish a new build from this review alone.** The app is good for continued local source development and review, but not yet good for a rights-cleared release. A future release review must record the exact approved asset scope, update the manifest with reviewer/date/terms, expose required attribution in the app, then run a permitted renderer/Android/Windows build and the device/accessibility checks. The existing no-build instruction remains active until the user authorizes it.
