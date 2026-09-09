import { expect, test } from "@playwright/test";

for (const scenario of [
  {
    name: "collection",
    route: "/gallery/",
    frame: ".gallery-preview",
    caption: ".preview-caption h2",
    anchor: null,
  },
  {
    name: "home hero",
    route: "/",
    frame: ".scene-wrap",
    caption: ".specimen-copy h1",
    anchor: null,
  },
  {
    name: "home angle gallery",
    route: "/",
    frame: ".angle-frame-view",
    caption: ".angle-frame figcaption",
    anchor: "View every angle",
  },
]) {
  test(`${scenario.name} keeps flowers aligned with captions while scrolling`, async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(scenario.route);
    if (scenario.anchor)
      await page
        .getByRole("link", { name: scenario.anchor, exact: true })
        .click();
    const frame = page.locator(scenario.frame).first();
    await expect(frame).toBeVisible();
    if (scenario.name !== "home hero")
      await expect(frame).toHaveAttribute("data-render-rect", /,/);
    else await expect(frame.locator("canvas")).toBeVisible();
    await page.evaluate(() => document.fonts.ready.then(() => undefined));
    const measure = () =>
      page.evaluate(({ frame, caption }) => {
        const container = document.querySelector(frame)!;
        const surface =
          container.querySelector("canvas") ??
          container.closest(".preview-stage")!.querySelector("canvas")!;
        const renderOffset = Number(
          container.getAttribute("data-render-rect")?.split(",")[1] ?? 0,
        );
        return {
          scroll: window.scrollY,
          frameTop: container.getBoundingClientRect().top,
          canvasTop: surface.getBoundingClientRect().top + renderOffset,
          captionTop: document.querySelector(caption)!.getBoundingClientRect()
            .top,
        };
      }, scenario);
    const before = await measure();
    await page.mouse.wheel(0, 160);
    await expect
      .poll(async () => (await measure()).scroll)
      .toBeGreaterThan(before.scroll + 100);
    const after = await measure();
    expect(Math.abs(after.canvasTop - after.frameTop)).toBeLessThan(1);
    expect(
      Math.abs(
        after.canvasTop -
          before.canvasTop -
          (after.captionTop - before.captionTop),
      ),
    ).toBeLessThan(1);
    await page.mouse.wheel(0, -160);
    await expect
      .poll(async () => (await measure()).scroll)
      .toBeLessThan(after.scroll - 100);
    const returned = await measure();
    expect(
      Math.abs(
        returned.canvasTop -
          after.canvasTop -
          (returned.captionTop - after.captionTop),
      ),
    ).toBeLessThan(1);
  });
}
