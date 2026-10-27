import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const url = "http://127.0.0.1:4174/retinalysis/";

test("compact labels, expandable Markdown and thumbnails", async ({ page }, info) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(url);
  const card = page.locator("[data-model-card]").first();
  await expect(card).toBeVisible();
  await expect(page.getByText("This introduction belongs to the document.")).toBeVisible();
  await expect(page.getByText("This reference text also belongs to the document.")).toBeVisible();
  await expect(card.locator("h1, h2, h3, h4, h5, h6")).toHaveCount(0);
  await expect(card.locator("strong[data-model-card-heading]")).toHaveCount(9);
  await expect(card).not.toContainText("fixture-library");
  await expect(card.getByRole("table")).toBeVisible();
  await expect(card.locator("[data-model-card-name]")).toHaveText("Fixture model v1");
  await expect(card).toHaveCSS("box-shadow", "none");
  await expect(card).toHaveCSS("background-color", "rgb(255, 251, 237)");
  const tabBounds = (await card.locator("[data-model-card-name]").boundingBox())!;
  const headingBounds = await card.locator("[data-model-card-heading]").first().evaluate((element) => {
    const range = document.createRange();
    range.selectNodeContents(element);
    return range.getBoundingClientRect().toJSON();
  });
  expect(headingBounds.y).toBeLessThan(tabBounds.y + tabBounds.height);
  expect(headingBounds.x + headingBounds.width).toBeLessThanOrEqual(tabBounds.x);
  const sections = await card.locator("[data-model-card-section]").all();
  expect(sections.length).toBeGreaterThan(0);
  for (let i = 1; i < sections.length; i++) {
    const previous = (await sections[i - 1].boundingBox())!;
    const current = (await sections[i].boundingBox())!;
    expect(current.y).toBeGreaterThanOrEqual(previous.y + previous.height - 1);
  }

  const unnamed = page.locator("[data-model-card]").nth(1);
  await expect(unnamed.locator("[data-model-card-name]")).toHaveCount(0);
  await expect(unnamed.getByText(/Short descriptions stay visible/)).toBeVisible();
  await expect(unnamed.getByRole("region", { name: "Short notes", exact: true }).locator("details")).toHaveCount(0);
  await expect(unnamed.getByRole("region", { name: "Empty", exact: true }).locator("details")).toHaveCount(0);
  const code = unnamed.getByRole("region", { name: "Code example", exact: true });
  await expect(code.locator("details")).toHaveCount(1);
  await expect(code.locator("pre")).not.toBeVisible();
  await code.locator("summary").click();
  await expect(code.locator("pre")).toBeVisible();
  await code.locator("summary").click();
  const description = card.getByRole("region", { name: "Description", exact: true });
  const details = description.locator("details");
  await expect(details).toHaveCount(1);
  await expect(details).not.toHaveAttribute("open");
  await expect(details.locator("p").first()).not.toBeVisible();
  await expect(description.getByText("Nested inputs belong", { exact: false })).not.toBeVisible();
  await details.locator("summary").focus();
  await page.keyboard.press("Enter");
  await expect(details).toHaveAttribute("open", "");
  await expect(details.locator("p").first()).toContainText("The final sentence is deliberately outside");
  await expect(details.locator("p strong")).toHaveText("bold text");
  await expect(details.getByRole("link", { name: "reference link" })).toBeVisible();
  await expect(description.getByText("Nested inputs belong", { exact: false })).toBeVisible();
  await details.locator("summary").click();
  await expect(details.locator("p").first()).not.toBeVisible();
  await expect(card.locator("li details")).toHaveCount(0);
  for (const name of ["Inference", "Long list"]) {
    const section = card.getByRole("region", { name, exact: true });
    await expect(section.locator("details")).toHaveCount(1);
    await expect(section.locator("li").first()).not.toBeVisible();
    await section.locator("summary").click();
    await expect(section.locator("li").first()).toBeVisible();
    await expect(section.locator("li").last()).toBeVisible();
    if (name === "Inference") {
      await expect(section.locator("pre")).toHaveCount(2);
      await expect(section.locator("pre").last()).toBeVisible();
      await expect(section.getByText("The output stays", { exact: false })).toBeVisible();
      await page.screenshot({ path: info.outputPath("model-card-inference-expanded.png"), fullPage: true });
    }
    await section.locator("summary").click();
    await expect(section.locator("li").first()).not.toBeVisible();
  }
  await expect(card.getByRole("region", { name: "Limitations", exact: true }).locator("summary")).toHaveCount(0);
  for (const img of await card.locator("img").all()) {
    await img.evaluate(async (element: HTMLImageElement) => { element.loading = "eager"; await element.decode(); });
    const bounds = await img.boundingBox();
    expect(bounds!.height).toBeLessThanOrEqual(110);
    expect(bounds!.width).toBeLessThanOrEqual(180);
  }
  const originalOverflow = await page.evaluate(() => document.body.style.overflow);
  const thumbnail = card.getByRole("button", { name: "Enlarge image: Fixture diagram", exact: true });
  await thumbnail.focus();
  await page.keyboard.press("Enter");
  const dialog = page.getByRole("dialog", { name: "Image preview" });
  await expect(dialog).toBeVisible();
  const close = dialog.getByRole("button", { name: "Close image" });
  await expect(close).toBeFocused();
  await expect(dialog.getByRole("img", { name: "Fixture diagram", exact: true })).toBeVisible();
  await page.keyboard.press("Tab");
  await expect(close).toBeFocused();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.screenshot({ path: info.outputPath("model-card-image-modal.png"), fullPage: true });
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(thumbnail).toBeFocused();
  await card.getByRole("button", { name: "Enlarge image: Linked fixture diagram", exact: true }).click();
  await expect(dialog).toBeVisible();
  await close.click();
  await expect(dialog).toHaveCount(0);
  await expect(page).toHaveURL(url);
  await thumbnail.click();
  await page.mouse.click(2, 2);
  await expect(dialog).toHaveCount(0);
  await expect.poll(() => page.evaluate(() => document.body.style.overflow)).toBe(originalOverflow);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
  expect((await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze()).violations).toEqual([]);
  expect(errors).toEqual([]);
  await page.screenshot({ path: info.outputPath("model-card-compact.png"), fullPage: true });
});
