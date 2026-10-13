import { test, expect } from "@playwright/test";
import { expectRenderedFlower } from "./pixel-content";
import type { Fog, PerspectiveCamera, Scene, WebGLRenderer } from "three";

const specimens = [
  { slug: "pansy", name: "Pansy", latin: "Viola tricolor" },
  {
    slug: "african-violet",
    name: "African Violet",
    latin: "Streptocarpus ionanthus",
  },
  {
    slug: "bluebell",
    name: "English Bluebell",
    latin: "Hyacinthoides non-scripta",
  },
  { slug: "hyacinth", name: "Hyacinth", latin: "Hyacinthus orientalis" },
  { slug: "amaryllis", name: "Amaryllis", latin: "Hippeastrum puniceum" },
  { slug: "canna", name: "Canna", latin: "Canna indica" },
  { slug: "agapanthus", name: "Agapanthus", latin: "Agapanthus praecox" },
  { slug: "wisteria", name: "Chinese Wisteria", latin: "Wisteria sinensis" },
  {
    slug: "bottlebrush",
    name: "Crimson Bottlebrush",
    latin: "Melaleuca citrina",
  },
  { slug: "scabiosa", name: "Pincushion Flower", latin: "Scabiosa columbaria" },
];
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() =>
    Object.defineProperty(navigator, "gpu", {
      value: undefined,
      configurable: true,
    }),
  );
});
for (const specimen of specimens)
  test(`${specimen.slug}: physics survives macro, pulse, pause and reduced motion`, async ({
    page,
  }, info) => {
    test.setTimeout(180000);
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (m) => {
      if (m.type() === "error" && /shader|WebGLProgram/.test(m.text()))
        errors.push(m.text());
    });
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
    const pausedRender = Number(
      await canvas.getAttribute("data-render-frames"),
    );
    // Both counters publish in 30-frame batches. Advance through two render
    // boundaries so a broken pause cannot hide behind an unchanged cached value.
    await expect
      .poll(
        async () => Number(await canvas.getAttribute("data-render-frames")),
        {
          timeout: 120000,
        },
      )
      .toBeGreaterThanOrEqual(pausedRender + 60);
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
    expect(Number(nodes)).toBeGreaterThan(0);
    expect(errors).toEqual([]);
  });

test("tall fitted portraits remain visible across themes and restore macro fog", async ({
  page,
}) => {
  test.setTimeout(180000);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript(() => {
    const observed = window as typeof window & {
      __THREE_DEVTOOLS__: EventTarget;
      __portraitVisibility?: {
        fogNear: number;
        fogFar: number;
        cameraFar: number;
        distance: number;
        width: number;
        height: number;
      };
    };
    observed.__THREE_DEVTOOLS__ = new EventTarget();
    observed.__THREE_DEVTOOLS__.addEventListener("observe", (event) => {
      const renderer = (event as CustomEvent).detail as WebGLRenderer;
      if (!renderer.domElement || typeof renderer.render !== "function") return;
      const render = renderer.render.bind(renderer);
      renderer.render = (scene, camera) => {
        render(scene, camera);
        const fog = (scene as Scene).fog as Fog | null;
        if (
          !renderer.domElement.closest(".flower-canvas") ||
          !fog ||
          !(camera as PerspectiveCamera).isPerspectiveCamera
        )
          return;
        observed.__portraitVisibility = {
          fogNear: fog.near,
          fogFar: fog.far,
          cameraFar: (camera as PerspectiveCamera).far,
          distance: camera.position.length(),
          width: renderer.domElement.clientWidth,
          height: renderer.domElement.clientHeight,
        };
      };
    });
  });
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error" && /shader|WebGLProgram/.test(m.text()))
      errors.push(m.text());
  });
  await page.setViewportSize({ width: 700, height: 2000 });
  await page.goto("/flower/amaryllis/");
  // Exercise these exact Canvas aspects; ordinary phone layout reserves space
  // above and below the scene for its controls and is covered by the route cases.
  await page.addStyleTag({
    content: ".scene-wrap { top: 0 !important; bottom: 0 !important; }",
  });
  const canvas = page.locator(".flower-canvas canvas");
  const limits = () =>
    page.evaluate(
      () =>
        (
          window as typeof window & {
            __portraitVisibility?: {
              fogNear: number;
              fogFar: number;
              cameraFar: number;
              distance: number;
              width: number;
              height: number;
            };
          }
        ).__portraitVisibility,
    );
  for (const size of [
    { width: 700, height: 2000 },
    { width: 320, height: 1600 },
  ]) {
    await page.setViewportSize(size);
    await expect
      .poll(async () => (await limits())?.height, { timeout: 60000 })
      .toBe(size.height);
    await expect
      .poll(async () => (await limits())?.fogNear, { timeout: 60000 })
      .toBeGreaterThan(25);
    for (let theme = 0; theme < 3; theme++) {
      await page.getByRole("button", { name: /Theme:/ }).click();
      await expectRenderedFlower(canvas, 0.007);
      const range = (await limits())!;
      expect(range.width).toBe(size.width);
      expect(range.fogNear).toBeGreaterThan(range.distance);
      expect(range.cameraFar).toBeGreaterThan(range.fogFar);
    }
  }
  await page
    .getByRole("button", { name: "Explore close-up", exact: true })
    .click();
  await expect.poll(async () => (await limits())?.fogNear).toBe(11);
  expect((await limits())?.fogFar).toBe(25);
  expect((await limits())?.cameraFar).toBe(45);
  await expectRenderedFlower(canvas, 0.007);
  expect(errors).toEqual([]);
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
      for (const [name, targetAngle] of [
        ["45", Math.PI / 4],
        ["side", Math.PI / 2],
      ] as const) {
        const currentAngle = Number(
          await canvas.getAttribute("data-viewer-angle"),
        );
        const horizontal =
          ((targetAngle - currentAngle) * bounds.height) / (2 * Math.PI * 0.65);
        const startX = bounds.x + bounds.width * 0.7;
        await page.mouse.move(startX, bounds.y + bounds.height * 0.45);
        await page.mouse.down();
        await page.mouse.move(
          startX - horizontal,
          bounds.y + bounds.height * 0.45,
          { steps: 12 },
        );
        await page.mouse.up();
        await expect
          .poll(async () =>
            Math.abs(
              Number(await canvas.getAttribute("data-viewer-angle")) -
                targetAngle,
            ),
          )
          .toBeLessThan(0.04);
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
