import type { Config } from "@docusaurus/types";
const config: Config = {
  title: "Retinalysis",
  tagline: "Tools for retinal image analysis",
  url: "https://eyened.github.io",
  baseUrl: "/retinalysis/",
  organizationName: "Eyened",
  projectName: "retinalysis",
  trailingSlash: true,
  favicon: "img/mark.svg",
  onBrokenLinks: "throw",
  markdown: {
    format: "detect",
    hooks: { onBrokenMarkdownLinks: "throw" },
    async parseFrontMatter(params) {
      const parsed = await params.defaultParseFrontMatter(params);
      // Imported HF cards retain their original YAML on disk. Their metadata
      // does not describe the enclosing Docusaurus document.
      return params.filePath.replaceAll("\\", "/").includes("/docs/model_cards/")
        ? { ...parsed, frontMatter: {} }
        : parsed;
    },
  },
  i18n: { defaultLocale: "en", locales: ["en"] },
  presets: [
    [
      "classic",
      {
        docs: {
          path: "docs",
          routeBasePath: "/",
          rehypePlugins: [require("./scripts/model-card-sections.cjs")],
          exclude: [
            "**/_*.{js,jsx,ts,tsx,md,mdx}",
            "**/_*/**",
            "**/*.test.{js,jsx,ts,tsx}",
            "**/__tests__/**",
            "model_cards/**",
          ],
          sidebarPath: require.resolve("./sidebars.cjs"),
        },
        blog: false,
        pages: false,
        theme: { customCss: "./src/css/custom.css" },
      },
    ],
  ],
  themeConfig: {
    colorMode: { defaultMode: "light", disableSwitch: true },
    navbar: {
      title: "Retinalysis",
      items: [
        { type: "doc", docId: "index", label: "Home", position: "left" },
        {
          type: "docSidebar",
          sidebarId: "software",
          label: "Software",
          position: "left",
        },
        {
          type: "docSidebar",
          sidebarId: "models",
          label: "Deep learning models",
          position: "left",
        },
        {
          type: "docSidebar",
          sidebarId: "datasets",
          label: "Datasets",
          position: "left",
        },
        {
          href: "https://github.com/Eyened/retinalysis",
          label: "GitHub",
          position: "right",
        },
      ],
    },
    footer: {
      style: "light",
      copyright:
        "Retinalysis · Tools, models and datasets for retinal research.",
    },
  },
};
export default config;
