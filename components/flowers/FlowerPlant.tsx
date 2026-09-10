import { useContext, useLayoutEffect, useMemo, useRef } from "react";
import { useActiveFrame as useFrame } from "@/hooks/useActiveFrame";
import { Group, Vector3 } from "three";
import type { FlowerProps, FlowerStructure } from "@/lib/flowers/types";
import { getFlower } from "@/lib/flowers/catalog";
import { PETAL_PALETTES } from "@/lib/flowers/palettes";
import { hashString, layeredWind } from "@/lib/three/noise";
import { damp } from "@/lib/three/easing";
import {
  WIND_PROFILES,
  stepPlantSpring,
  windLoad,
  flowerEnvelope,
  type PlantMotion,
} from "@/lib/flowers/wind";
import { GardenEnvironment, type GardenBody } from "../scene/GardenDynamics";
import { useBloomAnimation } from "@/hooks/useBloomAnimation";
import { useFlowerInteraction } from "@/hooks/useFlowerInteraction";
import { PetalWhorl } from "./PetalWhorl";
import { Stem } from "./Stem";
import { FlowerCore } from "./FlowerCore";
import { Branch } from "./Branch";
import { Calyx } from "./Calyx";
import { FlowerInteraction } from "./FlowerInteraction";

export function FlowerPlant({
  structure,
  type,
  color,
  bloom: target = 1,
  growth: growthTarget = 1,
  scale = 1,
  position = [0, 0, 0],
  rooted = false,
  rotation = [0, 0, 0],
  interactive = false,
  animationSpeed = 1,
  animateEntrance = true,
  windStrength = 1,
  cursorStrength = 1,
  hovered = false,
  stem = true,
  leaves = true,
  quality = "high",
  reducedMotion = false,
  paused = false,
  pulse = 0,
  onHover,
  onClick,
}: FlowerProps & { structure: FlowerStructure }) {
  const head = useRef<Group>(null);
  const garden = useContext(GardenEnvironment);
  const profile = WIND_PROFILES[type];
  const motion = useRef<PlantMotion>({
    x: 0,
    z: 0,
    drop: 0,
    contact: 0,
    contactAngle: 0,
    air: 0,
  });
  const world = useMemo(() => new Vector3(), []);
  const worldScale = useMemo(() => new Vector3(), []);
  const body = useRef<GardenBody>({
    x: 0,
    y: 0,
    z: 0,
    radius: 0,
    compliance: profile.compliance,
    dx: 0,
    dz: 0,
    pressure: 0,
    commit: () => {},
  });
  const envelope = useMemo(() => flowerEnvelope(structure), [structure]);
  const time = useRef(0),
    growth = useRef(reducedMotion || !animateEntrance ? growthTarget : 0.03),
    pulseValue = useRef(0),
    cursor = useRef(0);
  const previousPulse = useRef(pulse),
    pulseTime = useRef(100);
  const springs = useRef({
    x: { value: 0, velocity: 0 },
    z: { value: 0, velocity: 0 },
  });
  const bloom = useBloomAnimation(
    Math.min(1, target + (hovered ? 0.025 : 0)),
    animationSpeed,
    reducedMotion,
    paused,
    animateEntrance,
  );
  const seed = useMemo(() => hashString(type), [type]);
  const wind = reducedMotion ? 0 : windStrength * profile.flutter;
  const interaction = useFlowerInteraction(
    head,
    interactive && !reducedMotion && !paused,
  );
  useLayoutEffect(() => {
    if (!garden) return;
    const entry = body.current;
    entry.commit = () => {
      if (!head.current?.parent || !entry.pressure) return;
      world.set(entry.x, entry.y, entry.z);
      head.current.parent.worldToLocal(world);
      const dx = world.x - head.current.position.x;
      const dz = world.z - head.current.position.z;
      springs.current.x.value += dx;
      springs.current.z.value += dz;
      springs.current.x.velocity *= 0.82;
      springs.current.z.velocity *= 0.82;
      motion.current.x += dx;
      motion.current.z += dz;
      motion.current.contact = entry.pressure;
      motion.current.contactAngle = Math.atan2(-dx, -dz);
      head.current.position.x = world.x;
      head.current.position.z = world.z;
      head.current.rotation.x =
        structure.headTilt +
        Math.atan2(motion.current.z * 1.5, structure.stemLength);
      head.current.rotation.z = -Math.atan2(
        motion.current.x * 1.5,
        structure.stemLength,
      );
    };
    const entries = garden.current.bodies;
    entries.push(entry);
    return () => {
      const index = entries.indexOf(entry);
      if (index !== -1) entries.splice(index, 1);
    };
  }, [garden, world, structure]);
  useFrame(({ pointer }, dt) => {
    if (paused) return;
    const delta = Math.min(dt, 0.05);
    time.current += delta * animationSpeed;
    growth.current = reducedMotion
      ? growthTarget
      : damp(growth.current, growthTarget, 1.7 * animationSpeed, delta);
    if (pulse !== previousPulse.current) {
      previousPulse.current = pulse;
      pulseTime.current = 0;
    }
    pulseTime.current += delta;
    pulseValue.current = reducedMotion
      ? 0
      : Math.sin(pulseTime.current * 5 - 0.7) *
        Math.exp(-pulseTime.current * 1.8) *
        0.9;
    const force = interactive && !reducedMotion ? cursorStrength : 0;
    const airTime = garden?.current.time ?? time.current;
    const gust = garden?.current.gust ?? 0;
    const air = windLoad(airTime, position[0], position[2], gust);
    const limit = structure.stemLength * 0.2;
    const amplitude = reducedMotion
      ? 0
      : profile.compliance * windStrength * growth.current ** 2;
    stepPlantSpring(
      springs.current.x,
      Math.tanh((air * amplitude + pointer.x * 0.15 * force) / limit) * limit,
      delta,
      profile,
    );
    stepPlantSpring(
      springs.current.z,
      Math.tanh(
        (air * amplitude * 0.3 +
          Math.sin(airTime * 0.47) * amplitude * 0.15 -
          pointer.y * 0.09 * force) /
          limit,
      ) * limit,
      delta,
      profile,
    );
    motion.current.x = springs.current.x.value;
    motion.current.z = springs.current.z.value;
    motion.current.drop =
      (0.6 * (motion.current.x ** 2 + motion.current.z ** 2)) /
      structure.stemLength;
    motion.current.contact = damp(motion.current.contact, 0, 5, delta);
    motion.current.air = Math.abs(air);
    cursor.current = interaction.current.angle;
    if (head.current) {
      head.current.rotation.x =
        structure.headTilt +
        Math.atan2(motion.current.z * 1.5, structure.stemLength) +
        layeredWind(time.current - 0.3, 1) * 0.016 * wind;
      head.current.rotation.z = -Math.atan2(
        motion.current.x * 1.5,
        structure.stemLength,
      );
      head.current.position.set(
        motion.current.x,
        -(1 - growth.current) * structure.stemLength - motion.current.drop,
        motion.current.z,
      );
      if (!garden) return;
      head.current.getWorldPosition(world);
      head.current.getWorldScale(worldScale);
      body.current.x = world.x;
      body.current.y = world.y;
      body.current.z = world.z;
      body.current.radius =
        envelope *
        Math.max(worldScale.x, worldScale.z) *
        (0.5 + 0.5 * bloom.current);
    }
  }, -2);
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <group position={rooted ? [0, structure.stemLength, 0] : undefined}>
        <group>
          {stem && (
            <Stem
              type={type}
              structure={structure}
              quality={quality}
              growth={growth}
              time={time}
              wind={wind}
              motion={motion}
              leaves={leaves}
            />
          )}
          <group ref={head} rotation={[structure.headTilt, 0, 0]}>
            <FlowerInteraction
              enabled={interactive}
              proxyRadius={quality === "low" ? envelope : undefined}
              onHover={onHover}
              onClick={onClick}
            >
              {(
                structure.blossoms ?? [
                  { position: [0, 0, 0], rotation: [0, 0, 0], scale: 1 },
                ]
              ).map((blossom, b) => (
                <group key={b}>
                  {structure.blossoms && (
                    <Branch
                      end={blossom.position}
                      color={type === "cherry-blossom" ? "#67503a" : undefined}
                    />
                  )}
                  <group
                    position={blossom.position}
                    rotation={blossom.rotation}
                    scale={blossom.scale}
                  >
                    {structure.layers.map((layer, i) => (
                      <PetalWhorl
                        key={i}
                        layer={layer}
                        seed={seed + i * 127 + b * 721}
                        color={color ?? getFlower(type).color}
                        palette={color ? undefined : PETAL_PALETTES[type]}
                        layerDepth={
                          i / Math.max(1, structure.layers.length - 1)
                        }
                        quality={quality}
                        bloom={bloom}
                        time={time}
                        wind={wind}
                        roughness={structure.roughness}
                        sheen={structure.sheen}
                        pulse={pulseValue}
                        cursor={cursor}
                        interaction={interaction}
                        motion={motion}
                      />
                    ))}
                    <FlowerCore
                      type={type}
                      structure={structure}
                      bloom={bloom}
                      quality={quality}
                    />
                  </group>
                </group>
              ))}
              {!structure.blossoms && <Calyx type={type} quality={quality} />}
            </FlowerInteraction>
          </group>
        </group>
      </group>
    </group>
  );
}
