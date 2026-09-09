import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Vector3, type Group } from "three";
import type { RefObject } from "react";
import { useCursor3D } from "./useCursor3D";
import { damp } from "@/lib/three/easing";

export function useFlowerInteraction(
  head: RefObject<Group | null>,
  enabled: boolean,
) {
  const cursor = useCursor3D();
  const response = useRef({ angle: 0, proximity: 0, velocity: 0 });
  const local = useRef(new Vector3());
  useFrame((_, dt) => {
    if (!head.current) return;
    local.current.copy(cursor.current.point);
    head.current.worldToLocal(local.current);
    response.current.angle = Math.atan2(local.current.x, local.current.z);
    response.current.proximity = damp(
      response.current.proximity,
      enabled ? Math.max(0, 1 - local.current.length() / 2.2) : 0,
      4,
      dt,
    );
    response.current.velocity = enabled ? cursor.current.velocity : 0;
  });
  return response;
}
