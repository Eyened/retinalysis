import type { Config } from "@docusaurus/types";
import fs from "node:fs";
import path from "node:path";
import { parse } from "yaml";

const blueprint = parse(
  fs.readFileSync(path.join(__dirname, "blueprint.yaml"), "utf8"),
);
const visible = blueprint.pages.filter(
  (p: { status: string }) => p.status !== "draft",
);
const sections = visible.filter(
  (p: { parent: string | null; id: string }) =>
    p.parent === null && p.id !== "home",
);
const config: Config = {
  title: "retinalysis",
  tagline: "See more. Understand more.",
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
        docs: false,
        blog: false,
        pages: { mdxPageComponent: "@site/src/components/MDXPage.tsx" },
        theme: { customCss: "./src/css/custom.css" },
      },
    ],
  ],
  themeConfig: {
    colorMode: { defaultMode: "light", disableSwitch: true },
    navbar: {
      title: "retinalysis",
      logo: { alt: "", src: "img/mark.svg" },
      items: [
        ...sections.map((p: { title: string; route: string }) => ({
          label: p.title,
          to: p.route,
          position: "right",
        })),
        {
          href: "https://github.com/Eyened",
          label: "GitHub ↗",
          position: "right",
        },
      ],
    },
    footer: {
      style: "light",
      links: [
        {
          title: "Explore",
          items: sections.map((p: { title: string; route: string }) => ({
            label: p.title,
            to: p.route,
          })),
        },
        {
          title: "Elsewhere",
          items: [
            { label: "Eyened on GitHub", href: "https://github.com/Eyened" },
            {
              label: "VascX model releases",
              href: "https://huggingface.co/Eyened/vascx",
            },
          ],
        },
      ],
      copyright: "Retinalysis · Tools, models & datasets for retinal research.",
    },
  },
};
export default config;
