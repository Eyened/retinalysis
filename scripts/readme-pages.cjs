// Adapt copied repository READMEs (docs/_readmes/<repository>.md) for display
// inside a document. The copies stay byte-identical to their sources; this
// only changes how they compile. Ordinary document Markdown is unchanged.
const ORGANISATION = "https://github.com/Eyened";

module.exports = function readmePages() {
  return (tree, file) => {
    const match = String(file.path).replaceAll("\\", "/").match(/\/docs\/_readmes\/([\w.-]+)\.md$/);
    if (!match) return;
    const repository = `${ORGANISATION}/${match[1]}`;
    // The enclosing document owns the page title.
    if (tree.children[0]?.type === "heading" && tree.children[0].depth === 1) tree.children.shift();
    // Repository-relative targets do not exist on this site: point them at GitHub.
    const relative = (url) => url && !/^([a-z][a-z0-9+.-]*:|\/|#)/i.test(url);
    // HEAD is GitHub's alias for the default branch, whatever its name.
    const resolve = (url, view) => new URL(url, `${repository}/${view}/HEAD/`).href;
    // GitHub alerts ("> [!TIP]") become the equivalent Docusaurus admonitions.
    const alert = (node) => {
      const text = node.type === "blockquote" && node.children[0]?.type === "paragraph" && node.children[0].children[0];
      const kind = text?.type === "text" && text.value.match(/^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\][ \t]*(\r?\n|$)/);
      if (!kind) return;
      text.value = text.value.slice(kind[0].length);
      if (!text.value) node.children[0].children.shift();
      if (!node.children[0].children.length) node.children.shift();
      node.type = "containerDirective";
      node.name = { NOTE: "note", TIP: "tip", IMPORTANT: "info", WARNING: "warning", CAUTION: "danger" }[kind[1]];
      node.attributes = {};
    };
    const walk = (node) => {
      alert(node);
      if ((node.type === "link" || node.type === "definition") && relative(node.url)) node.url = resolve(node.url, "blob");
      if (node.type === "image" && relative(node.url)) node.url = resolve(node.url, "raw");
      node.children?.forEach(walk);
    };
    walk(tree);
  };
};
