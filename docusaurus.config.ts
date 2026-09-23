import type { Config } from "@docusaurus/types";
import fs from "node:fs";
import path from "node:path";
import { parse } from "yaml";
const blueprint = parse(
  fs.readFileSync(path.join(__dirname, "blueprint.yaml"), "utf8"),
);
const sections = blueprint.pages.filter(
  (p: { status: string; parent: string | null }) =>
    p.status !== "draft" && p.parent === null,
);
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
  markdown: { hooks: { onBrokenMarkdownLinks: "throw" } },
  i18n: { defaultLocale: "en", locales: ["en"] },
  plugins: [require.resolve("./plugins/catalog.cjs")],
  presets: [
    [
      "classic",
      {
        docs: {
          path: "docs",
          routeBasePath: "/",
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
        ...sections.map((p: { id: string; title: string }) => ({
          type: "docSidebar",
          sidebarId: p.id,
          label: p.id === "home" ? "Home" : p.title,
          position: "left",
        })),
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
