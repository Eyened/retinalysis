# Retinalysis

A presentation site for researchers exploring tools, deep learning models and datasets for robust, explainable retinal image analysis.

Target: [Eyened/retinalysis](https://github.com/Eyened/retinalysis) · [website](https://eyened.github.io/retinalysis/)

## Develop and check

Use the Node version in `.nvmrc` and npm. The dependency versions and lockfile are committed.

```sh
nvm use
npm ci
npm start
npm run typecheck
npm test
npm run build
npx playwright install chromium
npm run test:browser
```

Docusaurus serves standalone React/MDX pages with docs and blog disabled. The production base path is `/retinalysis/`. Use Docusaurus `Link` and `useBaseUrl` for site links/assets. CI builds from this repository alone; sibling repositories are optional editorial sources, never build dependencies.

## Content workflow

1. Maintain documentation and validated figures in the source package.
2. Add or adjust a page brief in `blueprint.yaml`. New entries start as `draft`; use a unique ID, stable route and future MDX path, but do not create a draft inside `src/pages`.
3. Request an AI update for explicit page IDs or a defined group. Follow [AGENTS.md](AGENTS.md). Source changes alone do not authorize rewrites.
4. Review the prepared content, provenance, figures and evidence gaps. Publish the entry only when requested and ready.

```sh
npm run content:status
npm run content:status -- --json
# After reviewing changes, record only the requested pages:
npm run content:record -- retinalysis-vascx
```

Status compares source and brief fingerprints, page content and catalogue dependencies. It reports missing local sources without removing pages, performs no network requests, writes nothing and calls no AI. Publication links need manual rechecking. The recorder refuses missing sources rather than claiming a new review happened. Shared asset changes should be scoped to every page that uses that asset.

`blueprint.yaml` defines intended content and ordering. `provenance.json` records actual source files/hashes, revisions, external versions and evidence gaps. Figure records contain source locations, transformations, attribution, captions and alt text. `content:record` updates only explicitly named page records, not figure derivatives or their metadata. Changing a brief or MDX requires a reviewed fingerprint refresh; a source change alone does not break the CI build.

## Layout

- `src/pages/`: finished MDX content and stable routes.
- `src/components/`, `src/css/`: shared presentation design.
- `static/img/`: selected web-sized scientific figures and branding.
- `sources/`: retained publication source material for reproducible provenance.
- `scripts/`: validation, read-only status and explicit review recording.
- `tests/`: content workflow and browser acceptance checks.
- `.github/workflows/site.yml`: PR checks and main-branch GitHub Pages deployment.

Navigation and catalogue cards derive from blueprint order; draft entries are excluded. Only public catalogue fields enter the browser bundle. Provenance and editorial source paths are not public page content.

## Sources and limitations

RAV uses arXiv **2512.17322v2**, with figures extracted from the retained PDF. Dataset terms are CC BY-NC 4.0 as stated in the paper; consult the linked repository before use. Scientific images retain their source attribution in captions and provenance; no blanket licence is imposed on third-party material.

The registration abstract returned HTTP 403; the page uses accessible package sources and avoids claims requiring that abstract. A public `Eyened/retinalysis-models` repository was unavailable during preparation, so no speculative code/documentation link is published. Model cards remain placeholders until expressly approved.

## Deployment

The workflow checks types, content, unit tests, production build and desktop/mobile browsers on pull requests. A successful push to `main` uploads the build and deploys it with GitHub Pages. In repository Settings → Pages, select **GitHub Actions**. No custom domain, sibling checkouts, Python, notebook execution, analytics or AI credentials are required.
