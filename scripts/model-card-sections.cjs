// Group only imported model cards; ordinary document Markdown is unchanged.
module.exports = function modelCardSections() {
  return (tree, file) => {
    if (!String(file.path).replaceAll("\\", "/").includes("/docs/model_cards/")) return;
    const depth = (node) => node.type === "element" && /^h[1-6]$/.test(node.tagName)
      ? Number(node.tagName[1]) : undefined;
    // Docusaurus wraps the first H1 in a JSX header before rehype runs.
    // Restore it here so H1 sections and a standalone card title are both handled.
    tree.children = tree.children.flatMap((node) =>
      node.type === "mdxJsxFlowElement" && node.name === "header"
        && !node.attributes.length && node.children.length === 1 && depth(node.children[0]) === 1
        ? node.children : [node],
    );
    const headings = tree.children.filter((node) => depth(node));
    // A lone leading H1 is the card title, with the sections beneath it.
    const hasTitle = depth(headings[0] ?? {}) === 1
      && headings.filter((node) => depth(node) === 1).length === 1
      && headings.length > 1;
    const sectionHeadings = hasTitle ? headings.slice(1) : headings;
    if (!sectionHeadings.length) return;
    const sectionDepth = Math.min(...sectionHeadings.map(depth));
    const children = [];
    let section;
    for (const node of tree.children) {
      if (depth(node) === sectionDepth) {
        section = {
          type: "element",
          tagName: "section",
          properties: { "data-model-card-section": true },
          children: [],
        };
        children.push(section);
      }
      if (section) section.children.push(node);
      else children.push(node);
    }
    tree.children = children;
  };
};
