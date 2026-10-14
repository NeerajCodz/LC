import { test, expect } from "@playwright/test";
import { FLOWER_TYPES } from "../../lib/flowers/types";
import { FLOWER_STRUCTURES } from "../../lib/flowers/structures";
import { expectRenderedFlower } from "./pixel-content";
test.use({ deviceScaleFactor: 1 });

test.skip(
  process.env.DEV_INSPECTION !== "1",
  "The seven-view fixture is development-only.",
);
for (const slug of FLOWER_TYPES.filter(
  (type) => FLOWER_STRUCTURES[type].simulatedSurfaces,
))
  test(`${slug}: garden overview seven-view review`, async ({ page }, info) => {
    test.setTimeout(180000);
    await page.setViewportSize({ width: 1600, height: 1100 });
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => {
      if (
        message.type() === "error" &&
        /shader|WebGLProgram/.test(message.text())
      )
        errors.push(message.text());
    });
    await page.goto("/dev/inspection/");
    await page
      .getByRole("combobox", { name: "Inspection detail" })
      .selectOption("overview");
    await page
      .getByRole("combobox", { name: "Inspection species" })
      .selectOption(slug);
    await expectRenderedFlower(page.locator("canvas"), 0.004);
    const path = info.outputPath(`overview-${slug}.png`);
    await page.screenshot({ path });
    await info.attach("overview-seven-view", {
      path,
      contentType: "image/png",
    });
    expect(errors).toEqual([]);
  });
