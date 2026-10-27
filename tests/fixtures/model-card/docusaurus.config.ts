import type { Config } from "@docusaurus/types";
import siteConfig from "../../../docusaurus.config";

const config: Config = {
  title: "ModelCard rendering fixture",
  url: "https://example.test",
  baseUrl: "/retinalysis/",
  markdown: siteConfig.markdown,
  onBrokenLinks: "throw",
  themeConfig: { navbar: { title: "ModelCard fixture" } },
  presets: [["classic", {
    docs: {
      path: "docs", routeBasePath: "/", sidebarPath: false,
      exclude: ["model_cards/**"],
      rehypePlugins: [require("../../../scripts/model-card-sections.cjs")],
    },
    blog: false, pages: false,
    theme: { customCss: require.resolve("../../../src/css/custom.css") },
  }]],
};
export default config;
