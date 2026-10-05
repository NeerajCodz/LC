import { test, expect } from "@playwright/test";
import { expectRenderedFlower } from "./pixel-content";
import { resolve } from "node:path";
const species = [
  "rose",
  "cyclamen",
  "snapdragon",
  "hardy-begonia",
  "hydrangea",
  "king-protea",
];
test.skip(
  process.env.DEV_INSPECTION !== "1",
  "The seven-view fixture is development-only.",
);
for (const slug of species)
  test(`${slug}: botanical seven-view inspection`, async ({ page }, info) => {
    test.setTimeout(180000);
    await page.setViewportSize({ width: 1600, height: 1100 });
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (m) => {
      if (m.type() === "error" && /shader|WebGLProgram/.test(m.text()))
        errors.push(m.text());
    });
    await page.goto("/dev/inspection/");
    await page
      .getByRole("combobox", { name: "Inspection species" })
      .selectOption(slug);
    await expectRenderedFlower(page.locator("canvas"), 0.004);
    const path = resolve(`dist/next-specimens/inspection-${slug}.png`);
    await page.screenshot({ path });
    await info.attach("seven-view-inspection", {
      path,
      contentType: "image/png",
    });
    expect(errors).toEqual([]);
  });
