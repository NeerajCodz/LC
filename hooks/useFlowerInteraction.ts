import { useRef } from "react";
import { useActiveFrame as useFrame } from "@/hooks/useActiveFrame";
import { Vector3, type Group } from "three";
import type { RefObject } from "react";
import { useCursor3D } from "./useCursor3D";
import { damp } from "@/lib/three/easing";
import type { Vec3 } from "@/lib/flowers/types";

export function useFlowerInteraction(
  head: RefObject<Group | null>,
  enabled: boolean,
  center?: Vec3,
  radius = 2.2,
) {
  const cursor = useCursor3D();
  const response = useRef({
    angle: 0,
    proximity: 0,
    velocity: 0,
    point: [0, 0, 0] as Vec3,
  });
  const local = useRef(new Vector3());
  useFrame((_, dt) => {
    if (!head.current) return;
    local.current.copy(cursor.current.point);
    head.current.worldToLocal(local.current);
    response.current.point[0] = local.current.x;
    response.current.point[1] = local.current.y;
    response.current.point[2] = local.current.z;
    response.current.angle = Math.atan2(local.current.x, local.current.z);
    response.current.proximity = damp(
      response.current.proximity,
      enabled
        ? Math.max(
            0,
            1 -
              Math.hypot(
                local.current.x - (center?.[0] ?? 0),
                local.current.y - (center?.[1] ?? 0),
                local.current.z - (center?.[2] ?? 0),
              ) /
                radius,
          )
        : 0,
      4,
      dt,
    );
    response.current.velocity = enabled ? cursor.current.velocity : 0;
  });
  return response;
}
