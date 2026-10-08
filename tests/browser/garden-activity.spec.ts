import { expect, test } from "@playwright/test";
import type { Mesh, Object3D } from "three";
import { expectRenderedFlower } from "./pixel-content";
import { trackNativeBuffers } from "./native-buffers";

test("garden close-up freezes hidden plant geometry and resumes the retained plants", async ({
  page,
}) => {
  test.setTimeout(180000);
  await page.addInitScript(trackNativeBuffers);
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "gpu", {
      value: undefined,
      configurable: true,
    });
    const diagnostics = new EventTarget();
    (
      window as typeof window & { __THREE_DEVTOOLS__: EventTarget }
    ).__THREE_DEVTOOLS__ = diagnostics;
    diagnostics.addEventListener("observe", (event) => {
      const renderer = (event as CustomEvent).detail as {
        domElement?: HTMLCanvasElement;
        render?: (scene: Object3D, camera: unknown) => void;
      };
      if (!renderer.domElement || !renderer.render) return;
      const render = renderer.render;
      renderer.render = function (scene, camera) {
        if (renderer.domElement?.closest(".garden-scene"))
          (
            window as typeof window & { lcGardenScene: Object3D }
          ).lcGardenScene = scene;
        return render.call(this, scene, camera);
      };
    });
  });
  await page.goto("/garden/");
  const canvas = page.locator(".garden-scene canvas");
  await expect(canvas).toHaveAttribute("data-render-frames", /\d+/, {
    timeout: 120000,
  });
  const bufferBytes = () =>
    canvas.evaluate((node) =>
      (
        node as HTMLCanvasElement & { nativeBufferBytes: () => number }
      ).nativeBufferBytes(),
    );
  const fullBuffers = await bufferBytes();
  expect(fullBuffers).toBeGreaterThan(1_000_000);
  await page
    .getByRole("combobox", { name: "Explore a garden flower" })
    .selectOption("rose");
  await expectRenderedFlower(canvas, 0.007);
  await expect.poll(bufferBytes).toBeLessThan(fullBuffers * 0.5);
  const hiddenVersions = () =>
    page.evaluate(() => {
      const result: Record<string, number> = {};
      (
        window as typeof window & { lcGardenScene: Object3D }
      ).lcGardenScene.traverse((node) => {
        const mesh = node as Mesh;
        if (!mesh.geometry) return;
        let ancestor: Object3D | null = node;
        let hidden = false;
        while (ancestor) {
          if (ancestor.name.startsWith("garden-plant:") && !ancestor.visible)
            hidden = true;
          ancestor = ancestor.parent;
        }
        if (hidden) {
          const attribute = mesh.geometry.getAttribute("position");
          result[mesh.geometry.uuid] =
            "version" in attribute ? attribute.version : attribute.data.version;
        }
      });
      return result;
    });
  const before = await hiddenVersions();
  expect(Object.keys(before).length).toBeGreaterThan(100);
  const frame = Number(await canvas.getAttribute("data-render-frames"));
  await expect
    .poll(async () => Number(await canvas.getAttribute("data-render-frames")), {
      timeout: 30000,
    })
    .toBeGreaterThan(frame);
  expect(await hiddenVersions()).toEqual(before);
  await page.getByRole("button", { name: "Return to garden" }).click();
  await expectRenderedFlower(canvas, 0.007);
  // Read the same retained geometries by UUID after their ancestors become visible.
  await expect
    .poll(() =>
      page.evaluate((keys) => {
        let changed = false;
        (
          window as typeof window & { lcGardenScene: Object3D }
        ).lcGardenScene.traverse((node) => {
          const mesh = node as Mesh;
          const attribute = mesh.geometry?.getAttribute("position");
          if (
            mesh.geometry &&
            attribute &&
            keys[mesh.geometry.uuid] !== undefined &&
            ("version" in attribute
              ? attribute.version
              : attribute.data.version) > keys[mesh.geometry.uuid]
          )
            changed = true;
        });
        return changed;
      }, before),
    )
    .toBe(true);
});
