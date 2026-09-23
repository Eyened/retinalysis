# Maintaining the Retinalysis research site

This repository presents research tools. Detailed usage, installation and API documentation belong in the individual package repositories. `blueprint.yaml` is the authoritative catalogue and editorial brief; `provenance.json` records the evidence actually used. Neither belongs in the public interface.

## Layout and tone

Use the standard Docusaurus documentation template. Top-level blueprint entries belong in the top navbar; descendants belong in that section’s left sidebar, preserving their hierarchy. Keep `sidebars.cjs` derived from the blueprint. Use plain research and engineering prose, ordinary headings and lists. Do not introduce promotional heroes, slogans, cards, custom display typography or decorative imagery. Scientific figures belong with the relevant technical content.

## Scope comes first

- Update content only when the maintainer explicitly requests named page IDs or a clearly defined group (for example, “new draft entries”). A source change is not authorization to rewrite a page.
- For an unscoped “update the website”, run `npm run content:status`, report candidate pages and ask which to update. Do not edit content while waiting.
- Within the authorized scope, read the corresponding blueprint entries and source files before editing. Change only those pages, their selected assets/provenance and necessary catalogue/navigation summaries. Keep shared design and unrelated pages unchanged. Do not refresh unrelated fingerprints or review dates.
- Read sibling repositories without modifying them. Resolve `project_dir` relative to this repository, never relative to the shell working directory.
- New entries start as `draft`. Drafts have no file in `docs` and never enter public navigation. A request to prepare a draft does not itself authorize publication: retain draft status unless publication is included in the requested scope. Stage draft prose outside `docs` if necessary.

## Evidence and editorial rules

- Package documentation is the main source for implemented capabilities. Publications and model cards support validation claims. Report contradictions instead of choosing a convenient interpretation.
- Distinguish software capabilities, evaluated models and annotation agreement. Every performance number must identify the evaluated version, dataset, metric and evaluation setting; do not transfer published results to newer releases.
- Never invent metrics, modality support, dataset sizes, publication status, links or missing model-card content. Model placeholders contain only the title and “Model card forthcoming” until the blueprint explicitly permits content.
- Preserve established routes. Missing local sources do not authorize deleting a page. Preserve previously supported content and report inaccessible sources; omit unsupported new claims. The registration abstract returned HTTP 403 during initial preparation: the link is retained, but no abstract-only claims were added.
- Keep writing concise and research-oriented: purpose, inputs/outputs, capabilities, evidence/limitations and verified resource links. Avoid installation tutorials. Models and inference pages must not contain figures.
- Home and overview text may summarize the mission and published catalogue only; identify forthcoming entries as such.

## Figures and provenance

Use real scientific assets. Prefer existing notebook outputs. If absent, report the gap; execute only the relevant reproducible example when necessary and suitable, without changing source repositories. Do not fabricate retinal images, validation plots or results.

Record source path, SHA-256, repository revision and dirty status where available, publication version/page/figure, caption, alt text, attribution and transformation. Use web-sized derivatives without changing scientific meaning. A local paper asset may replace a published figure only after matching it against that version. RAV figures here were extracted from the stored v2 PDF; the local montage was different.

For a changed figure, update its `provenance.json` asset entry and derivative together; `content:record` does not create or verify scientific derivatives. Use only figures allowed in the entry's `figures` list and follow `figure_policy`/`asset_instructions`. Review redistribution terms and preserve attribution. Do not apply a blanket code licence to third-party figures or data.

## Requested update procedure

1. Read this file and the scoped blueprint entries. Run `npm run content:status` (read-only). Inspect actual sources, external evidence and relevant existing pages. Report missing sources or conflicting evidence.
2. Edit scoped MDX, asset records and only necessary summaries. Record external versions, access limitations and claim-specific evidence in `provenance.json`. A newly published page needs an evidence record before recording fingerprints.
3. After reviewing the content, run `npm run content:record -- <explicit-page-id> ...`. This hashes local sources and the finished page; it is not a substitute for reviewing claims. Missing source files make recording fail: preserve existing evidence rather than falsely marking inaccessible content freshly reviewed.
4. Run `npm run content:validate`, `npm run typecheck`, `npm test`, `npm run build` and `npm run test:browser` (install Chromium with `npx playwright install chromium` when needed). Inspect desktop/mobile screenshots when presentation changes.
5. Review the diff for unrelated edits, preserved routes, base-path links and source attribution. Report changed pages, evidence gaps and checks. Commit/publish only within the user's requested scope.

CI builds only committed website files; it must never read sibling projects, execute Python/notebooks, fetch source content or call an AI service. Deployment publishes the committed result. No automatic editorial refresh, analytics, search or blog.
