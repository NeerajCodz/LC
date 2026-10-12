import test from "node:test";
import assert from "node:assert/strict";
import { measureScabiosaJunction } from "./scabiosa-junction-checks";

test("scabiosa: real terminal underlap occludes deformed junction strips and retains positive tissue intersections through ordinary motion and reversed bloom", (t) => {
  const results = measureScabiosaJunction();
  assert.equal(results.length, 4);
  assert.deepEqual(
    results.map((result) => result.nodes),
    [1384, 1384, 462, 462],
  );
  assert.deepEqual(
    results.map(({ device, quality, bodyGrid, capGrid }) => [
      device,
      quality,
      bodyGrid.columns,
      bodyGrid.rows,
      capGrid.columns,
      capGrid.rows,
    ]),
    [
      ["desktop", "high", 32, 32, 12, 9],
      ["desktop", "ultra", 48, 44, 16, 12],
      ["constrained", "low", 12, 16, 6, 5],
      ["constrained", "medium", 20, 24, 8, 7],
    ],
  );
  for (const result of results) {
    t.diagnostic(
      JSON.stringify({
        device: result.device,
        quality: result.quality,
        nodes: result.nodes,
        raysTested: result.stages.reduce(
          (sum, stage) => sum + stage.raysTested,
          0,
        ),
        sheetChecks: result.stages.reduce(
          (sum, stage) => sum + stage.sheetChecks,
          0,
        ),
        peakHistoricalDeficit: Math.max(
          ...result.stages.map((stage) => stage.peakOverlapDeficit),
        ),
        coordinateSpace: result.coordinateSpace,
        clusterScale: result.clusterScale,
      }),
    );
    assert.equal(result.stages.length, 11);
    const pulsePeak = result.stages.find(
      (stage) => stage.label === "accessible pulse peak",
    )!;
    const pulseRelease = result.stages.find(
      (stage) => stage.label === "accessible pulse release",
    )!;
    assert.ok(pulsePeak.maximumPulse > 0.42 && pulsePeak.maximumPulse < 0.43);
    assert.ok(pulsePeak.minimumPulse < -0.5 && pulsePeak.minimumPulse > -0.52);
    assert.ok(pulseRelease.maximumPulse < pulsePeak.maximumPulse);
    for (const stage of result.stages) {
      assert.ok(Number.isFinite(stage.peakOverlapDeficit));
      assert.equal(stage.raysTested, stage.frames * 80 * 9);
      assert.equal(stage.sheetChecks, stage.frames * 80);
      // A deliberate underlap can sit below the rim; retain this historical metric without treating it as visibility.
      assert.equal(
        stage.exposedStripRays,
        0,
        `${result.device}/${result.quality}/${stage.label}: exposed junction strip`,
      );
      assert.equal(
        stage.unconnectedSheets,
        0,
        `${result.device}/${result.quality}/${stage.label}: underlap lacks positive intersection with the actual closed corolla shell`,
      );
    }
  }
});
