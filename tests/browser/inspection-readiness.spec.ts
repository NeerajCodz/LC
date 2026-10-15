import { expect, test } from "@playwright/test";
import { observeRendering } from "./cymes-and-spikes-cases";
import {
  expectInspectionLoaded,
  expectInspectionReady,
} from "./inspection-ready";
import { expectRenderedFlower } from "./pixel-content";

test.use({ deviceScaleFactor: 1 });

interface ReadyRecord {
  id: number;
  phase: number;
  name: string | null;
  quality: string | null;
  state: string | null;
  draws: number;
}
interface InspectionObservation {
  phase: number;
  draws: number;
  losses: number;
  records: ReadyRecord[];
  ids: WeakMap<Element, number>;
}
type ObservedWindow = typeof window & {
  inspectionDrawReadiness: InspectionObservation;
};

if (process.env.DEV_INSPECTION === "1") {
  test("inspection readiness follows real draws when species and detail are revisited", async ({
    page,
  }, info) => {
    test.setTimeout(180000);
    await page.setViewportSize({ width: 1600, height: 1100 });
    const healthy = await observeRendering(page);
    await page.addInitScript(() => {
      const observed = window as ObservedWindow;
      const state: InspectionObservation = {
        phase: 1,
        draws: 0,
        losses: 0,
        records: [],
        ids: new WeakMap(),
      };
      observed.inspectionDrawReadiness = state;
      document.addEventListener(
        "webglcontextlost",
        (event) => {
          if (
            event.target instanceof HTMLCanvasElement &&
            event.target.isConnected
          )
            state.losses += 1;
        },
        true,
      );
      let nextId = 0;
      const previous = new WeakMap<Element, string | null>();
      const prototype = WebGL2RenderingContext.prototype;
      for (const name of [
        "drawElements",
        "drawArrays",
        "drawElementsInstanced",
        "drawArraysInstanced",
      ] as const) {
        const original = prototype[name];
        Object.defineProperty(prototype, name, {
          configurable: true,
          writable: true,
          value: function (this: WebGL2RenderingContext, ...args: unknown[]) {
            const value = Reflect.apply(original, this, args);
            if ((this.canvas as HTMLCanvasElement).isConnected)
              state.draws += 1;
            return value;
          },
        });
      }
      const record = () => {
        for (const node of document.querySelectorAll(
          "[data-inspection-view]",
        )) {
          const ready = node.getAttribute("data-inspection-ready");
          if (previous.has(node) && previous.get(node) === ready) continue;
          previous.set(node, ready);
          if (!state.ids.has(node)) state.ids.set(node, ++nextId);
          if (state.records.length < 128)
            state.records.push({
              id: state.ids.get(node)!,
              phase: state.phase,
              name: node.getAttribute("data-inspection-view"),
              quality: node.getAttribute("data-inspection-quality"),
              state: ready,
              draws: state.draws,
            });
        }
      };
      new MutationObserver(record).observe(document, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["data-inspection-ready"],
      });
      record();
    });
    await page.goto("/dev/inspection/");
    await expectInspectionLoaded(page);
    const canvas = page.locator("canvas");
    await expectInspectionReady(page);
    const retainedCanvas = await canvas.elementHandle();
    if (!retainedCanvas) throw new Error("Missing inspection canvas");
    const cohorts: { phase: number; ids: number[] }[] = [];
    const checkCohort = async (phase: number) => {
      await expect(page.locator("[data-inspection-view]")).toHaveCount(7);
      await expectInspectionReady(page);
      await expectRenderedFlower(canvas, 0.004);
      const cohort = await page
        .locator("[data-inspection-view]")
        .evaluateAll((views) => {
          const observed = window as ObservedWindow;
          return views.map((view) => {
            const id = observed.inspectionDrawReadiness.ids.get(view);
            return {
              id,
              records: observed.inspectionDrawReadiness.records.filter(
                (record) => record.id === id,
              ),
            };
          });
        });
      const ids: number[] = [];
      for (const tile of cohort) {
        expect(tile.id).toBeDefined();
        const pending = tile.records.find(
            (record) => record.state === "pending",
          ),
          ready = tile.records.find((record) => record.state === "ready");
        expect(pending?.phase).toBe(phase);
        expect(ready?.phase).toBe(phase);
        expect(ready!.draws).toBeGreaterThan(pending!.draws);
        ids.push(tile.id!);
      }
      for (const previous of cohorts)
        expect(ids.filter((id) => previous.ids.includes(id))).toEqual([]);
      cohorts.push({ phase, ids });
      expect(
        await canvas.evaluate(
          (current, original) => current === original,
          retainedCanvas,
        ),
      ).toBe(true);
    };
    await checkCohort(1);
    for (const [index, action] of [
      { control: "Inspection species", value: "fuchsia" },
      { control: "Inspection species", value: "rose" },
      { control: "Inspection detail", value: "overview" },
      { control: "Inspection detail", value: "specimen" },
    ].entries()) {
      const phase = index + 2;
      await page.evaluate((next) => {
        (window as ObservedWindow).inspectionDrawReadiness.phase = next;
      }, phase);
      await page
        .getByRole("combobox", { name: action.control, exact: true })
        .selectOption(action.value);
      await checkCohort(phase);
    }
    await healthy();
    const retryErrors: string[] = [];
    page.on("pageerror", (error) => retryErrors.push(error.message));
    page.on("console", (message) => {
      if (
        message.type() === "error" &&
        /shader|WebGLProgram/.test(message.text())
      )
        retryErrors.push(message.text());
    });
    await page.evaluate(() => {
      const state = (window as ObservedWindow).inspectionDrawReadiness;
      state.phase = 6;
    });
    // Exercise SafeCanvas's real failure/retry branch without depending on an optional extension.
    await canvas.evaluate((node) =>
      node.dispatchEvent(new Event("webglcontextlost", { cancelable: true })),
    );
    await expect(canvas).toHaveCount(0);
    await expect
      .poll(() =>
        page
          .locator("[data-inspection-view]")
          .evaluateAll(
            (views) =>
              views.length === 7 &&
              views.every(
                (view) =>
                  view.getAttribute("data-inspection-ready") === "pending",
              ),
          ),
      )
      .toBe(true);
    const retry = page.getByRole("button", {
      name: "Try 3D again",
      exact: true,
    });
    // The inspection surface is pointer-transparent; native keyboard activation remains available.
    await retry.focus();
    await retry.press("Enter");
    await expectInspectionReady(page);
    await expectRenderedFlower(canvas, 0.004);
    expect(
      await canvas.evaluate(
        (current, original) => current === original,
        retainedCanvas,
      ),
    ).toBe(false);
    const retryRecords = await page.evaluate(() =>
      (window as ObservedWindow).inspectionDrawReadiness.records.filter(
        (record) => record.phase === 6,
      ),
    );
    for (const id of cohorts.at(-1)!.ids) {
      const pending = retryRecords.find(
          (record) => record.id === id && record.state === "pending",
        ),
        ready = retryRecords.find(
          (record) => record.id === id && record.state === "ready",
        );
      expect(pending).toBeDefined();
      expect(ready).toBeDefined();
      expect(ready!.draws).toBeGreaterThan(pending!.draws);
    }
    expect(
      await page.evaluate(
        () => (window as ObservedWindow).inspectionDrawReadiness.losses,
      ),
    ).toBe(1);
    expect(retryErrors).toEqual([]);
    await info.attach("inspection-draw-readiness", {
      body: Buffer.from(
        JSON.stringify({
          cohorts,
          records: await page.evaluate(
            () => (window as ObservedWindow).inspectionDrawReadiness.records,
          ),
        }),
      ),
      contentType: "application/json",
    });
    await retainedCanvas.dispose();
  });
}
