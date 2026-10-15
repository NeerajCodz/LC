import { expect, type Locator, type Page } from "@playwright/test";
import { FLOWERS } from "../../lib/flowers/catalog";

export const CYMES_AND_SPIKES = [
  "lupine",
  "hollyhock",
  "fritillaria",
  "tuberose",
  "ixora",
  "pentas",
  "torenia",
  "lobelia",
  "hoya",
  "impatiens",
] as const;

export function catalogSpecimen(slug: string) {
  const specimen = FLOWERS.find((flower) => flower.type === slug);
  expect(
    specimen,
    `${slug} is registered in the growing catalog`,
  ).toBeDefined();
  if (!specimen) throw new Error(`Missing registered specimen: ${slug}`);
  return specimen;
}

export async function observeRendering(page: Page) {
  const errors: string[] = [];
  let contextLosses = 0;
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (
      message.type() === "error" &&
      /shader|WebGLProgram/.test(message.text())
    )
      errors.push(message.text());
  });
  await page.exposeFunction("__recordCymesContextLoss", () => contextLosses++);
  await page.addInitScript(() => {
    const observed = window as typeof window & {
      __cymesContextLosses: number;
      __recordCymesContextLoss: () => Promise<number>;
    };
    observed.__cymesContextLosses = 0;
    document.addEventListener(
      "webglcontextlost",
      () => {
        observed.__cymesContextLosses++;
        void observed.__recordCymesContextLoss();
      },
      true,
    );
  });
  return async () => {
    expect(errors).toEqual([]);
    // The binding survives navigation, so a redirect cannot clear prior losses.
    expect(contextLosses).toBe(0);
    expect(
      await page.evaluate(
        () =>
          (window as typeof window & { __cymesContextLosses: number })
            .__cymesContextLosses,
      ),
    ).toBe(0);
  };
}

export async function expectConstrainedBuffer(canvas: Locator) {
  await expect(canvas).toHaveAttribute("data-render-budget", "mobile");
  const [width, height] = await canvas.evaluate((node) => {
    const element = node as HTMLCanvasElement;
    return [element.width, element.height];
  });
  expect(width * height).toBeLessThanOrEqual(1_500_000);
  expect(Math.max(width, height)).toBeLessThanOrEqual(4096);
}

export async function advancePublishedFrames(canvas: Locator, count = 60) {
  const before = Number(await canvas.getAttribute("data-render-frames"));
  await expect
    .poll(async () => Number(await canvas.getAttribute("data-render-frames")), {
      timeout: 120000,
    })
    .toBeGreaterThanOrEqual(before + count);
}
