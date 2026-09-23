const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");
const { execFileSync } = require("node:child_process");
const {
  load,
  validate,
  publicCatalog,
  status,
  hash,
  fingerprint,
} = require("../scripts/catalog.cjs");
const root = path.resolve(__dirname, "..");
function fixture(t) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "retinalysis-test-"));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  for (const name of [
    "blueprint.yaml",
    "provenance.json",
    "src",
    "docs",
    "static",
    "sources",
    "scripts",
  ])
    fs.cpSync(path.join(root, name), path.join(dir, name), { recursive: true });
  fs.symlinkSync(
    path.join(root, "node_modules"),
    path.join(dir, "node_modules"),
    "dir",
  );
  return load(dir);
}
test("committed content validates without sibling source repositories", (t) => {
  assert.deepEqual(validate(fixture(t)), []);
});
test("new draft is discoverable but never enters public catalogue", (t) => {
  const data = fixture(t);
  data.blueprint.pages.push({
    ...data.blueprint.pages.find((p) => p.id === "retinalysis-models"),
    id: "new-tool",
    title: "New tool",
    route: "/software/new-tool",
    page_file: "docs/software/new-tool.mdx",
    status: "draft",
  });
  assert.deepEqual(validate(data), []);
  assert.equal(
    publicCatalog(data).pages.some((p) => p.id === "new-tool"),
    false,
  );
  assert.match(
    status(data)
      .find((p) => p.id === "new-tool")
      .reasons.join(" "),
    /NEW.*DRAFT/,
  );
  fs.writeFileSync(path.join(data.dir, "docs/software/new-tool.mdx"), "draft");
  assert.ok(validate(data).some((e) => e.includes("Draft would publish")));
});
test("changed and missing source fingerprints are candidates, not rewrites", (t) => {
  const data = fixture(t);
  const p = data.blueprint.pages.find((p) => p.id === "retinalysis-models");
  p.project_dir = ".";
  p.sources = ["fixture-source.md"];
  const file = path.join(data.dir, "fixture-source.md");
  fs.writeFileSync(file, "original");
  data.provenance.pages[p.id].source_files = [
    { path: "fixture-source.md", sha256: hash("original") },
  ];
  const original = fs.readFileSync(path.join(data.dir, p.page_file));
  fs.writeFileSync(file, "changed");
  assert.ok(
    status(data)
      .find((x) => x.id === p.id)
      .reasons.some((x) => x.startsWith("SOURCE CHANGED")),
  );
  fs.unlinkSync(file);
  assert.ok(
    status(data)
      .find((x) => x.id === p.id)
      .reasons.some((x) => x.startsWith("SOURCE UNAVAILABLE")),
  );
  assert.deepEqual(fs.readFileSync(path.join(data.dir, p.page_file)), original);
});
test("placeholder and no-figure policies catch content violations", (t) => {
  const data = fixture(t);
  const p = data.blueprint.pages.find((p) => p.id === "oct");
  fs.appendFileSync(
    path.join(data.dir, p.page_file),
    '\n<Figure id="rav-characteristics" />',
  );
  assert.ok(validate(data).some((e) => e.includes("Figures prohibited")));
  const file = path.join(data.dir, p.page_file);
  fs.writeFileSync(
    file,
    fs
      .readFileSync(file, "utf8")
      .replace("Model card forthcoming.", "Unverified performance claim."),
  );
  assert.ok(validate(data).some((e) => e.includes("Placeholder contains")));
});
test("missing image and caption fail validation", (t) => {
  const data = fixture(t);
  const a = data.provenance.assets["vascx-caliber"];
  delete a.caption;
  assert.ok(validate(data).some((e) => e.includes("Missing asset caption")));
  fs.unlinkSync(path.join(data.dir, a.file));
  assert.ok(validate(data).some((e) => e.includes("Missing asset:")));
});
test("explicit record updates preserve unrelated pages and records", (t) => {
  const data = fixture(t);
  const selected = "oct";
  const before = JSON.parse(JSON.stringify(data.provenance));
  const pageContents = Object.fromEntries(
    data.blueprint.pages
      .filter((p) => p.id !== selected)
      .map((p) => [
        p.id,
        fs.readFileSync(path.join(data.dir, p.page_file), "utf8"),
      ]),
  );
  data.provenance.pages[selected].content_sha256 = "outdated";
  fs.writeFileSync(
    path.join(data.dir, "provenance.json"),
    JSON.stringify(data.provenance),
  );
  execFileSync(process.execPath, [
    path.join(data.dir, "scripts/record.cjs"),
    selected,
  ]);
  const after = load(data.dir);
  for (const [id, record] of Object.entries(before.pages))
    if (id !== selected) assert.deepEqual(after.provenance.pages[id], record);
  for (const p of after.blueprint.pages)
    if (p.id !== selected)
      assert.equal(
        fs.readFileSync(path.join(data.dir, p.page_file), "utf8"),
        pageContents[p.id],
      );
  assert.equal(
    after.provenance.pages[selected].content_sha256,
    before.pages[selected].content_sha256,
  );
});
test("public bundle excludes editorial paths and evidence records", () => {
  const text = JSON.stringify(publicCatalog(load()));
  assert.ok(!text.includes("project_dir"));
  assert.ok(!text.includes("sha256"));
  assert.ok(!text.includes("../rtnls_"));
});
