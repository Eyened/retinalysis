const { test } = require("node:test");
const assert = require("node:assert/strict");
const transform = require("../scripts/model-card-sections.cjs")();
const card = { path: "/site/docs/model_cards/example.md" };
const element = (tagName, value) => ({ type: "element", tagName, properties: {}, children: [{ type: "text", value }] });

test("ordinary docs are untouched even when they have identical headings", () => {
  const tree = { type: "root", children: [element("h2", "Inference"), element("p", "Instructions")] };
  const before = structuredClone(tree);
  transform(tree, { path: "/site/docs/models/example.mdx" });
  assert.deepEqual(tree, before);
});

test("one section owns lists, code and subheadings until the next peer heading", () => {
  const title = element("h1", "Model name");
  const intro = element("p", "Introduction");
  const instructions = [element("h2", "Inference"), element("ol", "Steps"), element("pre", "predict()"), element("h3", "Outputs"), element("p", "Results")];
  const next = element("h2", "Limitations");
  const tree = { type: "root", children: [title, intro, ...instructions, next] };
  transform(tree, card);
  assert.equal(tree.children.length, 4);
  assert.equal(tree.children[0], title);
  assert.equal(tree.children[1], intro);
  assert.deepEqual(tree.children[2].children, instructions);
  assert.deepEqual(tree.children[3].children, [next]);
});

test("peer H1 headings define sections, and a card without headings is unchanged", () => {
  const headings = [element("h1", "First"), element("h1", "Second")];
  const tree = { type: "root", children: [{ type: "mdxJsxFlowElement", name: "header", attributes: [], children: [headings[0]] }, headings[1]] };
  transform(tree, card);
  assert.deepEqual(tree.children.map((section) => section.children), headings.map((heading) => [heading]));
  const plain = { type: "root", children: [element("p", "No headings")] };
  const before = structuredClone(plain);
  transform(plain, card);
  assert.deepEqual(plain, before);
});
