import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import fs from "node:fs";
import YAML from "yaml";
const entries = YAML.parse(
  fs.readFileSync("blueprint.yaml", "utf8"),
).pages.filter((p: any) => p.status !== "draft");
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
    if (entry.status === "placeholder") {
      await expect(page.locator(".page-body")).toHaveText(
        "Model card forthcoming.",
      );
      await expect(page.locator("main img")).toHaveCount(0);
    }
    if (["retinalysis-models", "retinalysis-inference"].includes(entry.id))
      await expect(page.locator("main img")).toHaveCount(0);
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
    if (["home", "retinalysis-vascx", "rav"].includes(entry.id))
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
