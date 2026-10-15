import { expect, type Page } from "@playwright/test";

/** Wait for the dynamic client fixture's DOM, without holding its initial draw. */
export async function expectInspectionLoaded(page: Page) {
  const controls = [
    page.getByRole("heading", { name: "Geometry inspection", exact: true }),
    page.getByRole("combobox", { name: "Inspection species", exact: true }),
    page.getByRole("combobox", { name: "Inspection detail", exact: true }),
    page.getByRole("combobox", { name: "Inspection device tier", exact: true }),
  ];
  await Promise.all(
    controls.map((control) => expect(control).toBeVisible({ timeout: 60000 })),
  );
}

/** Wait for mounted tile scenes before starting the unchanged pixel predicate. */
export async function expectInspectionReady(page: Page) {
  await expect
    .poll(
      () =>
        page
          .locator("[data-inspection-view]")
          .evaluateAll(
            (views) =>
              views.length > 0 &&
              views.every(
                (view) =>
                  view.getAttribute("data-inspection-ready") === "ready",
              ),
          ),
      {
        timeout: 60000,
        message:
          "Every mounted inspection tile must draw before pixel sampling",
      },
    )
    .toBe(true);
}
