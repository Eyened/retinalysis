const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");
const YAML = require("yaml");
const transform = require("../scripts/readme-pages.cjs")();
const { syncReadmes } = require("../scripts/sync-model-cards.cjs");
const root = path.resolve(__dirname, "..");
const readme = { path: "/site/docs/_readmes/retinalysis-inference.md" };
const link = (url) => ({ type: "link", url, children: [{ type: "text", value: "link" }] });
const title = () => ({ type: "heading", depth: 1, children: [{ type: "text", value: "Title" }] });

test("ordinary docs and model cards are untouched", () => {
  for (const file of ["/site/docs/software/example.md", "/site/docs/model_cards/example.md"]) {
    const tree = { type: "root", children: [title(), { type: "paragraph", children: [link("notebooks/a.ipynb")] }] };
    const before = structuredClone(tree);
    transform(tree, { path: file });
    assert.deepEqual(tree, before);
  }
});

test("drops the README title and points repository-relative targets at GitHub", () => {
  const urls = ["notebooks/a.ipynb", "./docs/guide.md#usage", "https://example.org/x", "#section", "/absolute", "mailto:a@example.org"];
  const image = { type: "image", url: "imgs/figure.png", alt: "Figure" };
  const tree = { type: "root", children: [title(),
    { type: "heading", depth: 2, children: [{ type: "text", value: "Usage" }] },
    { type: "paragraph", children: [...urls.map(link), image] }] };
  transform(tree, readme);
  assert.equal(tree.children.length, 2);
  assert.equal(tree.children[0].depth, 2);
  const base = "https://github.com/Eyened/retinalysis-inference";
  assert.deepEqual(tree.children[1].children.slice(0, 6).map((node) => node.url), [
    `${base}/blob/HEAD/notebooks/a.ipynb`, `${base}/blob/HEAD/docs/guide.md#usage`,
    "https://example.org/x", "#section", "/absolute", "mailto:a@example.org",
  ]);
  assert.equal(image.url, `${base}/raw/HEAD/imgs/figure.png`);
});

test("GitHub alerts become admonitions; ordinary quotes stay quotes", () => {
  const quote = (value) => ({ type: "blockquote", children: [{ type: "paragraph", children: [{ type: "text", value }] }] });
  const tree = { type: "root", children: [quote("[!TIP]\nUse --help."), quote("An ordinary quote."), quote("[!NOTE]")] };
  transform(tree, readme);
  assert.deepEqual(tree.children.map((node) => [node.type, node.name]), [["containerDirective", "tip"], ["blockquote", undefined], ["containerDirective", "note"]]);
  assert.equal(tree.children[0].children[0].children[0].value, "Use --help.");
  assert.deepEqual(tree.children[2].children, []);
});

test("READMEs sync byte-for-byte, and the configuration is optional", (t) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "retinalysis-readmes-"));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  assert.deepEqual(syncReadmes(dir), { configured: 0, written: [] });
  const source = path.join(dir, "README.md");
  fs.writeFileSync(source, "# Title\r\n\r\n[notebook](notebooks/a.ipynb)\r\n");
  fs.writeFileSync(path.join(dir, "readmes.yaml"), YAML.stringify({ "retinalysis-inference.md": source }));
  assert.deepEqual(syncReadmes(dir).written, ["docs/_readmes/retinalysis-inference.md"]);
  assert.deepEqual(fs.readFileSync(path.join(dir, "docs/_readmes/retinalysis-inference.md")), fs.readFileSync(source));
  assert.deepEqual(syncReadmes(dir).written, []);
});

test("page imports resolve to copied READMEs without local sync configuration", () => {
  const docs = path.join(root, "docs");
  let imports = 0;
  for (const file of fs.readdirSync(docs, { recursive: true })) {
    if (!/\.mdx?$/.test(file)) continue;
    const text = fs.readFileSync(path.join(docs, file), "utf8");
    for (const match of text.matchAll(/@site\/docs\/_readmes\/([^'"\s]+)/g)) {
      assert.ok(fs.existsSync(path.join(docs, "_readmes", match[1])), `${file}: ${match[1]}`);
      imports++;
    }
  }
  assert.ok(imports > 0);
});
