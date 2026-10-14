import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  type RefObject,
} from "react";
import { Group, Mesh, type Ray } from "three";
import { RenderActivity, useActiveFrame } from "@/hooks/useActiveFrame";
import { SurfaceClock } from "@/lib/three/surfaceClock";
import { petalOpenness } from "@/lib/three/easing";
import { specimenOrganCarrier } from "@/lib/three/specimenModel";
import { createSpecimenMaterial } from "@/lib/three/specimenMaterials";
import type { FlowerOrgansProps } from "@/components/flowers/FloralParts";
import {
  createToreniaStigmaGeometry,
  TORENIA_RENDER_MODEL,
} from "@/components/flowers/torenia/toreniaStigmaGeometry";
import {
  createToreniaStigmaState,
  touchToreniaStigma,
  advanceToreniaStigma,
  writeToreniaStigmaMorph,
} from "@/components/flowers/torenia/toreniaStigmaState";
import {
  createToreniaStigmaProbeScratch,
  probeToreniaStigmaRay,
  registerToreniaStigmaProbe,
} from "@/components/flowers/torenia/toreniaStigmaProbe";

/** The public pulse button supplies an explicit authored reset, never a timer. */
export const ToreniaStigmaControls = createContext({
  paused: false,
  interactive: false,
});

export function ToreniaStigmas(
  props: FlowerOrgansProps & { organs: RefObject<Group | null> },
) {
  const controls = useContext(ToreniaStigmaControls),
    active = useContext(RenderActivity),
    groups = useRef<(Group | null)[]>([]),
    meshes = useRef<(Mesh | null)[]>([]),
    states = useRef(
      TORENIA_RENDER_MODEL.clusters.map(createToreniaStigmaState),
    ),
    previousReset = useRef(props.pulseSerial ?? 0),
    clock = useRef(new SurfaceClock()),
    scratch = useMemo(() => createToreniaStigmaProbeScratch(), []);
  const carriers = useMemo(
    () =>
      TORENIA_RENDER_MODEL.clusters.map((_, c) =>
        specimenOrganCarrier(TORENIA_RENDER_MODEL, c),
      ),
    [],
  );
  const geometry = useMemo(
    () =>
      TORENIA_RENDER_MODEL.clusters.flatMap((_, c) =>
        ([0, 1] as const).map((lobe) =>
          createToreniaStigmaGeometry(c, lobe, props.quality),
        ),
      ),
    [props.quality],
  );
  const material = useMemo(
    () => createSpecimenMaterial("torenia", "petal", props.color, "inner"),
    [props.color],
  );
  useEffect(() => () => geometry.forEach((g) => g.dispose()), [geometry]);
  useEffect(() => () => material.dispose(), [material]);
  useEffect(() => {
    const slot = props.rayProbe;
    if (
      !slot ||
      !active ||
      !controls.interactive ||
      controls.paused ||
      props.reducedMotion ||
      props.physics !== "detailed" ||
      props.quality === "overview"
    )
      return;
    const probe = (ray: Ray) => {
      if (
        !probeToreniaStigmaRay(
          ray,
          meshes.current,
          props.bloom.current,
          props.organs.current,
          scratch,
        )
      )
        return;
      const { cluster, lobe } = scratch.result;
      touchToreniaStigma(
        states.current[cluster],
        lobe,
        true,
        petalOpenness(
          props.bloom.current,
          carriers[cluster].delay,
          carriers[cluster].phase,
        ),
      );
    };
    return registerToreniaStigmaProbe(slot, probe);
  }, [
    props.rayProbe,
    props.bloom,
    props.organs,
    props.physics,
    props.quality,
    props.reducedMotion,
    active,
    controls.interactive,
    controls.paused,
    carriers,
    scratch,
  ]);
  useActiveFrame(() => {
    const dt = clock.current.delta(props.time.current, props.reducedMotion),
      reset =
        !controls.paused && (props.pulseSerial ?? 0) !== previousReset.current;
    if (!controls.paused) previousReset.current = props.pulseSerial ?? 0;
    for (let c = 0; c < TORENIA_RENDER_MODEL.clusters.length; c++) {
      const cluster = TORENIA_RENDER_MODEL.clusters[c],
        group = groups.current[c],
        open = petalOpenness(
          props.bloom.current,
          carriers[c].delay,
          carriers[c].phase,
        );
      advanceToreniaStigma(
        states.current[c],
        dt,
        controls.paused,
        props.reducedMotion,
        reset,
      );
      if (group) {
        group.rotation.x =
          cluster.rotation[0] +
          (props.reducedMotion
            ? 0
            : Math.sin(props.time.current * 1.3 + c * 0.9) *
              cluster.nod *
              0.4 *
              props.wind);
        group.rotation.z =
          cluster.rotation[2] +
          (props.reducedMotion
            ? 0
            : Math.sin(props.time.current * 1.6 + c * 1.7) *
                cluster.nod *
                props.wind +
              (props.motion?.current.contact ?? 0) * cluster.nod);
        group.updateMatrix();
      }
      for (let lobe = 0; lobe < 2; lobe++) {
        writeToreniaStigmaMorph(
          meshes.current[c * 2 + lobe],
          open,
          states.current[c].closure[lobe],
        );
      }
    }
  });
  return (
    <group>
      {TORENIA_RENDER_MODEL.clusters.map((cluster, c) => (
        <group
          key={c}
          ref={(g) => {
            groups.current[c] = g;
          }}
          position={cluster.position}
          rotation={cluster.rotation}
          scale={cluster.scale}
        >
          {([0, 1] as const).map((lobe) => (
            <mesh
              key={lobe}
              ref={(m) => {
                meshes.current[c * 2 + lobe] = m;
              }}
              geometry={geometry[c * 2 + lobe]}
              material={material}
              onUpdate={(m) => m.updateMorphTargets()}
              castShadow
              receiveShadow
            />
          ))}
        </group>
      ))}
    </group>
  );
}
