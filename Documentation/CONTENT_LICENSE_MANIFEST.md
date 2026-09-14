# Content license manifest

The build pipeline generates public/data/content-license-manifest.json from every file under Data. The manifest is an audit record, not a claim that local source files are cleared for redistribution.

Each asset record carries the fields required by the product plan:

- asset_id
- file_path
- content_type
- source
- copyright_holder
- license
- redistribution_allowed
- commercial_use_allowed
- modification_allowed
- required_attribution
- required_notice
- source_version
- review_status
- reviewed_by
- reviewed_at

The current status vocabulary is:

- needs-review — provenance, license, attribution, and redistribution status still need confirmation.
- source-notice — the file is a notice or license-related source that must be read and associated with the relevant assets.
- cleared — the record has a confirmed license, redistribution decision, reviewer, and review date.

Current local audit snapshot:

- 1,566 Data assets are represented.
- 1,553 assets are marked needs-review.
- 13 assets are marked source-notice.
- 0 assets are marked cleared.
- The manifest therefore reports releaseReady: false.

Run the non-destructive audit with:

    npm run build:data
    npm run verify:licenses

The public-release enforcement gate is available with:

    node scripts/verify-content-license-manifest.cjs --release

That command must remain blocked until every asset included in a public release has a confirmed redistribution and attribution record. The app’s Settings screen exposes the same state through Sources & attribution, and the Source Library remains the place to inspect each indexed path and review status.

## Derived runtime layers

The generated SQLite database also contains derived runtime records that are not copies of the raw research files. The current schema includes Strong's-to-BHSA Hebrew alignment metadata and Strong's-to-Nestle 1904 Greek alignment metadata, sourced from the corresponding JSON files under `Data/strongs`. These records power educational context in the Bible word-study panel and retain a `needs-review` status in the UI and release documentation.

Derived records do not clear their source material for redistribution. The raw BHS and N1904 files remain outside the renderer bundle, and the compact derived layer still requires attribution, licensing, and content review before it can be treated as release-cleared content.
