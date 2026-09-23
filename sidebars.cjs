const { load } = require("./scripts/catalog.cjs");
const pages = load().blueprint.pages.filter((p) => p.status !== "draft");
// Docusaurus prefixes explicit doc IDs with their containing directory.
const docId = (p) => {
  const directory = require("node:path").posix.dirname(
    p.page_file.slice("docs/".length),
  );
  return directory === "." ? p.id : `${directory}/${p.id}`;
};
function item(page) {
  const children = pages.filter((p) => p.parent === page.id);
  return children.length
    ? {
        type: "category",
        label: page.title,
        collapsed: false,
        link: { type: "doc", id: docId(page) },
        items: children.map(item),
      }
    : { type: "doc", id: docId(page), label: page.title };
}
module.exports = Object.fromEntries(
  pages
    .filter((p) => !p.parent)
    .map((section) => [
      section.id,
      [
        {
          type: "doc",
          id: docId(section),
          label:
            section.id === "home" ? "Overview" : `${section.title} overview`,
        },
        ...pages.filter((p) => p.parent === section.id).map(item),
      ],
    ]),
);
