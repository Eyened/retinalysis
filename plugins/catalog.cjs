const { load, publicCatalog } = require("../scripts/catalog.cjs");
module.exports = function catalog(context) {
  return {
    name: "retinalysis-catalog",
    getPathsToWatch: () =>
      ["blueprint.yaml", "provenance.json"].map((p) =>
        require("node:path").join(context.siteDir, p),
      ),
    async loadContent() {
      return publicCatalog(load(context.siteDir));
    },
    async contentLoaded({ content, actions }) {
      actions.setGlobalData(content);
    },
  };
};
