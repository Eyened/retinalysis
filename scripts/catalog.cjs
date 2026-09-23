const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const YAML = require("yaml");
const root = path.resolve(__dirname, "..");
const hash = (value) => crypto.createHash("sha256").update(value).digest("hex");
function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  if (value && typeof value === "object")
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((k) => [k, stable(value[k])]),
    );
  return value;
}
const fingerprint = (value) => hash(JSON.stringify(stable(value)));
function load(dir = root) {
  return {
    dir,
    blueprint: YAML.parse(
      fs.readFileSync(path.join(dir, "blueprint.yaml"), "utf8"),
    ),
    provenance: JSON.parse(
      fs.readFileSync(path.join(dir, "provenance.json"), "utf8"),
    ),
  };
}
function publicCatalog({ blueprint, provenance }) {
  return {
    pages: blueprint.pages
      .filter((p) => p.status !== "draft")
      .map(({ id, title, parent, route, status, summary, links }) => ({
        id,
        title,
        parent,
        route,
        status,
        summary,
        links,
      })),
    assets: Object.fromEntries(
      Object.entries(provenance.assets).map(
        ([
          id,
          { url, alt, caption, attribution, citation_url, width, height },
        ]) => [
          id,
          { url, alt, caption, attribution, citation_url, width, height },
        ],
      ),
    ),
  };
}
function sourcePaths(page, data) {
  const paths = (page.sources || []).map((p) =>
    path.relative(data.dir, path.resolve(data.dir, page.project_dir || ".", p)),
  );
  for (const id of page.figures || []) {
    const source = data.provenance.assets[id]?.source;
    if (source) paths.push(source);
  }
  return [...new Set(paths)].sort();
}
function dependencyFingerprint(page, data) {
  return fingerprint(
    (page.depends_on || []).map((id) => {
      const p = data.blueprint.pages.find((p) => p.id === id);
      const file = p && path.join(data.dir, p.page_file);
      return {
        id,
        brief: p,
        content:
          file && fs.existsSync(file) ? hash(fs.readFileSync(file)) : null,
      };
    }),
  );
}
function validate(data) {
  const errors = [];
  const { dir, blueprint, provenance } = data;
  const fail = (s) => errors.push(s);
  if (blueprint.version !== 1 || !Array.isArray(blueprint.pages))
    return ["Unsupported or missing blueprint version/pages"];
  const ids = new Set(),
    routes = new Set(),
    files = new Set();
  for (const p of blueprint.pages) {
    if (!p.id || ids.has(p.id)) fail(`Duplicate or missing id: ${p.id}`);
    ids.add(p.id);
    if (!/^\/(?:[a-z0-9/-]*)$/.test(p.route || "") || routes.has(p.route))
      fail(`Invalid or duplicate route: ${p.route}`);
    routes.add(p.route);
    if (!["draft", "published", "placeholder"].includes(p.status))
      fail(`Invalid status: ${p.id}`);
    if (
      !p.title ||
      !p.instructions ||
      !Array.isArray(p.sources) ||
      !Array.isArray(p.figures) ||
      !Array.isArray(p.links)
    )
      fail(`Incomplete brief: ${p.id}`);
    if (!/^src\/pages\/(?!.*\.\.)[^\s]+\.mdx$/.test(p.page_file || "")) {
      fail(`Unsafe page_file: ${p.id}`);
      continue;
    }
    if (files.has(p.page_file)) fail(`Duplicate page file: ${p.page_file}`);
    files.add(p.page_file);
    const file = path.join(dir, p.page_file);
    if (p.status === "draft") {
      if (fs.existsSync(file))
        fail(
          `Draft would publish a route: ${p.id}; keep draft content outside src/pages`,
        );
      continue;
    }
    if (!fs.existsSync(file)) {
      fail(`Missing page: ${p.id}`);
      continue;
    }
    const text = fs.readFileSync(file, "utf8");
    if (!text.includes(`slug: ${p.route}\n`))
      fail(`Route differs from blueprint: ${p.id}`);
    if (!text.includes(`<Page id="${p.id}">`))
      fail(`Page identity differs: ${p.id}`);
    const record = provenance.pages[p.id];
    if (
      !record ||
      (!record.editorial_source &&
        !record.source_files?.length &&
        !record.external_sources?.some((s) => s.status === "verified"))
    )
      fail(`Missing evidence record: ${p.id}`);
    if (record && record.content_sha256 !== hash(text))
      fail(`Content changed without provenance refresh: ${p.id}`);
    if (record && record.blueprint_sha256 !== fingerprint(p))
      fail(`Brief changed without provenance refresh: ${p.id}`);
    for (const source of sourcePaths(p, data)) {
      const evidence = record?.source_files?.find((s) => s.path === source);
      if (!evidence || !/^[a-f0-9]{64}$/.test(evidence.sha256 || ""))
        fail(`Missing source fingerprint ${source}: ${p.id}`);
    }
    for (const url of p.publications || [])
      if (
        !record?.external_sources?.some(
          (s) => s.url === url && s.status && s.note,
        )
      )
        fail(`Missing publication record ${url}: ${p.id}`);
    if (p.status === "placeholder") {
      const body = text
        .split(`<Page id="${p.id}">`)[1]
        ?.split("</Page>")[0]
        ?.trim();
      if (
        body !==
        '<p className="placeholder-message">Model card forthcoming.</p>'
      )
        fail(`Placeholder contains unapproved content: ${p.id}`);
      if (p.figures.length || p.figure_policy !== "none")
        fail(`Placeholder figure not allowed: ${p.id}`);
    }
    const used = [...text.matchAll(/<Figure\s+id="([^"]+)"/g)].map((m) => m[1]);
    if (p.id === "home" && text.includes("<HomeHero")) used.push("retina-hero");
    if (
      p.figure_policy === "none" &&
      (used.length || /<img\b|!\[[^\]]*\]\(/.test(text))
    )
      fail(`Figures prohibited: ${p.id}`);
    for (const id of used)
      if (!p.figures.includes(id)) fail(`Unlisted figure ${id} in ${p.id}`);
    for (const id of p.figures)
      if (!provenance.assets[id]) fail(`Missing asset provenance: ${id}`);
    for (const l of p.links)
      if (!/^https:\/\//.test(l.url || ""))
        fail(`Invalid outbound link: ${p.id}`);
  }
  for (const p of blueprint.pages) {
    let parent = p.parent;
    const seen = new Set([p.id]);
    while (parent) {
      if (seen.has(parent)) {
        fail(`Parent cycle: ${p.id}`);
        break;
      }
      seen.add(parent);
      const q = blueprint.pages.find((q) => q.id === parent);
      if (!q) {
        fail(`Unknown parent ${parent}: ${p.id}`);
        break;
      }
      if (p.status !== "draft" && q.status === "draft")
        fail(`Published child of draft parent: ${p.id}`);
      parent = q.parent;
    }
    for (const id of p.depends_on || [])
      if (!ids.has(id)) fail(`Unknown dependency ${id}: ${p.id}`);
  }
  function walk(folder) {
    if (!fs.existsSync(folder)) return;
    for (const f of fs.readdirSync(folder, { withFileTypes: true })) {
      const file = path.join(folder, f.name);
      if (f.isDirectory()) walk(file);
      else if (
        /\.(mdx?|tsx?|jsx?)$/.test(file) &&
        !files.has(path.relative(dir, file))
      )
        fail(`Page not in blueprint: ${path.relative(dir, file)}`);
    }
  }
  walk(path.join(dir, "src/pages"));
  for (const [id, a] of Object.entries(provenance.assets)) {
    if (!a.file?.startsWith("static/img/") || a.file.includes("..")) {
      fail(`Unsafe asset path: ${id}`);
      continue;
    }
    const file = path.join(dir, a.file);
    if (!fs.existsSync(file)) {
      fail(`Missing asset: ${id}`);
      continue;
    }
    if (hash(fs.readFileSync(file)) !== a.sha256)
      fail(`Asset changed without provenance refresh: ${id}`);
    for (const key of [
      "source",
      "source_sha256",
      "location",
      "transformation",
      "caption",
      "alt",
      "attribution",
      "citation_url",
      "width",
      "height",
    ])
      if (!a[key]) fail(`Missing asset ${key}: ${id}`);
    if (`/${a.file.slice(7)}` !== a.url) fail(`Asset URL mismatch: ${id}`);
  }
  return errors;
}
function status(data) {
  return data.blueprint.pages.map((p) => {
    const record = data.provenance.pages[p.id];
    const reasons = [];
    if (!record) reasons.push("NEW: no recorded review");
    if (p.status === "draft") reasons.push("DRAFT: unpublished");
    if (record && record.blueprint_sha256 !== fingerprint(p))
      reasons.push("BRIEF CHANGED");
    if (record && record.dependencies_sha256 !== dependencyFingerprint(p, data))
      reasons.push("CATALOGUE SOURCES CHANGED");
    const file = path.join(data.dir, p.page_file);
    if (
      record &&
      (!fs.existsSync(file) ||
        hash(fs.readFileSync(file)) !== record.content_sha256)
    )
      reasons.push("PAGE CHANGED OR MISSING");
    const paths = sourcePaths(p, data);
    for (const source of paths) {
      const f = path.resolve(data.dir, source);
      const prior = record?.source_files?.find((s) => s.path === source);
      if (!fs.existsSync(f)) reasons.push(`SOURCE UNAVAILABLE: ${source}`);
      else if (!prior || hash(fs.readFileSync(f)) !== prior.sha256)
        reasons.push(`SOURCE CHANGED: ${source}`);
    }
    if (record?.external_sources?.some((s) => s.status === "unavailable"))
      reasons.push("EVIDENCE GAP: see provenance");
    return {
      id: p.id,
      reasons,
      external_review: (p.publications || []).length > 0,
    };
  });
}
module.exports = {
  root,
  load,
  hash,
  fingerprint,
  sourcePaths,
  dependencyFingerprint,
  publicCatalog,
  validate,
  status,
};
