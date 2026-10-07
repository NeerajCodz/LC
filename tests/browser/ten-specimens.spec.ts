import { test, expect } from "@playwright/test";
import { expectRenderedFlower } from "./pixel-content";

const specimens = [
  { slug: "hellebore", name: "Hellebore", latin: "Helleborus orientalis" },
  { slug: "primrose", name: "Primrose", latin: "Primula vulgaris" },
  { slug: "petunia", name: "Petunia", latin: "Petunia axillaris" },
  {
    slug: "lily-of-the-valley",
    name: "Lily of the Valley",
    latin: "Convallaria majalis",
  },
  { slug: "snowdrop", name: "Snowdrop", latin: "Galanthus nivalis" },
  { slug: "gladiolus", name: "Gladiolus", latin: "Gladiolus communis" },
  { slug: "delphinium", name: "Delphinium", latin: "Delphinium elatum" },
  { slug: "alstroemeria", name: "Alstroemeria", latin: "Alstroemeria aurea" },
  { slug: "gerbera", name: "Gerbera", latin: "Gerbera jamesonii" },
  { slug: "zinnia", name: "Zinnia", latin: "Zinnia elegans" },
];
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() =>
    Object.defineProperty(navigator, "gpu", {
      value: undefined,
      configurable: true,
    }),
  );
});
test("ten researched specimens retain physics across macro, pulse, pause and reduced motion", async ({
  page,
}, info) => {
  test.setTimeout(600000);
  for (const specimen of specimens) {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto(`/flower/${specimen.slug}/`);
    const canvas = page.locator(".flower-canvas canvas");
    await expect
      .poll(async () => Number(await canvas.getAttribute("data-petal-steps")), {
        timeout: 120000,
      })
      .toBeGreaterThan(30);
    const nodes = await canvas.getAttribute("data-petal-nodes"),
      steps = Number(await canvas.getAttribute("data-petal-steps"));
    await page
      .getByRole("button", { name: "Explore close-up", exact: true })
      .click();
    await expect
      .poll(async () => Number(await canvas.getAttribute("data-petal-steps")), {
        timeout: 60000,
      })
      .toBeGreaterThan(steps);
    await expect(canvas).toHaveAttribute("data-petal-nodes", nodes!);
    const pulse = page.getByRole("button", {
      name: "Pulse the flower",
      exact: true,
    });
    await pulse.focus();
    await pulse.press("Enter");
    await canvas.click({ position: { x: 150, y: 200 } });
    await expectRenderedFlower(canvas, 0.007);
    await page.getByRole("button", { name: "Pause motion" }).click();
    const paused = await canvas.getAttribute("data-petal-steps");
    await page.waitForTimeout(350);
    await expect(canvas).toHaveAttribute("data-petal-steps", paused!);
    await page.getByRole("button", { name: "Resume motion" }).click();
    await expect
      .poll(async () => Number(await canvas.getAttribute("data-petal-steps")), {
        timeout: 60000,
      })
      .toBeGreaterThan(Number(paused));
    await page.emulateMedia({ reducedMotion: "reduce" });
    await expect(canvas).toHaveAttribute("data-petal-physics", "settled");
    await expect(pulse).toBeDisabled();
    expect(Number(nodes)).toBeLessThanOrEqual(
      info.project.name === "mobile" ? 512 : 2048,
    );
  }
});
for (const specimen of specimens)
  test(`${specimen.slug}: seven views, bloom and collection paths`, async ({
    page,
  }, info) => {
    test.setTimeout(240000);
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (m) => {
      if (m.type() === "error" && /shader|WebGLProgram/.test(m.text()))
        errors.push(m.text());
    });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(`/flower/${specimen.slug}/`);
    await page.bringToFront();
    const canvas = page.locator(".flower-canvas canvas");
    await expect(canvas).toHaveAttribute("data-petal-physics", "settled", {
      timeout: 120000,
    });
    expect(
      Number(await canvas.getAttribute("data-petal-nodes")),
    ).toBeLessThanOrEqual(info.project.name === "mobile" ? 512 : 2048);
    const capture = async (name: string) => {
      await expectRenderedFlower(canvas, 0.007);
      const path = info.outputPath(`${specimen.slug}-${name}.png`);
      await canvas.screenshot({ path });
      await info.attach(`${specimen.slug}-${name}`, {
        path,
        contentType: "image/png",
      });
    };
    await capture("front");
    for (const [name, value] of [
      ["bud", "0"],
      ["half", "0.5"],
      ["full", "1"],
    ]) {
      await page.locator("#bloom").fill(value);
      await capture(name);
    }
    const bounds = (await canvas.boundingBox())!;
    if (info.project.name === "desktop") {
      for (const name of ["45", "side"]) {
        await page.mouse.move(
          bounds.x + bounds.width * 0.55,
          bounds.y + bounds.height * 0.45,
        );
        await page.mouse.down();
        await page.mouse.move(
          bounds.x + bounds.width * 0.38,
          bounds.y + bounds.height * 0.45,
          { steps: 12 },
        );
        await page.mouse.up();
        await capture(name);
      }
    }
    await page
      .getByRole("button", { name: "Explore close-up", exact: true })
      .click();
    await capture("macro");
    for (let i = 0; i < 3; i++) {
      await page.getByRole("button", { name: /Theme:/ }).click();
      await expectRenderedFlower(canvas, 0.007);
    }
    await page.goto("/gallery/");
    await page
      .getByRole("searchbox", { name: "Search the collection" })
      .fill(specimen.latin);
    await expect(
      page.getByRole("link", { name: `Explore ${specimen.name}`, exact: true }),
    ).toBeVisible();
    await page.goto("/garden/");
    await expect(page.locator(".bloom-loader--overlay")).toHaveCount(0, {
      timeout: 120000,
    });
    await page
      .getByRole("combobox", { name: "Explore a garden flower" })
      .selectOption(specimen.slug);
    await expectRenderedFlower(page.locator(".garden-scene canvas"), 0.007);
    await expect(
      page.getByRole("link", { name: "Specimen", exact: true }),
    ).toHaveAttribute("href", `/flower/${specimen.slug}/`);
    expect(errors).toEqual([]);
  });
