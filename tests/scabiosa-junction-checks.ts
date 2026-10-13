import assert from "node:assert/strict";

import {
  Euler,
  Matrix4,
  Object3D,
  Quaternion,
  Triangle,
  Vector3,
  Ray,
  type BufferGeometry,
} from "three";
import type { Quality } from "../lib/flowers/types";
import { PetalDynamics, type SurfaceForces } from "../lib/three/petalDynamics";
import {
  specimenCages,
  specimenGeometry,
  type SpecimenModel,
} from "../lib/three/specimenModel";
import {
  bindCageGeometry,
  CageDeformation,
} from "../lib/three/petalDeformation";
import { specimenInstanceGeometry } from "../lib/three/floretInstances";
import { damp, petalOpenness } from "../lib/three/easing";
import { SCABIOSA_MODEL } from "../components/flowers/scabiosa/scabiosaGeometry";

/** Recover the actual generated front-face grid instead of duplicating renderer resolutions. */
function surfaceGrid(geometry: BufferGeometry, periodic: boolean) {
  const uv = geometry.getAttribute("uv"),
    frontCount = geometry.getAttribute("position").count / 2;
  let stride = 1;
  while (stride < frontCount && uv.getY(stride) === uv.getY(0)) stride++;
  const columns = periodic ? stride : stride - 1,
    rows = frontCount / stride - 1;
  assert.ok(Number.isInteger(rows) && rows > 0 && columns > 0);
  return { columns, rows, stride };
}

/** Every interior grid point remains eligible; ordering only accelerates early positive hits. */
function interiorOrder(count: number, preferred: number[]) {
  return [
    ...new Set([
      ...preferred,
      ...Array.from({ length: count - 1 }, (_, i) => i + 1),
    ]),
  ].filter((index) => index > 0 && index < count);
}

export function measureScabiosaJunction(
  model: SpecimenModel = SCABIOSA_MODEL,
  options: {
    failFast?: boolean;
    pairs?: [boolean, Quality][];
  } = {},
) {
  const results = [],
    dt = 1 / 60,
    wind = 0.65;
  for (const [constrained, quality] of options.pairs ??
    ([
      [false, "high"],
      [false, "ultra"],
      [true, "low"],
      [true, "medium"],
    ] as [boolean, Quality][])) {
    const { indices, patches } = specimenCages(model, constrained),
      sim = new PetalDynamics(patches, constrained),
      deformation = new CageDeformation(sim),
      inverse = new Matrix4(),
      inverses = patches.map(() => inverse),
      body = model.surfaces.slice(0, 16).map((surface, i) => {
        const geometry = specimenGeometry(surface, quality);
        bindCageGeometry(
          geometry,
          patches[indices.indexOf(i)],
          sim.offsets[indices.indexOf(i)],
        );
        return geometry;
      }),
      tipParts = specimenInstanceGeometry(model.instances![0], quality),
      bodyGrid = surfaceGrid(body[0], true),
      capGrid = surfaceGrid(tipParts.surfaces[0], false),
      capCenter = capGrid.columns / 2,
      intersectionRows = interiorOrder(
        Math.floor(0.72 * capGrid.rows) + 1,
        [1, 2, 4, 5, 6, 3],
      ),
      intersectionColumns = interiorOrder(
        capGrid.columns,
        [capGrid.columns / 4, capCenter, (capGrid.columns * 3) / 4].map(
          Math.round,
        ),
      ),
      tipMid = tipParts.surfaces.map(
        (g) => new Float64Array((g.getAttribute("position").count / 2) * 3),
      ),
      tipHalf = tipParts.surfaces.map(
        (g) => new Float64Array((g.getAttribute("position").count / 2) * 3),
      ),
      carrier = new Object3D(),
      matrix = new Matrix4(),
      triangle = new Triangle(),
      closest = new Vector3(),
      nearest = new Vector3(),
      bary = new Vector3(),
      normal = new Vector3(),
      front = new Vector3(),
      back = new Vector3(),
      next = new Vector3(),
      root = new Vector3(),
      bodyHalf = new Vector3(),
      capHalf = new Vector3(),
      scratch = new Vector3();
    const ray = new Ray(),
      hit = new Vector3(),
      strip = new Vector3(),
      join = new Vector3(),
      view = new Vector3(),
      bodyRendered = body.map(
        (g) => new Float64Array(g.getAttribute("position").count * 3),
      ),
      bodyTriangles = Array.from({ length: 5 }, (_, tip) => {
        const array = body[0].index!.array,
          half = body[0].getAttribute("position").count / 2,
          center = (tip / 5) * bodyGrid.columns,
          output: number[][] = [];
        for (let i = 0; i < array.length; i += 3) {
          const tri = [array[i], array[i + 1], array[i + 2]];
          if (
            tri.every(
              (index) =>
                Math.floor((index % half) / bodyGrid.stride) >=
                  Math.ceil(0.75 * bodyGrid.rows) &&
                Math.abs(
                  (((index % bodyGrid.stride) -
                    center +
                    1.5 * bodyGrid.columns) %
                    bodyGrid.columns) -
                    bodyGrid.columns / 2,
                ) <=
                  bodyGrid.columns / 8 + 0.5,
            )
          )
            output.push(tri);
        }
        // Try the rim first; every selected real triangle remains available.
        return output.sort(
          (a, b) =>
            Math.max(
              ...b.map((index) => Math.floor((index % half) / bodyGrid.stride)),
            ) -
            Math.max(
              ...a.map((index) => Math.floor((index % half) / bodyGrid.stride)),
            ),
        );
      }),
      capTriangles = tipParts.surfaces.map((geometry) => {
        const array = geometry.index!.array,
          half = geometry.getAttribute("position").count / 2,
          score = (tri: number[]) =>
            tri.reduce((sum, index) => {
              const local = index % half;
              return (
                sum +
                Math.abs(
                  Math.floor(local / capGrid.stride) - 0.72 * capGrid.rows,
                ) *
                  capGrid.columns +
                Math.abs((local % capGrid.stride) - capCenter)
              );
            }, 0),
          output: number[][] = [];
        for (let i = 0; i < array.length; i += 3)
          output.push([array[i], array[i + 1], array[i + 2]]);
        // Order changes only early-hit cost, never the available front/back/perimeter faces.
        return output.sort((a, b) => score(a) - score(b));
      });
    const capVertex = (
      mid: Float64Array,
      width: Float64Array,
      index: number,
      count: number,
      output: Vector3,
    ) => {
      const frontSide = index < count,
        local = index % count;
      output
        .fromArray(mid, local * 3)
        .addScaledVector(
          scratch.fromArray(width, local * 3),
          frontSide ? 1 : -1,
        );
      return output;
    };
    let bloom = 1,
      time = 0,
      proximity = 0,
      pulseTime = 100;
    const cluster = model.clusters[0],
      force: SurfaceForces = {
        wind,
        time,
        pulse: 0,
        proximity,
        x: 0,
        y: 0,
        z: 0,
      };
    const setRest = () => {
      matrix.compose(
        new Vector3(...cluster.position),
        new Quaternion().setFromEuler(
          new Euler(
            cluster.rotation[0] +
              Math.sin(time * 1.3) * cluster.nod * 0.4 * wind,
            cluster.rotation[1],
            cluster.rotation[2] + Math.sin(time * 1.6) * cluster.nod * wind,
          ),
        ),
        new Vector3(cluster.scale, cluster.scale, cluster.scale),
      );
      inverse.copy(matrix).invert();
      indices.forEach((index, patch) =>
        sim.setRest(
          patch,
          petalOpenness(bloom, model.surfaces[index].delay ?? 0, index * 0.31),
          matrix.elements,
        ),
      );
    };
    setRest();
    sim.reset();
    const firstRim = sim.offsets[0] + patches[0].rows * patches[0].columns;
    force.x = sim.rest[firstRim * 3];
    force.y = sim.rest[firstRim * 3 + 1];
    force.z = sim.rest[firstRim * 3 + 2];
    const deformed = (
      flower: number,
      index: number,
      open: number,
      output: Vector3,
    ) => {
      const g = body[flower],
        p = g.getAttribute("position"),
        f = g.morphAttributes.position![0],
        ids = g.getAttribute("cageIndices"),
        weights = g.getAttribute("cageWeights"),
        side = g.getAttribute("cageSide").getX(index),
        data = deformation.data;
      output
        .fromBufferAttribute(f, index)
        .lerp(scratch.fromBufferAttribute(p, index), open);
      for (let axis = 0; axis < 3; axis++) {
        let change = 0;
        for (let corner = 0; corner < 4; corner++) {
          const node = ids.array[index * 4 + corner],
            weight = weights.array[index * 4 + corner],
            o = node * 4;
          change +=
            weight *
            (data[o + axis] +
              data[o + sim.inverseMass.length * 4 + axis] * side);
        }
        output.setComponent(axis, output.getComponent(axis) + change);
      }
      return output;
    };
    const stages = [];
    for (const [label, frames, target, contactTarget, activatePulse] of [
      ["ordinary full-bloom wind", 60, 1, 0],
      ["pointer on the first rim", 30, 1, 1],
      ["released pointer", 90, 1, 0],
      ["accessible pulse peak", 30, 1, 0, true],
      ["accessible pulse release", 90, 1, 0],
      ["smooth close", 120, 0, 0],
      ["closed hold", 60, 0, 0],
      ["smooth reopen", 120, 1, 0],
      ["full hold", 60, 1, 0],
      ["smooth half bloom", 120, 0.5, 0],
      ["half hold", 60, 0.5, 0],
    ] as [string, number, number, number, boolean?][]) {
      if (activatePulse) pulseTime = 0;
      let peakCenterlineRootGap = 0,
        peakDistanceToTerminalTissueMidplane = 0,
        peakOverlapDeficit = -Infinity,
        framesWithDeficit = 0,
        exposedStripRays = 0,
        unconnectedSheets = 0,
        raysTested = 0,
        sheetChecks = 0,
        worstDeficit = -Infinity,
        minimumPulse = Infinity,
        maximumPulse = -Infinity;
      let worst: Record<string, unknown> | undefined,
        firstExposedStrip: Record<string, unknown> | undefined,
        firstUnconnectedSheet: Record<string, unknown> | undefined;
      for (let frame = 0; frame < frames; frame++) {
        time += dt;
        bloom = damp(bloom, target, 2.6, dt);
        proximity = damp(proximity, contactTarget, 4, dt);
        force.time = time;
        force.proximity = proximity;
        // FlowerPlant starts this waveform one dt after a keyboard/click activation.
        pulseTime += dt;
        force.pulse =
          Math.sin(pulseTime * 5 - 0.7) * Math.exp(-pulseTime * 1.8) * 0.9;
        minimumPulse = Math.min(minimumPulse, force.pulse);
        maximumPulse = Math.max(maximumPulse, force.pulse);
        setRest();
        sim.step(dt, force);
        deformation.update(inverses);
        let frameDeficit = -Infinity;
        for (let flower = 0; flower < 16; flower++) {
          const pose = model.instances![0].poses[flower],
            open = petalOpenness(bloom, pose.delay, pose.phase),
            foldedPose = pose.foldedPosition!,
            g = body[flower],
            half = g.getAttribute("position").count / 2,
            columns = bodyGrid.columns,
            row = bodyGrid.rows;
          carrier.position.set(
            foldedPose[0] + (pose.position[0] - foldedPose[0]) * open,
            foldedPose[1] + (pose.position[1] - foldedPose[1]) * open,
            foldedPose[2] + (pose.position[2] - foldedPose[2]) * open,
          );
          carrier.rotation.set(
            pose.rotation[0] + Math.sin(time * 1.4 + pose.phase) * 0.008 * wind,
            pose.rotation[1],
            pose.rotation[2],
          );
          carrier.scale.setScalar(pose.scale);
          carrier.updateMatrix();
          const renderBody = bodyRendered[flower];
          for (let side = 0; side < 2; side++)
            for (let r = 0; r <= bodyGrid.rows; r++)
              for (let c = 0; c < bodyGrid.columns; c++) {
                const index = side * half + r * bodyGrid.stride + c;
                deformed(flower, index, open, next);
                renderBody[index * 3] = next.x;
                renderBody[index * 3 + 1] = next.y;
                renderBody[index * 3 + 2] = next.z;
              }
          for (let tip = 0; tip < 5; tip++) {
            const tg = tipParts.surfaces[tip],
              p = tg.getAttribute("position"),
              folded = tg.morphAttributes.position![0],
              count = p.count / 2,
              mid = tipMid[tip],
              width = tipHalf[tip];
            for (let i = 0; i < count; i++) {
              front
                .fromBufferAttribute(folded, i)
                .lerp(scratch.fromBufferAttribute(p, i), open)
                .applyMatrix4(carrier.matrix);
              back
                .fromBufferAttribute(folded, i + count)
                .lerp(scratch.fromBufferAttribute(p, i + count), open)
                .applyMatrix4(carrier.matrix);
              for (let axis = 0; axis < 3; axis++) {
                mid[i * 3 + axis] =
                  (front.getComponent(axis) + back.getComponent(axis)) / 2;
                width[i * 3 + axis] =
                  (front.getComponent(axis) - back.getComponent(axis)) / 2;
              }
            }
            const u = (tip / 5) * columns,
              left = Math.floor(u),
              blend = u - left,
              a = row * columns + left,
              b = row * columns + ((left + 1) % columns);
            deformed(flower, a, open, front).lerp(
              deformed(flower, b, open, next),
              blend,
            );
            deformed(flower, a + half, open, back).lerp(
              deformed(flower, b + half, open, next),
              blend,
            );
            root.copy(front).add(back).multiplyScalar(0.5);
            bodyHalf.copy(front).sub(back).multiplyScalar(0.5);
            const capRoot = capCenter * 3;
            scratch.fromArray(mid, capRoot);
            peakCenterlineRootGap = Math.max(
              peakCenterlineRootGap,
              root.distanceTo(scratch),
            );
            let distance = Infinity,
              overlapMargin = 0;
            for (let r = 0; r < capGrid.rows; r++)
              for (let c = 0; c < capGrid.columns; c++) {
                const v = r * capGrid.stride + c;
                for (const tri of [
                  [v, v + 1, v + capGrid.stride + 1],
                  [v, v + capGrid.stride + 1, v + capGrid.stride],
                ]) {
                  triangle.a.fromArray(mid, tri[0] * 3);
                  triangle.b.fromArray(mid, tri[1] * 3);
                  triangle.c.fromArray(mid, tri[2] * 3);
                  triangle.closestPointToPoint(root, closest);
                  const d = root.distanceTo(closest);
                  if (d >= distance) continue;
                  distance = d;
                  nearest.copy(closest);
                  triangle.getNormal(normal);
                  triangle.getBarycoord(nearest, bary);
                  capHalf.set(0, 0, 0);
                  for (let corner = 0; corner < 3; corner++)
                    capHalf.addScaledVector(
                      scratch.fromArray(width, tri[corner] * 3),
                      bary.getComponent(corner),
                    );
                  overlapMargin =
                    Math.abs(bodyHalf.dot(normal)) +
                    Math.abs(capHalf.dot(normal));
                }
              }
            peakDistanceToTerminalTissueMidplane = Math.max(
              peakDistanceToTerminalTissueMidplane,
              distance,
            );
            frameDeficit = Math.max(frameDeficit, distance - overlapMargin);
            if (distance - overlapMargin > worstDeficit) {
              worstDeficit = distance - overlapMargin;
              worst = {
                frame,
                flower,
                tip,
                bloom,
                rim: [root.x, root.y, root.z],
                nearest: [nearest.x, nearest.y, nearest.z],
                distance,
                overlapMargin,
              };
            }
            const capRow = 0.72 * capGrid.rows,
              rowA = Math.floor(capRow),
              rowBlend = capRow - rowA;
            join
              .fromArray(mid, (rowA * capGrid.stride + capCenter) * 3)
              .lerp(
                next.fromArray(
                  mid,
                  ((rowA + 1) * capGrid.stride + capCenter) * 3,
                ),
                rowBlend,
              );
            const direction = (tip * Math.PI * 2) / 5 + pose.rotation[1],
              bodyTri = bodyTriangles[tip],
              capTri = capTriangles[tip];
            const hitsAny = () => {
              for (const tri of bodyTri) {
                triangle.a.fromArray(renderBody, tri[0] * 3);
                triangle.b.fromArray(renderBody, tri[1] * 3);
                triangle.c.fromArray(renderBody, tri[2] * 3);
                if (
                  ray.intersectTriangle(
                    triangle.a,
                    triangle.b,
                    triangle.c,
                    false,
                    hit,
                  ) &&
                  hit.distanceTo(ray.origin) <= 0.050000001
                )
                  return true;
              }
              for (const tri of capTri) {
                capVertex(mid, width, tri[0], count, triangle.a);
                capVertex(mid, width, tri[1], count, triangle.b);
                capVertex(mid, width, tri[2], count, triangle.c);
                if (
                  ray.intersectTriangle(
                    triangle.a,
                    triangle.b,
                    triangle.c,
                    false,
                    hit,
                  ) &&
                  hit.distanceTo(ray.origin) <= 0.050000001
                )
                  return true;
              }
              return false;
            };
            for (const t of [0.25, 0.5, 0.75])
              for (const oblique of [0, -1, 1]) {
                raysTested++;
                strip.copy(root).lerp(join, t);
                view
                  .set(
                    Math.sin(direction) * oblique,
                    1,
                    Math.cos(direction) * oblique,
                  )
                  .normalize();
                ray.origin.copy(strip).addScaledVector(view, 0.025);
                ray.direction.copy(view).negate();
                if (!hitsAny()) {
                  exposedStripRays++;
                  if (!firstExposedStrip) {
                    const fullIndex = g.index!.array;
                    let outsideSectorHit = false;
                    for (let at = 0; at < fullIndex.length; at += 3) {
                      triangle.a.fromArray(renderBody, fullIndex[at] * 3);
                      triangle.b.fromArray(renderBody, fullIndex[at + 1] * 3);
                      triangle.c.fromArray(renderBody, fullIndex[at + 2] * 3);
                      if (
                        ray.intersectTriangle(
                          triangle.a,
                          triangle.b,
                          triangle.c,
                          false,
                          hit,
                        ) &&
                        hit.distanceTo(ray.origin) <= 0.050000001
                      ) {
                        outsideSectorHit = true;
                        break;
                      }
                    }
                    firstExposedStrip = {
                      frame,
                      flower,
                      tip,
                      bloom,
                      t,
                      oblique,
                      root: root.toArray(),
                      join: join.toArray(),
                      strip: strip.toArray(),
                      outsideSectorHit,
                    };
                  }
                  assert.ok(
                    !options.failFast,
                    `${constrained ? "constrained" : "desktop"}/${quality}/${label}: exposed real junction strip at flower ${flower}, tip ${tip}`,
                  );
                }
              }
            let connected = false;
            for (const r of intersectionRows) {
              if (connected) break;
              for (const c of intersectionColumns) {
                for (const interior of [
                  0, -0.75, 0.75, -0.25, 0.25, -0.99, 0.99,
                ]) {
                  const distances: number[] = [],
                    at = (r * capGrid.stride + c) * 3,
                    fullIndex = g.index!.array;
                  ray.origin
                    .fromArray(mid, at)
                    .addScaledVector(scratch.fromArray(width, at), interior);
                  ray.direction.set(0, 1, 0);
                  for (let t = 0; t < fullIndex.length; t += 3) {
                    const a = fullIndex[t] * 3,
                      b = fullIndex[t + 1] * 3,
                      c = fullIndex[t + 2] * 3;
                    if (
                      ray.origin.x <
                        Math.min(renderBody[a], renderBody[b], renderBody[c]) -
                          1e-9 ||
                      ray.origin.x >
                        Math.max(renderBody[a], renderBody[b], renderBody[c]) +
                          1e-9 ||
                      ray.origin.z <
                        Math.min(
                          renderBody[a + 2],
                          renderBody[b + 2],
                          renderBody[c + 2],
                        ) -
                          1e-9 ||
                      ray.origin.z >
                        Math.max(
                          renderBody[a + 2],
                          renderBody[b + 2],
                          renderBody[c + 2],
                        ) +
                          1e-9
                    )
                      continue;
                    triangle.a.fromArray(renderBody, a);
                    triangle.b.fromArray(renderBody, b);
                    triangle.c.fromArray(renderBody, c);
                    if (
                      ray.intersectTriangle(
                        triangle.a,
                        triangle.b,
                        triangle.c,
                        false,
                        hit,
                      )
                    )
                      distances.push(hit.distanceTo(ray.origin));
                  }
                  distances.sort((a, b) => a - b);
                  const distinct = distances.filter(
                    (distance, i) =>
                      i === 0 || Math.abs(distance - distances[i - 1]) > 1e-7,
                  );
                  if (distinct.length % 2 === 1 && distinct[0] > 1e-6) {
                    connected = true;
                    break;
                  }
                }
                if (connected) break;
              }
            }
            sheetChecks++;
            if (!connected) {
              unconnectedSheets++;
              firstUnconnectedSheet ??= { frame, flower, tip, bloom };
              assert.ok(
                !options.failFast,
                `${constrained ? "constrained" : "desktop"}/${quality}/${label}: no positive tissue intersection at flower ${flower}, tip ${tip}`,
              );
            }
          }
        }
        assert.ok(Number.isFinite(frameDeficit));
        if (frameDeficit > 1e-6) framesWithDeficit++;
        peakOverlapDeficit = Math.max(peakOverlapDeficit, frameDeficit);
      }
      const result = {
        label,
        frames,
        finalBloom: bloom,
        peakCenterlineRootGap,
        peakDistanceToTerminalTissueMidplane,
        peakOverlapDeficit,
        framesWithDeficit,
        worst,
        exposedStripRays,
        unconnectedSheets,
        raysTested,
        sheetChecks,
        firstExposedStrip,
        firstUnconnectedSheet,
        minimumPulse,
        maximumPulse,
      };
      stages.push(result);
    }
    body.forEach((g) => g.dispose());
    [...tipParts.surfaces, ...tipParts.organs].forEach((g) => g.dispose());
    deformation.dispose();
    results.push({
      device: constrained ? "constrained" : "desktop",
      quality,
      coordinateSpace: "cluster-local scene units",
      clusterScale: cluster.scale,
      bodyGrid,
      capGrid,
      nodes: sim.inverseMass.length,
      stages,
    });
  }
  return results;
}
