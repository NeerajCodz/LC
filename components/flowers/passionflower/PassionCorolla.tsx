import { useEffect, useMemo, useRef } from "react";
import { Color, Group, Mesh } from "three";
import { useActiveFrame } from "@/hooks/useActiveFrame";
import { createPetalGeometry, PETAL } from "@/lib/three/geometry";
import { createPetalMaterial } from "@/lib/three/materials";
import { petalOpenness } from "@/lib/three/easing";
import type { FlowerOrgansProps } from "../FloralParts";
import { createOrganicTube } from "@/lib/three/organicTube";

type Organ = "sepal" | "petal" | "bract";
function PerianthPart({
  kind,
  index,
  ...props
}: FlowerOrgansProps & { kind: Organ; index: number }) {
  const { quality, bloom, time, wind, color, pulse, interaction } = props;
  const angle =
    (index * Math.PI * 2) / (kind === "bract" ? 3 : 5) +
    (kind === "petal" ? Math.PI / 5 : 0);
  const pivot = useRef<Group>(null),
    mesh = useRef<Mesh>(null);
  const geometry = useMemo(() => {
    const g = createPetalGeometry(
      {
        ...PETAL,
        length: kind === "bract" ? 0.41 : kind === "sepal" ? 1.13 : 1.06,
        width: kind === "bract" ? 0.31 : kind === "sepal" ? 0.55 : 0.49,
        thickness: kind === "sepal" ? 0.014 : 0.008,
        cup: 0.04,
        curl: 0.012,
        taper: 0.42,
        edge: 0.017,
        ripple: 0.004,
        roundness: 0.28,
        twist: 0.016,
        foldWrap: kind === "sepal" ? 0.76 : 0.65,
      },
      325 + index * 13,
      quality,
    );
    const colors = g.getAttribute("color"),
      uv = g.getAttribute("uv"),
      count = colors.count / 2;
    const green = new Color(kind === "bract" ? "#6c8751" : "#718b55");
    const ivory = new Color(color ?? "#f4f1e2"),
      tint = new Color();
    for (let i = 0; i < colors.count; i++) {
      const t = uv.getY(i);
      // The outer (+Z) shell faces outward in the closed bud and downward when open.
      tint.copy(
        kind === "bract" || (kind === "sepal" && i < count) ? green : ivory,
      );
      tint.multiplyScalar(0.91 + 0.09 * Math.sqrt(t));
      if (kind !== "bract" && i >= count)
        tint.lerp(green, Math.max(0, 0.12 - t * 0.5));
      colors.setXYZ(i, tint.r, tint.g, tint.b);
    }
    return g;
  }, [quality, kind, index, color]);
  const material = useMemo(
    () =>
      createPetalMaterial("#ffffff", kind === "petal" ? 0.64 : 0.53, 0.5, 0, {
        root: "#ffffff",
        body: "#ffffff",
        tip: "#ffffff",
        vein: "#c7cab6",
        rootFalloff: 0.3,
        tipStart: 0.7,
        veinStrength: 0.045,
      }),
    [kind],
  );
  useEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
    },
    [geometry, material],
  );
  useActiveFrame(() => {
    const open = petalOpenness(
      bloom.current,
      kind === "petal" ? 0.1 : 0,
      index * 0.29,
    );
    if (mesh.current?.morphTargetInfluences)
      mesh.current.morphTargetInfluences[0] = 1 - open;
    if (pivot.current) {
      pivot.current.rotation.x =
        (kind === "bract" ? 0.5 + open * 1.35 : -0.105 + open * 1.54) +
        Math.sin(time.current * 1.2 + index * 2) * wind * 0.007 * open +
        (pulse?.current ?? 0) * open * 0.035 +
        Math.max(0, Math.cos(angle - (interaction?.current.angle ?? 0))) *
          (interaction?.current.proximity ?? 0) *
          open *
          0.018;
      const compact = kind === "petal" ? 0.77 + 0.23 * open : 1;
      pivot.current.scale.set(compact, compact, compact);
    }
  });
  return (
    <group rotation={[0, angle, 0]}>
      <group
        ref={pivot}
        position={[
          0,
          kind === "bract" ? -0.07 : kind === "petal" ? 0.055 : 0.025,
          kind === "bract" ? 0.025 : 0.055,
        ]}
      >
        <mesh
          ref={mesh}
          geometry={geometry}
          material={material}
          onUpdate={(m) => m.updateMorphTargets()}
          castShadow
          receiveShadow
        />
        {kind === "sepal" && <SepalAwn {...props} index={index} />}
      </group>
    </group>
  );
}

function SepalAwn({
  bloom,
  quality,
  index,
}: FlowerOrgansProps & { index: number }) {
  const ref = useRef<Mesh>(null);
  const geometry = useMemo(() => {
    const make = (folded: boolean) =>
      createOrganicTube({
        points: folded
          ? [
              [0, 0.84, 0.287],
              [0.004, 1.06, 0.165],
              [0.003, 1.21, 0.13],
            ]
          : [
              [0, 0.84, 0.029],
              [0.004, 1.06, 0.05],
              [0.003, 1.24, 0.1],
            ],
        radius: 0.008,
        endRadius: 0.0015,
        color: "#799252",
        segments: quality === "low" ? 12 : 24,
        sides: quality === "low" ? 6 : 10,
      });
    const g = make(false),
      closed = make(true);
    g.morphAttributes.position = [closed.getAttribute("position")];
    g.morphAttributes.normal = [closed.getAttribute("normal")];
    closed.dispose();
    g.computeBoundingSphere();
    return g;
  }, [quality]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  useActiveFrame(() => {
    if (ref.current?.morphTargetInfluences)
      ref.current.morphTargetInfluences[0] =
        1 - petalOpenness(bloom.current, 0, index * 0.29);
  });
  return (
    <mesh
      ref={ref}
      geometry={geometry}
      onUpdate={(m) => m.updateMorphTargets()}
      castShadow
    >
      <meshStandardMaterial vertexColors roughness={0.66} />
    </mesh>
  );
}

export function PassionCorolla(props: FlowerOrgansProps) {
  return (
    <>
      {(["sepal", "petal", "bract"] as const).flatMap((kind) =>
        Array.from({ length: kind === "bract" ? 3 : 5 }, (_, index) => (
          <PerianthPart
            key={`${kind}-${index}`}
            {...props}
            kind={kind}
            index={index}
          />
        )),
      )}
    </>
  );
}
