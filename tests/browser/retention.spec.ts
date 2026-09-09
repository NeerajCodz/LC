import { expect, test } from "@playwright/test";

test("all fifteen gallery scenes survive a round-trip scroll in one WebGL context", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/gallery/");
  const previews = page.locator(".flower-preview");
  const sceneIds: string[] = [];
  for (let i = 0; i < 15; i++) {
    await previews.nth(i).scrollIntoViewIfNeeded();
    await expect(previews.nth(i)).toHaveAttribute("data-render-rect", /,/);
    sceneIds.push((await previews.nth(i).getAttribute("data-scene-id"))!);
  }
  await previews.first().scrollIntoViewIfNeeded();
  await expect(page.locator(".preview-stage")).toHaveAttribute(
    "data-retained-scenes",
    "15",
  );
  expect(
    await previews.evaluateAll((nodes) =>
      nodes.map((n) => n.getAttribute("data-scene-id")),
    ),
  ).toEqual(sceneIds);
  await expect(page.locator("canvas")).toHaveCount(1);
  expect(errors).toEqual([]);
});

test("home angle views and the scroll study retain their canvases and bloom control", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page
    .getByRole("link", { name: "View every angle", exact: true })
    .click();
  const previews = page.locator(".angle-frame-view");
  const bloom = page.getByRole("slider", {
    name: "Angle gallery bloom",
    exact: true,
  });
  await bloom.press("Home");
  await bloom.press("ArrowRight");
  await expect(bloom).toHaveValue("0.01");
  for (let i = 0; i < 4; i++) {
    await previews.nth(i).scrollIntoViewIfNeeded();
    await expect(previews.nth(i)).toHaveAttribute("data-scene-id", /.+/);
  }
  const identities = await previews.evaluateAll((nodes) =>
    nodes.map((n) => n.getAttribute("data-scene-id")),
  );
  await page.locator(".scroll-study").scrollIntoViewIfNeeded();
  await expect(page.locator(".scroll-scene canvas")).toHaveCount(1);
  await page.locator(".specimen-copy h1").scrollIntoViewIfNeeded();
  await expect(page.locator(".scroll-scene canvas")).toHaveCount(1);
  await page
    .getByRole("link", { name: "View every angle", exact: true })
    .click();
  expect(
    await previews.evaluateAll((nodes) =>
      nodes.map((n) => n.getAttribute("data-scene-id")),
    ),
  ).toEqual(identities);
  await expect(page.locator("canvas")).toHaveCount(3);
  await expect(bloom).toHaveValue("0.01");
});
