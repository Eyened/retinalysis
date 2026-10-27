import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import fs from "node:fs";
// Use the metadata from the production build, including Docusaurus's default
// routes and titles. No second page catalogue or mandatory slug is needed.
const published = new Set(
  JSON.parse(fs.readFileSync(".docusaurus/globalData.json", "utf8"))
    ["docusaurus-plugin-content-docs"].default.versions
    .flatMap((version: { docs: { id: string }[] }) => version.docs.map((doc) => doc.id)),
);
const metadataDir = ".docusaurus/docusaurus-plugin-content-docs/default";
const entries = fs.readdirSync(metadataDir)
  .filter((file) => file.endsWith(".json"))
  .map((file) => JSON.parse(fs.readFileSync(`${metadataDir}/${file}`, "utf8")))
  .filter((doc) => published.has(doc.id) && !doc.draft && doc.source?.startsWith("@site/docs/")
    && fs.existsSync(doc.source.replace("@site/", "")))
  .map((doc) => {
    const text = fs.readFileSync(doc.source.replace("@site/", ""), "utf8");
    return {
      id: doc.id.replaceAll("/", "-"),
      title: doc.frontMatter.sidebar_label ?? doc.title,
      route: doc.slug,
      hasCard: text.includes("<ModelCard "),
    };
  });
for (const entry of entries) {
  test(entry.id, async ({ page }, info) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    const response = await page.goto(
      `/retinalysis${entry.route === "/" ? "/" : entry.route + "/"}`,
    );
    expect(response?.status()).toBe(200);
    await expect(page.locator("h1")).toHaveCount(1);
    await page.evaluate(async () => {
      for (const img of Array.from(document.querySelectorAll("img"))) {
        img.loading = "eager";
        await img.decode();
      }
    });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBeTruthy();
    for (const img of await page.locator("img").all()) {
      expect(await img.getAttribute("alt")).not.toBeNull();
      if (await img.evaluate((el) => Boolean(el.closest("main"))))
        expect(await img.getAttribute("alt")).toBeTruthy();
      expect(
        await img.evaluate((el: HTMLImageElement) => el.naturalWidth),
      ).toBeGreaterThan(0);
    }
    if (entry.route === "/models/oct") {
      await expect(page.getByText("Model card forthcoming.", { exact: true })).toBeVisible();
      await expect(page.locator("main img")).toHaveCount(0);
    }
    if (["/software/retinalysis-models", "/software/retinalysis-inference"].includes(entry.route))
      await expect(page.locator("main img")).toHaveCount(0);
    if (entry.hasCard) {
      for (const card of await page.locator("[data-model-card]").all()) {
        await expect(card).toBeVisible();
        await expect(card.locator("h1, h2, h3, h4, h5, h6")).toHaveCount(0);
        await expect(card.locator("[data-model-card-heading]").first()).toBeVisible();
        // Check real imported cards, not just the isolated rendering fixture.
        // Missing Markdown grouping previously left every section inline.
        const sections = await card.locator("[data-model-card-section]").all();
        expect(sections.length).toBeGreaterThan(0);
        for (let i = 1; i < sections.length; i++) {
          const previous = (await sections[i - 1].boundingBox())!;
          const current = (await sections[i].boundingBox())!;
          expect(current.y).toBeGreaterThanOrEqual(previous.y + previous.height - 1);
        }
        await expect(card).toHaveCSS("box-shadow", "none");
        await expect(card).toHaveCSS("background-color", "rgb(255, 251, 237)");
        const tab = card.locator("[data-model-card-name]");
        if (await tab.count()) {
          const tabBounds = (await tab.boundingBox())!;
          const headingBounds = await card.locator("[data-model-card-heading]").first().evaluate((element) => {
            const range = document.createRange();
            range.selectNodeContents(element);
            return range.getBoundingClientRect().toJSON();
          });
          expect(headingBounds.y).toBeLessThan(tabBounds.y + tabBounds.height);
        }
        const inference = card.getByRole("region", { name: "Inference", exact: true });
        if (await inference.locator("pre").count()) {
          await expect(inference.locator("summary")).toHaveCount(1);
          await expect(inference.locator("pre").first()).not.toBeVisible();
          await inference.locator("summary").click();
          await expect(inference.locator("pre").last()).toBeVisible();
          await expect(inference.locator("li details")).toHaveCount(0);
          await inference.locator("summary").click();
          await expect(inference.locator("pre").last()).not.toBeVisible();
        }
      }
      await expect(page.locator("main")).not.toContainText("/home/jose");
      await expect(page.locator("main")).not.toContainText("library_name:");
    }
    const links = await page
      .locator("a[href]")
      .evaluateAll((nodes) =>
        nodes
          .map((n) => (n as HTMLAnchorElement).href)
          .filter((h) => h.startsWith(location.origin)),
      );
    for (const href of new Set(links)) {
      const u = new URL(href);
      expect(u.pathname).toMatch(/^\/retinalysis\//);
      if (u.hash) continue;
      expect((await page.request.get(href)).status(), href).toBe(200);
    }
    const a11y = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(a11y.violations).toEqual([]);
    expect(errors).toEqual([]);
    if (["/", "/software/retinalysis-vascx", "/datasets/rav", "/models/color-fundus/av-segmentation", "/models/color-fundus"].includes(entry.route))
      await page.screenshot({
        path: info.outputPath(`${entry.id}.png`),
        fullPage: true,
        scale: "css",
      });
  });
}
test("keyboard navigation and mobile menu", async ({ page }, info) => {
  await page.goto("/retinalysis/");
  await page.keyboard.press("Tab");
  await expect(page.getByText("Skip to main content")).toBeFocused();
  if (info.project.name === "mobile") {
    const toggle = page.getByRole("button", { name: "Toggle navigation bar" });
    await toggle.focus();
    await page.keyboard.press("Enter");
    await expect(page.locator(".navbar-sidebar")).toBeVisible();
    const back = page.getByRole("button", { name: /Back to main menu/ });
    if (await back.isVisible()) await back.click();
    await page
      .locator(".navbar-sidebar")
      .getByRole("link", { name: "Software", exact: true })
      .click();
  } else {
    const link = page
      .locator(".navbar")
      .getByRole("link", { name: "Software", exact: true });
    await link.focus();
    await page.keyboard.press("Enter");
  }
  await expect(page).toHaveURL(/\/retinalysis\/software\/?$/);
});

test("section hierarchy uses native docs sidebars", async ({ page }, info) => {
  const selected = entries.find((entry) => entry.hasCard)
    ?? entries.find((entry) => entry.route === "/models/color-fundus")!;
  await page.goto(`/retinalysis${selected.route}/`);
  const navbar = page.locator(".navbar");
  await expect(
    navbar.getByRole("link", { name: "retinalysis-vascx", exact: true }),
  ).toHaveCount(0);
  if (info.project.name === "mobile")
    await page.getByRole("button", { name: "Toggle navigation bar" }).click();
  const sidebar =
    info.project.name === "mobile"
      ? page.locator(".navbar-sidebar")
      : page.locator("aside");
  await expect(
    sidebar.getByRole("link", { name: "Color fundus imaging", exact: true }),
  ).toBeVisible();
  const modelTitles = entries.filter((entry) => entry.route.startsWith("/models/")).map((entry) => entry.title);
  for (const name of modelTitles)
    await expect(
      sidebar.getByRole("link", { name, exact: true }),
    ).toBeVisible();
  await expect(
    sidebar
      .locator("a.menu__link--active")
      .filter({ hasText: selected.title }),
  ).toBeVisible();
  if (info.project.name === "desktop") {
    await navbar.getByRole("link", { name: "Software", exact: true }).click();
    await expect(
      page
        .locator("aside")
        .getByRole("link", { name: "retinalysis-vascx", exact: true }),
    ).toBeVisible();
    await expect(
      page
        .locator("aside")
        .getByRole("link", { name: selected.title, exact: true }),
    ).toHaveCount(0);
  }
});


test("copied model-card assets do not publish document routes", async ({ request }) => {
  for (const name of fs.readdirSync("docs/model_cards").filter((file) => file.endsWith(".md"))) {
    const response = await request.get(`/retinalysis/model_cards/${name.slice(0, -3)}/`);
    expect(response.status()).toBe(404);
  }
});
