const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");
const { execFileSync } = require("node:child_process");
const YAML = require("yaml");
const { syncModelCards } = require("../scripts/sync-model-cards.cjs");
const root = path.resolve(__dirname, "..");

function fixture(t) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "retinalysis-cards-"));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  fs.mkdirSync(path.join(dir, "docs/models"), { recursive: true });
  const source = path.join(dir, "source.md");
  const bytes = Buffer.from('\uFEFF---\r\nlibrary_name: retinalysis-inference\r\nlibrary_version: "1.2"\r\n---\r\n\r\n## Description\r\n\r\nLiteral {value}, x < y, and **formatting**.\r\n');
  fs.writeFileSync(source, bytes);
  const config = { "example.md": source };
  const save = () => fs.writeFileSync(path.join(dir, "model-cards.yaml"), YAML.stringify(config));
  save();
  return { dir, source, bytes, config, save, output: path.join(dir, "docs/model_cards/example.md") };
}

test("copies full card bytes and metadata without touching any document", (t) => {
  const f = fixture(t);
  const doc = path.join(f.dir, "docs/models/example.mdx");
  const prose = "# My document\n\nMy introduction, imports and references.\n";
  fs.writeFileSync(doc, prose);
  const result = syncModelCards(f.dir);
  assert.deepEqual(result.written, ["docs/model_cards/example.md"]);
  assert.deepEqual(fs.readFileSync(f.output), f.bytes);
  assert.deepEqual(fs.readFileSync(f.source), f.bytes);
  assert.equal(fs.readFileSync(doc, "utf8"), prose);
  const mtime = fs.statSync(f.output).mtimeMs;
  assert.deepEqual(syncModelCards(f.dir).written, []);
  assert.equal(fs.statSync(f.output).mtimeMs, mtime);
  fs.writeFileSync(f.source, "## Updated source\n");
  syncModelCards(f.dir);
  assert.equal(fs.readFileSync(f.output, "utf8"), "## Updated source\n");
  assert.equal(fs.readFileSync(doc, "utf8"), prose);
});

test("removing a mapping preserves copies and manually maintained documents", (t) => {
  const f = fixture(t);
  syncModelCards(f.dir);
  const manual = path.join(f.dir, "docs/models/example.mdx");
  fs.writeFileSync(manual, "Still imports example.md\n");
  delete f.config["example.md"];
  f.save();
  assert.deepEqual(syncModelCards(f.dir), { configured: 0, written: [] });
  assert.deepEqual(fs.readFileSync(f.output), f.bytes);
  assert.equal(fs.readFileSync(manual, "utf8"), "Still imports example.md\n");
});

test("missing sources fail before changing any copied asset", (t) => {
  const f = fixture(t);
  syncModelCards(f.dir);
  fs.writeFileSync(f.source, "Changed\n");
  f.config["missing.md"] = path.join(f.dir, "missing.md");
  f.save();
  assert.throws(() => syncModelCards(f.dir), /Cannot read model card/);
  assert.deepEqual(fs.readFileSync(f.output), f.bytes);
});

test("invalid configuration leaves the assets intact", (t) => {
  const f = fixture(t);
  syncModelCards(f.dir);
  for (const text of ["", "null", "[]", "example: [", "example: x\nexample: y\n"]) {
    fs.writeFileSync(path.join(f.dir, "model-cards.yaml"), text);
    assert.throws(() => syncModelCards(f.dir));
    assert.deepEqual(fs.readFileSync(f.output), f.bytes);
  }
});

test("rejects path traversal and relative source paths", (t) => {
  const f = fixture(t);
  for (const name of ["../outside.md", "/absolute.md", "a/../../b.md", "x.mdx", "x//y.md"]) {
    fs.writeFileSync(path.join(f.dir, "model-cards.yaml"), YAML.stringify({ [name]: f.source }));
    assert.throws(() => syncModelCards(f.dir), /Invalid model-card asset filename/);
  }
  fs.writeFileSync(path.join(f.dir, "model-cards.yaml"), "example.md: relative.md\n");
  assert.throws(() => syncModelCards(f.dir), /absolute path/);
});

test("rejects symlinked and non-directory destinations before copying", (t) => {
  const f = fixture(t);
  fs.mkdirSync(path.join(f.dir, "docs/model_cards"));
  fs.symlinkSync(f.dir, path.join(f.dir, "docs/model_cards/link"), "dir");
  f.config["link/other.md"] = f.source;
  f.save();
  assert.throws(() => syncModelCards(f.dir), /Symlink/);
  assert.ok(!fs.existsSync(f.output));
  delete f.config["link/other.md"];
  fs.writeFileSync(path.join(f.dir, "docs/model_cards/blocked"), "file");
  f.config["blocked/other.md"] = f.source;
  f.save();
  assert.throws(() => syncModelCards(f.dir), /directory|ENOTDIR/);
  assert.ok(!fs.existsSync(f.output));
});

test("supports nested asset filenames and copies Markdown without parsing it", (t) => {
  const f = fixture(t);
  fs.writeFileSync(f.source, "---\nmalformed: [\n---\nStill copied verbatim\n");
  f.config["family/card_v1.md"] = f.source;
  f.save();
  syncModelCards(f.dir);
  assert.deepEqual(fs.readFileSync(path.join(f.dir, "docs/model_cards/family/card_v1.md")), fs.readFileSync(f.source));
});

test("CLI resolves config against its repository, regardless of cwd", (t) => {
  const f = fixture(t);
  fs.mkdirSync(path.join(f.dir, "scripts"));
  fs.copyFileSync(path.join(root, "scripts/sync-model-cards.cjs"), path.join(f.dir, "scripts/sync-model-cards.cjs"));
  fs.symlinkSync(path.join(root, "node_modules"), path.join(f.dir, "node_modules"), "dir");
  const output = execFileSync(process.execPath, [path.join(f.dir, "scripts/sync-model-cards.cjs")], { cwd: os.tmpdir(), encoding: "utf8" });
  assert.match(output, /1 configured, 1 copied/);
  assert.ok(fs.existsSync(f.output));
});

test("missing local sync configuration gives setup instructions without changing assets", (t) => {
  const f = fixture(t);
  syncModelCards(f.dir);
  fs.unlinkSync(path.join(f.dir, "model-cards.yaml"));
  assert.throws(() => syncModelCards(f.dir), /Copy model-cards\.example\.yaml/);
  assert.deepEqual(fs.readFileSync(f.output), f.bytes);
});

test("page imports resolve to copied cards without local sync configuration", () => {
  const docs = path.join(root, "docs");
  let imports = 0;
  for (const file of fs.readdirSync(docs, { recursive: true })) {
    if (!/\.mdx?$/.test(file)) continue;
    const text = fs.readFileSync(path.join(docs, file), "utf8");
    for (const match of text.matchAll(/@site\/docs\/model_cards\/([^'"\s]+)/g)) {
      assert.ok(fs.existsSync(path.join(docs, "model_cards", match[1])), `${file}: ${match[1]}`);
      imports++;
    }
  }
  assert.ok(imports > 0);
});
